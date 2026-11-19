import { Router } from 'express';
import { query } from '../db.js';
import { HttpError, checkName, parseId } from '../validate.js';

const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

export default function categoriesRouter() {
  const r = Router();

  r.get('/', wrap(async (req, res) => {
    const { rows } = await query(
      `SELECT c.id, c.name, COUNT(t.id)::int AS transaction_count
       FROM categories c LEFT JOIN transactions t ON t.category_id = c.id
       GROUP BY c.id ORDER BY lower(c.name)`
    );
    res.json(rows);
  }));

  const save = async (sql, params) => {
    try {
      return await query(sql, params);
    } catch (e) {
      if (e.code === '23505') throw new HttpError(409, 'A category with that name already exists');
      throw e;
    }
  };

  r.post('/', wrap(async (req, res) => {
    const name = checkName(req.body.name);
    const { rows } = await save('INSERT INTO categories(name) VALUES ($1) RETURNING id, name', [name]);
    res.status(201).json({ ...rows[0], transaction_count: 0 });
  }));

  r.put('/:id', wrap(async (req, res) => {
    const id = parseId(req.params.id);
    const name = checkName(req.body.name);
    const { rows } = await save('UPDATE categories SET name=$1 WHERE id=$2 RETURNING id, name', [name, id]);
    if (!rows.length) throw new HttpError(404, 'Category not found');
    res.json(rows[0]);
  }));

  r.delete('/:id', wrap(async (req, res) => {
    const id = parseId(req.params.id);
    const used = await query('SELECT COUNT(*)::int AS n FROM transactions WHERE category_id=$1', [id]);
    if (used.rows[0].n > 0) {
      throw new HttpError(409, `This category is used by ${used.rows[0].n} transaction(s). Reassign or delete them first.`);
    }
    const { rowCount } = await query('DELETE FROM categories WHERE id=$1', [id]);
    if (!rowCount) throw new HttpError(404, 'Category not found');
    res.json({ ok: true });
  }));

  return r;
}

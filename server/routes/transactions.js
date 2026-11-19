import { Router } from 'express';
import { query } from '../db.js';
import {
  HttpError, bad, parseCents, checkDate, checkType, parseId, buildFilter,
} from '../validate.js';

const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

const SELECT = `SELECT t.id, t.type, t.amount_cents, to_char(t.date,'YYYY-MM-DD') AS date,
  t.category_id, c.name AS category_name, t.note
  FROM transactions t JOIN categories c ON c.id = t.category_id`;

function readBody(body) {
  const note = String(body.note ?? '').trim();
  if (note.length > 500) throw bad('Note must be 500 characters or fewer');
  return {
    type: checkType(body.type),
    amount: parseCents(body.amount),
    date: checkDate(body.date),
    categoryId: parseId(body.category_id, 'category'),
    note,
  };
}

async function run(sql, params) {
  try {
    return await query(sql, params);
  } catch (e) {
    if (e.code === '23503') throw bad('Unknown category');
    throw e;
  }
}

export default function transactionsRouter() {
  const r = Router();

  r.get('/', wrap(async (req, res) => {
    const f = buildFilter(req.query);
    const { rows } = await query(`${SELECT} ${f.sql} ORDER BY t.date DESC, t.id DESC LIMIT 1000`, f.params);
    res.json(rows);
  }));

  r.post('/', wrap(async (req, res) => {
    const b = readBody(req.body);
    const ins = await run(
      'INSERT INTO transactions(type, amount_cents, date, category_id, note) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      [b.type, b.amount, b.date, b.categoryId, b.note]
    );
    const { rows } = await query(`${SELECT} WHERE t.id=$1`, [ins.rows[0].id]);
    res.status(201).json(rows[0]);
  }));

  r.put('/:id', wrap(async (req, res) => {
    const id = parseId(req.params.id);
    const b = readBody(req.body);
    const upd = await run(
      'UPDATE transactions SET type=$1, amount_cents=$2, date=$3, category_id=$4, note=$5 WHERE id=$6 RETURNING id',
      [b.type, b.amount, b.date, b.categoryId, b.note, id]
    );
    if (!upd.rowCount) throw new HttpError(404, 'Transaction not found');
    const { rows } = await query(`${SELECT} WHERE t.id=$1`, [id]);
    res.json(rows[0]);
  }));

  r.delete('/:id', wrap(async (req, res) => {
    const { rowCount } = await query('DELETE FROM transactions WHERE id=$1', [parseId(req.params.id)]);
    if (!rowCount) throw new HttpError(404, 'Transaction not found');
    res.json({ ok: true });
  }));

  return r;
}

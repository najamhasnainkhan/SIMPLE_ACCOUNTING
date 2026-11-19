import { Router } from 'express';
import { query } from '../db.js';
import { buildFilter } from '../validate.js';

const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

// Totals and per-category breakdown, honouring the same filters as the list.
export default function summaryRouter() {
  const r = Router();

  r.get('/', wrap(async (req, res) => {
    const f = buildFilter(req.query);
    const totals = await query(
      `SELECT
         COALESCE(SUM(t.amount_cents) FILTER (WHERE t.type='income'),0)::bigint AS income,
         COALESCE(SUM(t.amount_cents) FILTER (WHERE t.type='expense'),0)::bigint AS expense
       FROM transactions t ${f.sql}`,
      f.params
    );
    const cats = await query(
      `SELECT c.id AS category_id, c.name,
         COALESCE(SUM(t.amount_cents) FILTER (WHERE t.type='income'),0)::bigint AS income,
         COALESCE(SUM(t.amount_cents) FILTER (WHERE t.type='expense'),0)::bigint AS expense
       FROM transactions t JOIN categories c ON c.id = t.category_id ${f.sql}
       GROUP BY c.id ORDER BY lower(c.name)`,
      f.params
    );
    const income = Number(totals.rows[0].income);
    const expense = Number(totals.rows[0].expense);
    res.json({
      income,
      expense,
      balance: income - expense,
      byCategory: cats.rows.map((c) => ({
        category_id: c.category_id, name: c.name, income: Number(c.income), expense: Number(c.expense),
      })),
    });
  }));

  return r;
}

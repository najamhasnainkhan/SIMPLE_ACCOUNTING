export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const bad = (msg) => new HttpError(400, msg);

// Parse decimal text such as "25", "25.5", "1,200.00" into integer cents without floats.
export function parseCents(value) {
  const s = String(value ?? '').trim().replace(/,/g, '');
  const m = /^(\d{1,10})(?:\.(\d{1,2}))?$/.exec(s);
  if (!m) throw bad('Amount must be a positive number with at most 2 decimals');
  const cents = Number(m[1]) * 100 + Number((m[2] || '').padEnd(2, '0') || 0);
  if (cents <= 0) throw bad('Amount must be greater than zero');
  if (cents > 2_000_000_000) throw bad('Amount is too large');
  return cents;
}

export function checkDate(d) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(d || ''))) throw bad('Date must be YYYY-MM-DD');
  const dt = new Date(`${d}T00:00:00Z`);
  if (Number.isNaN(dt.getTime()) || dt.toISOString().slice(0, 10) !== d) throw bad('Invalid date');
  return d;
}

export function checkType(t) {
  if (t !== 'income' && t !== 'expense') throw bad('Type must be income or expense');
  return t;
}

export function checkName(n) {
  const s = String(n ?? '').trim();
  if (!s) throw bad('Name is required');
  if (s.length > 60) throw bad('Name must be 60 characters or fewer');
  return s;
}

export function parseId(v, label = 'id') {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw bad(`Invalid ${label}`);
  return n;
}

// Build a WHERE clause from optional filters (from, to, type, category_id).
export function buildFilter(q) {
  const where = [];
  const params = [];
  if (q.from) { params.push(checkDate(q.from)); where.push(`t.date >= $${params.length}`); }
  if (q.to) { params.push(checkDate(q.to)); where.push(`t.date <= $${params.length}`); }
  if (q.type) { params.push(checkType(q.type)); where.push(`t.type = $${params.length}`); }
  if (q.category_id) { params.push(parseId(q.category_id, 'category')); where.push(`t.category_id = $${params.length}`); }
  return { sql: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
}

import pg from 'pg';

// One shared pool. The database sleeps when idle, so allow a long connect time.
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  connectionTimeoutMillis: 15000,
  ssl: process.env.DATABASE_URL && !/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)
    ? { rejectUnauthorized: false }
    : undefined,
});

pool.on('error', (e) => console.error('Pool error', e.message));

const CONN_CODES = ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', '57P01', '08006', '08001', '08000'];

// Run a query with parameters; retry once on a connection error (database waking up).
export async function query(text, params = []) {
  if (!process.env.DATABASE_URL) {
    const err = new Error('DATABASE_URL is not set. Add it in the Secrets panel.');
    err.status = 503;
    throw err;
  }
  try {
    return await pool.query(text, params);
  } catch (e) {
    if (CONN_CODES.includes(e.code) || /Connection terminated|timeout/i.test(e.message)) {
      await new Promise((r) => setTimeout(r, 1500));
      return pool.query(text, params);
    }
    throw e;
  }
}

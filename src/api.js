export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export const fmt = (cents) => usd.format(cents / 100);

export const today = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const monthRange = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const base = `${d.getFullYear()}-${p(d.getMonth() + 1)}`;
  return { from: `${base}-01`, to: `${base}-${p(last)}` };
};

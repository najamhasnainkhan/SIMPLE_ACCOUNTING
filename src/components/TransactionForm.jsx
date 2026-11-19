import React, { useEffect, useState } from 'react';
import { api, today } from '../api.js';

const blank = () => ({ type: 'expense', amount: '', date: today(), category_id: '', note: '' });

export default function TransactionForm({ categories, editing, onCancel, onSaved }) {
  const [form, setForm] = useState(blank());
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        type: editing.type,
        amount: (editing.amount_cents / 100).toFixed(2),
        date: editing.date,
        category_id: String(editing.category_id),
        note: editing.note,
      });
    } else {
      setForm(blank());
    }
    setError('');
  }, [editing]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const body = { ...form, category_id: Number(form.category_id) };
      if (editing) await api(`/transactions/${editing.id}`, { method: 'PUT', body });
      else await api('/transactions', { method: 'POST', body });
      setForm(blank());
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel">
      <h2>{editing ? 'Edit transaction' : 'Add transaction'}</h2>
      <form onSubmit={submit} className="row">
        <label>Type
          <select value={form.type} onChange={set('type')}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
        <label>Amount (USD)
          <input inputMode="decimal" placeholder="0.00" value={form.amount} onChange={set('amount')} required />
        </label>
        <label>Date<input type="date" value={form.date} onChange={set('date')} required /></label>
        <label>Category
          <select value={form.category_id} onChange={set('category_id')} required>
            <option value="">Select…</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="grow">Note (optional)
          <input value={form.note} maxLength={500} onChange={set('note')} />
        </label>
        <button type="submit" disabled={busy}>{editing ? 'Save changes' : 'Add'}</button>
        {editing && <button type="button" className="secondary" onClick={onCancel}>Cancel</button>}
      </form>
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  );
}

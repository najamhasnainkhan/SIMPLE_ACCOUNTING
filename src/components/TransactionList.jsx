import React, { useState } from 'react';
import { api, fmt } from '../api.js';

export default function TransactionList({ items, onEdit, onChanged }) {
  const [confirmId, setConfirmId] = useState(null);
  const [error, setError] = useState('');

  const remove = async (id) => {
    try {
      await api(`/transactions/${id}`, { method: 'DELETE' });
      setConfirmId(null);
      onChanged();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <section className="panel">
      <h2>Transactions ({items.length})</h2>
      {error && <p className="error" role="alert">{error}</p>}
      {items.length === 0 ? <p className="hint">No transactions match.</p> : (
        <div className="scroll">
          <table>
            <thead>
              <tr><th>Date</th><th>Category</th><th>Note</th><th className="num">Amount</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id}>
                  <td>{t.date}</td>
                  <td>{t.category_name}</td>
                  <td>{t.note}</td>
                  <td className={`num ${t.type === 'income' ? 'pos' : 'neg'}`}>
                    {t.type === 'income' ? '+' : '−'}{fmt(t.amount_cents)}
                  </td>
                  <td className="actions">
                    {confirmId === t.id ? (
                      <>
                        <button className="danger small" onClick={() => remove(t.id)}>Confirm delete</button>
                        <button className="secondary small" onClick={() => setConfirmId(null)}>Keep</button>
                      </>
                    ) : (
                      <>
                        <button className="secondary small" onClick={() => onEdit(t)} aria-label={`Edit ${t.category_name} transaction on ${t.date}`}>Edit</button>
                        <button className="secondary small" onClick={() => setConfirmId(t.id)} aria-label={`Delete ${t.category_name} transaction on ${t.date}`}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

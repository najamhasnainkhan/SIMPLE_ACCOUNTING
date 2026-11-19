import React, { useState } from 'react';
import { api } from '../api.js';

export default function Categories({ categories, onChanged }) {
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [error, setError] = useState('');

  const act = async (fn) => {
    setError('');
    try { await fn(); onChanged(); } catch (e) { setError(e.message); }
  };

  const add = (e) => {
    e.preventDefault();
    act(async () => { await api('/categories', { method: 'POST', body: { name } }); setName(''); });
  };
  const rename = (e) => {
    e.preventDefault();
    act(async () => { await api(`/categories/${editId}`, { method: 'PUT', body: { name: editName } }); setEditId(null); });
  };
  const remove = (id) => act(async () => { await api(`/categories/${id}`, { method: 'DELETE' }); setConfirmId(null); });

  return (
    <section className="panel">
      <h2>Categories</h2>
      <form onSubmit={add} className="row">
        <label className="grow">New category<input value={name} maxLength={60} onChange={(e) => setName(e.target.value)} required /></label>
        <button type="submit">Add category</button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      <ul className="list">
        {categories.map((c) => (
          <li key={c.id}>
            {editId === c.id ? (
              <form onSubmit={rename} className="row">
                <label className="grow">Rename<input value={editName} maxLength={60} onChange={(e) => setEditName(e.target.value)} required /></label>
                <button type="submit" className="small">Save</button>
                <button type="button" className="secondary small" onClick={() => setEditId(null)}>Cancel</button>
              </form>
            ) : (
              <>
                <span className="grow">{c.name} <span className="hint">({c.transaction_count} transactions)</span></span>
                {confirmId === c.id ? (
                  <>
                    <button className="danger small" onClick={() => remove(c.id)}>Confirm delete</button>
                    <button className="secondary small" onClick={() => setConfirmId(null)}>Keep</button>
                  </>
                ) : (
                  <>
                    <button className="secondary small" aria-label={`Rename ${c.name}`} onClick={() => { setEditId(c.id); setEditName(c.name); }}>Rename</button>
                    <button className="secondary small" aria-label={`Delete ${c.name}`} onClick={() => setConfirmId(c.id)}>Delete</button>
                  </>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

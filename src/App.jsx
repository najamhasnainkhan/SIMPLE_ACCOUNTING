import React, { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import Summary from './components/Summary.jsx';
import Filters from './components/Filters.jsx';
import TransactionForm from './components/TransactionForm.jsx';
import TransactionList from './components/TransactionList.jsx';
import Breakdown from './components/Breakdown.jsx';
import Categories from './components/Categories.jsx';

const toQuery = (f) => {
  const p = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => { if (v) p.set(k, v); });
  const s = p.toString();
  return s ? `?${s}` : '';
};

export default function App() {
  const [tab, setTab] = useState('transactions');
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({ from: '', to: '', type: '', category_id: '' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(() => api('/categories').then(setCategories), []);

  const loadData = useCallback(async () => {
    const q = toQuery(filters);
    const [t, s] = await Promise.all([api(`/transactions${q}`), api(`/summary${q}`)]);
    setTransactions(t);
    setSummary(s);
  }, [filters]);

  const refresh = useCallback(async () => {
    try {
      setError('');
      await Promise.all([loadCategories(), loadData()]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [loadCategories, loadData]);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <>
      <header className="top"><h1>Simple Ledger</h1></header>
      <nav className="tabs" aria-label="Sections">
        <button aria-current={tab === 'transactions' ? 'page' : undefined} onClick={() => setTab('transactions')}>Transactions</button>
        <button aria-current={tab === 'categories' ? 'page' : undefined} onClick={() => setTab('categories')}>Categories</button>
      </nav>
      <main>
        {error && <p className="error" role="alert">{error}</p>}
        {loading && <p>Loading…</p>}
        {tab === 'transactions' && (
          <>
            <Summary summary={summary} filtered={Object.values(filters).some(Boolean)} />
            <TransactionForm
              categories={categories}
              editing={editing}
              onCancel={() => setEditing(null)}
              onSaved={() => { setEditing(null); refresh(); }}
            />
            <Filters filters={filters} setFilters={setFilters} categories={categories} />
            <div className="grid">
              <TransactionList items={transactions} onEdit={setEditing} onChanged={refresh} />
              <Breakdown rows={summary?.byCategory || []} />
            </div>
          </>
        )}
        {tab === 'categories' && <Categories categories={categories} onChanged={refresh} />}
      </main>
    </>
  );
}

import React from 'react';
import { monthRange } from '../api.js';

export default function Filters({ filters, setFilters, categories }) {
  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });
  return (
    <section className="panel" aria-label="Filters">
      <h2>Filter</h2>
      <div className="row">
        <label>From<input type="date" value={filters.from} onChange={set('from')} /></label>
        <label>To<input type="date" value={filters.to} onChange={set('to')} /></label>
        <label>Type
          <select value={filters.type} onChange={set('type')}>
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>
        <label>Category
          <select value={filters.category_id} onChange={set('category_id')}>
            <option value="">All</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <button type="button" className="secondary" onClick={() => setFilters({ ...filters, ...monthRange() })}>This month</button>
        <button type="button" className="secondary" onClick={() => setFilters({ from: '', to: '', type: '', category_id: '' })}>Clear</button>
      </div>
    </section>
  );
}

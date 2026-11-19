import React from 'react';
import { fmt } from '../api.js';

export default function Summary({ summary, filtered }) {
  const s = summary || { income: 0, expense: 0, balance: 0 };
  return (
    <section aria-label="Balance summary">
      <div className="cards">
        <div className="card"><span>Total income</span><strong className="pos">{fmt(s.income)}</strong></div>
        <div className="card"><span>Total expenses</span><strong className="neg">{fmt(s.expense)}</strong></div>
        <div className="card"><span>Net balance</span><strong className={s.balance < 0 ? 'neg' : 'pos'}>{fmt(s.balance)}</strong></div>
      </div>
      {filtered && <p className="hint">Totals reflect the current filters.</p>}
    </section>
  );
}

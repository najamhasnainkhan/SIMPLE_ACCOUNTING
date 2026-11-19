import React from 'react';
import { fmt } from '../api.js';

export default function Breakdown({ rows }) {
  return (
    <section className="panel">
      <h2>Totals by category</h2>
      {rows.length === 0 ? <p className="hint">Nothing to show.</p> : (
        <table>
          <thead><tr><th>Category</th><th className="num">Income</th><th className="num">Expenses</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.category_id}>
                <td>{r.name}</td>
                <td className="num pos">{fmt(r.income)}</td>
                <td className="num neg">{fmt(r.expense)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

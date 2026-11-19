import express from 'express';
import categoriesRouter from './routes/categories.js';
import transactionsRouter from './routes/transactions.js';
import summaryRouter from './routes/summary.js';

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api/categories', categoriesRouter());
  app.use('/api/transactions', transactionsRouter());
  app.use('/api/summary', summaryRouter());

  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (!err.status) console.error(err);
    res.status(err.status || 500).json({ error: err.status ? err.message : 'Server error' });
  });
  return app;
}

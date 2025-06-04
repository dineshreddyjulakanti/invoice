// backend/server.js
import express from 'express';
import cors    from 'cors';
import morgan  from 'morgan';
import dotenv  from 'dotenv';
import { connectDB } from './config/db.js';
import invoiceRoutes from './routes/invoiceRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

/* quick smoke-test route ---------------------------------- */
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));
/* invoice routes ------------------------------------------- */
app.use('/api/invoices', invoiceRoutes);

/* 404 *after* routes so we see wrong paths clearly ---------- */
app.use((req, res) => {
  res.status(404).json({ message: `❌ Path not found: ${req.originalUrl}` });
});

/* central error catcher ------------------------------------ */
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

/* start ---------------------------------------------------- */
await connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`➡️  API running on http://localhost:${PORT}`));

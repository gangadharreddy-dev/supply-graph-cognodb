import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mount API router
app.use('/api', apiRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SupplyGraph Express Server listening on http://127.0.0.1:${PORT}`);
});

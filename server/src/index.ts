import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import foodItemsRouter from './routes/foodItems';
import scanRouter from './routes/scan';
import notificationsRouter from './routes/notifications';
import { initializeCronJobs } from './services/cronService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/food-items', foodItemsRouter);
app.use('/api/scan', scanRouter);
app.use('/api/notifications', notificationsRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Initialize cron jobs after server starts
    initializeCronJobs();
});

export default app;

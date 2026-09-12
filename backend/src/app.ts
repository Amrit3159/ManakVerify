import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { sendSuccess, sendError } from './utils/response';
import { config } from './config';

const app = express();

// Security HTTP Headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: [config.clientUrl, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    errors: [],
  },
});
app.use(limiter);

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  return sendSuccess(res, { status: 'healthy', timestamp: new Date().toISOString() }, 'MaanakVerify API is operational');
});
app.get('/api/health', (req, res) => {
  return sendSuccess(res, { status: 'healthy', timestamp: new Date().toISOString() }, 'MaanakVerify API is operational');
});

// API Routes
app.use('/api', routes);

// 404 Catch-All
app.use((req, res) => {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
});

// Centralized Error Handler
app.use(errorHandler);

export default app;

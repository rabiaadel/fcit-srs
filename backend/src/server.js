require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { register: promRegister, collectDefaultMetrics } = require('prom-client');

const logger = require('./utils/logger');
const routes = require('./routes/index');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { checkHealth } = require('./config/database');

collectDefaultMetrics({ prefix: 'fcit_srs_' });
const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
    },
  },
}));

const corsOptions = {
  origin: (origin, callback) => {
    const allowed = (process.env.CORS_ORIGINS || 'http://localhost:3002').split(',');
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.API_RATE_LIMIT) || 200,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, please wait 15 minutes' },
});

app.use(limiter);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ───────────────────────────────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) },
  skip: (req) => req.url === '/health',
}));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  const dbHealth = await checkHealth();
  const status = dbHealth.healthy ? 200 : 503;
  res.status(status).json({
    status: dbHealth.healthy ? 'ok' : 'degraded',
    service: 'FCIT Student Registration System',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbHealth,
  });
});

// ── Prometheus metrics (restrict to internal/prometheus only) ─────────────────
app.get('/metrics', async (req, res) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  res.set('Content-Type', promRegister.contentType);
  res.end(await promRegister.metrics());
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/v1/auth/login', loginLimiter);
app.use('/api/v1', routes);

// ── 404 and Error handlers ────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`FCIT SRS Backend running on port ${PORT}`, {
    env: process.env.NODE_ENV,
    port: PORT,
  });
});

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);
  server.close(() => {
    const { pool } = require('./config/database');
    pool.end().then(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10000);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;

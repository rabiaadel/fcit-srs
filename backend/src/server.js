require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { register: promRegister, collectDefaultMetrics, Counter, Histogram, Gauge } = require('prom-client');

const logger = require('./utils/logger');
const routes = require('./routes/index');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { checkHealth } = require('./config/database');

collectDefaultMetrics({ prefix: 'fcit_srs_' });

// [P2-FIX] Application-specific metrics
// Problem: Only default Node.js process metrics were collected — no business insight
// Fix: Track HTTP requests, latency per route, login events, and enrollment activity
const httpRequestsTotal = new Counter({
  name: 'fcit_srs_http_requests_total',
  help: 'Total HTTP requests by method, route, and status code',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestDuration = new Histogram({
  name: 'fcit_srs_http_request_duration_seconds',
  help: 'HTTP request latency in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});

const loginAttemptsTotal = new Counter({
  name: 'fcit_srs_login_attempts_total',
  help: 'Login attempts by result and role',
  labelNames: ['result', 'role'],
});

const enrollmentOpsTotal = new Counter({
  name: 'fcit_srs_enrollment_operations_total',
  help: 'Course enrollment operations (register/drop/withdraw)',
  labelNames: ['operation', 'result'],
});

const gradeEntriesTotal = new Counter({
  name: 'fcit_srs_grade_entries_total',
  help: 'Grade entry operations',
  labelNames: ['result'],
});

const notificationsTotal = new Counter({
  name: 'fcit_srs_notifications_dispatched_total',
  help: 'Notifications dispatched by type',
  labelNames: ['type'],
});

new Gauge({
  name: 'fcit_srs_db_pool_active_connections',
  help: 'Active database pool connections',
  collect() {
    try { const { pool } = require('./config/database'); this.set(pool.totalCount - pool.idleCount); } catch {}
  },
});
new Gauge({
  name: 'fcit_srs_db_pool_idle_connections',
  help: 'Idle database pool connections',
  collect() {
    try { const { pool } = require('./config/database'); this.set(pool.idleCount); } catch {}
  },
});

// Exported for use in controllers
const appMetrics = { loginAttemptsTotal, enrollmentOpsTotal, gradeEntriesTotal, notificationsTotal };

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

// ── Security middleware ────────────────────────────────────────────────────────
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
  skip: (req) => req.url === '/health' || req.url === '/metrics',
}));

// ── [P2-FIX] Request metrics middleware ──────────────────────────────────────
// Normalize parameterized routes like /api/v1/students/abc123 → /api/v1/students/:id
// so Prometheus doesn't get cardinality explosion from thousands of unique UUIDs
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    // Normalize route: replace UUIDs and numeric IDs
    let route = req.route?.path || req.path;
    route = route
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':uuid')
      .replace(/\/\d+/g, '/:id');
    const labels = { method: req.method, route, status_code: res.statusCode };
    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, duration);
  });
  next();
});

// ── [R1-FIX] Root endpoint ────────────────────────────────────────────────────
// Problem: GET / returned 404 "Route not found"
// Root cause: All routes lived under /api/v1; / hit the notFound middleware
// Fix: Explicit root handler that returns service identity + live health status
// Why correct: Industry standard — GitHub API, Stripe API, etc. all do this
app.get('/', async (req, res) => {
  let dbStatus = { healthy: false };
  try { dbStatus = await checkHealth(); } catch {}
  res.json({
    success: true,
    service: 'FCIT Student Registration System API',
    version: '1.0.0',
    institution: 'Faculty of Computers & Informatics, Tanta University',
    environment: process.env.NODE_ENV || 'development',
    status: dbStatus.healthy ? 'operational' : 'degraded',
    timestamp: new Date().toISOString(),
    endpoints: {
      health:  `${req.protocol}://${req.get('host')}/health`,
      metrics: `${req.protocol}://${req.get('host')}/metrics`,
      api:     `${req.protocol}://${req.get('host')}/api/v1`,
      login:   `${req.protocol}://${req.get('host')}/api/v1/auth/login`,
    },
    database: {
      healthy: dbStatus.healthy,
      ...(dbStatus.healthy ? { serverTime: dbStatus.time } : { error: dbStatus.error }),
    },
  });
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  const dbHealth = await checkHealth();
  const status = dbHealth.healthy ? 200 : 503;
  res.status(status).json({
    status: dbHealth.healthy ? 'ok' : 'degraded',
    service: 'FCIT Student Registration System',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
    },
    database: dbHealth,
  });
});

// ── [P1-FIX] Prometheus metrics ───────────────────────────────────────────────
// Problem: X-Forwarded-For guard was too aggressive
// Root cause: Any proxy (including nginx) sets X-Forwarded-For, which would
//             block Prometheus scraping if nginx was in the path. The guard
//             was confusing intent (block public) with mechanism (wrong signal).
// Fix: Check actual remote IP against Docker internal network ranges.
//      Prometheus scrapes backend:3000 directly inside fcit-srs-network (172.30.x.x).
//      Also support optional Bearer token for secure external scraping.
app.get('/metrics', async (req, res) => {
  const remoteIp = req.ip || req.connection?.remoteAddress || '';
  const isInternalNetwork = (
    remoteIp.startsWith('172.') ||
    remoteIp.startsWith('10.') ||
    remoteIp.startsWith('192.168.') ||
    remoteIp === '127.0.0.1' ||
    remoteIp === '::1' ||
    remoteIp === '::ffff:127.0.0.1'
  );
  const metricsToken = process.env.METRICS_TOKEN;
  const hasValidToken = metricsToken && req.headers['x-metrics-token'] === metricsToken;

  if (!isInternalNetwork && !hasValidToken) {
    logger.warn('Unauthorized metrics access attempt', { ip: remoteIp });
    return res.status(403).json({ success: false, message: 'Metrics access restricted' });
  }

  try {
    res.set('Content-Type', promRegister.contentType);
    res.end(await promRegister.metrics());
  } catch (err) {
    logger.error('Failed to collect metrics', { error: err.message });
    res.status(500).end(err.message);
  }
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/v1/auth/login', loginLimiter);

// Mount routes
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
process.on('SIGINT',  () => shutdown('SIGINT'));

module.exports = app;
module.exports.appMetrics = appMetrics;

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import quantumRoutes from './routes/quantumRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS — allow frontend + all Chrome extension origins
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow all Chrome extensions
    if (origin.startsWith('chrome-extension://')) return callback(null, true);
    // Allow allowed origins
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed.`));
  },
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please wait a moment.' }
});
app.use('/api', limiter);

// Routes
app.use('/api', quantumRoutes);

// Root test routes for browser testing
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Quantum AI Backend is running perfectly! 🚀' });
});

app.get('/api', (req, res) => {
  res.json({ success: true, message: 'Quantum AI API is active. Send POST requests to /api/quantum/ask to interact with the AI.' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err.code || err.name, '—', err.message);

  // Known error codes
  if (err.code === 'OLLAMA_OFFLINE') {
    return res.status(503).json({
      success: false,
      code: 'OLLAMA_OFFLINE',
      message: 'Ollama is not running. Run: ollama serve',
      setupCommands: ['ollama serve', `ollama pull ${process.env.OLLAMA_MODEL || 'gemma3:4b'}`]
    });
  }

  if (err.code === 'MODEL_NOT_INSTALLED') {
    return res.status(503).json({
      success: false,
      code: 'MODEL_NOT_INSTALLED',
      message: err.message,
      setupCommands: [`ollama pull ${process.env.OLLAMA_MODEL || 'gemma3:4b'}`]
    });
  }

  if (err.code === 'CANCELLED') {
    return res.status(499).json({ success: false, code: 'CANCELLED', message: 'Request cancelled.' });
  }

  if (err.code === 'TIMEOUT') {
    return res.status(504).json({ success: false, code: 'TIMEOUT', message: err.message });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Quantum AI Backend → http://localhost:${PORT}`);
  console.log(`   AI Provider: ${process.env.AI_PROVIDER || 'ollama'}`);
  console.log(`   Ollama Model: ${process.env.OLLAMA_MODEL || 'gemma3:4b'}`);
  console.log(`   Ollama URL: ${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}\n`);
});

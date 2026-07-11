import express from 'express';
import {
  checkHealth,
  getOllamaStatus,
  askQuantum,
  summarizePage,
  explainText,
  analyseCode,
  translateText,
  researchPage,
  testDbConnection
} from '../controllers/quantumController.js';

const router = express.Router();

// Health & Status
router.get('/health', checkHealth);
router.get('/ollama/status', getOllamaStatus);

// Quantum AI endpoints
router.post('/quantum/ask', askQuantum);
router.post('/quantum/summarize', summarizePage);
router.post('/quantum/explain', explainText);
router.post('/quantum/code', analyseCode);
router.post('/quantum/translate', translateText);
router.post('/quantum/research', researchPage);
router.get('/test-db', testDbConnection);

export default router;

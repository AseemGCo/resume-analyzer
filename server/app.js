import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { extractText } from './lib/extractText.js';
import { analyzeResume } from './lib/analyze.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, '..', 'client', 'dist');

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  // 4 MB: stays under Vercel's ~4.5 MB serverless request-body limit.
  limits: { fileSize: 4 * 1024 * 1024 },
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    model: process.env.OPENROUTER_MODEL || 'anthropic/claude-sonnet-4.6',
    hasKey: Boolean(process.env.OPENROUTER_API_KEY),
  });
});

app.post('/api/analyze', upload.single('resume'), async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res
        .status(500)
        .json({ error: 'OPENROUTER_API_KEY is not set. Add it in your host\'s environment variables.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No resume uploaded. Attach a PDF or DOCX in the "resume" field.' });
    }

    const jobDescription = (req.body.jobDescription || '').trim();

    const resumeText = await extractText(req.file);
    if (!resumeText || resumeText.trim().length < 30) {
      return res.status(422).json({
        error: 'Could not extract enough text. Make sure the file is a text-based PDF/DOCX (not a scanned image).',
      });
    }

    const analysis = await analyzeResume({ resumeText, jobDescription });
    res.json(analysis);
  } catch (err) {
    console.error('Analyze error:', err);
    res.status(500).json({ error: err.message || 'Unexpected server error.' });
  }
});

// Single-origin hosting (e.g. Railway): serve the built React app from the same
// server. Skipped on Vercel — there the static client is served by Vercel's CDN
// and this function only ever receives /api/* requests.
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Multer / generic error handler (e.g. file too large).
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  console.error(err);
  res.status(500).json({ error: err.message || 'Unexpected server error.' });
});

export default app;

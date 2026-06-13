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
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
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
        .json({ error: 'OPENROUTER_API_KEY is not set. Copy server/.env.example to server/.env and add your key.' });
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

// In production (e.g. Railway), serve the built React app from the same origin.
// The frontend's relative /api/* calls then hit this server directly — no CORS,
// no separate frontend URL to configure.
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA fallback: anything that isn't an /api route returns index.html.
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

app.listen(PORT, () => {
  console.log(`Resume Analyzer API listening on http://localhost:${PORT}`);
});

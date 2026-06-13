// Vercel serverless entry point.
// Vercel doesn't run a long-lived server, so instead of app.listen() we export
// the Express app as the function handler. vercel.json routes all /api/* here,
// and Express matches the original path (/api/health, /api/analyze).
import app from '../server/app.js';

export default app;

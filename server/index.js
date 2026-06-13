// Local dev / single-origin hosts (Railway): run the exported app as a server.
// On Vercel the app is imported by api/index.js instead (no app.listen there).
import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Resume Analyzer API listening on http://localhost:${PORT}`);
});

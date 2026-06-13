import { useState } from 'react';
import UploadForm from './components/UploadForm.jsx';
import Results from './components/Results.jsx';
import { analyzeResume } from './api.js';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function handleAnalyze(file, jobDescription) {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await analyzeResume(file, jobDescription);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            📋 Resume Analyzer
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Upload a resume and (optionally) a job description for an AI-powered, ATS-aware review.
          </p>
        </header>

        {/* Upload panel */}
        <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <UploadForm onAnalyze={handleAnalyze} loading={loading} />
        </div>

        {/* Error */}
        {error && (
          <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <strong className="font-semibold">Error:</strong> {error}
          </div>
        )}

        {/* Loading skeleton hint */}
        {loading && (
          <p className="text-center text-sm text-gray-400">
            Extracting text and asking the model for a structured review…
          </p>
        )}

        {/* Results */}
        {result && !loading && <Results data={result} />}
      </div>

      <footer className="pb-8 text-center text-xs text-gray-400">
        Built with React, Vite, Tailwind &amp; OpenRouter.
      </footer>
    </div>
  );
}

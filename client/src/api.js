// Base URL of the backend.
// - Local dev: leave VITE_API_BASE_URL unset -> '' -> relative /api -> Vite proxy.
// - Split deploy (e.g. client on Vercel, server elsewhere): set VITE_API_BASE_URL
//   to the server's origin, e.g. https://your-server.example.com
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

// Single entry point for the backend call.
export async function analyzeResume(file, jobDescription) {
  const form = new FormData();
  form.append('resume', file);
  if (jobDescription && jobDescription.trim()) {
    form.append('jobDescription', jobDescription.trim());
  }

  const res = await fetch(`${API_BASE}/api/analyze`, { method: 'POST', body: form });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Server returned an unexpected (non-JSON) response.');
  }

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status}).`);
  }
  return data;
}

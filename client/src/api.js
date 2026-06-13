// Single entry point for the backend call.
export async function analyzeResume(file, jobDescription) {
  const form = new FormData();
  form.append('resume', file);
  if (jobDescription && jobDescription.trim()) {
    form.append('jobDescription', jobDescription.trim());
  }

  const res = await fetch('/api/analyze', { method: 'POST', body: form });

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

import { useRef, useState } from 'react';

const ACCEPT = '.pdf,.docx';

export default function UploadForm({ onAnalyze, loading }) {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  function pickFile(f) {
    if (!f) return;
    const ok = /\.(pdf|docx)$/i.test(f.name);
    if (!ok) {
      alert('Please choose a PDF or DOCX file.');
      return;
    }
    setFile(f);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    pickFile(e.dataTransfer.files?.[0]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      alert('Please upload a resume first.');
      return;
    }
    onAnalyze(file, jobDescription);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:border-indigo-400'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
        <div className="text-3xl" aria-hidden="true">📄</div>
        {file ? (
          <p className="mt-2 text-sm font-medium text-gray-800">{file.name}</p>
        ) : (
          <>
            <p className="mt-2 text-sm font-medium text-gray-700">
              Drag &amp; drop your resume, or click to browse
            </p>
            <p className="mt-1 text-xs text-gray-400">PDF or DOCX, up to 10 MB</p>
          </>
        )}
      </div>

      {/* Job description (optional) */}
      <div>
        <label htmlFor="jd" className="mb-1 block text-sm font-medium text-gray-700">
          Job description <span className="font-normal text-gray-400">(optional — enables ATS match)</span>
        </label>
        <textarea
          id="jd"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={5}
          placeholder="Paste the job description here to compare keywords…"
          className="w-full resize-y rounded-xl border border-gray-300 p-3 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Analyzing…
          </>
        ) : (
          'Analyze Resume'
        )}
      </button>
    </form>
  );
}

# Resume Analyzer

An end-to-end web app that analyzes a resume (PDF or DOCX) against an optional
job description and returns a structured, ATS-aware review.

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **LLM:** OpenRouter (default model `anthropic/claude-3.5-sonnet`, configurable)
- **Parsing:** `pdf-parse` (PDF) and `mammoth` (DOCX)

## What it does

1. Upload a resume (PDF/DOCX) and optionally paste a job description.
2. The backend extracts the resume text and sends it (plus the job description,
   if given) to OpenRouter in a single chat-completions call with
   `response_format: json_object`.
3. The model returns structured JSON:
   - Overall score (0–100) + summary
   - Key strengths
   - Weaknesses / gaps
   - ATS match: score, matched keywords, and missing keywords vs. the job description
   - Suggested improvements
   - Extracted skills, experience summary, and education
4. The frontend renders it as cards: a score gauge, strengths/weaknesses,
   keyword match, and actionable suggestions.

## Project layout

```
end-to-end-resume-analiser/
├── server/   # Express API (port 3001)
└── client/   # React + Vite app (port 5173)
```

## Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env        # then edit .env and add your OPENROUTER_API_KEY
npm run dev                 # starts http://localhost:3001
```

Get an API key at https://openrouter.ai/keys.

To use a different model, set `OPENROUTER_MODEL` in `.env` to any OpenRouter
slug — for example a newer Claude model like `anthropic/claude-sonnet-4.5`.

### 2. Frontend

In a second terminal:

```bash
cd client
npm install
npm run dev                 # starts http://localhost:5173
```

Open http://localhost:5173. The Vite dev server proxies `/api` to the Express
server, so no CORS configuration is needed during development.

## API

### `POST /api/analyze`

`multipart/form-data`:

| field            | type   | required | notes                          |
| ---------------- | ------ | -------- | ------------------------------ |
| `resume`         | file   | yes      | PDF or DOCX, up to 10 MB       |
| `jobDescription` | string | no       | enables the ATS keyword match  |

Returns the structured analysis JSON described above. `atsMatch` is `null` when
no job description is supplied.

### `GET /api/health`

Returns `{ ok, model, hasKey }` — handy for confirming the key is loaded.

## Deploy to Railway

Set up to deploy as a **single Railway service**: the build compiles the React
app into `client/dist`, and the Express server serves both that static app and
the `/api` routes on one port. Railway injects `PORT` automatically, and the
root `railway.json` defines the build/start commands.

### Option A — Railway CLI (no GitHub needed)

```bash
npm i -g @railway/cli
railway login
cd end-to-end-resume-analiser
railway init                 # create a new project
railway up                   # build + deploy from this folder
railway domain               # generate a public https URL
```

Add your key (Dashboard → service → Variables, or via CLI):

```bash
railway variables --set OPENROUTER_API_KEY=sk-or-... \
                  --set OPENROUTER_MODEL=anthropic/claude-sonnet-4.6
```

### Option B — GitHub

1. Push the project to a GitHub repo.
2. Railway → New Project → Deploy from GitHub repo.
3. If the repo root isn't this folder, set **Settings → Root Directory** to
   `end-to-end-resume-analiser`.
4. Add `OPENROUTER_API_KEY` (and optionally `OPENROUTER_MODEL`) under Variables.

### Variables on Railway

| Variable             | Required | Notes                                          |
| -------------------- | -------- | ---------------------------------------------- |
| `OPENROUTER_API_KEY` | yes      | Your OpenRouter key                            |
| `OPENROUTER_MODEL`   | no       | Defaults to `anthropic/claude-sonnet-4.6`      |
| `PORT`               | no       | Set automatically by Railway — don't override  |

Your local `.env` is gitignored and not uploaded, so the key **must** be set in
Railway's Variables.

## Notes

- The resume text is capped (~20k chars) before being sent to the model to keep
  token usage bounded.
- Scanned/image-only PDFs won't extract text (no OCR); use a text-based file.
- Structured output is enforced three ways: `response_format: json_object`, an
  explicit schema in the prompt, and defensive JSON parsing on the server.

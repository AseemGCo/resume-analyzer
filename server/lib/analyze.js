const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'anthropic/claude-sonnet-4.6';

// Cap input so a huge resume can't blow up token usage / cost.
const MAX_RESUME_CHARS = 20000;
const MAX_JD_CHARS = 8000;

const SYSTEM_PROMPT = `You are an expert technical recruiter and ATS (Applicant Tracking System) analyst.
You evaluate resumes objectively, are specific and actionable, and you respond with ONLY a single JSON object.
Do not include any prose, explanation, or markdown code fences outside the JSON.`;

/**
 * The exact JSON shape we ask the model to produce. Kept in the prompt so the
 * model self-validates, and re-validated/normalized in code after parsing.
 */
const SCHEMA_DESCRIPTION = `Return a JSON object with EXACTLY these fields:
{
  "overallScore": integer 0-100 (overall resume quality),
  "summary": string (2-3 sentence overall assessment),
  "strengths": string[] (3-6 concrete strengths),
  "weaknesses": string[] (3-6 gaps or weaknesses),
  "suggestions": string[] (4-8 specific, actionable improvements),
  "skills": string[] (technical and soft skills found in the resume),
  "experienceSummary": string (one paragraph summarizing work experience),
  "education": string[] (each entry like "Degree — Institution (Year)"),
  "atsMatch": null OR {
    "score": integer 0-100 (how well the resume matches the job description),
    "matchedKeywords": string[] (important JD keywords present in the resume),
    "missingKeywords": string[] (important JD keywords missing from the resume)
  }
}
Rules:
- If NO job description is provided, set "atsMatch" to null.
- Every array must be present (use [] if empty). Never omit a field.
- Keep each list item concise (one line).`;

function buildUserPrompt(resumeText, jobDescription) {
  const jd = jobDescription
    ? `JOB DESCRIPTION:\n"""\n${jobDescription}\n"""\n`
    : 'JOB DESCRIPTION: (none provided — set "atsMatch" to null)\n';

  return `${SCHEMA_DESCRIPTION}

${jd}
RESUME:
"""
${resumeText}
"""`;
}

/** Parse JSON even if the model wrapped it in code fences or added stray text. */
function parseJsonLoose(text) {
  if (!text) throw new Error('Empty response from the model.');
  let t = text.trim();

  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }

  try {
    return JSON.parse(t);
  } catch {
    const start = t.indexOf('{');
    const end = t.lastIndexOf('}');
    if (start !== -1 && end > start) {
      return JSON.parse(t.slice(start, end + 1));
    }
    throw new Error('The model did not return valid JSON.');
  }
}

/** Coerce/normalize the parsed object so the frontend always gets a stable shape. */
function normalize(raw) {
  const arr = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()) : []);
  const clampScore = (v) => {
    const n = Math.round(Number(v));
    if (Number.isNaN(n)) return null;
    return Math.max(0, Math.min(100, n));
  };

  let atsMatch = null;
  if (raw.atsMatch && typeof raw.atsMatch === 'object') {
    atsMatch = {
      score: clampScore(raw.atsMatch.score),
      matchedKeywords: arr(raw.atsMatch.matchedKeywords),
      missingKeywords: arr(raw.atsMatch.missingKeywords),
    };
  }

  return {
    overallScore: clampScore(raw.overallScore) ?? 0,
    summary: typeof raw.summary === 'string' ? raw.summary : '',
    strengths: arr(raw.strengths),
    weaknesses: arr(raw.weaknesses),
    suggestions: arr(raw.suggestions),
    skills: arr(raw.skills),
    experienceSummary: typeof raw.experienceSummary === 'string' ? raw.experienceSummary : '',
    education: arr(raw.education),
    atsMatch,
  };
}

/**
 * Send the resume (and optional job description) to OpenRouter and return the
 * normalized structured analysis.
 *
 * @param {{ resumeText: string, jobDescription?: string }} args
 */
export async function analyzeResume({ resumeText, jobDescription }) {
  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
  const resume = resumeText.slice(0, MAX_RESUME_CHARS);
  const jd = (jobDescription || '').slice(0, MAX_JD_CHARS);

  const body = {
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(resume, jd) },
    ],
    // Force structured output. Backed up by the schema prompt + loose parsing
    // for models/providers that don't strictly honor json_object.
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_tokens: 2000,
  };

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.OPENROUTER_REFERER || 'http://localhost:5173',
      'X-Title': process.env.OPENROUTER_TITLE || 'Resume Analyzer',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`OpenRouter request failed (${res.status}): ${detail.slice(0, 500)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  const parsed = parseJsonLoose(content);
  return normalize(parsed);
}

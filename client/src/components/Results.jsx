import Card, { BulletList } from './Card.jsx';
import ScoreGauge from './ScoreGauge.jsx';
import KeywordMatch from './KeywordMatch.jsx';

export default function Results({ data }) {
  return (
    <div className="space-y-6">
      {/* Overview: score + summary */}
      <Card className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <div className="sm:shrink-0">
          <ScoreGauge score={data.overallScore} />
        </div>
        <div className="flex-1">
          <h2 className="mb-2 text-lg font-semibold text-gray-800">Summary</h2>
          <p className="text-sm leading-relaxed text-gray-600">
            {data.summary || 'No summary returned.'}
          </p>
        </div>
      </Card>

      {/* ATS match (only when a job description was provided) */}
      {data.atsMatch && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <KeywordMatch atsMatch={data.atsMatch} />
        </div>
      )}

      {/* Strengths + Weaknesses */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card title="Strengths" icon="✅" accent="text-green-700">
          <BulletList items={data.strengths} marker="▸" markerClass="text-green-500" />
        </Card>
        <Card title="Weaknesses & Gaps" icon="⚠️" accent="text-red-700">
          <BulletList items={data.weaknesses} marker="▸" markerClass="text-red-500" />
        </Card>
      </div>

      {/* Suggestions */}
      <Card title="Suggested Improvements" icon="💡" accent="text-amber-700">
        <BulletList items={data.suggestions} marker="→" markerClass="text-amber-500" />
      </Card>

      {/* Skills / Experience / Education */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Skills" icon="🛠️" accent="text-indigo-700">
          {data.skills.length ? (
            <div className="flex flex-wrap gap-2">
              {data.skills.map((s, i) => (
                <span
                  key={i}
                  className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                >
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-gray-400">No skills extracted.</p>
          )}
        </Card>

        <Card title="Experience" icon="💼" accent="text-gray-700">
          <p className="text-sm leading-relaxed text-gray-600">
            {data.experienceSummary || 'No experience summary returned.'}
          </p>
        </Card>

        <Card title="Education" icon="🎓" accent="text-gray-700">
          <BulletList items={data.education} marker="•" markerClass="text-gray-400" />
        </Card>
      </div>
    </div>
  );
}

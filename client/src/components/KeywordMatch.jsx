import Card from './Card.jsx';
import ScoreGauge from './ScoreGauge.jsx';

function Chip({ children, tone }) {
  const tones = {
    matched: 'bg-green-50 text-green-700 border-green-200',
    missing: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export default function KeywordMatch({ atsMatch }) {
  return (
    <Card title="ATS Keyword Match" icon="🎯" accent="text-indigo-700" className="lg:col-span-2">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="md:w-48 md:shrink-0">
          <ScoreGauge score={atsMatch.score ?? 0} label="ATS Match" />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-green-700">
              Matched keywords ({atsMatch.matchedKeywords.length})
            </h3>
            {atsMatch.matchedKeywords.length ? (
              <div className="flex flex-wrap gap-2">
                {atsMatch.matchedKeywords.map((k, i) => (
                  <Chip key={i} tone="matched">{k}</Chip>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-gray-400">No strong matches detected.</p>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-red-700">
              Missing keywords ({atsMatch.missingKeywords.length})
            </h3>
            {atsMatch.missingKeywords.length ? (
              <div className="flex flex-wrap gap-2">
                {atsMatch.missingKeywords.map((k, i) => (
                  <Chip key={i} tone="missing">{k}</Chip>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-gray-400">Great — nothing important missing.</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

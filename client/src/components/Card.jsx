// Generic card shell used across the results grid.
export default function Card({ title, icon, accent = 'text-gray-700', children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ${className}`}>
      {title && (
        <h2 className={`mb-4 flex items-center gap-2 text-lg font-semibold ${accent}`}>
          {icon && <span aria-hidden="true">{icon}</span>}
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

// Reusable bulleted list with a colored marker.
export function BulletList({ items, marker = '•', markerClass = 'text-gray-400' }) {
  if (!items || items.length === 0) {
    return <p className="text-sm italic text-gray-400">Nothing to show here.</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm leading-relaxed text-gray-700">
          <span className={`mt-0.5 shrink-0 ${markerClass}`} aria-hidden="true">
            {marker}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

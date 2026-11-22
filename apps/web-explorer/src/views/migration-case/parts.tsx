/** Rounded tracked minutes as `1h 05m`, `32m`, or `under 1m` for 0. */
export const minutes = (m: number) =>
  m === 0
    ? 'under 1m'
    : m >= 60
      ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`
      : `${m}m`;

export const pct = (value: number, of: number) => `${(value / of) * 100}%`;

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="mc-legend">
      {items.map((item) => (
        <li key={item.label}>
          <span className="mc-swatch" style={{ background: item.color }} aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

export function DataTable({
  caption,
  head,
  rows,
}: {
  caption: string;
  head: string[];
  rows: (string | number)[][];
}) {
  return (
    <details className="mc-table">
      <summary>Show the data</summary>
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={String(row[0])}>
              {row.map((cell, i) =>
                i === 0 ? (
                  <th key={i} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={i}>{cell}</td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

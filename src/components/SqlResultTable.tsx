// SQL 実行結果（列名＋行）をテーブルで表示する。

export interface SqlResult {
  columns: string[]
  rows: (string | number | boolean | null)[][]
  truncated: boolean
}

function cell(v: string | number | boolean | null) {
  if (v === null) return <span className="text-[var(--color-muted)]">NULL</span>
  return String(v)
}

export default function SqlResultTable({ columns, rows, truncated }: SqlResult) {
  if (columns.length === 0) {
    return <p className="mt-3 text-sm text-[var(--color-muted)]">返す列がありません。</p>
  }
  return (
    <div className="mt-3">
      <div className="overflow-auto rounded-lg border border-[var(--color-line)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-mist)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
            <tr>
              {columns.map((c) => (
                <th key={c} className="whitespace-nowrap px-3 py-2 font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-3 text-center text-[var(--color-muted)]"
                >
                  該当する行がありません（0件）
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i} className="bg-[var(--color-paper)] hover:bg-[var(--color-mist)]">
                  {r.map((v, j) => (
                    <td key={j} className="whitespace-nowrap px-3 py-1.5 font-mono text-[13px]">
                      {cell(v)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-1.5 text-xs text-[var(--color-muted)]">
        {rows.length} 行{truncated ? '（先頭のみ表示・結果が多いため省略）' : ''}
      </p>
    </div>
  )
}

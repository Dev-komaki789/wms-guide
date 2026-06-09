import { useState } from 'react'
import SqlResultTable, { type SqlResult } from './SqlResultTable'
import { runSelect } from '../lib/browserSql'

// SQL を「実行」ボタンで、ブラウザ内 SQLite（同梱の wms.sqlite）に対して実行し、結果の行を表示する。
// サーバー・API・キーは不要。読み取り専用（SELECT のみ）。
export default function SqlRunner({ sql }: { sql: string }) {
  const [data, setData] = useState<SqlResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function run() {
    if (!sql.trim()) return
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const res = await runSelect(sql)
      setData(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={run}
        disabled={loading || !sql.trim()}
        className="rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-3 py-1.5 text-sm font-medium text-[var(--color-accent)] transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {loading ? '実行中…' : '▶ この SQL を実行（結果を表示）'}
      </button>
      {error ? <p className="mt-2 text-sm text-[var(--color-warn)]">{error}</p> : null}
      {data ? <SqlResultTable {...data} /> : null}
    </div>
  )
}

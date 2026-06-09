import { useRef, useState } from 'react'
import ScreenOrmExplorer from '../components/ScreenOrmExplorer'
import SqlRunner from '../components/SqlRunner'
import OrmCheatSheet from '../components/OrmCheatSheet'

// ページB: SQL → Django ORM 変換ツールの雛形（左右レイアウト）。
// 左に SQL を入力 → /api/convert（Django）へ POST → 右に ORM + 解説を表示。
// 変換は毎回 Claude を呼ぶ（キャッシュ保存はしない）。キーは Django 側 env。

interface ConvertResult {
  orm: string
  explanation: string
}

const SAMPLE_SQL = `SELECT pl.picking_list_code, COUNT(pli.id) AS item_count
FROM picking_lists pl
JOIN picking_list_items pli ON pli.picking_list_id = pl.id
GROUP BY pl.id
ORDER BY item_count DESC
LIMIT 5;`

export default function SqlToOrmPage() {
  const [sql, setSql] = useState(SAMPLE_SQL)
  const [result, setResult] = useState<ConvertResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const converterRef = useRef<HTMLDivElement>(null)

  // 「画面から探す」の SQL を手入力欄に入れて、そこへスクロールする（編集して実行できる）
  function useSqlInConverter(s: string) {
    setSql(s)
    converterRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function convert() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql }),
      })
      if (!res.ok) throw new Error(`API がエラーを返しました (HTTP ${res.status})`)
      const data = (await res.json()) as ConvertResult
      setResult(data)
    } catch (e) {
      // Django API 未起動でもページとして成立するよう、原因を表示するだけにとどめる。
      setError(
        e instanceof Error
          ? `${e.message}（Django の /api/convert が起動しているか確認してください）`
          : String(e),
      )
    } finally {
      setLoading(false)
    }
  }

  // ORM 変換（Claude API）は開発時のみ表示。本番（静的ビルド）では非表示にする。
  const SHOW_CONVERT = import.meta.env.DEV

  return (
    <div className="mx-auto max-w-7xl">
      <header className="border-b border-[var(--color-line)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--color-head)]">SQL ↔ Django ORM ツール</h1>
        <p className="mt-2 text-[var(--color-ink)]">
          WMS の画面で使われている ORM/SQL を見たり、SQL を WMS のデータで実行して結果を確かめられます。
          {SHOW_CONVERT ? '手元の SQL を ORM に変換する機能（Claude）も使えます。' : ''}
        </p>
      </header>

      {/* ORM 早わかり（初心者向けまとめ・静的） */}
      <div className="mt-6">
        <OrmCheatSheet />
      </div>

      {/* 画面から探す（WMS の実コードから抽出） */}
      <div className="mt-8">
        <ScreenOrmExplorer onUseSql={useSqlInConverter} />
      </div>

      {/* 手入力の SQL 実行（＋開発時は ORM 変換） */}
      <div ref={converterRef} className="mt-10 border-t border-[var(--color-line)] pt-6">
        <h2 className="text-lg font-semibold text-[var(--color-head)]">
          {SHOW_CONVERT ? '手入力で SQL → ORM 変換・実行' : 'SQL を入力して実行'}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-ink)]">
          自分で書いた SQL を WMS のデータで実行して結果の行を見られます
          {SHOW_CONVERT ? '。Django ORM への変換も試せます' : ''}。
        </p>
      </div>

      <div className={`mt-4 grid gap-5 ${SHOW_CONVERT ? 'lg:grid-cols-[1fr_1.4fr]' : ''}`}>
        {/* SQL 入力 */}
        <div className="flex flex-col">
          <label className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            入力 SQL
          </label>
          <textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            spellCheck={false}
            className="h-72 w-full resize-y rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4 font-mono text-sm text-[var(--color-head)] outline-none focus:border-[var(--color-accent)]"
          />
          {SHOW_CONVERT ? (
            <button
              onClick={convert}
              disabled={loading || !sql.trim()}
              className="mt-3 self-start rounded-lg bg-[var(--color-accent)] px-5 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-50"
            >
              {loading ? '変換中…' : 'ORM に変換'}
            </button>
          ) : null}
        </div>

        {/* ORM 出力 + 解説（開発時のみ） */}
        {SHOW_CONVERT ? (
          <div className="flex flex-col">
            <label className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Django ORM + 解説
            </label>
            <div className="min-h-[32rem] grow overflow-auto rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
              {error ? (
                <p className="text-sm text-[var(--color-warn)]">{error}</p>
              ) : result ? (
                <div className="space-y-4">
                  <div>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                      Django ORM
                    </div>
                    <pre className="overflow-x-auto rounded-lg bg-[#1e2430] p-3 font-mono text-[13px] leading-relaxed text-[#d7dde8]">
                      {result.orm}
                    </pre>
                  </div>
                  <div>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                      解説
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-ink)]">
                      {result.explanation}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--color-muted)]">
                  左に SQL を入れて「ORM に変換」を押すと、ここに結果が出ます。
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* 入力した SQL をブラウザ内 SQLite（同梱の wms.sqlite）で実行して結果を表示 */}
      <div className="mt-4">
        <SqlRunner sql={sql} />
      </div>

      <p className="mt-6 rounded-lg bg-[var(--color-accent-soft)] px-4 py-3 text-xs text-[var(--color-ink)]">
        実装メモ: SQL 実行は<strong>ブラウザ内の SQLite</strong>（同梱 <code className="font-mono">wms.sqlite</code>）で
        動くため、サーバー・API・キーは不要（読み取り専用・SELECT のみ・最大200行）。
        {SHOW_CONVERT
          ? ' SQL→ORM 変換だけは Django + Claude を使う（開発時のみ）。'
          : ' 本番では SQL→ORM 変換は無効。'}
      </p>
    </div>
  )
}

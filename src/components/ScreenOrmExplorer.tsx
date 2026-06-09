import { useState } from 'react'
import { screenOrmData, screenOrmList, type ScreenOrm } from '../data/screen-orm'

// 画面名 → その画面で使われている ORM/SQL ＋ 使用テーブル・カラム を表示する。
// データは静的（WMS の実コードを読んで事前に整理したもの）。表示に API は呼ばない。

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-[#1e2430] p-3 font-mono text-[13px] leading-relaxed text-[#d7dde8]">
      {children}
    </pre>
  )
}

function findScreen(name: string): ScreenOrm | undefined {
  const q = name.trim()
  if (!q) return undefined
  return (
    screenOrmData.find((s) => s.name === q || s.label === q) ??
    screenOrmData.find((s) => s.name.includes(q) || q.includes(s.name) || s.label.includes(q))
  )
}

export default function ScreenOrmExplorer({ onUseSql }: { onUseSql?: (sql: string) => void }) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ScreenOrm | null>(null)
  const [notFound, setNotFound] = useState(false)

  // 画面を選ぶ（入力欄/チップ）。結果はまだ出さず、「結果を表示」ボタン待ちにする。
  function select(name: string) {
    setInput(name)
    setResult(null)
    setNotFound(false)
  }

  // 「結果を表示」ボタン。選ばれている画面の静的データを表示する（API は呼ばない）。
  function show() {
    const screen = input.trim()
    if (!screen) return
    const hit = findScreen(screen)
    setResult(hit ?? null)
    setNotFound(!hit)
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-[var(--color-head)]">画面から探す</h2>
      <p className="mt-1 text-sm text-[var(--color-ink)]">
        WMS の画面名を選ぶと、その画面で使われている ORM・SQL と、触れているテーブル・カラムを表示します。
        <span className="text-[var(--color-muted)]">
          （WMS の実コードを基に用意した固定データ。表示に API は呼びません）
        </span>
      </p>

      {/* 入力 + 候補チップ */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          list="wms-screens"
          value={input}
          onChange={(e) => select(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') show()
          }}
          placeholder="画面名（例: ピッキング作業）"
          className="w-64 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
        />
        <datalist id="wms-screens">
          {screenOrmList.map((s) => (
            <option key={s.name} value={s.name}>
              {s.label}
            </option>
          ))}
        </datalist>
        <button
          onClick={show}
          disabled={!input.trim()}
          className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-50"
        >
          結果を表示
        </button>
      </div>

      {/* 候補（クリックで選択 → 「結果を表示」で表示） */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {screenOrmList.map((s) => {
          const selected = input.trim() === s.name
          return (
            <button
              key={s.name}
              onClick={() => select(s.name)}
              className={[
                'rounded-full border px-2.5 py-0.5 text-xs transition-colors',
                selected
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] font-medium text-[var(--color-accent)]'
                  : 'border-[var(--color-line)] bg-[var(--color-paper)] text-[var(--color-ink)] hover:bg-[var(--color-mist)]',
              ].join(' ')}
            >
              {s.name}
            </button>
          )
        })}
      </div>

      {notFound ? (
        <p className="mt-4 text-sm text-[var(--color-warn)]">
          その画面は未対応です。候補から選んでください。
        </p>
      ) : null}

      {result ? (
        <div className="mt-5 space-y-6">
          <div className="rounded-lg bg-[var(--color-accent-soft)] px-4 py-2 text-sm text-[var(--color-head)]">
            <strong>{result.label}</strong> で使われている DB アクセス
            <span className="ml-2 font-mono text-xs text-[var(--color-muted)]">{result.source}</span>
          </div>

          {/* 使われている ORM → SQL */}
          <div className="space-y-4">
            {result.queries.map((q, i) => (
              <div
                key={i}
                className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4"
              >
                <div className="mb-2 flex items-baseline gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-semibold text-white">
                    {i + 1}
                  </span>
                  <span className="font-medium text-[var(--color-head)]">{q.purpose}</span>
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  <div>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                      ORM
                    </div>
                    <CodeBlock>{q.orm}</CodeBlock>
                  </div>
                  <div>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                      SQL
                    </div>
                    <CodeBlock>{q.sql}</CodeBlock>
                  </div>
                </div>
                {onUseSql ? (
                  <button
                    onClick={() => onUseSql(q.sql)}
                    className="mt-2 rounded-md border border-[var(--color-line)] bg-[var(--color-paper)] px-2.5 py-1 text-xs text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
                  >
                    ↓ この SQL を下の入力欄へ（編集して実行できます）
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          {/* 使用テーブル・カラム */}
          <div>
            <h3 className="text-base font-semibold text-[var(--color-head)]">使用テーブル・カラム</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {result.tables.map((t) => (
                <div
                  key={t.name}
                  className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)]"
                >
                  <div className="flex flex-wrap items-baseline gap-x-2 border-b border-[var(--color-line)] bg-[var(--color-mist)] px-4 py-2">
                    <code className="font-mono text-sm font-semibold text-[var(--color-head)]">
                      {t.name}
                    </code>
                    <span className="text-xs text-[var(--color-muted)]">model: {t.model}</span>
                  </div>
                  <ul className="divide-y divide-[var(--color-line)]">
                    {t.columns.map((c) => (
                      <li key={c.name} className="flex gap-3 px-4 py-1.5 text-sm">
                        <code className="w-44 shrink-0 font-mono text-[var(--color-accent)]">
                          {c.name}
                        </code>
                        <span className="text-[var(--color-ink)]">{c.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

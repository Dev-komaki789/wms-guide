import type { OrmProblem, OrmQuizSet as QuizSet } from '../data/orm-quiz/types'
import { wmsSchema } from '../data/orm-quiz/schema'
import { keywordGlossary } from '../data/orm-quiz/glossary'

// 各問の SQL から、登場するテーブル名を自動で拾う（手書き不要・SQL に追従）。
const KNOWN_TABLES = [
  ...new Set([
    ...wmsSchema.map((t) => t.table),
    'users',
    'areas',
    'manufacturers',
    'customers',
    'suppliers',
  ]),
]
function tablesFromSql(sql: string): string[] {
  return KNOWN_TABLES.map((t) => ({ t, idx: sql.search(new RegExp(`\\b${t}\\b`)) }))
    .filter((x) => x.idx >= 0)
    .sort((a, b) => a.idx - b.idx)
    .map((x) => x.t)
}

// 題材テーブルの早見表（テーブル名・カラム名）。各セットの先頭に折りたたみで表示する。
function SchemaCheatSheet() {
  return (
    <details className="group mt-5 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)]">
      <summary className="flex cursor-pointer select-none items-center gap-2 px-4 py-3 text-sm font-semibold text-[var(--color-head)] marker:content-['']">
        <span className="inline-block text-[var(--color-accent)] transition-transform group-open:rotate-90">
          ▸
        </span>
        登場するテーブル・カラム早見表（WMS）
      </summary>
      <div className="space-y-3 border-t border-[var(--color-line)] px-4 py-3">
        <p className="text-xs text-[var(--color-muted)]">
          問題で使う主なテーブルです。左がテーブル名（SQL）／カッコ内が ORM のモデル名。「→」は別テーブルへのつながり（FK）。
        </p>
        {wmsSchema.map((t) => (
          <div key={t.table} className="text-sm">
            <div className="font-mono font-semibold text-[var(--color-accent)]">
              {t.table}
              <span className="ml-2 font-sans text-xs font-normal text-[var(--color-muted)]">
                {t.model}
              </span>
            </div>
            <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
              {t.columns.map((c) => (
                <span key={c.name} className="font-mono text-xs text-[var(--color-ink)]">
                  {c.name}
                  {c.note ? (
                    <span className="font-sans text-[var(--color-muted)]">（{c.note}）</span>
                  ) : null}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </details>
  )
}

// 「Django ORM 問題集」の1セットを描画する。
// 各問は 問題文 → ヒント → ［答えを見る］で開く（ORM｜SQL の2カラム ＋ 解説）。

function CodeBlock({ children, label }: { children: string; label: string }) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
        {label}
      </div>
      <pre className="overflow-x-auto rounded-lg bg-[#1e2430] p-3 font-mono text-[13px] leading-relaxed text-[#d7dde8]">
        {children}
      </pre>
    </div>
  )
}

function Problem({ problem, num }: { problem: OrmProblem; num: number }) {
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-5">
      <div className="flex items-baseline gap-2">
        <span className="shrink-0 rounded-md bg-[var(--color-accent-soft)] px-2 py-0.5 text-sm font-bold text-[var(--color-accent)]">
          問題 {num}
        </span>
      </div>
      <p className="mt-2 leading-relaxed text-[var(--color-head)]">{problem.question}</p>

      {(() => {
        const tables = tablesFromSql(problem.sql)
        return tables.length ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-muted)]">
            <span>使うテーブル：</span>
            {tables.map((t) => (
              <span
                key={t}
                className="rounded bg-[var(--color-mist)] px-2 py-0.5 font-mono text-[var(--color-accent)]"
              >
                {t}
              </span>
            ))}
            <span className="text-[var(--color-muted)]">（カラムは上部の早見表を参照）</span>
          </div>
        ) : null
      })()}

      {problem.hint ? (
        <p className="mt-2 text-sm text-[var(--color-muted)]">💡 ヒント：{problem.hint}</p>
      ) : null}

      <details className="group mt-3">
        <summary className="inline-flex cursor-pointer select-none items-center gap-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-mist)] px-3 py-1.5 text-sm font-medium text-[var(--color-accent)] transition-colors hover:border-[var(--color-accent)] marker:content-['']">
          <span className="inline-block transition-transform group-open:rotate-90">▸</span>
          答えと SQL を見る
        </summary>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <CodeBlock label="Django ORM">{problem.orm}</CodeBlock>
          <CodeBlock label="SQL">{problem.sql}</CodeBlock>
        </div>

        <div className="mt-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-mist)] px-4 py-3">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            使われている技術の解説
          </div>
          {problem.explanation.map((p, i) => (
            <p key={i} className="mt-1 text-sm leading-relaxed text-[var(--color-ink)]">
              {p}
            </p>
          ))}
          {problem.points?.length ? (
            <div className="mt-3 border-t border-[var(--color-line)] pt-2">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                キーワード
              </div>
              <dl className="space-y-1">
                {problem.points.map((pt) => {
                  const meaning = keywordGlossary[pt]
                  return (
                    <div key={pt} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                      <dt className="shrink-0 rounded bg-[var(--color-paper)] px-2 py-0.5 font-mono text-xs font-semibold text-[var(--color-accent)]">
                        {pt}
                      </dt>
                      {meaning ? (
                        <dd className="text-[var(--color-ink)]">{meaning}</dd>
                      ) : null}
                    </div>
                  )
                })}
              </dl>
            </div>
          ) : null}
        </div>
      </details>
    </div>
  )
}

export default function OrmQuizSet({ set }: { set: QuizSet }) {
  return (
    <article>
      <header className="border-b border-[var(--color-line)] pb-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]">
          <span>セット {set.num}</span>
          {set.level ? (
            <span className="rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-xs">
              {set.level}
            </span>
          ) : null}
        </div>
        <h1 className="mt-1 text-2xl font-bold text-[var(--color-head)]">{set.title}</h1>
        <p className="mt-2 text-[var(--color-ink)]">{set.summary}</p>
      </header>

      {set.intro?.length ? (
        <div className="mt-5 space-y-3">
          {set.intro.map((p, i) => (
            <p key={i} className="leading-relaxed text-[var(--color-ink)]">
              {p}
            </p>
          ))}
        </div>
      ) : null}

      <SchemaCheatSheet />

      <div className="mt-8 space-y-5">
        {set.problems.map((p, i) => (
          <Problem key={i} problem={p} num={i + 1} />
        ))}
      </div>
    </article>
  )
}

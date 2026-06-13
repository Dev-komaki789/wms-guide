import type { OrmProblem, OrmQuizSet as QuizSet } from '../data/orm-quiz/types'

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
            <div className="mt-2 flex flex-wrap gap-1.5">
              {problem.points.map((pt) => (
                <span
                  key={pt}
                  className="rounded-full bg-[var(--color-paper)] px-2 py-0.5 font-mono text-xs text-[var(--color-accent)]"
                >
                  {pt}
                </span>
              ))}
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

      <div className="mt-8 space-y-5">
        {set.problems.map((p, i) => (
          <Problem key={i} problem={p} num={i + 1} />
        ))}
      </div>
    </article>
  )
}

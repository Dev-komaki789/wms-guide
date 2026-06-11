import Mermaid from './Mermaid'
import type { ReactChapter, ReactExample, ReactSection } from '../data/react-book/types'

// 「React 大全」の1章を描画する。
// 各節は 本文 → コード例（コード/見え方/解説）→ 表 → 図 → 注意囲み の順に出す。

function CodeBlock({ children, label }: { children: string; label?: string }) {
  return (
    <div>
      {label ? (
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          {label}
        </div>
      ) : null}
      <pre className="overflow-x-auto rounded-lg bg-[#1e2430] p-3 font-mono text-[13px] leading-relaxed text-[#d7dde8]">
        {children}
      </pre>
    </div>
  )
}

function Example({ ex }: { ex: ReactExample }) {
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
      <CodeBlock label={ex.lang ?? 'tsx'}>{ex.code}</CodeBlock>
      {ex.result ? (
        <div className="mt-3">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            画面での見え方 / 出力
          </div>
          <div className="rounded-lg border border-dashed border-[var(--color-line)] bg-[var(--color-mist)] px-3 py-2 font-mono text-[13px] leading-relaxed text-[var(--color-head)] whitespace-pre-wrap">
            {ex.result}
          </div>
        </div>
      ) : null}
      {ex.note ? (
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink)]">{ex.note}</p>
      ) : null}
    </div>
  )
}

const calloutStyle: Record<string, { box: string; label: string; icon: string }> = {
  tip: {
    box: 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]',
    label: 'ヒント',
    icon: '💡',
  },
  warn: {
    box: 'border-[var(--color-warn)] bg-[color-mix(in_srgb,var(--color-warn)_12%,transparent)]',
    label: '注意',
    icon: '⚠️',
  },
  note: {
    box: 'border-[var(--color-line)] bg-[var(--color-mist)]',
    label: 'メモ',
    icon: '📝',
  },
}

function Section({ section }: { section: ReactSection }) {
  return (
    <section id={section.id} className="scroll-mt-20">
      <h2 className="text-xl font-bold text-[var(--color-head)]">{section.heading}</h2>

      {section.body?.map((p, i) => (
        <p key={i} className="mt-3 leading-relaxed text-[var(--color-ink)]">
          {p}
        </p>
      ))}

      {section.examples?.length ? (
        <div className="mt-4 space-y-3">
          {section.examples.map((ex, i) => (
            <Example key={i} ex={ex} />
          ))}
        </div>
      ) : null}

      {section.table ? (
        <div className="mt-4 overflow-auto rounded-lg border border-[var(--color-line)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-mist)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <tr>
                {section.table.headers.map((h) => (
                  <th key={h} className="px-3 py-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {section.table.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={
                        j === 0
                          ? 'px-3 py-1.5 text-[var(--color-head)]'
                          : 'px-3 py-1.5 font-mono text-[13px] text-[var(--color-accent)]'
                      }
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {section.mermaid ? (
        <div className="mt-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
          <Mermaid chart={section.mermaid} />
        </div>
      ) : null}

      {section.callouts?.map((c, i) => {
        const s = calloutStyle[c.kind]
        return (
          <div key={i} className={`mt-4 rounded-lg border px-4 py-3 text-sm leading-relaxed ${s.box}`}>
            <span className="mr-1">{s.icon}</span>
            <span className="font-semibold text-[var(--color-head)]">{s.label}：</span>
            <span className="text-[var(--color-ink)]">{c.text}</span>
          </div>
        )
      })}
    </section>
  )
}

export default function ReactBookChapter({ chapter }: { chapter: ReactChapter }) {
  return (
    <article>
      <header className="border-b border-[var(--color-line)] pb-4">
        <div className="text-sm font-semibold text-[var(--color-accent)]">第{chapter.num}章</div>
        <h1 className="mt-1 text-2xl font-bold text-[var(--color-head)]">{chapter.title}</h1>
        <p className="mt-2 text-[var(--color-ink)]">{chapter.summary}</p>
      </header>

      {chapter.intro?.length ? (
        <div className="mt-5 space-y-3">
          {chapter.intro.map((p, i) => (
            <p key={i} className="leading-relaxed text-[var(--color-ink)]">
              {p}
            </p>
          ))}
        </div>
      ) : null}

      <div className="mt-8 space-y-10">
        {chapter.sections.map((s, i) => (
          <Section key={s.id ?? i} section={s} />
        ))}
      </div>
    </article>
  )
}

import Mermaid from './Mermaid'
import type { EcChapter, EcExample, EcSection } from '../data/ec-code/types'

// 「EC コード解説」の1章を描画する。
// コード抜粋には「どのファイルか」のラベルを付ける。ライブ実行はしない（実コードは単体では動かないため）。

function CodeBlock({ children, file, lang }: { children: string; file?: string; lang?: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-[var(--color-muted)]">
        {file ? (
          <span className="rounded bg-[var(--color-mist)] px-2 py-0.5 font-mono text-[var(--color-accent)]">
            {file}
          </span>
        ) : null}
        <span className="uppercase tracking-wide">{lang ?? 'tsx'}</span>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-[#1e2430] p-3 font-mono text-[13px] leading-relaxed text-[#d7dde8]">
        {children}
      </pre>
    </div>
  )
}

function Example({ ex }: { ex: EcExample }) {
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
      <CodeBlock file={ex.file} lang={ex.lang}>
        {ex.code}
      </CodeBlock>
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

function Section({ section }: { section: EcSection }) {
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

export default function EcCodeChapter({ chapter }: { chapter: EcChapter }) {
  return (
    <article>
      <header className="border-b border-[var(--color-line)] pb-4">
        <div className="text-sm font-semibold text-[var(--color-accent)]">EC コード解説 ＃{chapter.num}</div>
        <h1 className="mt-1 text-2xl font-bold text-[var(--color-head)]">{chapter.title}</h1>
        <p className="mt-2 text-[var(--color-ink)]">{chapter.summary}</p>
        {chapter.relatedReact?.length ? (
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            関連（React 大全）：{chapter.relatedReact.join(' / ')}
          </p>
        ) : null}
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

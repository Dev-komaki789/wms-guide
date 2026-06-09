import type { ScreenDoc } from '../data/types'
import Mermaid from './Mermaid'
import CodeSnippet from './CodeSnippet'

// 画面解説1ページのテンプレート描画。新しい画面を足すときは ScreenDoc を1つ書くだけで
// このレイアウトに乗る。

function Section({
  no,
  title,
  children,
}: {
  no: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-8">
      <h2 className="flex items-baseline gap-2 text-lg font-semibold text-[var(--color-head)]">
        <span className="text-sm font-mono text-[var(--color-muted)]">{no}</span>
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-[var(--color-mist)] px-1.5 py-0.5 font-mono text-[0.85em] text-[var(--color-head)]">
      {children}
    </code>
  )
}

/** ラベル付きの Mermaid 図カード。フロー図・シーケンス図・状態遷移図で共用。 */
function DiagramCard({ label, chart }: { label: string; chart: string }) {
  return (
    <div className="mt-5 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
      <div className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
        {label}
      </div>
      <Mermaid chart={chart} />
    </div>
  )
}

export default function ScreenDocView({ doc }: { doc: ScreenDoc }) {
  return (
    <article className="mx-auto max-w-3xl">
      {/* 画面名 / 用途 */}
      <header className="border-b border-[var(--color-line)] pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent)]">
            {doc.category}
          </span>
          {doc.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-[var(--color-mist)] px-2.5 py-0.5 text-xs text-[var(--color-muted)]"
            >
              {t}
            </span>
          ))}
        </div>
        <h1 className="mt-3 text-2xl font-bold text-[var(--color-head)]">{doc.title}</h1>
        <p className="mt-2 text-[var(--color-ink)]">{doc.purpose}</p>
      </header>

      {/* スクリーンショット（任意） */}
      {doc.screenshot ? (
        <Section no="—" title="スクリーンショット">
          <img
            src={doc.screenshot}
            alt={`${doc.title} のスクリーンショット`}
            className="rounded-xl border border-[var(--color-line)]"
          />
        </Section>
      ) : null}

      {/* 表示されるデータ */}
      <Section no="01" title="表示されるデータ">
        <ul className="divide-y divide-[var(--color-line)] overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)]">
          {doc.displayedData.map((d) => (
            <li key={d.label} className="px-4 py-3">
              <div className="font-medium text-[var(--color-head)]">{d.label}</div>
              <div className="mt-0.5 text-sm text-[var(--color-ink)]">{d.desc}</div>
            </li>
          ))}
        </ul>
      </Section>

      {/* 処理の流れ + 各ステップの実コード + 図（フロー / シーケンス / 状態遷移） */}
      <Section no="02" title="処理の流れ">
        <ol className="space-y-3">
          {doc.flowSteps.map((s) => (
            <li
              key={s.no}
              className="flex gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-semibold text-white">
                {s.no}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-[var(--color-head)]">{s.title}</div>
                <div className="mt-0.5 text-sm text-[var(--color-ink)]">{s.detail}</div>
                {s.ref ? (
                  <div className="mt-1.5 text-xs">
                    <Code>{s.ref}</Code>
                  </div>
                ) : null}
                {s.code ? (
                  <CodeSnippet path={s.code.path} lines={s.code.lines} notes={s.code.notes} />
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        <DiagramCard label="フロー図（Mermaid）" chart={doc.mermaid} />
        {doc.sequenceMermaid ? (
          <DiagramCard label="シーケンス図（誰が誰を呼ぶか）" chart={doc.sequenceMermaid} />
        ) : null}
        {doc.stateMermaid ? (
          <DiagramCard label="状態遷移図（ステータスの移り変わり）" chart={doc.stateMermaid} />
        ) : null}
      </Section>

      {/* 関連ファイル・関数（「コードを見る」で実コードを ~/projects/wms/ から表示） */}
      <Section no="03" title="関連ファイル・関数">
        <p className="-mt-1 mb-3 text-xs text-[var(--color-muted)]">
          「コードを見る」は dev サーバー経由で <Code>~/projects/wms/</Code> の該当行をその場で読み込みます
          （wms-guide にコードは複製していません）。
        </p>
        <ul className="space-y-3">
          {doc.relatedFiles.map((f, i) => (
            <li
              key={i}
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4"
            >
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <Code>{f.path}</Code>
                {f.symbol ? <Code>{f.symbol}</Code> : null}
              </div>
              <div className="mt-1.5 text-sm text-[var(--color-ink)]">{f.role}</div>
              {f.lines ? <CodeSnippet path={f.path} lines={f.lines} /> : null}
            </li>
          ))}
        </ul>
      </Section>

      {/* 用語集（任意） */}
      {doc.glossary && doc.glossary.length > 0 ? (
        <Section no="04" title="用語">
          <dl className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)]">
            {doc.glossary.map((g) => (
              <div
                key={g.term}
                className="flex flex-col gap-1 border-b border-[var(--color-line)] px-4 py-3 last:border-b-0 sm:flex-row sm:gap-4"
              >
                <dt className="shrink-0 sm:w-48">
                  <Code>{g.term}</Code>
                </dt>
                <dd className="text-sm text-[var(--color-ink)]">{g.desc}</dd>
              </div>
            ))}
          </dl>
        </Section>
      ) : null}

      {/* 補足 */}
      <Section no={doc.glossary && doc.glossary.length > 0 ? '05' : '04'} title="補足">
        <ul className="space-y-2">
          {doc.notes.map((n, i) => (
            <li
              key={i}
              className="flex gap-2 rounded-lg bg-[var(--color-paper)] px-4 py-2.5 text-sm text-[var(--color-ink)] ring-1 ring-[var(--color-line)]"
            >
              <span className="text-[var(--color-accent)]">▸</span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
      </Section>
    </article>
  )
}

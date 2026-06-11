import { Link } from 'react-router-dom'
import { ecChapters, ecOutline } from '../data/ec-code'

// 「EC コード解説」の目次（/ec）。執筆済みはリンク、未執筆は「準備中」。
export default function EcCodePage() {
  const writtenById = new Map(ecChapters.map((c) => [c.num, c]))

  return (
    <div className="mx-auto max-w-3xl">
      <header className="border-b border-[var(--color-line)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--color-head)]">EC コード解説</h1>
        <p className="mt-2 leading-relaxed text-[var(--color-ink)]">
          「React 大全」で学んだ知識を使って、実際の EC サイト（React + TypeScript）のコードを
          一緒に読み解いていきます。各回は「実コードの抜粋 → やさしい解説」で、どのファイルの
          どこを見ているかを示します。先に React 大全をひととおり眺めてから読むと、すっと入って
          きます。
        </p>
      </header>

      <ol className="mt-6 space-y-2">
        {ecOutline.map((entry) => {
          const written = writtenById.get(entry.num)
          if (written) {
            return (
              <li key={entry.num}>
                <Link
                  to={`/ec/${written.id}`}
                  className="flex items-baseline gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
                >
                  <span className="shrink-0 font-mono text-sm font-semibold text-[var(--color-accent)]">
                    ＃{entry.num}
                  </span>
                  <span className="font-medium text-[var(--color-head)]">{written.title}</span>
                </Link>
              </li>
            )
          }
          return (
            <li
              key={entry.num}
              className="flex items-baseline gap-3 rounded-lg border border-dashed border-[var(--color-line)] px-4 py-3 opacity-60"
            >
              <span className="shrink-0 font-mono text-sm font-semibold text-[var(--color-muted)]">
                ＃{entry.num}
              </span>
              <span className="text-[var(--color-ink)]">{entry.title}</span>
              <span className="ml-auto shrink-0 rounded-full bg-[var(--color-mist)] px-2 py-0.5 text-xs text-[var(--color-muted)]">
                準備中
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

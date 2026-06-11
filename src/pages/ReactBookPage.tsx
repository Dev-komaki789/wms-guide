import { Link } from 'react-router-dom'
import { reactChapters, reactOutline } from '../data/react-book'

// 「React 大全」の目次（/react）。執筆済みの章はリンク、未執筆は「準備中」表示。
export default function ReactBookPage() {
  const writtenById = new Map(reactChapters.map((c) => [c.num, c]))

  return (
    <div className="mx-auto max-w-3xl">
      <header className="border-b border-[var(--color-line)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--color-head)]">React 大全</h1>
        <p className="mt-2 leading-relaxed text-[var(--color-ink)]">
          React を、プログラミング初心者でも分かるようにやさしくまとめた入門リファレンスです。各項目は
          「コード → 画面での見え方 → やさしい解説」の3点セット。題材はあえて最小の汎用例（カウンタや
          かんたんな一覧）で統一しています。ここで React の考え方をつかんでから、別セクションの「EC
          コード解説」で実際のコードを読み解くと理解しやすくなります。
        </p>
      </header>

      <ol className="mt-6 space-y-2">
        {reactOutline.map((entry) => {
          const written = writtenById.get(entry.num)
          if (written) {
            return (
              <li key={entry.num}>
                <Link
                  to={`/react/${written.id}`}
                  className="flex items-baseline gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
                >
                  <span className="shrink-0 font-mono text-sm font-semibold text-[var(--color-accent)]">
                    第{entry.num}章
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
                第{entry.num}章
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

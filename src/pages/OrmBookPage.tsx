import { Link } from 'react-router-dom'
import { ormChapters, ormOutline } from '../data/orm-book'

// 「Django ORM 大全」の目次（/orm）。執筆済みの章はリンク、未執筆は「準備中」表示。
export default function OrmBookPage() {
  const writtenById = new Map(ormChapters.map((c) => [c.num, c]))

  return (
    <div className="mx-auto max-w-3xl">
      <header className="border-b border-[var(--color-line)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--color-head)]">Django ORM 大全</h1>
        <p className="mt-2 leading-relaxed text-[var(--color-ink)]">
          Django の ORM の書き方を、基礎から応用まで一冊にまとめたリファレンスです。各項目は
          「ORM のコード → 生成される SQL → やさしい解説」の3点セットで、題材は WMS の実モデル
          （PickingList / StockBalance など）で統一しています。
        </p>
      </header>

      <ol className="mt-6 space-y-2">
        {ormOutline.map((entry) => {
          const written = writtenById.get(entry.num)
          if (written) {
            return (
              <li key={entry.num}>
                <Link
                  to={`/orm/${written.id}`}
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

import { Link, useParams } from 'react-router-dom'
import OrmBookChapter from '../components/OrmBookChapter'
import { getChapter, ormChapters } from '../data/orm-book'

// 「Django ORM 大全」の1章ページ（/orm/:chapterId）。前後の章・目次への導線つき。
export default function OrmChapterPage() {
  const { chapterId } = useParams()
  const chapter = chapterId ? getChapter(chapterId) : undefined

  if (!chapter) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-[var(--color-ink)]">その章は見つかりませんでした（準備中かもしれません）。</p>
        <Link to="/orm" className="mt-3 inline-block text-sm font-medium text-[var(--color-accent)]">
          ← 目次へ戻る
        </Link>
      </div>
    )
  }

  const idx = ormChapters.findIndex((c) => c.id === chapter.id)
  const prev = idx > 0 ? ormChapters[idx - 1] : undefined
  const next = idx < ormChapters.length - 1 ? ormChapters[idx + 1] : undefined

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/orm" className="text-sm font-medium text-[var(--color-accent)]">
        ← Django ORM 大全（目次）
      </Link>

      <div className="mt-4">
        <OrmBookChapter chapter={chapter} />
      </div>

      <nav className="mt-12 flex flex-col gap-3 border-t border-[var(--color-line)] pt-5 sm:flex-row">
        {prev ? (
          <Link
            to={`/orm/${prev.id}`}
            className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 transition-colors hover:border-[var(--color-accent)]"
          >
            <div className="text-xs text-[var(--color-muted)]">← 前の章</div>
            <div className="mt-0.5 text-sm font-medium text-[var(--color-head)]">
              第{prev.num}章 {prev.title}
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {next ? (
          <Link
            to={`/orm/${next.id}`}
            className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 text-right transition-colors hover:border-[var(--color-accent)]"
          >
            <div className="text-xs text-[var(--color-muted)]">次の章 →</div>
            <div className="mt-0.5 text-sm font-medium text-[var(--color-head)]">
              第{next.num}章 {next.title}
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </nav>
    </div>
  )
}

import { Link, useParams } from 'react-router-dom'
import ReactBookChapter from '../components/ReactBookChapter'
import { getTodoChapter, todoChapters } from '../data/todo-book'

// 「ToDo アプリ実践」編の1章ページ（/todo/:chapterId）。前後の章・目次への導線つき。
// 章フォーマットは「React 大全」と同じなので、描画は ReactBookChapter を再利用する。
export default function TodoChapterPage() {
  const { chapterId } = useParams()
  const chapter = chapterId ? getTodoChapter(chapterId) : undefined

  if (!chapter) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-[var(--color-ink)]">その章は見つかりませんでした（準備中かもしれません）。</p>
        <Link to="/todo" className="mt-3 inline-block text-sm font-medium text-[var(--color-accent)]">
          ← 目次へ戻る
        </Link>
      </div>
    )
  }

  const idx = todoChapters.findIndex((c) => c.id === chapter.id)
  const prev = idx > 0 ? todoChapters[idx - 1] : undefined
  const next = idx < todoChapters.length - 1 ? todoChapters[idx + 1] : undefined

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/todo" className="text-sm font-medium text-[var(--color-accent)]">
        ← ToDo アプリ実践（目次）
      </Link>

      <div className="mt-4">
        <ReactBookChapter chapter={chapter} />
      </div>

      <nav className="mt-12 flex flex-col gap-3 border-t border-[var(--color-line)] pt-5 sm:flex-row">
        {prev ? (
          <Link
            to={`/todo/${prev.id}`}
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
            to={`/todo/${next.id}`}
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

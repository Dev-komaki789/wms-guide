import { Link, useParams } from 'react-router-dom'
import OrmQuizSet from '../components/OrmQuizSet'
import { getQuizSet, ormQuizSets } from '../data/orm-quiz'

// 「Django ORM 問題集」の1セットページ（/orm-quiz/:setId）。前後・目次への導線つき。
export default function OrmQuizSetPage() {
  const { setId } = useParams()
  const set = setId ? getQuizSet(setId) : undefined

  if (!set) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-[var(--color-ink)]">そのセットは見つかりませんでした（準備中かもしれません）。</p>
        <Link to="/orm-quiz" className="mt-3 inline-block text-sm font-medium text-[var(--color-accent)]">
          ← 目次へ戻る
        </Link>
      </div>
    )
  }

  const idx = ormQuizSets.findIndex((s) => s.id === set.id)
  const prev = idx > 0 ? ormQuizSets[idx - 1] : undefined
  const next = idx < ormQuizSets.length - 1 ? ormQuizSets[idx + 1] : undefined

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/orm-quiz" className="text-sm font-medium text-[var(--color-accent)]">
        ← Django ORM 問題集（目次）
      </Link>

      <div className="mt-4">
        <OrmQuizSet set={set} />
      </div>

      <nav className="mt-12 flex gap-3 border-t border-[var(--color-line)] pt-5">
        {prev ? (
          <Link
            to={`/orm-quiz/${prev.id}`}
            className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 transition-colors hover:border-[var(--color-accent)]"
          >
            <div className="text-xs text-[var(--color-muted)]">← 前のセット</div>
            <div className="mt-0.5 text-sm font-medium text-[var(--color-head)]">
              セット{prev.num} {prev.title}
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {next ? (
          <Link
            to={`/orm-quiz/${next.id}`}
            className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 text-right transition-colors hover:border-[var(--color-accent)]"
          >
            <div className="text-xs text-[var(--color-muted)]">次のセット →</div>
            <div className="mt-0.5 text-sm font-medium text-[var(--color-head)]">
              セット{next.num} {next.title}
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </nav>
    </div>
  )
}

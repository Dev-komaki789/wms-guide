import { Link } from 'react-router-dom'
import { ormQuizSets, ormQuizOutline } from '../data/orm-quiz'

// 「Django ORM 問題集」の目次（/orm-quiz）。執筆済みはリンク、未執筆は「準備中」。
export default function OrmQuizPage() {
  const writtenByNum = new Map(ormQuizSets.map((s) => [s.num, s]))
  const total = ormQuizSets.reduce((n, s) => n + s.problems.length, 0)

  return (
    <div className="mx-auto max-w-3xl">
      <header className="border-b border-[var(--color-line)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--color-head)]">Django ORM 問題集</h1>
        <p className="mt-2 leading-relaxed text-[var(--color-ink)]">
          「やりたいこと」を読んで、まず自分で ORM を考えてみる練習帳です。答えは
          ［答えと SQL を見る］を押すと、左に Django ORM・右に生成される SQL の形で開きます。
          あわせて「使われている技術」をやさしく解説します。題材は ORM 大全と同じ WMS の
          実モデル（StockBalance / PickingList など）。今ぜんぶで {total} 問。
        </p>
      </header>

      <ol className="mt-6 space-y-2">
        {ormQuizOutline.map((entry) => {
          const written = writtenByNum.get(entry.num)
          if (written) {
            return (
              <li key={entry.num}>
                <Link
                  to={`/orm-quiz/${written.id}`}
                  className="flex items-baseline gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
                >
                  <span className="shrink-0 font-mono text-sm font-semibold text-[var(--color-accent)]">
                    セット{entry.num}
                  </span>
                  <span className="font-medium text-[var(--color-head)]">{written.title}</span>
                  <span className="ml-auto shrink-0 text-xs text-[var(--color-muted)]">
                    {written.problems.length}問{written.level ? ` ・ ${written.level}` : ''}
                  </span>
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
                セット{entry.num}
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

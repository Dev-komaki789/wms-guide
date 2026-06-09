import { Link } from 'react-router-dom'
import { techNotes } from '../data/tech-notes'

// 「WMS 技術メモ」の目次（/tech）。
export default function TechNotesPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="border-b border-[var(--color-line)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--color-head)]">WMS 技術メモ</h1>
        <p className="mt-2 leading-relaxed text-[var(--color-ink)]">
          WMS を作るのに実際に使ったライブラリ・API・実装のしくみを、実コードに基づいて
          初心者向けに紹介します。「ピッキングリストはどう作るのか」「カメラでバーコードを
          どう読んだのか」など、画面の裏側をのぞいてみましょう。
        </p>
      </header>

      <ol className="mt-6 space-y-2">
        {techNotes.map((n) => (
          <li key={n.id}>
            <Link
              to={`/tech/${n.id}`}
              className="flex items-baseline gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
            >
              <span className="shrink-0 font-mono text-sm font-semibold text-[var(--color-accent)]">
                技術メモ{n.num}
              </span>
              <span className="font-medium text-[var(--color-head)]">{n.title}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}

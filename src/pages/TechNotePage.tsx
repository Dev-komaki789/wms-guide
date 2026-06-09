import { Link, useParams } from 'react-router-dom'
import TechNoteView from '../components/TechNoteView'
import { getTechNote, techNotes } from '../data/tech-notes'

// 「WMS 技術メモ」の1本ページ（/tech/:noteId）。前後・目次への導線つき。
export default function TechNotePage() {
  const { noteId } = useParams()
  const note = noteId ? getTechNote(noteId) : undefined

  if (!note) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-[var(--color-ink)]">そのメモは見つかりませんでした。</p>
        <Link to="/tech" className="mt-3 inline-block text-sm font-medium text-[var(--color-accent)]">
          ← 目次へ戻る
        </Link>
      </div>
    )
  }

  const idx = techNotes.findIndex((n) => n.id === note.id)
  const prev = idx > 0 ? techNotes[idx - 1] : undefined
  const next = idx < techNotes.length - 1 ? techNotes[idx + 1] : undefined

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/tech" className="text-sm font-medium text-[var(--color-accent)]">
        ← WMS 技術メモ（目次）
      </Link>

      <div className="mt-4">
        <TechNoteView note={note} />
      </div>

      <nav className="mt-12 flex gap-3 border-t border-[var(--color-line)] pt-5">
        {prev ? (
          <Link
            to={`/tech/${prev.id}`}
            className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 transition-colors hover:border-[var(--color-accent)]"
          >
            <div className="text-xs text-[var(--color-muted)]">← 前へ</div>
            <div className="mt-0.5 text-sm font-medium text-[var(--color-head)]">{prev.title}</div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {next ? (
          <Link
            to={`/tech/${next.id}`}
            className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 text-right transition-colors hover:border-[var(--color-accent)]"
          >
            <div className="text-xs text-[var(--color-muted)]">次へ →</div>
            <div className="mt-0.5 text-sm font-medium text-[var(--color-head)]">{next.title}</div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </nav>
    </div>
  )
}

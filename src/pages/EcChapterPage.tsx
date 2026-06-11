import { Link, useParams } from 'react-router-dom'
import EcCodeChapter from '../components/EcCodeChapter'
import { getEcChapter, ecChapters } from '../data/ec-code'

// 「EC コード解説」の1章ページ（/ec/:chapterId）。前後・目次への導線つき。
export default function EcChapterPage() {
  const { chapterId } = useParams()
  const chapter = chapterId ? getEcChapter(chapterId) : undefined

  if (!chapter) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-[var(--color-ink)]">その回は見つかりませんでした（準備中かもしれません）。</p>
        <Link to="/ec" className="mt-3 inline-block text-sm font-medium text-[var(--color-accent)]">
          ← 目次へ戻る
        </Link>
      </div>
    )
  }

  const idx = ecChapters.findIndex((c) => c.id === chapter.id)
  const prev = idx > 0 ? ecChapters[idx - 1] : undefined
  const next = idx < ecChapters.length - 1 ? ecChapters[idx + 1] : undefined

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/ec" className="text-sm font-medium text-[var(--color-accent)]">
        ← EC コード解説（目次）
      </Link>

      <div className="mt-4">
        <EcCodeChapter chapter={chapter} />
      </div>

      <nav className="mt-12 flex gap-3 border-t border-[var(--color-line)] pt-5">
        {prev ? (
          <Link
            to={`/ec/${prev.id}`}
            className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 transition-colors hover:border-[var(--color-accent)]"
          >
            <div className="text-xs text-[var(--color-muted)]">← 前へ</div>
            <div className="mt-0.5 text-sm font-medium text-[var(--color-head)]">
              ＃{prev.num} {prev.title}
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {next ? (
          <Link
            to={`/ec/${next.id}`}
            className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 text-right transition-colors hover:border-[var(--color-accent)]"
          >
            <div className="text-xs text-[var(--color-muted)]">次へ →</div>
            <div className="mt-0.5 text-sm font-medium text-[var(--color-head)]">
              ＃{next.num} {next.title}
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </nav>
    </div>
  )
}

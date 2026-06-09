import { Link, useParams } from 'react-router-dom'
import { screensById } from '../data/screens'
import ScreenDocView from '../components/ScreenDocView'

export default function ScreenPage() {
  const { screenId } = useParams()
  const doc = screenId ? screensById[screenId] : undefined

  if (!doc) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-[var(--color-ink)]">
          画面「{screenId}」は未作成です。
          <Link to="/" className="ml-1 text-[var(--color-accent)] underline">
            目次へ戻る
          </Link>
        </p>
      </div>
    )
  }

  return <ScreenDocView doc={doc} />
}

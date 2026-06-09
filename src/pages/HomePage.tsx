import { Link } from 'react-router-dom'
import { screens } from '../data/screens'

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--color-head)]">WMS Guide</h1>
      <p className="mt-2 text-[var(--color-ink)]">
        自分で作った WMS（倉庫管理システム）を、画面ごとに「どんなデータが・どの機能で・どの順番で」
        処理されるかを図解つきで読み解くための学習サイト。本体コードは持たず
        <code className="mx-1 rounded bg-[var(--color-mist)] px-1.5 py-0.5 font-mono text-sm">
          ~/projects/wms/
        </code>
        を読んで解説しています。
      </p>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
        画面解説（テンプレ試作中）
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {screens.map((s) => (
          <Link
            key={s.id}
            to={`/screen/${s.id}`}
            className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4 transition-shadow hover:shadow-sm"
          >
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-xs font-medium text-[var(--color-accent)]">
                {s.category}
              </span>
            </div>
            <div className="mt-2 font-medium text-[var(--color-head)]">{s.title}</div>
            <div className="mt-1 text-sm text-[var(--color-ink)]">{s.purpose}</div>
          </Link>
        ))}
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
        ツール
      </h2>
      <Link
        to="/sql-to-orm"
        className="mt-3 block rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4 transition-shadow hover:shadow-sm"
      >
        <div className="font-medium text-[var(--color-head)]">SQL → Django ORM 変換</div>
        <div className="mt-1 text-sm text-[var(--color-ink)]">
          SQL を貼ると Django ORM と「なぜそうなるか」の解説を返す（Claude haiku）。
        </div>
      </Link>
    </div>
  )
}

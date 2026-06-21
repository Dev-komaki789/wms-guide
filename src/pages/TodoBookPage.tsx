import { Link } from 'react-router-dom'
import { todoChapters, todoOutline } from '../data/todo-book'

// 「ToDo アプリ実践」編の目次（/todo）。執筆済みの章はリンク、未執筆は「準備中」表示。
export default function TodoBookPage() {
  const writtenById = new Map(todoChapters.map((c) => [c.num, c]))

  return (
    <div className="mx-auto max-w-3xl">
      <header className="border-b border-[var(--color-line)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--color-head)]">ToDo アプリ実践</h1>
        <p className="mt-2 leading-relaxed text-[var(--color-ink)]">
          よくある練習課題「TODO アプリ」を題材に、React の作り方を一から組み立てる実践ガイドです。1章ごとに
          「ひとつだけ新しいこと」を足していき、入力 → 追加 → 完了 → 削除と動くものを育てます。各章には実際に動く
          ライブプレビュー付き。第10章で React 版が完成したら、第11〜12章で同じものを TypeScript（型つき）に
          書き直します。「React 大全」で考え方をつかんでから読むと、より理解が深まります。
        </p>
      </header>

      <ol className="mt-6 space-y-2">
        {todoOutline.map((entry) => {
          const written = writtenById.get(entry.num)
          if (written) {
            return (
              <li key={entry.num}>
                <Link
                  to={`/todo/${written.id}`}
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

import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { screens } from './data/screens'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'block rounded-lg px-3 py-2 text-sm transition-colors',
    isActive
      ? 'bg-[var(--color-accent-soft)] font-medium text-[var(--color-accent)]'
      : 'text-[var(--color-ink)] hover:bg-[var(--color-mist)]',
  ].join(' ')

const groupLabelClass =
  'px-2 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] first:pt-2'

function SidebarNav() {
  return (
    <nav className="px-3 pb-6">
      <div className={groupLabelClass}>ページA: 画面解説</div>
      {screens.map((s) => (
        <NavLink key={s.id} to={`/screen/${s.id}`} className={navLinkClass}>
          {s.title}
        </NavLink>
      ))}

      <div className={groupLabelClass}>ページB: ツール</div>
      <NavLink to="/sql-to-orm" className={navLinkClass}>
        SQL → Django ORM 変換
      </NavLink>

      <div className={groupLabelClass}>学習メモ</div>
      <NavLink to="/django-basics" className={navLinkClass}>
        ① Django 入門（在庫照会を一から）
      </NavLink>
      <NavLink to="/django-crud" className={navLinkClass}>
        ② Django CRUD（追加・更新・削除）
      </NavLink>
    </nav>
  )
}

export default function App() {
  const [open, setOpen] = useState(true)

  // 本番（静的ビルド）では SQL↔ORM ツールだけの単独ページにする（サイドバー無し）。
  if (!import.meta.env.DEV) {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[var(--color-line)] bg-[var(--color-paper)] px-5 py-3">
          <span className="text-base font-bold text-[var(--color-head)]">WMS Guide</span>
          <span className="text-xs text-[var(--color-muted)]">SQL ↔ ORM / クエリ実行ツール</span>
        </header>
        <main className="px-5 py-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* 上部バー: ハンバーガーで左サイドバーを開閉 */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[var(--color-line)] bg-[var(--color-paper)] px-3 py-2.5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="サイドバーの開閉"
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-head)] hover:bg-[var(--color-mist)]"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <NavLink to="/" className="text-base font-bold text-[var(--color-head)]">
          WMS Guide
        </NavLink>
        <span className="hidden text-xs text-[var(--color-muted)] sm:inline">
          画面別解説 &amp; SQL→ORM 学習ツール
        </span>
      </header>

      <div className="flex">
        {/* 左サイドバー（open のときだけ表示）。画面に追従(sticky)して縦スクロール */}
        {open ? (
          <aside className="sticky top-[57px] h-[calc(100vh-57px)] w-64 shrink-0 overflow-y-auto border-r border-[var(--color-line)] bg-[var(--color-paper)]">
            <SidebarNav />
          </aside>
        ) : null}

        {/* メイン。サイドバーを隠すと全幅に広がる */}
        <main className="min-w-0 flex-1 px-5 py-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

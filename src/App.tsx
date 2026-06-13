import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { screens } from './data/screens'
import { ormChapterList } from './data/orm-book'
import { ormQuizListNav } from './data/orm-quiz'
import { reactChapterList } from './data/react-book'
import { ecChapterListNav } from './data/ec-code'
import { techNoteList } from './data/tech-notes'

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

      <div className={groupLabelClass}>Django ORM 大全</div>
      <NavLink to="/orm" className={navLinkClass} end>
        目次
      </NavLink>
      {ormChapterList.map((c) => (
        <NavLink key={c.id} to={`/orm/${c.id}`} className={navLinkClass}>
          第{c.num}章 {c.title}
        </NavLink>
      ))}

      <div className={groupLabelClass}>Django ORM 問題集</div>
      <NavLink to="/orm-quiz" className={navLinkClass} end>
        目次
      </NavLink>
      {ormQuizListNav.map((s) => (
        <NavLink key={s.id} to={`/orm-quiz/${s.id}`} className={navLinkClass}>
          セット{s.num} {s.title}
        </NavLink>
      ))}

      <div className={groupLabelClass}>React 大全</div>
      <NavLink to="/react" className={navLinkClass} end>
        目次
      </NavLink>
      {reactChapterList.map((c) => (
        <NavLink key={c.id} to={`/react/${c.id}`} className={navLinkClass}>
          第{c.num}章 {c.title}
        </NavLink>
      ))}

      <div className={groupLabelClass}>EC コード解説</div>
      <NavLink to="/ec" className={navLinkClass} end>
        目次
      </NavLink>
      {ecChapterListNav.map((c) => (
        <NavLink key={c.id} to={`/ec/${c.id}`} className={navLinkClass}>
          ＃{c.num} {c.title}
        </NavLink>
      ))}

      <div className={groupLabelClass}>WMS 技術メモ</div>
      <NavLink to="/tech" className={navLinkClass} end>
        目次
      </NavLink>
      {techNoteList.map((n) => (
        <NavLink key={n.id} to={`/tech/${n.id}`} className={navLinkClass}>
          {n.num}. {n.title}
        </NavLink>
      ))}

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

  // 本番（静的ビルド）では学習コンテンツ（ORM 大全・React 大全・技術メモ）のみ公開する
  // （上部ナビのみ・サイドバー無し）。SQL↔ORM ツールと同梱DBは開発時専用で本番には出さない。
  if (!import.meta.env.DEV) {
    const prodNavClass = ({ isActive }: { isActive: boolean }) =>
      [
        'rounded-lg px-3 py-1.5 text-sm transition-colors',
        isActive
          ? 'bg-[var(--color-accent-soft)] font-medium text-[var(--color-accent)]'
          : 'text-[var(--color-ink)] hover:bg-[var(--color-mist)]',
      ].join(' ')
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-20 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--color-line)] bg-[var(--color-paper)] px-5 py-3">
          <NavLink to="/orm" className="text-base font-bold text-[var(--color-head)]">
            WMS Guide
          </NavLink>
          <nav className="flex items-center gap-1">
            <NavLink to="/orm" className={prodNavClass}>
              Django ORM 大全
            </NavLink>
            <NavLink to="/orm-quiz" className={prodNavClass}>
              ORM 問題集
            </NavLink>
            <NavLink to="/react" className={prodNavClass}>
              React 大全
            </NavLink>
            <NavLink to="/ec" className={prodNavClass}>
              EC コード解説
            </NavLink>
            <NavLink to="/tech" className={prodNavClass}>
              WMS 技術メモ
            </NavLink>
          </nav>
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

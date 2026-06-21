import { StrictMode, Suspense, lazy, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import HomePage from './pages/HomePage.tsx'
import SqlToOrmPage from './pages/SqlToOrmPage.tsx'

// Mermaid（図）を使うページは遅延読み込み（コード分割）。
// これらを開いたときだけ Mermaid のチャンクを取得する。本番の SQL ツールでは読み込まれない。
const ScreenPage = lazy(() => import('./pages/ScreenPage.tsx'))
const DjangoBasicsPage = lazy(() => import('./pages/DjangoBasicsPage.tsx'))
const DjangoCrudPage = lazy(() => import('./pages/DjangoCrudPage.tsx'))
// ORM 大全（章ページは Mermaid を使うので遅延読み込み）。本番でも公開する。
const OrmBookPage = lazy(() => import('./pages/OrmBookPage.tsx'))
const OrmChapterPage = lazy(() => import('./pages/OrmChapterPage.tsx'))
// WMS 技術メモ（Mermaid を使うので遅延読み込み）。本番でも公開する。
const TechNotesPage = lazy(() => import('./pages/TechNotesPage.tsx'))
const TechNotePage = lazy(() => import('./pages/TechNotePage.tsx'))
// React 大全（章ページは Mermaid を使うので遅延読み込み）。本番でも公開する。
const ReactBookPage = lazy(() => import('./pages/ReactBookPage.tsx'))
const ReactChapterPage = lazy(() => import('./pages/ReactChapterPage.tsx'))
// ToDo アプリ実践（章ページは Mermaid・ライブプレビューを使うので遅延読み込み）。本番でも公開する。
const TodoBookPage = lazy(() => import('./pages/TodoBookPage.tsx'))
const TodoChapterPage = lazy(() => import('./pages/TodoChapterPage.tsx'))
// EC コード解説（Mermaid を使うので遅延読み込み）。本番でも公開する。
const EcCodePage = lazy(() => import('./pages/EcCodePage.tsx'))
const EcChapterPage = lazy(() => import('./pages/EcChapterPage.tsx'))
// Django ORM 問題集。本番でも公開する。
const OrmQuizPage = lazy(() => import('./pages/OrmQuizPage.tsx'))
const OrmQuizSetPage = lazy(() => import('./pages/OrmQuizSetPage.tsx'))

const lazyEl = (el: ReactNode) => (
  <Suspense fallback={<p className="text-sm text-[var(--color-muted)]">読み込み中…</p>}>{el}</Suspense>
)

// ローカル中心・静的ホスティングでも崩れないよう HashRouter を使う。
const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // SQL↔ORM ツール（同梱DBを使う）は開発時のみ。本番ではトップを ORM 大全へ。
      { index: true, element: import.meta.env.DEV ? <HomePage /> : <Navigate to="/orm" replace /> },
      { path: 'screen/:screenId', element: lazyEl(<ScreenPage />) },
      {
        path: 'sql-to-orm',
        element: import.meta.env.DEV ? <SqlToOrmPage /> : <Navigate to="/orm" replace />,
      },
      { path: 'orm', element: lazyEl(<OrmBookPage />) },
      { path: 'orm/:chapterId', element: lazyEl(<OrmChapterPage />) },
      { path: 'tech', element: lazyEl(<TechNotesPage />) },
      { path: 'tech/:noteId', element: lazyEl(<TechNotePage />) },
      { path: 'react', element: lazyEl(<ReactBookPage />) },
      { path: 'react/:chapterId', element: lazyEl(<ReactChapterPage />) },
      { path: 'todo', element: lazyEl(<TodoBookPage />) },
      { path: 'todo/:chapterId', element: lazyEl(<TodoChapterPage />) },
      { path: 'ec', element: lazyEl(<EcCodePage />) },
      { path: 'ec/:chapterId', element: lazyEl(<EcChapterPage />) },
      { path: 'orm-quiz', element: lazyEl(<OrmQuizPage />) },
      { path: 'orm-quiz/:setId', element: lazyEl(<OrmQuizSetPage />) },
      { path: 'django-basics', element: lazyEl(<DjangoBasicsPage />) },
      { path: 'django-crud', element: lazyEl(<DjangoCrudPage />) },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

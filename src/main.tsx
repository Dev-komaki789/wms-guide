import { StrictMode, Suspense, lazy, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
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

const lazyEl = (el: ReactNode) => (
  <Suspense fallback={<p className="text-sm text-[var(--color-muted)]">読み込み中…</p>}>{el}</Suspense>
)

// ローカル中心・静的ホスティングでも崩れないよう HashRouter を使う。
const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // 本番（静的ビルド）では「このページだけ」公開したいので、トップを SQL↔ORM ツールにする。
      { index: true, element: import.meta.env.DEV ? <HomePage /> : <SqlToOrmPage /> },
      { path: 'screen/:screenId', element: lazyEl(<ScreenPage />) },
      { path: 'sql-to-orm', element: <SqlToOrmPage /> },
      { path: 'orm', element: lazyEl(<OrmBookPage />) },
      { path: 'orm/:chapterId', element: lazyEl(<OrmChapterPage />) },
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

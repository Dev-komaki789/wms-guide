import type { EcChapter } from './types'

// EC コード解説 #2「起動」。
export const ch02Startup: EcChapter = {
  id: 'startup',
  num: 2,
  title: 'アプリの起動 ― Provider の入れ子と Router',
  summary: 'アプリの起点 main.tsx と、URL に応じて画面を切り替える App.tsx を読みます。Context の Provider を「重ねる」理由、ルーティング、ログイン必須ページの守り方が見えてきます。',
  relatedReact: ['第8章 ルーティング', '第9章 Context', '第4章 条件で出し分ける'],
  intro: [
    'アプリは main.tsx から始まります。ここで「アプリ全体で共有する状態」を用意し、その中に App を置きます。App はルーティング（URL→ページ）を担当します。',
  ],
  sections: [
    {
      id: 'main',
      heading: '2-1. main.tsx ― Provider を重ねる',
      body: [
        '起点の main.tsx では、ルーターと3つの Context（Toast / Auth / Cart）の Provider を入れ子にして、その中に App を置いています。第9章で学んだ「Provider で配る範囲を囲む」の実例です。',
      ],
      examples: [
        {
          file: 'src/main.tsx',
          code: `createRoot(document.getElementById('root')!).render(\n  <StrictMode>\n    <BrowserRouter>\n      <ToastProvider>\n        <AuthProvider>\n          <CartProvider>\n            <App />\n          </CartProvider>\n        </AuthProvider>\n      </ToastProvider>\n    </BrowserRouter>\n  </StrictMode>,\n)`,
          note: 'いちばん外が BrowserRouter（第8章）。その中に Toast→Auth→Cart の Provider を重ね、いちばん内側に App。これで App とその子孫は、useToast / useAuth / useCart のどれも使えます。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: '入れ子の順番には意味があります。Cart は「ログイン状態が変わったらカートを読み直す」ので useAuth を使います。だから Cart は Auth の内側。「使う側を内側に」並べるのがコツです。',
        },
      ],
    },
    {
      id: 'routes',
      heading: '2-2. App.tsx ― URL とページの対応表',
      body: [
        'App では <Routes> の中に <Route> を並べ、「この URL のときはこのページ」を定義します（第8章）。レイアウト（ヘッダー・フッター・下部ナビ）は Routes の外側に置き、全ページ共通にしています。',
      ],
      examples: [
        {
          file: 'src/App.tsx',
          code: `<div className="flex min-h-screen flex-col pb-16 md:pb-0">\n  <Header />\n  <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">\n    <Routes>\n      <Route path="/" element={<ProductsPage />} />\n      <Route path="/products/:id" element={<ProductDetailPage />} />\n      <Route path="/login" element={<LoginPage />} />\n      <Route path="/cart" element={<RequireAuth><CartPage /></RequireAuth>} />\n      {/* /checkout /orders /profile も同様に RequireAuth で包む */}\n    </Routes>\n  </main>\n  <Footer />\n  <BottomNav />\n</div>`,
          note: 'Header / Footer / BottomNav は Routes の外なので全ページ共通。中身（main の Routes）だけが URL で切り替わります。これが第8章で触れた SPA の「中身だけ差し替える」形です。',
        },
      ],
    },
    {
      id: 'require-auth',
      heading: '2-3. ログイン必須ページの守り方 ― RequireAuth',
      body: [
        '/cart や /checkout は、ログインしていないと使えません。それを <RequireAuth> で包むことで実現しています。包まれたページは「ログインしていなければ /login へ飛ばす」ようになります。',
      ],
      examples: [
        {
          file: 'src/components/RequireAuth.tsx',
          code: `export function RequireAuth({ children }: { children: ReactNode }) {\n  const { user, loading } = useAuth()\n  if (loading) return <p className="page-status">読み込み中…</p>\n  if (!user) return <Navigate to="/login" replace />\n  return <>{children}</>\n}`,
          note: 'まさに第4章の「早期 return」。①まだ判定中(loading)なら待つ ②未ログインなら /login へリダイレクト ③どちらでもなければ中身を表示。children を受け取って包む形は第2章の children そのものです。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'なぜ loading を見るのか？ 起動直後は「ログイン済みか」をまだ確認中（次章）。ここで待たずに判定すると、ログイン済みなのに一瞬 /login へ飛ぶ“チラつき”が起きます。loading のガードはその防止です。',
        },
      ],
    },
    {
      id: 'app-loading',
      heading: '2-4. 起動時の「読み込み中…」',
      body: [
        'App 自身も、認証の復元（次章）が終わるまでは「読み込み中…」を出して待ちます。これも早期 return です。これがないと、ログイン状態が確定する前に画面が描かれてチラつきます。',
      ],
      examples: [
        {
          file: 'src/App.tsx',
          code: `function App() {\n  const { loading } = useAuth()\n  if (loading) {\n    return <div className="grid min-h-screen place-items-center text-slate-500">読み込み中…</div>\n  }\n  return (/* ヘッダー・Routes・フッター … */)\n}`,
          note: 'useAuth().loading が true のあいだは中身を描かず待つ。「準備が整うまで待ってから本編を出す」という、データのある画面で頻出のパターンです。',
        },
      ],
    },
  ],
}

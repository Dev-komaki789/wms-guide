import type { ReactChapter } from './types'

// 第8章「ルーティング ― 複数ページを切り替える（react-router）」。プログラミング初心者向け。
export const ch08Routing: ReactChapter = {
  id: 'routing',
  num: 8,
  title: 'ルーティング ― 複数ページを切り替える（react-router）',
  summary: '「商品一覧」「商品詳細」「カート」のように、URL に応じて画面を切り替えるのがルーティングです。React 定番の react-router を使って、ページ移動・URL のパラメータ・プログラムからの移動を学びます。',
  intro: [
    'これまでは1つの画面の話でした。でも実際のアプリには「一覧」「詳細」「ログイン」など複数のページがあり、URL によって表示を切り替えます。このしくみがルーティング（routing）です。',
    'React 自体にはルーティング機能がないので、定番ライブラリ react-router（リアクトルーター）を使います。この章のコードは「ルーターの中」で動く前提なので、ライブ表示はせず、形を読んで覚えていきましょう。',
  ],
  sections: [
    {
      id: 'why',
      heading: '8-1. SPA と「ページの中身だけ差し替える」発想',
      body: [
        '昔の Web は、リンクを押すたびにサーバーから新しい HTML を丸ごと受け取り、画面が真っ白になってから描き直していました。',
        'React で作るアプリの多くは SPA（エスピーエー＝Single Page Application）です。最初に1枚読み込んだら、あとは「中身の部品だけ」を JavaScript で差し替えます。URL は変わるのに、画面はチラつかず一瞬で切り替わる――これを実現するのがルーターです。',
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：SPA（シングルページアプリケーション）＝「1枚のページ」で動くアプリ。ページ全体を読み直さず、必要な部分だけ JavaScript で描き替える作りのこと。',
        },
      ],
    },
    {
      id: 'setup',
      heading: '8-2. ルートを定義する ― Routes と Route',
      body: [
        'まずアプリ全体を <BrowserRouter> で包みます。そして <Routes> の中に <Route> を並べ、「この URL のときは、この部品を表示する」という対応表を作ります。',
      ],
      examples: [
        {
          code: `import { BrowserRouter, Routes, Route } from 'react-router-dom'\n\nfunction App() {\n  return (\n    <BrowserRouter>\n      <Routes>\n        <Route path="/" element={<ProductsPage />} />\n        <Route path="/products/:id" element={<ProductDetailPage />} />\n        <Route path="/cart" element={<CartPage />} />\n      </Routes>\n    </BrowserRouter>\n  )\n}`,
          note: 'path が URL、element がそのとき表示する部品。path="/products/:id" の :id は「ここは商品ごとに変わる番号」という印（次の節で取り出します）。',
        },
      ],
    },
    {
      id: 'link',
      heading: '8-3. ページ移動 ― Link（a タグは使わない）',
      body: [
        'ページ間の移動には <Link to="..."> を使います。ふつうの <a href="..."> を使うと、ブラウザがページを丸ごと読み直してしまい、SPA の利点（速い・チラつかない）が消えてしまいます。',
        'Link は見た目はリンクですが、ページ全体を読み直さず、中身の部品だけを切り替えてくれます。',
      ],
      examples: [
        {
          code: `import { Link } from 'react-router-dom'\n\nfunction Nav() {\n  return (\n    <nav>\n      <Link to="/">商品一覧</Link>\n      <Link to="/cart">カート</Link>\n    </nav>\n  )\n}`,
          note: 'アプリ内の移動は必ず Link（または次の useNavigate）。<a> は外部サイトへのリンクのときだけ、と覚えておきましょう。',
        },
      ],
    },
    {
      id: 'params',
      heading: '8-4. URL のパラメータを取り出す ― useParams',
      body: [
        'path="/products/:id" のような URL の :id の部分を、表示する部品の中で取り出すには useParams を使います。「どの商品の詳細か」を URL から受け取って、その商品のデータを取りにいく、という流れです。',
      ],
      examples: [
        {
          code: `import { useParams } from 'react-router-dom'\n\nfunction ProductDetailPage() {\n  const { id } = useParams()  // URL の :id がここに入る\n\n  // この id を使って、第7章のように商品データを取得する\n  return <h1>商品 {id} の詳細</h1>\n}`,
          note: 'URL が /products/42 なら id は "42"。この id をもとに useEffect でデータ取得すれば、商品ごとの詳細ページが1つの部品で作れます。',
        },
      ],
    },
    {
      id: 'navigate',
      heading: '8-5. プログラムから移動する ― useNavigate',
      body: [
        'クリックではなく「処理が終わったら自動で移動」したいことがあります。たとえば「注文を確定したら、注文完了ページへ飛ばす」。これには useNavigate を使います。',
      ],
      examples: [
        {
          code: `import { useNavigate } from 'react-router-dom'\n\nfunction CheckoutPage() {\n  const navigate = useNavigate()\n\n  async function handleOrder() {\n    await sendOrder()         // 注文をサーバーに送る\n    navigate('/orders')       // 終わったら注文一覧へ移動\n  }\n\n  return <button onClick={handleOrder}>注文を確定する</button>\n}`,
          note: 'navigate(\'/orders\') で、その URL へプログラムから移動します。「ログイン後にトップへ」「保存後に一覧へ」など、操作の後の自動移動に使います。',
        },
      ],
    },
    {
      id: 'query',
      heading: '8-6. 検索条件を URL に持たせる ― useSearchParams',
      body: [
        '「?page=2」や「?q=ペン」のような URL の後ろの部分（クエリ文字列）を読み書きするには useSearchParams を使います。ページ番号や検索キーワードを URL に持たせると、その URL を共有・ブックマークできて便利です。',
      ],
      examples: [
        {
          code: `import { useSearchParams } from 'react-router-dom'\n\nfunction ProductsPage() {\n  const [searchParams, setSearchParams] = useSearchParams()\n  const page = Number(searchParams.get('page') ?? '1')\n\n  return (\n    <div>\n      <p>{page} ページ目</p>\n      <button onClick={() => setSearchParams({ page: String(page + 1) })}>\n        次のページ\n      </button>\n    </div>\n  )\n}`,
          note: 'searchParams.get(\'page\') で現在の値を読み、setSearchParams で書き換えます。useState に似ていますが、状態が「URL に保存される」のが違いです。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '8-7. この章のまとめ',
      body: [
        '複数ページの切り替えは react-router で行う。<BrowserRouter> で包み、<Routes>＋<Route path element> で「URL→部品」の対応表を作る。',
        'アプリ内の移動は <Link>（<a> は使わない）。URL の :id は useParams で取り出し、プログラムからの移動は useNavigate、?page=2 のような条件は useSearchParams で読み書きする。',
        '次の章では、ログイン情報やカートのように「アプリの離れた部品どうしで共有したい値」を届ける Context を学びます。',
      ],
    },
  ],
}

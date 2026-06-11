import type { ReactChapter } from './types'

// 第17章「壊れに強く・賢く読み込む ― エラーバウンダリ / Suspense・lazy / Portal」。プログラミング初心者向け。
export const ch17RobustLoading: ReactChapter = {
  id: 'robust-loading',
  num: 17,
  title: '壊れに強く・賢く読み込む ― エラーバウンダリ / Suspense・lazy / Portal',
  summary: '実アプリでよく出てくる3つの仕組みをまとめて学びます。一部の故障で全体を落とさない「エラーバウンダリ」、必要なときだけ読み込む「Suspense と lazy」、画面の別の場所へ描く「Portal（モーダル等）」です。',
  intro: [
    'ここまでで部品の作り方は十分身につきました。この章は、実アプリを組むときに「あると効く」3つの仕組みを紹介します。どれも“縁の下の力持ち”的な存在です。',
    'エラーバウンダリ・Suspense/lazy・Portal。順に見ていきましょう。',
  ],
  sections: [
    {
      id: 'error-boundary',
      heading: '17-1. エラーバウンダリ ― 一部の故障を閉じ込める',
      body: [
        'React では、ある部品の描画中にエラーが起きると、そのままだと画面全体が真っ白になってしまいます。これを防ぐのがエラーバウンダリ（error boundary）です。「ここから内側で何か壊れたら、代わりにこの表示を出す」という“防火壁”を作ります。',
        'エラーバウンダリは、いまのところ class（クラス）コンポーネントでしか作れない数少ない機能です。getDerivedStateFromError でエラーを捕まえ、代わりの表示に切り替えます。',
      ],
      examples: [
        {
          code: `import { Component } from 'react'\n\nclass ErrorBoundary extends Component {\n  state = { hasError: false }\n\n  static getDerivedStateFromError() {\n    return { hasError: true }   // エラーが起きたら印を立てる\n  }\n\n  render() {\n    if (this.state.hasError) {\n      return <p>表示中に問題が起きました。</p>  // 代わりの表示\n    }\n    return this.props.children   // ふだんは中身をそのまま表示\n  }\n}\n\n// 使い方：壊れたら困る範囲を包む\n<ErrorBoundary>\n  <ProductList />\n</ErrorBoundary>`,
          note: 'ProductList の中でエラーが起きても、画面全体ではなく ErrorBoundary の中だけが「問題が起きました」に差し替わります。実は、この本のライブプレビューも同じ仕組みでエラーを枠内に閉じ込めています。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: '自分で書かなくても、react-error-boundary という小さなライブラリを使えば関数コンポーネントの感覚で扱えます。まずは「こういう防火壁を要所に置く」という考え方を覚えておけば十分です。',
        },
      ],
    },
    {
      id: 'suspense-lazy',
      heading: '17-2. Suspense と lazy ― 必要なときだけ読み込む',
      body: [
        'アプリが大きくなると、最初に読み込む JavaScript が重くなり、表示が遅くなります。そこで「めったに開かないページは、開いたときに初めて読み込む」ようにできます。これがコード分割で、lazy と Suspense を使います。',
        'lazy(() => import(...)) で「あとから読み込む部品」を作り、<Suspense fallback={...}> で「読み込み中に出す表示」を指定します。実は、このサイト自身も各章ページをこの方法で遅延読み込みしています。',
      ],
      examples: [
        {
          code: `import { lazy, Suspense } from 'react'\n\n// この部品は「開いたとき」に初めて読み込まれる\nconst HeavyChart = lazy(() => import('./HeavyChart'))\n\nfunction Dashboard() {\n  return (\n    <Suspense fallback={<p>グラフを読み込み中…</p>}>\n      <HeavyChart />\n    </Suspense>\n  )\n}`,
          note: 'HeavyChart は最初のページ読み込みには含まれず、Dashboard が表示される段で取得されます。fallback は、その取得が終わるまでの“つなぎ”の表示です。最初の表示を軽く速く保てます。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：コード分割（code splitting）＝アプリの JavaScript を小さなかたまりに分け、必要になったぶんだけ読み込むこと。重いライブラリ（グラフ・地図・エディタ等）を使うページに特に有効です。',
        },
      ],
    },
    {
      id: 'portal',
      heading: '17-3. createPortal ― 画面の別の場所へ描く',
      body: [
        'モーダル（画面に重なるダイアログ）やトースト通知は、「部品の階層上は今いる場所にありながら、実際の表示は画面のいちばん外側に出したい」ことがあります。そうしないと、親の overflow:hidden や重なり順（z-index）に邪魔されるからです。',
        'createPortal は「この部品を、DOM 上の別の場所に描く」ための道具です。コードの書き場所はそのまま、実際の出力先だけを変えられます。',
      ],
      examples: [
        {
          code: `import { createPortal } from 'react-dom'\n\nfunction Modal({ children }) {\n  // children を、body 直下の #modal-root に描く\n  return createPortal(\n    <div className="overlay">\n      <div className="dialog">{children}</div>\n    </div>,\n    document.getElementById('modal-root'),\n  )\n}`,
          note: 'createPortal(描くもの, どこに描くか) の2引数。コード上は Modal を好きな場所に書けますが、実際の HTML は #modal-root（画面の外側）に出ます。state や props・イベントは、見た目の位置に関係なく今までどおり使えます。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'モーダルやトーストで「親の枠に切れてしまう」「他の要素の下に隠れる」と困ったら Portal を思い出してください。ふだんの表示には不要で、こうした“浮かせたい UI”専用の道具です。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '17-4. この章のまとめ',
      body: [
        'エラーバウンダリは「ここから内側が壊れたら代わりの表示を出す」防火壁（class コンポーネントで作る）。要所を包むと、一部の故障で全体が落ちるのを防げる。',
        'lazy + Suspense は「必要なときだけ読み込む」コード分割。重いページを後回しにして最初の表示を軽くする（このサイトも採用）。createPortal はモーダル等を DOM の別の場所へ描く道具。',
        '次の章では、アプリを素直に保つ「state 設計」――状態をどこに置くか、計算で出せる値は持たない、useEffect を使わない方がいい場面――を学びます。',
      ],
    },
  ],
}

import type { ReactChapter } from './types'

// 第7章「useEffect ― 外の世界とのやりとり」。プログラミング初心者向け。
export const ch07UseEffect: ReactChapter = {
  id: 'useeffect',
  num: 7,
  title: 'useEffect ― 外の世界とのやりとり（取得・後片付け）',
  summary: 'データの取得、タイマー、ブラウザの API など「画面を描くこと以外」の処理を担当するのが useEffect です。いつ動くのか、なぜ「後片付け」が要るのかを、実際に動くタイマーで体感します。',
  intro: [
    'これまでの部品は「props と state から画面を描く」だけでした。でも本物のアプリは、サーバーからデータを取ってきたり、タイマーを動かしたりと、画面の外ともやりとりします。',
    'こうした「描画のついでにやる外向きの処理」を副作用（ふくさよう）と呼び、それを担当するのが useEffect（ユーズエフェクト）です。少し難しく感じる所なので、ゆっくり進めます。',
  ],
  sections: [
    {
      id: 'why',
      heading: '7-1. なぜ useEffect が要るのか',
      body: [
        'コンポーネントの関数の本体に、いきなり「データ取得」や「タイマー開始」を書いてはいけません。なぜなら、その関数は再レンダリングのたびに何度も実行されるからです。そこに通信を書くと、画面が更新されるたびに通信が走り、暴走します。',
        'useEffect は「画面を描き終わった“後”に、好きな処理を実行する」しくみです。さらに「いつ実行するか」を自分で指定できるので、ムダな実行を防げます。',
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：副作用（side effect）＝「画面を計算して返す」という本来の仕事の“ついで”に行う、外向きの処理（通信・タイマー・ログ・DOM 直接操作など）のこと。',
        },
      ],
    },
    {
      id: 'basics',
      heading: '7-2. 基本の形と「依存配列」',
      body: [
        'useEffect(関数, 依存配列) の形で書きます。第1引数が「やりたい処理」、第2引数の依存配列（いそんはいれつ）が「いつ実行するか」を決めるカギです。',
        '依存配列の中の値が前回と変わったときだけ、処理がもう一度実行されます。空の配列 [] にすると「最初の1回だけ」になります。',
      ],
      table: {
        headers: ['書き方', 'いつ実行されるか'],
        rows: [
          ['useEffect(fn, [])', '最初の表示のときに1回だけ（データの初回取得に最適）'],
          ['useEffect(fn, [userId])', 'userId が変わるたび（＋初回）'],
          ['useEffect(fn)（配列なし）', '毎回の描画のあと（基本は避ける）'],
        ],
      },
      examples: [
        {
          code: `import { useEffect } from 'react'\n\nfunction Page({ userId }) {\n  useEffect(() => {\n    console.log('userId が変わった:', userId)\n  }, [userId])  // ← userId が変わったときだけ動く\n\n  return <p>ユーザー: {userId}</p>\n}`,
          note: '[userId] が依存配列。ここに入れた値が変わると、中の処理がもう一度実行されます。「何が変わったら、やり直したいか」を書く場所です。',
        },
      ],
      callouts: [
        {
          kind: 'warn',
          text: '依存配列の入れ忘れに注意。中で使っている state や props は、基本ぜんぶ依存配列に入れます。入れ忘れると「古い値のまま動く」バグになります（開発時は eslint が警告してくれます）。',
        },
      ],
    },
    {
      id: 'cleanup',
      heading: '7-3. 後片付け（クリーンアップ）― 動く時計で体感する',
      body: [
        'タイマーやイベント登録のように「始めたら、止める必要がある」処理があります。useEffect の中で関数を return すると、それが「後片付け（クリーンアップ）」として呼ばれます。',
        '下の時計は、useEffect で1秒ごとのタイマーを開始し、return でそれを止めています。実際に動いているので、秒が増えていくのが見えるはずです。',
      ],
      examples: [
        {
          code: `function Clock() {\n  const [sec, setSec] = useState(0)\n\n  useEffect(() => {\n    // 1秒ごとに sec を1増やすタイマーを開始\n    const id = setInterval(() => {\n      setSec((prev) => prev + 1)\n    }, 1000)\n\n    // 後片付け：部品が消えるときにタイマーを止める\n    return () => clearInterval(id)\n  }, [])  // 最初に1回だけ開始\n\n  return <p>このページを開いてから {sec} 秒</p>\n}`,
          live: true,
          mount: '<Clock />',
          note: '実際に秒が増えていきます。もし return の後片付けを書かないと、部品が消えてもタイマーが動き続け、メモリを食ったりエラーになったりします。「始めたら止める」をセットで。',
        },
      ],
      mermaid: `flowchart LR\n  A["部品が表示される"] --> B["useEffect の処理が動く<br/>（タイマー開始）"]\n  B --> C["…部品が使われる…"]\n  C --> D["部品が消える / 依存が変わる"]\n  D --> E["return の後片付けが動く<br/>（タイマー停止）"]`,
    },
    {
      id: 'fetch',
      heading: '7-4. データ取得の定番パターン',
      body: [
        'useEffect の代表的な使い道が「最初の表示でサーバーからデータを取ってくる」ことです。第4章で学んだ「読み込み中／エラー／中身」の早期 return とセットで使うのが定番の形です。',
        '取得は時間がかかる（非同期）ので、結果が返るまでは loading を true にしておき、返ってきたら state に入れて画面に反映します。通信の具体的な書き方は次の第11章でくわしく扱います。',
      ],
      examples: [
        {
          code: `function ProductList() {\n  const [products, setProducts] = useState([])\n  const [loading, setLoading] = useState(true)\n\n  useEffect(() => {\n    let ignore = false  // 後片付け用のフラグ\n\n    fetch('/api/products')\n      .then((res) => res.json())\n      .then((data) => {\n        if (!ignore) {           // すでに消えていたら反映しない\n          setProducts(data)\n          setLoading(false)\n        }\n      })\n\n    return () => { ignore = true }  // 後片付け\n  }, [])\n\n  if (loading) return <p>読み込み中…</p>\n  return <ul>{products.map((p) => <li key={p.id}>{p.name}</li>)}</ul>\n}`,
          note: 'ignore フラグは「取得の途中で部品が消えたら、結果を state に入れない」ための後片付けです。消えた部品に setState すると警告が出るのを防ぎます。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'useEffect の中の関数そのものに async は付けられません。上のように中で .then を使うか、中に async 関数を作ってそれを呼ぶ形にします（第11章で詳しく）。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '7-5. この章のまとめ',
      body: [
        'useEffect は「描画のあとに行う、外向きの処理（副作用）」を担当する。useEffect(処理, 依存配列) で書き、依存配列の値が変わったときだけ再実行。[] なら最初の1回だけ。',
        'タイマーやイベント登録など「始めたら止める」ものは、処理の中で return した関数（クリーンアップ）で後片付けする。データ取得は loading とセットの定番パターンで。',
        '次の章では、複数のページを切り替える「ルーティング」を学びます。商品一覧ページ・商品詳細ページのような画面遷移を作れるようになります。',
      ],
    },
  ],
}

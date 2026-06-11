import type { ReactChapter } from './types'

// 第11章「API 通信 ― サーバーとデータをやりとりする（fetch / async）」。プログラミング初心者向け。
export const ch11Api: ReactChapter = {
  id: 'api',
  num: 11,
  title: 'API 通信 ― サーバーとデータをやりとりする（fetch / async）',
  summary: 'サーバーから商品データを取ってくる、注文を送る――Web アプリの中心が API 通信です。fetch と async / await の使い方、そして「取得中・成功・失敗」をきれいに扱う形を学びます。',
  intro: [
    'これまで「データはある」前提で進めてきましたが、実際のデータはサーバーにあります。それを取りにいく（／送る）のが API 通信です。',
    'この章では、ブラウザに最初から備わっている fetch と、待ち時間を扱う async / await を学びます。通信はライブ実行に向かない（相手のサーバーが要る）ので、コードを読んで形を覚えましょう。',
  ],
  sections: [
    {
      id: 'async',
      heading: '11-1. 非同期と async / await',
      body: [
        '通信は「お願いしてから結果が返るまで、少し待つ」処理です。これを非同期（ひどうき）と呼びます。待っているあいだ、アプリは固まらず他のことを続けられます。',
        '待ち時間のある処理は Promise（プロミス＝「あとで結果を渡す約束」）として返ってきます。await を付けると「結果が返るまでここで待つ」という意味になり、ふつうの順番どおりに読めるコードになります。await を使う関数には async を付けます。',
      ],
      examples: [
        {
          code: `// async を付けた関数の中でだけ await が使える\nasync function loadProducts() {\n  const res = await fetch('/api/products')  // 結果が返るまで待つ\n  const data = await res.json()             // 本文を JSON に変換（これも待つ）\n  return data\n}`,
          note: 'await があるおかげで「fetch して→JSONにして→返す」と上から順に読めます。await が無いと、結果がまだ無いうちに次へ進んでしまいます。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：Promise（プロミス）＝「いま結果は無いけど、あとで必ず渡すよ」という約束のオブジェクト。await はその約束が果たされるのを待つ命令です。',
        },
      ],
    },
    {
      id: 'fetch',
      heading: '11-2. fetch の基本 ― GET と POST',
      body: [
        'fetch(URL) はデータを「取ってくる」のが基本（GET）。データを「送る」ときは、第2引数で method・headers・body を指定します（POST）。',
        '送るデータ（body）は JSON.stringify でテキストに変換し、Content-Type ヘッダーで「JSON を送ります」と伝えます。',
      ],
      examples: [
        {
          code: `// 取ってくる（GET）\nconst res = await fetch('/api/products')\nconst products = await res.json()\n\n// 送る（POST）\nconst res2 = await fetch('/api/orders', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ skuCode: 'PEN-01', quantity: 2 }),\n})\nconst order = await res2.json()`,
          note: 'GET は URL を渡すだけ。POST は method・headers・body の3点セット。body はオブジェクトをそのまま渡せないので JSON.stringify で文字列にします。',
        },
      ],
    },
    {
      id: 'error',
      heading: '11-3. エラーを見逃さない ― res.ok の確認',
      body: [
        '大事な落とし穴：fetch は「404 や 500 などのエラー応答」を“失敗”とは扱いません（通信自体は成功しているため）。サーバーがエラーを返したかは、自分で res.ok を確認する必要があります。',
        'res.ok が false（4xx・5xx）のときは、自分でエラーを投げて、呼び出し側の catch で受け止めます。',
      ],
      examples: [
        {
          code: `async function loadProducts() {\n  const res = await fetch('/api/products')\n  if (!res.ok) {\n    // 404 や 500 はここで自分でエラーにする\n    throw new Error('取得に失敗しました (HTTP ' + res.status + ')')\n  }\n  return res.json()\n}`,
          note: 'if (!res.ok) のチェックを忘れると、エラーページの HTML を「正常なデータ」として処理してしまい、原因の分かりにくいバグになります。fetch のあとは res.ok の確認をセットに。',
        },
      ],
    },
    {
      id: 'in-component',
      heading: '11-4. 部品の中で使う ― useEffect ＋ 状態3点セット',
      body: [
        '部品の中では、第7章の useEffect で取得を始め、「取得中（loading）／結果（data）／失敗（error）」の3つの状態で画面を出し分けます。これが実アプリの一覧画面の定番の骨組みです。',
      ],
      examples: [
        {
          code: `function ProductList() {\n  const [products, setProducts] = useState([])\n  const [loading, setLoading] = useState(true)\n  const [error, setError] = useState(null)\n\n  useEffect(() => {\n    let ignore = false\n    async function load() {\n      try {\n        const res = await fetch('/api/products')\n        if (!res.ok) throw new Error('HTTP ' + res.status)\n        const data = await res.json()\n        if (!ignore) setProducts(data)\n      } catch (e) {\n        if (!ignore) setError(e.message)\n      } finally {\n        if (!ignore) setLoading(false)\n      }\n    }\n    load()\n    return () => { ignore = true }\n  }, [])\n\n  if (loading) return <p>読み込み中…</p>\n  if (error) return <p>エラー: {error}</p>\n  return <ul>{products.map((p) => <li key={p.id}>{p.name}</li>)}</ul>\n}`,
          note: 'try で成功、catch で失敗、finally で「成功・失敗どちらでも loading を終える」。ignore フラグで「途中で部品が消えたら反映しない」後片付けも入れています。第4章の早期 return で出し分け。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'この「loading / error / data」の取得ロジックこそ、第10章のカスタムフック（useProducts() など）に切り出す王道の対象です。複数の画面で同じ取得をするなら、フックにまとめると一気にスッキリします。',
        },
      ],
    },
    {
      id: 'auth',
      heading: '11-5. 認証つきの通信 ― ヘッダーにトークンを付ける',
      body: [
        'ログインが必要な API では、リクエストに「自分が誰か」を示す合言葉（トークン）を付けます。多いのは Authorization ヘッダーに Bearer トークンを入れる方式です。',
        '毎回このヘッダーを手で書くのは大変なので、実際のアプリでは「トークンを自動で付ける共通の通信関数」を1つ作って、全部そこを通すのが定番です（この設計は EC コード解説で実物を見ます）。',
      ],
      examples: [
        {
          code: `const res = await fetch('/api/orders', {\n  headers: {\n    'Authorization': 'Bearer ' + accessToken,\n  },\n})`,
          note: 'Bearer のあとにトークン文字列を付けます。「この通信は、このユーザーからのものです」とサーバーに伝える合言葉です。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '11-6. この章のまとめ',
      body: [
        '通信は非同期。await で「結果が返るまで待つ」と書け、await を使う関数には async を付ける。fetch は GET なら URL だけ、POST は method・headers・body（JSON.stringify）の3点セット。',
        'fetch はエラー応答を失敗扱いしないので res.ok を必ず確認。部品の中では useEffect ＋（loading / error / data）の3状態で出し分けるのが定番。取得ロジックはカスタムフックに切り出せる。認証はヘッダーにトークン。',
        '次の章では、ここまで出てきた「型」――TypeScript の基礎を学びます。データの形をあらかじめ決めておくことで、通信まわりのミスを未然に防げます。',
      ],
    },
  ],
}

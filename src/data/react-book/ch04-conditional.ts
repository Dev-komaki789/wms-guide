import type { ReactChapter } from './types'

// 第4章「条件で出し分ける ― && / 三項演算子 / 早期 return」。プログラミング初心者向け。
export const ch04Conditional: ReactChapter = {
  id: 'conditional',
  num: 4,
  title: '条件で出し分ける ― && / 三項演算子 / 早期 return',
  summary: '「ログイン中なら名前、未ログインならログインボタン」のように、状況によって表示を変えたい場面は山ほどあります。JSX の中での条件分岐の3つの定番（&& / 三項 / 早期return）を使い分けられるようになります。',
  intro: [
    '第1章で「JSX の波カッコには if 文は書けない」と触れました。では「条件によって表示を変える」にはどうするのか。React には定番のやり方が3つあります。',
    'この章では、その3つ ― && と 三項演算子と 早期 return ― を、どんなときにどれを使うかも含めて学びます。',
  ],
  sections: [
    {
      id: 'and',
      heading: '4-1. && ― 「条件を満たすときだけ表示する」',
      body: [
        'いちばんよく使うのが && （アンド）です。「条件 && 表示」と書くと、条件が true のときだけ右側が表示され、false のときは何も表示されません。',
        '「在庫が少ないときだけ“残りわずか”バッジを出す」のような“あるか/ないか”の出し分けにぴったりです。',
      ],
      examples: [
        {
          code: `function StockBadge({ stock }) {\n  return (\n    <div>\n      <p>在庫: {stock}</p>\n      {stock < 5 && <span className="badge">残りわずか</span>}\n    </div>\n  )\n}`,
          live: true,
          mount: '<div><StockBadge stock={3} /><StockBadge stock={20} /></div>',
          note: 'stock < 5 が true のときだけ <span>残りわずか</span> が出ます。false のときは何も出ません（消える）。',
        },
      ],
      callouts: [
        {
          kind: 'warn',
          text: '数値の 0 には注意。{count && <p>...</p>} で count が 0 のとき、画面に「0」と表示されてしまいます（0 は false 扱いだが、&& は左の 0 をそのまま出す）。件数で出し分けるなら {count > 0 && ...} のように、必ず true/false になる条件を書きましょう。',
        },
      ],
    },
    {
      id: 'ternary',
      heading: '4-2. 三項演算子 ― 「Aか、それともBか」',
      body: [
        '「条件を満たすなら A、満たさないなら B」と、2択で出し分けたいときは三項演算子（さんこうえんざんし）を使います。書き方は 条件 ? A : B。第1章でも少し登場しました。',
        '「ログイン中なら名前、未ログインならログインリンク」のような“どちらかを必ず出す”場面で使います。',
      ],
      examples: [
        {
          code: `function Header({ user }) {\n  return (\n    <header>\n      {user ? (\n        <span>こんにちは、{user.name} さん</span>\n      ) : (\n        <a href="/login">ログイン</a>\n      )}\n    </header>\n  )\n}`,
          live: true,
          mount: '<Header user={{ name: "たなか" }} />',
          note: 'user ? (名前) : (ログインリンク)。? の前が条件、? と : のあいだが「真のときの表示」、: の後ろが「偽のときの表示」です。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: '使い分けの目安：「出す/出さない」の1択なら &&、「AかBか」の2択なら三項演算子。三項を二重三重に入れ子にすると一気に読みづらくなるので、複雑なら次の「早期 return」を検討しましょう。',
        },
      ],
    },
    {
      id: 'early-return',
      heading: '4-3. 早期 return ― 「特別な状態」を先に片付ける',
      body: [
        '「読み込み中」「エラー」「0件」のように、本編の表示の前に処理したい“特別な状態”があります。これらは JSX の中で粘るより、関数の頭で return してしまうのがいちばん読みやすいです。これを早期 return（early return）と呼びます。',
        '条件に当てはまったら、その場で専用の表示を return して関数を終える。最後まで来たら「ふつうの表示」を出す、という流れです。',
      ],
      examples: [
        {
          code: `function ProductList({ loading, error, products }) {\n  if (loading) {\n    return <p>読み込み中…</p>\n  }\n  if (error) {\n    return <p>エラーが起きました。</p>\n  }\n  if (products.length === 0) {\n    return <p>商品がありません。</p>\n  }\n\n  // ここまで来たら「ふつうの一覧」を出す\n  return (\n    <div>\n      {products.map((p) => (\n        <ProductCard key={p.id} name={p.name} price={p.price} />\n      ))}\n    </div>\n  )\n}`,
          note: '「読み込み中？ → エラー？ → 0件？ → ぜんぶ違うなら本編」と、上から順に特別な状態をふるい落とします。深い入れ子にならず、とても読みやすくなります。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'この「loading / error / 中身」の3点セットは、サーバーからデータを取ってくる画面で毎回出てきます。第7章（useEffect）・第11章（API通信）で本格的に使うので、形を覚えておくと役立ちます。',
        },
      ],
    },
    {
      id: 'null',
      heading: '4-4. 「何も表示しない」は null',
      body: [
        '条件によっては「何も表示したくない」こともあります。そのときは null（ヌル＝何もない）を返します。React は null を「何も描かない」と解釈します。',
      ],
      examples: [
        {
          code: `function Notice({ message }) {\n  if (!message) {\n    return null  // メッセージが無ければ何も出さない\n  }\n  return <div className="notice">{message}</div>\n}`,
          note: '!message は「message が空っぽ」という意味。空なら null を返して、画面に何も足しません。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '4-5. この章のまとめ',
      body: [
        '条件で表示を出し分ける定番は3つ。&&（出す/出さないの1択）、三項演算子 条件 ? A : B（AかBかの2択）、早期 return（読み込み中・エラー・0件などの特別な状態を関数の頭で片付ける）。',
        '&& で件数を扱うときは {count > 0 && ...} のように必ず true/false になる条件にする（0 がそのまま表示される罠に注意）。何も出したくないときは null を返す。',
        '次の章では、いよいよ「ボタンを押すと数が増える」のような“変化する画面”を作るための、React の心臓部 useState（状態）を学びます。',
      ],
    },
  ],
}

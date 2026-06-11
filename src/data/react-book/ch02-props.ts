import type { ReactChapter } from './types'

// 第2章「props ― 部品に値をわたす」。プログラミング初心者向け。
export const ch02Props: ReactChapter = {
  id: 'props',
  num: 2,
  title: 'props ― 部品に値をわたす',
  summary: '同じ部品でも、外から値をわたせば中身を変えられます。その「外からわたす値」が props（プロップス）。商品ごとに名前や値段がちがう商品カードを、たった1つの部品で作れるようになります。',
  intro: [
    '第1章で「部品（コンポーネント）を使い回せる」と学びました。でも <Welcome /> はいつも「こんにちは！」としか言えません。これでは、商品ごとに名前のちがうカードは作れません。',
    'そこで登場するのが props（プロップス）です。部品に「外から値をわたす」しくみで、これにより同じ部品から、中身のちがう表示をいくつも作れます。',
  ],
  sections: [
    {
      id: 'what-is-props',
      heading: '2-1. props ＝ 部品にわたす「設定」',
      body: [
        'props は、部品を呼び出すときに「外からわたす値」です。HTML の属性（<img src="...">の src のようなもの）に似ています。タグに name="..." のように書いてわたします。',
        '受け取る側（部品の関数）は、引数として props を受け取ります。下の例では name という props をわたし、部品の中で props.name として使っています。',
      ],
      examples: [
        {
          code: `function Welcome(props) {\n  return <h1>こんにちは、{props.name} さん！</h1>\n}\n\nfunction App() {\n  return (\n    <div>\n      <Welcome name="たなか" />\n      <Welcome name="すずき" />\n    </div>\n  )\n}`,
          result: `こんにちは、たなか さん！\nこんにちは、すずき さん！`,
          note: '同じ Welcome 部品でも、わたす name によって表示が変わります。「部品はそのまま、中身だけ差し替える」のが props です。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：props（プロップス）は properties（プロパティ＝属性・設定）の略。「部品にわたす設定の束」だと思ってください。',
        },
      ],
    },
    {
      id: 'destructuring',
      heading: '2-2. 分割代入 ― props.name と毎回書かずに済ます',
      body: [
        'props.name、props.price… と毎回 props. を付けるのは少し面倒です。そこで「分割代入（ぶんかつだいにゅう）」という JavaScript の書き方で、受け取りをスッキリさせるのが定番です。',
        '引数のところで { name } のように波カッコで囲むと、props.name を name という名前で直接使えます。実際の React のコードはほとんどこの書き方です。',
      ],
      examples: [
        {
          code: `// 分割代入なし\nfunction Welcome(props) {\n  return <h1>こんにちは、{props.name} さん</h1>\n}\n\n// 分割代入あり（こちらが定番）\nfunction Welcome({ name }) {\n  return <h1>こんにちは、{name} さん</h1>\n}`,
          note: '{ name } は「props の中の name を取り出して、name という名前で使う」という意味です。複数あるときは { name, price } のようにカンマで並べます。',
        },
      ],
    },
    {
      id: 'multiple-types',
      heading: '2-3. いろいろな値をわたす ― 文字・数値・真偽値',
      body: [
        'props には文字だけでなく、数値・真偽値（true/false）・配列・オブジェクトなど、どんな値でもわたせます。文字以外をわたすときは、波カッコ { } で囲むのがポイントです。',
      ],
      examples: [
        {
          code: `function ProductCard({ name, price, soldOut }) {\n  return (\n    <div>\n      <h2>{name}</h2>\n      <p>{price} 円</p>\n      <p>{soldOut ? '売り切れ' : '在庫あり'}</p>\n    </div>\n  )\n}\n\nfunction App() {\n  return (\n    <ProductCard name="ボールペン" price={120} soldOut={false} />\n  )\n}`,
          result: `ボールペン\n120 円\n在庫あり`,
          note: '文字は name="ボールペン" とそのまま、数値や true/false は price={120} soldOut={false} のように波カッコで囲んでわたします。',
        },
      ],
      callouts: [
        {
          kind: 'warn',
          text: 'price="120"（文字）と price={120}（数値）は別物です。計算に使う値は、波カッコ付きの数値でわたしましょう。文字の "120" と "5" を足すと "1205" になってしまうことがあります。',
        },
      ],
    },
    {
      id: 'children',
      heading: '2-4. children ― タグの「中身」をわたす',
      body: [
        'props には特別なものがひとつあります。children（チルドレン）です。これは「部品の開きタグと閉じタグの“あいだ”に書いたもの」が自動で入ってくる props です。',
        '「枠だけ用意して、中身は使う側が決める」ような部品（カードの外枠、ボタンなど）を作るときに大活躍します。',
      ],
      examples: [
        {
          code: `function Box({ children }) {\n  return <div className="box">{children}</div>\n}\n\nfunction App() {\n  return (\n    <Box>\n      <h2>タイトル</h2>\n      <p>この中身が children として Box にわたる。</p>\n    </Box>\n  )\n}`,
          result: `┌─────────────────────┐\n│ タイトル              │\n│ この中身が children…  │\n└─────────────────────┘`,
          note: '<Box> と </Box> ではさんだ部分が、まるごと children になって {children} の場所に表示されます。枠（Box）と中身を分けて作れます。',
        },
      ],
    },
    {
      id: 'read-only',
      heading: '2-5. props は「読み取り専用」',
      body: [
        '大事なルールがひとつあります。props は受け取った側で書きかえてはいけません。props は「親（呼び出す側）からのあずかりもの」で、子（部品）が勝手に変えると、表示と実態がズレてバグのもとになります。',
        '「あとから変わる値（ボタンを押すと増える数など）」を扱いたいときは、props ではなく次々章で学ぶ state（状態）を使います。props は“上から下へ流れる、変えない値”と覚えておきましょう。',
      ],
      examples: [
        {
          code: `function Bad({ name }) {\n  name = '勝手に変更'  // ❌ props を書きかえてはいけない\n  return <p>{name}</p>\n}`,
          note: 'props は表示するために「読む」だけ。値を変化させたいときは state（第5章）の出番です。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'データは「上の部品 → 下の部品」へ props で流れていく（一方通行）。この流れがシンプルだから、React のアプリは「どこで何が変わるか」が追いやすいのです。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '2-6. この章のまとめ',
      body: [
        'props は「部品に外からわたす設定」。<ProductCard name="..." price={120} /> のようにわたし、受け取り側は { name, price } と分割代入で使うのが定番。',
        '文字以外（数値・真偽値）は波カッコで囲んでわたす。タグの中身は特別な props・children として受け取れる。props は読み取り専用で、書きかえない。',
        '次の章では、props でわたってきた「一覧データ（配列）」を map でくり返し表示する方法を学びます。商品100件を1つの部品で並べられるようになります。',
      ],
    },
  ],
}

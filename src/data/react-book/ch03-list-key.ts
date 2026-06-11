import type { ReactChapter } from './types'

// 第3章「リストと key ― map でくり返し表示する」。プログラミング初心者向け。
export const ch03ListKey: ReactChapter = {
  id: 'list-key',
  num: 3,
  title: 'リストと key ― map でくり返し表示する',
  summary: '商品一覧のように「同じ部品をデータの数だけ並べる」のは React の定番です。配列の map と、各要素に付ける key を理解すれば、100件のデータも数行で表示できます。',
  intro: [
    '商品一覧、注文履歴、カートの中身――Web アプリには「同じ形のものを、データの数だけ並べる」場面がたくさんあります。',
    'React では、配列（データの並び）を map（マップ）という JavaScript の機能で「部品の並び」に変換します。この章でそのやり方と、必ずセットで出てくる key を学びます。',
  ],
  sections: [
    {
      id: 'map-basics',
      heading: '3-1. map ― 配列を「部品の配列」に変える',
      body: [
        'map は「配列の各要素を、別のものに変換して、新しい配列を作る」JavaScript の機能です。React では「データの配列」を「JSX（見た目）の配列」に変換するのに使います。',
        '下では、名前の配列を <li>名前</li> の配列に変換しています。JSX の波カッコ { } の中に書くのがポイントです。',
      ],
      examples: [
        {
          code: `function NameList() {\n  const names = ['たなか', 'すずき', 'さとう']\n  return (\n    <ul>\n      {names.map((name) => (\n        <li key={name}>{name}</li>\n      ))}\n    </ul>\n  )\n}`,
          result: `・たなか\n・すずき\n・さとう`,
          note: 'names.map((name) => <li>...</li>) は「配列の1件ずつを <li> に変える」という意味。結果の <li> の配列を、そのまま <ul> の中に並べてくれます。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：map（マップ）＝「写像」。各要素を1対1で別のものに“対応づけて”新しい配列を作るイメージです。元の配列は変わりません。',
        },
      ],
    },
    {
      id: 'map-objects',
      heading: '3-2. オブジェクトの配列を並べる（実践的な形）',
      body: [
        '実際のデータは、ただの文字ではなく「id・名前・値段を持ったオブジェクト」の配列であることがほとんどです。第2章で作った ProductCard に、1件ずつデータをわたして並べてみましょう。',
      ],
      examples: [
        {
          code: `function ProductCard({ name, price }) {\n  return (\n    <div className="card">\n      <h2>{name}</h2>\n      <p>{price} 円</p>\n    </div>\n  )\n}\n\nfunction ProductList() {\n  const products = [\n    { id: 1, name: 'ボールペン', price: 120 },\n    { id: 2, name: 'ノート', price: 200 },\n    { id: 3, name: '消しゴム', price: 80 },\n  ]\n  return (\n    <div>\n      {products.map((p) => (\n        <ProductCard key={p.id} name={p.name} price={p.price} />\n      ))}\n    </div>\n  )\n}`,
          result: `ボールペン  120 円\nノート     200 円\n消しゴム    80 円`,
          note: '1件（p）ごとに、その中身を props として ProductCard にわたしています。データが3件でも1000件でも、書くコードはこの数行のままです。',
        },
      ],
    },
    {
      id: 'key',
      heading: '3-3. key ― React が「どれがどれか」を見分ける目印',
      body: [
        'map で部品を並べるときは、各要素に key（キー）を付けます。key は「並んだ部品のうち、どれがどれか」を React が見分けるための目印です。',
        'なぜ必要か。たとえばリストの真ん中に1件追加されたとき、React は「全部作り直す」のではなく「変わった所だけ」を効率よく描き直したい。そのために「この部品はさっきのどれと同じか」を key で照合するのです。',
        'key には「他と重複しない、変わらない値」を使います。ふつうはデータの id が最適です。',
      ],
      examples: [
        {
          code: `// ✅ 良い：id のような一意で安定した値\n{products.map((p) => <ProductCard key={p.id} ... />)}\n\n// ⚠️ 避けたい：配列の番号（index）を key にする\n{products.map((p, index) => <ProductCard key={index} ... />)}`,
          note: 'id があるなら必ず id を使いましょう。並べ替えや途中への追加・削除があると、index を key にしたリストは表示が崩れることがあります。',
        },
      ],
      callouts: [
        {
          kind: 'warn',
          text: 'key を付け忘れると、開発中にコンソールへ「key を付けてください」という警告が出ます。バグの温床なので、map で並べたら必ず key を付ける、と習慣にしましょう。',
        },
      ],
    },
    {
      id: 'key-placement',
      heading: '3-4. key はどこに付ける？',
      body: [
        'key は「map が返すいちばん外側の要素」に付けます。中の <h2> などではなく、くり返しの単位そのものに付けるのがルールです。',
        'また、key は React 用の特別な目印なので、props として子の部品に届くわけではありません（中で props.key としては読めません）。必要なら id を別の props として明示的にわたします。',
      ],
      examples: [
        {
          code: `// key は map のいちばん外側（ここでは ProductCard）に付ける\n{products.map((p) => (\n  <ProductCard key={p.id} id={p.id} name={p.name} price={p.price} />\n))}`,
          note: 'key={p.id} は React のための目印。もし子の中でも id を使いたいなら、id={p.id} のように別途わたします。',
        },
      ],
    },
    {
      id: 'empty',
      heading: '3-5. 0件のときの表示も忘れずに',
      body: [
        'データが0件のとき、map は何も返しません（空っぽ）。すると画面に何も出ず、ユーザーは「壊れた？」と不安になります。0件のときは専用のメッセージを出すのが親切です。',
        '「0件かどうか」で表示を出し分けるくわしいやり方は、次の第4章（条件で出し分ける）で学びます。ここでは「0件のケアが要る」とだけ覚えておきましょう。',
      ],
      examples: [
        {
          code: `function ProductList({ products }) {\n  if (products.length === 0) {\n    return <p>商品がありません。</p>\n  }\n  return (\n    <div>\n      {products.map((p) => (\n        <ProductCard key={p.id} name={p.name} price={p.price} />\n      ))}\n    </div>\n  )\n}`,
          note: 'products.length === 0（配列の件数が0）なら、一覧の代わりにメッセージを返しています。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '3-6. この章のまとめ',
      body: [
        '「同じ部品をデータの数だけ並べる」には map を使い、データの配列を JSX の配列に変える。波カッコ { } の中に書く。',
        'map で並べた各要素には key（重複しない・安定した目印、ふつうは id）を必ず付ける。key は map のいちばん外側の要素に付け、配列の index は避ける。0件のときの表示もケアする。',
        '次の章では、その「0件ならメッセージ」のような、条件によって表示を出し分ける書き方（&& や三項演算子）をくわしく学びます。',
      ],
    },
  ],
}

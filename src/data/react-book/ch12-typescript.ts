import type { ReactChapter } from './types'

// 第12章「TypeScript の基礎 ― 型でまちがいを防ぐ」。プログラミング初心者向け。
export const ch12TypeScript: ReactChapter = {
  id: 'typescript',
  num: 12,
  title: 'TypeScript の基礎 ― 型でまちがいを防ぐ',
  summary: 'これまでのコードに出てきた : string などの「型」の正体が TypeScript です。データの形をあらかじめ決めておくと、打ち間違いや勘違いを書いている最中に気づけます。React で使う最低限を学びます。',
  intro: [
    'これまでのコード例にこっそり出ていた { name }: { name: string } のような書き方。これは TypeScript（タイプスクリプト）の「型注釈」です。',
    'TypeScript は JavaScript に「型（データの種類）」を足したものです。型を書いておくと、エディタや変換時に「そこは数値じゃなくて文字だよ」と教えてくれて、バグを実行前に防げます。React の開発ではほぼ標準で使われます。',
  ],
  sections: [
    {
      id: 'why',
      heading: '12-1. なぜ型があるとうれしいのか',
      body: [
        'JavaScript は自由なぶん、「数値のつもりが文字だった」「あるはずのプロパティが無かった」というミスに、動かしてみるまで気づけません。',
        'TypeScript なら、書いている最中にエディタが赤線で教えてくれます。「product に price という項目は無いよ」「ここは number を渡してね」と。早く気づけるほど、修正は簡単です。',
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：型（type）＝「このデータは何の種類か」の決まり。string（文字）、number（数値）、boolean（真偽）など。型を書くことを「型注釈をつける」と言います。',
        },
      ],
    },
    {
      id: 'basics',
      heading: '12-2. 基本の型と変数への注釈',
      body: [
        '変数や引数の後ろに : 型 と書くと、「この値はこの型ですよ」と宣言できます。よく使う基本の型を覚えましょう。',
      ],
      table: {
        headers: ['型', '意味', '例'],
        rows: [
          ['string', '文字列', "'ボールペン'"],
          ['number', '数値（整数も小数も）', '120'],
          ['boolean', '真偽値', 'true / false'],
          ['string[]', '文字列の配列', "['a', 'b']"],
          ['型 | null', 'その型 か null（無し）', 'string | null'],
        ],
      },
      examples: [
        {
          code: `const name: string = 'ボールペン'\nconst price: number = 120\nconst tags: string[] = ['文具', '人気']\n\nfunction toYen(value: number): string {\n  return value + ' 円'\n}`,
          note: 'function toYen(value: number): string は「number を受け取り string を返す関数」。引数 value に文字を渡すと、その場でエラーで教えてくれます。',
        },
      ],
    },
    {
      id: 'interface',
      heading: '12-3. オブジェクトの形を決める ― interface / type',
      body: [
        '「商品はこういう形（id・名前・価格を持つ）」というデータの設計図を、interface か type で作れます。これがあると、その形に合わないデータを弾けます。',
      ],
      examples: [
        {
          code: `interface Product {\n  id: number\n  name: string\n  price: number\n  imageUrl?: string   // ? は「あってもなくてもよい」項目\n}\n\nconst pen: Product = {\n  id: 1,\n  name: 'ボールペン',\n  price: 120,\n  // imageUrl は ? なので省略してOK\n}`,
          note: 'id・name・price は必須、imageUrl? は任意。もし price を書き忘れたり、price に文字を入れたりすると、エディタがすぐ赤線で教えてくれます。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'interface と type はどちらもオブジェクトの形を表せます。まずは「オブジェクトの形には interface」と覚えておけば十分。違いを気にするのは後からで大丈夫です。',
        },
      ],
    },
    {
      id: 'props-type',
      heading: '12-4. props に型を付ける（Reactでの定番）',
      body: [
        'React で TypeScript を使う最大の場面が「props の型付け」です。部品がどんな props を受け取るかを型で書いておくと、渡し忘れや型違いをすぐ発見できます。第2章の ProductCard に型を付けてみましょう。',
      ],
      examples: [
        {
          code: `interface ProductCardProps {\n  name: string\n  price: number\n  soldOut?: boolean\n}\n\nfunction ProductCard({ name, price, soldOut }: ProductCardProps) {\n  return (\n    <div className="card">\n      <h2>{name}</h2>\n      <p>{price} 円</p>\n      {soldOut && <p>売り切れ</p>}\n    </div>\n  )\n}`,
          note: '{ name, price, soldOut }: ProductCardProps が「この部品の props はこの形」という宣言。<ProductCard name="ペン" /> のように price を渡し忘れると、その場でエラーになります。',
        },
      ],
    },
    {
      id: 'generics',
      heading: '12-5. useState やデータ取得での型',
      body: [
        'useState は初期値から型を推測してくれます。最初が空などで推測できないときは、useState<型>(初期値) と山カッコで型を教えます。',
        'API から取ってくるデータにも型を付けておくと、その後の products.map(...) で「name は文字」と分かり、打ち間違いを防げます。',
      ],
      examples: [
        {
          code: `// 推測できる場合（0 から number と分かる）\nconst [count, setCount] = useState(0)\n\n// 推測できない場合は型を明示（最初は空配列）\nconst [products, setProducts] = useState<Product[]>([])\n\n// 取得データにも型を付ける\nasync function load(): Promise<Product[]> {\n  const res = await fetch('/api/products')\n  return res.json()\n}`,
          note: 'useState<Product[]>([]) は「Product の配列を入れる状態。最初は空」。これで products.map((p) => p.name) の p に補完が効き、p.nema のような打ち間違いも防げます。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：useState<Product[]> の < > はジェネリクスといい、「中に入る型を後から指定するしくみ」です。今は「空っぽで始まる状態には型を明示する」とだけ覚えれば十分です。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '12-6. この章のまとめ',
      body: [
        'TypeScript は JavaScript に型を足したもの。: string などの注釈で「データの種類」を宣言し、打ち間違いや型違いを実行前に発見できる。基本は string / number / boolean / 配列 / | null。',
        'オブジェクトの形は interface（または type）で決める（? は任意項目）。React では props に型を付けるのが定番。useState は推測まかせ、空で始まるものは useState<型>([]) と明示する。',
        'ここから先（第13〜15章）は、一歩進んだフック（useRef・useMemo・useReducer）と、アプリを軽く保つための「再レンダリングと最適化」を扱います。',
      ],
    },
  ],
}

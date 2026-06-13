import type { EcChapter } from './types'

// EC コード解説 #10「型定義の読み方」。
export const ch10Types: EcChapter = {
  id: 'types',
  num: 10,
  title: '型定義の読み方 ― api/types.ts とサーバーの対応',
  summary: '最終回。サーバーが返す JSON の「設計図」である api/types.ts を読みます。型がどこで効くのか、null をどう扱うのか、Paginated<T> のような汎用の型まで。ここが分かると、コード全体の見通しが一気に良くなります。',
  relatedReact: ['第12章 TypeScript', '第11章 API 通信'],
  intro: [
    'EC フロントの土台には、api/types.ts という「サーバーが返すデータの形」を定義したファイルがあります。最後にこれを読み、本シリーズを締めくくります。',
    '型は、コードを書く最中に間違いを教えてくれる“地図”です。この地図がしっかりしていると、商品・カート・注文…どのデータを扱うときも迷いません。',
  ],
  sections: [
    {
      id: 'shape',
      heading: '10-1. サーバーの JSON を型にする',
      body: [
        'バックエンド（Django）が返す JSON の形を、そのまま interface（第12章）で写し取っています。Product なら id・名前・画像・SKU の配列…という具合。これが「この変数にはこういう項目がある」という地図になります。',
      ],
      examples: [
        {
          file: 'src/api/types.ts',
          code: `export interface Product {\n  id: number\n  product_code: string\n  product_name: string\n  category_code: string\n  category_name: string\n  manufacturer_name: string\n  description: string\n  image_url: string | null     // 画像は無いこともある\n  skus: Sku[]                  // バリエーションの配列\n}`,
          note: 'コメントに「catalog/serializers.py と対応させる」とある通り、サーバー側の出力と1対1で揃えています。skus: Sku[] のように、型の中で別の型（Sku）を使える。この地図のおかげで、product.product_name と打てば補完が効き、product.nema のような打ち間違いは即エラーになります（第12章）。',
        },
      ],
    },
    {
      id: 'null',
      heading: '10-2. null を含む型 ― 「無いかもしれない」を型で表す',
      body: [
        '価格や画像は「未設定（null）」があり得ます。それを price: number | null のように型で表しておくと、使うときに「null かもしれない」ことを忘れず扱えます（#7 の priceLabel や #8 の price がまさにこれを処理していました）。',
      ],
      examples: [
        {
          file: 'src/api/types.ts',
          code: `export interface Sku {\n  id: number\n  sku_code: string\n  size_info: string\n  color_info: string\n  price: number | null            // 価格未設定なら null\n  price_incl_tax: number | null\n}`,
          note: 'number | null は「数値 か null のどちらか」（第12章）。これがあるおかげで、price をそのまま formatYen に渡そうとすると「null かもしれないよ」と TypeScript が警告し、price != null ? … のチェックを促してくれます。バグを書く前に気づけるわけです。',
        },
      ],
    },
    {
      id: 'generic',
      heading: '10-3. 汎用の型 ― Paginated<T>',
      body: [
        '一覧 API の戻り値は「総件数 count・次/前のURL・結果の配列 results」という共通の形（DRF のページネーション）。これを Paginated<T> という“中身の型を後から指定できる”型で表しています。第12章で触れたジェネリクスの実例です。',
      ],
      examples: [
        {
          file: 'src/api/types.ts',
          code: `export interface Paginated<T> {\n  count: number\n  next: string | null\n  previous: string | null\n  results: T[]              // 中身の型は使うときに決める\n}\n\n// 使う側（catalog.ts）\nfunction fetchProducts(...): Promise<Paginated<Product>> { ... }\n//                                    ↑ T = Product なので results は Product[]`,
          note: 'Paginated<Product> なら results は Product[]、Paginated<Order> なら Order[]。<T> は「箱の形（count/next/results）は同じで、中身だけ差し替える」しくみ（第12章）。同じ“ページの形”を、商品でも注文でも使い回せます。',
        },
      ],
    },
    {
      id: 'where',
      heading: '10-4. 型はどこで効くのか',
      body: [
        'ここまで読んできた各所で、この型たちが静かに効いていました。改めて整理すると、型が活躍するのは主に次の3か所です。',
      ],
      table: {
        headers: ['場所', '書き方', '効果'],
        rows: [
          ['props', '{ product }: { product: Product }', '渡し忘れ・型違いを防ぐ（#7）'],
          ['useState', 'useState<Product | null>(null)', '中身の形が分かり補完が効く（#6/#8）'],
          ['通信の戻り値', 'apiFetch<Order>(...)', '受け取ったデータの形が確定する（#3/#9）'],
        ],
      },
      callouts: [
        {
          kind: 'tip',
          text: '型は「最初に少し書く手間」と引き換えに、その後ずっと「間違いを早く教えてくれる」「他人（未来の自分）がコードを読みやすい」という見返りをくれます。api/types.ts はその“地図の原本”です。',
        },
      ],
    },
    {
      id: 'closing',
      heading: '10-5. おわりに ― この本と実コードをつないで',
      body: [
        'お疲れさまでした。#1〜#10 で、EC サイトのフロントを「全体像 → 起動 → 通信 → 認証 → カート → 一覧 → 部品 → 詳細 → 注文の流れ → 型」と一周読み解きました。',
        '振り返ると、出てきたのは全部「React 大全」で学んだ部品でした。コンポーネントと props、state とイベント、useEffect での取得、Context での共有、ルーティング、そして型。実コードとは、それらを目的に合わせて組み合わせたものに過ぎません。',
        'これからは、自分で EC のコードを開いて、好きな所から読んでみてください。「これは第○章のあれだ」と分かれば、もう読めます。さらに手を動かしたくなったら、小さな改修（表示を足す、項目を増やす）から始めるのがおすすめです。ここまで読み切ったあなたなら、きっとできます。',
      ],
    },
  ],
}

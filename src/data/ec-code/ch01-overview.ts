import type { EcChapter } from './types'

// EC コード解説 #1「全体像」。
export const ch01Overview: EcChapter = {
  id: 'overview',
  num: 1,
  title: '全体像 ― ディレクトリ構成とデータの流れ',
  summary: 'まず EC サイトのフロントエンドが、どんなファイルでできていて、データがどう流れるのかを地図として把握します。個々のコードを読む前に、全体の見取り図を持っておきましょう。',
  relatedReact: ['第1章 JSX', '第8章 ルーティング', '第11章 API 通信'],
  intro: [
    'この EC サイトのフロントは、React 大全で学んだ要素（コンポーネント・props・state・Context・ルーティング・通信・型）が、ほぼそのまま実戦投入されています。',
    'いきなり1ファイルずつ読むと迷子になるので、最初にディレクトリ構成と「データの流れ」を地図にします。',
  ],
  sections: [
    {
      id: 'stack',
      heading: '1-1. 技術スタック',
      body: [
        'EC フロントは次の技術でできています。React 大全と同じ顔ぶれです。',
      ],
      table: {
        headers: ['技術', '役割'],
        rows: [
          ['React 19 + TypeScript', 'UI を部品で組み立てる（型つき）'],
          ['Vite', '開発サーバー・ビルド'],
          ['react-router 7', 'ページの切り替え（第8章）'],
          ['Tailwind CSS', '見た目（第16章）'],
          ['fetch（素のまま）', 'バックエンド(Django)との通信（第11章）'],
        ],
      },
      callouts: [
        {
          kind: 'note',
          text: 'データ取得ライブラリ（TanStack Query 等）は入れず、素の fetch で書かれています。第20章で「将来の選択肢」として触れた通り、MVP ではシンプルさを優先した形です。',
        },
      ],
    },
    {
      id: 'dirs',
      heading: '1-2. ディレクトリ構成 ― 役割ごとに分かれている',
      body: [
        'src/ の中は「役割ごと」にフォルダ分けされています。これは規模が大きくなっても迷わないための定番の整理です。',
      ],
      examples: [
        {
          code: `src/\n├─ main.tsx          … 起点。Provider を重ねて App を描く\n├─ App.tsx           … ルーティング（URL→ページ）とレイアウト\n├─ api/              … バックエンド通信（種類ごとにファイル）\n│   ├─ http.ts       … 共通の通信処理（トークン付与・再試行）\n│   ├─ types.ts      … サーバーが返す JSON の型\n│   ├─ catalog.ts    … 商品・カテゴリ・在庫\n│   ├─ cart.ts       … カート操作\n│   ├─ auth.ts       … ログイン・登録・me\n│   └─ orders.ts     … 注文\n├─ auth/             … ログイン状態の共有\n│   ├─ AuthContext.tsx\n│   └─ tokenStore.ts … トークンの保管(localStorage)\n├─ cart/CartContext.tsx … カート状態の共有\n├─ components/       … 使い回す部品（ProductCard, Header, Toast …）\n├─ pages/            … 1画面 = 1ファイル（ProductsPage, CartPage …）\n└─ utils/format.ts   … 表示用フォーマッタ（金額など）`,
          lang: 'text',
          note: '「api＝サーバーとの会話」「auth/cart＝アプリ全体で共有する状態」「components＝部品」「pages＝画面」と、役割で分かれています。どこに何があるか、この地図を頭に入れておくと読むのが速くなります。',
        },
      ],
    },
    {
      id: 'screens',
      heading: '1-3. 画面（ページ）の一覧',
      body: [
        'pages/ の中身がそのまま「サイトの画面」です。URL との対応は次章（App.tsx）で見ます。',
      ],
      table: {
        headers: ['ページ', 'URL', 'ログイン必須'],
        rows: [
          ['商品一覧 ProductsPage', '/', '不要'],
          ['商品詳細 ProductDetailPage', '/products/:id', '不要'],
          ['ログイン LoginPage', '/login', '不要'],
          ['カート CartPage', '/cart', '必要'],
          ['注文確認 CheckoutPage', '/checkout', '必要'],
          ['注文履歴 / 詳細 Orders…', '/orders, /orders/:id', '必要'],
          ['プロフィール ProfilePage', '/profile', '必要'],
        ],
      },
    },
    {
      id: 'flow',
      heading: '1-4. データの流れ ― ボタンから画面更新まで',
      body: [
        'EC サイトのデータの流れは、おおむね一方向です。「画面の操作 → 共有状態(Context)や API → 結果を state に → 画面が更新」。React 大全で学んだ流れそのものです。',
        '例として「カートに入れる」を押したときの流れを図にします。',
      ],
      mermaid: `flowchart TD\n  A["AddToCartButton を押す"] --> B["useCart().add() を呼ぶ"]\n  B --> C["api/cart.ts → apiFetch でサーバーへ"]\n  C --> D["サーバーが最新カートを返す"]\n  D --> E["CartContext が state を更新"]\n  E --> F["ヘッダーの個数バッジ・カート画面が更新"]`,
      callouts: [
        {
          kind: 'tip',
          text: '「画面 → 共有状態/通信 → state → 画面」。この一周をイメージできると、どのファイルが何を担当しているか（ボタン=components、状態=Context、通信=api）が見えてきます。次章から、この地図の各パーツを実コードで見ていきます。',
        },
      ],
    },
  ],
}

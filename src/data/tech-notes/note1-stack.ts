import type { TechNote } from './types'

// 技術メモ1: 技術スタック（使ったライブラリと役割）。
export const note1Stack: TechNote = {
  id: 'stack',
  num: 1,
  title: '技術スタック ― 使ったライブラリと役割',
  summary: 'WMS をどんな部品（ライブラリ）で組み立てたかを、一つずつ「何のためのものか」がわかるように紹介します。むずかしい名前が並びますが、役割だけ押さえれば大丈夫です。',
  source: 'pyproject.toml / templates/a/base.html / docker-compose.yml',
  intro: [
    'WMS は「サーバー側＝Python（Django）」「画面側＝HTML＋素の JavaScript」「データの保管＝PostgreSQL」という、しっかりした王道の構成で作りました。',
    'まずは全体像、そのあと一つずつの役割を見ていきます。',
  ],
  sections: [
    {
      id: 'overview',
      heading: '1-1. 全体像 ― 3つの登場人物',
      body: [
        '大きく分けると、(1) ブラウザ（画面）、(2) Django（サーバー）、(3) PostgreSQL（データベース）の3人が登場します。ブラウザの操作を Django が受け取り、ORM で PostgreSQL を読み書きして、HTML を作って返す、という流れです。',
      ],
      mermaid: `flowchart LR\n  A["ブラウザ<br/>HTML + 素のJS + Bootstrap"] --> B["Django<br/>View から ORM"]\n  B --> C["PostgreSQL<br/>データベース"]\n  C --> B\n  B --> A`,
      callouts: [
        {
          kind: 'note',
          text: 'WMS の画面は「サーバーで HTML を組み立てて返す」方式（サーバーサイドレンダリング）です。React のような画面用フレームワークは使わず、素の JavaScript で動的な部分だけ足しています。',
        },
      ],
    },
    {
      id: 'backend',
      heading: '1-2. サーバー側（Python）のライブラリ',
      body: ['Python の依存は pyproject.toml に書かれています。役割はこうです。'],
      table: {
        headers: ['ライブラリ', '役割（何のため？）'],
        rows: [
          ['Django', '土台のフレームワーク。URL・画面・ORM・認証など全部入り'],
          ['djangorestframework (DRF)', 'EC 連携用の API（JSON をやり取りする窓口）を作る'],
          ['drf-spectacular', 'API の仕様書（Swagger UI）を自動生成する'],
          ['psycopg', 'Python から PostgreSQL に接続するドライバ（つなぎ役）'],
          ['whitenoise', 'CSS/JS などの静的ファイルを本番で配信する'],
          ['gunicorn', '本番でアプリを動かすサーバー（runserver の本番版）'],
          ['django-cors-headers', '別ドメイン（EC サイト）からの API 呼び出しを許可する'],
          ['python-dotenv', '.env ファイルから設定（DB 接続情報・APIキー）を読み込む'],
        ],
      },
      callouts: [
        {
          kind: 'note',
          text: 'ことば：ライブラリ＝「よくある機能を、誰かが作って再利用できるようにまとめた部品」。自分で全部作らず、部品を組み合わせて作るのが現代の開発です。',
        },
      ],
    },
    {
      id: 'frontend',
      heading: '1-3. 画面側（ブラウザ）の道具',
      body: [
        '画面は Django のテンプレート（HTML のひな型）で作り、見た目は Bootstrap、動的な動きは素の JavaScript で付けています。npm（JS のパッケージ管理）は使わず、必要なものは CDN（配信サービス）から読み込むシンプルな構成です。',
      ],
      table: {
        headers: ['道具', '役割'],
        rows: [
          ['Django テンプレート', 'サーバー側で HTML を組み立てる仕組み'],
          ['Bootstrap 5', 'ボタンやフォームの見た目を整える CSS の部品集（CDN 読み込み）'],
          ['Bootstrap Icons', 'カメラやチェックなどのアイコン'],
          ['素の JavaScript', 'カメラ起動や AJAX など、動的な部分だけ自前で実装'],
          ['BarcodeDetector', 'ブラウザ標準のバーコード読取機能（技術メモ3でくわしく）'],
        ],
      },
    },
    {
      id: 'infra',
      heading: '1-4. 開発・実行まわり',
      body: ['開発を快適にし、品質を保つための道具たちです。'],
      table: {
        headers: ['道具', '役割'],
        rows: [
          ['PostgreSQL', '本番でも使う本格的なデータベース'],
          ['Docker Compose', 'PostgreSQL をコマンド一発で起動する（環境構築をラクに）'],
          ['uv', 'Python のパッケージ管理・実行（pip の速い版）'],
          ['ruff', 'コードの書き方チェック＆自動整形（きれいに保つ）'],
          ['GitHub Actions', 'push のたびに自動でチェック（CI）を回す'],
        ],
      },
    },
    {
      id: 'auth',
      heading: '1-5. 認証と画面の出し分け',
      body: [
        'ログインは Django 標準のセッション認証です。さらに、利用者の役割（superuser / 事務所スタッフ / ハンディ作業者）で見られる画面を分けています。',
        'ハンディ（携帯端末）の作業者は、専用のミドルウェア（HandheldOnlyMiddleware）でハンディ画面だけに制限しています。EC 連携の API だけは別で、API キー認証を使います（技術メモ4）。',
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：ミドルウェア＝「リクエストが View に届く前後に、共通の処理を挟む仕組み」。ここでは「この人はハンディ作業者だから、ハンディ画面以外はブロック」を全リクエストに対して効かせています。',
        },
      ],
    },
  ],
}

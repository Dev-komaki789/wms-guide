import type { TechNote } from './types'

// 技術メモ4: API（EC 連携・DRF・APIキー・Swagger）。
export const note4Api: TechNote = {
  id: 'api',
  num: 4,
  title: 'API ― EC サイトとつなぐ窓口（DRF）',
  summary: 'WMS は人が使う画面だけでなく、EC サイト（ネット通販）と機械どうしでつながる API も持っています。その作り方を、Django REST Framework を使った実装で紹介します。',
  source: 'api/（urls.py / views.py / authentication.py）',
  intro: [
    'これまでの画面は「人がブラウザで操作する」ものでした。でも EC サイトからの注文は、人ではなくプログラムどうしで自動的にやり取りしたいですよね。そのための窓口が API です。',
    'WMS では Django REST Framework（DRF）というライブラリで、JSON をやり取りする API を作りました。',
  ],
  sections: [
    {
      id: 'what-is-api',
      heading: '4-1. API ってなに？',
      body: [
        'API は「プログラムどうしの受付窓口」です。画面が HTML を返すのに対し、API は JSON（プログラムが扱いやすいデータ形式）を返します。EC サイトが「この注文をお願い」と JSON を送ると、WMS が受け取って処理し、結果を JSON で返します。',
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：JSON（ジェイソン）＝ { "sku_code": "SKU-001", "quantity": 3 } のような、プログラムが読み書きしやすいデータの書き方。API のやり取りでよく使われます。',
        },
      ],
    },
    {
      id: 'endpoints',
      heading: '4-2. 用意した窓口（エンドポイント）',
      body: [
        'DRF の「ルーター」を使うと、ViewSet という部品から URL を自動で作れます。WMS では参照系（読み取り）と、注文登録の窓口を用意しました。',
      ],
      table: {
        headers: ['URL', 'メソッド', '役割'],
        rows: [
          ['/api/skus/ ・ /api/skus/{id}/', 'GET', 'SKU の一覧・1件取得'],
          ['/api/products/ ・ /api/categories/', 'GET', '商品・カテゴリの参照'],
          ['/api/stock/{sku_code}/', 'GET', 'SKU コードで在庫を問い合わせ'],
          ['/api/orders/', 'POST', 'EC からの注文を出荷指示として登録'],
        ],
      },
      code: [
        {
          label: 'Python (DRF)',
          code: `# 読み取り専用の窓口は ReadOnlyModelViewSet で一覧＋詳細が自動でできる\nclass SkuViewSet(viewsets.ReadOnlyModelViewSet):\n    queryset = Sku.objects.filter(is_active=True)\n    serializer_class = SkuSerializer\n\n# ルーターに登録するだけで /api/skus/ と /api/skus/{id}/ ができる\nrouter.register(r'skus', SkuViewSet)`,
          note: 'ViewSet ＋ ルーターで、定番の「一覧・詳細」エンドポイントを少ないコードで用意できます。',
        },
      ],
    },
    {
      id: 'order',
      heading: '4-3. 注文の受付 ― /api/orders/（いちばんの山場）',
      body: [
        'EC からの注文を受け取る POST /api/orders/ が、この API の主役です。やることは盛りだくさんで、(1) 中身の検証、(2) SKU の存在チェック、(3) 出荷指示の作成、(4) 在庫引き当て＋ピッキングリスト生成（＝技術メモ2の出荷起動）まで自動で行います。',
        '全体を transaction.atomic で囲み、在庫が足りなければ全部取り消して 409（在庫不足）を返し、成功すれば 201（作成成功）で出荷指示番号を返します。',
      ],
      code: [
        {
          label: 'HTTP（EC → WMS のリクエスト例）',
          code: `POST /api/orders/\nAuthorization: Bearer <APIキー>\nContent-Type: application/json\n\n{\n  "external_order_id": "EC-12345",\n  "items": [\n    { "sku_code": "SKU-001", "quantity": 3 },\n    { "sku_code": "SKU-002", "quantity": 1 }\n  ]\n}`,
          note: '受け取った WMS は、出荷指示を作って在庫を引き当て、ピッキングリストまで生成します。在庫不足なら 409 ですべて取り消し。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'この1本の API の中で、技術メモ2（出荷起動）と ORM 大全 第10章（トランザクション）の知識がまとめて使われています。「人の画面」と「機械の API」が、同じ中身の処理を共有しているわけです。',
        },
      ],
    },
    {
      id: 'auth',
      heading: '4-4. 認証 ― API キーで「許可された相手か」を確認',
      body: [
        '画面はログイン（セッション）で守りますが、機械どうしの API は API キーで守ります。EC サイトは Authorization: Bearer <キー> というヘッダにキーを付けて送り、WMS はそれをサーバーの設定（WMS_API_KEY）と照合します。一致すれば通し、違えば断ります。',
        'キーはソースコードには書かず、サーバーの環境変数（.env）に置きます。これは「鍵をプログラムに直書きしない」という安全の基本です。',
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：Bearer（ベアラー）トークン＝「これを持っている人を信頼する」方式の合言葉。ヘッダに付けて送り、サーバー側の正解と一致するか確かめます。',
        },
      ],
    },
    {
      id: 'swagger',
      heading: '4-5. 仕様書を自動生成 ― Swagger UI',
      body: [
        'API は「どんな窓口が、どんな入力を受け、何を返すか」を相手に伝える仕様書が大切です。WMS では drf-spectacular というライブラリで、コードから仕様書（Swagger UI）を自動生成しています。手で書くより正確で、コードを直せば仕様書も追従します。',
        'この仕様書ページだけは API キー無しで見られるようにしてあります（相手がまず仕様を確認できるように）。',
      ],
      code: [
        {
          label: 'URL',
          code: `https://komaki-wms.com/api/schema/swagger-ui/`,
          note: '実際に動いている API の仕様書。ブラウザで開くと、各エンドポイントの入力・出力を確認できます。',
        },
      ],
    },
  ],
}

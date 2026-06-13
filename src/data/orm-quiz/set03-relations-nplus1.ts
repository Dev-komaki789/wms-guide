import type { OrmQuizSet } from './types'

// 問題集 セット3「リレーションと N+1」。
export const set03RelationsNplus1: OrmQuizSet = {
  id: 'relations-nplus1',
  num: 3,
  level: '中級',
  title: 'リレーションと N+1 ― select_related / prefetch_related',
  summary: '関連先をまとめて取得して、DB への問い合わせ回数を減らす練習です。「N+1 問題」という性能の落とし穴と、その直し方を身につけます。',
  intro: [
    'ループの中で関連先にアクセスすると、知らないうちに問い合わせが大量に飛ぶ「N+1 問題」が起きます。これを防ぐのが select_related と prefetch_related です。',
  ],
  problems: [
    {
      question: 'ピッキングリストを一覧表示するついでに、各リストの倉庫（warehouse）とエリア（area）の名前も表示します。関連先を「まとめて1クエリで」取得してください。',
      hint: 'ForeignKey（多対1）の先取りは select_related。',
      orm: `PickingList.objects.select_related(\n  'warehouse', 'area'\n)`,
      sql: `SELECT picking_lists.*,\n       warehouses.*, areas.*\nFROM picking_lists\nJOIN warehouses\n  ON warehouses.id = picking_lists.warehouse_id\nJOIN areas\n  ON areas.id = picking_lists.area_id;`,
      explanation: [
        'select_related は ForeignKey（多対1）の関連先を、JOIN を使って「最初の1クエリでまとめて」取ってきます。これで pl.warehouse.warehouse_name と書いても追加の問い合わせが起きません。',
        '指定しないと、ループで pl.warehouse にアクセスするたびに DB へ問い合わせが飛びます（これが N+1）。select_related はその追加問い合わせをゼロにします。',
      ],
      points: ['select_related', 'JOIN', 'N+1対策'],
    },
    {
      question: '各ピッキングリストと、その明細（related_name="items"。1対多）を、まとめて取得してください。',
      hint: '1対多・多対多の先取りは prefetch_related。',
      orm: `PickingList.objects.prefetch_related(\n  'items'\n)`,
      sql: `-- リスト本体（1回目）\nSELECT * FROM picking_lists;\n\n-- 明細をまとめて（2回目）\nSELECT * FROM picking_list_items\nWHERE picking_list_id IN (1, 2, 3, ...);`,
      explanation: [
        'prefetch_related は「1対多」「多対多」の関連をまとめて取ります。select_related のように JOIN で1クエリにするのではなく、「親をまとめて取る → 子をまとめて取る」の合計2クエリにして、Django が裏でひも付けてくれます。',
        '使い分けの目安：ForeignKey（多対1、たどると1件）なら select_related、逆参照や ManyToMany（たどると複数件）なら prefetch_related。',
      ],
      points: ['prefetch_related', '1対多', 'N+1対策'],
    },
    {
      question: '次のコードは N+1 問題が起きています。原因と直し方を答えてください。\n\nfor pl in PickingList.objects.all():\n    print(pl.warehouse.warehouse_name)',
      hint: 'ループの中で関連先にアクセスしている点に注目。',
      orm: `# ❌ N+1（リスト N 件ぶん、追加の問い合わせが飛ぶ）\nfor pl in PickingList.objects.all():\n    print(pl.warehouse.warehouse_name)\n\n# ✅ 直し方：先に select_related でまとめる\nfor pl in PickingList.objects.select_related('warehouse'):\n    print(pl.warehouse.warehouse_name)`,
      sql: `-- ❌ before: 1 + N 回\nSELECT * FROM picking_lists;          -- 1回\nSELECT * FROM warehouses WHERE id=1;  -- 各行ごと\nSELECT * FROM warehouses WHERE id=2;  -- …N回\n\n-- ✅ after: 1 回（JOIN）\nSELECT picking_lists.*, warehouses.*\nFROM picking_lists\nJOIN warehouses ON ...;`,
      explanation: [
        'N+1 問題とは、「一覧を取る1回」＋「各行で関連先を取る N 回」で、合計 1+N 回も問い合わせてしまう状態です。リストが100件なら101回。これが性能の大きな落とし穴です。',
        '直し方は、ループの前に select_related(\'warehouse\') を付けて関連先を先取りすること。これで JOIN による1クエリにまとまり、ループ中の追加問い合わせがゼロになります。',
      ],
      points: ['N+1問題', 'select_related'],
    },
    {
      question: '在庫（StockBalance）を、ロケーション（location）と SKU（sku）の情報つきで、在庫数の多い順に取得してください。',
      hint: 'select_related で2つの ForeignKey をまとめ、order_by で並べる。',
      orm: `StockBalance.objects\n  .select_related('location', 'sku')\n  .order_by('-quantity')`,
      sql: `SELECT stock_balances.*, locations.*, skus.*\nFROM stock_balances\nJOIN locations\n  ON locations.id = stock_balances.location_id\nJOIN skus\n  ON skus.id = stock_balances.sku_id\nORDER BY stock_balances.quantity DESC;`,
      explanation: [
        'select_related には複数の関連先をカンマで並べられます。location と sku の両方を JOIN でまとめて取得します。',
        'そのうえで order_by(\'-quantity\') で在庫数の多い順（DESC）に並べます。「先取り」と「並べ替え」は自由につなげて書けます。',
      ],
      points: ['select_related（複数）', 'order_by'],
    },
    {
      question: 'ピッキング明細（PickingListItem）の一覧で、各明細の SKU と、その SKU の商品名（item → sku → product）まで、まとめて取得してください。関連を「深く」たどります。',
      hint: 'select_related も __ で深くたどれる。',
      orm: `PickingListItem.objects.select_related(\n  'sku__product'\n)`,
      sql: `SELECT picking_list_items.*, skus.*, products.*\nFROM picking_list_items\nJOIN skus ON skus.id = picking_list_items.sku_id\nJOIN products ON products.id = skus.product_id;`,
      explanation: [
        'select_related(\'sku__product\') は「sku をたどり、さらにその product まで」JOIN で先取りします。__ でたどる深さは1段に限りません。',
        'これで item.sku.product.product_name と書いても追加の問い合わせが起きません。多対1（ForeignKey）が連続するときは、まとめて select_related に書けます。',
      ],
      points: ['select_related（多段 __）', 'JOIN'],
    },
    {
      question: '各ピッキングリストの明細（items）、さらに各明細の SKU（items → sku）まで、まとめて取得してください。1対多 → 多対1 の入れ子です。',
      hint: 'prefetch_related にも __ で入れ子を書ける。',
      orm: `PickingList.objects.prefetch_related(\n  'items__sku'\n)`,
      sql: `-- リスト（1回目）\nSELECT * FROM picking_lists;\n-- 明細（2回目・SKUをJOIN）\nSELECT pli.*, skus.*\nFROM picking_list_items pli\nJOIN skus ON skus.id = pli.sku_id\nWHERE pli.picking_list_id IN (1, 2, ...);`,
      explanation: [
        'prefetch_related(\'items__sku\') は「明細をまとめて取り、そのときに各明細の SKU も一緒に取る」入れ子の先取りです。',
        '1対多（items）は prefetch、その先の多対1（sku）は内部で JOIN、と Django がうまく組み合わせてくれます。これで pl.items の各 item.sku にアクセスしても追加の問い合わせが起きません。',
      ],
      points: ['prefetch_related（入れ子 __）', '1対多→多対1'],
    },
    {
      question: '各ピッキングリストに、「未ピッキングの明細だけ」をくっつけて取得したいです（取得する関連の中身も絞り込む）。',
      hint: '絞り込んだ関連を付けるには Prefetch オブジェクト。',
      orm: `from django.db.models import Prefetch\n\nPickingList.objects.prefetch_related(\n  Prefetch(\n    'items',\n    queryset=PickingListItem.objects.filter(\n      picked_at__isnull=True\n    ),\n  )\n)`,
      sql: `-- リスト（1回目）\nSELECT * FROM picking_lists;\n-- 明細は「未ピッキングだけ」をまとめて（2回目）\nSELECT * FROM picking_list_items\nWHERE picked_at IS NULL\n  AND picking_list_id IN (1, 2, ...);`,
      explanation: [
        'ただの prefetch_related(\'items\') は「全部の明細」を取りますが、Prefetch(\'items\', queryset=...) を使うと「取ってくる関連そのものを絞り込む」ことができます。',
        'ここでは未ピッキング（picked_at が空）の明細だけを先取り。pl.items.all() がその絞り込み済みの明細になります。「関連の中身も絞りたい」ときの強力な道具です。',
      ],
      points: ['Prefetch オブジェクト', '関連の絞り込み'],
    },
    {
      question: '在庫一覧で、表示に使う「id と quantity だけ」を読み込み、他の列は読み込まないようにしてください。',
      hint: '必要な列だけ読むのは only()。',
      orm: `StockBalance.objects.only(\n  'id', 'quantity'\n)`,
      sql: `SELECT id, quantity\nFROM stock_balances;`,
      explanation: [
        'only(\'id\', \'quantity\') は「指定した列だけを読み込む」指定です。モデルオブジェクトのまま使えますが、中身は最小限。大きな表で表示に使う列が少ないとき、データ転送を減らせます。',
        'もし only で省いた列（例：updated_at）にあとからアクセスすると、その時に追加の問い合わせが飛びます。「使う列だけ only する」のがコツです。',
      ],
      points: ['only()', '列の絞り込み'],
    },
    {
      question: '逆に、重い説明文の列（description）だけは「後回し」にして、それ以外を読み込みたいです（商品 Product）。',
      hint: '特定の列を遅延させるのは defer()。',
      orm: `Product.objects.defer('description')`,
      sql: `SELECT id, product_code, product_name, ...\nFROM products;\n-- description は SELECT しない`,
      explanation: [
        'defer(\'description\') は only の逆で、「その列“以外”を読み込む（指定列は後回し）」指定です。重い列（長い文章・画像データ等）を一覧では読まない、というときに使います。',
        'only は「使う列を挙げる」、defer は「使わない列を挙げる」。一覧で重い列を外したいなら defer が手軽です。',
      ],
      points: ['defer()', '列を後回し'],
    },
    {
      question: 'ピッキングリストを、倉庫（多対1）と明細（1対多）の両方つきで、まとめて取得してください。',
      hint: 'select_related と prefetch_related は同時に使える。',
      orm: `PickingList.objects \n  .select_related('warehouse') \n  .prefetch_related('items')`,
      sql: `-- 本体＋倉庫（JOIN・1回目）\nSELECT picking_lists.*, warehouses.*\nFROM picking_lists\nJOIN warehouses ON ...;\n-- 明細（まとめて・2回目）\nSELECT * FROM picking_list_items WHERE picking_list_id IN (...);`,
      explanation: [
        'select_related（多対1を JOIN で）と prefetch_related（1対多をまとめて）は、同時に使えます。「倉庫は JOIN、明細はまとめて」と、関連の種類に応じて最適な方法を選べます。',
        '一覧画面で「親の関連（倉庫）も、子の一覧（明細）も両方出したい」ときの定番の組み合わせです。',
      ],
      points: ['select_related + prefetch_related'],
    },
    {
      question: '担当者（assigned_to。未割り当てなら null）つきでピッキングリストを取得してください。null があっても1クエリにしたいです。',
      hint: 'null を含む ForeignKey でも select_related でOK（LEFT JOIN になる）。',
      orm: `PickingList.objects.select_related(\n  'assigned_to'\n)`,
      sql: `SELECT picking_lists.*, users.*\nFROM picking_lists\nLEFT JOIN users\n  ON users.id = picking_lists.assigned_to_id;`,
      explanation: [
        'assigned_to は未割り当て（null）があり得ます。null を含む ForeignKey を select_related すると、内部 JOIN ではなく LEFT JOIN になり、未割り当ての行も消えずに残ります。',
        '担当者がいない行では pl.assigned_to が None になります。null かどうかは pl.assigned_to_id で軽くチェックできます（None なら未割り当て）。',
      ],
      points: ['select_related（null可）', 'LEFT JOIN'],
    },
    {
      question: '在庫一覧を、ロケーションのコード（location.location_code）と在庫数だけ、辞書のリストで取得してください。オブジェクトは要りません。',
      hint: 'values() にも __ で関連の列を書ける。',
      orm: `StockBalance.objects.values(\n  'location__location_code', 'quantity'\n)`,
      sql: `SELECT locations.location_code, stock_balances.quantity\nFROM stock_balances\nJOIN locations ON locations.id = stock_balances.location_id;`,
      explanation: [
        'values(\'location__location_code\', \'quantity\') のように、values にも __ で関連先の列を指定できます。必要な列だけを JOIN して辞書で受け取ります。',
        'モデルオブジェクトを作らず辞書で受け取るので軽量。「表示や CSV 出力に、関連先の一部の列だけ欲しい」ときにぴったりです。',
      ],
      points: ['values（関連 __）', 'JOIN'],
    },
    {
      question: '何十万件もある在庫を1件ずつ処理したい。メモリを使いすぎないように取得する方法は？',
      hint: '全件をメモリに載せず少しずつ取るのは iterator()。',
      orm: `for sb in StockBalance.objects.iterator(\n  chunk_size=2000\n):\n    process(sb)`,
      sql: `-- DB から少しずつ（カーソルで）取り出す\nSELECT * FROM stock_balances;`,
      explanation: [
        'ふつうの for は、QuerySet が結果を全部メモリに読み込んでキャッシュします。件数が膨大だとメモリが足りなくなります。',
        'iterator() を使うと、結果をキャッシュせず少しずつ（chunk_size 件ずつ）取り出して処理します。大量データの一括処理でメモリを節約したいときの定番です（その代わりキャッシュは効きません）。',
      ],
      points: ['iterator()', '大量データ', 'メモリ節約'],
    },
    {
      question: '各ピッキングリストの「明細の件数」を一覧に出したい。len(pl.items.all()) をループで呼ぶと N+1 になります。1クエリで件数を出すには？',
      hint: '件数は annotate(Count(...)) でまとめて出す。',
      orm: `from django.db.models import Count\n\nPickingList.objects.annotate(\n  item_count=Count('items')\n)`,
      sql: `SELECT picking_lists.*,\n       COUNT(picking_list_items.id) AS item_count\nFROM picking_lists\nLEFT JOIN picking_list_items\n  ON picking_list_items.picking_list_id = picking_lists.id\nGROUP BY picking_lists.id;`,
      explanation: [
        'ループの中で len(pl.items.all()) を呼ぶと、リストの数だけ件数取得の問い合わせが飛びます（N+1）。',
        'annotate(item_count=Count(\'items\')) なら、1回のクエリですべてのリストの明細件数を計算し、pl.item_count として取れます。「関連の件数」は数えるなら prefetch より annotate が効率的です（集計はセット4でも扱います）。',
      ],
      points: ['annotate', 'Count', 'N+1対策'],
    },
  ],
}

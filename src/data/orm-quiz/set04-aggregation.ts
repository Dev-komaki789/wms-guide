import type { OrmQuizSet } from './types'

// 問題集 セット4「集計」。
export const set04Aggregation: OrmQuizSet = {
  id: 'aggregation',
  num: 4,
  level: '中級',
  title: '集計 ― aggregate / annotate / Sum / Count',
  summary: '合計や件数を出す集計を練習します。全体を1つの数にまとめる aggregate と、グループごとに集計して各行にくっつける annotate の違いがポイントです。',
  intro: [
    'aggregate は「全部まとめて1つの答え（合計など）」、annotate は「グループごと・行ごとに集計値を足す」。この2つを区別できれば集計はこわくありません。',
  ],
  problems: [
    {
      question: 'すべての在庫（StockBalance）の、在庫数（quantity）の合計を求めてください。',
      hint: '全体を1つの数にまとめるのは aggregate。',
      orm: `from django.db.models import Sum\n\nStockBalance.objects.aggregate(\n  total=Sum('quantity')\n)\n# → {'total': 1234}`,
      sql: `SELECT SUM(quantity) AS total\nFROM stock_balances;`,
      explanation: [
        'aggregate は「テーブル全体を集計して、1つの結果（辞書）を返す」メソッドです。Sum(\'quantity\') で合計、結果に total という名前を付けています。',
        '戻り値は QuerySet ではなく {\'total\': 1234} のような辞書です。「全体で1つの数が欲しい」ときは aggregate を使います。',
      ],
      points: ['aggregate', 'Sum', 'SUM'],
    },
    {
      question: 'ロケーション（location）ごとに、在庫数の合計を求めてください。「グループごと」の集計です。',
      hint: 'values でグループ単位を決め、annotate で集計する。',
      orm: `from django.db.models import Sum\n\nStockBalance.objects\n  .values('location')\n  .annotate(total=Sum('quantity'))`,
      sql: `SELECT location_id,\n       SUM(quantity) AS total\nFROM stock_balances\nGROUP BY location_id;`,
      explanation: [
        '「グループごとの集計」は values(...) と annotate(...) の組み合わせで書きます。values(\'location\') が「ロケーションごとにまとめる」＝SQL の GROUP BY location_id にあたります。',
        'その単位に対して annotate(total=Sum(\'quantity\')) で合計を計算。aggregate（全体で1つ）と違い、annotate は「グループの数だけ行が返る」点に注意しましょう。',
      ],
      points: ['values', 'annotate', 'GROUP BY'],
    },
    {
      question: '各ピッキングリストに、その明細（related_name="items"）の件数を「item_count」という名前でくっつけて取得してください。',
      hint: '行ごとに数を足すのは annotate ＋ Count。',
      orm: `from django.db.models import Count\n\nPickingList.objects.annotate(\n  item_count=Count('items')\n)`,
      sql: `SELECT picking_lists.*,\n       COUNT(picking_list_items.id) AS item_count\nFROM picking_lists\nLEFT JOIN picking_list_items\n  ON picking_list_items.picking_list_id = picking_lists.id\nGROUP BY picking_lists.id;`,
      explanation: [
        'annotate は「各行に、計算した値の列を1つ足す」メソッドです。Count(\'items\') で「そのリストに紐づく明細の件数」を数え、item_count という列としてくっつけます。',
        '結果は PickingList のまま（行数は変わらない）で、各 pl に pl.item_count が生えます。「一覧に、関連の件数も一緒に出したい」ときの定番です。',
      ],
      points: ['annotate', 'Count', 'COUNT'],
    },
    {
      question: '有効な予約（StockReservation で status="active"）の数量合計を求めてください。ただし、予約が1件も無いときは NULL ではなく 0 を返したいです。',
      hint: '「空（NULL）なら0に」は Coalesce。',
      orm: `from django.db.models import Sum, Value\nfrom django.db.models.functions import Coalesce\n\nStockReservation.objects\n  .filter(status='active')\n  .aggregate(\n    total=Coalesce(Sum('quantity'), Value(0))\n  )`,
      sql: `SELECT COALESCE(SUM(quantity), 0) AS total\nFROM stock_reservations\nWHERE status = 'active';`,
      explanation: [
        '合計する対象が1件も無いと、Sum は NULL（空）を返します。そのままだと計算や表示で困るので、Coalesce(Sum(...), Value(0)) で「空なら 0 にする」と保険をかけます。',
        'Coalesce は「左から見て、最初の空でない値」を返す関数です。Value(0) は「ただの数値の 0」を ORM の式として渡すための書き方です。集計が NULL になる事故を防ぐ定番テクニックです。',
      ],
      points: ['Coalesce', 'Value', 'COALESCE'],
    },
    {
      question: '明細が3件以上あるピッキングリストだけを取得してください。「集計した結果で絞り込む」のがポイントです。',
      hint: 'annotate で件数を出してから filter する（順番が大事）。',
      orm: `from django.db.models import Count\n\nPickingList.objects\n  .annotate(item_count=Count('items'))\n  .filter(item_count__gte=3)`,
      sql: `SELECT picking_lists.*,\n       COUNT(picking_list_items.id) AS item_count\nFROM picking_lists\nLEFT JOIN picking_list_items\n  ON picking_list_items.picking_list_id = picking_lists.id\nGROUP BY picking_lists.id\nHAVING COUNT(picking_list_items.id) >= 3;`,
      explanation: [
        'まず annotate(item_count=Count(\'items\')) で各リストの明細数を計算し、その結果に対して filter(item_count__gte=3) で「3件以上」に絞ります。',
        '集計した値での絞り込みは、SQL では WHERE ではなく HAVING になります。ORM では annotate → filter の順で書けば、Django が自動で HAVING に翻訳してくれます。「集計してから絞る」ので順番が大事です。',
      ],
      points: ['annotate→filter', 'HAVING'],
    },
    {
      question: 'すべての在庫について、在庫数（quantity）の平均を求めてください。',
      hint: '平均は Avg。全体で1つなら aggregate。',
      orm: `from django.db.models import Avg\n\nStockBalance.objects.aggregate(\n  avg=Avg('quantity')\n)`,
      sql: `SELECT AVG(quantity) AS avg\nFROM stock_balances;`,
      explanation: [
        'Avg は平均を計算する集計関数で、SQL の AVG にあたります。aggregate に入れると {\'avg\': 12.3} のように1つの結果が返ります。',
        'Sum（合計）・Avg（平均）・Max（最大）・Min（最小）・Count（件数）が集計の基本5点セットです。',
      ],
      points: ['Avg', 'AVG'],
    },
    {
      question: '在庫数の「最大」と「最小」を、1回の aggregate で同時に求めてください。',
      hint: 'aggregate にはカンマで複数の集計を並べられる。',
      orm: `from django.db.models import Max, Min\n\nStockBalance.objects.aggregate(\n  hi=Max('quantity'),\n  lo=Min('quantity'),\n)`,
      sql: `SELECT MAX(quantity) AS hi,\n       MIN(quantity) AS lo\nFROM stock_balances;`,
      explanation: [
        'aggregate には複数の集計をカンマで並べられ、結果は {\'hi\': 100, \'lo\': 0} のように1つの辞書にまとまります。',
        'Max は最大、Min は最小。1回の問い合わせで複数の数字をまとめて出せるので、ムダな往復を減らせます。',
      ],
      points: ['Max', 'Min', '複数集計'],
    },
    {
      question: '在庫テーブルに登場する「SKU の種類数（重複なし）」を数えてください。',
      hint: '重複を除いて数えるのは Count(..., distinct=True)。',
      orm: `from django.db.models import Count\n\nStockBalance.objects.aggregate(\n  sku_kinds=Count('sku', distinct=True)\n)`,
      sql: `SELECT COUNT(DISTINCT sku_id) AS sku_kinds\nFROM stock_balances;`,
      explanation: [
        'Count(\'sku\', distinct=True) は「重複を除いた件数」を数えます。SQL の COUNT(DISTINCT sku_id) にあたります。',
        '同じ SKU が複数のロケーションにあっても1つと数えるので、「何種類の SKU があるか」が分かります。distinct=True を付けないと、ただの行数になります。',
      ],
      points: ['Count(distinct=True)', 'COUNT DISTINCT'],
    },
    {
      question: '在庫について「件数・合計・平均」を、1回の aggregate でまとめて求めてください。',
      hint: 'Count / Sum / Avg を1つの aggregate に並べる。',
      orm: `from django.db.models import Count, Sum, Avg\n\nStockBalance.objects.aggregate(\n  n=Count('id'),\n  total=Sum('quantity'),\n  avg=Avg('quantity'),\n)`,
      sql: `SELECT COUNT(id) AS n,\n       SUM(quantity) AS total,\n       AVG(quantity) AS avg\nFROM stock_balances;`,
      explanation: [
        '複数の集計を1つの aggregate にまとめると、1回のクエリで全部計算されます。サマリー表示（件数・合計・平均を並べる）にぴったりです。',
        'それぞれに n / total / avg と名前を付けているので、結果の辞書から result[\'total\'] のように取り出せます。',
      ],
      points: ['複数集計', 'Count/Sum/Avg'],
    },
    {
      question: '各ピッキングリストに明細件数（item_count）を付け、「件数の多い順」に並べてください。',
      hint: 'annotate で付けた値は、そのまま order_by に使える。',
      orm: `from django.db.models import Count\n\nPickingList.objects \n  .annotate(item_count=Count('items')) \n  .order_by('-item_count')`,
      sql: `SELECT picking_lists.*,\n       COUNT(picking_list_items.id) AS item_count\nFROM picking_lists\nLEFT JOIN picking_list_items\n  ON picking_list_items.picking_list_id = picking_lists.id\nGROUP BY picking_lists.id\nORDER BY item_count DESC;`,
      explanation: [
        'annotate で付けた集計値（item_count）は、ふつうのフィールドと同じように order_by に使えます。order_by(\'-item_count\') で「件数の多い順」。',
        '「明細がいちばん多いリスト top5」なら、このあとに [:5] を付ければ完成。集計→並べ替え→スライスと、これまで学んだ操作を組み合わせられます。',
      ],
      points: ['annotate', 'order_by（集計値）'],
    },
    {
      question: '倉庫（location → warehouse）ごとに、在庫数の合計を求めてください。グループの単位が「関連先の列」です。',
      hint: 'values にも __ で関連の列を書ける。それが GROUP BY の単位になる。',
      orm: `from django.db.models import Sum\n\nStockBalance.objects \n  .values('location__warehouse') \n  .annotate(total=Sum('quantity'))`,
      sql: `SELECT locations.warehouse_id,\n       SUM(stock_balances.quantity) AS total\nFROM stock_balances\nJOIN locations ON locations.id = stock_balances.location_id\nGROUP BY locations.warehouse_id;`,
      explanation: [
        'values(\'location__warehouse\') のように、グループの単位に関連先の列を指定できます。これが GROUP BY locations.warehouse_id になります。',
        'ロケーション単位ではなく「倉庫単位」でまとめたいときに。関連をまたいだ集計も、values（グループ）＋annotate（集計）の形は同じです。',
      ],
      points: ['values（関連）', 'GROUP BY', 'Sum'],
    },
    {
      question: '在庫について「全体の件数」と「在庫数が0の件数（欠品数）」を、1回の集計で同時に求めてください。条件つきの集計です。',
      hint: 'Count に filter=Q(...) を付けると「条件に合うものだけ数える」。',
      orm: `from django.db.models import Count, Q\n\nStockBalance.objects.aggregate(\n  total=Count('id'),\n  out_of_stock=Count('id', filter=Q(quantity=0)),\n)`,
      sql: `SELECT COUNT(id) AS total,\n       COUNT(id) FILTER (WHERE quantity = 0) AS out_of_stock\nFROM stock_balances;`,
      explanation: [
        '集計関数に filter=Q(...) を付けると「その条件に合う行だけを対象に集計」できます（条件つき集計）。ここでは quantity=0 のものだけ数えて欠品数にしています。',
        '全体と一部を1回で出せるので、「全体／そのうち欠品」のような内訳を、何度も問い合わせずに作れます。Sum など他の集計でも filter= は使えます。',
      ],
      points: ['条件つき集計', 'filter=Q', 'FILTER'],
    },
    {
      question: '各ピッキングリストについて、明細の数量（items の quantity）の合計を「total_qty」として付けてください。関連先の数値を合計します。',
      hint: 'annotate(Sum("items__quantity"))。',
      orm: `from django.db.models import Sum\n\nPickingList.objects.annotate(\n  total_qty=Sum('items__quantity')\n)`,
      sql: `SELECT picking_lists.*,\n       SUM(picking_list_items.quantity) AS total_qty\nFROM picking_lists\nLEFT JOIN picking_list_items\n  ON picking_list_items.picking_list_id = picking_lists.id\nGROUP BY picking_lists.id;`,
      explanation: [
        'annotate(total_qty=Sum(\'items__quantity\')) は「各リストに紐づく明細の quantity をすべて足した値」を計算して付けます。__ で関連先の列を集計できます。',
        '「リストごとのピッキング総数」のように、子テーブルの数値を親ごとに合計したいときの形です。明細が無いリストは（LEFT JOIN なので）合計が NULL になり得るので、必要なら Coalesce で 0 にします。',
      ],
      points: ['annotate', 'Sum（関連 __）'],
    },
    {
      question: '倉庫ID（warehouse_id）と ステータス（status）の組み合わせごとに、ピッキングリストの件数を求めてください。グループを2つの列で作ります。',
      hint: 'values に2つ並べると、その組み合わせが GROUP BY になる。',
      orm: `from django.db.models import Count\n\nPickingList.objects \n  .values('warehouse_id', 'status') \n  .annotate(n=Count('id'))`,
      sql: `SELECT warehouse_id, status,\n       COUNT(id) AS n\nFROM picking_lists\nGROUP BY warehouse_id, status;`,
      explanation: [
        'values に複数の列を並べると、「その組み合わせ」ごとにグループ化されます（GROUP BY warehouse_id, status）。',
        'これで「倉庫×ステータスごとの件数」のようなクロス集計の素ができます。order_by を足せば見やすく並べられます。',
      ],
      points: ['values（複数）', 'GROUP BY（複数列）'],
    },
  ],
}

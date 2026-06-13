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
  ],
}

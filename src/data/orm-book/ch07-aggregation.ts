import type { OrmChapter } from './types'

// 第7章「集計」。aggregate（全体）と annotate（グループ＝GROUP BY）、条件付き集計。
export const ch07Aggregation: OrmChapter = {
  id: 'aggregation',
  num: 7,
  title: '集計 ― aggregate と annotate（GROUP BY）',
  summary: '「合計・件数・平均」などをまとめて計算する方法を学びます。全体をまとめる aggregate と、グループごとにまとめる annotate の違いがこの章のキモです。',
  intro: [
    '「在庫の合計はいくつ？」「リストごとの明細件数は？」といった“まとめ計算”を集計といいます。',
    'Django の集計には2種類あります。全体をひとまとめにする aggregate と、グループごとにまとめる annotate です。まずこの2つの違いをはっきりさせましょう。',
  ],
  sections: [
    {
      id: 'functions',
      heading: '7-1. 集計関数 ― Count / Sum / Avg / Max / Min',
      body: [
        'まず「何を計算するか」の部品が集計関数です。よく使うのは次の5つ。いずれも from django.db.models import Count, Sum, Avg, Max, Min でインポートします。',
      ],
      table: {
        headers: ['関数', '意味', 'SQL'],
        rows: [
          ['Count', '件数を数える', 'COUNT(...)'],
          ['Sum', '合計を出す', 'SUM(...)'],
          ['Avg', '平均を出す', 'AVG(...)'],
          ['Max', '最大値', 'MAX(...)'],
          ['Min', '最小値', 'MIN(...)'],
        ],
      },
    },
    {
      id: 'aggregate',
      heading: '7-2. aggregate() ― 全体をひとまとめに計算',
      body: [
        'aggregate() は「絞り込んだ結果ぜんぶを、1セットの数字にまとめる」道具です。結果は辞書（名前→値）で1つだけ返ります。「全体で何件・合計いくつ」を知りたいときに使います。',
      ],
      examples: [
        {
          orm: `from django.db.models import Count, Sum\n\nStockBalance.objects.aggregate(\n  rows=Count('id'),\n  total_qty=Sum('quantity'),\n)`,
          sql: `SELECT\n  COUNT(id)       AS rows,\n  SUM(quantity)   AS total_qty\nFROM stock_balances;`,
          note: '結果は {"rows": 38, "total_qty": 1234} のような辞書が1つ。全体の件数と在庫合計を一度に出しています。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：AS（アズ）は「この計算結果にこの名前をつける」という意味（別名）。rows=Count("id") の rows がその名前になります。',
        },
      ],
    },
    {
      id: 'annotate',
      heading: '7-3. annotate() ― グループごとに計算（GROUP BY）',
      body: [
        'annotate() は「グループごとにまとめて、各グループに計算結果をくっつける」道具です。「リストごとの明細件数」「商品ごとの在庫合計」のように、“◯◯ごと”の集計に使います。',
        'コツは values("グループにする項目").annotate(...) の形。values で「何ごとにまとめるか」を決め、annotate で計算します。これが SQL の GROUP BY（グループ化）に当たります。',
      ],
      examples: [
        {
          orm: `from django.db.models import Count\n\nPickingListItem.objects\n  .values('picking_list_id')\n  .annotate(item_count=Count('id'))`,
          sql: `SELECT picking_list_id,\n       COUNT(id) AS item_count\nFROM picking_list_items\nGROUP BY picking_list_id;`,
          note: '「リストごとの明細件数」。結果は [{"picking_list_id": 1, "item_count": 5}, ...]。values が GROUP BY を作ります。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：GROUP BY（グループバイ）は「同じ値ごとにグループにまとめる」SQL。「商品ごと」「日付ごと」のように、まとめる単位を指定します。',
        },
      ],
    },
    {
      id: 'agg-vs-ann',
      heading: '7-4. aggregate と annotate の違い（重要）',
      body: ['この2つの違いが集計のいちばんの山場です。ひとことで言うと「全体を1つにまとめる」か「グループごとに分けてまとめる」かです。'],
      table: {
        headers: ['', 'aggregate', 'annotate'],
        rows: [
          ['まとめ方', '全体をまるごと1つ', 'グループごと'],
          ['結果', '辞書が1つ', '行ごと（グループの数だけ）'],
          ['SQL', '集計関数だけ', 'GROUP BY + 集計関数'],
          ['例', '在庫の総数', '商品ごとの在庫数'],
        ],
      },
    },
    {
      id: 'conditional',
      heading: '7-5. 条件付き集計 ― 「◯◯なものだけ数える」',
      body: [
        '「全体の件数」と「在庫切れ（数量0）の件数」を一度に出したい、というときは、Count に filter= を付けると「条件に合うものだけ数える」ができます。',
      ],
      examples: [
        {
          orm: `from django.db.models import Count, Sum, Q\n\nStockBalance.objects.aggregate(\n  rows=Count('id'),\n  total_qty=Sum('quantity'),\n  zero=Count('id', filter=Q(quantity=0)),\n)`,
          sql: `SELECT\n  COUNT(id)                                 AS rows,\n  SUM(quantity)                             AS total_qty,\n  COUNT(CASE WHEN quantity = 0 THEN 1 END)  AS zero\nFROM stock_balances;`,
          note: 'zero=Count("id", filter=Q(quantity=0)) で「在庫0の件数」だけを別に数えています。全体集計といっしょに出せて便利です。',
        },
        {
          orm: `# 重複を除いて数える（distinct=True）\nStockBalance.objects.aggregate(\n  sku_count=Count('sku', distinct=True),\n)`,
          sql: `SELECT COUNT(DISTINCT sku_id) AS sku_count\nFROM stock_balances;`,
          note: 'distinct=True を付けると「種類の数（重複を除いた数）」になります。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'この本のトップ「画面から探す → 在庫照会」には、まさにこの条件付き集計（件数・合計・SKU数・在庫切れ件数を一度に出す）が実例として載っています。あわせて見ると理解が深まります。',
        },
      ],
    },
  ],
}

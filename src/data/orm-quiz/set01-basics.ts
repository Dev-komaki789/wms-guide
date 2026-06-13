import type { OrmQuizSet } from './types'

// 問題集 セット1「基礎 ― 取り出す・絞り込む」。
export const set01Basics: OrmQuizSet = {
  id: 'basics',
  num: 1,
  level: '入門',
  title: '基礎 ― 取り出す・絞り込む',
  summary: 'まずは ORM の基本、filter での絞り込み・order_by での並べ替え・件数や存在チェックを練習します。手を動かす前に「これは SQL でいうと何か」を意識すると定着します。',
  intro: [
    '各問、まず自分で ORM を書いてみてから［答えと SQL を見る］を開きましょう。題材は WMS の在庫やピッキングのモデルです。',
  ],
  problems: [
    {
      question: '在庫数（quantity）が 0 の在庫（StockBalance）を、すべて取得してください。',
      hint: '「〜という条件のものだけ」は filter。',
      orm: `StockBalance.objects.filter(quantity=0)`,
      sql: `SELECT *\nFROM stock_balances\nWHERE quantity = 0;`,
      explanation: [
        'filter(quantity=0) は「quantity が 0 の行だけ」という絞り込みで、SQL の WHERE quantity = 0 に翻訳されます。',
        'filter のカッコの中に「フィールド名=値」を書くと「等しい」という条件になります。ここが SQL の WHERE にあたる部分です。',
      ],
      points: ['filter', 'WHERE'],
    },
    {
      question: 'ステータスが作業中（status が "in_progress"）のピッキングリストを、開始日時（started_at）が新しい順に並べて、先頭5件だけ取得してください。',
      hint: '並べ替えは order_by、先頭から数件はスライス [:5]。',
      orm: `PickingList.objects\n  .filter(status='in_progress')\n  .order_by('-started_at')[:5]`,
      sql: `SELECT *\nFROM picking_lists\nWHERE status = 'in_progress'\nORDER BY started_at DESC\nLIMIT 5;`,
      explanation: [
        'order_by(\'-started_at\') の先頭の「-」は「大きい順／新しい順（降順）」を意味します。SQL の ORDER BY started_at DESC にあたります。',
        '[:5] は Python のスライスで「先頭から5件」。ORM ではこれが SQL の LIMIT 5 に翻訳されます。filter → order_by → スライスとつなげて書けるのが ORM の特徴です。',
      ],
      points: ['filter', 'order_by', 'スライス[:5]', 'LIMIT'],
    },
    {
      question: 'SKU コード（sku_code）が "PEN" で始まる SKU を取得してください。',
      hint: '「〜で始まる」はフィールドルックアップ __startswith。',
      orm: `Sku.objects.filter(sku_code__startswith='PEN')`,
      sql: `SELECT *\nFROM skus\nWHERE sku_code LIKE 'PEN%';`,
      explanation: [
        'フィールド名のあとに「__（アンダーバー2つ）＋ルックアップ名」を付けると、等しい以外の条件を書けます。__startswith は「〜で始まる」で、SQL の LIKE \'PEN%\' になります（% は「以降は何でも」の意味）。',
        '似た仲間に __contains（含む＝LIKE \'%…%\'）、__endswith（〜で終わる）があります。大文字小文字を無視したいときは __istartswith のように i を付けます。',
      ],
      points: ['__startswith', 'LIKE'],
    },
    {
      question: '在庫数が「1以上 10未満」（残りわずか）の在庫を取得してください。',
      hint: '「以上」は __gte、「未満」は __lt。filter に2つ書くと AND。',
      orm: `StockBalance.objects.filter(\n  quantity__gte=1,\n  quantity__lt=10,\n)`,
      sql: `SELECT *\nFROM stock_balances\nWHERE quantity >= 1\n  AND quantity < 10;`,
      explanation: [
        '__gte は「>= （以上）」、__lt は「< （未満）」。大小比較のルックアップです（__gt=より大きい、__lte=以下 もあります）。',
        'filter のカッコの中にカンマで複数の条件を並べると、すべてを満たす（AND）という意味になります。SQL の AND にあたります。',
      ],
      points: ['__gte', '__lt', 'AND'],
    },
    {
      question: 'まだピッキングされていない明細（PickingListItem で picked_at が未設定）が「1件でもあるか」を、True / False で知りたいです。',
      hint: '「あるか」を効率よく調べるのは exists()。',
      orm: `PickingListItem.objects\n  .filter(picked_at__isnull=True)\n  .exists()`,
      sql: `SELECT EXISTS(\n  SELECT 1 FROM picking_list_items\n  WHERE picked_at IS NULL\n);`,
      explanation: [
        '__isnull=True は「その項目が空（NULL）かどうか」。picked_at__isnull=True で「まだピッキングされていない（日時が空の）明細」を表します。',
        'exists() は「1件でもあるか？」を True / False で返します。count()（件数を数える）より軽く、1件見つかった時点で打ち切れるのが利点です。「あるかどうかだけ知りたい」ときは count より exists を使いましょう。',
      ],
      points: ['__isnull', 'exists()', 'EXISTS'],
    },
  ],
}

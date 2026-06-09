import type { OrmChapter } from './types'

// 第4章「論理と式」。Q オブジェクト（OR/NOT）と F オブジェクト（フィールド同士・安全な更新）。
export const ch04QandF: OrmChapter = {
  id: 'q-and-f',
  num: 4,
  title: '論理と式 ― Q オブジェクトと F オブジェクト',
  summary: 'filter のカンマ区切りでは表せない「または（OR）」を Q で、「項目どうしの比較」や「いまの値を使った更新」を F で書けるようになります。',
  intro: [
    '第3章の filter は「かつ（AND）」しか表せませんでした。でも実際には「AかB のどちらか（OR）」で絞りたいこともあります。それを叶えるのが Q オブジェクトです。',
    'もう一つ、「項目Aが項目Bより大きい行」や「在庫を今の値から1増やす」のように、固定の値ではなく“項目そのもの”を使いたいときに登場するのが F オブジェクトです。',
  ],
  sections: [
    {
      id: 'why-q',
      heading: '4-1. なぜ Q が必要？ ― filter では OR が書けない',
      body: [
        'filter(a=1, b=2) は「a=1 かつ b=2」でした。では「a=1 または b=2」はどう書くのでしょう？ filter のカンマ区切りでは表せません。',
        'そこで Q オブジェクトを使います。Q は「条件を部品として持ち運べる箱」で、| （縦棒）でつなぐと OR（または）、& でつなぐと AND（かつ）になります。',
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：| は「または（OR）」、& は「かつ（AND）」、~（チルダ）は「〜ではない（NOT）」を表す記号です。Q どうしをこれらでつなぎます。',
        },
      ],
    },
    {
      id: 'q-or',
      heading: '4-2. Q で「または（OR）」',
      body: [
        'Q をインポートして（from django.db.models import Q）、条件を | でつなぎます。下は「SKU コード または JAN コードのどちらかに、入力文字を含む」という、あいまい検索の定番です。',
      ],
      examples: [
        {
          orm: `from django.db.models import Q\n\nStockBalance.objects.filter(\n  Q(sku__sku_code__icontains=q)\n  | Q(sku__jan_code__icontains=q)\n)`,
          sql: `SELECT *\nFROM stock_balances\n  JOIN skus ON stock_balances.sku_id = skus.id\nWHERE skus.sku_code LIKE '%' || ? || '%'\n   OR skus.jan_code LIKE '%' || ? || '%';`,
          note: '| が OR に翻訳されます。「コードのどちらかにヒットすれば OK」という検索が書けました。',
        },
      ],
    },
    {
      id: 'q-mix',
      heading: '4-3. Q で AND・NOT・組み合わせ',
      body: [
        '& で AND、~ で NOT になります。括弧でくくれば「(AまたはB) かつ Cでない」のような複雑な条件も組み立てられます。',
        'なお、Q と「ふつうの条件（status=...）」を混ぜるときは、Q を先に書くのがルールです。',
      ],
      examples: [
        {
          orm: `# (作業中 または 未着手) かつ 倉庫1\nPickingList.objects.filter(\n  Q(status='in_progress') | Q(status='pending'),\n  warehouse_id=1,\n)`,
          sql: `SELECT *\nFROM picking_lists\nWHERE (status = 'in_progress' OR status = 'pending')\n  AND warehouse_id = 1;`,
          note: 'Q どうしの OR を括弧でまとめ、さらに warehouse_id=1 を AND しています。',
        },
        {
          orm: `# 完了「ではない」もの\nPickingList.objects.filter(~Q(status='completed'))`,
          sql: `SELECT *\nFROM picking_lists\nWHERE NOT (status = 'completed');`,
          note: '~Q は NOT。これは exclude(status="completed") と同じ意味です。',
        },
      ],
    },
    {
      id: 'why-f',
      heading: '4-4. なぜ F が必要？ ― 「項目そのもの」を使いたい',
      body: [
        'ふつう filter(quantity__gte=10) のように、項目を「固定の数値（10）」と比べます。では「指示数より実績数が少ない明細」のように、項目どうしを比べたいときは？',
        'そこで F オブジェクトを使います。F("項目名") と書くと、「その行の、その項目の値」を表せます。これで項目どうしの比較ができます。',
      ],
    },
    {
      id: 'f-compare',
      heading: '4-5. F で項目どうしを比べる',
      examples: [
        {
          orm: `from django.db.models import F\n\n# 実績数が指示数より少ない＝欠品している明細\nPickingListItem.objects.filter(\n  quantity_picked__lt=F('quantity_requested')\n)`,
          sql: `SELECT *\nFROM picking_list_items\nWHERE quantity_picked < quantity_requested;`,
          note: 'F("quantity_requested") が「その行の指示数」を表します。固定値ではなく“となりの項目”と比べられました。',
        },
      ],
    },
    {
      id: 'f-update',
      heading: '4-6. F で「いまの値を使った更新」を安全に',
      body: [
        '「在庫を1減らす」を素朴に書くと、(1) 今の値を読む → (2) Python で 1 引く → (3) 保存、の3手順になります。でもこの間に他の処理が同じ在庫を触ると、ズレ（取り違え）が起きることがあります。',
        'F を使うと「いまの値から1引く」という計算を DB の中で一気にやってくれるので、読み込みと保存の“すき間”がなくなり、安全です。',
      ],
      examples: [
        {
          orm: `# 危ない書き方（読み→計算→保存ですき間ができる）\nsb = StockBalance.objects.get(id=1)\nsb.quantity = sb.quantity - 1\nsb.save()\n\n# 安全な書き方（DB の中で一気に引く）\nStockBalance.objects.filter(id=1).update(\n  quantity=F('quantity') - 1\n)`,
          sql: `UPDATE stock_balances\nSET quantity = quantity - 1\nWHERE id = 1;`,
          note: 'F("quantity") - 1 が SET quantity = quantity - 1 に翻訳され、1回の UPDATE で完了します。複数人が同時に触っても安全です。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'F を使った update は「DB に計算をまかせる」ので、速くて安全。在庫の増減やカウントアップでは定番のテクニックです（同時実行の話は第10章でも触れます）。',
        },
      ],
    },
  ],
}

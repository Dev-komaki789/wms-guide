import type { OrmChapter } from './types'

// 第12章「WMS 実例で総復習」。実際の画面クエリを、これまでの章の知識で読み解く。
export const ch12WmsRecap: OrmChapter = {
  id: 'wms-recap',
  num: 12,
  title: 'WMS 実例で総復習 ― 画面のクエリを読み解く',
  summary: 'この本で学んだことを使って、WMS の実際の画面で動いている ORM を読み解きます。バラバラだった知識が「実コードを読める力」につながる、仕上げの章です。',
  intro: [
    'おつかれさまでした。最後は総復習です。これまでの章の知識を組み合わせて、WMS の画面で実際に使われている ORM を読んでいきます。',
    '各例に「どの章の知識か」を添えています。読みながら「あ、これは第◯章のあれだ」と思い出せれば、もう十分に身についています。トップの「画面から探す」でも同じクエリを確認できます。',
  ],
  sections: [
    {
      id: 'inquiry',
      heading: '12-1. 在庫照会 ― 一括結合とあいまい検索',
      body: [
        '在庫照会では、在庫からロケーション・SKU・商品・カテゴリまでを一気に結合して取り、N+1 を防いでいます（第6章）。',
      ],
      examples: [
        {
          orm: `StockBalance.objects.select_related(\n  'location',\n  'sku',\n  'sku__product',\n  'sku__product__category',\n)`,
          sql: `SELECT sb.*\nFROM stock_balances sb\n  JOIN locations  ON sb.location_id = locations.id\n  JOIN skus       ON sb.sku_id = skus.id\n  JOIN products   ON skus.product_id = products.id\n  LEFT JOIN categories ON products.category_id = categories.id;`,
          note: '【第6章】select_related で関連をまとめて取り、一覧表示での N+1 を防いでいます。',
        },
        {
          orm: `qs.filter(\n  Q(sku__sku_code__icontains=q)\n  | Q(sku__jan_code__icontains=q)\n)`,
          sql: `... WHERE skus.sku_code LIKE '%'||?||'%'\n       OR skus.jan_code LIKE '%'||?||'%';`,
          note: '【第3章・第4章】__icontains のあいまい検索（第3章）を、Q の | で「どちらかにヒット」（第4章）にしています。',
        },
      ],
    },
    {
      id: 'inquiry-agg',
      heading: '12-2. 在庫照会 ― まとめの集計',
      body: ['検索結果の「件数・在庫合計・SKU数・在庫切れ件数」を一度に出す集計です。'],
      examples: [
        {
          orm: `qs.aggregate(\n  rows=Count('id'),\n  total_qty=Sum('quantity'),\n  sku_count=Count('sku', distinct=True),\n  zero=Count('id', filter=Q(quantity=0)),\n)`,
          sql: `SELECT COUNT(id), SUM(quantity),\n  COUNT(DISTINCT sku_id),\n  COUNT(CASE WHEN quantity = 0 THEN 1 END)\nFROM stock_balances;`,
          note: '【第7章】aggregate で全体集計。distinct=True（種類数）と filter=Q(...)（条件付き集計）も使っています。',
        },
      ],
    },
    {
      id: 'picking-entry',
      heading: '12-3. ピッキング受付 ― 開始ロック',
      body: ['同じリストを2人が同時に開始しないよう、行をロックしてから担当者を書き込みます。'],
      examples: [
        {
          orm: `with transaction.atomic():\n    pl = (PickingList.objects\n          .select_for_update()\n          .get(id=list_id))\n    pl.assigned_to = request.user\n    pl.status = 'in_progress'\n    pl.save()`,
          sql: `BEGIN;\nSELECT * FROM picking_lists WHERE id = ? FOR UPDATE;\nUPDATE picking_lists SET ... WHERE id = ?;\nCOMMIT;`,
          note: '【第10章】atomic で束にし、select_for_update で行をロック。第9章の save() で更新しています。',
        },
      ],
    },
    {
      id: 'picking-work',
      heading: '12-4. ピッキング作業 ― 残数チェックと前進判定',
      body: ['「まだ確定していない明細が残っているか」を数え、「未完了のリストが残っていないか」を判定します。'],
      examples: [
        {
          orm: `picking_list.items\n  .filter(picked_at__isnull=True)\n  .count()`,
          sql: `SELECT COUNT(*)\nFROM picking_list_items\nWHERE picking_list_id = ?\n  AND picked_at IS NULL;`,
          note: '【第2章・第3章・第6章】逆参照 items（第6章）を __isnull で絞り（第3章）、count() で残数を数える（第2章）。',
        },
        {
          orm: `PickingList.objects.filter(\n  items__outbound_order_item__outbound_order=order,\n  status__in=['pending', 'in_progress'],\n).exists()`,
          sql: `SELECT 1 FROM picking_lists pl\n  JOIN picking_list_items i ON i.picking_list_id = pl.id\n  JOIN outbound_order_items ooi ON i.outbound_order_item_id = ooi.id\nWHERE ooi.outbound_order_id = ?\n  AND pl.status IN ('pending','in_progress')\nLIMIT 1;`,
          note: '【第3章・第6章・第2章】__ で関連を深くたどり（第6章）、__in で絞り（第3章）、exists() で「残っているか」を軽く判定（第2章）。',
        },
      ],
    },
    {
      id: 'closing',
      heading: '12-5. おわりに',
      body: [
        'ここまで読めたあなたは、もう「実際の画面で動いている ORM」を、章の知識に分解して読めるようになっています。これは「自分で説明できるコード」を増やす、確かな一歩です。',
        '分からない書き方に出会ったら、対応する章に戻ってください。そして、トップの「画面から探す」や「SQL を入力して実行」で、実データを相手に手を動かすと、さらに身につきます。おつかれさまでした。',
      ],
      callouts: [
        {
          kind: 'tip',
          text: '次の一歩：気になった ORM を、トップのツールで実際に SQL として実行し、どんな行が返るか見てみましょう。「読む」と「動かす」がつながると、理解は一気に深まります。',
        },
      ],
    },
  ],
}

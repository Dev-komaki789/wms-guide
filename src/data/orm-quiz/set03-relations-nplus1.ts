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
  ],
}

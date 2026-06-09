import type { OrmChapter } from './types'

// 第6章「リレーション」。__ でたどる / select_related / prefetch_related / 逆参照 / N+1。
export const ch06Relations: OrmChapter = {
  id: 'relations',
  num: 6,
  title: 'リレーション ― 関連をたどる / select_related / N+1',
  summary: '表どうしの「つながり（リレーション）」をたどる書き方と、初心者が必ずぶつかる「N+1 問題」を、図つきでやさしく解説します。この章はこの本の山場です。',
  intro: [
    'WMS のデータは、表どうしがつながっています。たとえば「在庫」は「SKU」につながり、「SKU」は「商品」につながっています。こうしたつながりをリレーションと呼びます。',
    'この章では、つながった先の項目をどう取るか、そして「うっかり DB に問い合わせを連発してしまう N+1 問題」をどう防ぐかを学びます。',
  ],
  sections: [
    {
      id: 'what-is-fk',
      heading: '6-1. つながりの正体 ― 外部キー（ForeignKey）',
      body: [
        '表どうしのつながりは、外部キー（がいぶキー＝ForeignKey）という項目で表されます。たとえば在庫の表には sku_id という項目があり、「この在庫はどの SKU か」を指し示しています。これが「在庫 → SKU」のつながりです。',
        'ORM では、この sku_id を意識しなくても、sku と書くだけでつながった先の SKU オブジェクトにアクセスできます。',
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：外部キー（ForeignKey）は「別の表の1行を指し示す項目」です。多くは ◯◯_id という名前で、相手の id を持っています。',
        },
      ],
    },
    {
      id: 'span',
      heading: '6-2. __ で関連をたどる',
      body: [
        '第3章でも少し出ましたが、__（アンダーバー2つ）でつながった先の項目に手が届きます。たどるほど __ を重ねていきます。',
        '「在庫 → SKU → 商品 の商品名」なら sku__product__product_name です。これは絞り込み（filter）でも、並べ替え（order_by）でも使えます。',
      ],
      examples: [
        {
          orm: `StockBalance.objects.filter(\n  sku__product__product_name__icontains='ペン'\n)`,
          sql: `SELECT stock_balances.*\nFROM stock_balances\n  JOIN skus ON stock_balances.sku_id = skus.id\n  JOIN products ON skus.product_id = products.id\nWHERE products.product_name LIKE '%ペン%';`,
          note: '__ をたどるたびに、SQL では JOIN（表をつなぐ）が増えていきます。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：JOIN（ジョイン）は「2つの表を、つながりをたよりに横に連結する」SQL です。__ で関連をたどると、裏で JOIN が組まれます。',
        },
      ],
    },
    {
      id: 'n-plus-1',
      heading: '6-3. N+1 問題 ― 知らずにやりがちな“問い合わせの連発”',
      body: [
        'ここがこの章の主役です。たとえば「在庫を一覧表示して、各行に商品名も出したい」とき、素朴に書くとこうなります。',
        'まず在庫を全部とる問い合わせが1回。そのあとループの中で各在庫の商品名に触れるたびに、SKU や商品を取る問い合わせが1回ずつ走ります。在庫が100件なら、1 + 100 回。これが N+1 問題（1回＋N回）です。件数が増えるほど、どんどん遅くなります。',
      ],
      examples: [
        {
          orm: `# 悪い例：N+1 が起きる\nfor sb in StockBalance.objects.all():        # ← ここで1回\n    print(sb.sku.product.product_name)       # ← 各行ごとに追加で問い合わせ`,
          note: '在庫100件なら、最初の1回＋各行の追加100回＝合計101回も DB に行ってしまいます。',
        },
      ],
      mermaid: `flowchart TD\n  A["在庫を全部とる（問い合わせ 1回）"] --> B["1件目の商品名に触れる<br/>→ 追加で問い合わせ"]\n  A --> C["2件目の商品名に触れる<br/>→ 追加で問い合わせ"]\n  A --> D["…100件目まで同じ<br/>→ 追加で問い合わせ"]\n  B --> E["合計 1 + 100 回（おそい）"]\n  C --> E\n  D --> E`,
      callouts: [
        {
          kind: 'warn',
          text: '怖いのは「動いてしまう」こと。データが少ないうちは気づかず、本番でデータが増えてから急に重くなります。一覧で関連項目を出すときは、次の select_related / prefetch_related を思い出してください。',
        },
      ],
    },
    {
      id: 'select-related',
      heading: '6-4. select_related() ― 1回の JOIN でまとめて取る',
      body: [
        'select_related("たどる先") を付けると、Django は最初から JOIN でつながった先もまとめて1回で取ってきます。だからループの中で関連項目に触れても、追加の問い合わせが起きません。N+1 が解消されます。',
        'select_related は「外部キーの先（多対一・一対一）」、つまり「1件の相手」をたどるときに使います。',
      ],
      examples: [
        {
          orm: `# 良い例：1回でまとめて取る\nqs = StockBalance.objects.select_related(\n  'sku__product'\n)\nfor sb in qs:                                # ← これで1回だけ\n    print(sb.sku.product.product_name)       # ← 追加の問い合わせ無し`,
          sql: `SELECT stock_balances.*, skus.*, products.*\nFROM stock_balances\n  JOIN skus ON stock_balances.sku_id = skus.id\n  JOIN products ON skus.product_id = products.id;`,
          note: '101回が1回になりました。sku__product のように __ でたどる先を指定します。',
        },
      ],
    },
    {
      id: 'prefetch-related',
      heading: '6-5. prefetch_related() ― 「たくさんの相手」をまとめて取る',
      body: [
        'select_related は「1件の相手」向けでした。では「1つのピッキングリストに、たくさんの明細がぶら下がる」ような“1対多”の場合は？ こちらは prefetch_related を使います。',
        'prefetch_related は、JOIN ではなく「別の問い合わせでまとめて取って、Python 側で結びつける」方式です。結果として、問い合わせ回数が「明細の数ぶん」ではなく「数回」で済みます。',
      ],
      examples: [
        {
          orm: `# 各リストの明細をまとめて先読み\nqs = PickingList.objects.prefetch_related('items')\nfor pl in qs:\n    for item in pl.items.all():   # ← 追加の問い合わせ無し\n        ...`,
          note: 'リストを取る1回＋明細をまとめて取る1回。リストが何件でも、問い合わせは数回で済みます。',
        },
      ],
      table: {
        headers: ['つながりの向き', '使う道具', 'やり方'],
        rows: [
          ['1件の相手（外部キーの先・一対一）', 'select_related', 'JOIN で一緒に取る'],
          ['たくさんの相手（一対多・多対多）', 'prefetch_related', '別問い合わせでまとめて取り、Python で結ぶ'],
        ],
      },
    },
    {
      id: 'reverse',
      heading: '6-6. 逆参照 ― つながりを「逆向き」にたどる',
      body: [
        'つながりは逆向きにもたどれます。「在庫 → SKU」だけでなく「SKU → その SKU の在庫たち」も取れます。逆向きは、相手の名前の小文字＋_set（例: sku.stockbalance_set）か、モデルで related_name を付けていればその名前（例: pl.items）でアクセスします。',
      ],
      examples: [
        {
          orm: `pl = PickingList.objects.get(id=1)\npl.items.all()    # このリストにぶら下がる明細たち（逆参照）`,
          note: 'PickingListItem 側に related_name="items" が付いているので pl.items で明細一覧を取れます。付いていなければ pl.pickinglistitem_set になります。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '6-7. この章のまとめ',
      body: [
        'つながりは外部キーで表され、__ でたどれる（裏で JOIN）。一覧で関連項目に触れると N+1 問題（問い合わせ連発）が起きやすい。',
        '「1件の相手」は select_related、「たくさんの相手」は prefetch_related で先読みして N+1 を防ぐ。これは実務で最重要のテクニックです。',
      ],
    },
  ],
}

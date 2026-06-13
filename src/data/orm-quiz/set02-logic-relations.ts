import type { OrmQuizSet } from './types'

// 問題集 セット2「論理と関連をまたぐ」。
export const set02LogicRelations: OrmQuizSet = {
  id: 'logic-relations',
  num: 2,
  level: '初級',
  title: '論理と関連をまたぐ ― Q / exclude / __ / in / F',
  summary: 'OR 条件（Q）、除外（exclude）、テーブルをまたいだ絞り込み（__）、複数候補（in）、列どうしの比較（F）を練習します。「つながり」を意識すると一気に表現力が上がります。',
  problems: [
    {
      question: 'ステータスが「完了（completed）」または「取消（cancelled）」のピッキングリストを取得してください。',
      hint: 'OR は Q オブジェクトで「| 」、または __in でまとめても書けます。',
      orm: `from django.db.models import Q\n\nPickingList.objects.filter(\n  Q(status='completed') | Q(status='cancelled')\n)\n\n# __in でも同じ意味\nPickingList.objects.filter(\n  status__in=['completed', 'cancelled']\n)`,
      sql: `SELECT *\nFROM picking_lists\nWHERE status = 'completed'\n   OR status = 'cancelled';\n\n-- __in は IN になる\nWHERE status IN ('completed', 'cancelled');`,
      explanation: [
        'filter にカンマで条件を並べると AND ですが、OR を書きたいときは Q オブジェクトを使い、「Q(...) | Q(...)」のように「|」でつなぎます（| が OR、& が AND）。',
        '今回のように「どれかに一致」なら、__in=[...] を使う方がすっきり書けます。SQL の IN にあたります。状況に合わせて読みやすい方を選びましょう。',
      ],
      points: ['Q', '|（OR）', '__in', 'IN'],
    },
    {
      question: '倉庫ID（warehouse_id）が 1 のもの「以外」のピッキングリストを取得してください。',
      hint: '「〜以外」は exclude。',
      orm: `PickingList.objects.exclude(warehouse_id=1)`,
      sql: `SELECT *\nFROM picking_lists\nWHERE NOT (warehouse_id = 1);`,
      explanation: [
        'exclude は filter の反対で、「条件に当てはまるものを除く」絞り込みです。SQL の NOT（〜でない）にあたります。',
        'filter(...) が「これだけ残す」、exclude(...) が「これを取り除く」。組み合わせて filter(...).exclude(...) のようにも書けます。',
      ],
      points: ['exclude', 'NOT'],
    },
    {
      question: 'カテゴリ名（Category.category_name）が「文具」である商品の SKU を取得してください。SKU → 商品 → カテゴリ とつながっています。',
      hint: '関連を「__」でたどって絞り込めます。',
      orm: `Sku.objects.filter(\n  product__category__category_name='文具'\n)`,
      sql: `SELECT skus.*\nFROM skus\nJOIN products\n  ON products.id = skus.product_id\nJOIN categories\n  ON categories.id = products.category_id\nWHERE categories.category_name = '文具';`,
      explanation: [
        'product__category__category_name は「SKU の product をたどり、その category をたどり、その category_name」という意味。__ で関連を次々にたどれます。',
        'ORM ではこの「__ でたどる」書き方が、SQL では JOIN（表をつなぐ）に翻訳されます。自分で JOIN を書かなくても、つながりをたどるだけで済むのが ORM の便利なところです。',
      ],
      points: ['__ で関連をたどる', 'JOIN'],
    },
    {
      question: 'まだ出荷されていない（shipped_at が未設定の）出荷指示（OutboundOrder）を取得してください。',
      hint: '「未設定（空）」は __isnull=True。',
      orm: `OutboundOrder.objects.filter(\n  shipped_at__isnull=True\n)`,
      sql: `SELECT *\nFROM outbound_orders\nWHERE shipped_at IS NULL;`,
      explanation: [
        '__isnull=True は「その項目が空（NULL）か」を判定します。shipped_at（出荷日時）が空＝まだ出荷していない、という意味になります。SQL の IS NULL です。',
        '逆に「出荷済み（値がある）」を取りたいなら __isnull=False（IS NOT NULL）を使います。日時や ForeignKey が「ある／ない」を扱うときの定番です。',
      ],
      points: ['__isnull', 'IS NULL'],
    },
    {
      question: '実際の出荷数（quantity_shipped）が、指示数（quantity_ordered）に満たない明細（OutboundOrderItem）を取得してください。「列どうしの比較」がポイントです。',
      hint: '値ではなく「別の列」と比べるときは F オブジェクト。',
      orm: `from django.db.models import F\n\nOutboundOrderItem.objects.filter(\n  quantity_shipped__lt=F('quantity_ordered')\n)`,
      sql: `SELECT *\nFROM outbound_order_items\nWHERE quantity_shipped < quantity_ordered;`,
      explanation: [
        'ふつう filter(quantity_shipped__lt=5) のように「固定の値」と比べますが、ここでは「別の列（quantity_ordered）」と比べたい。そんなときは F(\'quantity_ordered\') と書きます。',
        'F は「この行の、その列の値」を指す目印です。これで「出荷数 < 指示数」のような列どうしの比較ができ、SQL でもそのまま列名どうしの比較になります。',
      ],
      points: ['F', '列どうしの比較'],
    },
  ],
}

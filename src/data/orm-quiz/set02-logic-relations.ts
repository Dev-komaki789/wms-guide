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
    {
      question: '「倉庫ID が 1」かつ「作業中（in_progress）」のピッキングリストを、filter を2回つなげて（チェーンして）取得してください。',
      hint: 'filter をつなげると AND になる。',
      orm: `PickingList.objects \n  .filter(warehouse_id=1) \n  .filter(status='in_progress')`,
      sql: `SELECT *\nFROM picking_lists\nWHERE warehouse_id = 1\n  AND status = 'in_progress';`,
      explanation: [
        'filter を続けて呼ぶと、条件が AND（すべて満たす）で重なっていきます。filter(a).filter(b) は filter(a, b) と同じ意味です。',
        '条件を段階的に足していけるので、「共通の絞り込み＋追加の絞り込み」を別々の変数で組み立てるときに便利です。',
      ],
      points: ['filter チェーン', 'AND'],
    },
    {
      question: '作業中（in_progress）「以外」のピッキングリストを、Q オブジェクトの否定（~）を使って取得してください。',
      hint: 'Q の前に ~ を付けると「でない（NOT）」。',
      orm: `from django.db.models import Q\n\nPickingList.objects.filter(\n  ~Q(status='in_progress')\n)`,
      sql: `SELECT *\nFROM picking_lists\nWHERE NOT (status = 'in_progress');`,
      explanation: [
        '~Q(...) は「その条件の否定（NOT）」です。~Q(status=\'in_progress\') で「作業中ではない」を表します。',
        'これは exclude(status=\'in_progress\') と同じ意味です。単純な除外は exclude が読みやすいですが、~Q は他の Q と「| や &」で組み合わせて複雑な条件を作れるのが強みです。',
      ],
      points: ['~Q（NOT）', 'exclude と同等'],
    },
    {
      question: 'カテゴリ名（category_name）が「文具」「以外」の商品の SKU を取得してください。関連をまたいで除外します。',
      hint: 'exclude にも __ で関連をたどる条件を書ける。',
      orm: `Sku.objects.exclude(\n  product__category__category_name='文具'\n)`,
      sql: `SELECT skus.*\nFROM skus\nJOIN products ON products.id = skus.product_id\nJOIN categories ON categories.id = products.category_id\nWHERE NOT (categories.category_name = '文具');`,
      explanation: [
        'exclude にも __ で関連をたどる条件を書けます。product__category__category_name=\'文具\' を「除外」するので、「文具カテゴリ以外の商品の SKU」になります。',
        'filter で同じ条件を書けば「文具だけ」、exclude なら「文具以外」。関連をまたいだ絞り込みでも、filter と exclude の関係は変わりません。',
      ],
      points: ['exclude（関連）', 'JOIN', 'NOT'],
    },
    {
      question: 'ロケーションが属する倉庫（location → warehouse）の ID が 1 である在庫を取得してください。2段階たどります。',
      hint: '__ をつなげると何段でもたどれる。',
      orm: `StockBalance.objects.filter(\n  location__warehouse_id=1\n)`,
      sql: `SELECT stock_balances.*\nFROM stock_balances\nJOIN locations ON locations.id = stock_balances.location_id\nWHERE locations.warehouse_id = 1;`,
      explanation: [
        'location__warehouse_id は「在庫の location をたどり、その warehouse_id」。__ は何段でもつなげられます。',
        '末尾を warehouse_id（番号）にしているのがポイント。warehouse__id でも同じ結果ですが、番号だけ比べたいときは _id で十分（余計な JOIN を1つ減らせることがあります）。',
      ],
      points: ['__（多段）', 'JOIN'],
    },
    {
      question: 'すでに出荷された（shipped_at に値がある）出荷指示を取得してください。',
      hint: '「値がある」は __isnull=False。',
      orm: `OutboundOrder.objects.filter(\n  shipped_at__isnull=False\n)`,
      sql: `SELECT *\nFROM outbound_orders\nWHERE shipped_at IS NOT NULL;`,
      explanation: [
        '__isnull=False は「その項目が空でない（値がある）」という意味で、SQL の IS NOT NULL です。',
        '前のセットの __isnull=True（未設定）の逆。日時や ForeignKey で「設定済みのものだけ」を取りたいときに使います。',
      ],
      points: ['__isnull=False', 'IS NOT NULL'],
    },
    {
      question: '「（完了 または 取消）かつ 倉庫ID が 1」のピッキングリストを取得してください。OR と AND が混ざります。',
      hint: 'OR の部分を Q でくくり、AND は通常どおりカンマ（または &）。',
      orm: `from django.db.models import Q\n\nPickingList.objects.filter(\n  Q(status='completed') | Q(status='cancelled'),\n  warehouse_id=1,\n)`,
      sql: `SELECT *\nFROM picking_lists\nWHERE (status = 'completed' OR status = 'cancelled')\n  AND warehouse_id = 1;`,
      explanation: [
        'OR にしたい部分だけ Q(...) | Q(...) でくくり、そのあとにカンマで warehouse_id=1 を足すと AND になります。SQL の (A OR B) AND C と同じ構造です。',
        'filter の中で「Q どうしは | で OR、カンマ区切りや & で AND」。この組み合わせで、かっこ付きの複雑な条件も表現できます。',
      ],
      points: ['Q の | と AND', '優先順位'],
    },
    {
      question: 'まだピッキングされていない明細（items の picked_at が未設定）を「1件でも持つ」ピッキングリストを取得してください。逆方向（親←子）の条件です。',
      hint: '逆参照 items を __ でたどって条件を書く。重複に注意。',
      orm: `PickingList.objects.filter(\n  items__picked_at__isnull=True\n).distinct()`,
      sql: `SELECT DISTINCT picking_lists.*\nFROM picking_lists\nJOIN picking_list_items\n  ON picking_list_items.picking_list_id = picking_lists.id\nWHERE picking_list_items.picked_at IS NULL;`,
      explanation: [
        'items__picked_at__isnull=True は「related_name=items（子の明細）をたどり、その picked_at が空」。親から子の条件で絞り込めます。',
        '1つの親に未ピッキング明細が複数あると、JOIN の結果その親が何回も出てきます。distinct() で重複を1つにまとめます。「子の条件で親を絞る」ときの定番の注意点です。',
      ],
      points: ['逆参照で絞る', 'distinct()', 'JOIN'],
    },
    {
      question: '指示数（quantity_ordered）が「実出荷数（quantity_shipped）＋ 1」より大きい明細（あと2つ以上足りない）を取得してください。F で足し算します。',
      hint: 'F は計算もできる： F("quantity_shipped") + 1。',
      orm: `from django.db.models import F\n\nOutboundOrderItem.objects.filter(\n  quantity_ordered__gt=F('quantity_shipped') + 1\n)`,
      sql: `SELECT *\nFROM outbound_order_items\nWHERE quantity_ordered > quantity_shipped + 1;`,
      explanation: [
        'F は列を指すだけでなく、F(\'quantity_shipped\') + 1 のように計算もできます。これで「列＋数値」と比較する条件が書けます。',
        '「指示数 > 出荷数 + 1」＝まだ2個以上足りない、という意味。F を使うと、Python 側に値を持ってこずに DB の中で列どうし・列と数値の計算ができます。',
      ],
      points: ['F の計算', '列の演算'],
    },
    {
      question: '開始日時（started_at）が 2026 年のピッキングリストを取得してください。',
      hint: '日時から「年」を取り出す lookup は __year。',
      orm: `PickingList.objects.filter(\n  started_at__year=2026\n)`,
      sql: `SELECT *\nFROM picking_lists\nWHERE EXTRACT(YEAR FROM started_at) = 2026;`,
      explanation: [
        '日時フィールドには「年・月・日」を取り出す lookup があります。__year で年、__month で月、__day で日を条件にできます。',
        'started_at__year=2026 で「2026年に開始したもの」。SQL では年を取り出して比較する形（EXTRACT / strftime）に翻訳されます。月別・年別の絞り込みでよく使います。',
      ],
      points: ['__year', '日付の lookup'],
    },
    {
      question: '「倉庫ID が 1 以外」で「作業中（in_progress）」のピッキングリストを取得してください。exclude と filter を組み合わせます。',
      hint: 'exclude（除外）と filter（残す）はつなげられる。',
      orm: `PickingList.objects \n  .exclude(warehouse_id=1) \n  .filter(status='in_progress')`,
      sql: `SELECT *\nFROM picking_lists\nWHERE NOT (warehouse_id = 1)\n  AND status = 'in_progress';`,
      explanation: [
        'exclude（〜以外）と filter（〜だけ）はチェーンできます。「倉庫1を除き、そのうえで作業中だけ」と段階的に絞り込めます。',
        '順番は入れ替えても結果は同じ（どちらも AND で重なる）。読みやすい順で書けば OK です。',
      ],
      points: ['exclude + filter', 'NOT と AND'],
    },
  ],
}

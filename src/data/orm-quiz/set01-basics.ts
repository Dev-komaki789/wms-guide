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
    {
      question: '商品（Product）を、すべて取得してください。',
      hint: '全部ください、は all()。',
      orm: `Product.objects.all()`,
      sql: `SELECT * FROM products;`,
      explanation: [
        'all() は「そのテーブルの全行」を表す、いちばん基本の取得です。SQL の SELECT * FROM products にあたります。',
        'all() の戻り値は QuerySet（注文票）なので、この時点ではまだ DB に問い合わせていません。for で回したりリストにしたりした瞬間に、はじめて実行されます（遅延評価）。',
      ],
      points: ['all()', 'SELECT'],
    },
    {
      question: 'ID（主キー）が 5 の商品を「1件」取得してください。',
      hint: 'ちょうど1件を取り出すのは get()。',
      orm: `Product.objects.get(pk=5)`,
      sql: `SELECT *\nFROM products\nWHERE id = 5\nLIMIT 1;`,
      explanation: [
        'get() は「条件に一致する“ちょうど1件”」を取り出し、QuerySet ではなくオブジェクトそのものを返します。pk は主キー（ここでは id）を指す特別な名前です。',
        '注意：get() は0件だと DoesNotExist、2件以上だと MultipleObjectsReturned というエラーになります。「無いかもしれない」ときは filter().first() を使うか、Web では get_object_or_404 が便利です。',
      ],
      points: ['get()', 'pk', '1件取得'],
    },
    {
      question: '在庫（StockBalance）を在庫数の少ない順に並べ、その先頭の1件だけを取得してください。',
      hint: '先頭1件は first()。無ければ None。',
      orm: `StockBalance.objects\n  .order_by('quantity')\n  .first()`,
      sql: `SELECT *\nFROM stock_balances\nORDER BY quantity ASC\nLIMIT 1;`,
      explanation: [
        'first() は「並びの先頭1件」を返します。get() と違い、0件のときはエラーにならず None を返すので安全です。',
        'order_by(\'quantity\')（マイナス無し）は「小さい順（昇順）」。SQL の ASC です。「いちばん在庫が少ない1件」を取りたいときの形です。',
      ],
      points: ['first()', 'order_by（昇順）', 'LIMIT 1'],
    },
    {
      question: 'ステータスが「作業中（in_progress）」のピッキングリストが何件あるか、件数を求めてください。',
      hint: '件数は count()。',
      orm: `PickingList.objects\n  .filter(status='in_progress')\n  .count()`,
      sql: `SELECT COUNT(*)\nFROM picking_lists\nWHERE status = 'in_progress';`,
      explanation: [
        'count() は件数（何件あるか）を数えて整数で返します。SQL の COUNT(*) にあたります。',
        '「件数だけ」が欲しいときは、len(qs) で全件を取り出してから数えるより count() の方が速いです（DB 側で数えるだけで、中身を運んでこないため）。',
      ],
      points: ['count()', 'COUNT'],
    },
    {
      question: '商品名（product_name）に「ペン」を含む商品を、大文字小文字を区別せずに取得してください。',
      hint: '「含む（大小無視）」は __icontains。',
      orm: `Product.objects.filter(\n  product_name__icontains='ペン'\n)`,
      sql: `SELECT *\nFROM products\nWHERE product_name ILIKE '%ペン%';`,
      explanation: [
        '__contains は「含む（LIKE \'%…%\'）」。先頭に i を付けた __icontains は「大文字小文字を区別せずに含む」です。検索ボックスの部分一致でよく使います。',
        'PostgreSQL では ILIKE（大小無視の LIKE）に翻訳されます。日本語には大小の区別がありませんが、英数字混じりの検索で効いてきます。',
      ],
      points: ['__icontains', 'ILIKE'],
    },
    {
      question: '在庫数が「10以上 50以下」の在庫を取得してください。range（範囲）を使ってみましょう。',
      hint: '「A以上B以下」は __range=(A, B)。',
      orm: `StockBalance.objects.filter(\n  quantity__range=(10, 50)\n)`,
      sql: `SELECT *\nFROM stock_balances\nWHERE quantity BETWEEN 10 AND 50;`,
      explanation: [
        '__range=(10, 50) は「10以上50以下（両端を含む）」。SQL の BETWEEN 10 AND 50 にあたります。',
        'quantity__gte=10, quantity__lt=51 のように書いても同じですが、範囲は __range の方が読みやすいです。日付の範囲（その月のあいだ等）にもよく使います。',
      ],
      points: ['__range', 'BETWEEN'],
    },
    {
      question: 'ピッキングリストを「ステータスの昇順、同じステータスなら開始日時（started_at）の新しい順」で並べてください。並べ替えのキーを2つ使います。',
      hint: 'order_by にカンマで複数並べる。前が優先。',
      orm: `PickingList.objects.order_by(\n  'status', '-started_at'\n)`,
      sql: `SELECT *\nFROM picking_lists\nORDER BY status ASC,\n         started_at DESC;`,
      explanation: [
        'order_by に複数のキーを書くと、「まず先頭で並べ、同じものの中で次のキーで並べる」という意味になります。SQL の ORDER BY status, started_at と同じ。',
        'ここでは status は昇順（マイナス無し）、started_at は降順（マイナス付き）と、キーごとに向きを変えています。',
      ],
      points: ['order_by（複数キー）', 'ORDER BY'],
    },
    {
      question: 'すべての SKU の「sku_code だけ」を、フラットなリスト（["PEN-01", "PEN-02", ...]）として取得してください。',
      hint: '1列だけのリストは values_list(..., flat=True)。',
      orm: `Sku.objects.values_list(\n  'sku_code', flat=True\n)`,
      sql: `SELECT sku_code FROM skus;`,
      explanation: [
        'values_list(\'sku_code\') は各行を ("PEN-01",) のようなタプルで返しますが、flat=True を付けると "PEN-01" の“ただの値”が並んだリストになります。',
        '「ID だけ集めたい」「コードの一覧が欲しい」ときに便利。オブジェクト全体を読み込まないので軽いのも利点です。',
      ],
      points: ['values_list', 'flat=True'],
    },
    {
      question: 'ピッキングリストに登場する「ステータスの種類」を、重複なしで一覧したいです。',
      hint: '値を取り出す values_list と、重複を消す distinct() を組み合わせる。',
      orm: `PickingList.objects\n  .values_list('status', flat=True)\n  .distinct()`,
      sql: `SELECT DISTINCT status\nFROM picking_lists;`,
      explanation: [
        'distinct() は「重複した行を1つにまとめる」もので、SQL の DISTINCT にあたります。同じステータスが何度出てきても1つにまとまります。',
        'values_list(\'status\', flat=True).distinct() で「使われているステータスの種類」が重複なしで取れます。プルダウンの選択肢を作るときなどに便利です。',
      ],
      points: ['distinct()', 'DISTINCT'],
    },
    {
      question: '在庫を「id と quantity の2つの項目だけ」、辞書のリストとして取得してください（オブジェクト全体は要らない）。',
      hint: '必要な列だけ辞書で取るのは values(...)。',
      orm: `StockBalance.objects.values(\n  'id', 'quantity'\n)\n# → [{'id': 1, 'quantity': 5}, ...]`,
      sql: `SELECT id, quantity\nFROM stock_balances;`,
      explanation: [
        'values(\'id\', \'quantity\') は、各行を {\'id\': 1, \'quantity\': 5} のような辞書にして返します。指定した列だけを SELECT するので軽くなります。',
        'モデルオブジェクト（.save() などができるもの）ではなく「ただの辞書」が欲しい、表示や集計に使うだけ、というときに向きます。1列だけなら前問の values_list が便利です。',
      ],
      points: ['values()', '必要な列だけ'],
    },
  ],
}

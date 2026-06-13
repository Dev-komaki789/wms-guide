import type { OrmQuizSet } from './types'

// 問題集 セット5「高度なクエリ」。
export const set05Advanced: OrmQuizSet = {
  id: 'advanced',
  num: 5,
  level: '上級',
  title: '高度なクエリ ― Subquery / Case・When / 日付集計 / Window',
  summary: 'サブクエリ（クエリの中のクエリ）、行ごとの条件分岐（Case/When）、月別などの日付集計、グループ内の順位づけ（ウィンドウ関数）を練習します。最初は「こう書くのか」と眺めるだけでも十分です。',
  intro: [
    '一段むずかしい内容ですが、実務のレポートや一覧で実際によく出てきます。すぐ全部使えなくても、「こういう書き方がある」と知っておくのが目標です。',
  ],
  problems: [
    {
      question: '各在庫（StockBalance）の行に、「その location × sku の、有効な予約（status="active"）の数量合計」をくっつけて取得してください。行ごとの別集計です。',
      hint: 'サブクエリ＋OuterRef。外側の行の値を OuterRef で参照する。',
      orm: `from django.db.models import OuterRef, Subquery, Sum\n\nreserved = (\n  StockReservation.objects\n    .filter(location=OuterRef('location'),\n            sku=OuterRef('sku'), status='active')\n    .values('location', 'sku')\n    .annotate(t=Sum('quantity'))\n    .values('t')\n)\nStockBalance.objects.annotate(\n  reserved=Subquery(reserved)\n)`,
      sql: `SELECT sb.*,\n  (SELECT SUM(quantity)\n   FROM stock_reservations sr\n   WHERE sr.location_id = sb.location_id\n     AND sr.sku_id = sb.sku_id\n     AND sr.status = 'active') AS reserved\nFROM stock_balances sb;`,
      explanation: [
        'OuterRef(\'location\') は「外側（在庫）の、いまの行の location」を指します。サブクエリの中からこれを使うことで、行ごとに「その場所・その SKU の予約合計」を計算できます。',
        'Subquery(...) で、その小さなクエリを1つの値として annotate にくっつけます。「各行に、関連する別集計をぶら下げたい」ときの定番です。',
      ],
      points: ['Subquery', 'OuterRef', 'サブクエリ'],
    },
    {
      question: '未ピッキングの明細（items の picked_at が空）を持つピッキングリストだけを、Exists を使って取得してください。',
      hint: 'Exists(サブクエリ) を filter に渡す。',
      orm: `from django.db.models import Exists, OuterRef\n\nunfinished = PickingListItem.objects.filter(\n  picking_list=OuterRef('pk'),\n  picked_at__isnull=True,\n)\nPickingList.objects.filter(Exists(unfinished))`,
      sql: `SELECT *\nFROM picking_lists pl\nWHERE EXISTS (\n  SELECT 1 FROM picking_list_items i\n  WHERE i.picking_list_id = pl.id\n    AND i.picked_at IS NULL\n);`,
      explanation: [
        'Exists は「関連する行が在るか」を判定します。OuterRef(\'pk\') で外側のリストを参照し、「未ピッキング明細が在るリスト」を絞り込みます。',
        '前のセットの逆参照フィルタ（items__picked_at__isnull=True）でも近いことができますが、Exists は重複が出ず distinct も要りません。「在るかどうか」で絞るなら Exists が素直です。',
      ],
      points: ['Exists', 'OuterRef', 'EXISTS'],
    },
    {
      question: '各ピッキングリストに、「未ピッキング明細が在るか」を True/False の列（has_unpicked）としてくっつけてください。',
      hint: 'Exists は annotate にも使える（印をつける）。',
      orm: `from django.db.models import Exists, OuterRef\n\nunfinished = PickingListItem.objects.filter(\n  picking_list=OuterRef('pk'),\n  picked_at__isnull=True,\n)\nPickingList.objects.annotate(\n  has_unpicked=Exists(unfinished)\n)`,
      sql: `SELECT pl.*,\n  EXISTS (\n    SELECT 1 FROM picking_list_items i\n    WHERE i.picking_list_id = pl.id\n      AND i.picked_at IS NULL\n  ) AS has_unpicked\nFROM picking_lists pl;`,
      explanation: [
        'Exists は filter（絞り込み）だけでなく annotate（列を足す）にも使えます。pl.has_unpicked が True/False になります。',
        '「絞り込まず、印だけ付けて画面で出し分けたい」（未完了バッジを出す等）ときに便利です。',
      ],
      points: ['Exists', 'annotate'],
    },
    {
      question: '各在庫に、在庫数に応じた区分（0なら"欠品"、10未満なら"残りわずか"、それ以外"十分"）を level 列として付けてください。',
      hint: '行ごとの「もし〜なら」は Case / When。',
      orm: `from django.db.models import Case, When, Value, CharField\n\nStockBalance.objects.annotate(\n  level=Case(\n    When(quantity=0, then=Value('欠品')),\n    When(quantity__lt=10, then=Value('残りわずか')),\n    default=Value('十分'),\n    output_field=CharField(),\n  )\n)`,
      sql: `SELECT sb.*,\n  CASE\n    WHEN quantity = 0 THEN '欠品'\n    WHEN quantity < 10 THEN '残りわずか'\n    ELSE '十分'\n  END AS level\nFROM stock_balances sb;`,
      explanation: [
        'When(条件, then=値) を上から順に試し、最初に当てはまった値を採用します。どれにも当てはまらなければ default。SQL の CASE WHEN … END です。',
        'output_field は「結果は文字列ですよ」と Django に教えるためのもの。数値の区分なら IntegerField にします。',
      ],
      points: ['Case', 'When', 'Value', 'CASE'],
    },
    {
      question: 'ピッキングリストを「作業中(in_progress)を先頭、完了(completed)を最後」にした独自の順で並べてください。',
      hint: 'Case で各ステータスに並び順の数値を割り当て、それで order_by。',
      orm: `from django.db.models import Case, When, Value, IntegerField\n\nPickingList.objects.annotate(\n  ord=Case(\n    When(status='in_progress', then=Value(0)),\n    When(status='pending', then=Value(1)),\n    When(status='completed', then=Value(2)),\n    default=Value(9),\n    output_field=IntegerField(),\n  )\n).order_by('ord')`,
      sql: `SELECT *,\n  CASE status\n    WHEN 'in_progress' THEN 0\n    WHEN 'pending' THEN 1\n    WHEN 'completed' THEN 2\n    ELSE 9\n  END AS ord\nFROM picking_lists\nORDER BY ord;`,
      explanation: [
        'ステータスは文字なので、そのまま order_by するとアルファベット順になってしまいます。Case で「各ステータス→並び順の数値」を作り、その数値で order_by すれば任意の順にできます。',
        'annotate で付けた ord を order_by に使う、という前のセットの「集計値で並べる」と同じ考え方です。',
      ],
      points: ['Case', 'order_by（集計値）'],
    },
    {
      question: '有効な予約（status="active"）の数量合計を求めてください。1件も無いときは NULL ではなく 0 を返すこと。',
      hint: '集計が NULL になるのを防ぐのは Coalesce。',
      orm: `from django.db.models import Sum, Value\nfrom django.db.models.functions import Coalesce\n\nStockReservation.objects \n  .filter(status='active') \n  .aggregate(\n    total=Coalesce(Sum('quantity'), Value(0))\n  )`,
      sql: `SELECT COALESCE(SUM(quantity), 0) AS total\nFROM stock_reservations\nWHERE status = 'active';`,
      explanation: [
        '対象が1件も無いと Sum は NULL を返します。Coalesce(Sum(...), Value(0)) で「空なら 0」にして、安心して数として扱えます。',
        'Coalesce は「左から最初の“空でない値”」を返す関数。集計・サブクエリが NULL になる事故の定番対策です。',
      ],
      points: ['Coalesce', 'Value', 'COALESCE'],
    },
    {
      question: '商品の表示用ラベルとして「商品コード + " " + 商品名」を label 列で作ってください（例: "PEN-01 ボールペン"）。',
      hint: '文字をつなぐのは Concat。',
      orm: `from django.db.models import Value\nfrom django.db.models.functions import Concat\n\nProduct.objects.annotate(\n  label=Concat('product_code', Value(' '), 'product_name')\n)`,
      sql: `SELECT products.*,\n  product_code || ' ' || product_name AS label\nFROM products;`,
      explanation: [
        'Concat は複数の文字列をつなげる関数です。列名はそのまま、固定文字（区切りの空白）は Value(\' \') で渡します。',
        '結果は p.label で取れます。表示名や検索用キーを DB 側で組み立てたいときに使います（SQL では || などの連結に翻訳されます）。',
      ],
      points: ['Concat', 'Value'],
    },
    {
      question: '在庫数（数値）を文字列に変換して取り出してください（例: 表示やコード化のため）。',
      hint: '型を変えるのは Cast。',
      orm: `from django.db.models import CharField\nfrom django.db.models.functions import Cast\n\nStockBalance.objects.annotate(\n  qty_text=Cast('quantity', CharField())\n)`,
      sql: `SELECT sb.*,\n  CAST(quantity AS varchar) AS qty_text\nFROM stock_balances sb;`,
      explanation: [
        'Cast は値の型を変えます。Cast(\'quantity\', CharField()) で数値の在庫数を文字列に変換します。SQL の CAST です。',
        '「数値を文字として連結したい」「文字を日付として比較したい」など、型をそろえたいときに使います。',
      ],
      points: ['Cast'],
    },
    {
      question: '在庫移動（StockMovement）の件数を「月別」に集計してください（moved_at を月でまとめる）。',
      hint: '日時を月に切りそろえるのは TruncMonth。',
      orm: `from django.db.models import Count\nfrom django.db.models.functions import TruncMonth\n\nStockMovement.objects \n  .annotate(month=TruncMonth('moved_at')) \n  .values('month') \n  .annotate(n=Count('id')) \n  .order_by('month')`,
      sql: `SELECT date_trunc('month', moved_at) AS month,\n       COUNT(id) AS n\nFROM stock_movements\nGROUP BY date_trunc('month', moved_at)\nORDER BY month;`,
      explanation: [
        'TruncMonth(\'moved_at\') は日時を「その月の1日」に切りそろえます。これを values でグループ単位にすれば「月別」の集計になります。',
        '「月で切る(annotate) → 月でまとめる(values+annotate)」が月別集計の型。日別なら TruncDate、年別なら TruncYear を使います。',
      ],
      points: ['TruncMonth', 'date_trunc', 'GROUP BY'],
    },
    {
      question: '在庫移動のうち「2026年」のものだけを、年の数値を取り出して集計の前に絞り込みたいです。年だけを取り出して比較してください。',
      hint: '日時から年を取り出すのは ExtractYear（または __year）。',
      orm: `from django.db.models import Count\nfrom django.db.models.functions import ExtractYear\n\nStockMovement.objects \n  .annotate(y=ExtractYear('moved_at')) \n  .filter(y=2026) \n  .count()`,
      sql: `SELECT COUNT(*)\nFROM stock_movements\nWHERE EXTRACT(YEAR FROM moved_at) = 2026;`,
      explanation: [
        'ExtractYear は日時から「年」の数値（2026 など）を取り出します。ExtractMonth なら月。annotate で列にして filter できます。',
        'ちなみに単に絞るだけなら moved_at__year=2026（前セットの __year）でも同じです。Extract は「年や月そのものを値として使いたい・集計したい」ときに役立ちます。',
      ],
      points: ['ExtractYear', 'EXTRACT', '__year'],
    },
    {
      question: '各在庫に「自分のロケーションの中で、在庫数が多い順の順位」を rank 列として付けてください。グループ内順位です。',
      hint: 'ウィンドウ関数 Window + RowNumber、partition_by でグループ指定。',
      orm: `from django.db.models import Window, F\nfrom django.db.models.functions import RowNumber\n\nStockBalance.objects.annotate(\n  rank=Window(\n    expression=RowNumber(),\n    partition_by=[F('location')],\n    order_by=F('quantity').desc(),\n  )\n)`,
      sql: `SELECT sb.*,\n  ROW_NUMBER() OVER (\n    PARTITION BY location_id\n    ORDER BY quantity DESC\n  ) AS rank\nFROM stock_balances sb;`,
      explanation: [
        'ウィンドウ関数は「行を1つにまとめず、各行に順位などを付け足す」しくみです。partition_by が「どの単位ごとに」、order_by が「その中で何順に番号を振るか」。',
        'RowNumber は同点でも 1,2,3… と通し番号。各ロケーションの「在庫が多い順の順位」が付きます。「各グループの1位だけ」を出す土台にもなります。',
      ],
      points: ['Window', 'RowNumber', 'partition_by', 'ROW_NUMBER'],
    },
    {
      question: '前問と同じ順位づけで、同じ在庫数なら「同順位」にしたい場合は、どの関数に変えますか？',
      hint: '通し番号の RowNumber に対し、同順位は Rank。',
      orm: `from django.db.models import Window, F\nfrom django.db.models.functions import Rank\n\nStockBalance.objects.annotate(\n  rank=Window(\n    expression=Rank(),\n    partition_by=[F('location')],\n    order_by=F('quantity').desc(),\n  )\n)`,
      sql: `SELECT sb.*,\n  RANK() OVER (\n    PARTITION BY location_id\n    ORDER BY quantity DESC\n  ) AS rank\nFROM stock_balances sb;`,
      explanation: [
        'RowNumber は同点でも別番号（1,2,3）ですが、Rank は同点を同じ順位にします（1,1,3 のように、同点の次は飛ぶ）。',
        '「同じ値は同じ順位にしたい」ランキング表示なら Rank。飛ばさず詰めたいなら DenseRank もあります。目的に合わせて選びます。',
      ],
      points: ['Window', 'Rank'],
    },
    {
      question: '各 SKU に「その SKU の最新の在庫移動日時（moved_at の最大）」をくっつけてください。サブクエリで1件取る形でも、集計でも書けます。',
      hint: 'サブクエリ：order_by して values(...)[:1] で「最新の1件」を取る。',
      orm: `from django.db.models import OuterRef, Subquery\n\nlatest = StockMovement.objects \n  .filter(sku=OuterRef('pk')) \n  .order_by('-moved_at') \n  .values('moved_at')[:1]\nSku.objects.annotate(\n  last_moved=Subquery(latest)\n)`,
      sql: `SELECT skus.*,\n  (SELECT moved_at FROM stock_movements sm\n   WHERE sm.sku_id = skus.id\n   ORDER BY sm.moved_at DESC\n   LIMIT 1) AS last_moved\nFROM skus;`,
      explanation: [
        'サブクエリを「order_by して values(...)[:1]」にすると、「その SKU の最新の1件の moved_at」を取れます。OuterRef(\'pk\') で外側の SKU を参照しています。',
        '「各親に、関連の“最新の1件の値”をぶら下げたい」（最終ログイン日時・最新の注文日など）という、実務頻出のパターンです。',
      ],
      points: ['Subquery', 'OuterRef', 'LIMIT 1'],
    },
    {
      question: '各出荷明細に「残数（指示数 − 出荷数）」を remaining 列として付けてください。列どうしの引き算です。',
      hint: 'annotate の中で F の引き算。',
      orm: `from django.db.models import F\n\nOutboundOrderItem.objects.annotate(\n  remaining=F('quantity_ordered') - F('quantity_shipped')\n)`,
      sql: `SELECT outbound_order_items.*,\n  (quantity_ordered - quantity_shipped) AS remaining\nFROM outbound_order_items;`,
      explanation: [
        'F は列を指すだけでなく、F(\'a\') - F(\'b\') のように列どうしの計算もできます。annotate に入れれば、計算結果の列を足せます。',
        'Python 側に値を持ってこず、DB の中で引き算するので速く、order_by(\'remaining\') で「残りが多い順」に並べることもできます。',
      ],
      points: ['F', 'annotate'],
    },
  ],
}

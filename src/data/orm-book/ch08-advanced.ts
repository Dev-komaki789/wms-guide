import type { OrmChapter } from './types'

// 第8章「高度なクエリ」。Subquery / OuterRef / Exists / 関数（Coalesce/Concat/Cast）。
export const ch08Advanced: OrmChapter = {
  id: 'advanced',
  num: 8,
  title: '高度なクエリ ― Subquery / Exists / 関数',
  summary: '少しむずかしいけれど実務でよく出てくる「クエリの中のクエリ（サブクエリ）」や、DB の関数を ORM から使う方法を、ゆっくり紹介します。最初は「こういうものがある」と眺めるだけで十分です。',
  intro: [
    'この章は一段むずかしくなります。でも安心してください。「今すぐ全部使えるように」ではなく、「将来こういう書き方に出会ったら思い出せる」ことが目標です。',
    '主役は、ひとつのクエリの中で別のクエリを使う“サブクエリ”と、文字や数値を加工する“関数”です。',
  ],
  sections: [
    {
      id: 'subquery',
      heading: '8-1. サブクエリ ― クエリの中でクエリを使う',
      body: [
        'サブクエリ（subquery）とは「クエリの中に埋め込む、もう一つのクエリ」です。たとえば「各在庫の行に、その SKU の予約数の合計をくっつけたい」といった、行ごとに別の集計を持ってきたいときに使います。',
        '鍵になるのが OuterRef（アウターレフ）です。これは「外側のクエリの、いまの行のこの項目」を指す目印で、サブクエリの中から外の行を参照するために使います。',
      ],
      examples: [
        {
          orm: `from django.db.models import OuterRef, Subquery, Sum\n\nreserved = (\n  StockReservation.objects\n    .filter(location=OuterRef('location'), sku=OuterRef('sku'),\n            status='active')\n    .values('location', 'sku')\n    .annotate(total=Sum('quantity'))\n    .values('total')\n)\nStockBalance.objects.annotate(reserved=Subquery(reserved))`,
          sql: `SELECT stock_balances.*,\n  (SELECT SUM(quantity)\n   FROM stock_reservations sr\n   WHERE sr.location_id = stock_balances.location_id\n     AND sr.sku_id = stock_balances.sku_id\n     AND sr.status = 'active') AS reserved\nFROM stock_balances;`,
          note: 'OuterRef("location") が「外側の、いまの在庫行のロケーション」を指します。各在庫行に「その場所・その SKU の予約合計」をくっつけています。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：サブクエリは「内側のクエリ」、外側を「メインのクエリ」と呼びます。OuterRef は内側から外側の値を指す“矢印”だと思ってください。',
        },
      ],
    },
    {
      id: 'exists',
      heading: '8-2. Exists() ― 「関連が在るか」で絞る・印をつける',
      body: [
        '「未完了の明細が残っているリストだけ」のように、“関連する行が在るかどうか”で絞りたいときは Exists を使います。サブクエリの結果が1件でもあれば True、なければ False になります。',
        '件数を数えるより軽い（1件見つかれば打ち切る）のが利点です。',
      ],
      examples: [
        {
          orm: `from django.db.models import Exists, OuterRef\n\nunfinished = PickingListItem.objects.filter(\n  picking_list=OuterRef('pk'),\n  picked_at__isnull=True,\n)\nPickingList.objects.filter(Exists(unfinished))`,
          sql: `SELECT *\nFROM picking_lists pl\nWHERE EXISTS (\n  SELECT 1 FROM picking_list_items i\n  WHERE i.picking_list_id = pl.id\n    AND i.picked_at IS NULL\n);`,
          note: '「未ピッキングの明細が在るリスト」だけを残します。EXISTS は「在るか？」を判定する SQL です。',
        },
      ],
    },
    {
      id: 'functions',
      heading: '8-3. DB の関数を使う ― Coalesce / Concat / Cast',
      body: [
        'DB には文字や数値を加工する関数があり、ORM からも使えます。よく出る3つだけ紹介します。',
      ],
      table: {
        headers: ['関数', 'やること', '使いどころ'],
        rows: [
          ['Coalesce', '空(NULL)なら別の値に置きかえる', '合計が無いとき 0 にする等'],
          ['Concat', '文字をつなげる', '姓と名をつないで表示名にする等'],
          ['Cast', '型を変える', '数値を文字に、文字を日付に等'],
        ],
      },
      examples: [
        {
          orm: `from django.db.models import Sum, Value\nfrom django.db.models.functions import Coalesce\n\nStockReservation.objects\n  .filter(status='active')\n  .aggregate(\n    total=Coalesce(Sum('quantity'), Value(0))\n  )`,
          sql: `SELECT COALESCE(SUM(quantity), 0) AS total\nFROM stock_reservations\nWHERE status = 'active';`,
          note: '予約が1件も無いと Sum は NULL（空）になります。Coalesce(..., Value(0)) で「空なら 0」にして、安心して数として扱えるようにしています。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: '初心者がいちばん助かるのは Coalesce です。「合計や平均が NULL になって計算が崩れる」のを防げます。まずはこれだけ覚えておけば十分です。',
        },
      ],
    },
  ],
}

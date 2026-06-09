import type { OrmChapter } from './types'

// 第3章「絞り込み」。filter / exclude とフィールドルックアップ大全。
export const ch03Filtering: OrmChapter = {
  id: 'filtering',
  num: 3,
  title: '絞り込み ― filter / exclude とフィールドルックアップ大全',
  summary: '「条件に合うものだけ取り出す」やり方の中心、filter と exclude を学びます。さらに「以上・以下」「あいまい検索」「いずれか」などを表す“ルックアップ”を一覧で身につけます。',
  intro: [
    'データ取得でいちばんよく使うのが「条件で絞り込む」操作です。Django では filter（合うものだけ）と exclude（除くもの）で表します。',
    'そして「在庫数が10以上」「名前に“本”を含む」のような細かい条件は、フィールド名のうしろに __（アンダーバー2つ）でルックアップを付けて表します。ここがこの章の山場ですが、表で一気に覚えられます。',
  ],
  sections: [
    {
      id: 'filter',
      heading: '3-1. filter() ― 条件に合うものだけ',
      body: [
        'filter() のカッコの中に「項目=値」を書くと、それに合う行だけが残ります。カンマで区切って複数書くと、すべてを満たすもの（AND＝かつ）になります。',
      ],
      examples: [
        {
          orm: `PickingList.objects.filter(\n  warehouse_id=1,\n  status='in_progress',\n)`,
          sql: `SELECT *\nFROM picking_lists\nWHERE warehouse_id = 1\n  AND status = 'in_progress';`,
          note: 'カンマ区切りは AND（かつ）。「倉庫1 かつ 作業中」の両方を満たす行だけが残ります。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：AND（アンド）は「かつ（両方とも）」、OR（オア）は「または（どちらか）」という意味です。filter のカンマ区切りは AND。OR を使いたいときは第4章の Q オブジェクトを使います。',
        },
      ],
    },
    {
      id: 'chaining-filter',
      heading: '3-2. filter をつなげても AND',
      body: [
        'filter() を2回つなげても、結果は両方の条件を満たすもの（AND）になります。条件を少しずつ足していく書き方ができて便利です。',
      ],
      examples: [
        {
          orm: `PickingList.objects\n  .filter(warehouse_id=1)\n  .filter(status='in_progress')`,
          sql: `SELECT *\nFROM picking_lists\nWHERE warehouse_id = 1\n  AND status = 'in_progress';`,
          note: '3-1 とまったく同じ意味。「先に倉庫で絞り、さらに状態で絞る」と読めます。',
        },
      ],
    },
    {
      id: 'exclude',
      heading: '3-3. exclude() ― 条件に合うものを“除く”',
      body: [
        'exclude() は filter() の反対で、「条件に合うものを取りのぞく」操作です。「完了したもの以外」のように、“〜以外”を表したいときに使います。',
      ],
      examples: [
        {
          orm: `PickingList.objects.exclude(status='completed')`,
          sql: `SELECT *\nFROM picking_lists\nWHERE NOT (status = 'completed');`,
          note: '「完了したもの以外（＝まだ終わっていないもの）」が残ります。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：NOT（ノット）は「〜ではない」を表す SQL です。exclude は WHERE NOT (...) に翻訳されます。',
        },
      ],
    },
    {
      id: 'lookups',
      heading: '3-4. フィールドルックアップ大全',
      body: [
        '「以上・以下」「含む」「いずれか」などの細かい条件は、項目名のうしろに __（アンダーバー2つ）＋ルックアップ名で表します。たとえば quantity__gte=10 は「quantity が 10 以上」です。',
        'よく使うものを一覧にしました。まずは gte / lte / icontains / in / isnull あたりを押さえれば、たいていの絞り込みは書けます。',
      ],
      table: {
        headers: ['やりたい条件', 'ルックアップ（ORM）', '生成される SQL', '意味'],
        rows: [
          ['ちょうど一致', "quantity=0", 'quantity = 0', '完全に一致'],
          ['より大きい', "quantity__gt=0", 'quantity > 0', '0 より上（0は含まない）'],
          ['以上', "quantity__gte=10", 'quantity >= 10', '10 以上（10を含む）'],
          ['より小さい', "quantity__lt=5", 'quantity < 5', '5 未満（5は含まない）'],
          ['以下', "quantity__lte=5", 'quantity <= 5', '5 以下（5を含む）'],
          ['範囲（〜から〜まで）', "quantity__range=(1, 9)", 'BETWEEN 1 AND 9', '1〜9（両端を含む）'],
          ['含む（大小文字を区別）', "code__contains='PL'", "LIKE '%PL%'", '一部に PL を含む'],
          ['含む（大小文字を無視）', "code__icontains='pl'", "LIKE '%pl%'", 'あいまい検索によく使う'],
          ['で始まる', "code__startswith='PL-'", "LIKE 'PL-%'", '先頭が一致'],
          ['で終わる', "code__endswith='-01'", "LIKE '%-01'", '末尾が一致'],
          ['いずれか', "status__in=['pending','picking']", "IN ('pending','picking')", 'リストのどれか'],
          ['空かどうか', "picked_at__isnull=True", 'IS NULL', '値が入っていない行'],
          ['空でない', "picked_at__isnull=False", 'IS NOT NULL', '値が入っている行'],
        ],
      },
      callouts: [
        {
          kind: 'note',
          text: 'ことば：LIKE（ライク）は「パターンに合うものを探す」SQL。% は「ここに何が入ってもよい」という記号です。だから %PL% は「どこかに PL を含む」、PL-% は「PL- で始まる」を意味します。',
        },
      ],
    },
    {
      id: 'lookup-examples',
      heading: '3-5. ルックアップの実例',
      body: ['いくつか実際の形で見てみましょう。'],
      examples: [
        {
          orm: `StockBalance.objects.filter(quantity__gte=10)`,
          sql: `SELECT *\nFROM stock_balances\nWHERE quantity >= 10;`,
          note: '在庫が10以上の行だけ。',
        },
        {
          orm: `PickingListItem.objects.filter(picked_at__isnull=True)`,
          sql: `SELECT *\nFROM picking_list_items\nWHERE picked_at IS NULL;`,
          note: 'picked_at（確定日時）が空＝「まだピッキングしていない明細」。NULL の判定は = ではなく IS NULL を使います。',
        },
        {
          orm: `PickingList.objects.filter(\n  status__in=['pending', 'in_progress'],\n)`,
          sql: `SELECT *\nFROM picking_lists\nWHERE status IN ('pending', 'in_progress');`,
          note: 'status が「未着手 か 作業中」のどちらか。複数の候補のどれか、を __in で表します。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'NULL（ヌル＝値が入っていない状態）は特別で、= では比べられません。「空かどうか」は必ず __isnull=True / False を使います。これは初心者がつまずく定番ポイントです。',
        },
      ],
    },
    {
      id: 'date-lookups',
      heading: '3-6. 日付の絞り込み',
      body: [
        '日付・日時の項目には、年・月・日などを取り出して比べる専用ルックアップがあります。「今年のぶんだけ」「ある日付以降」などを簡単に書けます。',
      ],
      table: {
        headers: ['やりたいこと', 'ORM', 'SQL のイメージ'],
        rows: [
          ['ある日時以降', "started_at__gte='2026-01-01'", "started_at >= '2026-01-01'"],
          ['年で絞る', 'started_at__year=2026', '年の部分が 2026'],
          ['月で絞る', 'started_at__month=6', '月の部分が 6'],
          ['日付部分が一致', "started_at__date='2026-06-09'", '日付部分が一致'],
        ],
      },
      examples: [
        {
          orm: `PickingList.objects.filter(started_at__year=2026)`,
          note: '2026年に開始されたリストだけ。日時から「年」だけを取り出して比べています。',
        },
      ],
    },
    {
      id: 'spanning',
      heading: '3-7. ちょっと先取り：関連する表の項目で絞る',
      body: [
        '__（アンダーバー2つ）は、ルックアップだけでなく「関連する別の表へたどる」のにも使います。たとえば「商品名で在庫を絞る」のように、つながった先の項目で条件を付けられます。',
        'これは“リレーション（表どうしのつながり）”の話なので、くわしくは第6章で扱います。ここでは「__ で別の表の項目にも手が届く」とだけ覚えておけば十分です。',
      ],
      examples: [
        {
          orm: `StockBalance.objects.filter(\n  sku__product__product_name__icontains='ボールペン',\n)`,
          note: '在庫 → SKU → 商品 とたどって、「商品名にボールペンを含む在庫」を絞っています。__ でつなぐほど、より奥の表の項目に届きます（第6章でくわしく）。',
        },
      ],
    },
  ],
}

import type { OrmChapter } from './types'

// 第16章「表現力を上げる」。Case/When（条件式）/ Trunc・Extract（日付集計）/ bulk_update（一括更新）/ Window（順位づけ）。
export const ch16Expressions: OrmChapter = {
  id: 'expressions',
  num: 16,
  title: 'もっと表現力を ― 条件式・日付の集計・一括更新・順位づけ',
  summary: '「ステータスごとにラベルを付けたい」「月別に件数を出したい」「順位を付けたい」――実務でよく出るのに、ここまでで扱っていなかった書き方を4つまとめて紹介します。どれも「DB 側で計算してもらう」のが共通点です。',
  intro: [
    'ここまでで取り出し・絞り込み・集計の基本はそろいました。この章では、実務のレポートや画面づくりで「あると一気に楽になる」4つの道具を足します。',
    '条件分岐（Case/When）、日付のまとめ（Trunc/Extract）、まとめて更新（bulk_update）、順位づけ（Window）です。',
  ],
  sections: [
    {
      id: 'case-when',
      heading: '16-1. Case / When ― 行ごとの「もし〜なら」',
      body: [
        '「在庫が0なら欠品、10未満なら残りわずか、それ以外は十分」のように、行ごとに条件で値を出し分けたいことがあります。これを DB 側でやるのが Case / When です。Python の if/elif/else に当たります。',
        'annotate（列を付け足す）と組み合わせて、「区分」の列を計算で生やすのが定番です。',
      ],
      examples: [
        {
          orm: `from django.db.models import Case, When, Value, CharField\n\nStockBalance.objects.annotate(\n  level=Case(\n    When(quantity=0, then=Value('欠品')),\n    When(quantity__lt=10, then=Value('残りわずか')),\n    default=Value('十分'),\n    output_field=CharField(),\n  )\n)`,
          sql: `SELECT stock_balances.*,\n  CASE\n    WHEN quantity = 0 THEN '欠品'\n    WHEN quantity < 10 THEN '残りわずか'\n    ELSE '十分'\n  END AS level\nFROM stock_balances;`,
          note: 'When(条件, then=その時の値) を上から順に試し、当てはまった最初のものを採用します。どれにも当てはまらなければ default。output_field は「結果は文字列ですよ」と Django に教えるためのものです。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'Case/When は order_by の中でも使えます。「作業中を先頭、完了を最後」のような“独自の並び順”を作りたいときに便利です。',
        },
      ],
    },
    {
      id: 'date-aggregation',
      heading: '16-2. 日付でまとめる ― Trunc と Extract',
      body: [
        '「月別の出荷件数」「日別の在庫移動数」のような集計は実務の定番です。日時をそのまま GROUP BY すると秒単位でバラバラになってしまうので、「月単位に切りそろえる（Trunc）」か「月の数字だけ取り出す（Extract）」を使います。',
      ],
      table: {
        headers: ['道具', 'すること', '結果の例'],
        rows: [
          ['TruncMonth(\'moved_at\')', '日時を「その月の1日」に切りそろえる', '2026-06-11 → 2026-06-01'],
          ['TruncDate(\'moved_at\')', '日時を「日付」に切りそろえる', '2026-06-11 14:30 → 2026-06-11'],
          ['ExtractYear(\'moved_at\')', '年の数字だけ取り出す', '2026'],
          ['ExtractMonth(\'moved_at\')', '月の数字だけ取り出す', '6'],
        ],
      },
      examples: [
        {
          orm: `from django.db.models import Count\nfrom django.db.models.functions import TruncMonth\n\nStockMovement.objects\n  .annotate(month=TruncMonth('moved_at'))\n  .values('month')\n  .annotate(count=Count('id'))\n  .order_by('month')`,
          sql: `SELECT date_trunc('month', moved_at) AS month,\n       COUNT(id) AS count\nFROM stock_movements\nGROUP BY date_trunc('month', moved_at)\nORDER BY month;`,
          note: '「月で切る(annotate) → その月でまとめる(values+annotate)」が月別集計の型です。第7章の GROUP BY（values→annotate）と同じ流れで、まとめる単位を「月」にしているだけです。',
        },
      ],
    },
    {
      id: 'bulk-update',
      heading: '16-3. まとめて更新する ― bulk_update',
      body: [
        'たくさんの行を1件ずつ save() すると、その数だけ DB に問い合わせが飛んで遅くなります。「メモリ上で値を書きかえた複数オブジェクトを、1回でまとめて保存する」のが bulk_update です。',
        'なお「全部同じ値に揃える」だけなら、もっと簡単な QuerySet.update() で1文で済みます（第9章）。bulk_update は「行ごとに違う値を入れたい」ときに使います。',
      ],
      examples: [
        {
          orm: `items = list(OutboundOrderItem.objects.filter(outbound_order_id=1))\nfor item in items:\n    item.quantity_shipped = item.quantity_ordered   # 行ごとに違う値\n\n# 1回の問い合わせでまとめて保存（更新する列を指定する）\nOutboundOrderItem.objects.bulk_update(items, ['quantity_shipped'])`,
          sql: `-- 1件ずつ save() なら N 回の UPDATE が飛ぶところを、\n-- bulk_update は CASE 文を使った1〜数回の UPDATE にまとめる`,
          note: '第2引数で「更新する列」を必ず指定します。指定しない列は保存されません。新規作成をまとめるのは第9章の bulk_create です。',
        },
      ],
      callouts: [
        {
          kind: 'warn',
          text: 'bulk_update / bulk_create は速い代わりに save() を通らないので、save() に書いた独自処理や一部のシグナル（post_save）は走りません。「速さと引きかえに、いくつかの自動処理は省かれる」と覚えておきましょう。',
        },
      ],
    },
    {
      id: 'window',
      heading: '16-4. 順位をつける ― ウィンドウ関数（Window）',
      body: [
        '「ロケーションごとに、在庫数の多い順で順位を付けたい」――こうした“グループの中での順位”は、ウィンドウ関数 Window で出せます。集計（aggregate）と違い、行を1行にまとめずに、各行に順位などを付け足せるのが特長です。',
        'partition_by が「どの単位でグループ分けするか」、order_by が「その中で何順に並べて順位を振るか」です。',
      ],
      examples: [
        {
          orm: `from django.db.models import Window, F\nfrom django.db.models.functions import RowNumber\n\nStockBalance.objects.annotate(\n  rank=Window(\n    expression=RowNumber(),\n    partition_by=[F('location')],   # ロケーションごとに\n    order_by=F('quantity').desc(),  # 在庫数の多い順で\n  )\n)`,
          sql: `SELECT stock_balances.*,\n  ROW_NUMBER() OVER (\n    PARTITION BY location_id\n    ORDER BY quantity DESC\n  ) AS rank\nFROM stock_balances;`,
          note: 'これで各行に「自分のロケーションの中での順位」が付きます。RowNumber は同点でも1,2,3…と通し番号、Rank は同点を同順位にする、と使い分けます。「各グループの1位だけ」を出すフィルタの土台にもなります。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ウィンドウ関数は少し高度ですが、「集計したいけど、元の行も残したい」ときの切り札です。最初は「グループ内順位はこれで出せる」と覚えておけば十分です。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '16-5. この章のまとめ',
      body: [
        'Case/When は行ごとの「もし〜なら」。annotate で区分の列を生やしたり、order_by で独自の並び順を作れる。日付の集計は Trunc（切りそろえ）/ Extract（数字を抜く）で「月別・日別」をまとめる。',
        'bulk_update は「行ごとに違う値」をまとめて保存（全部同じ値なら update() が手軽）。Window は「グループの中での順位」を、元の行を残したまま付けられる。',
        '次の章では、こうしたクエリを「使い回せる形」にまとめる方法（カスタム Manager / QuerySet）とページングを扱います。',
      ],
    },
  ],
}

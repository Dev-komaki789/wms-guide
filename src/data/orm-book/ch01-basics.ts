import type { OrmChapter } from './types'

// 第1章「基礎」。ORM の考え方・Model.objects・QuerySet の遅延評価とキャッシュ。
export const ch01Basics: OrmChapter = {
  id: 'basics',
  num: 1,
  title: '基礎 ― ORM と QuerySet のしくみ',
  summary: 'ORM とは何か、Model.objects とは、そして QuerySet が「いつ」DB に問い合わせるか（遅延評価）を理解する。',
  intro: [
    'ORM（Object-Relational Mapping）は、SQL を直接書く代わりに Python のコードでデータベースを操作するしくみです。Django では、書いた ORM を Django が裏で SQL に翻訳して実行します。',
    'この章では、すべての ORM の土台になる3つのこと ―「Model.objects（窓口）」「QuerySet（クエリの設計図）」「遅延評価（いつ DB に行くか）」― を押さえます。ここが分かると、後の章の filter や集計が「設計図に条件を足していく操作」として読めるようになります。',
  ],
  sections: [
    {
      id: 'what-is-orm',
      heading: '1-1. ORM とは ― SQL を書かずに DB を扱う',
      body: [
        'たとえば「在庫が 0 の行を新しい順に取りたい」とき、SQL では SELECT ... FROM ... WHERE ... ORDER BY ... と文を組み立てます。ORM では、同じことを Python のメソッドを繋いで表現します。',
        'ORM の良いところは、(1) Python の文法のまま書けて読みやすい、(2) テーブルやカラムを「モデル（クラス）」として扱えるので補完や型チェックが効く、(3) DB の種類（PostgreSQL / SQLite など）が違っても同じコードで動く、という点です。',
      ],
      examples: [
        {
          orm: `StockBalance.objects\n  .filter(quantity=0)\n  .order_by('-updated_at')`,
          sql: `SELECT *\nFROM stock_balances\nWHERE quantity = 0\nORDER BY updated_at DESC;`,
          note: '同じ意味を、左は Python のメソッドチェーンで、右は SQL で表したもの。Django が左を右に翻訳して実行します。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ORM は万能ではありません。非常に複雑な集計などは生 SQL の方が素直なこともあります。まずは ORM で書き、必要なときだけ SQL に降りる、というのが実務の感覚です。',
        },
      ],
    },
    {
      id: 'model-objects',
      heading: '1-2. Model.objects ― テーブルの「窓口」',
      body: [
        'すべての ORM は Model.objects から始まります。これはそのモデル（＝テーブル）専用の「窓口」で、正式には Manager（マネージャ）と呼びます。',
        'たとえば PickingList モデルなら PickingList.objects が picking_lists テーブルの窓口です。この窓口に .all() や .filter(...) を頼むと、その結果（QuerySet）が返ってきます。',
      ],
      examples: [
        {
          orm: `PickingList.objects.all()`,
          sql: `SELECT * FROM picking_lists;`,
          note: '「PickingList 表の窓口（objects）に、全部ください（all）と頼む」と読みます。',
        },
        {
          orm: `PickingList.objects.filter(status='in_progress')`,
          sql: `SELECT *\nFROM picking_lists\nWHERE status = 'in_progress';`,
          note: '窓口に「作業中のものだけ」と条件をつけて頼む形。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'モデル名は単数・パスカルケース（PickingList）、テーブル名は複数・スネークケース（picking_lists）になることが多いです。どのモデルがどのテーブルかは「画面から探す」の使用テーブル一覧でも確認できます。',
        },
      ],
    },
    {
      id: 'queryset',
      heading: '1-3. QuerySet ― 「クエリの設計図」であって、データそのものではない',
      body: [
        '.all() や .filter() が返すのは QuerySet というオブジェクトです。ここが ORM 最大のポイントですが、QuerySet は「取得済みのデータ」ではなく「どんなクエリを実行するかの設計図」です。',
        'だから .filter() を書いただけでは、まだ DB には一切問い合わせていません。設計図を組み立てているだけです。実際に DB に SQL が飛ぶのは、その結果を「使おうとした瞬間」です（次の節）。',
      ],
      examples: [
        {
          orm: `# この3行ではまだ SQL は実行されない（設計図を組み立てているだけ）\nqs = PickingList.objects.filter(status='in_progress')\nqs = qs.filter(warehouse_id=1)\nqs = qs.order_by('-started_at')`,
          note: '条件を足すたびに「新しい設計図」が返るだけ。DB アクセスは 0 回。',
        },
      ],
    },
    {
      id: 'evaluation',
      heading: '1-4. いつ DB に問い合わせるのか（遅延評価）',
      body: [
        'QuerySet は「使おうとした瞬間」に初めて評価され、SQL が実行されます。これを遅延評価（lazy evaluation）と呼びます。代表的な「使おうとした瞬間」は次のとおりです。',
        '逆に言うと、これらをしない限り何度 .filter() を繋いでも DB には触りません。だから条件を動的に組み立ててから最後にまとめて実行、という書き方が安全にできます。',
      ],
      table: {
        headers: ['評価されるきっかけ', '例'],
        rows: [
          ['for で回す', 'for pl in qs:'],
          ['リスト化する', 'list(qs)'],
          ['len() で長さを得る', 'len(qs)'],
          ['bool 判定する', 'if qs:'],
          ['スライスで取り出す（一部）', 'qs[0] / qs[:5]'],
          ['1件取得・集計・存在確認', '.first() / .count() / .exists()'],
        ],
      },
      mermaid: `flowchart LR\n  A["filter() / order_by()<br/>を繋ぐ"] -->|まだ DB に行かない| B["QuerySet<br/>(設計図)"]\n  B -->|for / list() / len() / [:5]<br/>などで使った瞬間| C[("DB に SQL を実行")]\n  C --> D["結果が返る"]`,
      callouts: [
        {
          kind: 'warn',
          text: '「使おうとした瞬間に実行」を知らないと、ループの中でうっかり QuerySet を何度も評価して、DB に同じ問い合わせを連発してしまうことがあります（性能の落とし穴。第11章で詳しく扱います）。',
        },
      ],
    },
    {
      id: 'chaining',
      heading: '1-5. チェーンできる ― 元の QuerySet は変わらない',
      body: [
        '.filter() などは毎回「新しい QuerySet」を返します。元の QuerySet を書き換えるのではありません。そのため、共通のベースから枝分かれした複数のクエリを安全に作れます。',
      ],
      examples: [
        {
          orm: `base = PickingList.objects.filter(warehouse_id=1)\n\n# base はそのまま。別々の設計図ができる\nactive = base.filter(status='in_progress')\ndone   = base.filter(status='completed')`,
          note: 'active と done は base を共有しても互いに影響しません（base 自体も変わりません）。',
        },
      ],
    },
    {
      id: 'cache',
      heading: '1-6. QuerySet はキャッシュされる',
      body: [
        '一度評価された QuerySet は、その結果を内部にキャッシュします。同じ QuerySet を再び for で回しても、2回目は DB に問い合わせず、キャッシュした結果を使います。',
        'ただし「別の QuerySet」を作り直した場合（例: もう一度 .filter() から書いた場合）は、当然もう一度 SQL が実行されます。キャッシュは「同じ QuerySet オブジェクト」に対して効く、と覚えておきましょう。',
      ],
      examples: [
        {
          orm: `qs = PickingList.objects.filter(status='in_progress')\n\nlist(qs)   # ← ここで1回 SQL 実行\nlen(qs)    # ← キャッシュ利用。SQL は実行されない\nfor pl in qs:  # ← これもキャッシュ利用\n    ...`,
          note: '同じ qs を使い回すと DB アクセスは1回だけ。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: '「件数も知りたいし中身も回したい」なら、qs を list() で1回だけ評価して、その list を使い回すと無駄な問い合わせを避けられます。',
        },
      ],
    },
  ],
}

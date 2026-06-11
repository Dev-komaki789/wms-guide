import type { OrmChapter } from './types'

// 第18章「ORM の外側と性能の測りかた」。raw / cursor / explain / db_index / Meta.indexes / constraints / assertNumQueries。
export const ch18RawAndPerf: OrmChapter = {
  id: 'raw-and-perf',
  num: 18,
  title: 'ORM の外側と性能の測りかた ― 生 SQL・索引・計測',
  summary: '最終章です。ORM で書ききれないときの「生 SQL」、クエリの速さを「見える化」する explain と assertNumQueries、そして検索を速くする索引（インデックス）と、データを守る制約を扱います。',
  intro: [
    'ここまで ORM の書き方をたっぷり学びました。最後に、ORM の“外側”と“土台”に触れておきます。',
    '「ORM では無理な SQL を直接書く方法」「クエリの遅さや本数を計測する方法」「索引と制約で速さと正しさを支える方法」。これらを知ると、ORM をより安心して使えるようになります。',
  ],
  sections: [
    {
      id: 'raw',
      heading: '18-1. raw() ― モデルにひもづけて生 SQL を書く',
      body: [
        'ORM では表現しづらい複雑な SQL は、自分で書いて流すこともできます。Model.objects.raw() は、生 SQL を書きつつ、結果をモデルのオブジェクトとして受け取れる方法です。',
        '値は文字列に埋め込まず、params に渡します。これは SQL インジェクション（悪意ある入力で SQL を乗っ取られる攻撃）を防ぐための鉄則です。',
      ],
      examples: [
        {
          orm: `skus = Sku.objects.raw(\n  "SELECT * FROM skus WHERE jan_code = %s",\n  ['4901234567890'],\n)\nfor sku in skus:\n    print(sku.sku_code)   # モデルのオブジェクトとして使える`,
          note: '%s のところに params の値が安全に当てはめられます。「文字列を + でつなげて SQL を作る」のは絶対に避けます。raw() は SELECT 向けで、結果はそのモデルの行として返ります。',
        },
      ],
      callouts: [
        {
          kind: 'warn',
          text: 'まずは ORM で書けないか考えるのが基本です。第8章の Subquery/Exists や第16章の Case/Window で、生 SQL に逃げずに済むことは多いです。raw は「最後の手段」と位置づけましょう。',
        },
      ],
    },
    {
      id: 'cursor',
      heading: '18-2. connection.cursor() ― モデルを介さない生 SQL',
      body: [
        'モデルにひもづかない集計や、UPDATE / DELETE のような書き込みを生 SQL で行いたいときは、connection.cursor() を使います。結果はモデルではなく、ただのタプル（値の並び）で返ります。',
      ],
      examples: [
        {
          orm: `from django.db import connection\n\nwith connection.cursor() as cursor:\n    cursor.execute(\n        "SELECT location_id, SUM(quantity) FROM stock_balances "\n        "WHERE is_active = %s GROUP BY location_id",\n        [True],\n    )\n    rows = cursor.fetchall()   # [(1, 120), (2, 80), ...]`,
          note: 'ここでも値は %s ＋ 第2引数で渡します。fetchall() で全行、fetchone() で1行。モデルの機能（.save() など）は使えない、純粋な SQL の世界です。',
        },
      ],
    },
    {
      id: 'explain',
      heading: '18-3. explain() ― クエリの「実行計画」を見る',
      body: [
        '「このクエリ、なんだか遅い」を調べる第一歩が explain() です。DB が「このクエリをどう実行するつもりか（実行計画）」を教えてくれます。索引を使えているか、全件なめていないか、の手がかりになります。',
      ],
      examples: [
        {
          orm: `qs = StockBalance.objects.filter(location__warehouse_id=1)\nprint(qs.explain())\n# PostgreSQL なら、より詳しく：\nprint(qs.explain(analyze=True))`,
          note: '出力に Seq Scan（全件なめ）が出ていて遅いなら、索引（次節）を足すと Index Scan に変わって速くなることがあります。explain は「DB の気持ちを聞く」道具だと思ってください。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'まず「どのクエリが何本飛んでいるか」を知りたいときは、開発時に django-debug-toolbar を入れると画面上で本数と時間が見られて便利です（第6章の N+1 探しにも効きます）。',
        },
      ],
    },
    {
      id: 'indexes',
      heading: '18-4. 索引（インデックス）― 検索を速くする',
      body: [
        '索引（インデックス）は、本の巻末の索引と同じで「この値はどの行にあるか」を先に並べておく仕組みです。よく検索条件に使う列に索引があると、全件をなめずに目的の行へ一気に飛べます。',
        '単一の列なら db_index=True、複数列の組み合わせなら Meta.indexes で指定します。WMS でも jan_code や external_order_id など「検索で使う列」に索引を付けています。',
      ],
      examples: [
        {
          orm: `class Sku(models.Model):\n    jan_code = models.CharField(max_length=20, db_index=True)  # 1列の索引\n\nclass StockMovement(models.Model):\n    sku = models.ForeignKey(Sku, on_delete=models.PROTECT)\n    moved_at = models.DateTimeField()\n\n    class Meta:\n        indexes = [\n            models.Index(fields=['sku', 'moved_at']),  # 複数列の索引\n        ]`,
          note: 'ForeignKey には自動で索引が付きます。検索やソートに頻繁に使う列には索引を足すと速くなります。',
        },
      ],
      callouts: [
        {
          kind: 'warn',
          text: '索引はタダではありません。書き込み（INSERT/UPDATE）のたびに索引も更新されるので、付けすぎると書き込みが遅くなり、容量も食います。「よく検索する列に、必要なだけ」が原則です。',
        },
      ],
    },
    {
      id: 'constraints',
      heading: '18-5. 制約 ― データの正しさを DB に守らせる',
      body: [
        '「同じロケーション×SKU の在庫行は1つだけ」「数量はマイナス禁止」のようなルールは、アプリのコードだけでなく DB 側にも持たせると、抜け道なく守れます。これが制約（constraints）です。',
        'UniqueConstraint（重複禁止）と CheckConstraint（条件を満たすことを強制）が代表です。WMS も「在庫は location×sku で一意」を UniqueConstraint で守っています。',
      ],
      examples: [
        {
          orm: `class StockBalance(models.Model):\n    # ... location, sku, quantity ...\n    class Meta:\n        constraints = [\n            models.UniqueConstraint(\n                fields=['location', 'sku'],\n                name='uniq_location_sku',\n            ),\n            models.CheckConstraint(\n                check=models.Q(quantity__gte=0),\n                name='quantity_gte_0',\n            ),\n        ]`,
          note: 'UniqueConstraint は「この組み合わせは1つだけ」、CheckConstraint は「この条件を満たさない行は保存させない」。アプリ側のチェックをすり抜けても、DB が最後の砦になります。',
        },
      ],
    },
    {
      id: 'assert-num-queries',
      heading: '18-6. assertNumQueries ― クエリ本数をテストで見張る',
      body: [
        '第6章で学んだ N+1（ループ中に問い合わせが増殖する問題）は、コードを直した後うっかり再発しがちです。テストで「この処理は◯本で済むはず」と本数を固定しておくと、再発に気づけます。',
        'Django のテストには assertNumQueries があり、ブロック内で実際に飛んだ問い合わせ本数を検査できます。',
      ],
      examples: [
        {
          orm: `class PickingListViewTest(TestCase):\n    def test_query_count(self):\n        # select_related で N+1 を潰した状態を固定したい\n        with self.assertNumQueries(1):\n            lists = list(\n                PickingList.objects.select_related('warehouse', 'area')\n            )\n            for pl in lists:\n                _ = pl.warehouse.warehouse_name  # 追加の問い合わせが出ないはず`,
          note: 'もし誰かが select_related を消してしまうと、本数が増えてこのテストが落ちます。「速さを保証するテスト」を置ける、というのがポイントです。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: '本数を1本ぴったりに固定するのが難しい場合でも、「明らかに件数に比例して増えていないか」を見るだけで N+1 の再発はかなり防げます。',
        },
      ],
    },
    {
      id: 'closing',
      heading: '18-7. おわりに ― この本で学んだこと',
      body: [
        'お疲れさまでした。第1〜12章で「読み書きの基本と落とし穴」を、第13〜15章で「モデルとマイグレーション（テーブルの作り方）」を、第16〜18章で「表現力・再利用・性能と生 SQL」を学びました。',
        'ORM は「Python と SQL の通訳さん」。困ったら「これは SQL でいうと何か」を思い出すと、たいていの謎は解けます。生成される SQL を確かめたいときは、トップの「SQL 実行」ツールや explain() を使ってください。',
        'ここから先は、実際の画面のクエリ（第12章の総復習や「画面から探す」）を読み解きながら、手を動かして身につけていきましょう。',
      ],
    },
  ],
}

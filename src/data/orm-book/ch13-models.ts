import type { OrmChapter } from './types'

// 第13章「モデルを定義する」。プログラミング初心者向け。
// テーブルはモデルから生まれる → 主なフィールド型 → null/blank → choices → default/auto_now → __str__ → Meta。
export const ch13Models: OrmChapter = {
  id: 'models',
  num: 13,
  title: 'モデルを定義する ― フィールドと Meta',
  summary: 'ここまでは「すでにある表からどう取り出すか」を学んできました。この章では一歩もどって、「その表（テーブル）そのものを、どう作るか」を見ていきます。表の設計図にあたるのが「モデル」です。',
  intro: [
    '第1章から第12章までは、すでにあるテーブルからデータを取り出したり書き込んだりする方法を学びました。でも、そもそもその「テーブル」はどこから来たのでしょう？',
    'Django では、テーブルを SQL で手作りしません。Python で「モデル（model）」というクラスを書くと、Django がそれをもとにテーブルを作ってくれます。モデルは「テーブルの設計図」だと思ってください。',
    'この章では設計図の書き方を、WMS の実際のモデルを見ながら覚えます。',
  ],
  sections: [
    {
      id: 'what-is-model',
      heading: '13-1. モデルとは ― 1モデル＝1テーブル',
      body: [
        'モデルは models.Model を継承した Python のクラスです。1つのモデルが1つのテーブルに対応します。クラスの中に書いた変数（フィールド）が、そのテーブルのカラム（列）になります。',
        '下は WMS の「在庫の表」を表すモデルを、わかりやすく省略したものです。class StockBalance が「在庫テーブルの設計図」、その中の location や quantity が「カラム」です。',
      ],
      examples: [
        {
          orm: `from django.db import models\n\nclass StockBalance(models.Model):\n    location = models.ForeignKey('masters.Location', on_delete=models.PROTECT)\n    sku = models.ForeignKey('masters.Sku', on_delete=models.PROTECT)\n    quantity = models.IntegerField(default=0)\n    created_at = models.DateTimeField(auto_now_add=True)\n    updated_at = models.DateTimeField(auto_now=True)`,
          sql: `CREATE TABLE stock_balances (\n  id          BIGINT PRIMARY KEY,   -- 自動で付く\n  location_id BIGINT NOT NULL,       -- ForeignKey は末尾に _id が付く\n  sku_id      BIGINT NOT NULL,\n  quantity    INTEGER NOT NULL DEFAULT 0,\n  created_at  TIMESTAMP NOT NULL,\n  updated_at  TIMESTAMP NOT NULL\n);`,
          note: 'モデルのクラスから、Django が CREATE TABLE（テーブルを作る SQL）を組み立ててくれます。実際にこの SQL を流すのが次章の「マイグレーション」です。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：フィールド（field）＝モデルに書く1つの項目で、テーブルのカラムになるもの。「location という名前で、種類は ForeignKey」のように〈名前 = 種類(...)〉の形で書きます。',
        },
        {
          kind: 'tip',
          text: 'id（主キー）は書かなくても Django が自動で付けてくれます。だから 1件1件を見分ける番号は、自分で用意しなくて大丈夫です。',
        },
      ],
    },
    {
      id: 'field-types',
      heading: '13-2. よく使うフィールド型',
      body: [
        'フィールドの「種類（型）」が、そのカラムに入れられるデータの種類を決めます。よく使うものだけ表にまとめます。最初はこれだけ知っていれば十分です。',
      ],
      table: {
        headers: ['フィールド型', '入るもの', 'WMS での例'],
        rows: [
          ['CharField(max_length=…)', '短い文字列（最大文字数つき）', 'product_name（商品名）、status'],
          ['TextField', '長い文章（文字数制限なし）', 'note（備考）、description'],
          ['IntegerField', '整数', 'quantity（在庫数）'],
          ['DecimalField', '小数（金額など正確な数）', '単価・重量'],
          ['BooleanField', 'True / False（はい/いいえ）', 'is_active（有効か）'],
          ['DateTimeField', '日付＋時刻', 'created_at（作成日時）'],
          ['ForeignKey', '別の表への参照（つながり）', 'sku（どの SKU か）'],
        ],
      },
      callouts: [
        {
          kind: 'warn',
          text: '金額や数量で「ぴったりの計算」が必要なものに FloatField（浮動小数点）を使うと、0.1 + 0.2 がわずかにズレるような誤差が出ます。お金や厳密な小数は DecimalField を使いましょう。',
        },
      ],
    },
    {
      id: 'null-blank',
      heading: '13-3. null と blank ― 「空っぽ」の2つの意味',
      body: [
        'モデル定義でいちばん初心者が混乱するのが null と blank です。どちらも「空っぽを許すか」に見えますが、見ている場所がちがいます。',
        'null は「データベースのレベルで、値なし（NULL）を許すか」。blank は「フォーム入力のレベルで、未入力を許すか（バリデーション）」です。',
      ],
      table: {
        headers: ['設定', '意味', 'いつ使う'],
        rows: [
          ['null=True', 'DB に「値なし（NULL）」を保存してよい', '日時や金額など、本当に「未定」がありうる項目'],
          ['blank=True', '入力フォームで空のままでもエラーにしない', '任意入力の項目'],
          ['（両方なし）', '必ず値が要る（NOT NULL ＋ 入力必須）', '在庫数や商品名など必須項目'],
        ],
      },
      examples: [
        {
          orm: `# 出荷日時：まだ出荷していないうちは「値なし」がありうる → null も blank も True\nshipped_at = models.DateTimeField('出荷日時', null=True, blank=True)\n\n# 備考：DB には空文字 '' を入れたいので null は付けない。任意入力なので blank だけ True\nnote = models.TextField('備考', blank=True)`,
          note: 'WMS の実モデルもこの方針です。文字列（CharField/TextField）は「空文字 \'\'」で空を表すのが Django の作法なので、ふつう null=True は付けず blank=True だけにします。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: '迷ったら：文字列フィールドは blank=True だけ（null は付けない）。日付・数値・ForeignKey で「本当に空がありうる」ものだけ null=True も付ける、と覚えておくと事故が減ります。',
        },
      ],
    },
    {
      id: 'choices',
      heading: '13-4. choices ― 決まった選択肢から選ばせる',
      body: [
        'ステータス（作業中・完了・取消…）のように「とりうる値が決まっている」項目には choices を使います。決められた値以外が入るのを防げて、画面では選択肢としても使えます。',
        'Django では TextChoices という書き方が読みやすくておすすめです。「DB に入る値」と「画面に出すラベル」をセットで定義できます。',
      ],
      examples: [
        {
          orm: `class PickingList(models.Model):\n    class Status(models.TextChoices):\n        PENDING = 'pending', '未着手'\n        IN_PROGRESS = 'in_progress', '作業中'\n        COMPLETED = 'completed', '完了'\n\n    status = models.CharField(\n        max_length=20,\n        choices=Status.choices,\n        default=Status.PENDING,\n    )`,
          note: "'pending' などが DB に入る値、'未着手' などが画面に出す日本語ラベルです。コードの中では PickingList.Status.IN_PROGRESS のように名前で書けるので、'in_progress' とベタ打ちするより打ち間違いが減ります。",
        },
        {
          orm: `# 使うとき\nPickingList.objects.filter(status=PickingList.Status.IN_PROGRESS)\n\n# 画面用のラベルを取り出す\npl.get_status_display()   # → '作業中'`,
          note: 'get_〈フィールド名〉_display() という便利メソッドが自動で生え、ラベル（作業中など）を返してくれます。',
        },
      ],
    },
    {
      id: 'defaults',
      heading: '13-5. 初期値と自動の日時 ― default / auto_now',
      body: [
        '値を省いたときに入る初期値が default です。また、作成日時・更新日時は手で入れなくても Django に自動で入れてもらえます。',
      ],
      table: {
        headers: ['書き方', '意味'],
        rows: [
          ['default=0', '省略時は 0 を入れる'],
          ['default=Status.PENDING', '省略時はこのステータスにする'],
          ['auto_now_add=True', '作成された瞬間の日時を1回だけ入れる（created_at 向け）'],
          ['auto_now=True', '保存するたびに「今」の日時に更新する（updated_at 向け）'],
        ],
      },
      callouts: [
        {
          kind: 'note',
          text: 'auto_now_add は「生まれた時刻」、auto_now は「最後に触った時刻」と覚えると区別しやすいです。WMS でも created_at / updated_at はこの2つで自動管理しています。',
        },
      ],
    },
    {
      id: 'str-meta',
      heading: '13-6. __str__ と Meta ― 表示名とテーブルの設定',
      body: [
        '__str__（ストリング）メソッドは「この1件を文字で表すと？」を決めます。管理画面やデバッグで PickingList object (1) ではなく中身が見えるようにする、お約束です。',
        'class Meta は「テーブル全体の設定」を書く場所です。テーブル名・並び順のデフォルト・人間向けの名前などをまとめます。',
      ],
      examples: [
        {
          orm: `class Category(models.Model):\n    category_code = models.CharField('カテゴリコード', max_length=30, unique=True)\n    category_name = models.CharField('カテゴリ名', max_length=100)\n    sort_order = models.IntegerField('表示順', default=10)\n\n    class Meta:\n        db_table = 'categories'        # テーブル名を指定\n        ordering = ['sort_order', 'category_code']  # 既定の並び順\n        verbose_name = 'カテゴリ'      # 管理画面などでの呼び名\n\n    def __str__(self):\n        return self.category_name`,
          note: 'これは WMS の Category モデルとほぼ同じ形です。ordering を入れておくと、order_by を書かなくてもこの順で並びます。',
        },
      ],
      table: {
        headers: ['Meta の項目', '意味'],
        rows: [
          ['db_table', 'テーブルの名前（省略するとアプリ名_モデル名）'],
          ['ordering', 'order_by を書かないときの既定の並び順'],
          ['verbose_name', '管理画面などで表示する、人間向けの名前'],
          ['unique_together / constraints', '「この組み合わせは重複させない」などの制約（→第18章）'],
          ['indexes', '検索を速くする索引（→第18章）'],
        ],
      },
      callouts: [
        {
          kind: 'warn',
          text: 'Meta.ordering は便利ですが、全クエリに ORDER BY が付くので、件数の多い表では「並べる必要のない場面でも並べてしまう」性能の落とし穴になることがあります。重い表では付けない判断もあります。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '13-7. この章のまとめ',
      body: [
        'モデルは「テーブルの設計図」。models.Model を継承したクラスを書き、フィールド（＝カラム）を並べる。id（主キー）は自動で付く。',
        'null は DB レベルの「値なし」、blank はフォームの「未入力」。文字列はふつう blank だけ。choices は TextChoices で読みやすく。日時は auto_now_add / auto_now で自動化。__str__ と Meta で表示名やテーブル設定を整える。',
        '次の章では、モデルどうしを「つなぐ」リレーション（ForeignKey など）の貼り方をくわしく見ます。',
      ],
    },
  ],
}

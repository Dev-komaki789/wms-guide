import type { OrmChapter } from './types'

// 第17章「クエリを再利用する」。カスタム QuerySet / Manager / as_manager / Paginator。
export const ch17ReusePaging: OrmChapter = {
  id: 'reuse-paging',
  num: 17,
  title: 'クエリを再利用する ― カスタム Manager / QuerySet とページング',
  summary: '同じ絞り込みをあちこちに書くと、直すときに大変です。「よく使う絞り込みに名前を付けて、再利用できる」ようにするのがカスタム QuerySet / Manager。あわせて一覧画面の定番、ページング（Paginator）も学びます。',
  intro: [
    '実務で同じプロジェクトを育てていくと、「有効なものだけ」「作業中のものだけ」といった絞り込みを、いろんな画面で何度も書くことになります。コピペで散らばると、仕様が変わったとき直し漏れが起きます。',
    'この章では、その絞り込みに名前を付けて1か所にまとめ、Stock.objects.active() のように呼べるようにする方法を学びます。最後に一覧画面の必需品、ページングも扱います。',
  ],
  sections: [
    {
      id: 'why',
      heading: '17-1. なぜ「名前を付けて再利用」するのか',
      body: [
        'たとえば「有効な在庫」が「is_active=True かつ quantity__gt=0」だとします。これを10か所に直書きしていると、定義が「quantity__gte=0 も含む」に変わったとき、10か所すべてを直さねばなりません。',
        '絞り込みに active() という名前を付けて1か所に置けば、定義変更はそこ1行で済み、呼び出し側は active() のまま。読みやすさも上がります。',
      ],
      examples: [
        {
          orm: `# 散らばった書き方（変更に弱い）\nStockBalance.objects.filter(is_active=True, quantity__gt=0)   # 画面A\nStockBalance.objects.filter(is_active=True, quantity__gt=0)   # 画面B …\n\n# 名前を付けたい\nStockBalance.objects.active()                                # 画面A・B 共通`,
          note: '「意味のあるかたまり」に名前を付ける、という考え方です。次の節でその作り方を見ます。',
        },
      ],
    },
    {
      id: 'custom-queryset',
      heading: '17-2. カスタム QuerySet ― 絞り込みに名前を付ける',
      body: [
        'おすすめは「カスタム QuerySet」を作る方法です。models.QuerySet を継承したクラスに、絞り込みをメソッドとして定義します。メソッドが QuerySet を返すので、.active().in_warehouse(1) のようにチェーン（つなげ書き）できるのが利点です。',
        'そして objects = StockBalanceQuerySet.as_manager() と書くと、その QuerySet のメソッドを Model.objects から直接呼べるようになります。',
      ],
      examples: [
        {
          orm: `class StockBalanceQuerySet(models.QuerySet):\n    def active(self):\n        return self.filter(is_active=True, quantity__gt=0)\n\n    def in_warehouse(self, wid):\n        return self.filter(location__warehouse_id=wid)\n\nclass StockBalance(models.Model):\n    # ... フィールド ...\n    objects = StockBalanceQuerySet.as_manager()`,
          note: 'as_manager() が「この QuerySet のメソッドを objects から使えるようにする」橋渡しです。',
        },
        {
          orm: `# つなげて書ける（どちらも QuerySet を返すから）\nStockBalance.objects.active().in_warehouse(1).order_by('-quantity')`,
          sql: `SELECT * FROM stock_balances sb\nJOIN locations l ON l.id = sb.location_id\nWHERE sb.is_active = true AND sb.quantity > 0\n  AND l.warehouse_id = 1\nORDER BY sb.quantity DESC;`,
          note: 'active() と in_warehouse() を自由に組み合わせられます。第6章で学んだ location__warehouse_id（関連をまたぐ絞り込み）も、こうしてメソッドの中に隠せます。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'メソッドが必ず QuerySet を返すようにするのがコツ。そうすれば、ふつうの filter() や order_by() と同じ感覚でいくらでもつなげられます。',
        },
      ],
    },
    {
      id: 'manager',
      heading: '17-3. Manager と get_queryset ― objects の正体',
      body: [
        'そもそも Model.objects の objects は「マネージャ（Manager）」と呼ばれるもので、QuerySet を取り出す入口です。as_manager() は、このマネージャを自動で用意してくれていたわけです。',
        '「最初から特定の絞り込みを効かせた窓口」がほしいときは、get_queryset を上書きしたマネージャを作ります。たとえば「有効なものしか出さない窓口」を別に用意できます。',
      ],
      examples: [
        {
          orm: `class ActiveManager(models.Manager):\n    def get_queryset(self):\n        return super().get_queryset().filter(is_active=True)\n\nclass Product(models.Model):\n    # ... フィールド ...\n    objects = models.Manager()       # ふつうの窓口（全件）\n    active_objects = ActiveManager() # 有効なものだけの窓口`,
          note: 'Product.active_objects.all() は最初から is_active=True が効いています。「窓口そのものに既定の絞り込みを仕込む」イメージです。',
        },
      ],
      callouts: [
        {
          kind: 'warn',
          text: 'get_queryset で既定の絞り込みを入れると「全件が欲しいのに取れない」混乱のもとにもなります。標準の objects は素のまま残し、絞り込み済みは別名（active_objects など）にするのが安全です。',
        },
      ],
    },
    {
      id: 'paginator',
      heading: '17-4. ページング ― Paginator で「1ページ分」だけ出す',
      body: [
        '一覧画面で何千件もまとめて表示するのは、表示も DB も重すぎます。「1ページ20件ずつ」に区切るのがページング。Django には Paginator という道具があります。',
        '内部では QuerySet のスライス（第5章の qs[20:40] のような書き方）が使われ、その1ページ分だけを LIMIT / OFFSET で取りにいきます。全件は読み込みません。',
      ],
      examples: [
        {
          orm: `from django.core.paginator import Paginator\n\nqs = StockBalance.objects.active().order_by('-updated_at')\npaginator = Paginator(qs, 20)        # 1ページ20件\npage = paginator.get_page(2)         # 2ページ目\n\npage.object_list      # その20件\npage.has_next()       # 次ページがあるか\npaginator.num_pages   # 総ページ数`,
          sql: `-- 2ページ目を取りにいくときだけ、この SQL が走る\nSELECT * FROM stock_balances\nWHERE is_active = true AND quantity > 0\nORDER BY updated_at DESC\nLIMIT 20 OFFSET 20;`,
          note: 'get_page(2) を呼んだ瞬間に、その20件だけを取る SQL が走ります。ページングには order_by が必須です（順序が決まっていないと、どの20件かが安定しません）。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'get_page は範囲外のページ番号や数字でない値でも安全に扱ってくれます（似た page(n) は範囲外で例外）。画面のページ番号は何が来るか分からないので、get_page を使うのが無難です。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '17-5. この章のまとめ',
      body: [
        'よく使う絞り込みは、カスタム QuerySet にメソッドとして定義し、as_manager() で objects から呼べるようにする。QuerySet を返すので自由にチェーンできる。',
        '「窓口そのものに既定の絞り込み」を仕込みたいなら Manager の get_queryset を上書き（ただし別名にするのが安全）。一覧画面は Paginator で1ページ分だけ取り出す（order_by 必須・get_page が安全）。',
        '次が最終章。ORM では足りないときの生 SQL、性能の測りかた、索引（インデックス）と制約を扱います。',
      ],
    },
  ],
}

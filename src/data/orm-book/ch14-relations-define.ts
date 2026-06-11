import type { OrmChapter } from './types'

// 第14章「リレーションを貼る」。FK と _id / on_delete / related_name / 自己参照 / OneToOne / ManyToMany と through。
export const ch14RelationsDefine: OrmChapter = {
  id: 'relations-define',
  num: 14,
  title: 'リレーションを貼る ― ForeignKey / OneToOne / ManyToMany',
  summary: '第6章では「つながった表をたどる」方法を学びました。この章では、その“つながり”をモデル側でどう「貼る」のかを見ます。ForeignKey の貼り方、消えたときの動き（on_delete）、逆からたどるための related_name までをやさしく。',
  intro: [
    '倉庫システムのデータは、ばらばらの表ではなく、たがいに「つながって」います。「この在庫はどのロケーションか」「この明細はどの出荷指示のものか」――こうしたつながりが「リレーション（relation）」です。',
    '第6章では「__（アンダーバー2つ）でつながりをたどる」読み取り側を学びました。この章はその裏側、つまり「つながりをモデルにどう書くか」を扱います。',
  ],
  sections: [
    {
      id: 'foreignkey',
      heading: '14-1. ForeignKey ― 「どれに属するか」を1本の線で結ぶ',
      body: [
        'いちばん多いリレーションが ForeignKey（フォーリンキー＝外部キー）です。「多 → 1」のつながりを表します。たとえば「在庫はたくさんあるが、ひとつの在庫は1つのロケーションに属する」――これが ForeignKey です。',
        '大事なポイント：ForeignKey を書くと、DB のカラム名は末尾に _id が付きます。location と書けば、テーブルには location_id（つなぎ先の番号）が入ります。',
      ],
      examples: [
        {
          orm: `class StockBalance(models.Model):\n    location = models.ForeignKey(\n        Location,\n        on_delete=models.PROTECT,\n        verbose_name='ロケーション',\n    )\n    sku = models.ForeignKey(Sku, on_delete=models.PROTECT)`,
          sql: `CREATE TABLE stock_balances (\n  id          BIGINT PRIMARY KEY,\n  location_id BIGINT NOT NULL REFERENCES locations(id),\n  sku_id      BIGINT NOT NULL REFERENCES skus(id),\n  ...\n);`,
          note: 'モデルでは location（オブジェクト）として扱えますが、DB では location_id（番号）で保存されます。sb.location でロケーションそのもの、sb.location_id でその番号だけ、を取り出せます。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: '番号だけ欲しいときは sb.location_id を使いましょう。sb.location.id と書くと、ロケーション本体を DB から取りにいってしまう（よけいな問い合わせ）ことがあります。',
        },
      ],
    },
    {
      id: 'on-delete',
      heading: '14-2. on_delete ― つなぎ先が消えたらどうする？',
      body: [
        'ForeignKey には on_delete が必須です。これは「つなぎ先（親）が削除されたとき、こちら（子）をどうするか」のルールです。指定を忘れるとモデルが書けません。',
        'WMS では、消してはいけないマスタ（ロケーションや SKU）には PROTECT を、明細のように親と運命を共にするものには CASCADE を、任意の参照には SET_NULL を使い分けています。',
      ],
      table: {
        headers: ['on_delete', '親が消えたとき', 'WMS での使いどころ'],
        rows: [
          ['PROTECT', '子がいると削除を止める（エラー）', 'Location・Sku など。在庫が参照中のマスタを誤って消させない'],
          ['CASCADE', '子も一緒に削除する', 'OutboundOrderItem（明細）。出荷指示を消したら明細も消える'],
          ['SET_NULL', '子の参照を空(NULL)にする', 'Product.manufacturer。メーカーが消えても商品は残し、欄だけ空に'],
          ['SET_DEFAULT', '子の参照を既定値に戻す', '既定値が決まっているとき'],
          ['DO_NOTHING', '何もしない（自分で面倒を見る）', '上級者向け。基本は使わない'],
        ],
      },
      callouts: [
        {
          kind: 'warn',
          text: 'SET_NULL を使うフィールドは null=True も必要です（空を入れる先がないとエラー）。「マスタは PROTECT、明細は CASCADE」をまず基本形として覚えておくと安全です。',
        },
      ],
    },
    {
      id: 'related-name',
      heading: '14-3. related_name ― 逆からたどる名前をつける',
      body: [
        'ForeignKey は「子 → 親」の向きで書きますが、実は「親 → 子（の一覧）」も自動でたどれます。この逆向きの入口の名前を決めるのが related_name です。',
        'たとえば OutboundOrderItem が outbound_order を ForeignKey で持ち、related_name=\'items\' と付けると、逆に「出荷指示 → その明細たち」を order.items で取り出せます。',
      ],
      examples: [
        {
          orm: `class OutboundOrderItem(models.Model):\n    outbound_order = models.ForeignKey(\n        OutboundOrder,\n        on_delete=models.CASCADE,\n        related_name='items',   # ← 逆からの入口の名前\n    )\n    sku = models.ForeignKey(Sku, on_delete=models.PROTECT)\n    quantity_ordered = models.IntegerField()`,
          note: 'これで親→子がスッキリ書けます。',
        },
        {
          orm: `order = OutboundOrder.objects.get(pk=1)\n\n# related_name のおかげで、その出荷指示の明細たちを取れる\nfor item in order.items.all():\n    print(item.sku_id, item.quantity_ordered)`,
          sql: `SELECT * FROM outbound_order_items\nWHERE outbound_order_id = 1;`,
          note: 'related_name を付けないと逆の入口は 〈モデル名小文字〉_set（例：order.outboundorderitem_set）という長い名前になります。items のように付けたほうがずっと読みやすいですね。',
        },
      ],
    },
    {
      id: 'self-fk',
      heading: '14-4. 自分自身への ForeignKey ― 階層（親カテゴリ）を表す',
      body: [
        'ForeignKey は同じモデルへも貼れます。これで「カテゴリの中にサブカテゴリ」のような階層（ツリー）を表せます。つなぎ先に \'self\' を指定します。',
      ],
      examples: [
        {
          orm: `class Category(models.Model):\n    category_name = models.CharField(max_length=100)\n    parent = models.ForeignKey(\n        'self',\n        on_delete=models.PROTECT,\n        null=True, blank=True,        # 一番上の親は parent なし\n        related_name='children',      # 逆からは「子カテゴリたち」\n    )`,
          note: 'これは WMS の Category そのものです。cat.parent で親、cat.children.all() で子カテゴリ一覧をたどれます。「一番上」は parent が空(null)になるので null=True が要ります。',
        },
      ],
    },
    {
      id: 'one-to-one',
      heading: '14-5. OneToOneField ― 1対1のつながり',
      body: [
        'OneToOneField は「1対1」のつながりです。ForeignKey に「重複なし（unique）」が付いたもの、と考えると分かりやすいです。',
        'よくある例は「ユーザー1人につき、プロフィール1つ」。本体のモデルを太らせず、付加情報を別テーブルに分けたいときに使います。',
      ],
      examples: [
        {
          orm: `class WorkerProfile(models.Model):\n    user = models.OneToOneField(\n        User,\n        on_delete=models.CASCADE,\n    )\n    default_warehouse = models.ForeignKey(Warehouse, on_delete=models.PROTECT)\n    barcode_prefix = models.CharField(max_length=10, blank=True)`,
          note: 'user は1人につき1つだけ。profile.user で本体、逆に user.workerprofile でプロフィールへ、どちらも「1件」で行き来できます。',
        },
      ],
    },
    {
      id: 'many-to-many',
      heading: '14-6. ManyToMany ― 「多対多」と中間テーブル',
      body: [
        '「多対多（ManyToMany）」は、両側がたくさんつながる関係です。たとえば「1つのピッキングリストに複数の作業者、1人の作業者は複数のリストを担当」。このときは ManyToManyField を使います。',
        '裏では「中間テーブル（つなぎ専用の表）」が自動で作られ、そこに「どのリストとどの作業者の組」が1行ずつ入ります。',
      ],
      examples: [
        {
          orm: `class PickingList(models.Model):\n    picking_list_code = models.CharField(max_length=30)\n    workers = models.ManyToManyField(User, related_name='picking_lists')`,
          note: 'pl.workers.add(user) で割り当て、pl.workers.all() で担当者一覧、user.picking_lists.all() で逆もたどれます。中間テーブルは Django が自動で用意します。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：「中間テーブル」は2つの表を結ぶ専用の小さな表。ManyToManyField を書くと自動で作られ、(picking_list_id, user_id) の組が1行ずつ入ります。',
        },
      ],
    },
    {
      id: 'through',
      heading: '14-7. through ― 中間テーブルに「項目」を持たせたいとき',
      body: [
        '「いつ割り当てたか」「担当数量はいくつか」など、つながりそのものに項目を持たせたいことがあります。素の ManyToManyField では持てません。そこで through（スルー）で「中間モデルを自分で書く」方法を使います。',
        '実は WMS は、この「項目を持った多対多」を ManyToMany ではなく、ふつうの中間モデル＋2本の ForeignKey で表しています。OutboundOrderItem がまさにそれで、「出荷指示」と「SKU」を結びつつ、指示数・実出荷数などの項目を持っています。',
      ],
      examples: [
        {
          orm: `# 中間モデルを自分で定義し、項目（数量や日時）を持たせる\nclass OutboundOrderItem(models.Model):\n    outbound_order = models.ForeignKey(OutboundOrder, on_delete=models.CASCADE, related_name='items')\n    sku = models.ForeignKey(Sku, on_delete=models.PROTECT)\n    quantity_ordered = models.IntegerField()   # ← つながりが持つ「項目」\n    quantity_shipped = models.IntegerField(default=0)`,
          note: 'これは WMS の実モデルです。「出荷指示 ↔ SKU」という多対多に「指示数・実出荷数」という項目が付いている、と読めます。項目つきの多対多は、迷ったらこの「明細モデル」方式が分かりやすくておすすめです。',
        },
      ],
      mermaid: `flowchart LR\n  O["OutboundOrder<br/>出荷指示"] --> I["OutboundOrderItem<br/>明細（数量を持つ）"]\n  S["Sku<br/>SKU"] --> I`,
      callouts: [
        {
          kind: 'tip',
          text: '「ただ結ぶだけ」なら ManyToManyField、「結びに項目を持たせたい」なら明細モデル（中間モデル）＋ForeignKey 2本。この使い分けを押さえれば、多対多はこわくありません。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '14-8. この章のまとめ',
      body: [
        'ForeignKey は「多→1」。DB では _id カラムになる。on_delete で親が消えたときの動き（PROTECT/CASCADE/SET_NULL…）を必ず決める。related_name で逆からたどる入口に良い名前を付ける。',
        '同じモデルへの ForeignKey で階層を、OneToOneField で1対1を表す。多対多は ManyToManyField、項目を持たせたいなら中間モデル（明細）＋ForeignKey 2本。',
        '次の章では、こうして書いたモデルを実際の DB に反映する「マイグレーション」を見ます。',
      ],
    },
  ],
}

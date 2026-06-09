import type { OrmChapter } from './types'

// 第1章「基礎」。プログラミング初心者向け。
// データベースの超基本 → ORM とは → Model.objects → QuerySet の遅延評価・チェーン・キャッシュ。
export const ch01Basics: OrmChapter = {
  id: 'basics',
  num: 1,
  title: '基礎 ― ORM と QuerySet のしくみ',
  summary: 'データベースの超基本からスタートして、ORM とは何か、そして「書いた ORM がいつ DB に問い合わせるのか」までを、はじめての人向けにやさしく説明します。',
  intro: [
    'この本は「Django の ORM（オーアールエム）の書き方」を、はじめての人にも分かるようにまとめたものです。むずかしい言葉は出てくるたびにかみくだいて説明するので、SQL（エスキューエル）をまだよく知らなくても大丈夫です。',
    'まずこの章で、すべての土台になる考え方をつかみましょう。あせらず、上から順に読んでいけば大丈夫です。',
  ],
  sections: [
    {
      id: 'warmup',
      heading: '1-1. 準備運動 ― そもそもデータベースって？',
      body: [
        'データベース（DB）は、ざっくり言うと「きちんと整理された Excel の表の集まり」です。倉庫システム（WMS）なら、「在庫の表」「ピッキングリストの表」「商品の表」…というように、用途ごとに表が分かれています。',
        'ひとつの表を、もう少しだけ正確な言葉にすると次のようになります。これだけ覚えれば、この本はぜんぶ読めます。',
      ],
      table: {
        headers: ['ふだんの言い方', '専門用語', '意味'],
        rows: [
          ['表', 'テーブル（table）', '1種類のデータの集まり（例: 在庫の表）'],
          ['横1列ぶんのデータ', '行 / レコード（row）', '1件ぶんのデータ（例: ある棚のある商品の在庫1件）'],
          ['縦の項目', 'カラム / 列（column）', '項目名（例: 在庫数、SKU、更新日時）'],
          ['表を操作する命令', 'SQL', 'DB に「これ取って」「これ更新して」とお願いする専用の言葉'],
        ],
      },
      callouts: [
        {
          kind: 'note',
          text: 'ことば：SQL（エスキューエル）は DB 専用の命令文です。たとえば「在庫の表から全部ちょうだい」は SQL で SELECT * FROM stock_balances; と書きます。SELECT は「取ってくる」という意味の命令です。',
        },
      ],
    },
    {
      id: 'what-is-orm',
      heading: '1-2. ORM とは ― SQL を書かずに DB を扱う道具',
      body: [
        'ふつう、DB に「これ取って」とお願いするには SQL を書きます。でも、プログラム（Python）の中で毎回 SQL の文章を組み立てるのは、けっこう面倒です。',
        'そこで登場するのが ORM です。ORM を使うと、SQL を直接書かずに、Python のいつもの書き方で DB を操作できます。書いた ORM は Django が裏でこっそり SQL に翻訳して実行してくれます。つまり ORM は「Python と SQL のあいだの通訳さん」です。',
        '下の例を見てください。左（ORM）と右（SQL）はまったく同じ意味です。ORM のほうが Python らしく読めますね。',
      ],
      examples: [
        {
          orm: `StockBalance.objects\n  .filter(quantity=0)\n  .order_by('-updated_at')`,
          sql: `SELECT *\nFROM stock_balances\nWHERE quantity = 0\nORDER BY updated_at DESC;`,
          note: '意味はどちらも「在庫数が 0 の行を、更新日時の新しい順に取ってくる」。filter が WHERE（絞り込み）に、order_by が ORDER BY（並べ替え）に翻訳されています。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：WHERE（ウェア）は「〜という条件のものだけ」と絞り込む命令、ORDER BY（オーダーバイ）は「〜の順に並べる」命令です。先頭に「-」が付くと「大きい順／新しい順（降順）」になります。',
        },
      ],
    },
    {
      id: 'model-objects',
      heading: '1-3. Model.objects ― テーブルの「受付窓口」',
      body: [
        'ORM はかならず Model.objects（モデル・オブジェクツ）から書きはじめます。これは、そのテーブル専用の「受付窓口」だと思ってください。',
        'たとえば PickingList というモデル（＝ピッキングリストの表）なら、PickingList.objects がその表の窓口です。窓口に「.all()（全部ください）」や「.filter(...)（条件つきでください）」とお願いすると、結果が返ってきます。',
      ],
      examples: [
        {
          orm: `PickingList.objects.all()`,
          sql: `SELECT * FROM picking_lists;`,
          note: '「PickingList の窓口（objects）に、全部ください（all）とお願いする」と読みます。',
        },
        {
          orm: `PickingList.objects.filter(status='in_progress')`,
          sql: `SELECT *\nFROM picking_lists\nWHERE status = 'in_progress';`,
          note: '「作業中（status が in_progress）のものだけください」とお願いする形。filter のカッコの中が条件です。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'モデルの名前は単数で大文字はじまり（PickingList）、テーブルの名前は複数で小文字＋アンダーバー（picking_lists）になることが多いです。どのモデルがどのテーブルかは、トップの「画面から探す」の使用テーブル一覧でも見られます。',
        },
      ],
    },
    {
      id: 'queryset',
      heading: '1-4. QuerySet ― 「取ってきたデータ」ではなく「注文票」',
      body: [
        '.all() や .filter() が返してくるものを QuerySet（クエリセット）と呼びます。ここが最初のつまずきポイントなのですが、QuerySet は「すでに取ってきたデータ」ではありません。',
        'QuerySet は「どんなデータが欲しいかを書いた注文票（＝まだ厨房に出していない注文）」のようなものです。だから .filter() を書いた時点では、DB にはまだ一度も問い合わせていません。注文票を書き足しているだけなのです。',
        'では実際に DB に問い合わせ（注文を厨房に出す）のはいつか？ それは「中身を使おうとした瞬間」です。次の節で見ていきましょう。',
      ],
      examples: [
        {
          orm: `# この3行では、DB にはまだ1回も問い合わせていない（注文票を書いているだけ）\nqs = PickingList.objects.filter(status='in_progress')\nqs = qs.filter(warehouse_id=1)\nqs = qs.order_by('-started_at')`,
          note: '条件を足すたびに新しい注文票ができるだけ。DB アクセスはここまで 0 回です。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：QuerySet（クエリセット）の「クエリ（query）」は「問い合わせ」という意味です。つまり「DB への問い合わせ内容のまとまり」が QuerySet です。',
        },
      ],
    },
    {
      id: 'evaluation',
      heading: '1-5. いつ DB に問い合わせるの？（遅延評価）',
      body: [
        'QuerySet は「中身を使おうとした瞬間」に初めて DB に問い合わせます。このしくみを遅延評価（ちえんひょうか＝必要になるまで実行を後回しにすること）と呼びます。',
        '「中身を使おうとした瞬間」の代表は、次のようなときです。逆に言うと、これらをしないかぎり、何回 .filter() をつなげても DB には触りません。',
      ],
      table: {
        headers: ['DB に問い合わせるきっかけ', '書き方の例', 'やっていること'],
        rows: [
          ['for で1件ずつ回す', 'for pl in qs:', '中身を順番に取り出す'],
          ['リストにする', 'list(qs)', '全部まとめて取り出す'],
          ['件数を数える', 'len(qs)', '何件あるか知る'],
          ['あるか確認する', 'if qs:', '1件でもあるか調べる'],
          ['一部だけ取り出す', 'qs[0] / qs[:5]', '先頭や先頭5件を取り出す'],
        ],
      },
      mermaid: `flowchart LR\n  A["filter や order_by を<br/>つなぐ（まだ DB に行かない）"] --> B["QuerySet<br/>（注文票）"]\n  B --> C["中身を使った瞬間に<br/>DB へ問い合わせ"]\n  C --> D["結果が返ってくる"]`,
      callouts: [
        {
          kind: 'warn',
          text: 'この「使った瞬間に実行される」を知らないと、ループの中でうっかり同じ QuerySet を何度も評価して、DB に同じ問い合わせを連発してしまうことがあります（性能の落とし穴。第11章でくわしく扱います）。',
        },
      ],
    },
    {
      id: 'chaining',
      heading: '1-6. つなげて書ける ― 元の QuerySet は変わらない',
      body: [
        '.filter() などは、呼ぶたびに「新しい注文票」を返します。元の注文票を書きかえるわけではありません。だから、共通のベースから枝分かれした複数の注文を、安心して作れます。',
      ],
      examples: [
        {
          orm: `base = PickingList.objects.filter(warehouse_id=1)\n\n# base はそのまま。別々の注文票ができる\nactive = base.filter(status='in_progress')   # 作業中だけ\ndone   = base.filter(status='completed')     # 完了だけ`,
          note: 'active と done は base をもとにしても、おたがいに影響しません。base 自身も変わりません。',
        },
      ],
    },
    {
      id: 'cache',
      heading: '1-7. 一度取ってきたら覚えておく（キャッシュ）',
      body: [
        '一度 DB に問い合わせた QuerySet は、その結果を中に覚えておきます（これをキャッシュと呼びます）。同じ QuerySet をもう一度 for で回しても、2回目は DB に行かず、覚えておいた結果を使います。',
        'ただし「新しく作り直した QuerySet」（もう一度 .filter() から書いた場合など）は、別物なのでまた問い合わせが起きます。キャッシュは「同じ QuerySet を使い回したとき」に効く、と覚えておきましょう。',
      ],
      examples: [
        {
          orm: `qs = PickingList.objects.filter(status='in_progress')\n\nlist(qs)        # ← ここで1回だけ DB に問い合わせ\nlen(qs)         # ← 覚えていた結果を使う（問い合わせなし）\nfor pl in qs:   # ← これも覚えていた結果を使う\n    ...`,
          note: '同じ qs を使い回すと、DB へのアクセスは1回だけで済みます。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: '「件数も知りたいし中身も回したい」というときは、qs を一度 list() でまとめて取り出し、その list を使い回すと、ムダな問い合わせを減らせます。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '1-8. この章のまとめ',
      body: [
        'ORM は「Python と SQL のあいだの通訳さん」。Model.objects（窓口）から書きはじめ、.filter() などをつなげて「注文票（QuerySet）」を作る。',
        '注文票は、中身を使おうとした瞬間（for / list / len / スライドなど）に初めて DB に問い合わせる（遅延評価）。一度取ってきたら覚えておく（キャッシュ）。',
        '次の章では、その「取り出し方」のバリエーション（全部・1件だけ・件数だけ・あるか確認だけ）を見ていきます。',
      ],
    },
  ],
}

import type { OrmChapter } from './types'

// 第2章「取り出す」。all / get / first / last / exists / count の違いと使い分け。
export const ch02Fetching: OrmChapter = {
  id: 'fetching',
  num: 2,
  title: '取り出す ― all / get / first / exists / count',
  summary: 'DB からデータを取り出す基本の道具を一つずつ。「全部ほしい」「ぴったり1件ほしい」「件数だけ知りたい」「あるかだけ知りたい」を、それぞれ正しい道具で書けるようになります。',
  intro: [
    'データを取り出すといっても、ほしいものはいつも同じではありません。「全部ほしい」こともあれば、「1件だけ」「件数だけ」「あるかどうかだけ」のこともあります。',
    'Django にはそれぞれにピッタリの道具が用意されています。まちがった道具を使うとエラーになったり、ムダに重くなったりするので、ここで使い分けを覚えましょう。',
  ],
  sections: [
    {
      id: 'all',
      heading: '2-1. all() ― 全部ほしいとき',
      body: [
        'all() は「その表の行を全部ください」というお願いです。結果は QuerySet（注文票）で返ってきます。第1章のとおり、実際に DB に問い合わせるのは中身を使った瞬間です。',
      ],
      examples: [
        {
          orm: `PickingList.objects.all()`,
          sql: `SELECT * FROM picking_lists;`,
          note: 'まずは全部。ここから .filter() で絞ったり .order_by() で並べたりしていきます。',
        },
      ],
      callouts: [
        {
          kind: 'warn',
          text: '行数がとても多い表に all() をして、それを全部メモリに読み込むと重くなります。実務では、たいてい後ろに .filter() を付けて必要な行だけに絞ります。',
        },
      ],
    },
    {
      id: 'get',
      heading: '2-2. get() ― ぴったり1件だけほしいとき',
      body: [
        'get() は「条件に合う行を、ちょうど1件だけください」というお願いです。主キー（id）やコードなど、1件に決まるはずの条件で使います。',
        '注意点があります。get() は「ちょうど1件」が前提なので、見つからないときや、2件以上あったときはエラー（例外）になります。',
      ],
      examples: [
        {
          orm: `PickingList.objects.get(id=42)`,
          sql: `SELECT *\nFROM picking_lists\nWHERE id = 42;`,
          note: 'id は1件に決まるので get がぴったり。返ってくるのは QuerySet ではなく「1件のオブジェクト」です。',
        },
      ],
      callouts: [
        {
          kind: 'warn',
          text: 'get() は、0件だと DoesNotExist、2件以上だと MultipleObjectsReturned というエラーになります。「絶対に1件」と言い切れる条件のときだけ使いましょう。',
        },
        {
          kind: 'tip',
          text: 'Web 画面で「URL の id の行を表示、無ければ404」をしたいときは、Django の get_object_or_404(PickingList, id=42) が便利です（内部で get を使い、無ければ404を返します）。',
        },
      ],
    },
    {
      id: 'first-last',
      heading: '2-3. first() / last() ― 先頭・末尾の1件（無ければ None）',
      body: [
        'first() は「条件に合うもののうち先頭の1件」、last() は「末尾の1件」をくれます。get() とちがって、見つからなくてもエラーにならず、None（＝何もない、を表す値）が返ります。だから「あるかもしれないし、無いかもしれない」場面で安心して使えます。',
        '「先頭ってどれ？」を決めるために、ふつうは .order_by() で並び順を指定してから first() を使います。',
      ],
      examples: [
        {
          orm: `PickingList.objects\n  .filter(status='in_progress')\n  .order_by('started_at')\n  .first()`,
          sql: `SELECT *\nFROM picking_lists\nWHERE status = 'in_progress'\nORDER BY started_at\nLIMIT 1;`,
          note: '「作業中のうち、いちばん早く始まったもの1件」。LIMIT 1（＝1件だけ）に翻訳されます。無ければ None。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：LIMIT（リミット）は「最大◯件まで」という意味の SQL です。LIMIT 1 なら1件だけ取ってきます。',
        },
      ],
    },
    {
      id: 'count',
      heading: '2-4. count() ― 件数だけ知りたいとき',
      body: [
        'count() は「何件あるか」という数字だけをくれます。中身（行そのもの）は取ってきません。DB 側で数えてくれるので、全部取り出してから数えるより、ずっと速くてムダがありません。',
      ],
      examples: [
        {
          orm: `PickingList.objects\n  .filter(status='in_progress')\n  .count()`,
          sql: `SELECT COUNT(*)\nFROM picking_lists\nWHERE status = 'in_progress';`,
          note: '「作業中は何件？」という数字だけが返ります。',
        },
      ],
      callouts: [
        {
          kind: 'warn',
          text: 'Python の len(qs) でも件数は分かりますが、それは「全部の行を取り出してから数える」ので重くなりがちです。件数だけ知りたいなら count() を使いましょう（第11章でくわしく）。',
        },
      ],
    },
    {
      id: 'exists',
      heading: '2-5. exists() ― あるか・ないかだけ知りたいとき',
      body: [
        'exists() は「条件に合う行が1件でもあるか？」を True / False（ある・ない）で教えてくれます。中身も件数も要らず、ただ「あるかないか」だけを知りたいときに最適です。',
        'これも DB 側で「1件見つかった時点で打ち切り」してくれるので、count() より軽いことが多いです。',
      ],
      examples: [
        {
          orm: `PickingList.objects\n  .filter(status='in_progress')\n  .exists()`,
          sql: `SELECT 1\nFROM picking_lists\nWHERE status = 'in_progress'\nLIMIT 1;`,
          note: '「作業中のリスト、ある？」→ True か False。1件見つかれば十分なので LIMIT 1 で打ち切ります。',
        },
      ],
    },
    {
      id: 'cheatsheet',
      heading: '2-6. 使い分け早見表',
      body: ['ほしいものに合わせて道具を選びましょう。迷ったらこの表に戻ってきてください。'],
      table: {
        headers: ['やりたいこと', '使う道具', '返ってくるもの', '見つからないとき'],
        rows: [
          ['全部ほしい', '.all() / .filter()', 'QuerySet（行の集まり）', '空っぽの QuerySet'],
          ['ぴったり1件', '.get(...)', '1件のオブジェクト', 'エラー（例外）'],
          ['先頭/末尾の1件', '.first() / .last()', '1件のオブジェクト', 'None'],
          ['件数だけ', '.count()', '数字', '0'],
          ['あるか・ないか', '.exists()', 'True / False', 'False'],
        ],
      },
      callouts: [
        {
          kind: 'tip',
          text: 'よくある迷いどころ：「1件あればそれを使いたい、無ければ何もしない」なら get() ではなく first() が安全（エラーにならず None が返る）。「あるかどうかで分岐したいだけ」なら exists() が軽くてベストです。',
        },
      ],
    },
  ],
}

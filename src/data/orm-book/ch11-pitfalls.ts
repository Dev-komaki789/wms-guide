import type { OrmChapter } from './types'

// 第11章「落とし穴と性能」。count vs len / exists vs count / 余計な評価 / only・values の使い分け。
export const ch11Pitfalls: OrmChapter = {
  id: 'pitfalls',
  num: 11,
  title: '落とし穴と性能 ― やりがちなムダをなくす',
  summary: 'これまでの知識を「速く・ムダなく」使うためのコツ集です。動くけれど遅い、を卒業しましょう。初心者がはまりがちな定番だけを集めました。',
  intro: [
    'ORM は「動くコード」を書くのは簡単ですが、知らずに書くとムダに重くなることがあります。この章は、その“あるある”を避けるための実践集です。',
    '一つひとつは小さな違いですが、データが増えると効いてきます。',
  ],
  sections: [
    {
      id: 'count-vs-len',
      heading: '11-1. 件数を知りたいだけなら count()（len は使わない）',
      body: [
        'len(qs) は「全部の行を取り出してから Python で数える」ので、行が多いほど重くなります。件数だけ欲しいなら count() を使えば、DB が数えた数字だけが返ってきて軽いです。',
      ],
      examples: [
        {
          orm: `# 重い：全部取り出してから数える\nlen(PickingList.objects.all())\n\n# 軽い：DB に数えてもらう\nPickingList.objects.count()`,
          note: 'ただし「中身も使うし件数も知りたい」なら、一度 list() にして使い回す方が良いこともあります（第1章のキャッシュ参照）。',
        },
      ],
    },
    {
      id: 'exists-vs-count',
      heading: '11-2. 「あるか」を知りたいだけなら exists()（count は使わない）',
      body: [
        '「1件でもあるか？」を知りたいだけなのに count() > 0 と書くと、全部数えてしまいます。exists() なら1件見つかった時点で打ち切るので軽いです。',
      ],
      examples: [
        {
          orm: `# 重い：全部数えてから0と比べる\nif PickingList.objects.filter(status='pending').count() > 0:\n    ...\n\n# 軽い：1件見つかれば即終了\nif PickingList.objects.filter(status='pending').exists():\n    ...`,
          note: '「あるか・ないか」の分岐は exists() が正解です。',
        },
      ],
    },
    {
      id: 'n-plus-1-again',
      heading: '11-3. 一覧で関連を出すなら必ず先読み（N+1 を防ぐ）',
      body: [
        '第6章の N+1 はもっとも多い落とし穴なので、もう一度。一覧表示で関連項目（商品名など）を出すときは、select_related / prefetch_related で先読みするのを忘れないでください。',
      ],
      examples: [
        {
          orm: `# 悪い：行ごとに追加の問い合わせ（N+1）\nfor sb in StockBalance.objects.all():\n    print(sb.sku.product.product_name)\n\n# 良い：先読みして1回にまとめる\nfor sb in StockBalance.objects.select_related('sku__product'):\n    print(sb.sku.product.product_name)`,
          note: '「ループの中でドット（.）をたどって関連にアクセスしている」と気づいたら、N+1 を疑うクセをつけましょう。',
        },
      ],
    },
    {
      id: 'values-when-light',
      heading: '11-4. 表示や集計だけなら values で軽く',
      body: [
        '行をオブジェクトとして使わず、ただ表示したり集計したりするだけなら、values() / values_list() で必要な列だけ取ると軽くなります。重い列まで毎回取る必要はありません。',
      ],
      examples: [
        {
          orm: `# 必要な列だけ・辞書で軽く取る\nSku.objects.values('id', 'sku_code')`,
          note: 'モデルとして操作したいなら only/defer、ただのデータでよいなら values、と使い分けます（第5章参照）。',
        },
      ],
    },
    {
      id: 'reuse-queryset',
      heading: '11-5. 同じ問い合わせを2度走らせない',
      body: [
        'QuerySet を別の場所で書き直すと、その都度 DB に問い合わせが走ります。同じ結果を何度も使うなら、一度 list() で取り出して使い回しましょう（第1章のキャッシュは「同じ QuerySet を使い回したとき」だけ効くのでした）。',
      ],
      examples: [
        {
          orm: `# 悪い：似た問い合わせを2回書いている\ntotal = PickingList.objects.filter(status='pending').count()\nfor pl in PickingList.objects.filter(status='pending'):\n    ...\n\n# 良い：1回取り出して使い回す\npending = list(PickingList.objects.filter(status='pending'))\ntotal = len(pending)\nfor pl in pending:\n    ...`,
          note: '同じ条件を2回書くと問い合わせも2回。使い回せるなら list() で1回にまとめます。',
        },
      ],
    },
    {
      id: 'checklist',
      heading: '11-6. 見直しチェックリスト',
      body: ['コードを書いたら、この6つを軽く見直すクセをつけると、自然と速いコードになります。'],
      table: {
        headers: ['チェック', 'やること'],
        rows: [
          ['件数だけ欲しい？', 'len ではなく count()'],
          ['あるか知りたいだけ？', 'count>0 ではなく exists()'],
          ['ループ内で関連にアクセス？', 'select_related / prefetch_related'],
          ['表示・集計だけ？', 'values / values_list で軽く'],
          ['同じ問い合わせを何度も？', '一度 list() にして使い回す'],
          ['更新は1件？大量？', '1件は save()、大量は update()/bulk_create()'],
        ],
      },
    },
  ],
}

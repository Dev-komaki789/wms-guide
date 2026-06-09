import type { OrmChapter } from './types'

// 第10章「トランザクションとロック」。transaction.atomic / select_for_update。
export const ch10Transactions: OrmChapter = {
  id: 'transactions',
  num: 10,
  title: 'トランザクションとロック ― atomic / select_for_update',
  summary: '「複数の更新をまとめて全部成功か全部取り消しにする（トランザクション）」と、「同時に触られて困る行を一時的に押さえる（ロック）」を学びます。在庫やピッキングのような“競合が起きる場所”で大切な話です。',
  intro: [
    '在庫システムでは、複数の処理が同時に同じデータを触ることがあります。そこで「中途半端な状態を残さない」「同時操作で取り違えない」ための2つの仕組み ― トランザクションとロック ― が登場します。',
    '少し上級ですが、考え方はシンプルです。たとえ話で理解しましょう。',
  ],
  sections: [
    {
      id: 'why-atomic',
      heading: '10-1. トランザクションって？ ― 「全部成功か、全部なかったことに」',
      body: [
        '出荷の処理で「在庫を減らす」と「出荷実績を作る」の2つを続けて行うとします。もし1つ目が成功して2つ目で失敗したら、在庫だけ減って実績が無い、という“中途半端”が残ってしまいます。',
        'トランザクションは、複数の操作を1つの束にして「全部成功したら確定、途中で失敗したら全部なかったことにする」を保証します。銀行の振込で「引き落としだけ成功して入金は失敗」が起きないのと同じ考えです。',
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：「全部なかったことにする」をロールバック、「確定する」をコミットと呼びます。トランザクションは、この“全部かゼロか”を守るしくみです。',
        },
      ],
    },
    {
      id: 'atomic',
      heading: '10-2. transaction.atomic() ― 束にする',
      body: [
        'Django では with transaction.atomic(): のブロックで囲むだけで、その中の更新が1つの束になります。ブロックを抜けるときにエラーが起きていなければ確定（コミット）、途中で例外が出たら全部取り消し（ロールバック）されます。',
      ],
      examples: [
        {
          orm: `from django.db import transaction\nfrom django.db.models import F\n\nwith transaction.atomic():\n    StockBalance.objects.filter(id=1).update(\n        quantity=F('quantity') - 3\n    )\n    Shipment.objects.create(\n        outbound_order_id=10, status='inspecting'\n    )\n# ここまで来たら2つとも確定。途中で失敗したら2つとも取り消し。`,
          note: '在庫の減算と出荷実績の作成を束に。どちらか片方だけ成功、という中途半端を防ぎます。',
        },
      ],
    },
    {
      id: 'why-lock',
      heading: '10-3. ロックって？ ― 「いま触ってるので待ってね」',
      body: [
        '同じピッキングリストを2人が同時に「開始」しようとしたら、両方が「自分が担当」と書き込んでしまうかもしれません。これを防ぐのがロックです。',
        'ロックは「この行はいま自分が処理中なので、終わるまで他の人は待っててね」と一時的に押さえる仕組みです。',
      ],
    },
    {
      id: 'select-for-update',
      heading: '10-4. select_for_update() ― 行を押さえて取る',
      body: [
        'select_for_update() を付けて取り出すと、その行にロックがかかり、同じ行を取ろうとした他の処理は、こちらのトランザクションが終わるまで待たされます。これで「同時に開始」を防げます。',
        '注意：ロックはトランザクションの中（with transaction.atomic(): の中）でだけ意味を持ちます。セットで使うものだと覚えてください。',
      ],
      examples: [
        {
          orm: `from django.db import transaction\n\nwith transaction.atomic():\n    pl = (PickingList.objects\n          .select_for_update()\n          .get(id=list_id))\n    pl.assigned_to = request.user\n    pl.status = 'in_progress'\n    pl.save()`,
          sql: `BEGIN;\nSELECT * FROM picking_lists\nWHERE id = ? FOR UPDATE;   -- ← この行をロック\nUPDATE picking_lists SET ... WHERE id = ?;\nCOMMIT;`,
          note: 'FOR UPDATE がロックの正体。取得から保存までの間、他の人はこの行を触れません。「2人同時に開始」を防ぐ、ピッキング受付の実装そのものです。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'この本のトップ「画面から探す → ピッキング受付」に、まさに select_for_update を使った「開始ロック」の実例が載っています。第10章の知識で読み返すと、実コードの意図がはっきり見えます。',
        },
      ],
    },
  ],
}

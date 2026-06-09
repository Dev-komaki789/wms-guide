import type { OrmChapter } from './types'

// 第9章「書き込み」。create / bulk_create / save / update / get_or_create / update_or_create / delete。
export const ch09Writing: OrmChapter = {
  id: 'writing',
  num: 9,
  title: '書き込み ― create / save / update / delete',
  summary: 'ここまでは「取り出す（読み取り）」が中心でした。この章は「追加・更新・削除（書き込み）」です。1件だけ・まとめて・あれば更新なければ作成、といった書き分けを学びます。',
  intro: [
    'データを変える操作には、追加（INSERT）・更新（UPDATE）・削除（DELETE）があります。ORM ではそれぞれに道具が用意されています。',
    '「1件のオブジェクトを操作する」やり方と「QuerySet でまとめて操作する」やり方の2系統があるので、その違いに注目してください。',
  ],
  sections: [
    {
      id: 'create',
      heading: '9-1. create() ― 1件追加する',
      body: [
        'create() は「新しい行を1件作って保存する」を一気にやってくれます。返ってくるのは作られたオブジェクトです。',
      ],
      examples: [
        {
          orm: `Shipment.objects.create(\n  shipment_code='SP-20260609-001',\n  outbound_order_id=10,\n  status='inspecting',\n)`,
          sql: `INSERT INTO shipments\n  (shipment_code, outbound_order_id, status)\nVALUES ('SP-20260609-001', 10, 'inspecting');`,
          note: 'INSERT（インサート＝行を追加する SQL）になります。作って保存までを1行で。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：INSERT は「新しい行を表に追加する」、UPDATE は「既存の行を書きかえる」、DELETE は「行を消す」SQL です。',
        },
      ],
    },
    {
      id: 'bulk-create',
      heading: '9-2. bulk_create() ― たくさんまとめて追加',
      body: [
        '何十件・何百件もまとめて追加するなら、create() を繰り返すより bulk_create() が圧倒的に速いです。create を100回呼ぶと INSERT が100回ですが、bulk_create はまとめて少ない回数で済みます。',
      ],
      examples: [
        {
          orm: `items = [\n  ShipmentItem(shipment_id=1, sku_id=5, quantity_shipped=3),\n  ShipmentItem(shipment_id=1, sku_id=6, quantity_shipped=1),\n]\nShipmentItem.objects.bulk_create(items)`,
          note: 'オブジェクトをリストにして渡すと、まとめて INSERT します。大量登録のときの定番です。',
        },
      ],
    },
    {
      id: 'save',
      heading: '9-3. save() ― 1件を取って書きかえる',
      body: [
        '既にある1件を更新するときは、取り出して項目を書きかえて save() します。これは「読み取り → 変更 → 保存」の流れです。',
      ],
      examples: [
        {
          orm: `pl = PickingList.objects.get(id=1)\npl.status = 'completed'\npl.save()`,
          sql: `UPDATE picking_lists\nSET status = 'completed', ...\nWHERE id = 1;`,
          note: '1件を取り、項目を変え、save() で UPDATE。画面で1件を編集して保存、という場面の基本形です。',
        },
      ],
    },
    {
      id: 'update',
      heading: '9-4. update() ― 条件に合う行をまとめて更新',
      body: [
        'QuerySet の update() は「条件に合う行を、一発でまとめて更新」します。1件ずつ取り出して save() するより速く、そもそも読み取りが要りません。',
        '第4章の F とあわせると「いまの値を使った更新」も安全にできます。',
      ],
      examples: [
        {
          orm: `PickingList.objects\n  .filter(status='pending')\n  .update(status='cancelled')`,
          sql: `UPDATE picking_lists\nSET status = 'cancelled'\nWHERE status = 'pending';`,
          note: '「未着手のものを全部キャンセルにする」を1回の UPDATE で。該当した件数が返ります。',
        },
      ],
      callouts: [
        {
          kind: 'warn',
          text: 'QuerySet の update() は save() を通らないので、モデルに書いた保存時の処理（signals や save() の上書き）は動きません。「1件を丁寧に保存」は save()、「大量を一括」は update()、と使い分けます。',
        },
      ],
    },
    {
      id: 'get-or-create',
      heading: '9-5. get_or_create / update_or_create ― あれば取得・なければ作成',
      body: [
        '「あればそれを使い、なければ新しく作る」という処理は意外とよく出ます。これを安全に1行で書けるのが get_or_create() です。さらに「あれば更新、なければ作成」なら update_or_create() を使います。',
      ],
      examples: [
        {
          orm: `obj, created = Category.objects.get_or_create(\n  name='文具',\n)`,
          note: '「文具」カテゴリがあればそれを、無ければ作って返します。created は「新しく作ったか（True/False）」。自分で「探して、無ければ作る」を書くより、取り違えが起きにくく安全です。',
        },
      ],
    },
    {
      id: 'delete',
      heading: '9-6. delete() ― 削除する',
      body: [
        'delete() は行を消します。1件のオブジェクトに対しても、QuerySet に対してもできます。QuerySet なら条件に合う行をまとめて削除します。',
      ],
      examples: [
        {
          orm: `# 1件を削除\nShipment.objects.get(id=1).delete()\n\n# 条件に合うものをまとめて削除\nShipment.objects.filter(status='cancelled').delete()`,
          sql: `DELETE FROM shipments WHERE id = 1;\nDELETE FROM shipments WHERE status = 'cancelled';`,
          note: 'まとめて消すときは条件を必ず確認しましょう（条件を付け忘れると全部消えます）。',
        },
      ],
      callouts: [
        {
          kind: 'warn',
          text: '外部キーでつながった行は、設定（on_delete）によっては一緒に消えたり（CASCADE）、消せなかったり（PROTECT）します。削除は影響範囲が広いので、特に慎重に。',
        },
      ],
    },
  ],
}

import type { OrmQuizSet } from './types'

// 問題集 セット6「書き込みとトランザクション」。
export const set06Writing: OrmQuizSet = {
  id: 'writing',
  num: 6,
  level: '中級〜上級',
  title: '書き込みとトランザクション ― create / update / bulk / atomic',
  summary: 'データを作る・変える・消す書き込み系と、複数の処理を「まとめて成功 or 取り消し」にするトランザクション、在庫の取り合いを防ぐ行ロックまでを練習します。',
  intro: [
    'ここまでは「読み取り」中心でした。最後は「書き込み」です。1件ずつの作成・更新から、一括処理、そして在庫システムで重要な「同時実行への備え（トランザクション・ロック）」まで見ていきます。',
  ],
  problems: [
    {
      question: '新しいカテゴリ（category_code="CAT-NEW", category_name="新カテゴリ"）を1件作成してください。',
      hint: '作って即保存は create()。',
      orm: `Category.objects.create(\n  category_code='CAT-NEW',\n  category_name='新カテゴリ',\n)`,
      sql: `INSERT INTO categories\n  (category_code, category_name, ...)\nVALUES ('CAT-NEW', '新カテゴリ', ...);`,
      explanation: [
        'create() は「新しいオブジェクトを作って、すぐ保存（INSERT）」までを1回で行い、作ったオブジェクトを返します。',
        'c = Category(...) のあと c.save() と2行に分けても同じですが、作ってすぐ保存するなら create() が簡潔です。',
      ],
      points: ['create()', 'INSERT'],
    },
    {
      question: 'ID が 1 の在庫を取得し、在庫数（quantity）を 50 に変更して保存してください。',
      hint: '取得 → 値を変える → save()。',
      orm: `sb = StockBalance.objects.get(pk=1)\nsb.quantity = 50\nsb.save()`,
      sql: `-- 取得\nSELECT * FROM stock_balances WHERE id = 1;\n-- 保存\nUPDATE stock_balances\nSET quantity = 50, ...\nWHERE id = 1;`,
      explanation: [
        'すでにある1件を変えるときは「get で取得 → 属性を変更 → save()」。save() は、主キーがある既存オブジェクトなら UPDATE になります。',
        '更新する列を絞りたいときは sb.save(update_fields=[\'quantity\']) と書くと、その列だけ UPDATE され、わずかに速く・安全になります。',
      ],
      points: ['save()', 'UPDATE'],
    },
    {
      question: 'category_code が "CAT-001" のカテゴリを取得し、無ければ（category_name="既定"で）作成してください。',
      hint: '在れば取得・無ければ作成は get_or_create()。',
      orm: `cat, created = Category.objects.get_or_create(\n  category_code='CAT-001',\n  defaults={'category_name': '既定'},\n)`,
      sql: `-- まず探す\nSELECT * FROM categories WHERE category_code = 'CAT-001';\n-- 無ければ\nINSERT INTO categories (category_code, category_name, ...)\nVALUES ('CAT-001', '既定', ...);`,
      explanation: [
        'get_or_create() は「在れば取得、無ければ作成」。戻り値は (オブジェクト, created)。created が True なら新規作成、False なら既存でした、という意味です。',
        'defaults={...} は「新規作成するときだけ使う値」。検索条件（category_code）と、作成時の追加値（category_name）を分けて書きます。',
      ],
      points: ['get_or_create()', 'INSERT'],
    },
    {
      question: 'category_code が "CAT-001" のカテゴリを「あれば名前を更新、無ければ作成」してください。',
      hint: '更新 or 作成は update_or_create()。',
      orm: `cat, created = Category.objects.update_or_create(\n  category_code='CAT-001',\n  defaults={'category_name': '更新後の名前'},\n)`,
      sql: `-- 在れば UPDATE、無ければ INSERT\nUPDATE categories SET category_name = '更新後の名前'\nWHERE category_code = 'CAT-001';\n-- （対象が無ければ INSERT）`,
      explanation: [
        'update_or_create() は get_or_create の更新版。defaults の値で「在れば更新、無ければ作成」します。',
        '「同期処理（外部データを取り込んで、在れば上書き・無ければ追加）」でよく使います。検索条件と更新内容（defaults）を分けて書くのは get_or_create と同じです。',
      ],
      points: ['update_or_create()', 'UPDATE', 'INSERT'],
    },
    {
      question: '作業中（status="in_progress"）のピッキングリストを、すべて「完了（completed）」に一括更新してください。1件ずつ保存しないこと。',
      hint: 'まとめて同じ値にするのは QuerySet.update()。',
      orm: `PickingList.objects \n  .filter(status='in_progress') \n  .update(status='completed')`,
      sql: `UPDATE picking_lists\nSET status = 'completed'\nWHERE status = 'in_progress';`,
      explanation: [
        'QuerySet.update() は「条件に合う行をまとめて1回の UPDATE で更新」します。ループで save() するより圧倒的に速いです（戻り値は更新件数）。',
        'ただし update() は save() を通らないので、save() に書いた独自処理や auto_now、一部のシグナルは動きません。「全行を同じ値にする」単純な更新に向きます。',
      ],
      points: ['update()', 'UPDATE'],
    },
    {
      question: 'ID が 1 の在庫の在庫数を「いまの値から1減らす」更新をしてください。取得してから引くのではなく、DB 側で計算させます。',
      hint: 'いまの値を使う更新は F。競合に強い。',
      orm: `from django.db.models import F\n\nStockBalance.objects \n  .filter(pk=1) \n  .update(quantity=F('quantity') - 1)`,
      sql: `UPDATE stock_balances\nSET quantity = quantity - 1\nWHERE id = 1;`,
      explanation: [
        'F(\'quantity\') - 1 は「DB の中の、いまの quantity から1引く」という意味。Python 側に値を持ってこずに DB で計算します。',
        'sb.quantity = sb.quantity - 1; sb.save() だと、取得してから保存するまでの間に他の処理が割り込むと値がズレ得ます（競合）。F を使えば DB が一気に計算するので、その競合に強くなります。',
      ],
      points: ['F', 'update()', 'UPDATE'],
    },
    {
      question: '複数の在庫移動（StockMovement）を、まとめて1回で作成してください。',
      hint: 'まとめて作成は bulk_create()。',
      orm: `StockMovement.objects.bulk_create([\n  StockMovement(sku_id=1, location_id=1,\n                movement_type='OUT', quantity=-1),\n  StockMovement(sku_id=2, location_id=1,\n                movement_type='OUT', quantity=-2),\n])`,
      sql: `INSERT INTO stock_movements\n  (sku_id, location_id, movement_type, quantity, ...)\nVALUES\n  (1, 1, 'OUT', -1, ...),\n  (2, 1, 'OUT', -2, ...);`,
      explanation: [
        'bulk_create() は、複数のオブジェクトを「1回（または数回）の INSERT」でまとめて作成します。1件ずつ create() するより大幅に速いです。',
        '注意：bulk_create は save() を通らないので、save() の独自処理や一部のシグナル（post_save）は動きません。また DB によっては、作成後のオブジェクトに id が入らないことがあります。',
      ],
      points: ['bulk_create()', 'INSERT'],
    },
    {
      question: '取得済みの複数の出荷明細について、それぞれの quantity_shipped を（行ごとに違う値で）まとめて更新してください。',
      hint: '行ごとに違う値の一括更新は bulk_update()。更新する列を指定する。',
      orm: `items = list(\n  OutboundOrderItem.objects.filter(outbound_order_id=1)\n)\nfor it in items:\n    it.quantity_shipped = it.quantity_ordered\nOutboundOrderItem.objects.bulk_update(\n  items, ['quantity_shipped']\n)`,
      sql: `-- 1回（CASE を使った UPDATE）にまとめられる\nUPDATE outbound_order_items\nSET quantity_shipped = CASE id\n  WHEN 1 THEN 3 WHEN 2 THEN 5 ... END\nWHERE id IN (1, 2, ...);`,
      explanation: [
        'bulk_update() は「行ごとに違う値」をまとめて更新します。第2引数で「更新する列（ここでは quantity_shipped）」を必ず指定します。指定しない列は保存されません。',
        '全部同じ値なら前問の update() が簡単。行ごとに違うなら bulk_update。どちらも save() を通らない点（独自処理・シグナルが動かない）は同じです。',
      ],
      points: ['bulk_update()', 'UPDATE'],
    },
    {
      question: 'ステータスが「取消（cancelled）」の出荷指示を、すべて削除してください。',
      hint: '削除は delete()。QuerySet にもインスタンスにもある。',
      orm: `OutboundOrder.objects \n  .filter(status='cancelled') \n  .delete()`,
      sql: `DELETE FROM outbound_orders\nWHERE status = 'cancelled';`,
      explanation: [
        'QuerySet.delete() は「条件に合う行をまとめて削除」します。1件だけなら obj = ...get(...); obj.delete() でもOK。',
        '削除は on_delete の設定に従って関連にも影響します（次問）。戻り値は (削除総数, モデル別の内訳) のタプルです。',
      ],
      points: ['delete()', 'DELETE'],
    },
    {
      question: '「在庫を1減らす」と「在庫移動の履歴を作る」を、両方成功 or 両方取り消し（途中で失敗したら無かったことに）したいです。どう囲みますか？',
      hint: 'まとめて成功/取り消しは transaction.atomic()。',
      orm: `from django.db import transaction\nfrom django.db.models import F\n\nwith transaction.atomic():\n    StockBalance.objects.filter(pk=1).update(\n        quantity=F('quantity') - 1\n    )\n    StockMovement.objects.create(\n        sku_id=1, location_id=1,\n        movement_type='OUT', quantity=-1,\n    )`,
      sql: `BEGIN;\n  UPDATE stock_balances SET quantity = quantity - 1 WHERE id = 1;\n  INSERT INTO stock_movements (...) VALUES (...);\nCOMMIT;  -- 途中で失敗したら ROLLBACK`,
      explanation: [
        'with transaction.atomic(): で囲んだ中の書き込みは「ひとまとまり」になります。全部成功すれば確定（COMMIT）、途中で例外が出れば全部取り消し（ROLLBACK）。',
        '「在庫だけ減って履歴が残らない」といった中途半端な状態を防げます。お金や在庫のように「片方だけ実行されると困る」処理は atomic で囲むのが鉄則です。',
      ],
      points: ['atomic', 'BEGIN / COMMIT'],
    },
    {
      question: '在庫の取り合い（同時に2人が引き当て）を防ぐため、ID が 1 の在庫行に「鍵をかけて」取得したいです。どう書きますか？',
      hint: '行ロックは select_for_update()（atomic の中で使う）。',
      orm: `from django.db import transaction\n\nwith transaction.atomic():\n    sb = StockBalance.objects \n      .select_for_update() \n      .get(pk=1)\n    # ここで他のトランザクションは sb を更新できず待つ\n    ...`,
      sql: `BEGIN;\n  SELECT * FROM stock_balances\n  WHERE id = 1\n  FOR UPDATE;   -- この行に書き込みロック\n  ...\nCOMMIT;`,
      explanation: [
        'select_for_update() は、取得した行に「書き込みロック」をかけます（SQL の FOR UPDATE）。他のトランザクションは、このロックが解ける（COMMIT/ROLLBACK）まで同じ行を更新できず待たされます。',
        '必ず transaction.atomic() の中で使います（ロックはトランザクションの範囲だけ有効）。在庫の二重引き当てのような「競合」を防ぐ定番です。',
      ],
      points: ['select_for_update()', 'atomic', 'FOR UPDATE'],
    },
    {
      question: '在庫引き当ての安全な流れ「①在庫行をロックして取得 → ②残数を確認 → ③足りれば1減らす」を、atomic と select_for_update で書いてください。',
      hint: 'atomic の中で select_for_update して get、確認してから update。',
      orm: `from django.db import transaction\nfrom django.db.models import F\n\nwith transaction.atomic():\n    sb = StockBalance.objects \n      .select_for_update() \n      .get(pk=1)\n    if sb.quantity >= 1:\n        StockBalance.objects.filter(pk=1).update(\n            quantity=F('quantity') - 1\n        )`,
      sql: `BEGIN;\n  SELECT * FROM stock_balances WHERE id = 1 FOR UPDATE;\n  -- アプリ側で quantity を確認\n  UPDATE stock_balances SET quantity = quantity - 1\n  WHERE id = 1;\nCOMMIT;`,
      explanation: [
        'ロックして取得（①）→ 確認（②）→ 更新（③）を atomic で囲むことで、「確認したときの在庫」と「減らすときの在庫」がズレません。他の人はロック中は待つので、二重引き当てが起きません。',
        '更新自体も F を使えば DB 側で引くのでさらに安全。「ロック＋atomic＋F」は、在庫・座席・残高など“取り合い”が起きる処理の王道の組み合わせです。',
      ],
      points: ['atomic', 'select_for_update()', 'F'],
    },
    {
      question: 'update() を実行すると、戻り値で「何件更新されたか」が分かります。作業中のリストを完了にして、更新件数を受け取ってください。',
      hint: 'update() の戻り値は更新件数（整数）。',
      orm: `n = PickingList.objects \n  .filter(status='in_progress') \n  .update(status='completed')\n# n に更新件数が入る`,
      sql: `UPDATE picking_lists SET status = 'completed'\nWHERE status = 'in_progress';\n-- 影響行数が返る`,
      explanation: [
        'update() は「更新した件数（整数）」を返します。delete() も同様に削除件数（と内訳）を返します。',
        '「何件処理したか」をログに出したり、0件なら別処理をしたり、といった分岐に使えます。',
      ],
      points: ['update()', 'UPDATE'],
    },
    {
      question: 'delete() の挙動は、親（参照される側）の on_delete 設定で変わります。「在庫が参照しているロケーション（Location）を削除しようとするとどうなるか」を、設定ごとに答えてください。',
      hint: 'WMS のマスタは PROTECT、明細は CASCADE が多い。',
      orm: `# Location は on_delete=PROTECT で参照されている\nLocation.objects.filter(pk=1).delete()\n# → 在庫(StockBalance)が参照中なら ProtectedError で止まる\n\n# 一方 CASCADE の親（例: OutboundOrder）を消すと\nOutboundOrder.objects.filter(pk=1).delete()\n# → 子の明細(OutboundOrderItem)も一緒に削除される`,
      sql: `-- PROTECT: 参照中なら削除はエラーで中止\n-- CASCADE: 親を消すと子も DELETE\nDELETE FROM outbound_order_items WHERE outbound_order_id = 1;\nDELETE FROM outbound_orders WHERE id = 1;`,
      explanation: [
        'delete() は、参照している子がいる場合 on_delete の設定で動きが変わります。PROTECT は「子がいると削除を止める（ProtectedError）」、CASCADE は「子も一緒に削除」、SET_NULL は「子の参照を空にする」。',
        'WMS では、誤って消すと困るマスタ（Location・Sku）は PROTECT、親と運命を共にする明細は CASCADE、という方針です（モデル定義は ORM 大全 第14章）。削除する前に「この親は何に参照されているか」を意識しましょう。',
      ],
      points: ['delete()', 'on_delete', 'DELETE'],
    },
  ],
}

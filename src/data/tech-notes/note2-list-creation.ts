import type { TechNote } from './types'

// 技術メモ2: リストの作り方（出荷起動＝在庫引き当て＋ピッキングリスト生成）。
export const note2ListCreation: TechNote = {
  id: 'picking-list',
  num: 2,
  title: 'ピッキングリストはどう作る？ ― 出荷起動のしくみ',
  summary: '「出荷指示」から「ピッキングリスト」が生まれるまでを、実コードに沿って追います。在庫の引き当て・棚の選び方・リストの分け方という、倉庫システムの心臓部です。',
  source: 'outbound/views.py（_try_launch_order / _generate_picking_lists）',
  intro: [
    'お客さんの注文（出荷指示）が来ても、いきなり倉庫で動き出すわけではありません。「どの棚の在庫を、誰が、どの順で取りに行くか」を決めた指示書＝ピッキングリストを先に作ります。',
    'この「指示書を作る」処理を、WMS では出荷起動と呼んでいます。中身を順に見ていきましょう。',
  ],
  sections: [
    {
      id: 'flow',
      heading: '2-1. 全体の流れ',
      body: [
        '出荷起動は大きく2段階です。まず「全部の明細を引き当てられるか」を計画し（1パス目）、全部いけるなら引き当てを確定してリストを作ります（2パス目）。1つでも在庫が足りなければ、何もせずに待機状態のまま残します。',
      ],
      mermaid: `flowchart TD\n  A["出荷指示（注文）"] --> B["1パス目: 全明細の引き当て計画<br/>足りる棚を探す"]\n  B --> C["全明細そろうか判定する"]\n  C --> D["足りなければ何もしない<br/>（出荷起動待ちのまま）"]\n  C --> E["そろえば 2パス目: 引き当て確定<br/>StockReservation を作成"]\n  E --> F["エリアごとに<br/>ピッキングリストを生成"]\n  F --> G["明細を棚番順に並べる"]`,
      callouts: [
        {
          kind: 'note',
          text: 'ことば：引き当て（reservation）＝「この注文のために、この棚の在庫を◯個とっておく（予約する）」こと。実際に減らす前に“確保”しておく考え方です。',
        },
      ],
    },
    {
      id: 'allocatable',
      heading: '2-2. 「引き当てられる数」の考え方',
      body: [
        'ある棚の SKU を何個まで引き当てられるかは、単純な在庫数そのままではありません。すでに他の注文が予約している分を引いた数です。',
        'つまり「引き当て可能数 ＝ 在庫数 −（その棚・その SKU の有効な引き当ての合計）」。これを Django の ORM（集計）で計算しています。',
      ],
      code: [
        {
          label: 'Python (Django ORM)',
          code: `# その SKU の「有効な引き当て」をロケーション別に集計\nStockReservation.objects\n  .filter(sku=sku, status='active')\n  .values('location')\n  .annotate(reserved=Sum('quantity'))\n\n# 引き当て可能数 = 在庫数 − reserved`,
          note: 'ORM 大全の第7章（集計）で学んだ values().annotate() がそのまま実務で使われています。',
        },
      ],
    },
    {
      id: 'shelf',
      heading: '2-3. どの棚から取る？ ― ハイブリッドな棚選び',
      body: [
        '同じ SKU が複数の棚にあるとき、どの棚から取るかで作業効率が変わります。WMS では2つのルールを使い分けています。',
      ],
      table: {
        headers: ['状況', '選び方', 'ねらい'],
        rows: [
          ['1つの棚だけで足りる', '在庫数が多い棚を1つ選ぶ', '回る棚を1つで済ませ、作業を短く'],
          ['1棚では足りず分割する', '古く入った棚から順に取る（FIFO）', '古い在庫から先に出して、死蔵を防ぐ'],
        ],
      },
      callouts: [
        {
          kind: 'note',
          text: 'ことば：FIFO（ファイフォ）＝First In, First Out＝「先に入れたものを先に出す」。古い在庫がいつまでも残らないようにする考え方です。',
        },
      ],
    },
    {
      id: 'generate',
      heading: '2-4. リストを「エリアごと」に分けて作る',
      body: [
        '引き当てが決まったら、いよいよピッキングリストを作ります。ポイントは、倉庫のエリア単位でリストを分けること。1人の作業者が広い倉庫を端から端まで歩くのは大変なので、エリアごとに分けて配ります。',
        'さらに、リストの中の明細は棚番（ロケーションコード）順に並べます。これで作業者は棚番の小さい順に進むだけで、効率よく回れます（巡回順）。',
      ],
      code: [
        {
          label: 'Python (Django ORM)',
          code: `# エリアごとにピッキングリストを1つ作る\npicking_list = PickingList.objects.create(\n    picking_list_code=PickingList.next_code(today),  # PL-YYYYMMDD-NNN\n    warehouse=order.warehouse,\n    area=area,\n    status=PickingList.Status.PENDING,\n    created_by=user,\n)\n\n# 明細を棚番順に並べて、sort_order を振る\narea_items.sort(key=lambda it: it.location.location_code)\nfor sort_idx, item in enumerate(area_items, start=1):\n    PickingListItem.objects.create(\n        picking_list=picking_list,\n        location=item.location,\n        sku=item.sku,\n        quantity_requested=item.quantity_ordered,\n        sort_order=sort_idx,\n    )`,
          note: 'create でリスト本体を作り（第9章）、明細を棚番順に並べて sort_order を付けています。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'picking_list_code は採番が他の処理と衝突することがあるため、作成をリトライ（create_with_retry）でくるんでいます。「同時に作っても番号がかぶらない」ための工夫です。',
        },
      ],
    },
    {
      id: 'atomic',
      heading: '2-5. 「全部成功か、全部取り消し」で守る',
      body: [
        '引き当て・リスト生成・明細作成は、途中で失敗すると「在庫だけ予約されてリストが無い」といった中途半端を生みます。これを防ぐため、全体を transaction.atomic() の束にしています。',
        'もし在庫不足で起動できなければ、何も残さず取り消し。EC 連携の注文受付（技術メモ4）でも、在庫不足のときは 409 を返して全部ロールバックします。',
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'ここは ORM 大全の第10章（トランザクション）が、まるごと実務で効いている場面です。あわせて読むと「なぜ atomic で囲むのか」が腑に落ちます。',
        },
      ],
    },
    {
      id: 'auto',
      heading: '2-6. 補足 ― 自動倉庫（AGV / GTP）の場合',
      body: [
        '自動ピッキング設備（AGV や GTP）が担当する分は、人が棚を回らないので、ピッキングリストを最初から「完了状態」で作り、すぐ検品工程へ渡します。同じ「リスト生成」でも、完了済みとして作るところだけが違います。',
      ],
    },
  ],
}

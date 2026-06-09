import type { OrmChapter } from './types'

// 第5章「並べ替え・整形」。order_by / スライス / distinct / values / values_list / only・defer。
export const ch05Shaping: OrmChapter = {
  id: 'shaping',
  num: 5,
  title: '並べ替え・整形 ― order_by / スライス / values / only・defer',
  summary: '取り出した行を「並べる」「先頭だけにする」「重複を消す」、そして「必要な列だけ取る」やり方を学びます。結果を見やすく・軽くするための道具たちです。',
  intro: [
    'ここまでで「どの行を取るか（絞り込み）」を学びました。この章は「取った行をどう整えるか」です。並び順を決めたり、件数を絞ったり、必要な列だけにして軽くしたりします。',
  ],
  sections: [
    {
      id: 'order-by',
      heading: '5-1. order_by() ― 並べ替え',
      body: [
        'order_by("項目名") で、その項目の小さい順（昇順）に並びます。先頭に - を付けると大きい順（降順）。カンマで複数指定すると、「まず左の項目で、同じならその次の項目で」並びます。',
      ],
      examples: [
        {
          orm: `PickingList.objects.order_by('-started_at', 'id')`,
          sql: `SELECT *\nFROM picking_lists\nORDER BY started_at DESC, id ASC;`,
          note: '「開始が新しい順、同じ時刻なら id の小さい順」。- が DESC（降順）、無印が ASC（昇順）です。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：ASC（アセンディング）は昇順＝小さい→大きい、DESC（ディセンディング）は降順＝大きい→小さい。日付なら昇順＝古い順、降順＝新しい順です。',
        },
      ],
    },
    {
      id: 'slice',
      heading: '5-2. スライス ― 先頭◯件・◯件目から',
      body: [
        'Python のリストと同じ書き方 qs[開始:終了] で、件数を絞れます。これは SQL の LIMIT（最大件数）と OFFSET（何件読み飛ばすか）に翻訳されます。',
        '「ページ送り（1ページ20件）」などで使います。なお、マイナスのスライス（qs[-1] など）は ORM では使えません。',
      ],
      examples: [
        {
          orm: `PickingList.objects.order_by('-started_at')[:5]`,
          sql: `SELECT *\nFROM picking_lists\nORDER BY started_at DESC\nLIMIT 5;`,
          note: '新しい順に先頭5件。[:5] が LIMIT 5 になります。',
        },
        {
          orm: `# 2ページ目（21〜40件目）\nPickingList.objects.order_by('id')[20:40]`,
          sql: `SELECT *\nFROM picking_lists\nORDER BY id\nLIMIT 20 OFFSET 20;`,
          note: '[20:40] は「20件読み飛ばして20件」。OFFSET 20 LIMIT 20 になります。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：OFFSET（オフセット）は「先頭から◯件読み飛ばす」という意味です。LIMIT と組み合わせてページ送りを作ります。',
        },
      ],
    },
    {
      id: 'distinct',
      heading: '5-3. distinct() ― 重複を消す',
      body: [
        'distinct() を付けると、まったく同じ行が重複していたら1つにまとめます。表をまたいで取得したときなどに、同じものが何度も出るのを防げます。',
      ],
      examples: [
        {
          orm: `Sku.objects\n  .filter(stockbalance__quantity__gt=0)\n  .distinct()`,
          sql: `SELECT DISTINCT skus.*\nFROM skus\n  JOIN stock_balances ON ...\nWHERE stock_balances.quantity > 0;`,
          note: '在庫が複数ロケーションにある SKU が何度も出てしまうのを、DISTINCT で1つにまとめています。',
        },
      ],
    },
    {
      id: 'values',
      heading: '5-4. values() / values_list() ― 必要な列だけ・辞書やタプルで',
      body: [
        'ふつう取り出すと「モデルのオブジェクト」が返りますが、values() を使うと「辞書（項目名→値）」、values_list() を使うと「タプル（値の並び）」で、しかも指定した列だけを受け取れます。',
        '一覧表示や集計の前段で、必要な列だけ軽く取りたいときに便利です。',
      ],
      examples: [
        {
          orm: `PickingListItem.objects.values(\n  'outbound_order_item_id',\n  'quantity_picked',\n)`,
          sql: `SELECT outbound_order_item_id, quantity_picked\nFROM picking_list_items;`,
          note: '結果は [{"outbound_order_item_id": 1, "quantity_picked": 3}, ...] のような辞書のリスト。SELECT * ではなく、その2列だけ取ります。',
        },
        {
          orm: `# 値だけのリストがほしいなら flat=True\nSku.objects.values_list('sku_code', flat=True)`,
          sql: `SELECT sku_code FROM skus;`,
          note: 'flat=True を付けると ["SKU-001", "SKU-002", ...] のように、ただの値のリストになります（1列のときだけ使えます）。',
        },
      ],
    },
    {
      id: 'only-defer',
      heading: '5-5. only() / defer() ― 列を絞って軽くする',
      body: [
        'モデルのオブジェクトのまま使いたいけれど「重い列（長い説明文など）は今いらない」というとき、only("使う列") で“使う列だけ”、defer("除く列") で“その列だけ後回し”にできます。',
        'values() と違い、返ってくるのはモデルのオブジェクトのままです。あとから後回しにした列に触れると、その時点でこっそり追加の問い合わせが起きる点に注意します。',
      ],
      examples: [
        {
          orm: `PickingList.objects.only('id', 'picking_list_code', 'status')`,
          sql: `SELECT id, picking_list_code, status\nFROM picking_lists;`,
          note: '使う列だけ取って軽くします。指定しなかった列に後で触れると、その分の問い合わせが追加で走ります。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: '使い分け：行をオブジェクトとして扱いたいなら only/defer、ただのデータ（辞書・値）として軽く扱いたいなら values/values_list。一覧やグラフ用の素材集めには values が手軽です。',
        },
      ],
    },
  ],
}

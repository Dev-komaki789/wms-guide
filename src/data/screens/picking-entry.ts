import type { ScreenDoc } from '../types'

// ピッキング作業の入口画面（対象リストの一覧・開始）。
// 出典: ~/projects/wms/outbound/views.py OutboundPickingView
export const pickingEntry: ScreenDoc = {
  id: 'picking-entry',
  category: '出荷',
  title: 'ピッキング作業（入口・対象リスト一覧）',
  purpose:
    'ピッキングリスト番号をスキャンし、未着手/作業中のリストを確認して「ピッキング開始」で作業画面へ入る（ハンディ端末）。',
  tags: ['ハンディ', '出荷', '入口', 'ロック'],

  displayedData: [
    { label: 'リスト番号の入力欄', desc: 'GET ?code= に渡すスキャン入力。一致するリストを1件引く。' },
    { label: '対象リストの明細', desc: '棚番順（sort_order）の明細行: 棚番・SKU・商品名・指示数。_picking_item_rows が生成。' },
    { label: '紐づく出荷指示', desc: 'そのリストが属する OutboundOrder（顧客など）。_order_of_picking_list で逆引き。' },
    { label: '引き継ぎの確認', desc: '別担当者が作業中の場合、誰が作業中かを表示し takeover=1 で引き継げる。' },
  ],

  flowSteps: [
    {
      no: 1,
      title: 'リクエスト',
      detail: 'ハンディでリスト番号をスキャン → GET /handheld/picking/?code=...',
      ref: 'outbound/views.py: OutboundPickingView.get',
      code: {
        path: 'outbound/views.py',
        lines: [848, 859],
        notes: [
          { line: 849, text: 'スキャンしたリスト番号は GET の code= で渡ってくる' },
          { line: 852, text: '倉庫スコープ内で、その番号のリストを 1 件だけ探す' },
          { line: 853, text: '見つからなければエラー文を画面へ（lookup_error）' },
        ],
      },
    },
    {
      no: 2,
      title: 'URL',
      detail: "path('handheld/picking/') → OutboundPickingView（name='handheld_picking'）。",
      ref: 'outbound/urls.py:30',
      code: {
        path: 'outbound/urls.py',
        lines: [30, 30],
        notes: [{ line: 30, text: '引数なしの入口 URL。一覧表示と「開始」POST の両方をこの 1 本で受ける' }],
      },
    },
    {
      no: 3,
      title: 'View（GET）',
      detail: '倉庫スコープで picking_list_code 一致を1件引き、明細行と紐づく出荷指示を ctx に詰める。見つからなければ lookup_error。',
      ref: 'OutboundPickingView.get',
      code: { path: 'outbound/views.py', lines: [848, 859] },
    },
    {
      no: 4,
      title: 'Model',
      detail: "明細表示は _picking_item_rows が担当。sku__product・location を select_related で一括取得し、棚番順に整形する。",
      ref: 'outbound/views.py: _picking_item_rows',
      code: {
        path: 'outbound/views.py',
        lines: [813, 825],
        notes: [{ line: 816, text: 'select_related で関連も一括取得（N+1 回避）。order_by で棚番順に並べる' }],
      },
    },
    { no: 5, title: 'DB', detail: 'picking_lists / picking_list_items を読み取り。', ref: 'picking_lists' },
    {
      no: 6,
      title: '開始（POST）',
      detail: '「ピッキング開始」で POST。atomic + select_for_update でリストをロックし、担当者=自分・status=in_progress に。別担当者作業中は takeover 指定が無ければ拒否。成功で作業画面へ redirect。',
      ref: 'OutboundPickingView.post',
      code: {
        path: 'outbound/views.py',
        lines: [861, 907],
        notes: [
          { line: 865, text: 'DB 操作をひとまとめに（失敗したら全部取り消す）' },
          { line: 869, text: 'select_for_update でリスト行をロック ＝ 同時開始を防ぐ' },
          { line: 888, text: '別担当者が作業中で引き継ぎ指定が無ければ、開始を断る' },
          { line: 900, text: '自分を担当者にして作業中へ。これで確保完了 → 作業画面へ' },
        ],
      },
    },
  ],

  mermaid: `flowchart TD
    A["リスト番号をスキャン<br/>GET ?code=..."] --> B{"一致するリスト?"}
    B -- "なし" --> Bx["lookup_error 表示"]
    B -- "あり" --> C["明細(棚番順) + 出荷指示を表示"]
    C --> D["「ピッキング開始」POST"]
    D --> E["atomic + select_for_update でロック"]
    E --> F{"status は pending/in_progress?"}
    F -- "いいえ" --> Fx["対象外メッセージ → 入口へ"]
    F -- "はい" --> G{"別担当者が作業中?"}
    G -- "はい(引き継ぎ無)" --> Gx["エラー: 〇〇が作業中"]
    G -- "いいえ / 引き継ぎ有" --> H["assigned_to=自分<br/>status=IN_PROGRESS<br/>started_at 更新"]
    H --> I["作業画面へ redirect<br/>/handheld/picking/&lt;pk&gt;/"]`,

  relatedFiles: [
    { path: 'outbound/urls.py', symbol: "name='handheld_picking'", role: '入口画面のルーティング。', lines: [30, 30] },
    { path: 'outbound/views.py', symbol: 'OutboundPickingView.get', role: 'リスト検索表示。code 一致を1件引き、明細行と出荷指示を ctx に詰める。', lines: [848, 859] },
    { path: 'outbound/views.py', symbol: 'OutboundPickingView.post', role: '開始/引き継ぎ。atomic + select_for_update でロックし担当者・in_progress に。', lines: [861, 907] },
    { path: 'outbound/views.py', symbol: '_picking_item_rows / _order_of_picking_list', role: '明細行（棚番順）の整形と、リスト→出荷指示の逆引き。', lines: [805, 825] },
  ],

  notes: [
    'AGV/GTP（種まき方式）対象は出荷起動時に自動仕分け済み(completed)のため、ここに出るのはオーダーピッキング対象のみ。',
    '引き継ぎ: 別担当者が離脱したリストも takeover=1 で開始でき、started_at を更新して担当者を付け替える。',
    '権限: LoginRequiredMixin + ハンディ作業者ロールで利用。倉庫スコープ(get_current_warehouse)で他倉庫のリストは見えない。',
  ],
}

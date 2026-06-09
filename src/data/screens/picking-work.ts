import type { ScreenDoc } from '../types'

// ピッキング作業画面（実ピッキング数の登録）。
// 出典: ~/projects/wms/outbound/{urls,views,models}.py（読んで執筆。コードはコピーしない）
export const pickingWork: ScreenDoc = {
  id: 'picking-work',
  category: '出荷',
  title: 'ピッキング作業（実ピッキング数の登録）',
  purpose:
    'ピッキングリストの明細を棚番順に1商品ずつ照合し、実際に棚から取った数量を登録する（ハンディ端末）。',
  tags: ['ハンディ', '出荷', 'ウィザード', '明細単位コミット'],

  displayedData: [
    {
      label: 'ピッキングリスト番号 / 進捗',
      desc: 'PL-YYYYMMDD-NNN 形式の番号と、done_count / total（◯件中△件完了）の進捗。',
    },
    {
      label: '棚番（ロケーション）',
      desc: '次に取りに行く棚の location_code。明細は sort_order（棚番順）で並ぶので歩行距離が最短になる。',
    },
    {
      label: 'SKU / JANコード / 商品名',
      desc: 'スキャン照合の対象。sku_code・jan_code・product_name を表示。',
    },
    {
      label: '指示数量（quantity_requested）',
      desc: 'この明細で取るべき数。入力欄はここを上限にバリデーションされる。',
    },
    {
      label: '実ピッキング数の入力欄',
      desc: '0〜指示数量。指示未満なら欠品(short)として確定できる。',
    },
    {
      label: '（完了後）サマリ表',
      desc: 'status=completed のリストを再度開くと、指示数・実数・欠品数を読み取り専用で一覧表示。',
    },
  ],

  flowSteps: [
    {
      no: 1,
      title: 'リクエスト',
      detail:
        '入口画面（ピッキング対象リスト一覧）で「ピッキング開始」を押すと、対象リストが作業者にロックされ、この作業画面へ GET 遷移する。',
      ref: 'outbound/views.py: OutboundPickingView.post',
      code: {
        path: 'outbound/views.py',
        lines: [861, 907],
        notes: [
          { line: 865, text: 'ここから DB 操作をひとまとめに。途中で失敗したら全部取り消す（中途半端な状態を作らない）' },
          { line: 869, text: 'select_for_update = 対象リストの行に DB ロック。他の人の「同時に開始」を防ぐ' },
          { line: 874, text: '完了・取消などピッキング対象外の状態なら、ここで開始を断る' },
          { line: 888, text: '別の担当者が作業中なのに「引き継ぎ」指定が無ければ開始させない（横取り防止）' },
          { line: 900, text: '自分を担当者にして status を作業中(IN_PROGRESS)へ。これでロック確保' },
        ],
      },
    },
    {
      no: 2,
      title: 'URL ルーティング',
      detail:
        "path('handheld/picking/<int:pk>/') が OutboundPickingWorkView に解決される（name='handheld_picking_work'）。",
      ref: 'outbound/urls.py:31-35',
      code: {
        path: 'outbound/urls.py',
        lines: [31, 35],
        notes: [
          { line: 32, text: 'URL の <int:pk> が、そのまま View の引数 pk（ピッキングリストの id）になる' },
          { line: 34, text: 'この name で、テンプレートや redirect から URL を逆引きできる' },
        ],
      },
    },
    {
      no: 3,
      title: 'View（GET）',
      detail:
        '倉庫スコープで PickingList を取得 → ステータスで分岐。completed なら読み取り専用サマリ、in_progress なら _guard で担当者を検査し、picked_at が未設定（=未ピッキング）の明細だけを sort_order 順に集める。',
      ref: 'outbound/views.py: OutboundPickingWorkView.get',
      code: {
        path: 'outbound/views.py',
        lines: [956, 1024],
        notes: [
          { line: 962, text: '完了済みのリストなら、読み取り専用のサマリ表を見せて終わり' },
          { line: 989, text: '作業可能か（本人か・作業中か）を検査。ダメなら入口へ戻す' },
          { line: 997, text: '明細を棚番順(sort_order)で取得。select_related で関連も一括取得し N+1 を防ぐ' },
          { line: 1001, text: '確定済み(picked_at あり)の明細は飛ばす ＝ 中断後に「続きから」できる仕組み' },
          { line: 1004, text: '未ピッキングの明細だけを、画面のウィザード用 JSON に積む' },
        ],
      },
    },
    {
      no: 4,
      title: 'Model / クエリ',
      detail:
        "picking_list.items を select_related('sku__product', 'location') で引き、N+1 を避けつつ棚番・SKU・商品名・指示数を取得。明細モデル PickingListItem は実ピッキング数や picked_at を持つ。",
      ref: 'outbound/models.py: PickingListItem',
      code: {
        path: 'outbound/models.py',
        lines: [319, 374],
        notes: [
          { line: 340, text: '指示数量 = 取るべき数。1 以上（MinValueValidator(1)）' },
          { line: 341, text: '実ピッキング数 = 実際に取った数。初期 0 で、確定時に更新される' },
          { line: 357, text: '完了日時。NULL なら未ピッキング。「続きから」判定の目印になる' },
          { line: 359, text: '棚番順の並び。order タイプのみ有効で、歩行距離を最短化する' },
        ],
      },
    },
    {
      no: 5,
      title: 'DB',
      detail:
        'picking_lists / picking_list_items テーブルを参照。この GET は在庫を一切動かさない（在庫減算は後工程「出荷検品」で行う）。',
      ref: 'picking_lists, picking_list_items',
    },
    {
      no: 6,
      title: '画面表示 → 明細ごとに即時コミット',
      detail:
        '未ピッキング明細を1件ずつ表示するウィザード。棚番と商品をスキャン照合→実数入力→1明細ごとに fetch で item API へ POST（中断耐性: 途中で落ちても picked_at 済みは次回スキップ）。全明細が確定するとリストを completed にし、同じ出荷指示の全リスト完了で指示を picking_wait→inspection_wait へ進める。',
      ref: 'outbound/views.py: OutboundPickingItemView.post',
      code: {
        path: 'outbound/views.py',
        lines: [1057, 1150],
        notes: [
          { line: 1059, text: '1 明細の確定をトランザクションでひとまとめに（保存と完了判定を一貫させる）' },
          { line: 1073, text: '作業中のリスト以外には書き込ませない（完了済み等を弾く）' },
          { line: 1098, text: '既に確定済みの明細ならエラー ＝ 二重コミットの防止' },
          { line: 1105, text: '実数は 0〜指示数 の範囲のみ許可（取りすぎ・マイナスを弾く）' },
          { line: 1115, text: '指示数を満たせば picked、足りなければ short(欠品) として記録' },
          { line: 1125, text: 'まだ確定していない明細が残っているか数える' },
          { line: 1128, text: '残り 0 なら、このピッキングリストを完了(COMPLETED)に' },
          { line: 1141, text: '同じ出荷指示の全リストが完了したら、指示を次工程「検品待ち」へ進める' },
        ],
      },
    },
  ],

  // flowchart: ページ読み込み〜明細ごとの即時コミットループ〜後続工程まで。
  mermaid: `flowchart TD
    A["入口画面で「ピッキング開始」<br/>POST /handheld/picking/"] --> B{"リスト状態は?"}
    B -- "別担当者が作業中<br/>(引き継ぎ指定なし)" --> Bx["エラー → 入口へ戻す"]
    B -- "PENDING / IN_PROGRESS" --> C["担当者にロック<br/>status=IN_PROGRESS<br/>started_at 記録"]
    C --> D["GET /handheld/picking/&lt;pk&gt;/"]
    D --> E{"status?"}
    E -- "COMPLETED" --> Esum["サマリ表（読み取り専用）"]
    E -- "IN_PROGRESS" --> F["_guard: 担当者チェック"]
    F --> G["picked_at=NULL の明細を<br/>sort_order(棚番順)で JSON 化"]
    G --> H["ウィザード表示<br/>1明細ずつ"]
    H --> I["棚番・SKU をスキャン照合"]
    I --> J["実ピッキング数を入力"]
    J --> K["fetch POST item API<br/>/item/&lt;item_pk&gt;/"]
    K --> L["transaction.atomic +<br/>select_for_update"]
    L --> M{"バリデーション<br/>0〜指示数 / 重複 / 担当者"}
    M -- NG --> Merr["JSON ok=false<br/>画面にエラー表示"]
    M -- OK --> N["PickingListItem 保存<br/>quantity_picked / status / picked_at"]
    N --> O{"残り明細 remaining==0 ?"}
    O -- "いいえ" --> H
    O -- "はい" --> P["PickingList → COMPLETED"]
    P --> Q{"同指示の全リスト完了?"}
    Q -- "はい" --> R["OutboundOrder<br/>picking_wait → inspection_wait"]
    Q -- "いいえ" --> S["指示はそのまま<br/>(他リスト待ち)"]`,

  // 誰が誰を呼ぶか。明細ごとの即時コミットがループで回るのが見どころ。
  // ※ sequenceDiagram のメッセージ文では <,>,{,},<br/> が構文を壊すので使わない。
  sequenceMermaid: `sequenceDiagram
    actor W as 作業者
    participant H as ハンディ端末
    participant D as Django(View)
    participant DB as DB
    W->>H: リスト番号スキャン → 開始
    H->>D: GET /handheld/picking/[pk]/
    D->>DB: PickingList + 未ピッキング明細を取得
    DB-->>D: 明細(棚番順)
    D-->>H: ウィザード画面(明細 JSON)
    loop 明細ごと
        W->>H: 棚番・SKU スキャン + 実数入力
        H->>D: POST item API (quantity_picked)
        D->>DB: select_for_update → 明細を確定保存
        DB-->>D: OK
        D-->>H: JSON ok / all_done / remaining
        H-->>W: 次の明細へ / 完了
    end
    D->>DB: 全明細完了 → リスト COMPLETED（指示を inspection_wait へ）`,

  // PickingList ステータスの移り変わり。
  stateMermaid: `stateDiagram-v2
    [*] --> pending: リスト発行
    pending --> in_progress: 開始（担当者にロック）
    in_progress --> in_progress: 明細を1件ずつ即時確定
    in_progress --> completed: 全明細が picked_at を獲得
    pending --> cancelled
    in_progress --> cancelled
    completed --> [*]`,

  relatedFiles: [
    {
      path: 'outbound/urls.py',
      symbol: "name='handheld_picking_work' / 'handheld_picking_item'",
      role: '作業画面 GET と、明細単位コミット API（fetch 先）のルーティング。',
      lines: [31, 42],
    },
    {
      path: 'outbound/views.py',
      symbol: 'OutboundPickingWorkView.get',
      role: '状態分岐（サマリ/作業）・担当者ガード・未ピッキング明細の JSON 化。',
      lines: [956, 1024],
    },
    {
      path: 'outbound/views.py',
      symbol: 'OutboundPickingWorkView._guard',
      role: '作業可能か（存在・in_progress・担当者一致）を検査。不可なら入口へ redirect。',
      lines: [933, 954],
    },
    {
      path: 'outbound/views.py',
      symbol: 'OutboundPickingItemView.post',
      role: '1明細を即時確定。実数・status(picked/short)・picked_at 記録、完了連鎖の判定。',
      lines: [1057, 1150],
    },
    {
      path: 'outbound/views.py',
      symbol: '_order_of_picking_list',
      role: 'リスト→出荷指示の逆引き（1リスト=1指示）。完了時の指示前進に使う。',
      lines: [805, 810],
    },
    {
      path: 'outbound/models.py',
      symbol: 'PickingList / PickingList.Status',
      role: 'pending / in_progress / completed / cancelled。担当者・開始/完了日時を保持。',
      lines: [246, 316],
    },
    {
      path: 'outbound/models.py',
      symbol: 'PickingListItem / PickingListItem.Status',
      role: 'picked / short など。quantity_requested・quantity_picked・sort_order(棚番順)。',
      lines: [319, 374],
    },
  ],

  glossary: [
    { term: 'ピッキングリスト (PickingList)', desc: 'エリア単位で発行される作業指示の束。原則 1 リスト = 1 出荷指示。' },
    { term: 'ピッキング明細 (PickingListItem)', desc: 'リスト内の 1 商品行。どの棚(location)から、どの SKU を、何個取るか。' },
    { term: '出荷指示 (OutboundOrder)', desc: '顧客への出荷の元指示。エリアごとに複数のピッキングリストへ分割されることがある。' },
    { term: 'picked_at', desc: '明細を確定した日時。NULL = 未ピッキング。再入場時に「続きから」を判定する目印。' },
    { term: 'short（欠品）', desc: '実ピッキング数が指示数に満たない状態。欠品数 = 指示数 − 実数。' },
    { term: 'sort_order', desc: '明細の並び順。棚番順にして倉庫内の歩行距離を最短化する。' },
    { term: 'select_for_update', desc: '取得した行に DB ロックをかけ、他の作業者の同時更新を防ぐ（排他制御）。' },
    { term: 'transaction.atomic', desc: '一連の DB 操作を「全部成功 or 全部取消」にまとめる仕組み。中途半端な状態を防ぐ。' },
    { term: 'picking_wait / inspection_wait', desc: '出荷指示の進行ステータス。ピッキング待ち → 検品待ち。' },
    { term: 'handheld', desc: 'ハンディ端末向けの画面群。作業者ロールはこの系統のみアクセスできる。' },
  ],

  notes: [
    '権限: LoginRequiredMixin。ハンディ作業者ロール（worker1）はこの handheld 系のみアクセス可（HandheldOnlyMiddleware.ALLOWED_PREFIXES）。',
    'ハンディ/PC 出し分け: これは handheld 専用テンプレート（a/outbound/handheld/picking_work.html）。PC 業務画面とは別系統。',
    '中断耐性: 1明細ごとに即時コミットするため、途中で端末が落ちても picked_at 済み明細は再入場時にスキップされ「続きから」できる。',
    '排他制御: post 系は transaction.atomic + select_for_update(of=self) でリスト行をロック。別担当者の同時作業や二重完了を防ぐ。',
    '在庫は動かさない: ピッキングは「棚から取った実績」の記録のみ。在庫の減算は後工程の出荷検品で行う設計。',
    '欠品(short): 実数が指示数に満たない場合も確定でき、欠品数 = 指示数 − 実数 として後工程・帳票に伝播する。',
  ],
}

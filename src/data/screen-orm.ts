// 「画面から探す」用の静的データ。
// WMS（~/projects/wms/）の実コード（views.py / models.py）を読んで人手で整理したもの。
// 内容は固定なので、表示のたびに Claude API を呼ぶ必要はない（API は手入力の SQL→ORM 変換だけ）。
// 元コードが変わったらここを更新する。

export interface ScreenColumn {
  name: string
  desc: string
}
export interface ScreenTable {
  /** 実テーブル名（models の Meta.db_table）。 */
  name: string
  /** 対応する Django モデル名。 */
  model: string
  columns: ScreenColumn[]
}
export interface ScreenQuery {
  purpose: string
  orm: string
  sql: string
}
export interface ScreenOrm {
  name: string
  label: string
  /** どの WMS コードを基に整理したか。 */
  source: string
  queries: ScreenQuery[]
  tables: ScreenTable[]
}

// よく出るテーブル定義は使い回す（複数画面で同じ表に触れるため）。
const T_PICKING_LISTS: ScreenTable = {
  name: 'picking_lists',
  model: 'PickingList',
  columns: [
    { name: 'id', desc: '主キー' },
    { name: 'picking_list_code', desc: 'ピッキングリスト番号（PL-YYYYMMDD-NNN）' },
    { name: 'warehouse_id', desc: '倉庫（FK）' },
    { name: 'area_id', desc: '対象エリア（FK）' },
    { name: 'status', desc: 'pending / in_progress / completed / cancelled' },
    { name: 'assigned_to_id', desc: '担当作業者（FK）' },
    { name: 'started_at', desc: '開始日時' },
    { name: 'completed_at', desc: '完了日時' },
  ],
}
const T_PICKING_LIST_ITEMS: ScreenTable = {
  name: 'picking_list_items',
  model: 'PickingListItem',
  columns: [
    { name: 'id', desc: '主キー' },
    { name: 'picking_list_id', desc: '所属リスト（FK）' },
    { name: 'outbound_order_item_id', desc: '元の出荷指示明細（FK）' },
    { name: 'location_id', desc: 'ピッキング元ロケーション（FK）' },
    { name: 'sku_id', desc: 'SKU（FK）' },
    { name: 'quantity_requested', desc: '指示数量' },
    { name: 'quantity_picked', desc: '実ピッキング数' },
    { name: 'status', desc: 'pending / picking / picked / short' },
    { name: 'picked_at', desc: '確定日時（NULL=未ピッキング）' },
    { name: 'sort_order', desc: '棚番順の並び' },
  ],
}
const T_OUTBOUND_ORDERS: ScreenTable = {
  name: 'outbound_orders',
  model: 'OutboundOrder',
  columns: [
    { name: 'id', desc: '主キー' },
    { name: 'outbound_order_code', desc: '出荷指示番号' },
    { name: 'warehouse_id', desc: '倉庫（FK）' },
    { name: 'customer_id', desc: '顧客（FK）' },
    { name: 'status', desc: '出荷指示の進行ステータス（picking_wait / inspection_wait / shipped 等）' },
    { name: 'shipped_at', desc: '出荷日時' },
  ],
}
const T_OUTBOUND_ORDER_ITEMS: ScreenTable = {
  name: 'outbound_order_items',
  model: 'OutboundOrderItem',
  columns: [
    { name: 'id', desc: '主キー' },
    { name: 'outbound_order_id', desc: '所属する出荷指示（FK）' },
    { name: 'sku_id', desc: 'SKU（FK）' },
    { name: 'location_id', desc: 'ロケーション（FK）' },
    { name: 'quantity_ordered', desc: '指示数量' },
    { name: 'quantity_shipped', desc: '実出荷数' },
    { name: 'inspected_at', desc: '検品完了日時' },
  ],
}
const T_SKUS: ScreenTable = {
  name: 'skus',
  model: 'Sku',
  columns: [
    { name: 'id', desc: '主キー' },
    { name: 'sku_code', desc: 'SKU コード' },
    { name: 'jan_code', desc: 'JAN コード' },
    { name: 'product_id', desc: '商品（FK）' },
  ],
}
const T_PRODUCTS: ScreenTable = {
  name: 'products',
  model: 'Product',
  columns: [
    { name: 'id', desc: '主キー' },
    { name: 'product_code', desc: '商品コード' },
    { name: 'product_name', desc: '商品名' },
    { name: 'category_id', desc: 'カテゴリ（FK）' },
  ],
}
const T_LOCATIONS: ScreenTable = {
  name: 'locations',
  model: 'Location',
  columns: [
    { name: 'id', desc: '主キー' },
    { name: 'location_code', desc: 'ロケーション（棚番）コード' },
    { name: 'area_id', desc: 'エリア（FK）' },
    { name: 'warehouse_id', desc: '倉庫（FK）' },
  ],
}

export const screenOrmData: ScreenOrm[] = [
  // ───────────────────────── ピッキング受付（入口） ─────────────────────────
  {
    name: 'ピッキング受付',
    label: 'ピッキング作業（入口・対象リスト一覧・ハンディ）',
    source: 'outbound/views.py: OutboundPickingView',
    queries: [
      {
        purpose: 'スキャンしたリスト番号でピッキングリストを1件取得（倉庫・エリア・担当者も結合）',
        orm: `PickingList.objects
  .select_related('warehouse', 'area', 'assigned_to')
  .filter(picking_list_code=code)
  .first()`,
        sql: `SELECT pl.*
FROM picking_lists pl
LEFT JOIN warehouses w ON pl.warehouse_id = w.id
LEFT JOIN areas a ON pl.area_id = a.id
WHERE pl.picking_list_code = %s
LIMIT 1;`,
      },
      {
        purpose: 'そのリストの明細を棚番順に取得（SKU・商品・ロケーションを結合＝N+1回避）',
        orm: `picking_list.items
  .select_related('sku__product', 'location')
  .order_by('sort_order')`,
        sql: `SELECT pli.*
FROM picking_list_items pli
JOIN skus s ON pli.sku_id = s.id
JOIN products p ON s.product_id = p.id
JOIN locations l ON pli.location_id = l.id
WHERE pli.picking_list_id = %s
ORDER BY pli.sort_order;`,
      },
      {
        purpose: '「ピッキング開始」: 対象リスト行を排他ロックして取得（同時開始を防ぐ）',
        orm: `PickingList.objects
  .select_for_update(of=('self',))
  .filter(pk=list_id)
  .first()`,
        sql: `SELECT * FROM picking_lists
WHERE id = %s
LIMIT 1
FOR UPDATE OF picking_lists;`,
      },
      {
        purpose: '担当者を自分にして作業中へ更新（保存）',
        orm: `picking_list.assigned_to = request.user
picking_list.status = PickingList.Status.IN_PROGRESS
picking_list.save()`,
        sql: `UPDATE picking_lists
SET assigned_to_id = %s,
    status = 'in_progress',
    started_at = %s
WHERE id = %s;`,
      },
    ],
    tables: [T_PICKING_LISTS, T_PICKING_LIST_ITEMS, T_SKUS, T_PRODUCTS, T_LOCATIONS],
  },

  // ───────────────────────── ピッキング作業 ─────────────────────────
  {
    name: 'ピッキング作業',
    label: 'ピッキング作業（実ピッキング数の登録・ハンディ）',
    source: 'outbound/views.py: OutboundPickingWorkView / OutboundPickingItemView',
    queries: [
      {
        purpose: '作業対象の明細を棚番順に取得（未ピッキングのみ画面に出す）',
        orm: `picking_list.items
  .select_related('sku__product', 'location')
  .order_by('sort_order')`,
        sql: `SELECT pli.*
FROM picking_list_items pli
JOIN skus s ON pli.sku_id = s.id
JOIN products p ON s.product_id = p.id
JOIN locations l ON pli.location_id = l.id
WHERE pli.picking_list_id = %s
ORDER BY pli.sort_order;`,
      },
      {
        purpose: '1明細の即時確定（実数・状態・担当者・確定日時を保存）',
        orm: `item.quantity_picked = picked
item.status = (
  PickingListItem.Status.PICKED
  if picked >= item.quantity_requested
  else PickingListItem.Status.SHORT
)
item.picked_by = request.user
item.picked_at = now
item.save()`,
        sql: `UPDATE picking_list_items
SET quantity_picked = %s,
    status = %s,            -- 'picked' or 'short'
    picked_by_id = %s,
    picked_at = %s
WHERE id = %s;`,
      },
      {
        purpose: 'まだ確定していない明細が残っているか数える（0なら全完了）',
        orm: `picking_list.items
  .filter(picked_at__isnull=True)
  .count()`,
        sql: `SELECT COUNT(*)
FROM picking_list_items
WHERE picking_list_id = %s
  AND picked_at IS NULL;`,
      },
      {
        purpose: '同じ出荷指示に未完了のリストが残っていないか判定（指示を次工程へ進める前）',
        orm: `PickingList.objects.filter(
  items__outbound_order_item__outbound_order=order,
  status__in=[
    PickingList.Status.PENDING,
    PickingList.Status.IN_PROGRESS,
  ],
).exists()`,
        sql: `SELECT 1
FROM picking_lists pl
JOIN picking_list_items pli ON pli.picking_list_id = pl.id
JOIN outbound_order_items ooi ON pli.outbound_order_item_id = ooi.id
WHERE ooi.outbound_order_id = %s
  AND pl.status IN ('pending', 'in_progress')
LIMIT 1;`,
      },
    ],
    tables: [T_PICKING_LISTS, T_PICKING_LIST_ITEMS, T_OUTBOUND_ORDER_ITEMS, T_OUTBOUND_ORDERS],
  },

  // ───────────────────────── 出荷検品 ─────────────────────────
  {
    name: '出荷検品',
    label: '出荷検品（検品・梱包・ハンディ）',
    source: 'outbound/views.py: OutboundInspectionView / OutboundInspectionWorkView',
    queries: [
      {
        purpose: 'スキャンした出荷指示番号で指示を1件取得（倉庫・顧客を結合）',
        orm: `OutboundOrder.objects
  .select_related('warehouse', 'customer')
  .filter(outbound_order_code=code)
  .first()`,
        sql: `SELECT oo.*
FROM outbound_orders oo
LEFT JOIN warehouses w ON oo.warehouse_id = w.id
LEFT JOIN customers c ON oo.customer_id = c.id
WHERE oo.outbound_order_code = %s
LIMIT 1;`,
      },
      {
        purpose: 'その指示の出荷実績(Shipment)を取得（作業中の担当者も結合）',
        orm: `Shipment.objects
  .select_related('in_progress_by')
  .filter(outbound_order=order)
  .first()`,
        sql: `SELECT sh.*
FROM shipments sh
WHERE sh.outbound_order_id = %s
LIMIT 1;`,
      },
      {
        purpose: '「検品開始」: 出荷実績(Shipment)を新規作成',
        orm: `Shipment.objects.create(
  shipment_code=Shipment.next_code(today),
  outbound_order=order,
  status=Shipment.Status.INSPECTING,
  created_by=request.user,
)`,
        sql: `INSERT INTO shipments
  (shipment_code, outbound_order_id, status, created_by_id, created_at, updated_at)
VALUES (%s, %s, 'inspecting', %s, %s, %s);`,
      },
      {
        purpose: '各明細のピッキング実績数を取得（検品の初期値に使う）',
        orm: `PickingListItem.objects
  .filter(outbound_order_item__outbound_order=order)
  .values('outbound_order_item_id', 'quantity_picked')`,
        sql: `SELECT pli.outbound_order_item_id, pli.quantity_picked
FROM picking_list_items pli
JOIN outbound_order_items ooi ON pli.outbound_order_item_id = ooi.id
WHERE ooi.outbound_order_id = %s;`,
      },
    ],
    tables: [
      T_OUTBOUND_ORDERS,
      T_OUTBOUND_ORDER_ITEMS,
      {
        name: 'shipments',
        model: 'Shipment',
        columns: [
          { name: 'id', desc: '主キー' },
          { name: 'shipment_code', desc: '出荷番号' },
          { name: 'outbound_order_id', desc: '対象の出荷指示（1対1）' },
          { name: 'status', desc: 'inspecting / shipped 等' },
          { name: 'in_progress_by_id', desc: '検品作業中の担当者（FK・作業ロック）' },
          { name: 'in_progress_at', desc: '作業開始日時' },
        ],
      },
      {
        name: 'shipment_items',
        model: 'ShipmentItem',
        columns: [
          { name: 'id', desc: '主キー' },
          { name: 'shipment_id', desc: '所属する出荷実績（FK）' },
          { name: 'outbound_order_item_id', desc: '元の出荷指示明細（FK）' },
          { name: 'sku_id', desc: 'SKU（FK）' },
          { name: 'quantity_shipped', desc: '出荷数量' },
          { name: 'stock_movement_id', desc: '在庫移動(OUT)との紐付け（FK）' },
        ],
      },
      T_PICKING_LIST_ITEMS,
    ],
  },

  // ───────────────────────── 在庫照会 ─────────────────────────
  {
    name: '在庫照会',
    label: '在庫照会（PC）',
    source: 'stock/views.py: StockInquiryView',
    queries: [
      {
        purpose: '在庫を取得し、ロケーション・SKU・商品・カテゴリまで一括結合（N+1回避）',
        orm: `StockBalance.objects.select_related(
  'location',
  'location__area',
  'sku',
  'sku__product',
  'sku__product__category',
)`,
        sql: `SELECT sb.*
FROM stock_balances sb
JOIN locations l ON sb.location_id = l.id
JOIN areas a ON l.area_id = a.id
JOIN skus s ON sb.sku_id = s.id
JOIN products p ON s.product_id = p.id
LEFT JOIN categories c ON p.category_id = c.id;`,
      },
      {
        purpose: 'SKUコードまたはJANコードで在庫を検索（部分一致）',
        orm: `qs.filter(
  Q(sku__sku_code__icontains=q)
  | Q(sku__jan_code__icontains=q)
)`,
        sql: `SELECT sb.*
FROM stock_balances sb
JOIN skus s ON sb.sku_id = s.id
WHERE s.sku_code LIKE '%' || %s || '%'
   OR s.jan_code LIKE '%' || %s || '%';`,
      },
      {
        purpose: 'SKU×ロケーション単位の「引き当て済み数」を集計（出荷予約の合計）',
        orm: `StockReservation.objects
  .filter(
    location=OuterRef('location'),
    sku=OuterRef('sku'),
    status=StockReservation.Status.ACTIVE,
  )
  .values('location', 'sku')
  .annotate(total=Sum('quantity'))
  .values('total')`,
        sql: `SELECT COALESCE(SUM(sr.quantity), 0)
FROM stock_reservations sr
WHERE sr.location_id = sb.location_id
  AND sr.sku_id = sb.sku_id
  AND sr.status = 'active'
GROUP BY sr.location_id, sr.sku_id;`,
      },
      {
        purpose: '検索結果全体の集計（件数・在庫合計・SKU数・在庫切れ件数など）',
        orm: `qs.aggregate(
  rows=Count('id'),
  total_qty=Sum('quantity'),
  sku_count=Count('sku', distinct=True),
  zero=Count('id', filter=Q(quantity=0)),
)`,
        sql: `SELECT
  COUNT(sb.id)                                  AS rows,
  SUM(sb.quantity)                              AS total_qty,
  COUNT(DISTINCT sb.sku_id)                     AS sku_count,
  COUNT(CASE WHEN sb.quantity = 0 THEN 1 END)   AS zero
FROM stock_balances sb;`,
      },
    ],
    tables: [
      {
        name: 'stock_balances',
        model: 'StockBalance',
        columns: [
          { name: 'id', desc: '主キー' },
          { name: 'location_id', desc: 'ロケーション（FK）' },
          { name: 'sku_id', desc: 'SKU（FK）' },
          { name: 'quantity', desc: '現在の在庫数' },
          { name: 'updated_at', desc: '最終更新日時' },
        ],
      },
      {
        name: 'stock_reservations',
        model: 'StockReservation',
        columns: [
          { name: 'id', desc: '主キー' },
          { name: 'location_id', desc: 'ロケーション（FK）' },
          { name: 'sku_id', desc: 'SKU（FK）' },
          { name: 'quantity', desc: '引き当て数量' },
          { name: 'status', desc: 'active 等' },
        ],
      },
      T_LOCATIONS,
      T_SKUS,
      T_PRODUCTS,
    ],
  },
]

export const screenOrmList = screenOrmData.map((s) => ({ name: s.name, label: s.label }))

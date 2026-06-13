// 問題集で題材にする WMS テーブルの「早見表」データ。
// テーブル名（db_table）・ORM モデル名・主なカラムを示す。実モデルに合わせている。
// （在庫・出荷まわりの主要テーブルに絞っている。仮の補助としても使えるよう簡潔に）

export interface SchemaColumn {
  name: string
  note?: string
}
export interface SchemaTable {
  table: string // DB のテーブル名
  model: string // Django のモデル名
  columns: SchemaColumn[]
}

export const wmsSchema: SchemaTable[] = [
  {
    table: 'stock_balances',
    model: 'StockBalance',
    columns: [
      { name: 'id' },
      { name: 'location_id', note: '→ locations（FK）' },
      { name: 'sku_id', note: '→ skus（FK）' },
      { name: 'quantity', note: '在庫数' },
      { name: 'first_received_at' },
      { name: 'created_at' },
      { name: 'updated_at' },
    ],
  },
  {
    table: 'picking_lists',
    model: 'PickingList',
    columns: [
      { name: 'id' },
      { name: 'picking_list_code' },
      { name: 'warehouse_id', note: '→ warehouses（FK）' },
      { name: 'area_id', note: '→ areas（FK）' },
      { name: 'status', note: 'pending / in_progress / completed / cancelled' },
      { name: 'assigned_to_id', note: '→ users（FK・null可）' },
      { name: 'started_at', note: 'null可' },
      { name: 'created_at' },
    ],
  },
  {
    table: 'picking_list_items',
    model: 'PickingListItem',
    columns: [
      { name: 'id' },
      { name: 'picking_list_id', note: '→ picking_lists（FK・related_name="items"）' },
      { name: 'sku_id', note: '→ skus（FK）' },
      { name: 'location_id', note: '→ locations（FK）' },
      { name: 'quantity_requested', note: '指示数量' },
      { name: 'quantity_picked', note: '実績数量' },
      { name: 'status' },
      { name: 'picked_at', note: '完了日時・null可' },
    ],
  },
  {
    table: 'stock_reservations',
    model: 'StockReservation',
    columns: [
      { name: 'id' },
      { name: 'location_id', note: '→ locations（FK）' },
      { name: 'sku_id', note: '→ skus（FK）' },
      { name: 'quantity', note: '引き当て数' },
      { name: 'status', note: 'active など' },
      { name: 'order_id', note: '→ outbound_orders（FK・related_name="reservations"）' },
      { name: 'expires_at', note: 'null可' },
    ],
  },
  {
    table: 'outbound_orders',
    model: 'OutboundOrder',
    columns: [
      { name: 'id' },
      { name: 'outbound_order_code' },
      { name: 'warehouse_id', note: '→ warehouses（FK）' },
      { name: 'customer_id', note: '→ customers（FK・null可）' },
      { name: 'status' },
      { name: 'shipped_at', note: '出荷日時・null可' },
      { name: 'created_at' },
    ],
  },
  {
    table: 'outbound_order_items',
    model: 'OutboundOrderItem',
    columns: [
      { name: 'id' },
      { name: 'outbound_order_id', note: '→ outbound_orders（FK・related_name="items"）' },
      { name: 'sku_id', note: '→ skus（FK）' },
      { name: 'quantity_ordered', note: '指示数量' },
      { name: 'quantity_shipped', note: '実出荷数' },
    ],
  },
  {
    table: 'skus',
    model: 'Sku',
    columns: [
      { name: 'id' },
      { name: 'product_id', note: '→ products（FK）' },
      { name: 'sku_code' },
      { name: 'jan_code' },
      { name: 'size_info' },
      { name: 'color_info' },
      { name: 'is_active' },
    ],
  },
  {
    table: 'products',
    model: 'Product',
    columns: [
      { name: 'id' },
      { name: 'product_code' },
      { name: 'product_name' },
      { name: 'category_id', note: '→ categories（FK）' },
      { name: 'manufacturer_id', note: '→ manufacturers（FK・null可）' },
      { name: 'is_active' },
    ],
  },
  {
    table: 'categories',
    model: 'Category',
    columns: [
      { name: 'id' },
      { name: 'category_code' },
      { name: 'category_name' },
      { name: 'parent_id', note: '→ categories（自己参照・related_name="children"）' },
      { name: 'sort_order' },
      { name: 'is_leaf' },
    ],
  },
  {
    table: 'locations',
    model: 'Location',
    columns: [
      { name: 'id' },
      { name: 'warehouse_id', note: '→ warehouses（FK）' },
      { name: 'area_id', note: '→ areas（FK）' },
      { name: 'location_code' },
      { name: 'is_active' },
    ],
  },
  {
    table: 'warehouses',
    model: 'Warehouse',
    columns: [
      { name: 'id' },
      { name: 'warehouse_code' },
      { name: 'warehouse_name' },
      { name: 'is_active' },
    ],
  },
  {
    table: 'stock_movements',
    model: 'StockMovement',
    columns: [
      { name: 'id' },
      { name: 'movement_type', note: 'IN / OUT / ADJ など' },
      { name: 'location_id', note: '→ locations（FK）' },
      { name: 'sku_id', note: '→ skus（FK）' },
      { name: 'quantity' },
      { name: 'quantity_before' },
      { name: 'quantity_after' },
      { name: 'moved_at' },
    ],
  },
]

// 「ToDo アプリ実践」編の型定義。
// 章フォーマット（本文 → コード例 → 表 → 図 → 注意囲み）は「React 大全」とまったく同じなので、
// 型も描画コンポーネント（ReactBookChapter）もそのまま再利用する。
// ここでは分かりやすい別名（TodoChapter など）として再エクスポートするだけ。
export type {
  ReactChapter as TodoChapter,
  ReactSection as TodoSection,
  ReactExample as TodoExample,
  ReactTable as TodoTable,
} from '../react-book/types'

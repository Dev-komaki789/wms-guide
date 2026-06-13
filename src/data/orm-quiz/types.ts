// 「Django ORM 問題集」の型定義。
// 1問は「問題文 → 答え（ORM ＋ SQL の2カラム）→ 使われている技術のやさしい解説」。
// 題材は ORM 大全と同じ WMS の実モデル（StockBalance / PickingList など）で統一。

/** 1問。 */
export interface OrmProblem {
  /** 問題文（やりたいこと）。 */
  question: string
  /** ヒント（省略可）。答えを開く前に見せる。 */
  hint?: string
  /** 答えの ORM コード（左に表示）。 */
  orm: string
  /** 生成される SQL（右に表示）。 */
  sql: string
  /** 使われている技術のやさしい解説（1要素＝1段落）。 */
  explanation: string[]
  /** この問題で使った技術のキーワード（省略可・タグ表示）。 */
  points?: string[]
}

/** 問題セット（章にあたるまとまり）。 */
export interface OrmQuizSet {
  /** URL スラッグ（例: 'basics'）。 */
  id: string
  /** セット番号（1〜）。 */
  num: number
  title: string
  /** 難易度ラベル（例: '入門' / '初級' / '中級'）。 */
  level?: string
  /** セットの一行サマリ。 */
  summary: string
  /** セットの導入（任意・複数段落）。 */
  intro?: string[]
  problems: OrmProblem[]
}

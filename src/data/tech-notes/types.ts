// 「WMS 技術メモ」の型定義。
// WMS（~/projects/wms/）で実際に使ったライブラリ・API・実装のしくみを、
// 実コードに基づいて初心者向けに紹介する。ORM 大全と同じトーン。

/** コード例（言語ラベル付き。ORM/SQL に限らず JS・HTTP・設定なども載せる）。 */
export interface CodeExample {
  /** 言語や種類のラベル（例: 'JavaScript' / 'Python (Django)' / 'HTTP'）。 */
  label?: string
  code: string
  /** ひとこと解説。 */
  note?: string
}

export interface TechTable {
  headers: string[]
  rows: string[][]
}

export interface TechSection {
  id?: string
  heading: string
  body?: string[]
  code?: CodeExample[]
  table?: TechTable
  mermaid?: string
  callouts?: { kind: 'tip' | 'warn' | 'note'; text: string }[]
}

export interface TechNote {
  /** URL スラッグ（例: 'stack'）。 */
  id: string
  num: number
  title: string
  summary: string
  /** どの WMS コードを基にしたか（任意）。 */
  source?: string
  intro?: string[]
  sections: TechSection[]
}

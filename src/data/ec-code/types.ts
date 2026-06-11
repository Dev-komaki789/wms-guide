// 「EC コード解説」の型定義。
// React 大全で学んだ知識を使って、実際の EC サイト（React + TypeScript）のコードを読み解く。
// 各節は「実コードの抜粋（どのファイルか付き）→ やさしい解説」を基本単位にする。

/** ひとつのコード例（実コードの抜粋 ＋ どのファイルか ＋ 解説）。 */
export interface EcExample {
  /** コードの抜粋（実際の EC コードから）。 */
  code: string
  /** どのファイルの抜粋か（例: 'src/api/http.ts'）。 */
  file?: string
  /** コードの種類ラベル（省略時は 'tsx'）。 */
  lang?: string
  /** このコード例のひとこと解説（省略可）。 */
  note?: string
}

/** 比較表など。 */
export interface EcTable {
  headers: string[]
  rows: string[][]
}

/** 章の中の節（ひとつの話題）。 */
export interface EcSection {
  id?: string
  heading: string
  body?: string[]
  examples?: EcExample[]
  table?: EcTable
  /** 図（Mermaid）。 */
  mermaid?: string
  callouts?: { kind: 'tip' | 'warn' | 'note'; text: string }[]
}

/** 1章。 */
export interface EcChapter {
  id: string
  num: number
  title: string
  summary: string
  intro?: string[]
  /** この章と関係が深い「React 大全」の章（目次に出す）。 */
  relatedReact?: string[]
  sections: EcSection[]
}

// 「React 大全」（初心者向け React リファレンス）の型定義。
// 各章は「コード → 画面での見え方／動き → やさしい解説」を基本単位にする。
// 題材は EC サイトに依存しない、最小の汎用例（カウンタ・かんたんな一覧など）で統一する。
// （EC の実コードの読み解きは、別セクション「EC コード解説」で扱う）

/** ひとつのコード例（コード ＋ 見え方/出力 ＋ ひとこと解説）。 */
export interface ReactExample {
  /** コード（複数行可）。JSX/TS が中心。 */
  code: string
  /** コードの種類ラベル（例: 'tsx' / 'ts' / 'bash'）。省略時は 'tsx'。 */
  lang?: string
  /** 画面での見え方や、コンソール出力など（省略可）。 */
  result?: string
  /** このコード例のひとこと解説（省略可）。 */
  note?: string
}

/** 比較表など。 */
export interface ReactTable {
  headers: string[]
  rows: string[][]
}

/** 章の中の節（ひとつの話題）。 */
export interface ReactSection {
  /** ページ内リンク用のアンカー id（任意）。 */
  id?: string
  heading: string
  /** 解説の段落（1要素＝1段落）。 */
  body?: string[]
  /** コード例。 */
  examples?: ReactExample[]
  /** 一覧表。 */
  table?: ReactTable
  /** 図（Mermaid）。 */
  mermaid?: string
  /** 注意・ヒント・メモの囲み。 */
  callouts?: { kind: 'tip' | 'warn' | 'note'; text: string }[]
}

/** 1章。 */
export interface ReactChapter {
  /** URL スラッグ（例: 'jsx'）。 */
  id: string
  /** 章番号（1〜）。 */
  num: number
  title: string
  /** 章の一行サマリ。目次や見出し下に出す。 */
  summary: string
  /** 章の導入（任意・複数段落）。 */
  intro?: string[]
  sections: ReactSection[]
}

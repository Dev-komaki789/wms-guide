// 「Django ORM 大全」（本一冊レベルの ORM リファレンス）の型定義。
// 各章は「ORM のコード → 生成される SQL → やさしい解説」の3点セットを基本単位にする。
// 題材は WMS の実モデル（PickingList / StockBalance など）で、サイト全体と揃える。

/** ひとつのコード例（ORM ＋ 生成 SQL ＋ ひとこと解説）。 */
export interface OrmExample {
  /** Django ORM のコード（複数行可）。 */
  orm: string
  /** その ORM が生成する SQL（おおよそ）。省略可。 */
  sql?: string
  /** このコード例のひとこと解説。省略可。 */
  note?: string
}

/** 比較表（やりたいこと / ORM / SQL など）。 */
export interface OrmTable {
  headers: string[]
  rows: string[][]
}

/** 章の中の節（ひとつの話題）。 */
export interface OrmSection {
  /** ページ内リンク用のアンカー id（任意）。 */
  id?: string
  heading: string
  /** 解説の段落（1要素＝1段落）。 */
  body?: string[]
  /** コード例（ORM/SQL/解説）。 */
  examples?: OrmExample[]
  /** 一覧表。 */
  table?: OrmTable
  /** 図（Mermaid）。N+1 やリレーションの説明に使う。 */
  mermaid?: string
  /** 注意・ヒント・メモの囲み。 */
  callouts?: { kind: 'tip' | 'warn' | 'note'; text: string }[]
}

/** 1章。 */
export interface OrmChapter {
  /** URL スラッグ（例: 'basics'）。 */
  id: string
  /** 章番号（1〜）。 */
  num: number
  title: string
  /** 章の一行サマリ。目次や見出し下に出す。 */
  summary: string
  /** 章の導入（任意・複数段落）。 */
  intro?: string[]
  sections: OrmSection[]
}

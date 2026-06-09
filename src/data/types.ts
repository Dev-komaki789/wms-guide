// 画面解説（ページA）1 ページ分の「型」。PLAN.md のテンプレート 6 項目に対応する。
//
//   1. 画面名 / 用途        -> title / purpose
//   2. スクリーンショット   -> screenshot?
//   3. 表示されるデータ     -> displayedData
//   4. 処理の流れ + 図      -> flowSteps + mermaid
//   5. 関連ファイル・関数   -> relatedFiles
//   6. 補足                 -> notes

export type WmsCategory = 'マスタ' | '入荷' | '出荷' | '在庫' | 'システム'

/** 表示されるデータ 1 項目（画面に出る値とその説明）。 */
export interface DataField {
  label: string
  desc: string
}

/**
 * コードに重ねる解説コメント 1 件。WMS 本体は書き換えず、ガイド側で実コードに注釈を添える。
 * line は「ファイル内の絶対行番号」。その行の直下に解説行として差し込まれる。
 */
export interface CodeNote {
  /** 注釈を付けるファイル内の絶対行番号（1 始まり）。 */
  line: number
  /** その行の解説（平易に）。 */
  text: string
}

/** コードの該当箇所（ファイル + 行範囲）。「コードを見る」で実コードを読みに行く。 */
export interface CodeRef {
  /** ファイルパス（wms リポジトリ基準）。例: 'outbound/views.py' */
  path: string
  /** 該当行 [開始, 終了]（1 始まり・両端含む）。 */
  lines: [number, number]
  /** 行ごとの解説コメント（任意）。実コードの該当行の下に色付きで差し込む。 */
  notes?: CodeNote[]
}

/** 処理の流れの 1 ステップ（① リクエスト → … → ⑥ 画面表示）。 */
export interface FlowStep {
  /** ①②③… の通し番号。 */
  no: number
  /** 工程名（短い見出し）。例: 「URL ルーティング」 */
  title: string
  /** 何が起きるかの説明。 */
  detail: string
  /** 該当するコード位置の表示用ラベル（任意）。例: 'outbound/urls.py: OutboundPickingWorkView.get' */
  ref?: string
  /** このステップの実コード（任意）。指定すると「コードを見る」を表示する。 */
  code?: CodeRef
}

/** 用語集の 1 項目。未知の語で詰まらないようにする。 */
export interface GlossaryTerm {
  /** 用語。例: 'select_for_update' */
  term: string
  /** 短い説明。 */
  desc: string
}

/** 関連ファイル・関数の 1 行。 */
export interface RelatedFile {
  /** ファイルパス（wms リポジトリ基準）。例: 'outbound/views.py' */
  path: string
  /** クラス名・関数名など。例: 'OutboundPickingWorkView.get' */
  symbol?: string
  /** 役割の 1 行説明。 */
  role: string
  /**
   * 実コードの該当行 [開始, 終了]（1 始まり・両端含む）。
   * 指定すると「コードを見る」で dev サーバー経由（/wms-src）に ~/projects/wms/ の
   * 該当行を読みに行って表示する。コードは wms-guide に複製しない。
   */
  lines?: [number, number]
}

export interface ScreenDoc {
  /** URL に使う id（ハイフン区切り）。例: 'picking-work' */
  id: string
  category: WmsCategory
  /** 画面名。 */
  title: string
  /** 用途（1 行）。 */
  purpose: string
  /** どの端末で使うか等のタグ。例: ['ハンディ', '出荷'] */
  tags: string[]
  /** スクリーンショット（public/ 配下のパス。任意）。 */
  screenshot?: string
  /** 3. 画面に表示されるデータ。 */
  displayedData: DataField[]
  /** 4-a. 処理の流れ（番号付き）。 */
  flowSteps: FlowStep[]
  /** 4-b. Mermaid フロー図のソース（flowchart）。 */
  mermaid: string
  /** 4-c. シーケンス図（誰が誰を呼ぶか。任意。Mermaid sequenceDiagram）。 */
  sequenceMermaid?: string
  /** 4-d. 状態遷移図（ステータスの移り変わり。任意。Mermaid stateDiagram-v2）。 */
  stateMermaid?: string
  /** 5. 関連ファイル・関数。 */
  relatedFiles: RelatedFile[]
  /** 6. 用語集（任意。未知語の説明）。 */
  glossary?: GlossaryTerm[]
  /** 7. 補足（権限・ハンディ/PC 出し分け等）。 */
  notes: string[]
}

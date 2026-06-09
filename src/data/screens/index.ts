import type { ScreenDoc } from '../types'
import { pickingEntry } from './picking-entry'
import { pickingWork } from './picking-work'

// 画面解説（ページA）の登録簿。残り画面（マスタ/入荷/出荷/在庫/システムで計25前後）は
// ここに ScreenDoc を1ファイルずつ足していく。テンプレ品質はピッキング2画面で固める。
export const screens: ScreenDoc[] = [pickingWork, pickingEntry]

export const screensById: Record<string, ScreenDoc> = Object.fromEntries(
  screens.map((s) => [s.id, s]),
)

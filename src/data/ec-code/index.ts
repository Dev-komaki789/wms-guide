import type { EcChapter } from './types'
import { ch01Overview } from './ch01-overview'
import { ch02Startup } from './ch02-startup'
import { ch03Http } from './ch03-http'
import { ch04Auth } from './ch04-auth'
import { ch05Cart } from './ch05-cart'
import { ch06Products } from './ch06-products'

// 「EC コード解説」の登録。執筆済みをここに並べると目次（/ec）に出る。
export const ecChapters: EcChapter[] = [
  ch01Overview,
  ch02Startup,
  ch03Http,
  ch04Auth,
  ch05Cart,
  ch06Products,
]

// 全体の予定目次（未執筆は「準備中」表示）。
export interface EcOutlineEntry {
  num: number
  title: string
}
export const ecOutline: EcOutlineEntry[] = [
  { num: 1, title: '全体像 ― ディレクトリ構成とデータの流れ' },
  { num: 2, title: 'アプリの起動 ― Provider の入れ子と Router' },
  { num: 3, title: 'API 通信の共通化 ― apiFetch と自動トークン更新' },
  { num: 4, title: '認証のしくみ ― AuthContext と tokenStore' },
  { num: 5, title: 'カートのしくみ ― CartContext とトースト通知' },
  { num: 6, title: '商品一覧 ― データ取得・ページング・URL に状態を持たせる' },
  { num: 7, title: '部品いろいろ ― ProductCard / 価格表示 / 共通スタイル' },
  { num: 8, title: '商品詳細 ― バリエーション選択と在庫取得' },
  { num: 9, title: 'ログイン〜注文の流れ ― フォーム・useNavigate・確定' },
  { num: 10, title: '型定義の読み方 ― api/types.ts とサーバーの対応' },
]

export function getEcChapter(id: string): EcChapter | undefined {
  return ecChapters.find((c) => c.id === id)
}

/** 目次・ナビ用の軽い一覧（執筆済みのみ）。 */
export const ecChapterListNav = ecChapters.map((c) => ({ id: c.id, num: c.num, title: c.title }))

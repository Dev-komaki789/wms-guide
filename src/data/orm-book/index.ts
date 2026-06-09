import type { OrmChapter } from './types'
import { ch01Basics } from './ch01-basics'
import { ch02Fetching } from './ch02-fetching'
import { ch03Filtering } from './ch03-filtering'
import { ch04QandF } from './ch04-q-and-f'
import { ch05Shaping } from './ch05-shaping'
import { ch06Relations } from './ch06-relations'
import { ch07Aggregation } from './ch07-aggregation'

// 「Django ORM 大全」の章レジストリ。
// 執筆済みの章をここに登録すると、目次（/orm）とサイドバーに自動で並ぶ。
export const ormChapters: OrmChapter[] = [
  ch01Basics,
  ch02Fetching,
  ch03Filtering,
  ch04QandF,
  ch05Shaping,
  ch06Relations,
  ch07Aggregation,
  // 第8章以降はここに追加していく。
]

// 本全体の予定目次（章番号と題）。未執筆の章は目次に「準備中」として薄く表示する。
export interface OutlineEntry {
  num: number
  title: string
}
export const ormOutline: OutlineEntry[] = [
  { num: 1, title: '基礎 ― ORM と QuerySet のしくみ' },
  { num: 2, title: '取り出す ― all / get / first / exists / count' },
  { num: 3, title: '絞り込み ― filter / exclude とフィールドルックアップ大全' },
  { num: 4, title: '論理と式 ― Q オブジェクトと F オブジェクト' },
  { num: 5, title: '並べ替え・整形 ― order_by / スライス / values / only・defer' },
  { num: 6, title: 'リレーション ― __ で関連をまたぐ / select_related / prefetch_related / N+1' },
  { num: 7, title: '集計 ― aggregate と annotate（GROUP BY）' },
  { num: 8, title: '高度なクエリ ― Subquery / OuterRef / Exists / 関数' },
  { num: 9, title: '書き込み ― create / save / update / get_or_create / delete' },
  { num: 10, title: 'トランザクションとロック ― atomic / select_for_update' },
  { num: 11, title: '落とし穴と性能 ― count vs len / exists / 余計な評価' },
  { num: 12, title: 'WMS 実例で総復習 ― 画面のクエリを読み解く' },
]

export function getChapter(id: string): OrmChapter | undefined {
  return ormChapters.find((c) => c.id === id)
}

/** 目次・ナビ用の軽い一覧（執筆済みのみ）。 */
export const ormChapterList = ormChapters.map((c) => ({ id: c.id, num: c.num, title: c.title }))

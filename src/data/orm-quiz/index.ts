import type { OrmQuizSet } from './types'
import { set01Basics } from './set01-basics'
import { set02LogicRelations } from './set02-logic-relations'
import { set03RelationsNplus1 } from './set03-relations-nplus1'
import { set04Aggregation } from './set04-aggregation'
import { set05Advanced } from './set05-advanced'
import { set06Writing } from './set06-writing'

// 「Django ORM 問題集」の登録。執筆済みをここに並べると目次（/orm-quiz）に出る。
export const ormQuizSets: OrmQuizSet[] = [
  set01Basics,
  set02LogicRelations,
  set03RelationsNplus1,
  set04Aggregation,
  set05Advanced,
  set06Writing,
]

// 全体の予定目次（未執筆は「準備中」表示）。
export interface OrmQuizOutlineEntry {
  num: number
  title: string
}
export const ormQuizOutline: OrmQuizOutlineEntry[] = [
  { num: 1, title: '基礎 ― 取り出す・絞り込む' },
  { num: 2, title: '論理と関連をまたぐ ― Q / exclude / __ / in / F' },
  { num: 3, title: 'リレーションと N+1 ― select_related / prefetch_related' },
  { num: 4, title: '集計 ― aggregate / annotate / Sum / Count' },
  { num: 5, title: '高度なクエリ ― Subquery / Case・When / 日付集計 / Window' },
  { num: 6, title: '書き込みとトランザクション ― create / update / bulk / atomic' },
]

export function getQuizSet(id: string): OrmQuizSet | undefined {
  return ormQuizSets.find((s) => s.id === id)
}

/** ナビ用の軽い一覧（執筆済みのみ）。 */
export const ormQuizListNav = ormQuizSets.map((s) => ({ id: s.id, num: s.num, title: s.title }))

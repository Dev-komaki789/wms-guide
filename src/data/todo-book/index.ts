import type { TodoChapter } from './types'
import { ch01Overview } from './ch01-overview'
import { ch02Setup } from './ch02-setup'
import { ch03Jsx } from './ch03-jsx'
import { ch04Components } from './ch04-components'
import { ch05Input } from './ch05-input'
import { ch06Add } from './ch06-add'
import { ch07Complete } from './ch07-complete'
import { ch08BackDelete } from './ch08-back-delete'
import { ch09Styling } from './ch09-styling'
import { ch10ReactComplete } from './ch10-react-complete'
import { ch11TypeScript } from './ch11-typescript'
import { ch12TypeScriptComplete } from './ch12-typescript-complete'

// 「ToDo アプリ実践」編の章レジストリ。
// 執筆済みの章をここに登録すると、目次（/todo）とサイドバーに自動で並ぶ。
export const todoChapters: TodoChapter[] = [
  ch01Overview,
  ch02Setup,
  ch03Jsx,
  ch04Components,
  ch05Input,
  ch06Add,
  ch07Complete,
  ch08BackDelete,
  ch09Styling,
  ch10ReactComplete,
  ch11TypeScript,
  ch12TypeScriptComplete,
]

// 本全体の予定目次（章番号と題）。未執筆の章は目次に「準備中」として薄く表示する。
export interface TodoOutlineEntry {
  num: number
  title: string
}
export const todoOutline: TodoOutlineEntry[] = [
  { num: 1, title: '作るものを知る ― 完成イメージと、素のJavaScript版との違い' },
  { num: 2, title: '開発環境を用意する ― Vite で React プロジェクトを作る' },
  { num: 3, title: 'JSX とコンポーネントの基本 ― 画面を関数で書く' },
  { num: 4, title: '画面を部品に分ける ― コンポーネント設計と props' },
  { num: 5, title: '入力欄を React 流に ― useState で文字を管理' },
  { num: 6, title: 'タスクを追加する ― 配列の state と map で一覧表示' },
  { num: 7, title: '完了・未完了を切り替える ― 1つの配列で2つのリストを表す' },
  { num: 8, title: '「戻す」と「削除」を作る' },
  { num: 9, title: '見た目を整える ― styles.css を当てる' },
  { num: 10, title: 'React 版・完成 ― 全コードと素のJS版との対応' },
  { num: 11, title: 'TypeScript にする ― なぜ型？／Todo の型／state の型' },
  { num: 12, title: 'TypeScript 版・完成コードと次の一歩' },
]

export function getTodoChapter(id: string): TodoChapter | undefined {
  return todoChapters.find((c) => c.id === id)
}

/** 目次・ナビ用の軽い一覧（執筆済みのみ）。 */
export const todoChapterList = todoChapters.map((c) => ({ id: c.id, num: c.num, title: c.title }))

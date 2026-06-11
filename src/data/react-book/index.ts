import type { ReactChapter } from './types'
import { ch01Jsx } from './ch01-jsx'
import { ch02Props } from './ch02-props'
import { ch03ListKey } from './ch03-list-key'
import { ch04Conditional } from './ch04-conditional'
import { ch05UseState } from './ch05-usestate'
import { ch06Events } from './ch06-events'

// 「React 大全」の章レジストリ。
// 執筆済みの章をここに登録すると、目次（/react）に自動で並ぶ。
export const reactChapters: ReactChapter[] = [
  ch01Jsx,
  ch02Props,
  ch03ListKey,
  ch04Conditional,
  ch05UseState,
  ch06Events,
]

// 本全体の予定目次（章番号と題）。未執筆の章は目次に「準備中」として薄く表示する。
export interface ReactOutlineEntry {
  num: number
  title: string
}
export const reactOutline: ReactOutlineEntry[] = [
  { num: 1, title: 'React とは？ ― コンポーネントと JSX' },
  { num: 2, title: 'props ― 部品に値をわたす' },
  { num: 3, title: 'リストと key ― map でくり返し表示する' },
  { num: 4, title: '条件で出し分ける ― && / 三項演算子 / 早期 return' },
  { num: 5, title: 'useState ― 画面が変わる「状態」を持つ' },
  { num: 6, title: 'イベントとフォーム ― onClick / onChange で操作を受け取る' },
  { num: 7, title: 'useEffect ― 外の世界とのやりとり（取得・後片付け）' },
  { num: 8, title: 'ルーティング ― 複数ページを切り替える（react-router）' },
  { num: 9, title: 'Context ― 遠くの部品へ値を届ける' },
  { num: 10, title: 'カスタムフック ― ロジックを部品から切り出す' },
  { num: 11, title: 'API 通信 ― サーバーとデータをやりとりする（fetch / async）' },
  { num: 12, title: 'TypeScript の基礎 ― 型でまちがいを防ぐ' },
  { num: 13, title: 'useRef ― 再描画させずに値や DOM を持つ' },
  { num: 14, title: 'useMemo・useReducer ― 重い計算と複雑な状態' },
  { num: 15, title: '再レンダリングと最適化 ― memo と「なぜ無駄に描き直すのか」' },
]

export function getReactChapter(id: string): ReactChapter | undefined {
  return reactChapters.find((c) => c.id === id)
}

/** 目次・ナビ用の軽い一覧（執筆済みのみ）。 */
export const reactChapterList = reactChapters.map((c) => ({ id: c.id, num: c.num, title: c.title }))

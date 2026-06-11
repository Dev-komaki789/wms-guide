import type { ReactChapter } from './types'

// 第14章「useMemo・useReducer ― 重い計算と複雑な状態」。プログラミング初心者向け。
export const ch14UseMemoUseReducer: ReactChapter = {
  id: 'usememo-usereducer',
  num: 14,
  title: 'useMemo・useReducer ― 重い計算と複雑な状態',
  summary: '計算結果を覚えておいてムダな再計算を避ける useMemo と、入り組んだ状態の更新を整理する useReducer。どちらも「必要になったら使う」道具です。useReducer のカウンタは実際に動かして確かめます。',
  intro: [
    'この章は、すぐ毎回使うものではないけれど、知っておくと困ったときに助かる2つのフックです。',
    'useMemo は「重い計算をムダにやり直さない」ための道具、useReducer は「複雑な状態更新を1か所に整理する」ための道具です。順に見ていきましょう。',
  ],
  sections: [
    {
      id: 'usememo',
      heading: '14-1. useMemo ― 計算結果を覚えておく',
      body: [
        '部品は再レンダリングのたびに、中の計算を最初からやり直します。ふつうは一瞬ですが、「1万件の並べ替え」のような重い計算だと、毎回やると遅くなります。',
        'useMemo(() => 計算, [依存]) は、計算結果を覚えておき、依存配列が変わったときだけ計算し直します。useEffect と似た「依存配列」の考え方です。',
      ],
      examples: [
        {
          code: `import { useMemo } from 'react'\n\nfunction ProductList({ products, keyword }) {\n  // products か keyword が変わったときだけ絞り込みをやり直す\n  const filtered = useMemo(() => {\n    return products.filter((p) => p.name.includes(keyword))\n  }, [products, keyword])\n\n  return <ul>{filtered.map((p) => <li key={p.id}>{p.name}</li>)}</ul>\n}`,
          note: 'keyword と関係ない別の state が変わって再描画されても、filtered は前回の結果を使い回します。重い計算のときだけ効果があります。',
        },
      ],
      callouts: [
        {
          kind: 'warn',
          text: '何でも useMemo で包むのは逆効果。覚えておくこと自体にもコストがあり、軽い計算ならかえって遅く・読みにくくなります。「実際に重くて困ってから」使うのが鉄則です。',
        },
      ],
    },
    {
      id: 'usereducer-why',
      heading: '14-2. useReducer ― 複雑な状態を1か所にまとめる',
      body: [
        'useState がいくつも増え、更新の仕方も「増やす・減らす・リセット・追加・削除…」と複雑になってくると、あちこちに setXxx が散らばって追いにくくなります。',
        'useReducer は「状態の更新ルールを1つの関数（reducer）にまとめる」しくみです。部品の側は「何をしたいか（action）」を伝えるだけ。どう変えるかは reducer が一手に引き受けます。',
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：reducer（リデューサー）＝「今の状態」と「やりたいこと（action）」を受け取り、「次の状態」を返す関数。dispatch（ディスパッチ）＝「この action をやって」と reducer に伝える命令。',
        },
      ],
    },
    {
      id: 'usereducer-live',
      heading: '14-3. 動く例 ― カウンタを useReducer で',
      body: [
        '同じカウンタを useReducer で書くと下のようになります。更新の種類（+1・−1・リセット）が reducer に集約され、ボタンは dispatch で「やりたいこと」を伝えるだけです。実際に動かせます。',
      ],
      examples: [
        {
          code: `// 状態の更新ルールを1か所に集約\nfunction reducer(state, action) {\n  switch (action.type) {\n    case 'increment': return { count: state.count + 1 }\n    case 'decrement': return { count: state.count - 1 }\n    case 'reset':     return { count: 0 }\n    default:          return state\n  }\n}\n\nfunction Counter() {\n  const [state, dispatch] = useReducer(reducer, { count: 0 })\n  return (\n    <div>\n      <p>カウント: {state.count}</p>\n      <button onClick={() => dispatch({ type: 'decrement' })}>-1</button>\n      <button onClick={() => dispatch({ type: 'increment' })}>+1</button>\n      <button onClick={() => dispatch({ type: 'reset' })}>リセット</button>\n    </div>\n  )\n}`,
          live: true,
          mount: '<Counter />',
          note: 'ボタンは dispatch({ type: \'increment\' }) のように「やりたいこと」を送るだけ。実際の更新ロジックは reducer の中だけにある＝見通しが良いのが利点です。',
        },
      ],
    },
    {
      id: 'when',
      heading: '14-4. useState と useReducer の使い分け',
      body: [
        'どちらを使うべきか迷ったら、次を目安にしてください。多くの場合は useState で十分で、複雑になってきたら useReducer に“引っ越す”という流れが自然です。',
      ],
      table: {
        headers: ['状況', 'おすすめ'],
        rows: [
          ['単純な値（数値・文字・真偽）', 'useState'],
          ['更新の種類が少ない', 'useState'],
          ['状態が複数の項目で関連し合う', 'useReducer'],
          ['更新パターンが多い（追加/削除/編集…）', 'useReducer'],
        ],
      },
      callouts: [
        {
          kind: 'tip',
          text: 'useReducer の reducer は「今の状態を直接いじらず、新しい状態を返す」のが約束（第5章の state 更新と同じ）。だからテストもしやすく、更新の流れを追いやすくなります。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '14-5. この章のまとめ',
      body: [
        'useMemo は重い計算結果を覚えておき、依存配列が変わったときだけ計算し直す。ただし「実際に重くて困ってから」使う（むやみに包まない）。',
        'useReducer は状態の更新ルールを reducer 関数に集約し、部品は dispatch で「やりたいこと（action）」を送るだけにする。状態が複雑になってきたら useState から引っ越す。',
        '最終章では、これまで何度も出てきた「再レンダリング」を正面から扱い、アプリを軽く保つための考え方（memo と、なぜ無駄に描き直すのか）を学びます。',
      ],
    },
  ],
}

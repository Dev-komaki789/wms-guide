import type { ReactChapter } from './types'

// 第18章「state 設計 ― 持ち上げ・派生state・useEffect を使わない場面」。プログラミング初心者向け。
export const ch18StateDesign: ReactChapter = {
  id: 'state-design',
  num: 18,
  title: 'state 設計 ― 状態をどこに置くか・派生state・useEffect を使わない場面',
  summary: 'バグの多くは「状態の持ち方」が原因です。状態をどこに置くか（持ち上げ）、計算で出せる値は state にしない（派生state）、そして初心者が多用しがちな useEffect を“使わない”判断を学びます。',
  intro: [
    'ここまでで道具はそろいました。この章は道具の使い方ではなく「考え方」――状態（state）をどう設計するか、です。地味ですが、ここを押さえるとバグがぐっと減ります。',
    '合言葉は「状態はできるだけ少なく、できるだけ近くに、計算で出せるものは持たない」。順に見ていきます。',
  ],
  sections: [
    {
      id: 'lifting',
      heading: '18-1. 状態の持ち上げ ― 兄弟で共有したいとき',
      body: [
        '「2つの部品が同じ値を共有したい」ことがあります。たとえば入力欄と、その入力を使う表示。このとき、状態をそれぞれの部品に持たせると食い違います。',
        '正解は、状態を共通の親に置き、子へは props で配り、変更は子からコールバック（第6章）で親に伝える。これを状態の持ち上げ（lifting state up）と呼びます。「共有したい状態は、共有したい部品たちの“いちばん近い共通の親”に置く」が原則です。',
      ],
      examples: [
        {
          code: `function Parent() {\n  const [text, setText] = useState('')   // 共有する状態は親に\n  return (\n    <div>\n      <SearchInput value={text} onChange={setText} />\n      <Preview text={text} />\n    </div>\n  )\n}\n\nfunction SearchInput({ value, onChange }) {\n  return <input value={value} onChange={(e) => onChange(e.target.value)} />\n}\nfunction Preview({ text }) {\n  return <p>入力中: {text}</p>\n}`,
          note: 'text は親が持ち、SearchInput には value と onChange を、Preview には text を渡す。2つの部品が必ず同じ値を見ます。「どこに置くか迷ったら、使う部品たちの共通の親」。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: '親が大きくなりすぎ、遠い部品まで配るのが大変になったら、第9章の Context の出番です。「近い共有は持ち上げ、広い共有は Context」と覚えましょう。',
        },
      ],
    },
    {
      id: 'derived',
      heading: '18-2. 派生state ― 計算で出せる値は state にしない',
      body: [
        '初心者がやりがちなのが「他の state から計算できる値を、わざわざ別の state に持つ」ことです。これは2つの値がズレる原因になります。計算で出せるものは、描画のたびに計算すればよく、state にしてはいけません。',
        '下の例では「合計」を state に持たず、りんご数とみかん数からその場で計算しています。ボタンを押すと合計が常に正しく追従します。',
      ],
      examples: [
        {
          code: `function Cart() {\n  const [apple, setApple] = useState(2)\n  const [orange, setOrange] = useState(3)\n  const total = apple + orange   // ← 派生。state にしない\n\n  return (\n    <div>\n      <p>りんご: <button onClick={() => setApple(apple + 1)}>{apple} 個</button></p>\n      <p>みかん: <button onClick={() => setOrange(orange + 1)}>{orange} 個</button></p>\n      <p>合計: {total} 個</p>\n    </div>\n  )\n}`,
          live: true,
          mount: '<Cart />',
          note: 'もし total も useState で持つと、apple を増やしたとき total の更新を忘れてズレます。計算で出せる値は「持たずに、描画のたびに計算」。重い計算のときだけ第14章の useMemo を使えば十分です。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: '判断のコツ：「この値は、他の値から計算で出せる？」→ 出せるなら state にしない。state は“元になる最小限の事実”だけに絞ると、バグが激減します。',
        },
      ],
    },
    {
      id: 'no-effect',
      heading: '18-3. 「useEffect を使わない方がいい場面」',
      body: [
        'useEffect（第7章）は強力ですが、初心者は何でも useEffect に入れがちです。実は「useEffect でやろうとしているけど、実は要らない」ケースが多くあります。useEffect は基本「画面の外（通信・タイマー・購読）とつなぐとき」だけに使います。',
        '代表的な“要らない”パターンを表にまとめます。',
      ],
      table: {
        headers: ['やりがちな useEffect', '実は…'],
        rows: [
          ['props/state から別の state を作って同期', '派生（18-2）で計算すればよい。state 不要'],
          ['ボタンが押された“後”の処理を effect で', 'イベントハンドラ（onClick）の中に直接書けばよい'],
          ['入力に応じて effect で別 state を更新', '描画時に計算すればよい'],
          ['データ取得（通信）', 'これは useEffect の正しい用途（または取得ライブラリ）'],
        ],
      },
      examples: [
        {
          code: `// ❌ useEffect で「合計」を同期しようとする（不要・ズレる元）\nconst [total, setTotal] = useState(0)\nuseEffect(() => {\n  setTotal(apple + orange)\n}, [apple, orange])\n\n// ✅ ただ計算するだけ（18-2 の派生state）\nconst total = apple + orange`,
          note: '上は「effect → setState → 再描画」と遠回りで、一瞬古い値が見えることもあります。下は素直で速く、ズレません。「effect を書く前に、計算やイベントで済まないか？」と一度考えるのがコツです。',
        },
      ],
      callouts: [
        {
          kind: 'warn',
          text: 'useEffect を使う前のチェック：①計算で出せないか（派生state）②イベントの中で済まないか。どちらでもなく「外の世界とのやりとり（通信・タイマー・購読）」のときだけ useEffect、と覚えておくと健全です。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '18-4. この章のまとめ',
      body: [
        '共有したい状態は「使う部品たちの共通の親」に置く（持ち上げ）。広く共有するなら Context。state は“元になる最小限の事実”だけに絞る。',
        '他の値から計算できるもの（合計・絞り込み結果など）は state にせず、描画のたびに計算する（派生state）。useEffect は「外の世界とつなぐとき」専用。計算・イベントで済むなら使わない。',
        '次の章では、これと関係の深い「key とコンポーネントの同一性」――なぜ key を変えると state がリセットされるのか――を学びます。',
      ],
    },
  ],
}

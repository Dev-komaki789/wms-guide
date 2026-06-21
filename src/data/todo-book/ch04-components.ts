import type { TodoChapter } from './types'

// 第4章「画面を部品に分ける ― コンポーネント設計と props」。
export const ch04Components: TodoChapter = {
  id: 'components',
  num: 4,
  title: '画面を部品に分ける ― コンポーネント設計と props',
  summary:
    'TODO アプリを「入力欄」「リスト」「1件の行」といった小さな部品に分けて考えます。部品にデータを渡すしくみ props（プロップス）も、ここで体験しておきましょう。',
  intro: [
    '前章の TodoApp は1つの関数に全部入っていました。アプリが育つと、これでは長くなりすぎて読みづらくなります。React の強みは「部品に分けて組み合わせられる」こと。まずは分け方の考え方を持っておきましょう。',
    'この本では最終的に1ファイル（App.jsx）にまとめて進めますが、「ここは TodoItem という部品」と頭の中で分けておくと、コードの見通しがぐっと良くなります。',
  ],
  sections: [
    {
      id: 'tree',
      heading: '4-1. 画面を部品に分解する',
      body: [
        'TODO アプリを部品に分けると、だいたい下の図のようになります。一番外側が TodoApp、その中に「入力エリア」と「2つのリスト」、リストの中に「1件ぶんの行（TodoItem）」がくり返し並びます。',
        'こう分けて考えると、「追加の処理は TodoApp が持つ」「1件の見た目は TodoItem が持つ」と役割がはっきりします。',
      ],
      mermaid: `flowchart TD
  App["TodoApp（全体・データを持つ）"] --> Input["入力エリア"]
  App --> InList["未完了リスト"]
  App --> CoList["完了リスト"]
  InList --> Item1["TodoItem（1件の行）"]
  InList --> Item2["TodoItem（1件の行）"]
  CoList --> Item3["TodoItem（1件の行）"]`,
    },
    {
      id: 'props',
      heading: '4-2. props ― 部品に値をわたす',
      body: [
        '部品には外から値を渡せます。これを props（プロップス）と言います。関数の引数だと思えば OK。呼ぶ側が <TodoItem text="牛乳を買う" /> と書くと、TodoItem の中では props.text で "牛乳を買う" を受け取れます。',
        'よく使う書き方として、引数のところで { text } と「分割代入」して受け取ると、props. を毎回書かずに済みます。',
      ],
      examples: [
        {
          code: `// 1件ぶんの行。text という props を受け取って表示する
function TodoItem({ text }) {
  return (
    <li className="list-row">
      <p className="todo-item">{text}</p>
      <button>完了</button>
      <button>削除</button>
    </li>
  )
}

// 呼ぶ側：text にわたした文字が、それぞれの行に出る
function Demo() {
  return (
    <ul>
      <TodoItem text="牛乳を買う" />
      <TodoItem text="部屋を片づける" />
    </ul>
  )
}`,
          live: true,
          mount: '<Demo />',
          note: '同じ TodoItem を、わたす text を変えて何度も使い回せます。これが「部品にする」うまみです。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'function TodoItem({ text }) の { } は、props オブジェクトから text だけ取り出す書き方（分割代入）。function TodoItem(props) と受けて props.text と書いても同じ意味です。',
        },
      ],
    },
    {
      id: 'readonly',
      heading: '4-3. props は「上から下へ・読み取り専用」',
      body: [
        'props はいつも「親 → 子」の一方通行で流れます。子は受け取った props を表示には使えますが、勝手に書きかえてはいけません（読み取り専用）。',
        'では「完了ボタンを押したら状態を変えたい」ときはどうする？――答えは「データは親（TodoApp）が持ち、変える処理も親が用意し、それを props として子に渡す」。このパターンは第8章で実際に使います。いまは「データは上に集める」とだけ覚えておけば十分です。',
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'この本では読みやすさを優先して、最終的に TodoApp 1つにまとめて書きます。それでも「ここは行の部品」「ここは入力の部品」と意識して読むと、どこに何が書いてあるか迷いません。',
        },
      ],
    },
  ],
}

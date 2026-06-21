import type { TodoChapter } from './types'

// 第6章「タスクを追加する ― 配列の state と map で一覧表示」。
export const ch06Add: TodoChapter = {
  id: 'add',
  num: 6,
  title: 'タスクを追加する ― 配列の state と map で一覧表示',
  summary:
    'タスクを「配列」として状態に持ち、「追加」ボタンで1件足し、map でリストとして並べます。素の JS の createElement / appendChild が、たった数行に置きかわります。',
  intro: [
    '前章で入力値を持てました。今度は「追加」を押したら、その文字をタスク一覧に加えます。一覧は配列の状態として持ちます。',
    'ポイントは2つ。「配列に1件足すときは新しい配列を作る」ことと、「配列を map で JSX のリストに変換する」ことです。',
  ],
  sections: [
    {
      id: 'array-state',
      heading: '6-1. タスクの配列を状態に持つ',
      body: [
        '入力中の文字 text とは別に、ためたタスクの配列 todos を用意します。最初は空配列 [] です。',
        'この本では、タスク1件を「ただの文字」ではなく { id, text, done } というオブジェクトにします。id は1件を見分ける番号、text は内容、done は「完了したか」の true/false。done は次章で使いますが、最初から入れておきます。',
      ],
      examples: [
        {
          code: `const [todos, setTodos] = useState([])  // 例: [{ id: 1, text: '牛乳を買う', done: false }]
const [text, setText] = useState('')     // 入力中の文字（前章）`,
          note: 'todos が「ためたタスクの配列」、text が「いま入力欄に書いている文字」。2つの状態を別々に持ちます。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'なぜ id を持つ？ あとで「この1件を完了にする／消す」と指定するときに、見分ける目印が要るからです。今回は手軽に Date.now()（その時刻のミリ秒）を id にします。',
        },
      ],
    },
    {
      id: 'add',
      heading: '6-2. 「追加」で配列に1件足す',
      body: [
        '「追加」ボタンの onClick で addTodo を呼びます。中では「空なら何もしない」「新しいタスクを作って配列に足す」「入力欄を空に戻す」の3つをやります。',
        '大事なのは setTodos([...todos, newTodo]) の形。todos.push(...) のように元の配列を直接いじってはいけません。[...todos, newTodo] で「今の中身を全部コピーして、最後に1件足した“新しい”配列」を作り、それを set します。',
      ],
      examples: [
        {
          code: `const addTodo = () => {
  if (text.trim() === '') return            // 空白だけなら追加しない
  const newTodo = { id: Date.now(), text: text, done: false }
  setTodos([...todos, newTodo])             // 新しい配列を作って set
  setText('')                                // 入力欄を空に戻す
}`,
          note: 'text.trim() === "" は「空白を除くと空かどうか」。{ id, text, done } の text: text は { text } と短く書けますが、ここでは分かりやすさのため明示しています。',
        },
      ],
      callouts: [
        {
          kind: 'warn',
          text: 'todos.push(newTodo) はダメ。元の配列を直接いじると React は変化に気づかず、画面が更新されません。必ず [...todos, newTodo] で「新しい配列を作って」set してください。',
        },
      ],
    },
    {
      id: 'map',
      heading: '6-3. map で配列を一覧に変換する',
      body: [
        '配列を画面のリストにするには map を使います。todos.map((todo) => <li>…</li>) と書くと、1件ごとに <li> を作り、JSX のリストにしてくれます。素の JS で createElement と appendChild をループで回していた処理が、これ1つに収まります。',
        'くり返しで作る要素には key を付けます。key={todo.id} のように、1件を見分けられる値を渡します。React が「どれがどれか」を追うための目印で、付けないと警告が出ます。',
      ],
      examples: [
        {
          code: `<ul>
  {todos.map((todo) => (
    <li key={todo.id} className="list-row">
      <p className="todo-item">{todo.text}</p>
    </li>
  ))}
</ul>`,
          note: 'key には「並び順（index）」ではなく、変わらない id を使うのがおすすめ。理由は並べ替え・削除で取り違えが起きにくいからです。',
        },
      ],
    },
    {
      id: 'together',
      heading: '6-4. つなげて動かす',
      body: [
        'ここまでを1つの TodoApp にまとめます。まだ「完了」「削除」はありませんが、入力して「追加」すると一覧に積み上がるところまで動きます。実際に試してみましょう。',
      ],
      examples: [
        {
          code: `import { useState } from 'react'

function TodoApp() {
  const [todos, setTodos] = useState([])
  const [text, setText] = useState('')

  const addTodo = () => {
    if (text.trim() === '') return
    setTodos([...todos, { id: Date.now(), text: text, done: false }])
    setText('')
  }

  return (
    <div className="todo-app">
      <div className="input-area">
        <input
          placeholder="タスクを入力してください"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={addTodo}>追加</button>
      </div>

      <div className="incomplete-area">
        <p className="title">未完了のTODO</p>
        <ul>
          {todos.map((todo) => (
            <li key={todo.id} className="list-row">
              <p className="todo-item">{todo.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}`,
          live: true,
          mount: '<TodoApp />',
          note: '入力して「追加」を何度か押してみてください。タスクが積み上がります。次章で「完了」「未完了」の2つのリストに振り分けます。',
        },
      ],
    },
  ],
}

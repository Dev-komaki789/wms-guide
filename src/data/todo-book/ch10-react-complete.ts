import type { TodoChapter } from './types'

// 第10章「React 版・完成 ― 全コードと素のJS版との対応」。
export const ch10ReactComplete: TodoChapter = {
  id: 'react-complete',
  num: 10,
  title: 'React 版・完成 ― 全コードと素のJS版との対応',
  summary:
    'React 版 TODO アプリの完成です。App.jsx の全コードをまとめ、素の JavaScript 版とどう対応するかを並べて振り返ります。ここまでの流れが一枚絵でつながります。',
  intro: [
    'おめでとうございます。これで React 版 TODO アプリが完成しました。この章では App.jsx の全コードをまとめて掲載し、素の JS 版との対応を確認します。',
    'コードを上から読み、「状態 → 操作 → 表示」の3ブロックで組み立てられていることを味わってください。',
  ],
  sections: [
    {
      id: 'full',
      heading: '10-1. App.jsx 全コード',
      body: [
        'これが完成形の App.jsx です。前章の styles.css を import すれば、見た目も含めて完成です。コメントで「状態」「操作」「表示」の区切りを入れてあります。',
      ],
      examples: [
        {
          code: `import { useState } from 'react'
import './styles.css'

function TodoApp() {
  // --- 状態（あとから変わるデータ）---
  const [todos, setTodos] = useState([])   // 1件 = { id, text, done }
  const [text, setText] = useState('')     // 入力中の文字

  // --- 操作（状態の変えかた）---
  const addTodo = () => {
    if (text.trim() === '') return
    setTodos([...todos, { id: Date.now(), text: text, done: false }])
    setText('')
  }
  const toggleDone = (id) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }
  const deleteTodo = (id) => {
    setTodos(todos.filter((t) => t.id !== id))
  }

  // --- 表示用に、状態から2つのリストを作り出す ---
  const incomplete = todos.filter((t) => !t.done)
  const complete = todos.filter((t) => t.done)

  // --- 画面（状態の写し鏡）---
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
          {incomplete.map((todo) => (
            <li key={todo.id} className="list-row">
              <p className="todo-item">{todo.text}</p>
              <button onClick={() => toggleDone(todo.id)}>完了</button>
              <button onClick={() => deleteTodo(todo.id)}>削除</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="complete-area">
        <p className="title">完了のTODO</p>
        <ul>
          {complete.map((todo) => (
            <li key={todo.id} className="list-row">
              <p className="todo-item">{todo.text}</p>
              <button onClick={() => toggleDone(todo.id)}>戻す</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default TodoApp`,
          live: true,
          mount: '<TodoApp />',
          note: '最後の export default TodoApp は「この部品を、ほかのファイル（main.jsx）から使えるようにする」宣言。これで main.jsx の import App from "./App.jsx" とつながります。',
        },
      ],
    },
    {
      id: 'mapping',
      heading: '10-2. 素の JavaScript 版との対応',
      body: [
        '同じ動きを、素の JS 版と React 版で並べます。「DOM をどう操作するか」だった処理が、すべて「状態をどう変えるか」に置きかわっているのが分かります。',
      ],
      table: {
        headers: ['やること', '素の JavaScript', 'React'],
        rows: [
          ['入力値を読む', 'getElementById(...).value', '状態 text（value と onChange）'],
          ['追加', 'createElement + appendChild', 'setTodos([...todos, 新])'],
          ['完了/戻す', '要素を別リストへ移動', 'toggleDone（done を反転）'],
          ['削除', 'removeChild', 'setTodos(filter で1件のぞく)'],
          ['一覧の描画', 'ループで createElement', 'todos.map(...) '],
          ['未完了/完了の区別', '要素がどのリストにあるか', 'done で filter して作り分け'],
        ],
      },
    },
    {
      id: 'lessons',
      heading: '10-3. 振り返り ― React の考え方',
      body: [
        '今回つかんだ要点を整理します。①あとから変わる値は useState で「状態」として持つ。②画面は状態の写し鏡で、状態を変えれば自動で描き直される。③配列やオブジェクトは直接いじらず「新しく作って」set する。',
        '④同じ情報は2か所に持たず、1つの正しいデータ（todos）から filter で派生させる。⑤くり返し表示は map ＋ key。この5つが、これからどんな React アプリを作るときも効いてきます。',
      ],
      callouts: [
        {
          kind: 'tip',
          text: '次のステップに挑むなら：リロードしても消えないよう localStorage に保存する、編集機能を足す、「すべて完了」ボタンを付ける、など。どれも「状態をどう持ち・どう変えるか」を考えるよい練習です。',
        },
      ],
    },
    {
      id: 'next',
      heading: '10-4. 次は TypeScript 版へ',
      body: [
        'ここまでが JavaScript 版の完成です。次の第11章からは、同じアプリを TypeScript（型つき）で書き直します。「型をつけると何がうれしいのか」を、この完成コードを土台に体験しましょう。',
      ],
    },
  ],
}

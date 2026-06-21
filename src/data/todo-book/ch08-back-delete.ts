import type { TodoChapter } from './types'

// 第8章「『戻す』と『削除』を作る」。
export const ch08BackDelete: TodoChapter = {
  id: 'back-delete',
  num: 8,
  title: '「戻す」と「削除」を作る',
  summary:
    '残りの操作、「戻す」と「削除」を仕上げます。「戻す」は前章の done 反転をそのまま使えます。「削除」は filter で「その1件を除いた新しい配列」を作るだけ。これで全機能がそろいます。',
  intro: [
    '前章で「完了」まで動きました。この章で「戻す」と「削除」を足して、TODO アプリの機能を完成させます。',
    '素の JS では removeChild で DOM から要素を取り去り、「戻す」では完了側の要素を作り直して未完了側へ移していました。React ではどちらも「配列をどう変えるか」を書くだけです。',
  ],
  sections: [
    {
      id: 'back',
      heading: '8-1. 「戻す」は done を戻すだけ',
      body: [
        '「戻す」は「完了→未完了」、つまり done を true から false にすること。これは前章の toggleDone（done を反転）がそのまま使えます。完了リストのボタンから同じ toggleDone(todo.id) を呼べば、未完了に戻ります。',
        'わざわざ専用の関数を作らなくてよいのが、状態で考えることのうまみです。「完了」と「戻す」は、見た目のラベルが違うだけで、やっていることは同じ「印の反転」です。',
      ],
      examples: [
        {
          code: `// 完了リスト側のボタン。呼ぶのは「完了」と同じ toggleDone
<button onClick={() => toggleDone(todo.id)}>戻す</button>`,
          note: '「完了」ボタンも「戻す」ボタンも中身は toggleDone。done が false なら true に、true なら false に変わるので、1つの関数で両方こなせます。',
        },
      ],
    },
    {
      id: 'delete',
      heading: '8-2. 「削除」は filter で1件のぞく',
      body: [
        '「削除」は「その id 以外を残す」と考えます。filter で「id が一致しないものだけ集めた新しい配列」を作り、set します。消したい1件が、結果の配列から自然に消えます。',
        'ここでも元の配列は直接いじりません。filter は新しい配列を返すので、そのまま setTodos に渡せます。',
      ],
      examples: [
        {
          code: `const deleteTodo = (id) => {
  setTodos(todos.filter((todo) => todo.id !== id))  // id が違うものだけ残す
}`,
          note: 'todo.id !== id は「この id ではない」。条件に合うものだけ残るので、指定した1件だけが消えます。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: '今回は元の素の JS 版に合わせ、削除ボタンは未完了リストだけに置きます。完了リストにも付けたければ、同じ <button onClick={() => deleteTodo(todo.id)}>削除</button> を足すだけです。',
        },
      ],
    },
    {
      id: 'recap-handlers',
      heading: '8-3. 3つの操作を見くらべる',
      body: [
        '追加・切り替え・削除の3つは、どれも「新しい配列を作って set する」点で同じです。元の配列を直接いじらないのが共通ルール。違いは「どう作るか」だけです。',
      ],
      table: {
        headers: ['操作', '使う道具', 'やること'],
        rows: [
          ['追加', '[...todos, 新]', '今の中身＋1件の新しい配列'],
          ['完了/戻す', 'map + 三項', '一致する1件だけ done を反転'],
          ['削除', 'filter', '一致しない1件を除いた配列'],
        ],
      },
      callouts: [
        {
          kind: 'tip',
          text: 'map は「件数そのまま・中身を作り替える」、filter は「条件で件数を減らす」、スプレッド [...] は「コピーして足す」。配列の状態更新はこの3つでほぼ足ります。',
        },
      ],
    },
    {
      id: 'done',
      heading: '8-4. 全機能がそろった',
      body: [
        'これで追加・完了・戻す・削除がすべて動きます。下のプレビューは前章に「削除」を足したものです。一通りさわって、思った通り動くか確かめてください。',
        '機能は完成です。次の第9章で見た目（CSS）を整え、第10章で全コードをまとめて振り返ります。',
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
  const toggleDone = (id) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }
  const deleteTodo = (id) => {
    setTodos(todos.filter((t) => t.id !== id))
  }

  const incomplete = todos.filter((t) => !t.done)
  const complete = todos.filter((t) => t.done)

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
}`,
          live: true,
          mount: '<TodoApp />',
          note: '追加 → 完了 → 戻す → 削除、ぜんぶ動きます。素の JS 版と同じ動きを、DOM 操作なしで実現できました。',
        },
      ],
    },
  ],
}

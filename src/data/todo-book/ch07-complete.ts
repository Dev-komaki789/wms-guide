import type { TodoChapter } from './types'

// 第7章「完了・未完了を切り替える ― 1つの配列で2つのリストを表す」。
export const ch07Complete: TodoChapter = {
  id: 'complete',
  num: 7,
  title: '完了・未完了を切り替える ― 1つの配列で2つのリストを表す',
  summary:
    '素の JS では「要素を別のリストへ移動」させていました。React では発想を変え、各タスクの done を切り替えるだけ。2つのリストは1つの配列から「絞り込んで作り出す」のがコツです。',
  intro: [
    'いよいよ TODO アプリらしさの中心、「完了」と「未完了」の切り替えです。ここが、素の JS と React でいちばん考え方が変わるところです。',
    '素の JS は「li を未完了リストから完了リストへ moveTarget で移動」していました。React では要素を動かしません。データ（done）を変えるだけで、画面が勝手に追いついてきます。',
  ],
  sections: [
    {
      id: 'idea',
      heading: '7-1. 発想の転換：「移動」ではなく「印を変える」',
      body: [
        '各タスクは { id, text, done } を持っています。done が false なら未完了、true なら完了。つまり「完了にする」＝「そのタスクの done を true にする」だけ。リスト間の移動は要りません。',
        'そして画面の2つのリストは、todos を done で絞り込んで作り出します。未完了リスト＝done が false のもの、完了リスト＝done が true のもの。元データは1つ、表示は2つ、です。',
      ],
      mermaid: `flowchart LR
  T["todos（1つの配列・各件に done を持つ）"] -->|"done が false"| I["未完了リスト"]
  T -->|"done が true"| C["完了リスト"]`,
    },
    {
      id: 'derive',
      heading: '7-2. 2つのリストを「絞り込んで」作る',
      body: [
        'filter を使って、todos から2つのリストを作ります。filter は「条件に合う要素だけ集めた新しい配列」を返します。',
        'これらは状態ではありません。todos から毎回その場で計算して作るだけ。todos が変われば、この2つも自動で計算し直されます（これを「派生した値」と言います）。',
      ],
      examples: [
        {
          code: `const incomplete = todos.filter((todo) => !todo.done)  // 未完了（done が false）
const complete = todos.filter((todo) => todo.done)     // 完了（done が true）`,
          note: '!todo.done は「done が false なら true」。わざわざ完了用の状態を別に持たないのがポイント。元の todos だけが「ただ1つの正しいデータ」です。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: '「同じ情報を2か所に持たない」が状態設計のコツ。完了リストを別の状態にすると、追加・削除のたびに両方を合わせる必要が出てバグの元。1つの todos から絞り込めば、ズレようがありません。',
        },
      ],
    },
    {
      id: 'toggle',
      heading: '7-3. 「完了」ボタンで done を切り替える',
      body: [
        '「完了」ボタンを押したら、そのタスクの done を反転させます。配列の中の1件だけを変えるには map を使い、「id が一致する1件は done を反転、それ以外はそのまま」を新しい配列として作ります。',
        'ここでも元の配列は直接いじりません。{ ...todo, done: !todo.done } で「そのタスクをコピーして done だけ反転した新しいオブジェクト」を作り、map で差し替えます。',
      ],
      examples: [
        {
          code: `const toggleDone = (id) => {
  setTodos(
    todos.map((todo) =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    )
  )
}`,
          note: '三項演算子 条件 ? A : B は「条件が真なら A、偽なら B」。ここでは「id が一致する1件だけ done を反転、ほかは元のまま」。完了→未完了の「戻す」も、同じ反転で実現できます（次章）。',
        },
      ],
    },
    {
      id: 'together',
      heading: '7-4. つなげて動かす',
      body: [
        '追加（前章）＋ 完了の切り替えをまとめます。未完了リストの「完了」を押すと完了リストへ、完了リストの「戻す」を押すと未完了へ。どちらも同じ toggleDone を呼ぶだけです。',
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
          note: 'onClick={() => toggleDone(todo.id)} のように、矢印関数で包んで「押されたときに、その id で呼ぶ」とします。toggleDone(todo.id) と直に書くと、描画した瞬間に実行されてしまうので注意。残るは「削除」だけです。',
        },
      ],
    },
  ],
}

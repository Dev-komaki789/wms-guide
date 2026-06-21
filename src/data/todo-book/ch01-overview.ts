import type { TodoChapter } from './types'

// 第1章「作るものを知る ― 完成イメージと、素のJavaScript版との違い」。
export const ch01Overview: TodoChapter = {
  id: 'overview',
  num: 1,
  title: '作るものを知る ― 完成イメージと、素のJavaScript版との違い',
  summary:
    'これから「TODO アプリ」を React で一から作ります。まずは完成形をさわってみて、同じものを素の JavaScript で書いた場合と「考え方がどう変わるのか」をつかみましょう。',
  intro: [
    'この本では、よくある練習課題「TODO アプリ」を題材に、React の作り方を一歩ずつ追っていきます。プログラミングがはじめての人でも追えるよう、1章ごとに「ひとつだけ新しいこと」を足していきます。',
    'いきなりコードを書く前に、この章では「何を作るのか（完成形）」と「素の JavaScript（DOM 操作）で書くのと、React で書くのは何が違うのか」を見ておきます。ここが分かると、あとの章がずっと楽になります。',
  ],
  sections: [
    {
      id: 'goal',
      heading: '1-1. 完成形をさわってみる',
      body: [
        'まずは完成品です。下の「実際の表示」で動かせます。入力欄にタスクを書いて「追加」すると未完了リストに並び、「完了」を押すと完了リストへ移動、「戻す」で戻り、「削除」で消えます。',
        'コードはまだ読めなくて大丈夫です。「こういうものを作るんだな」というゴールだけ持っておきましょう。この同じアプリを、第2章から順に組み立てていきます。',
      ],
      examples: [
        {
          code: `import { useState } from 'react'

function TodoApp() {
  const [todos, setTodos] = useState([])   // 1件 = { id, text, done }
  const [text, setText] = useState('')

  const addTodo = () => {
    if (text.trim() === '') return
    setTodos([...todos, { id: Date.now(), text, done: false }])
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
          {incomplete.map((t) => (
            <li key={t.id} className="list-row">
              <p className="todo-item">{t.text}</p>
              <button onClick={() => toggleDone(t.id)}>完了</button>
              <button onClick={() => deleteTodo(t.id)}>削除</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="complete-area">
        <p className="title">完了のTODO</p>
        <ul>
          {complete.map((t) => (
            <li key={t.id} className="list-row">
              <p className="todo-item">{t.text}</p>
              <button onClick={() => toggleDone(t.id)}>戻す</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}`,
          live: true,
          mount: '<TodoApp />',
          note: 'これが完成形です。第2章から、この中身を少しずつ作っていきます。今はさわって遊ぶだけで OK。',
        },
      ],
    },
    {
      id: 'plain-js',
      heading: '1-2. 素の JavaScript だとどう書く？',
      body: [
        '同じアプリは、ライブラリを使わない「素の JavaScript」でも書けます。その場合は、ボタンが押されるたびに自分で HTML の要素（DOM）を作って、付けたり消したり並べ替えたりします。',
        '下は「追加」処理の一部です。createElement で li や button を手作りし、appendChild でリストにぶら下げる――この「手作業の DOM 操作」が、素の JS 版の中心になります。',
      ],
      examples: [
        {
          code: `// 素の JavaScript（DOM を自分で組み立てる）
const onClickAdd = () => {
  const inputText = document.getElementById("add-text").value
  document.getElementById("add-text").value = ""
  createInCompleteTodo(inputText)
}

const createInCompleteTodo = (todo) => {
  const li = document.createElement("li")
  const div = document.createElement("div")
  div.className = "list-row"
  const p = document.createElement("p")
  p.innerText = todo
  const completeButton = document.createElement("button")
  completeButton.innerText = "完了"
  // …「完了」「削除」ボタンを作って、addEventListener で動きを付けて…
  div.appendChild(p)
  div.appendChild(completeButton)
  li.appendChild(div)
  document.getElementById("incomplete-list").appendChild(li)
}`,
          lang: 'js',
          note: '「完了」を押したら DOM の要素を別のリストへ moveTarget で移動させ、「削除」では removeChild で消す…という具合に、画面そのものを直接いじります。手順が増えるほど、どこで何を触ったか追いづらくなります。',
        },
      ],
    },
    {
      id: 'diff',
      heading: '1-3. React は「手順」ではなく「状態」を書く',
      body: [
        '素の JS は「どう画面を変えるか（手順）」を細かく書きます。これを命令的（めいれいてき）と言います。一方 React は「いまデータがこうなら、画面はこう見える」という対応だけを書きます。これを宣言的（せんげんてき）と言います。',
        'TODO アプリで言えば、React では「タスクの配列（データ）」さえ持っておけば、画面はそれを映した鏡になります。タスクを1件足したいときは、DOM をいじるのではなく「配列に1件足す」だけ。あとは React が画面を描き直してくれます。',
      ],
      mermaid: `flowchart LR
  subgraph PlainJS["素の JS（命令的）"]
    A1["ボタンが押された"] --> A2["li を作る"] --> A3["button を作る"] --> A4["appendChild で並べる"]
  end
  subgraph React["React（宣言的）"]
    B1["データ（配列）を変える"] --> B2["React が画面を<br/>自動で描き直す"]
  end`,
      table: {
        headers: ['観点', '素の JavaScript', 'React'],
        rows: [
          ['書くこと', '画面を変える手順', 'データと「その見え方」'],
          ['追加', 'createElement / appendChild', '配列に1件足す'],
          ['完了/戻す', '要素を別リストへ移動', 'データの done を切り替える'],
          ['削除', 'removeChild', '配列から1件のぞく'],
          ['得意なこと', '小さく単純なもの', '状態が増える / 育つアプリ'],
        ],
      },
      callouts: [
        {
          kind: 'tip',
          text: '合言葉は「画面は状態の写し鏡」。データ（状態）を変えれば画面がついてくる――この感覚が React の中心です。第5章の useState で、いよいよこの「状態」を扱います。',
        },
      ],
    },
    {
      id: 'roadmap',
      heading: '1-4. この本の進め方',
      body: [
        '次の順番で進みます。第2〜4章で土台（環境・JSX・部品分け）を、第5〜8章で本体（入力・追加・完了・削除）を、第9〜10章で仕上げ（見た目・完成）を作ります。最後の第11〜12章で、同じものを TypeScript（型つき）に書き換えます。',
        'あせらず、1章ずつ手を動かしながら進めてください。それでは第2章で、React を動かす環境を用意しましょう。',
      ],
    },
  ],
}

import type { TodoChapter } from './types'

// 第12章「TypeScript 版・完成コードと次の一歩」。
export const ch12TypeScriptComplete: TodoChapter = {
  id: 'typescript-complete',
  num: 12,
  title: 'TypeScript 版・完成コードと次の一歩',
  summary:
    'TypeScript 版 TODO アプリの完成です。JavaScript 版とほぼ同じで、型が少し増えるだけ。全コードを見比べて、最後にこの先の学習の道しるべを置きます。',
  intro: [
    'いよいよ最後です。前章でつかんだ型を当てはめた、完成版 App.tsx をまとめます。JavaScript 版と並べると「どこに型が増えたか」が一目で分かります。',
    '下のプレビューも、TypeScript のコードをそのままブラウザで動かしています（型は実行時には消えるので、動きは JS 版と同じです）。',
  ],
  sections: [
    {
      id: 'full',
      heading: '12-1. App.tsx 全コード',
      body: [
        'これが完成形の App.tsx です。第11章で決めた Todo 型を使い、state・引数・イベントに型を付けています。それ以外は JavaScript 版とそっくりそのままです。',
      ],
      examples: [
        {
          code: `import { useState } from 'react'
import './styles.css'

// データの設計図：タスク1件の形
type Todo = {
  id: number
  text: string
  done: boolean
}

function TodoApp() {
  // 状態：todos は Todo の配列、text は文字列
  const [todos, setTodos] = useState<Todo[]>([])
  const [text, setText] = useState('')

  // 操作（引数やイベントに型を付ける）
  const addTodo = () => {
    if (text.trim() === '') return
    const newTodo: Todo = { id: Date.now(), text: text, done: false }
    setTodos([...todos, newTodo])
    setText('')
  }
  const toggleDone = (id: number) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }
  const deleteTodo = (id: number) => {
    setTodos(todos.filter((t) => t.id !== id))
  }
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
  }

  // 状態から2つのリストを作り出す（t は Todo 型と推論される）
  const incomplete = todos.filter((t) => !t.done)
  const complete = todos.filter((t) => t.done)

  return (
    <div className="todo-app">
      <div className="input-area">
        <input
          placeholder="タスクを入力してください"
          value={text}
          onChange={onChange}
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
          lang: 'tsx',
          live: true,
          mount: '<TodoApp />',
          note: '増えたのは type Todo の宣言、useState<Todo[]>、newTodo: Todo、(id: number)、(e: React.ChangeEvent<HTMLInputElement>) だけ。動きは JavaScript 版とまったく同じです。',
        },
      ],
    },
    {
      id: 'diff',
      heading: '12-2. JavaScript 版との差分',
      body: [
        '変わったのは「型を足した」ところだけ。下の表が、付け足した型の一覧です。逆に言えば、ここ以外は1文字も変えていません。',
      ],
      table: {
        headers: ['場所', 'JavaScript', 'TypeScript'],
        rows: [
          ['データの形', '（なし）', 'type Todo = { id; text; done }'],
          ['todos の state', 'useState([])', 'useState<Todo[]>([])'],
          ['新規作成', 'const newTodo =', 'const newTodo: Todo ='],
          ['id の引数', '(id) =>', '(id: number) =>'],
          ['入力イベント', '(e) =>', '(e: React.ChangeEvent<HTMLInputElement>) =>'],
        ],
      },
      callouts: [
        {
          kind: 'tip',
          text: 'これが TypeScript の入り方の王道：まず JavaScript で動くものを作り、あとから型を足していく。最初から完璧な型を書こうとしなくて大丈夫です。',
        },
      ],
    },
    {
      id: 'next',
      heading: '12-3. 次の一歩',
      body: [
        'TODO アプリを題材に、React の基礎（useState・配列の状態・map と key・イベント・派生した値）と TypeScript の基礎（型・state の型・イベントの型）を一通り通りました。同じ考え方で、もっと大きなアプリも作れます。',
        '次の練習としておすすめ：①localStorage に保存して、リロードしても消えないようにする（useEffect を使う）。②タスクの編集機能を足す。③部品を TodoItem / TodoInput に分けて props に型を付ける。④「未完了だけ表示」などの絞り込みを足す。',
        'どれも「状態をどう持ち、どう変え、どう表示するか」を考える練習です。困ったら、このサイトの「React 大全」で各テーマを復習しながら進めてください。おつかれさまでした！',
      ],
      callouts: [
        {
          kind: 'note',
          text: 'さらに学ぶなら「React 大全」第7章（useEffect）が localStorage 保存に、第10章（カスタムフック）がロジックの切り出しに、第12章（TypeScript の基礎）が型の理解に役立ちます。',
        },
      ],
    },
  ],
}

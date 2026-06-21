import type { TodoChapter } from './types'

// 第11章「TypeScript にする ― なぜ型？／Todo の型／state の型」。
export const ch11TypeScript: TodoChapter = {
  id: 'typescript',
  num: 11,
  title: 'TypeScript にする ― なぜ型？／Todo の型／state の型',
  summary:
    '同じ TODO アプリを TypeScript（型つき）に書き換えます。まずは「型をつけると何がうれしいのか」を体感し、Todo の型・state の型・イベントの型を、ひとつずつ付けていきます。',
  intro: [
    'JavaScript 版は完成しました。ここからは TypeScript（ティーエス）版です。TypeScript は「JavaScript に型をつけたもの」。書き方はほぼ同じで、変数や引数に「これは文字」「これは Todo の配列」といった種類（型）を添えます。',
    '型をつけると、打ち間違いや勘違いを書いた瞬間にエディタが赤線で教えてくれます。TODO アプリのような小さなアプリでも、その安心感はすぐ実感できます。',
  ],
  sections: [
    {
      id: 'why',
      heading: '11-1. なぜ型をつけるのか',
      body: [
        '例えば todo.txt と打ち間違えても、JavaScript は実行するまで気づけません（画面が undefined になって「あれ？」となる）。TypeScript なら「Todo に txt なんてありません。text では？」とその場で教えてくれます。',
        'つまり型は「実行する前に間違いを見つけてくれる見張り役」。コードが増えるほど効いてきます。さらに、入力中に「このオブジェクトには text と done があります」と補完も出るので、書くのも速くなります。',
      ],
      callouts: [
        {
          kind: 'note',
          text: '環境を新しく作るなら npm create vite@latest todo-app -- --template react-ts（第2章の react を react-ts に）。ファイルの拡張子は .jsx → .tsx、.js → .ts になります。中身の考え方は同じです。',
        },
      ],
    },
    {
      id: 'todo-type',
      heading: '11-2. Todo の「型」を決める',
      body: [
        'まず、タスク1件がどんな形かを type で宣言します。これが、このアプリの「データの設計図」になります。',
        'id は数値（number）、text は文字（string）、done は true/false（boolean）。一度こう決めると、これと違う形のものを入れようとした瞬間にエラーになります。',
      ],
      examples: [
        {
          code: `type Todo = {
  id: number
  text: string
  done: boolean
}`,
          lang: 'ts',
          note: 'string / number / boolean が基本の型。型名（Todo）は大文字始まりが慣習です。この Todo を、これ以降あちこちで使い回します。',
        },
      ],
    },
    {
      id: 'state-type',
      heading: '11-3. state に型をつける',
      body: [
        'useState には < > で「中身の型」を教えます。todos は「Todo の配列」なので useState<Todo[]>([])。Todo[] は「Todo がいくつか入った配列」という意味です。',
        'text は文字列で、最初が空文字 "" なら TypeScript が「string だな」と自動で判断してくれます（型推論）。なので useState("") だけで十分。迷ったら明示しても構いません。',
      ],
      examples: [
        {
          code: `const [todos, setTodos] = useState<Todo[]>([])  // Todo の配列
const [text, setText] = useState('')             // '' から string と推論される`,
          lang: 'ts',
          note: 'useState<Todo[]>([]) としておくと、todos.map((t) => ...) の t が自動的に Todo 型になり、t.text などで補完が効きます。空配列 [] だけだと「何の配列か」が分からないので、ここは明示します。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: '型推論：TypeScript は「右側の値」から型を推測してくれます。useState(0) は number、useState("") は string、というように。だから何でもかんでも型を書く必要はありません。「推論できないとき（空配列など）」だけ書けば OK。',
        },
      ],
    },
    {
      id: 'fn-types',
      heading: '11-4. 関数の引数とイベントに型をつける',
      body: [
        '操作の関数にも型を付けます。toggleDone(id) の id は number、deleteTodo(id) の id も number。引数名のうしろに : number と書くだけです。',
        '入力欄の onChange の e には、React が用意した型 React.ChangeEvent<HTMLInputElement> を付けます。少し長いですが「input 要素の変更イベント」という意味。これで e.target.value が文字列だと分かり、安全に扱えます。',
      ],
      examples: [
        {
          code: `const toggleDone = (id: number) => {
  setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
}

const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setText(e.target.value)
}`,
          lang: 'ts',
          note: 'addTodo のように引数がない関数には何も書かなくて OK。返り値の型もたいてい推論されるので、まずは「引数」と「イベント」に型を付けることから始めれば十分です。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'もし部品に分けるなら、props にも型を付けます。例：function TodoItem({ todo }: { todo: Todo }) のように「props はこういう形」と書きます。1ファイルにまとめる今回は、state と引数・イベントだけで十分です。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '11-5. この章のまとめ',
      body: [
        'データの形は type Todo で設計図にする。state は useState<Todo[]>([]) のように中身の型を教える。関数の引数は : number、入力イベントは React.ChangeEvent<HTMLInputElement>。推論できるところは書かなくてよい。',
        '次の第12章で、これらを当てはめた完成版 App.tsx をまとめます。JavaScript 版とほとんど同じで、型が少し増えるだけ――を確かめましょう。',
      ],
    },
  ],
}

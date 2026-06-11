import type { ReactChapter } from './types'

// 第6章「イベントとフォーム ― onClick / onChange で操作を受け取る」。プログラミング初心者向け。
export const ch06Events: ReactChapter = {
  id: 'events',
  num: 6,
  title: 'イベントとフォーム ― onClick / onChange で操作を受け取る',
  summary: 'ボタンのクリックや文字の入力など、ユーザーの操作を受け取るのがイベントです。前章の useState と組み合わせて、入力に追従するフォームを作れるようになります。',
  intro: [
    '第5章で「状態を変えれば画面が変わる」ことを学びました。残るは「いつ状態を変えるか」――つまりユーザーの操作（クリック・入力）を受け取るしくみです。',
    'これをイベント（event）と呼びます。この章で、クリックや入力を受け取って状態を更新し、フォームを完成させましょう。',
  ],
  sections: [
    {
      id: 'onclick',
      heading: '6-1. onClick ― クリックを受け取る',
      body: [
        'ボタンなどに onClick={関数} と書くと、クリックされたときにその関数が呼ばれます。第5章のカウンタも、この onClick で setCount を呼んでいました。',
        '注意点：onClick={handleClick} のように「関数そのもの」をわたします。onClick={handleClick()} と書くと、クリックを待たずにその場で実行されてしまうので間違いです。',
      ],
      examples: [
        {
          code: `function Counter() {\n  const [count, setCount] = useState(0)\n\n  function handleClick() {\n    setCount(count + 1)\n  }\n\n  return <button onClick={handleClick}>{count} 回</button>\n}`,
          note: 'onClick={handleClick}（カッコなし）が正解。引数をわたしたいときだけ onClick={() => handleClick(id)} のように「矢印関数で包む」形にします。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：() => { ... } は「矢印関数（アロー関数）」。その場で使う短い関数を書くのに便利で、React では「クリックされたら何をするか」を書くのに多用します。',
        },
      ],
    },
    {
      id: 'onchange',
      heading: '6-2. onChange ― 入力を受け取る',
      body: [
        'テキスト入力欄 <input> には onChange={関数} を付けます。文字が入力されるたびに関数が呼ばれ、引数の e（イベント）から入力された値を e.target.value で取り出せます。',
        'その値を useState に入れておけば、「入力 → 状態更新 → 画面に反映」がつながります。',
      ],
      examples: [
        {
          code: `function NameInput() {\n  const [name, setName] = useState('')\n\n  return (\n    <div>\n      <input\n        value={name}\n        onChange={(e) => setName(e.target.value)}\n      />\n      <p>こんにちは、{name} さん</p>\n    </div>\n  )\n}`,
          result: `「た」と打つ → こんにちは、た さん\n「たなか」まで打つ → こんにちは、たなか さん`,
          note: '入力のたびに setName で状態を更新 → 画面の {name} も即座に追従します。打った文字がリアルタイムで下の文に映ります。',
        },
      ],
    },
    {
      id: 'controlled',
      heading: '6-3. 制御コンポーネント ― 「状態が入力欄の主」',
      body: [
        'よく見ると、上の <input> には value={name} も付いています。これは「入力欄の中身を、状態 name に常に一致させる」という意味です。',
        'こうすると「入力欄の本当の値は state が持っている」状態になります。これを制御コンポーネント（controlled component）と呼び、React のフォームの基本形です。値が1か所（state）に集まるので、リセットや検証がしやすくなります。',
      ],
      mermaid: `flowchart LR\n  A["キー入力"] --> B["onChange が発火"]\n  B --> C["setName で state 更新"]\n  C --> D["再レンダリング"]\n  D --> E["value=name で<br/>入力欄に反映"]`,
      callouts: [
        {
          kind: 'tip',
          text: 'value と onChange はセットで使う、と覚えましょう。value だけだと「打っても変わらない欄」、onChange だけだと「state と食い違う欄」になりがちです。',
        },
      ],
    },
    {
      id: 'form-submit',
      heading: '6-4. フォーム送信 ― onSubmit と preventDefault',
      body: [
        '複数の入力をまとめて送るときは <form> の onSubmit を使います。ここで大事なのが e.preventDefault()。これを呼ばないと、ブラウザが昔ながらの「ページ再読み込み」をしてしまい、React の状態が消えてしまいます。',
        '「送信ボタンが押されたら、ページ再読み込みは止めて、自分で処理する」というのが定番の形です。',
      ],
      examples: [
        {
          code: `function LoginForm() {\n  const [email, setEmail] = useState('')\n  const [password, setPassword] = useState('')\n\n  function handleSubmit(e) {\n    e.preventDefault()  // ページ再読み込みを止める\n    console.log('送信:', email, password)\n    // ここでサーバーにログイン要求を送る（第11章）\n  }\n\n  return (\n    <form onSubmit={handleSubmit}>\n      <input value={email} onChange={(e) => setEmail(e.target.value)} />\n      <input\n        type="password"\n        value={password}\n        onChange={(e) => setPassword(e.target.value)}\n      />\n      <button type="submit">ログイン</button>\n    </form>\n  )\n}`,
          note: 'type="submit" のボタンを押すか Enter で onSubmit が発火。先頭の e.preventDefault() で再読み込みを止め、集めた email / password を使って処理します。',
        },
      ],
      callouts: [
        {
          kind: 'warn',
          text: 'preventDefault() を忘れると、送信のたびに画面がリロードされて「一瞬チラついて何も起きない」ように見えます。フォーム送信の不具合のほとんどはこれが原因です。',
        },
      ],
    },
    {
      id: 'lifting',
      heading: '6-5. 子から親へ伝える ― コールバックを props でわたす',
      body: [
        '子の部品（ボタンなど）で起きた操作を、親に伝えたいことがあります。props は「上から下」へ値を流すと学びましたが、逆に「関数を下にわたしておき、子がそれを呼ぶ」ことで、下から上へ知らせることができます。',
        'この「わたしておく関数」をコールバック（callback）と呼びます。慣習として onXxx という名前にします。',
      ],
      examples: [
        {
          code: `// 子：押されたら、わたされた onAdd を呼ぶだけ\nfunction AddButton({ onAdd }) {\n  return <button onClick={onAdd}>カートに入れる</button>\n}\n\n// 親：何をするかを決めて、関数としてわたす\nfunction Product() {\n  function handleAdd() {\n    console.log('カートに追加した！')\n  }\n  return <AddButton onAdd={handleAdd} />\n}`,
          note: '親が「やること（handleAdd）」を決め、子はそれを「押されたら呼ぶ」だけ。これで子→親へ操作が伝わります。データは下へ（props）、操作の通知は上へ（コールバック）、と覚えましょう。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '6-6. この章のまとめ',
      body: [
        'クリックは onClick、入力は onChange で受け取る。onClick={handleClick} は関数そのものをわたす（() を付けない）。入力値は e.target.value で取り出し、useState に入れて画面に反映する。',
        '<input> に value と onChange をセットで付けたものが制御コンポーネント（React のフォームの基本）。フォーム送信は onSubmit ＋ 先頭で e.preventDefault()。子→親へは onXxx のコールバックを props でわたす。',
        'ここまでで「表示」と「操作」の基礎がそろいました。次の章からは、サーバーからデータを取ってくる useEffect など、外の世界とつながる一歩進んだ内容に入ります。',
      ],
    },
  ],
}

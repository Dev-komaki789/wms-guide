import type { TodoChapter } from './types'

// 第5章「入力欄を React 流に ― useState で文字を管理（制御コンポーネント）」。
export const ch05Input: TodoChapter = {
  id: 'input',
  num: 5,
  title: '入力欄を React 流に ― useState で文字を管理',
  summary:
    'TODO アプリの最初の「動き」は、入力欄です。素の JS では getElementById で値を読みましたが、React では useState で入力中の文字を「状態」として持ちます。この考え方が、これ以降ずっと土台になります。',
  intro: [
    'いよいよ動きを付けます。最初の一歩は入力欄です。「いま入力欄に何が書かれているか」を React に覚えさせます。',
    'そのための道具が useState（ユーズステート）。「あとから変わる値」を持つための、React でいちばん大事なしくみです。',
  ],
  sections: [
    {
      id: 'why',
      heading: '5-1. なぜ「状態」で持つのか',
      body: [
        '素の JS では、追加するときに document.getElementById("add-text").value で「そのときの入力欄の中身」を読み出していました。必要になった瞬間に DOM を見に行く方式です。',
        'React では考え方が逆になります。入力中の文字を text という状態として常に持っておき、入力欄にはその text を映す。文字が変わるたびに状態を更新する――こうすると「いまの入力値」がいつでも手元の変数として使えます。',
      ],
    },
    {
      id: 'usestate',
      heading: '5-2. useState で値と更新関数を用意する',
      body: [
        'const [text, setText] = useState("") と書くと、text が現在の値、setText が値を変える関数、useState("") の "" が最初の値（空文字）です。',
        '値を変えたいときは text = ... ではなく、必ず setText(...) を呼びます。setText を呼ぶと React が「変わった」と気づいて、画面を描き直してくれます。',
      ],
      examples: [
        {
          code: `import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)   // 0 から始まる状態
  return (
    <button onClick={() => setCount(count + 1)}>
      {count} 回押した
    </button>
  )
}`,
          live: true,
          mount: '<Counter />',
          note: 'まずは入力欄の前に、useState の感覚をカウンタでつかみます。setCount を呼ぶたび、画面の数字が更新されます。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：[text, setText] は「分割代入」。useState は2つの値（現在値と更新関数）を配列で返すので、それを2つの名前に取り分けています。名前は自由ですが「値」「set+値」の組み合わせが慣習です。',
        },
      ],
    },
    {
      id: 'controlled',
      heading: '5-3. 入力欄と状態をつなぐ（制御コンポーネント）',
      body: [
        '入力欄に value={text} と onChange を付けます。value={text} で「入力欄の表示＝状態 text」にし、onChange で「文字が打たれたら setText で状態を更新」します。',
        'この「value で映して、onChange で書き戻す」往復で、状態と入力欄がぴったり同期します。こうした入力欄を制御コンポーネントと呼びます。',
      ],
      examples: [
        {
          code: `import { useState } from 'react'

function InputDemo() {
  const [text, setText] = useState('')

  return (
    <div>
      <input
        placeholder="タスクを入力してください"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <p>いま入力中：{text}</p>
    </div>
  )
}`,
          live: true,
          mount: '<InputDemo />',
          note: '打つたびに下の「いま入力中」がリアルタイムで変わります。e.target.value が「入力欄の今の中身」です。これを setText でそのまま状態へ書き戻しています。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'onChange は「入力欄の中身が変わるたび」に呼ばれます。e はそのときのイベント情報で、e.target が入力欄そのもの、e.target.value がその中の文字です。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '5-4. この章のまとめ',
      body: [
        '入力中の文字は useState で状態として持つ。入力欄は value={text} で状態を映し、onChange で setText を呼んで状態を更新する。これで「いまの入力値」が text 変数としていつでも使える。',
        '次の章では、この text を使って「追加」を作ります。タスクをためる配列を、もうひとつ useState で用意します。',
      ],
    },
  ],
}

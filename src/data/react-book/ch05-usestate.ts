import type { ReactChapter } from './types'

// 第5章「useState ― 画面が変わる『状態』を持つ」。プログラミング初心者向け。
export const ch05UseState: ReactChapter = {
  id: 'usestate',
  num: 5,
  title: 'useState ― 画面が変わる「状態」を持つ',
  summary: 'ボタンを押すと数が増える、入力すると文字が映る――そんな「変化する画面」を作る心臓部が useState（状態）です。React でいちばん大事なしくみなので、ゆっくり丁寧に進めます。',
  intro: [
    'ここまでの部品は、一度表示したら変わりませんでした。でも本物のアプリは、ボタンを押す・文字を打つ・データが届く、といった操作で画面がどんどん変わります。',
    'その「あとから変わる値」を覚えておく入れ物が state（ステート＝状態）で、それを使うための道具が useState（ユーズステート）です。React の核心なので、あせらず読んでください。',
  ],
  sections: [
    {
      id: 'why',
      heading: '5-1. なぜ ふつうの変数ではダメなのか',
      body: [
        'まず「ふつうの変数ではうまくいかない」ことを知っておきましょう。下のコードは、ボタンを押すと count を増やそうとしていますが、画面は変わりません。',
        '理由は2つ。①コンポーネントの関数は、表示のたびに最初から実行され、let count = 0 も毎回 0 に戻ってしまう。②そもそも React は「変数が変わったこと」に気づけないので、画面を描き直してくれません。',
      ],
      examples: [
        {
          code: `function Counter() {\n  let count = 0  // ❌ これは毎回 0 に戻り、変えても画面は更新されない\n  return (\n    <button onClick={() => { count = count + 1 }}>\n      {count} 回\n    </button>\n  )\n}`,
          note: 'count を増やしても、React は「描き直す必要がある」と気づきません。だから画面はずっと「0 回」のまま。ここで useState の出番です。',
        },
      ],
    },
    {
      id: 'usestate-basics',
      heading: '5-2. useState の使い方',
      body: [
        'useState は「値」と「その値を変える関数」をセットで用意してくれます。const [count, setCount] = useState(0) と書くと、count が現在の値、setCount が値を変える関数、useState(0) の 0 が最初の値です。',
        '値を変えたいときは count = ... ではなく、必ず setCount(...) を呼びます。setCount を呼ぶと、React が「変わった！」と気づいて、画面を自動で描き直してくれます。',
      ],
      examples: [
        {
          code: `import { useState } from 'react'\n\nfunction Counter() {\n  const [count, setCount] = useState(0)\n  return (\n    <button onClick={() => setCount(count + 1)}>\n      {count} 回\n    </button>\n  )\n}`,
          live: true,
          mount: '<Counter />',
          note: 'setCount(count + 1) で「次は今より1多い値にして」とお願いします。すると React が画面を描き直し、新しい count が表示されます。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：[count, setCount] の書き方は「分割代入」（第2章）。useState は2つの値を配列で返すので、それを2つの名前に取り分けています。名前は自由ですが「値」「set+値」の組み合わせが慣習です。',
        },
      ],
    },
    {
      id: 'rerender',
      heading: '5-3. しくみ ― 「set → 描き直し」のくり返し',
      body: [
        'React の画面更新は、この一本道で動いています。①set関数で状態を変える → ②React がその部品をもう一度実行する（再レンダリング）→ ③新しい状態で画面が描き直される。',
        'つまり「画面 ＝ いまの状態を映したもの」。状態を変えれば画面がついてくる、という関係です。あなたは「どう変えるか（set）」だけ書けば、「どう描き直すか」は React がやってくれます。',
      ],
      mermaid: `flowchart LR\n  A["ボタンを押す"] --> B["setCount を呼ぶ<br/>（状態を変える）"]\n  B --> C["React が部品を<br/>もう一度実行（再レンダリング）"]\n  C --> D["新しい状態で<br/>画面が描き直される"]`,
      callouts: [
        {
          kind: 'tip',
          text: '「画面は状態の写し鏡」。この感覚がつかめると React がぐっと分かりやすくなります。DOM を自分で書きかえる…のではなく、状態を変えるだけ、です。',
        },
      ],
    },
    {
      id: 'updater',
      heading: '5-4. 前の値をもとに更新する ― 関数わたし',
      body: [
        '「今の値に1足す」ような更新では、setCount(count + 1) より setCount((prev) => prev + 1) と“関数”をわたす形が安全です。prev には「確実に最新の値」が入ってきます。',
        '特に、短い間に何度も更新するときや、後の章で出てくる非同期処理のあとでは、この関数わたしが効きます。まずは「連続更新するなら関数わたし」と覚えておけば十分です。',
      ],
      examples: [
        {
          code: `// 1回押すと2増やしたい\nfunction add2() {\n  setCount((prev) => prev + 1)\n  setCount((prev) => prev + 1)  // prev には1回目を反映した最新値が入る → ちゃんと +2\n}\n\n// これだと両方とも同じ count を見るので +1 にしかならないことがある\nfunction addWrong() {\n  setCount(count + 1)\n  setCount(count + 1)\n}`,
          note: '(prev) => prev + 1 は「今の最新値を受け取って、それに1足す」。連続で呼んでも取りこぼしません。',
        },
      ],
    },
    {
      id: 'objects',
      heading: '5-5. オブジェクトや配列の状態 ― 「新しく作って」渡す',
      body: [
        '状態には数値だけでなく、オブジェクトや配列も持てます。ただし大事なルール：中身を直接書きかえてはいけません。「新しいオブジェクト／配列を作って」set にわたします。',
        'React は「別物に置きかわったか」で変化を見分けます。中身をこっそり変えても気づけないので、コピーを作って差し替えるのです。... （スプレッド構文）でコピーするのが定番です。',
      ],
      examples: [
        {
          code: `const [form, setForm] = useState({ name: '', email: '' })\n\n// ❌ 直接書きかえ（React が気づかない）\n// form.name = 'たなか'\n\n// ✅ 今の form を ... で展開コピーし、name だけ差し替えた“新しい”オブジェクトを作る\nsetForm({ ...form, name: 'たなか' })\n\n// 配列に1件追加するときも、新しい配列を作る\nconst [items, setItems] = useState([])\nsetItems([...items, newItem])`,
          note: '{ ...form, name: ... } は「form の中身を全部コピーして、name だけ上書きした新しいオブジェクト」。[...items, newItem] は「今の中身＋新しい1件の新しい配列」です。',
        },
      ],
      callouts: [
        {
          kind: 'warn',
          text: 'items.push(newItem) のように元の配列を直接いじるのは NG。React が変化に気づかず、画面が更新されません。必ず「新しい配列・オブジェクトを作って set」してください。',
        },
      ],
    },
    {
      id: 'rules',
      heading: '5-6. フックのルール（useState を使う場所）',
      body: [
        'useState のような use〜で始まる関数を「フック（Hook）」と呼びます。フックには守るべきルールが2つあります。',
      ],
      table: {
        headers: ['ルール', '意味'],
        rows: [
          ['コンポーネントの先頭で呼ぶ', 'if 文やループ、関数の途中ではなく、関数のいちばん上のほうで呼ぶ'],
          ['呼ぶのは部品かフックの中だけ', 'ふつうの関数やイベント処理の中では呼ばない'],
        ],
      },
      callouts: [
        {
          kind: 'note',
          text: 'なぜ？ React は「何番目に呼ばれたフックか」で状態を見分けています。条件次第で呼んだり呼ばなかったりすると順番がズレて壊れます。「フックは毎回・同じ順番で・先頭で」と覚えましょう。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '5-7. この章のまとめ',
      body: [
        '「あとから変わる値」は useState で持つ。const [値, set関数] = useState(初期値)。値を変えるときは必ず set 関数を呼び、すると React が画面を描き直す（再レンダリング）。',
        '画面は「状態の写し鏡」。連続更新は (prev) => ... の関数わたしが安全。オブジェクト・配列は直接いじらず「新しく作って」set する。フックは先頭で・毎回同じ順番で呼ぶ。',
        '次の章では、この set 関数を「ボタンのクリック」や「入力」とつなげて、実際に操作できるフォームを作ります。',
      ],
    },
  ],
}

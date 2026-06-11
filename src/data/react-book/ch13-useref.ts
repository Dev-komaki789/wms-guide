import type { ReactChapter } from './types'

// 第13章「useRef ― 再描画させずに値や DOM を持つ」。プログラミング初心者向け。
export const ch13UseRef: ReactChapter = {
  id: 'useref',
  num: 13,
  title: 'useRef ― 再描画させずに値や DOM を持つ',
  summary: 'useState とよく似ているけれど「変えても画面を描き直さない」入れ物が useRef です。入力欄にカーソルを当てる、前回の値を覚えておく、といった用途で活躍します。実際にフォーカスを当てて体感します。',
  intro: [
    'ここからは一歩進んだフックです。まずは useRef（ユーズレフ）。「値を覚えておく」点は useState に似ていますが、決定的に違うのは“変えても再レンダリングが起きない”ことです。',
    'また useRef は「画面の実体（DOM 要素）」を直接つかむのにも使います。2つの使い道を順に見ていきましょう。',
  ],
  sections: [
    {
      id: 'vs-state',
      heading: '13-1. useState との違い ― 「描き直すかどうか」',
      body: [
        'useRef(初期値) は { current: 値 } という入れ物を返します。ref.current を読み書きして値を出し入れします。',
        '最大の違いは、ref.current を書きかえても再レンダリングが起きないこと。「画面に出す値」は useState、「裏で覚えておくだけの値」は useRef、と使い分けます。',
      ],
      table: {
        headers: ['', 'useState', 'useRef'],
        rows: [
          ['値の変更で再描画', 'する（画面に反映）', 'しない'],
          ['向いている用途', '画面に表示する値', '裏で覚える値・DOM 参照'],
          ['読み書き', 'count / setCount', 'ref.current'],
        ],
      },
      callouts: [
        {
          kind: 'note',
          text: 'ことば：ref（レフ）＝ reference（参照）。「何かを指す目印」。useRef は「描き直しに関係しない、ずっと同じ入れ物」を1つ用意してくれる、と考えてください。',
        },
      ],
    },
    {
      id: 'dom',
      heading: '13-2. 動く例 ― 入力欄にフォーカスを当てる',
      body: [
        'useRef のいちばん分かりやすい使い道が「DOM 要素を直接つかむ」ことです。要素に ref={inputRef} と付けると、inputRef.current にその要素本体が入り、focus() などの命令を直接呼べます。',
        '下のボタンを押すと、実際に入力欄へカーソル（フォーカス）が移ります。',
      ],
      examples: [
        {
          code: `function FocusInput() {\n  const inputRef = useRef(null)\n\n  return (\n    <div>\n      <input ref={inputRef} placeholder="ここに入力" />\n      <button onClick={() => inputRef.current.focus()}>\n        入力欄にフォーカス\n      </button>\n    </div>\n  )\n}`,
          live: true,
          mount: '<FocusInput />',
          note: 'ref={inputRef} で入力欄をつかみ、inputRef.current.focus() でカーソルを当てています。こうした「画面の実体への直接操作」は useRef の出番です。',
        },
      ],
    },
    {
      id: 'mutable',
      heading: '13-3. 描き直さずに値を覚える',
      body: [
        'もう一つの使い道が「再レンダリングをまたいで値を覚えるが、画面には影響しない」ケースです。代表例は、第7章の setInterval が返す ID。これは画面に出す必要はないけれど、止めるときに必要なので覚えておきたい値です。',
        'もしこれを useState にすると、ID をセットするたびに無駄な再描画が起きてしまいます。useRef ならそれが起きません。',
      ],
      examples: [
        {
          code: `function Timer() {\n  const [sec, setSec] = useState(0)\n  const timerId = useRef(null)   // 画面に出さない値を覚える\n\n  function start() {\n    if (timerId.current) return  // すでに動いていれば何もしない\n    timerId.current = setInterval(() => setSec((s) => s + 1), 1000)\n  }\n  function stop() {\n    clearInterval(timerId.current)\n    timerId.current = null\n  }\n\n  return (\n    <div>\n      <p>{sec} 秒</p>\n      <button onClick={start}>開始</button>\n      <button onClick={stop}>停止</button>\n    </div>\n  )\n}`,
          live: true,
          mount: '<Timer />',
          note: 'timerId は画面に出さないので useRef。sec は画面に出すので useState。「表示する値か／裏で持つ値か」で使い分けるのがコツです。開始・停止を押して試してみてください。',
        },
      ],
    },
    {
      id: 'caution',
      heading: '13-4. 注意 ― 描画に関わる値は ref にしない',
      body: [
        'よくある間違いが「画面に出したい値を useRef に入れて、変えても画面が更新されない」というものです。ref.current を変えても再描画されないので、表示はカウンタが止まったままになります。',
        '判断はシンプル。その値が変わったとき画面も変わってほしいなら useState。変わってほしくない（裏方の値）なら useRef です。',
      ],
      callouts: [
        {
          kind: 'warn',
          text: 'また、render（描画）の最中に ref.current を読み書きするのも避けます。ref を触るのは「イベントの中」や「useEffect の中」が基本。描画中は state と props だけで画面を決める、と覚えましょう。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '13-5. この章のまとめ',
      body: [
        'useRef は { current: 値 } の入れ物を返し、変えても再レンダリングが起きない。「画面に出す値」は useState、「裏で覚える値・DOM 参照」は useRef。',
        '要素に ref={...} を付けると .current でその DOM をつかめ、focus() などを直接呼べる。setInterval の ID のような“表示しない値”を覚えるのにも向く。描画に関わる値は ref にしない。',
        '次の章では、計算結果を覚えておく useMemo と、複雑な状態をすっきり扱う useReducer を学びます。',
      ],
    },
  ],
}

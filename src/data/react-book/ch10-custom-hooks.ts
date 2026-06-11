import type { ReactChapter } from './types'

// 第10章「カスタムフック ― ロジックを部品から切り出す」。プログラミング初心者向け。
export const ch10CustomHooks: ReactChapter = {
  id: 'custom-hooks',
  num: 10,
  title: 'カスタムフック ― ロジックを部品から切り出す',
  summary: '同じ状態ロジックを複数の部品で使い回したいとき、自分で use〇〇 という関数を作れます。これがカスタムフック。実際に動く「開閉トグル」で、ロジックの切り出しと再利用を体感します。',
  intro: [
    'useState や useEffect を組み合わせた「ちょっとしたロジック」を、複数の部品で何度も書くことがあります。たとえば「開いている/閉じている」を切り替えるトグル、入力フォームの管理など。',
    'こうしたロジックを、関数として切り出して使い回せるようにしたものがカスタムフック（custom hook）です。むずかしそうですが、正体は「中でフックを使う、ただの関数」です。',
  ],
  sections: [
    {
      id: 'what',
      heading: '10-1. カスタムフック＝「中でフックを使う関数」',
      body: [
        'カスタムフックは、名前を use ではじめる関数で、中で useState などのフックを使い、結果を返します。それだけです。新しい文法は何もありません。',
        '名前を use ではじめるのは約束ごと。こうすると React や eslint が「これはフックだ」と認識し、フックのルール（第5章）のチェックが効くようになります。',
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：カスタムフック＝自作の use〇〇 関数。「状態を持つロジックのかたまり」に名前を付けて部品から追い出し、複数の部品で使い回せるようにするもの。',
        },
      ],
    },
    {
      id: 'live',
      heading: '10-2. 動く例 ― useToggle を作って使う',
      body: [
        '「開く/閉じる」の切り替えは、いろんな所で出てきます。これを useToggle というカスタムフックに切り出してみましょう。中で useState を使い、「今の値」と「切り替える関数」を返します。',
        '下のボタンを押すと、実際に表示が開いたり閉じたりします。ロジック（切り替え）はフックの中にあり、部品の側はそれを使うだけでスッキリしています。',
      ],
      examples: [
        {
          code: `// カスタムフック：開閉の状態と切り替え関数を返す\nfunction useToggle(initial = false) {\n  const [on, setOn] = useState(initial)\n  const toggle = () => setOn((prev) => !prev)\n  return [on, toggle]\n}\n\n// 使う部品はスッキリ\nfunction Panel() {\n  const [open, toggleOpen] = useToggle(false)\n  return (\n    <div>\n      <button onClick={toggleOpen}>\n        {open ? '閉じる' : '開く'}\n      </button>\n      {open && <p className="card">中身が見えました！もう一度押すと隠れます。</p>}\n    </div>\n  )\n}`,
          live: true,
          mount: '<Panel />',
          note: 'useToggle は useState を包んだだけの関数。Panel はその [open, toggleOpen] を使うだけ。同じトグルが必要な部品が増えても、useToggle() を呼ぶ1行で済みます。',
        },
      ],
    },
    {
      id: 'reuse',
      heading: '10-3. なぜうれしいか ― 状態は「部品ごとに別々」',
      body: [
        'カスタムフックを2つの部品で使っても、状態は共有されません。呼んだ部品ごとに、それぞれ独立した state が作られます。「ロジック（手順）は共有、状態（値）は別々」です。',
        'もし状態まで共有したいなら、それは第9章の Context の役目。カスタムフックは「手順の使い回し」、Context は「値の共有」と役割が違います。',
      ],
      examples: [
        {
          code: `function TwoPanels() {\n  return (\n    <div>\n      <Panel />   {/* それぞれ独立した open を持つ */}\n      <Panel />\n    </div>\n  )\n}`,
          note: '上下の Panel は別々に開閉します。useToggle のロジックは同じでも、状態は部品ごとに独立しているからです。',
        },
      ],
    },
    {
      id: 'effect-hook',
      heading: '10-4. useEffect も切り出せる ― useWindowWidth の例',
      body: [
        'カスタムフックには useEffect も入れられます。たとえば「ブラウザの横幅をリアルタイムに知る」ロジックを useWindowWidth に切り出すと、どの部品でも width = useWindowWidth() の1行で使えます。',
        '後片付け（第7章）もフックの中に閉じ込められるので、使う側はクリーンアップを気にしなくて済みます。',
      ],
      examples: [
        {
          code: `function useWindowWidth() {\n  const [width, setWidth] = useState(window.innerWidth)\n\n  useEffect(() => {\n    const onResize = () => setWidth(window.innerWidth)\n    window.addEventListener('resize', onResize)\n    return () => window.removeEventListener('resize', onResize) // 後片付け\n  }, [])\n\n  return width\n}\n\n// 使う側\nfunction Info() {\n  const width = useWindowWidth()\n  return <p>今の横幅: {width}px</p>\n}`,
          note: 'イベント登録と後片付けがフックの中に隠れています。使う側は useWindowWidth() を呼ぶだけ。複雑さを「部品の外」に追い出せるのがカスタムフックの価値です。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '10-5. この章のまとめ',
      body: [
        'カスタムフックは「中でフックを使う、自作の use〇〇 関数」。状態ロジックを部品から切り出して名前を付け、複数の部品で使い回せるようにする。新しい文法はない。',
        '同じフックを複数の部品で使っても、状態は部品ごとに独立（手順は共有・値は別々）。値そのものを共有したいときは Context。useEffect や後片付けもフックの中に閉じ込められる。',
        '次の章では、これまで「省略してきた」サーバーとの通信（fetch / async・await）を正面から学びます。第9章の Context・本章のカスタムフックと組み合わさって、実アプリの形が見えてきます。',
      ],
    },
  ],
}

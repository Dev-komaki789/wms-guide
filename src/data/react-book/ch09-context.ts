import type { ReactChapter } from './types'

// 第9章「Context ― 遠くの部品へ値を届ける」。プログラミング初心者向け。
export const ch09Context: ReactChapter = {
  id: 'context',
  num: 9,
  title: 'Context ― 遠くの部品へ値を届ける',
  summary: 'ログイン情報やカートのように「アプリのあちこちで使う値」を、props のバケツリレーなしで届けるしくみが Context です。実際に動く例で「離れた部品が同じ状態を共有する」感覚をつかみます。',
  intro: [
    'props は「親→子」へ値を流します（第2章）。でも、深くネストした部品に値を届けたいとき、間の部品すべてに props を書いて渡し続けるのは大変です。これを「props のバケツリレー」と呼び、面倒の元になります。',
    'Context（コンテキスト）は、このバケツリレーを飛ばして「離れた部品へ直接値を届ける」しくみです。ログイン中のユーザー・テーマ・カートなど、アプリ全体で共有したい値に向いています。',
  ],
  sections: [
    {
      id: 'problem',
      heading: '9-1. props のバケツリレー問題',
      body: [
        'たとえば「ログイン中のユーザー名」を、ヘッダーの奥のボタンで使いたいとします。props だけだと、App → Layout → Header → UserMenu → … と、途中の部品が自分では使わない user をひたすら受け渡すことになります。',
        '途中の部品は user に興味がないのに引数が増えていく。これがバケツリレーの不快さです。Context はこれを解決します。',
      ],
      mermaid: `flowchart TD\n  A["App（user を持つ）"] -->|"props で user"| B["Layout"]\n  B -->|"props で user"| C["Header"]\n  C -->|"props で user"| D["UserMenu が使う"]\n  A -. "Context なら直接届く" .-> D`,
    },
    {
      id: 'three-steps',
      heading: '9-2. Context の3ステップ',
      body: [
        'Context は「作る・配る・受け取る」の3ステップです。①createContext で入れ物を作る。②Provider で値を「配る」範囲を囲む。③useContext で、囲まれた中の部品が値を「受け取る」。',
      ],
      table: {
        headers: ['ステップ', 'すること', '使うもの'],
        rows: [
          ['① 作る', '共有する値の入れ物を用意', 'createContext()'],
          ['② 配る', 'この範囲に値を流す、と囲む', '<XxxContext.Provider value={...}>'],
          ['③ 受け取る', '囲まれた部品が値を読む', 'useContext(XxxContext)'],
        ],
      },
    },
    {
      id: 'live',
      heading: '9-3. 動く例 ― 離れた2つの部品が同じ状態を共有',
      body: [
        '下の例では、CountProvider が count を配り、「表示する部品（CountLabel）」と「増やす部品（CountButton）」が、それぞれ useContext で同じ状態につながっています。両者は親子でも兄弟でもなく、props も渡していないのに、ボタンを押すと表示が更新されます。',
      ],
      examples: [
        {
          code: `const CountContext = createContext(null)\n\n// ② 値を配る親\nfunction CountProvider({ children }) {\n  const [count, setCount] = useState(0)\n  return (\n    <CountContext.Provider value={{ count, setCount }}>\n      {children}\n    </CountContext.Provider>\n  )\n}\n\n// ③ 受け取って表示する部品\nfunction CountLabel() {\n  const { count } = useContext(CountContext)\n  return <p>現在のカウント: {count}</p>\n}\n\n// ③ 受け取って増やす部品\nfunction CountButton() {\n  const { setCount } = useContext(CountContext)\n  return <button onClick={() => setCount((c) => c + 1)}>+1</button>\n}\n\nfunction App() {\n  return (\n    <CountProvider>\n      <CountLabel />\n      <CountButton />\n    </CountProvider>\n  )\n}`,
          live: true,
          mount: '<App />',
          note: 'CountLabel と CountButton は props を一切受け取っていません。それでも同じ count を共有できるのが Context です。ボタンを押すと、Provider の state が変わり、両方が更新されます。',
        },
      ],
    },
    {
      id: 'custom-hook-teaser',
      heading: '9-4. useContext を包んで使いやすくする',
      body: [
        '実際のアプリでは、useContext(CountContext) を毎回書く代わりに、useCount() のような専用の関数にまとめるのが定番です。「Provider の外で使ったら教えてくれる」安全装置も付けられます。',
        'この「自分で use〇〇 を作る」テクニックは、まさに次章のカスタムフックです。Context とカスタムフックは、セットで使われることがとても多い相棒同士です。',
      ],
      examples: [
        {
          code: `function useCount() {\n  const ctx = useContext(CountContext)\n  if (!ctx) {\n    throw new Error('useCount は CountProvider の中で使ってください')\n  }\n  return ctx\n}\n\n// 使う側はスッキリ\nfunction CountLabel() {\n  const { count } = useCount()\n  return <p>現在: {count}</p>\n}`,
          note: 'useContext を直接呼ばず useCount() を呼ぶ形にすると、使い方が統一され、Provider の付け忘れもエラーで気づけます。',
        },
      ],
    },
    {
      id: 'caution',
      heading: '9-5. 使いどころ ― 何でも Context にしない',
      body: [
        'Context は便利ですが、何でも入れると「どこで値が変わるか分かりにくいアプリ」になります。目安は「本当にアプリの広い範囲で共有する、変わりにくい値」――ログインユーザー、テーマ、言語、カートなど。',
        '1つの画面の中だけで使う値は、ふつうに useState と props で十分です。「遠くまで届けたいときだけ Context」と覚えておきましょう。',
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'Provider の value が変わると、それを使っている部品はすべて再描画されます。頻繁に変わる大きな値を1つの Context に詰め込むと重くなることがあるので、関心ごとに Context を分けるのがコツです。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '9-6. この章のまとめ',
      body: [
        'Context は props のバケツリレーを飛ばして、離れた部品へ値を届けるしくみ。「①createContext で作る → ②Provider で配る範囲を囲む → ③useContext で受け取る」の3ステップ。',
        'useContext を useCount() のような専用関数（カスタムフック）に包むと使いやすく安全になる。Context はアプリ全体で共有する値だけに使い、画面内だけの値は useState＋props で十分。',
        '次の章では、その「自分で use〇〇 を作る」カスタムフックそのものを学びます。ロジックを部品から切り出して再利用できるようになります。',
      ],
    },
  ],
}

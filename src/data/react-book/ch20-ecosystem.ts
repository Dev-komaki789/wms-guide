import type { ReactChapter } from './types'

// 第20章「次の一歩 ― React のまわりの道具」。プログラミング初心者向け。
export const ch20Ecosystem: ReactChapter = {
  id: 'ecosystem',
  num: 20,
  title: '次の一歩 ― React のまわりの道具（エコシステム）',
  summary: 'React 本体の話はここまでで十分です。最後に、実務でよく一緒に使われる“まわりの道具”を、どんなときに必要になるかとセットで軽く紹介します。今すぐ使う必要はなく、「困ったらこれがある」と知っておくための地図です。',
  intro: [
    'React 単体でアプリは作れますが、規模が大きくなると「これは専用の道具に任せた方が楽」という場面が出てきます。最後に、その代表を紹介します。',
    'どれも「必要になってから学べばいい」もの。ここでは名前と使いどころだけ押さえ、地図を持っておきましょう。',
  ],
  sections: [
    {
      id: 'data-fetching',
      heading: '20-1. データ取得：TanStack Query / SWR',
      body: [
        '第11章で fetch ＋（loading / error / data）の手書きパターンを学びました。これを毎回書くのは大変で、しかも「再取得・キャッシュ・画面間の共有・自動更新」まで考えると複雑になります。',
        'TanStack Query（旧 React Query）や SWR は、それを丸ごと面倒見てくれるライブラリです。useQuery(\'products\', fetchProducts) のように書くだけで、キャッシュ・ローディング・エラー・再取得を自動でやってくれます。',
      ],
      examples: [
        {
          code: `// TanStack Query のイメージ\nfunction ProductList() {\n  const { data, isLoading, error } = useQuery({\n    queryKey: ['products'],\n    queryFn: () => fetch('/api/products').then((r) => r.json()),\n  })\n\n  if (isLoading) return <p>読み込み中…</p>\n  if (error) return <p>エラー</p>\n  return <ul>{data.map((p) => <li key={p.id}>{p.name}</li>)}</ul>\n}`,
          note: '第11章の手書きパターンが、これだけになります。サーバーのデータを多く扱うアプリでは、ほぼ定番。「fetch の useEffect を何度も書いて疲れてきた」と感じたら導入の合図です。',
        },
      ],
    },
    {
      id: 'global-state',
      heading: '20-2. グローバル状態：Zustand / Redux',
      body: [
        '第9章の Context は「アプリ全体で共有する値」に向きますが、状態が大きく・更新が複雑になると、Context だけでは扱いにくくなります（再描画の範囲が広がる等）。',
        'そんなときは Zustand（軽量・シンプル）や Redux（大規模・堅牢、歴史が長い）といった状態管理ライブラリを使います。まずは Context で始め、手に負えなくなったら検討、で十分です。',
      ],
      table: {
        headers: ['道具', '向き'],
        rows: [
          ['useState + 持ち上げ', '1画面の中の状態'],
          ['Context', 'アプリ全体で共有する、変わりにくい値（ログイン・テーマ）'],
          ['Zustand', '手軽にグローバル状態を持ちたい（学習コスト低）'],
          ['Redux (Toolkit)', '大規模・厳格な管理、履歴やデバッグ重視'],
        ],
      },
      callouts: [
        {
          kind: 'tip',
          text: 'いきなり Redux から入る必要はありません。多くのアプリは「useState＋Context」で足ります。「状態管理がつらい」と感じてから、軽い Zustand あたりを試すのがおすすめです。',
        },
      ],
    },
    {
      id: 'testing',
      heading: '20-3. テスト：React Testing Library + Vitest',
      body: [
        '部品が増えると「直したつもりが別の所を壊す」が起きます。これを防ぐのが自動テストです。React では React Testing Library（部品を実際に描画して操作・確認する）＋ Vitest / Jest（テストの実行）が定番。',
        '「ユーザーが見る・操作する形」でテストするのが思想です。たとえば「ボタンを押したら “1 回” と表示される」を、内部実装に依存せず確認します。',
      ],
      examples: [
        {
          code: `import { render, screen } from '@testing-library/react'\nimport userEvent from '@testing-library/user-event'\n\ntest('押すとカウントが増える', async () => {\n  render(<Counter />)\n  await userEvent.click(screen.getByRole('button'))\n  expect(screen.getByText('1 回')).toBeInTheDocument()\n})`,
          note: '「ボタンを探して押す→表示を確認」と、ユーザー目線で書きます。最初から完璧なテストは要りません。「壊れたら困る大事な部分」から少しずつ書くのがコツです。',
        },
      ],
    },
    {
      id: 'a11y',
      heading: '20-4. アクセシビリティ（a11y）の基本',
      body: [
        'アクセシビリティ（a11y）は「誰もが使える」ようにする配慮です。キーボードだけの人、読み上げソフトを使う人にも届くUIにします。難しく考えず、まずは基本だけ。',
      ],
      table: {
        headers: ['基本', '理由'],
        rows: [
          ['意味の合うタグを使う（button は <button>）', 'キーボード操作・読み上げが自然に効く'],
          ['画像に alt を付ける', '画像が見えない人に内容が伝わる'],
          ['入力欄に label を結びつける', '何の入力欄か分かる・押しやすい'],
          ['色だけで情報を伝えない', '色が区別しにくい人にも伝わる'],
        ],
      },
      callouts: [
        {
          kind: 'note',
          text: 'クリックできるものは <div onClick> ではなく <button> にする――これだけでも a11y はぐっと良くなります。「見た目」より先に「意味の合うタグ」を選ぶ習慣を。',
        },
      ],
    },
    {
      id: 'closing',
      heading: '20-5. おわりに ― この本の地図',
      body: [
        'お疲れさまでした。第1〜6章で土台（部品・props・リスト・条件・状態・イベント）、第7〜12章で実アプリの骨組み（副作用・ルーティング・Context・カスタムフック・通信・型）、第13〜15章で一歩進んだフックと最適化、第16〜19章でスタイリング・堅牢化・設計、そしてこの章でまわりの道具を見てきました。',
        'React の核心は最初から最後まで一つです。「画面は状態の写し鏡。状態を変えれば画面がついてくる」。迷ったらここに戻ってください。',
        'ここまでの知識があれば、本物のコードを読む準備は万端です。別セクションの「EC コード解説」で、実際の EC サイトのコードを一緒に読み解いていきましょう。',
      ],
    },
  ],
}

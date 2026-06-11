import type { ReactChapter } from './types'

// 第1章「React とは？ ― コンポーネントと JSX」。プログラミング初心者向け。
export const ch01Jsx: ReactChapter = {
  id: 'jsx',
  num: 1,
  title: 'React とは？ ― コンポーネントと JSX',
  summary: 'まず React がそもそも何をする道具なのかをつかみます。キーワードは「画面を“部品”で組み立てる」こと。そして部品を書くための特別な記法 JSX を、はじめての人向けにやさしく紹介します。',
  intro: [
    'この本は「React（リアクト）」を、プログラミングがはじめての人にも分かるようにまとめたものです。むずかしい言葉は出てくるたびにかみくだいて説明します。',
    'React は、Web ページの「見た目」を作るための JavaScript の道具（ライブラリ）です。まずはこの章で、React のいちばん大事な考え方をつかみましょう。あせらず上から読んでいけば大丈夫です。',
  ],
  sections: [
    {
      id: 'what-is-react',
      heading: '1-1. React は「画面を部品で組み立てる」道具',
      body: [
        'これまでの Web ページは、1枚の大きな HTML を書いて作るのがふつうでした。でもページが大きくなると、どこに何があるか分からなくなり、同じような見た目を何度も書くことになります。',
        'React の考え方はこうです。「ボタン」「商品カード」「ヘッダー」といった画面のパーツを、ひとつずつ“部品”として作っておき、それを組み合わせてページを作る。レゴブロックを組み立てるイメージです。',
        'この“部品”のことを、React ではコンポーネント（component）と呼びます。この本のほとんどは「コンポーネントの作り方・組み合わせ方」の話だと思ってください。',
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：コンポーネント（component）＝「部品」「構成要素」という意味の英語。React では「画面のパーツひとつ」を指します。',
        },
      ],
    },
    {
      id: 'component',
      heading: '1-2. コンポーネント＝「画面のかけらを返す関数」',
      body: [
        'コンポーネントの正体は、ただの JavaScript の関数です。ふつうの関数は数値や文字を返しますが、コンポーネントは「画面の見た目（HTML のようなもの）」を返します。',
        '下が、いちばん小さなコンポーネントです。Welcome という名前の関数が、見出しを返しています。名前は大文字ではじめるのがルールです（小文字だと React が部品だと気づいてくれません）。',
      ],
      examples: [
        {
          code: `function Welcome() {\n  return <h1>こんにちは！</h1>\n}`,
          live: true,
          mount: '<Welcome />',
          note: '「Welcome という部品は、＜h1＞こんにちは！＜/h1＞ という見た目を返す」と読みます。この関数を画面のあちこちで使い回せます。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'コンポーネントの名前は必ず大文字はじまり（Welcome, ProductCard など）。これは「ふつうの HTML タグ」と「自分で作った部品」を React が見分けるための大事なルールです。',
        },
      ],
    },
    {
      id: 'jsx',
      heading: '1-3. JSX ― JavaScript の中に HTML っぽく書ける記法',
      body: [
        'さきほどの return の後ろにあった <h1>こんにちは！</h1> の部分。これは文字列でも HTML でもなく、JSX（ジェイエスエックス）という React 特有の書き方です。',
        'JSX は「JavaScript の中に、HTML のような見た目をそのまま書ける」便利な記法です。これのおかげで、見た目を直感的に書けます。最終的には React が JSX を本物の画面に変換してくれます。',
      ],
      examples: [
        {
          code: `function Card() {\n  return (\n    <div>\n      <h2>商品名</h2>\n      <p>説明文がここに入ります。</p>\n    </div>\n  )\n}`,
          result: `商品名\n説明文がここに入ります。`,
          note: 'return が複数行になるときは、全体を ( ) で囲むと書きやすいです。見た目は HTML とそっくりですね。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：JSX は “JavaScript XML” の略。XML（HTMLの仲間）のような書き方を JavaScript に混ぜられる、という意味です。',
        },
      ],
    },
    {
      id: 'embed',
      heading: '1-4. JSX の中に値を埋め込む ― { } の波カッコ',
      body: [
        'JSX のいいところは、ただの固定の文字だけでなく、JavaScript の値や計算結果を埋め込めることです。埋め込みたいところを波カッコ { } で囲みます。',
        '波カッコの中には「変数」「計算」「関数の呼び出し」など、値になるものなら何でも書けます。',
      ],
      examples: [
        {
          code: `function Greeting() {\n  const name = 'たなか'\n  const hour = 9\n  return (\n    <div>\n      <p>こんにちは、{name} さん</p>\n      <p>2 + 3 = {2 + 3}</p>\n      <p>{hour < 12 ? '午前' : '午後'}です</p>\n    </div>\n  )\n}`,
          live: true,
          mount: '<Greeting />',
          note: '{name} は変数の中身、{2 + 3} は計算結果、{hour < 12 ? ...} は条件によって変わる値です。文字の中に「動く部分」を差し込めるのが波カッコです。',
        },
      ],
      callouts: [
        {
          kind: 'warn',
          text: '波カッコに書けるのは「値になるもの（式）」だけです。if 文や for 文のような「文」はそのまま書けません。条件分岐やくり返しは第3章・第4章で別のやり方を学びます。',
        },
      ],
    },
    {
      id: 'rules',
      heading: '1-5. JSX のちょっとしたルール',
      body: [
        'JSX は HTML にそっくりですが、JavaScript の一部なので、いくつか HTML とちがう点があります。最初につまずきやすいものだけ表にまとめます。',
      ],
      table: {
        headers: ['ルール', 'HTML では', 'JSX では'],
        rows: [
          ['class 属性', 'class="card"', 'className="card"（class は予約語のため）'],
          ['属性名', 'onclick / tabindex', 'onClick / tabIndex（途中で大文字＝キャメルケース）'],
          ['閉じタグ', '<br> や <img> でOK', '<br /> や <img /> と必ず閉じる'],
          ['返すのは1つの親', '複数並べてOK', '全体を1つのタグで包む（または <> </>）'],
        ],
      },
      examples: [
        {
          code: `// 複数の要素を返したいときは、ひとつの親で包む。\n// 余計な <div> を増やしたくなければ、空っぽのタグ <> </>（フラグメント）が便利。\nfunction Info() {\n  return (\n    <>\n      <h2 className="title">お知らせ</h2>\n      <p>本日は晴天なり。</p>\n    </>\n  )\n}`,
          note: '<> </> は「名前のない包み」で、画面には何も足さずに複数要素をまとめてくれます。フラグメント（fragment）と呼びます。',
        },
      ],
    },
    {
      id: 'compose',
      heading: '1-6. 部品を組み合わせる',
      body: [
        'コンポーネントは、別のコンポーネントの中で「タグのように」使えます。これが「部品で組み立てる」の正体です。自分で作った部品を <Welcome /> のように書くだけで呼び出せます。',
      ],
      examples: [
        {
          code: `function Welcome() {\n  return <h1>こんにちは！</h1>\n}\n\nfunction App() {\n  return (\n    <div>\n      <Welcome />\n      <Welcome />\n      <p>ようこそ React の世界へ。</p>\n    </div>\n  )\n}`,
          live: true,
          mount: '<App />',
          note: '<Welcome /> を2回書けば、同じ部品が2回表示されます。一度作った部品を何度でも使い回せる――これが React の強みです。',
        },
      ],
      mermaid: `flowchart TD\n  App["App（ページ全体）"] --> H["Header（部品）"]\n  App --> M["商品一覧（部品）"]\n  M --> C1["ProductCard（部品）"]\n  M --> C2["ProductCard（部品）"]\n  App --> F["Footer（部品）"]`,
      callouts: [
        {
          kind: 'tip',
          text: '大きなページも、こうして「部品の中に部品」を入れ子にして組み立てます。上の図のように、App という大きな部品の中に小さな部品が並ぶ“木”の形になります。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '1-7. この章のまとめ',
      body: [
        'React は「画面を部品（コンポーネント）で組み立てる」道具。コンポーネントは「画面のかけらを返す関数」で、名前は大文字はじまり。',
        'その見た目は JSX（HTML っぽい記法）で書き、値は波カッコ { } で埋め込む。class は className、タグは必ず閉じる、返すのは1つの親、といったルールがある。',
        '次の章では、部品に「外から値をわたして」中身を変える方法（props）を学びます。同じ ProductCard でも、商品ごとに違う名前・値段を表示できるようになります。',
      ],
    },
  ],
}

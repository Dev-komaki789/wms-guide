import type { TodoChapter } from './types'

// 第3章「JSX とコンポーネントの基本 ― 画面を関数で書く」。
export const ch03Jsx: TodoChapter = {
  id: 'jsx',
  num: 3,
  title: 'JSX とコンポーネントの基本 ― 画面を関数で書く',
  summary:
    'React の画面は「関数」で書きます。その関数の中に、HTML そっくりの JSX を返すだけ。TODO アプリの「ガワ（入力欄と2つのリスト枠）」を、まず動かないただの見た目として置いてみましょう。',
  intro: [
    'React では、画面のかたまりを「コンポーネント（部品）」と呼び、ただの関数として書きます。関数が return するのが JSX（ジェイエスエックス）――HTML にそっくりな書き方で、画面の形を表します。',
    'この章では「まだ動かないけど、見た目だけある TODO アプリの枠」を作ります。動き（追加・完了・削除）は次章以降で足していきます。',
  ],
  sections: [
    {
      id: 'component',
      heading: '3-1. コンポーネント＝画面を返す関数',
      body: [
        '下の Hello は、ひとつのコンポーネントです。大文字で始まる名前の関数で、JSX を return しています。これを <Hello /> のようにタグの形で呼ぶと、画面に出ます。',
        '関数名が必ず大文字始まりなのは React の約束です（小文字だと、ただの HTML タグだと勘違いされます）。',
      ],
      examples: [
        {
          code: `function Hello() {
  return <p>はじめての React！</p>
}`,
          live: true,
          mount: '<Hello />',
          note: 'return のうしろに置いた JSX が、そのまま画面になります。',
        },
      ],
    },
    {
      id: 'jsx-rules',
      heading: '3-2. JSX のルール（HTML との小さな違い）',
      body: [
        'JSX は HTML にそっくりですが、いくつか違いがあります。最初につまずきやすいのは次の3つです。',
        'とくに「returnする要素は1つにまとめる」が大事。複数並べたいときは、全体を <div>…</div> で包むか、空タグ <>…</> で包みます。',
      ],
      table: {
        headers: ['HTML', 'JSX', 'なぜ'],
        rows: [
          ['class="..."', 'className="..."', 'class は JS の予約語なので避ける'],
          ['<input>', '<input />', 'JSX は閉じない要素も必ず閉じる'],
          ['複数要素を並べる', '1つの親で包む', 'return は1つの要素しか返せない'],
        ],
      },
      examples: [
        {
          code: `function Box() {
  return (
    <div className="card">
      <p className="title">未完了のTODO</p>
      <p>ここに一覧が並ぶ予定</p>
    </div>
  )
}`,
          live: true,
          mount: '<Box />',
          note: '2つの <p> を、ひとつの <div> で包んでから返しています。class ではなく className を使う点にも注目。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: '丸かっこ ( ) は「JSX を複数行で書きやすくする」ためのもの。return ( と書いて改行すると読みやすくなります。なくても動きますが、付ける習慣がおすすめです。',
        },
      ],
    },
    {
      id: 'curly',
      heading: '3-3. { } で JavaScript を埋め込む',
      body: [
        'JSX の中で波かっこ { } を使うと、その中に JavaScript の値を埋め込めます。変数の表示も、簡単な計算も、ここでできます。これが「データを画面に映す」第一歩です。',
        '素の JS の innerText = todo に当たる部分が、React では {todo} と書くだけになります。',
      ],
      examples: [
        {
          code: `function Greeting() {
  const name = 'たなか'
  const count = 3
  return (
    <div>
      <p>こんにちは、{name} さん</p>
      <p>残りのタスクは {count} 件です</p>
    </div>
  )
}`,
          live: true,
          mount: '<Greeting />',
          note: '{name} や {count} の部分が、変数の中身に置きかわって表示されます。文字を "" でつなぐ必要はありません。',
        },
      ],
    },
    {
      id: 'skeleton',
      heading: '3-4. TODO アプリの「ガワ」を置く',
      body: [
        'ここまでを使って、TODO アプリの見た目の枠だけを作ります。入力欄・「未完了」枠・「完了」枠の3つを置きます。まだボタンを押しても何も起きません（動きは次章から）。',
        'className に input-area / incomplete-area / complete-area / title を付けています。これは第9章で CSS を当てるための目印です（このプレビューでは見た目も付けてあります）。',
      ],
      examples: [
        {
          code: `function TodoApp() {
  return (
    <div className="todo-app">
      <div className="input-area">
        <input placeholder="タスクを入力してください" />
        <button>追加</button>
      </div>

      <div className="incomplete-area">
        <p className="title">未完了のTODO</p>
        <ul></ul>
      </div>

      <div className="complete-area">
        <p className="title">完了のTODO</p>
        <ul></ul>
      </div>
    </div>
  )
}`,
          live: true,
          mount: '<TodoApp />',
          note: 'これが土台です。ここから「入力を覚える」「追加で一覧に出す」と、章ごとに命を吹き込んでいきます。',
        },
      ],
    },
  ],
}

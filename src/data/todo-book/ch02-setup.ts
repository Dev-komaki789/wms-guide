import type { TodoChapter } from './types'

// 第2章「開発環境を用意する ― Vite で React プロジェクトを作る」。
export const ch02Setup: TodoChapter = {
  id: 'setup',
  num: 2,
  title: '開発環境を用意する ― Vite で React プロジェクトを作る',
  summary:
    'React を動かすための入れ物（プロジェクト）を、Vite（ヴィート）という道具で1分ほどで用意します。コマンドの意味と、できあがるファイルの役割を確認しましょう。',
  intro: [
    '素の JS なら HTML ファイルを1枚用意すれば動きました。React は「部品（コンポーネント）」を組み合わせて作るので、それをまとめてブラウザ用に変換してくれる道具が必要です。それが Vite です。',
    'ここではコマンドを順に打つだけで環境ができます。中身の細かい仕組みは分からなくても大丈夫。「こう打つと開発サーバーが立ち上がる」ことだけ押さえましょう。',
  ],
  sections: [
    {
      id: 'create',
      heading: '2-1. プロジェクトを作る',
      body: [
        'ターミナル（黒い画面）で次のコマンドを実行します。Node.js が入っていることが前提です（入っていなければ公式サイトから LTS 版を入れてください）。',
        'create vite で雛形が作られ、cd で中に入り、install で必要な部品を取り込み、dev で開発サーバーを起動します。表示された http://localhost:5173 をブラウザで開くと、React の初期画面が出ます。',
      ],
      examples: [
        {
          code: `# todo-app という名前で、React + JavaScript の雛形を作る
npm create vite@latest todo-app -- --template react

cd todo-app        # 作られたフォルダに入る
npm install        # 必要な部品をダウンロード
npm run dev        # 開発サーバーを起動（保存すると即反映される）`,
          lang: 'bash',
          note: 'あとで TypeScript 版（第11章）を作るときは --template react-ts を選びます。今はまず JavaScript 版（react）で進めます。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'npm run dev で立ち上がるのは「ホットリロード」付きの開発サーバー。ファイルを保存した瞬間にブラウザが自動で更新されます。素の JS で毎回リロードしていた手間がなくなります。',
        },
      ],
    },
    {
      id: 'files',
      heading: '2-2. できあがるファイルの役割',
      body: [
        '雛形にはたくさんファイルがありますが、最初に意識するのは数個だけです。下の表の3つが分かれば十分です。',
        'この本では主に src/App.jsx を書き換えていきます。見た目の CSS は src 直下に置いた CSS ファイル（例：styles.css）に書き、App.jsx から読み込みます（第9章）。',
      ],
      table: {
        headers: ['ファイル', '役割'],
        rows: [
          ['index.html', '土台の HTML。中に <div id="root"> が1つだけある'],
          ['src/main.jsx', 'React を起動して、App を root に流し込む入口'],
          ['src/App.jsx', 'アプリ本体。ここに画面を書く（今回の主役）'],
        ],
      },
    },
    {
      id: 'main',
      heading: '2-3. 入口（main.jsx）はこうつながっている',
      body: [
        '素の JS では <script> で読み込んだファイルが直接 DOM をいじりました。React では main.jsx が「App という部品を root に描画してね」と React にお願いします。createRoot(...).render(<App />) がその一行です。',
        'ふだんこの main.jsx を触ることはほとんどありません。「App.jsx に書いた画面が、ここを通じて index.html の root に表示される」という流れだけ知っておけば十分です。',
      ],
      examples: [
        {
          code: `// src/main.jsx（雛形が用意してくれる。基本さわらない）
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)`,
          note: '<App /> が、これから自分で書く画面です。次の章では、この App を「自分のあいさつ画面」に書き換えて、JSX の基本を体験します。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：StrictMode は「開発中だけ、あやしい書き方を見つけて警告してくれる」見張り役。本番の画面には影響しません。そのまま残しておけば OK です。',
        },
      ],
    },
  ],
}

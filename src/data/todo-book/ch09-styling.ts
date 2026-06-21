import type { TodoChapter } from './types'

// 第9章「見た目を整える ― styles.css を当てる」。
export const ch09Styling: TodoChapter = {
  id: 'styling',
  num: 9,
  title: '見た目を整える ― styles.css を当てる',
  summary:
    '機能はできたので、見た目を整えます。元の TODO アプリと同じ teal（青緑）系のデザインを、CSS ファイル1枚で当てます。React 側はすでに付けてある className が、そのまま CSS の目印になります。',
  intro: [
    'ここまで className（input-area / incomplete-area / complete-area / title / list-row / todo-item）を付けてきました。これらは見た目を当てるための目印です。',
    'CSS の書き方自体は素の HTML/CSS と同じ。React 特有なのは「class ではなく className と書く」点だけ。あとはふつうの CSS ファイルを読み込めば反映されます。',
  ],
  sections: [
    {
      id: 'import',
      heading: '9-1. CSS ファイルを読み込む',
      body: [
        'src フォルダに styles.css を作り、App.jsx の先頭で import します。Vite では import "./styles.css" と書くだけで、そのスタイルがアプリ全体に効きます。<link> タグを HTML に書く必要はありません。',
      ],
      examples: [
        {
          code: `// src/App.jsx の先頭
import { useState } from 'react'
import './styles.css'   // ← これで styles.css が読み込まれる`,
          note: 'import で CSS を読み込むのは Vite（や多くの React 環境）の便利機能。JS と一緒に管理できて、使っていない CSS の取り込み忘れも防げます。',
        },
      ],
    },
    {
      id: 'css',
      heading: '9-2. styles.css（元のデザインを踏襲）',
      body: [
        '下が styles.css です。元の TODO アプリのデザインをそのまま使います。className とこの CSS のセレクタ（.input-area など）が対応しているのがポイントです。',
        '元のコードでは <ul> に既定の点（・）やインデントが付くので、list-style: none などで整えています。あとは色・余白・角丸を指定しているだけです。',
      ],
      examples: [
        {
          code: `body {
  font-family: sans-serif;
  color: #666;
}

input {
  border-radius: 8px;
  border: none;
  padding: 8px;
}

button {
  border-radius: 8px;
  border: none;
  padding: 4px 16px;
  margin: 0px 2px;
  cursor: pointer;
}

button:hover {
  background-color: #79a8a9;
  color: #fff;
}

.input-area {
  background-color: #c6e5df;
  width: 400px;
  padding: 8px;
  margin: 8px;
  border-radius: 6px 16px;
  display: flex;
  gap: 8px;
}

.incomplete-area,
.complete-area {
  border: 2px solid #aacfd0;
  width: 400px;
  min-height: 200px;
  padding: 8px;
  margin: 8px;
  border-radius: 8px;
}

.complete-area {
  background-color: #c9dede;
}

.title {
  text-align: center;
  margin-top: 0;
  font-weight: bold;
}

ul {
  list-style: none;
  padding-left: 0;
}

.list-row {
  display: flex;
  align-items: center;
}

.todo-item {
  margin: 6px;
  flex: 1;
}`,
          lang: 'css',
          note: '元の styles.css に、入力エリアを横並びにする display: flex と、ul の点を消す指定を少し足しただけ。色（#c6e5df / #aacfd0 / #c9dede）はそのまま引き継いでいます。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'width: 400px は画面が狭いとはみ出ます。スマホも考えるなら width: 400px の代わりに max-width: 400px にすると、狭い画面では自動で縮みます（このサイトのプレビューでもそうしています）。',
        },
      ],
    },
    {
      id: 'jsx-class',
      heading: '9-3. JSX 側の確認（className）',
      body: [
        'JSX 側はもう準備済みです。各要素に付けた className が、上の CSS のセレクタと結びつきます。たとえば <div className="input-area"> が .input-area のスタイルを受け取ります。',
        '繰り返しですが、HTML の class= ではなく className= と書く点だけ注意。これで見た目まで含めて、元の TODO アプリとそろいました。',
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'もっと本格的にやるなら、CSS Modules（styles.module.css）や Tailwind CSS といった方法もあります。まずは「ふつうの CSS を1枚 import する」やり方で十分です。',
        },
      ],
    },
  ],
}

import type { ReactChapter } from './types'

// 第16章「スタイリング ― className と Tailwind」。プログラミング初心者向け。
export const ch16Styling: ReactChapter = {
  id: 'styling',
  num: 16,
  title: 'スタイリング ― className と Tailwind',
  summary: 'ここまで「見た目の付け方」に触れていませんでした。React で CSS を当てる基本（className）、条件で見た目を変える方法、そして EC サイトでも使っている Tailwind CSS を、やさしく紹介します。',
  intro: [
    '第1章で「class ではなく className と書く」と少し触れましたが、見た目の付け方そのものはまだ説明していませんでした。この章でそれを扱います。',
    'React 自体は見た目に決まりを持たず、CSS の当て方は何通りもあります。ここでは初心者がまず知るべきものに絞ります。EC サイトや、このサイト自身が使っている Tailwind CSS も紹介します。',
  ],
  sections: [
    {
      id: 'classname',
      heading: '16-1. className ― CSS クラスを当てる',
      body: [
        'HTML の class 属性は、React（JSX）では className と書きます（class は JavaScript の予約語のため）。当てたクラスの見た目は、別途 CSS ファイルで定義します。',
      ],
      examples: [
        {
          code: `// CSS 側（例: styles.css）\n// .card { border: 1px solid #ddd; border-radius: 8px; padding: 16px; }\n\nfunction ProductCard({ name }) {\n  return <div className="card">{name}</div>\n}`,
          note: 'className="card" で .card のスタイルが当たります。複数当てたいときは className="card highlight" のようにスペース区切りで並べます。',
        },
      ],
    },
    {
      id: 'conditional-class',
      heading: '16-2. 条件でクラスを切り替える',
      body: [
        '「選択中なら色を変える」のように、状態に応じてクラスを出し分けたいことがよくあります。JSX の波カッコの中で、テンプレートリテラル（バッククオート）や三項演算子を使って組み立てます。',
      ],
      examples: [
        {
          code: `function Tab({ active }) {\n  // active のときだけ 'tab-active' を足す\n  return (\n    <button className={\`tab \${active ? 'tab-active' : ''}\`}>\n      タブ\n    </button>\n  )\n}\n\n// クラスが増えるなら配列 + join も読みやすい\nfunction Tab2({ active, disabled }) {\n  const classes = ['tab', active && 'tab-active', disabled && 'is-disabled']\n    .filter(Boolean)\n    .join(' ')\n  return <button className={classes}>タブ</button>\n}`,
          note: '条件が増えると見づらくなるので、実務では clsx / classnames という小さなライブラリで clsx(\'tab\', { \'tab-active\': active }) のように書くこともよくあります（まずは上の書き方で十分）。',
        },
      ],
    },
    {
      id: 'tailwind',
      heading: '16-3. Tailwind CSS ― 小さなクラスを並べて作る',
      body: [
        'Tailwind CSS は、いま最も広く使われているスタイリング手法のひとつです。EC サイトもこのサイトも Tailwind を使っています。特徴は「自分で CSS を書かず、用意された小さなクラスを className に並べるだけ」で見た目が作れること。',
        'たとえば p-4（内側の余白）、text-lg（文字大きめ）、rounded-xl（角丸）、bg-white（背景白）のように、1クラス＝1つの効果。これを必要なだけ並べます。',
      ],
      examples: [
        {
          code: `// Tailwind：CSSファイルを書かず、クラスを並べるだけ\nfunction ProductCard({ name, price }) {\n  return (\n    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">\n      <h2 className="text-lg font-bold text-gray-800">{name}</h2>\n      <p className="mt-1 text-blue-600">{price} 円</p>\n    </div>\n  )\n}`,
          note: 'rounded-xl=角丸, border=枠線, bg-white=背景白, p-4=余白, text-lg=文字大, font-bold=太字…と、1クラス1効果。最初は呪文に見えますが、よく使うものは数十個なのですぐ慣れます。EC のコードもこの形なので、読めると一気に理解が進みます。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'Tailwind のクラス一覧は公式サイトで検索できます（「tailwind padding」などで調べる）。最初は「全部覚える」のではなく、見たクラスをその都度調べる、で十分です。',
        },
        {
          kind: 'note',
          text: 'Tailwind は「実際にコードに書かれたクラスだけ」をビルド時に集めて CSS を作ります。なので、文字列を実行時に組み立てて作った“存在しないクラス名”はスタイルが当たらないことがあります（クラス名はなるべくそのまま書く）。',
        },
      ],
    },
    {
      id: 'inline',
      heading: '16-4. インラインスタイル ― 動的な値に',
      body: [
        '計算した数値などを直接スタイルに入れたいときは、style 属性が使えます。React では style にオブジェクトを渡し、プロパティ名はキャメルケース（background-color → backgroundColor）にします。',
        '下のボタンは、押すたびに状態が変わり、その状態に応じて色（インラインスタイル）が切り替わります。実際に押してみてください。',
      ],
      examples: [
        {
          code: `function ToggleButton() {\n  const [on, setOn] = useState(false)\n  return (\n    <button\n      onClick={() => setOn(!on)}\n      style={{\n        background: on ? '#2563eb' : '#e2e4e8',\n        color: on ? 'white' : '#333',\n        padding: '6px 16px',\n        borderRadius: 8,\n        border: 'none',\n      }}\n    >\n      {on ? 'ON' : 'OFF'}\n    </button>\n  )\n}`,
          live: true,
          mount: '<ToggleButton />',
          note: 'style={{ ... }} の外側の { } は「JSXに値を埋め込む波カッコ」、内側の { } は「スタイルのオブジェクト」。だから波カッコが2重になります。数値は borderRadius: 8 のように単位なしで書くと px 扱いになります。',
        },
      ],
      callouts: [
        {
          kind: 'warn',
          text: 'インラインスタイルは「動的な値（計算結果など）」に向きますが、多用すると読みづらく・再利用しづらくなります。固定の見た目は className（CSS や Tailwind）で当て、本当に動的な部分だけ style を使う、と使い分けましょう。',
        },
      ],
    },
    {
      id: 'css-modules',
      heading: '16-5. CSS Modules（紹介）',
      body: [
        'もうひとつよく使われるのが CSS Modules です。Card.module.css のようなファイルに普通の CSS を書き、import して styles.card のように使います。「クラス名がファイルごとに自動でユニークになる」ので、別の場所の同名クラスと衝突しません。',
        'Tailwind か CSS Modules か（あるいは併用か）はプロジェクトの方針次第です。この本の題材（EC・このサイト）は Tailwind なので、まずは Tailwind に慣れておけば十分です。',
      ],
      examples: [
        {
          code: `// Card.module.css に .card { ... } と書いておく\nimport styles from './Card.module.css'\n\nfunction Card({ name }) {\n  return <div className={styles.card}>{name}</div>\n}`,
          note: 'styles.card は、ビルド時に card_x8f2 のような衝突しない名前へ自動変換されます。「クラス名のぶつかり」を気にせず書けるのが利点です。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '16-6. この章のまとめ',
      body: [
        '見た目は className で CSS クラスを当てる（class ではなく className）。条件での出し分けはテンプレートリテラルや配列+join、増えたら clsx などのライブラリ。',
        'Tailwind は「小さなクラスを並べて作る」手法で、EC もこのサイトも採用。動的な値には style（オブジェクト・キャメルケース・波カッコ2重）。クラス名の衝突を避けたいなら CSS Modules。',
        '次の章では、アプリを「壊れに強く・賢く読み込む」ための仕組み（エラーバウンダリ・Suspense/lazy・Portal）を学びます。',
      ],
    },
  ],
}

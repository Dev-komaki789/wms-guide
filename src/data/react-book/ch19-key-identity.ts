import type { ReactChapter } from './types'

// 第19章「key とコンポーネントの同一性」。プログラミング初心者向け。
export const ch19KeyIdentity: ReactChapter = {
  id: 'key-identity',
  num: 19,
  title: 'key とコンポーネントの同一性 ― なぜ state がリセットされるのか',
  summary: '第3章で出た key を、もう一歩深く理解します。React は部品を「どう同じものだと見分けているか」を知ると、「フォームの中身が突然消えた」「key を変えたらリセットされた」といった不思議な挙動の理由が分かります。',
  intro: [
    '第3章で「リストには key を付ける」と学びました。実は key には、もうひとつ大事な働きがあります。それは「コンポーネントが前回と“同じものか・別物か”を React に教える」ことです。',
    'これは「コンポーネントの同一性（identity）」という考え方につながります。少し不思議な挙動の理由が、ここで腑に落ちるはずです。',
  ],
  sections: [
    {
      id: 'position',
      heading: '19-1. React は「位置」で部品を見分ける',
      body: [
        'React は再レンダリングのとき、前回と今回のツリーを見比べて「同じ位置にある同じ種類の部品は、同じものだ」と判断し、その state を引き継ぎます。逆に種類や位置が変わると「別物だ」と見なし、state を捨てて作り直します。',
        'だから、同じ <Counter /> でも「同じ場所に出し続ける」かぎり、その中の state（カウント）は保持されます。これがふだん「画面が更新されても入力中の文字が消えない」理由です。',
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：同一性（identity）＝「これは前回のアレと同じ部品か？」という React の判断。同じと見なせば state を引き継ぎ、別物と見なせば state を初期化して作り直します。',
        },
      ],
    },
    {
      id: 'key-resets',
      heading: '19-2. key を変えると state がリセットされる',
      body: [
        'key は「位置が同じでも、別物として扱ってほしい」と React に伝える印です。同じ場所の同じ部品でも、key が変わると React は「別物だ」と判断し、state を捨てて新品で作り直します。',
        '下の例で確かめましょう。「+1」でカウンタを増やしてから「リセット」を押すと、カウンタの key が変わり、中の state が初期化されて 0 に戻ります。Counter 自身は何も変えていないのに、外から key を変えるだけでリセットできるのです。',
      ],
      examples: [
        {
          code: `function Counter() {\n  const [n, setN] = useState(0)\n  return <button onClick={() => setN(n + 1)}>このカウンタ: {n}（+1）</button>\n}\n\nfunction Demo() {\n  const [key, setKey] = useState(0)\n  return (\n    <div>\n      <Counter key={key} />\n      <button onClick={() => setKey(key + 1)}>リセット（key を変える）</button>\n    </div>\n  )\n}`,
          live: true,
          mount: '<Demo />',
          note: '「+1」で増やし→「リセット」を押すと 0 に戻ります。key を変える＝React にとって別の Counter になる＝state も新品。この「key でリセット」は、たとえば「編集対象を切り替えたらフォームを初期化したい」ときの定番テクニックです。',
        },
      ],
    },
    {
      id: 'index-key',
      heading: '19-3. だから「リストの key に index はダメ」',
      body: [
        '第3章で「リストの key に配列の番号（index）を使うな」と言ったのも、同じ理由です。並べ替えや途中への追加・削除が起きると、同じ index が“別の中身”を指すようになります。',
        'すると React は「key が同じ＝同じ部品」と誤解し、前の行の state（入力中の文字やチェック状態）を、ズレた別の行に引き継いでしまいます。だから key には、中身に結びついた安定した値（id）を使うのです。',
      ],
      examples: [
        {
          code: `// ❌ index を key にすると、並べ替え・削除で state がズレる\n{items.map((item, index) => <Row key={index} item={item} />)}\n\n// ✅ 中身に固定の id を key にすれば、同じ中身に同じ部品が対応する\n{items.map((item) => <Row key={item.id} item={item} />)}`,
          note: '「先頭の行を削除」したとき、index だと全部の key が1つずつズレ、各行の入力状態が隣にずれて見えます。id を key にすれば、削除された行だけが正しく消えます。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'まとめると key は「React にとっての“この部品の本名”」。本名が同じなら同じ部品（state 引き継ぎ）、変われば別物（state 初期化）。リストでは中身の id を本名にする、と覚えましょう。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '19-4. この章のまとめ',
      body: [
        'React は「同じ位置・同じ種類」の部品を同じものと見なし、state を引き継ぐ。key はその判断を上書きする印で、key が変わると「別物」として state がリセットされる。',
        'この性質を使うと、key を変えるだけでフォーム等を意図的に初期化できる。逆にリストで index を key にすると、並べ替え・削除で state が別の行へズレるので、必ず中身の id を使う。',
        '次は最終章。React のまわりにある“次の一歩”の道具（データ取得・状態管理・テスト・アクセシビリティ）を紹介します。',
      ],
    },
  ],
}

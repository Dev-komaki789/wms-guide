import type { EcChapter } from './types'

// EC コード解説 #5「カートのしくみ」。
export const ch05Cart: EcChapter = {
  id: 'cart',
  num: 5,
  title: 'カートのしくみ ― CartContext とトースト通知',
  summary: 'カートの状態をアプリ全体で共有する CartContext と、操作の成否を知らせるトースト（Toast）を読みます。Context が別の Context（Auth）に依存する形や、失敗をまとめて扱う工夫が見どころです。',
  relatedReact: ['第9章 Context', '第7章 useEffect', '第17章 Portal'],
  intro: [
    'カートの中身は、ヘッダーの個数バッジとカート画面の両方で同じものを見たい――典型的な「共有したい状態」です。cart/CartContext.tsx が担います。',
    'この EC では、カート操作はすべてサーバー側のカート（DB）を更新し、その戻り値（最新カート）で state を更新する、というシンプルな方針です。',
  ],
  sections: [
    {
      id: 'depends-auth',
      heading: '5-1. ログイン状態の変化に追従する',
      body: [
        'カートはログインした人のものなので、「ログイン状態が変わったら読み直す」必要があります。CartProvider は useAuth() で user を見て、user が変わるたびに useEffect でカートを読み直します。第7章の「依存配列に user を入れる」実例です。',
      ],
      examples: [
        {
          file: 'src/cart/CartContext.tsx',
          code: `export function CartProvider({ children }: { children: ReactNode }) {\n  const { user } = useAuth()           // 別の Context を利用\n  const { notify } = useToast()\n  const [cart, setCart] = useState<Cart | null>(null)\n\n  useEffect(() => {\n    let cancelled = false\n    async function load() {\n      if (!user) { setCart(null); return }   // ログアウトしたら空に\n      try {\n        const c = await getCart()\n        if (!cancelled) setCart(c)\n      } catch { /* 取得失敗は次の操作で再取得 */ }\n    }\n    load()\n    return () => { cancelled = true }   // 後片付け\n  }, [user])   // ← user が変わるたび\n}`,
          note: '[user] が依存配列。ログイン/ログアウトで user が変わると再実行。cancelled フラグは第7章で学んだ「途中で状況が変わったら結果を反映しない」後片付け。これが main.tsx で Cart を Auth の内側に置いた理由（第2章）です。',
        },
      ],
    },
    {
      id: 'run',
      heading: '5-2. 操作の失敗をまとめて扱う ― run ヘルパー',
      body: [
        '「追加・数量変更・削除」はどれも「サーバーを更新して最新カートをもらう。失敗したらトーストで知らせる」という同じ形。そこで共通の run ヘルパーにまとめ、各操作はそれを呼ぶだけにしています。第10章「ロジックの切り出し」のミニ版です。',
      ],
      examples: [
        {
          file: 'src/cart/CartContext.tsx',
          code: `// 失敗してもアプリが落ちないよう、各操作で例外を捕まえてトースト通知する\nasync function run(action: () => Promise<Cart>, failMessage: string): Promise<boolean> {\n  try {\n    setCart(await action())   // 成功：返ってきた最新カートで更新\n    return true\n  } catch {\n    notify(failMessage, 'error')  // 失敗：トーストで通知\n    return false\n  }\n}\n\nconst add = (skuCode: string, quantity = 1) =>\n  run(() => addToCart(skuCode, quantity), 'カートに追加できませんでした')\nconst update = (id: number, quantity: number) =>\n  run(() => updateCartItem(id, quantity), '数量を変更できませんでした')\nconst remove = (id: number) => run(() => removeCartItem(id), '削除できませんでした')`,
          note: 'add/update/remove は「やること(action)」と「失敗時の文言」を run に渡すだけ。成否を boolean で返すので、ボタン側は「成功したときだけ“追加しました”を出す」といった分岐ができます（次節）。',
        },
      ],
    },
    {
      id: 'button',
      heading: '5-3. 使う側 ― AddToCartButton',
      body: [
        'ボタン側は useCart().add を呼ぶだけ。未ログインならログインへ誘導し、押している間は「追加中…」、成功したら一瞬「✓ 追加しました」に変わります。第5章（state）・第6章（onClick）・第4章（条件表示）の合わせ技です。',
      ],
      examples: [
        {
          file: 'src/components/AddToCartButton.tsx',
          code: `const { user } = useAuth()\nconst { add } = useCart()\nconst [adding, setAdding] = useState(false)\nconst [added, setAdded] = useState(false)\n\nasync function handleClick() {\n  if (!user) { navigate('/login'); return }   // 未ログインは誘導\n  setAdding(true)\n  try {\n    const ok = await add(skuCode, quantity)\n    if (ok) {                       // 成功したときだけ\n      setAdded(true)\n      window.setTimeout(() => setAdded(false), 1500)\n    }\n  } finally {\n    setAdding(false)\n  }\n}\n\nreturn (\n  <button onClick={handleClick} disabled={adding || disabled} className={...}>\n    {added ? '✓ 追加しました' : adding ? '追加中…' : 'カートに入れる'}\n  </button>\n)`,
          note: 'adding / added の2つの state で表示を3通りに出し分け（第4章の三項のネスト）。失敗時の通知は CartContext が出すので、ボタンは成功時の演出だけ担当。役割がきれいに分かれています。',
        },
      ],
    },
    {
      id: 'toast',
      heading: '5-4. トースト ― どこからでも通知（Portal 的な発想）',
      body: [
        'Toast も Context です。notify(\'メッセージ\', \'error\') をどこからでも呼べ、画面右下に一定時間だけ表示して自動で消えます。通知の一覧自体は ToastProvider が「画面に固定表示」で描いています。',
      ],
      examples: [
        {
          file: 'src/components/Toast.tsx',
          code: `const notify = useCallback((message: string, type: ToastType = 'info') => {\n  const id = nextId++\n  setToasts((prev) => [...prev, { id, message, type }])  // 追加（新配列。第5章）\n  window.setTimeout(() => {\n    setToasts((prev) => prev.filter((t) => t.id !== id)) // 3.5秒後に消す\n  }, 3500)\n}, [])\n\n// Provider は children のあとに「通知の置き場」を固定表示\n<div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2">\n  {toasts.map((t) => (\n    <div key={t.id} className={\`... \${STYLE[t.type]}\`}>{t.message}</div>\n  ))}\n</div>`,
          note: 'setToasts((prev) => [...prev, ...]) と filter は、第5章「配列の state は新しく作って set」の実例。fixed で画面に固定し、map で通知を並べる（key 付き・第3章）。第17章の Portal を使えばさらに堅くできますが、ここでは fixed で十分シンプルに実現しています。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'useCallback で notify を包んでいるのは、第15章で学んだ「関数を同じものに保つ」ため。notify を依存配列に入れる側（例：CartProvider）で無駄な再実行を防げます。',
        },
      ],
    },
  ],
}

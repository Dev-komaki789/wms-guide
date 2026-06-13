import type { EcChapter } from './types'

// EC コード解説 #9「ログイン〜注文の流れ」。
export const ch09OrderFlow: EcChapter = {
  id: 'order-flow',
  num: 9,
  title: 'ログイン〜注文の流れ ― フォーム・useNavigate・確定',
  summary: 'ログイン/登録フォーム（AccountPanel）から、注文確定（CheckoutPage）までの一連の流れを読みます。制御コンポーネント、プログラムからの画面移動、そして「遷移とデータ更新の順番」という実戦的な注意点が見どころです。',
  relatedReact: ['第6章 イベントとフォーム', '第8章 ルーティング', '第4章 条件で出し分ける'],
  intro: [
    '買い物の山場、「ログイン → カート → 注文確定」の流れを読みます。フォームの作り、ログイン後の移動、注文確定での画面遷移の順番に注目します。',
  ],
  sections: [
    {
      id: 'account-panel',
      heading: '9-1. AccountPanel ― ログイン/登録の切り替えフォーム',
      body: [
        'ログイン画面の中身が AccountPanel です。1つのフォームで「ログイン」と「新規登録」をタブで切り替えます。入力欄はすべて第6章の制御コンポーネント（value ＋ onChange）。送信は onSubmit ＋ preventDefault です。',
      ],
      examples: [
        {
          file: 'src/components/AccountPanel.tsx',
          code: `const { login, register } = useAuth()\nconst [mode, setMode] = useState<'login' | 'register'>('login')\nconst [email, setEmail] = useState('')\nconst [password, setPassword] = useState('')\n// …氏名・住所など（登録時のみ）…\n\nasync function handleSubmit(e: React.FormEvent) {\n  e.preventDefault()\n  setSubmitting(true); setError(null)\n  try {\n    if (mode === 'login') await login(email, password)\n    else await register({ email, password, full_name: fullName, ... })\n    onDone()                       // 成功したら親に通知（画面を移動）\n  } catch (err) {\n    setError(err instanceof Error ? err.message : '失敗しました')\n  } finally { setSubmitting(false) }\n}`,
          note: 'mode（login/register）で送信先と表示を切り替え。login/register は第4章の AuthContext のもの（useAuth）。登録用の欄は {mode === "register" && (…)} で出し分け（第4章）。成功時は onDone() を呼ぶ＝「何をするかは親が決める」コールバック（第6章）。',
        },
      ],
    },
    {
      id: 'login-page',
      heading: '9-2. ログイン後の移動 ― Navigate と useNavigate',
      body: [
        'LoginPage は、すでにログイン済みなら描画せずに即リダイレクトし、ログイン成功時（onDone）には useNavigate で商品一覧へ移動させます。第8章の Navigate（描画＝移動）と useNavigate（処理後に移動）の使い分けが両方出てきます。',
      ],
      examples: [
        {
          file: 'src/pages/LoginPage.tsx',
          code: `export function LoginPage() {\n  const { user } = useAuth()\n  const navigate = useNavigate()\n\n  // すでにログイン済みなら商品一覧へ（描画の代わりにリダイレクト）\n  if (user) return <Navigate to="/" replace />\n\n  return (\n    <div className="...">\n      <AccountPanel onDone={() => navigate('/')} />\n    </div>\n  )\n}`,
          note: '「条件で即移動」は <Navigate>（第4章の早期 return ＋ 第8章）。「処理が終わってから移動」は navigate(\'/\')（第8章 useNavigate）。AccountPanel の onDone に navigate を渡すことで、ログイン成功→一覧へ、がつながります。',
        },
      ],
    },
    {
      id: 'checkout',
      heading: '9-3. 注文確定 ― 遷移とデータ更新の「順番」',
      body: [
        'CheckoutPage の「注文を確定」では、createOrder でサーバーに注文を作り、注文完了ページへ移動します。ここに実戦的な落とし穴があり、コメントで丁寧に説明されています。「先に遷移してから、カートを更新する」順番が大事なのです。',
      ],
      examples: [
        {
          file: 'src/pages/CheckoutPage.tsx',
          code: `// カートが空ならカートページへ戻す（ガード）\nif (!cart || cart.items.length === 0) return <Navigate to="/cart" replace />\n\nasync function placeOrder() {\n  setSubmitting(true); setError(null)\n  try {\n    const order = await createOrder({ note })\n    // 先に完了ページへ遷移する。\n    // 順序が逆だと、refresh でカートが空になった瞬間に上の\n    // 「空カートなら /cart へ」ガードが先に発火し、完了ページに行けない。\n    navigate(\`/orders/\${order.id}\`, { state: { justOrdered: true } })\n    void refresh()   // 遷移後にカート(ヘッダーのバッジ)を更新。await しない\n  } catch (e) {\n    setError(e instanceof ApiError ? e.message : '注文に失敗しました')\n  } finally { setSubmitting(false) }\n}`,
          note: 'navigate の第2引数 state でフラグ（justOrdered）を渡し、完了ページで「ありがとう」を出せます。ポイントは順番：先に navigate、その後 refresh。逆だと「空カードなら /cart へ」のガードが先に動いてしまう。状態とガードの相互作用を読み解く好例です。',
        },
      ],
      callouts: [
        {
          kind: 'warn',
          text: 'catch で e instanceof ApiError を見ています（#3）。在庫不足のときサーバーは ApiError(status=409) を投げる設計なので、その message をそのまま画面に出せます。共通の通信層を作った恩恵が、ここで効いています。',
        },
      ],
    },
    {
      id: 'orders-api',
      heading: '9-4. 注文 API ― apiFetch を薄く包むだけ',
      body: [
        '注文 API（orders.ts）は、#3 の apiFetch を呼ぶだけの薄い関数たちです。認証・トークン更新・エラー変換は apiFetch がやってくれるので、ここは「どの URL に何を送るか」だけに集中できています。',
      ],
      examples: [
        {
          file: 'src/api/orders.ts',
          code: `export const createOrder = (payload: CreateOrderPayload = {}) =>\n  apiFetch<Order>('/orders/', { method: 'POST', body: JSON.stringify(payload) })\n\nexport const getOrders = () => apiFetch<Order[]>('/orders/')\nexport const getOrder = (id: number | string) => apiFetch<Order>(\`/orders/\${id}/\`)`,
          note: 'apiFetch<Order> のように「返ってくる型」を指定（#3・第12章のジェネリクス）。createOrder は POST、getOrders は GET…と、各関数は1行。「通信のお作法は apiFetch、各APIは薄く」という分担が、コードを読みやすくしています。',
        },
      ],
    },
  ],
}

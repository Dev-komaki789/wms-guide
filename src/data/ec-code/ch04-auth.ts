import type { EcChapter } from './types'

// EC コード解説 #4「認証のしくみ」。
export const ch04Auth: EcChapter = {
  id: 'auth',
  num: 4,
  title: '認証のしくみ ― AuthContext と tokenStore',
  summary: '「今ログインしているか・誰か」をアプリ全体で共有する AuthContext と、トークンを保管する tokenStore を読みます。Context・カスタムフック・useEffect が組み合わさった、実戦的な使い方が見えます。',
  relatedReact: ['第9章 Context', '第10章 カスタムフック', '第7章 useEffect'],
  intro: [
    'ログイン状態は、ヘッダー・カート・各ページなど、あちこちで必要になります。まさに第9章で学んだ「広い範囲で共有する値」＝Context の出番です。EC では auth/AuthContext.tsx がこれを担います。',
  ],
  sections: [
    {
      id: 'tokenstore',
      heading: '4-1. tokenStore ― トークンを保管する（localStorage）',
      body: [
        'ログインの合言葉であるトークン（access / refresh）は、ブラウザの localStorage に保存します。localStorage は「ページを閉じても残る」保存場所なので、次回もログイン状態を保てます。',
      ],
      examples: [
        {
          file: 'src/auth/tokenStore.ts',
          code: `const ACCESS_KEY = 'ec_access_token'\nconst REFRESH_KEY = 'ec_refresh_token'\n\nexport function getTokens(): Tokens {\n  return {\n    access: localStorage.getItem(ACCESS_KEY),\n    refresh: localStorage.getItem(REFRESH_KEY),\n  }\n}\nexport function setTokens(tokens: { access?: string; refresh?: string }): void {\n  if (tokens.access) localStorage.setItem(ACCESS_KEY, tokens.access)\n  if (tokens.refresh) localStorage.setItem(REFRESH_KEY, tokens.refresh)\n}\nexport function clearTokens(): void {\n  localStorage.removeItem(ACCESS_KEY)\n  localStorage.removeItem(REFRESH_KEY)\n}`,
          note: 'localStorage.getItem / setItem / removeItem でトークンを出し入れするだけの薄い部品。前章の apiFetch / refreshAccessToken は、この getTokens / setTokens / clearTokens を呼んでいました。「保存の詳細」をここに閉じ込め、他は中身を気にせず使えます。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：localStorage はブラウザに用意された小さな保存箱（文字列のみ）。ファイル冒頭のコメントにもある通り、localStorage は手軽な反面 XSS で読まれうるトレードオフがあり、より堅くするなら httpOnly Cookie という選択肢もある、と注記されています。',
        },
      ],
    },
    {
      id: 'provider',
      heading: '4-2. AuthProvider ― user と loading を配る',
      body: [
        'AuthProvider は user（ログイン中の人。未ログインなら null）と loading（起動時の判定中か）を state で持ち、login / logout などの操作とともに配ります。第9章の「①作る②配る③受け取る」の②にあたります。',
      ],
      examples: [
        {
          file: 'src/auth/AuthContext.tsx',
          code: `export function AuthProvider({ children }: { children: ReactNode }) {\n  const [user, setUser] = useState<Me | null>(null)\n  const [loading, setLoading] = useState(true)\n\n  // … login / register / logout / reloadUser …\n\n  return (\n    <AuthContext.Provider value={{ user, loading, login, register, logout, reloadUser }}>\n      {children}\n    </AuthContext.Provider>\n  )\n}`,
          note: 'user の型は Me | null（第12章）。「ログイン中の人」か「null（未ログイン）」のどちらか、を型で表しています。value にまとめて配るので、子孫は必要なものだけ取り出せます。',
        },
      ],
    },
    {
      id: 'restore',
      heading: '4-3. 起動時にログインを復元する ― useEffect',
      body: [
        'ページを開いた直後、「保存済みトークンがあれば、それで /me を叩いてログイン状態を復元する」処理が要ります。これは第7章の「最初に1回だけ動かす useEffect（依存配列 []）」の典型例です。',
      ],
      examples: [
        {
          file: 'src/auth/AuthContext.tsx',
          code: `useEffect(() => {\n  async function restore() {\n    const { access, refresh } = getTokens()\n    if (!access && !refresh) {\n      setLoading(false)   // トークン無し＝未ログイン。判定終了\n      return\n    }\n    try {\n      setUser(await fetchMe())  // トークンで「私は誰?」を取得\n    } catch {\n      clearTokens()             // ダメなら捨てる\n    } finally {\n      setLoading(false)         // 成否どちらでも判定は終わり\n    }\n  }\n  restore()\n}, [])`,
          note: '[] なので最初の1回だけ。finally で必ず loading を false に（第11章の try/catch/finally と同じ）。この loading が false になるまで、App と RequireAuth は「読み込み中…」で待つ（第2章）。一連がつながっています。',
        },
      ],
    },
    {
      id: 'usehook',
      heading: '4-4. useAuth ― 受け取り側を安全に',
      body: [
        '各画面は useAuth() を呼ぶだけで user やログイン操作を使えます。第9章・第10章で学んだ「useContext を専用フックに包む」形で、Provider の外で誤って使うと教えてくれる安全装置つきです。',
      ],
      examples: [
        {
          file: 'src/auth/AuthContext.tsx',
          code: `export function useAuth(): AuthContextValue {\n  const ctx = useContext(AuthContext)\n  if (!ctx) throw new Error('useAuth は AuthProvider の中で使ってください')\n  return ctx\n}\n\n// 使う側（例）\nconst { user } = useAuth()\nif (!user) return <Navigate to="/login" replace />`,
          note: 'これは第9章 9-4 で学んだパターンそのもの。RequireAuth も AddToCartButton も Header も、この useAuth() を通じて同じログイン状態を共有しています。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'login の中身は「await apiLogin → setUser(await fetchMe())」。通信(api/auth.ts)は薄く保ち、状態の出し入れは Context に集約。「通信は api/、共有状態は Context、UI は components/pages」という役割分担が一貫しています。',
        },
      ],
    },
  ],
}

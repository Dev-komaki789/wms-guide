import type { EcChapter } from './types'

// EC コード解説 #3「API 通信の共通化」。
export const ch03Http: EcChapter = {
  id: 'http',
  num: 3,
  title: 'API 通信の共通化 ― apiFetch と自動トークン更新',
  summary: 'すべての認証つき通信が通る共通関数 apiFetch を読みます。第11章で学んだ fetch・async・エラー処理が、実戦ではどう「1か所にまとめて」使われるのかが分かります。',
  relatedReact: ['第11章 API 通信', '第12章 TypeScript'],
  intro: [
    '第11章で「トークンを自動で付ける共通の通信関数を1つ作るのが定番」と触れました。EC の api/http.ts がまさにそれです。カート・注文・me など、ログインが要る通信はすべてこの apiFetch を通ります。',
    'ここには実戦的な工夫が3つ詰まっています。①トークンの自動付与 ②期限切れ時の自動再取得＋1回だけリトライ ③エラーを扱いやすい形にする、です。',
  ],
  sections: [
    {
      id: 'base',
      heading: '3-1. ベース URL は環境変数から',
      body: [
        '通信先のベース URL は、コードに直接書かず環境変数（.env）から読んでいます。開発と本番でURLを切り替えられるようにするためです（第11章のおまけ・実戦テク）。',
      ],
      examples: [
        {
          file: 'src/api/http.ts',
          code: `const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8001/api/ec'`,
          note: 'import.meta.env.VITE_API_BASE_URL は Vite の環境変数（.env に書く。名前は VITE_ で始める約束）。?? は「左が無ければ右」。つまり「設定があればそれ、無ければローカル」。URL をコードに埋め込まないのが実戦の作法です。',
        },
      ],
    },
    {
      id: 'apierror',
      heading: '3-2. ApiError ― エラーを「扱える形」にする',
      body: [
        'サーバーがエラーを返したとき、ただ throw するのではなく、ステータスコードと本文を持った専用のエラー（ApiError）を投げています。受け取る側が「401 ならログイン画面へ」のように分岐しやすくなります。',
      ],
      examples: [
        {
          file: 'src/api/http.ts',
          code: `export class ApiError extends Error {\n  status: number\n  body: unknown\n  constructor(status: number, body: unknown, message: string) {\n    super(message)\n    this.status = status\n    this.body = body\n  }\n}`,
          note: '標準の Error を継承し、status（HTTPステータス）と body（サーバーの返したエラー内容）を足しています。「ただのエラー文字列」より情報が多く、呼び出し側で status を見て分岐できます。',
        },
      ],
    },
    {
      id: 'apifetch',
      heading: '3-3. apiFetch ― 全通信の入口',
      body: [
        '本体の apiFetch です。トークンを付けて fetch し、もし access が期限切れ(401)なら refresh で取り直して「1回だけ」やり直します。第11章の res.ok チェックもここに集約されています。',
      ],
      examples: [
        {
          file: 'src/api/http.ts',
          code: `export async function apiFetch<T = unknown>(\n  path: string,\n  options: RequestInit = {},\n): Promise<T> {\n  const { access } = getTokens()\n  let res = await fetch(\`\${BASE_URL}\${path}\`, {\n    ...options,\n    headers: buildHeaders(options, access),  // Authorization: Bearer を付与\n  })\n\n  // access 期限切れ → refresh して 1 回だけリトライ\n  if (res.status === 401 && getTokens().refresh) {\n    const newAccess = await refreshAccessToken()\n    if (newAccess) {\n      res = await fetch(\`\${BASE_URL}\${path}\`, {\n        ...options,\n        headers: buildHeaders(options, newAccess),\n      })\n    }\n  }\n\n  if (!res.ok) return parseError(res)   // 4xx/5xx は ApiError に\n  if (res.status === 204) return null as T  // 中身なし\n  return res.json() as Promise<T>\n}`,
          note: 'ジェネリクス <T>（第12章）で「返ってくる型」を呼び出し側が指定できます。401 のときだけ refresh→リトライ。res.ok でなければ ApiError。204（中身なし）は null。「通信のお作法」を全部ここに閉じ込め、各 API はこれを呼ぶだけにしています。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'これは第10章「ロジックの切り出し」の通信版です。トークン付与・再試行・エラー変換という“毎回同じ面倒”を1か所に集約。各画面のコードは本質（何を取りたいか）だけに集中できます。',
        },
      ],
    },
    {
      id: 'refresh',
      heading: '3-4. トークンの自動更新 ― refreshAccessToken',
      body: [
        'access トークンには寿命があり、切れると 401 が返ります。そこで「refresh トークンで新しい access をもらう」のが refreshAccessToken。これが上の apiFetch から呼ばれます。',
      ],
      examples: [
        {
          file: 'src/api/http.ts',
          code: `async function refreshAccessToken(): Promise<string | null> {\n  const { refresh } = getTokens()\n  if (!refresh) return null\n\n  const res = await fetch(\`\${BASE_URL}/auth/token/refresh/\`, {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ refresh }),\n  })\n  if (!res.ok) {\n    clearTokens()       // refresh も無効 → 完全にログアウト状態へ\n    return null\n  }\n  const data = (await res.json()) as { access: string }\n  setTokens({ access: data.access })   // 新しい access を保存\n  return data.access\n}`,
          note: 'refresh も無効なら clearTokens() で全部消し、ログアウト扱いに。成功すれば新しい access を保存して返します。ユーザーは「いつの間にかログアウトさせられる」ことなく使い続けられます。トークンの保管(getTokens/setTokens)は次章で。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '3-5. この回のまとめ',
      body: [
        'apiFetch は「認証つき通信の唯一の入口」。トークン付与・401での自動更新と1回リトライ・res.ok チェック・ApiError 変換を全部引き受ける。各 API ファイルはこれを呼ぶだけ。',
        '第11章（fetch/async/res.ok）と第10章（ロジックの切り出し）と第12章（型・ジェネリクス）が、ここで一度に効いています。次回は、この通信が使うトークンと「ログイン状態の共有」を担う認証のしくみを読みます。',
      ],
    },
  ],
}

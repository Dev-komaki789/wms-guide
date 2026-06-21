import {
  Component,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import * as React from 'react'

// 「React 大全」の例題コードを、ブラウザ内で実際に動かして表示する読み取り専用プレビュー。
// - 表示するのは本書が用意した信頼できるコードのみ（ユーザー入力は実行しない）。
// - sucrase で JSX/TS を素の JS に変換し、new Function で評価して React 要素を得る。
// - sucrase は動的 import するので、ライブ例があるページを開いたときだけ読み込まれる。

// 実行中に投げられたエラーで画面全体が落ちないよう包む。
class PreviewErrorBoundary extends Component<
  { children: ReactNode; resetKey: string },
  { error: Error | null }
> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  // code が変わったらエラー状態をリセットする。
  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  render() {
    if (this.state.error) {
      return (
        <pre className="m-0 whitespace-pre-wrap text-[13px] text-[var(--color-warn)]">
          実行時エラー: {this.state.error.message}
        </pre>
      )
    }
    return this.props.children
  }
}

// 例題から参照できる React の機能（import を書かずに使えるようにする）。
const scope = {
  React,
  useState,
  useEffect,
  useRef,
  useMemo,
  useReducer,
  useCallback,
  useContext,
  createContext,
} as const

export default function LiveExample({ code, mount }: { code: string; mount: string }) {
  const [element, setElement] = useState<ReactNode>(null)
  const [error, setError] = useState<string | null>(null)
  // エラー境界をコードごとにリセットするためのキー。
  const resetKey = useMemo(() => `${code}::${mount}`, [code, mount])

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        const { transform } = await import('sucrase')
        // import / export 文は new Function の中では実行できないので取り除く
        // （表示用コードには残してよい。export default Foo → Foo のように、宣言の中身だけ残す）。
        const cleaned = code
          .replace(/^\s*import\s.+$/gm, '')
          .replace(/^\s*export\s+default\s+/gm, '')
          .replace(/^\s*export\s+/gm, '')
        // 定義 + 「mount の JSX を返す」を1つのプログラムにまとめて変換。
        const program = `${cleaned}\n;return (${mount});`
        const transformed = transform(program, {
          transforms: ['jsx', 'typescript'],
          jsxRuntime: 'classic',
          production: true,
        }).code
        const fn = new Function(...Object.keys(scope), transformed)
        const el = fn(...Object.values(scope)) as ReactNode
        if (!cancelled) {
          setError(null)
          setElement(el)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e))
          setElement(null)
        }
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [code, mount])

  return (
    <div className="mt-3">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
        実際の表示（ブラウザ内で実行）
      </div>
      <div className="live-preview rounded-lg border border-dashed border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 text-[var(--color-ink)]">
        {error ? (
          <pre className="m-0 whitespace-pre-wrap text-[13px] text-[var(--color-warn)]">
            変換エラー: {error}
          </pre>
        ) : (
          <PreviewErrorBoundary resetKey={resetKey}>{element}</PreviewErrorBoundary>
        )}
      </div>
    </div>
  )
}

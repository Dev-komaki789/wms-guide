import { useEffect, useId, useRef, useState } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'strict',
  flowchart: { htmlLabels: true, curve: 'basis' },
  fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
})

/** Mermaid のソース文字列を SVG に描画する。chart が変わるたび描き直す。 */
export default function Mermaid({ chart }: { chart: string }) {
  const rawId = useId()
  // useId は ':' を含むことがあり Mermaid の id として不正なので除去する。
  const id = `m${rawId.replace(/[^a-zA-Z0-9]/g, '')}`
  const hostRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setError(null)
    mermaid
      .render(id, chart)
      .then(({ svg }) => {
        if (!cancelled && hostRef.current) hostRef.current.innerHTML = svg
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      })
    return () => {
      cancelled = true
    }
  }, [chart, id])

  if (error) {
    return (
      <pre className="overflow-auto rounded-lg border border-[var(--color-line)] bg-[var(--color-mist)] p-3 text-xs text-[var(--color-warn)]">
        Mermaid 描画エラー: {error}
      </pre>
    )
  }

  return <div ref={hostRef} className="mermaid-host flex justify-center overflow-x-auto" />
}

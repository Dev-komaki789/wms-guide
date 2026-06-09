import { useState } from 'react'
import type { CodeNote } from '../data/types'

interface SrcResponse {
  path: string
  start: number
  end: number
  code: string
  total: number
  error?: string
}

// 取得結果を覚えておき、開閉のたびに再フェッチしない（同一プロセス内キャッシュ）。
const cache = new Map<string, SrcResponse>()

/**
 * 解説ページから実コードを「見に行く」折りたたみビュー。
 * dev サーバーの /wms-src 経由で ~/projects/wms/ の該当行を読んで表示する。
 * wms-guide 側にコードは保存しない。本番ビルドでは /wms-src が無いのでエラー文を出す。
 *
 * notes を渡すと、WMS 本体を書き換えずに、実コードの該当行の下へ解説コメントを差し込む
 * （色付きで「ガイドが足した注釈」と分かるようにする）。
 */
export default function CodeSnippet({
  path,
  lines,
  notes,
}: {
  path: string
  lines: [number, number]
  notes?: CodeNote[]
}) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<SrcResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [start, end] = lines
  const key = `${path}:${start}-${end}`

  // 絶対行番号 -> 解説テキスト（複数可）。
  const notesByLine = new Map<number, string[]>()
  for (const n of notes ?? []) {
    const arr = notesByLine.get(n.line) ?? []
    arr.push(n.text)
    notesByLine.set(n.line, arr)
  }

  async function load() {
    if (data || loading) return
    const hit = cache.get(key)
    if (hit) {
      setData(hit)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/wms-src?path=${encodeURIComponent(path)}&start=${start}&end=${end}`,
      )
      const json = (await res.json()) as SrcResponse
      if (!res.ok || json.error) throw new Error(json.error ?? `HTTP ${res.status}`)
      cache.set(key, json)
      setData(json)
    } catch (e) {
      setError(
        e instanceof Error
          ? `${e.message}（実コード表示は dev サーバー専用です。pnpm dev で起動してください）`
          : String(e),
      )
    } finally {
      setLoading(false)
    }
  }

  function toggle() {
    const next = !open
    setOpen(next)
    if (next) void load()
  }

  return (
    <div className="mt-2">
      <button
        onClick={toggle}
        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-line)] bg-[var(--color-paper)] px-2.5 py-1 font-mono text-xs text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
      >
        <span className="text-[var(--color-muted)]">{open ? '▾' : '▸'}</span>
        コードを見る
        <span className="text-[var(--color-muted)]">
          {path}:{start}-{end}
        </span>
      </button>

      {open ? (
        <div className="mt-2 overflow-hidden rounded-lg border border-[var(--color-line)]">
          {loading ? (
            <div className="px-4 py-3 text-xs text-[var(--color-muted)]">読み込み中…</div>
          ) : error ? (
            <div className="px-4 py-3 text-xs text-[var(--color-warn)]">{error}</div>
          ) : data ? (
            <>
              <pre className="overflow-x-auto bg-[#1e2430] px-0 py-3 text-[13px] leading-relaxed">
                <code className="font-mono">
                  {data.code.split('\n').map((line, i) => {
                    const lineNo = data.start + i
                    const lineNotes = notesByLine.get(lineNo)
                    return (
                      <div key={i}>
                        <div className="grid grid-cols-[3.5rem_1fr] hover:bg-white/5">
                          <span className="select-none pr-3 text-right text-[#5b6677]">
                            {lineNo}
                          </span>
                          <span className="whitespace-pre pr-4 text-[#d7dde8]">
                            {line || ' '}
                          </span>
                        </div>
                        {/* ガイドが足した解説コメント（WMS 本体には無い）。緑で区別。 */}
                        {lineNotes?.map((text, k) => (
                          <div
                            key={k}
                            className="grid grid-cols-[3.5rem_1fr] bg-[#1b3a2b]/40"
                          >
                            <span className="select-none pr-3 text-right text-[#5b6677]" />
                            <span className="whitespace-pre-wrap pr-4 italic text-[#7ee0a2]">
                              ← {text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </code>
              </pre>
              {notes && notes.length > 0 ? (
                <div className="bg-[#161b24] px-4 py-1.5 text-right font-mono text-[11px] text-[#5b6677]">
                  ← の行は学習用にガイドが足した解説（WMS 本体のコードではありません）
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

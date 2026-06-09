import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

// dev サーバー専用プラグイン。解説ページから実コードを「見に行く」ための小さな読み取り口。
// WMS 本体（~/projects/wms/）を wms-guide にコピーせず、実行時にその場で読んで該当行だけ返す。
// → PLAN.md の制約「WMS のソースを wms-guide に持たない」を守ったまま実コードを閲覧できる。
//
//   GET /wms-src?path=outbound/views.py&start=910&end=1024
//     -> { path, start, end, code, total }
//
// 読み取りは wmsRoot 配下に限定（パストラバーサル禁止）。書き込みは一切しない。
export function wmsSource(opts: { root: string }): Plugin {
  const wmsRoot = path.resolve(opts.root)

  return {
    name: 'wms-source',
    configureServer(server) {
      server.middlewares.use('/wms-src', (req, res) => {
        const send = (status: number, body: unknown) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(body))
        }

        const url = new URL(req.url ?? '', 'http://localhost')
        const rel = url.searchParams.get('path') ?? ''
        const start = Number(url.searchParams.get('start') ?? '1')
        const end = Number(url.searchParams.get('end') ?? '0')

        if (!rel) return send(400, { error: 'path クエリが必要です' })

        const abs = path.resolve(wmsRoot, rel)
        // wmsRoot の外（../ 等）は拒否。シンボリックリンク抜けも防ぐため realpath も確認。
        if (abs !== wmsRoot && !abs.startsWith(wmsRoot + path.sep)) {
          return send(403, { error: 'wmsRoot 配下のパスのみ許可されています' })
        }

        let text: string
        try {
          text = fs.readFileSync(abs, 'utf8')
        } catch {
          return send(404, { error: `ファイルが見つかりません: ${rel}（WMS_ROOT=${wmsRoot}）` })
        }

        const allLines = text.split('\n')
        const s = Math.max(1, start)
        const e = end > 0 ? Math.min(allLines.length, end) : allLines.length
        const code = allLines.slice(s - 1, e).join('\n')
        return send(200, { path: rel, start: s, end: e, code, total: allLines.length })
      })
    },
  }
}

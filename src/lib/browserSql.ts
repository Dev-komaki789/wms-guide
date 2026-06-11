// ブラウザの中で SQLite（WASM）を動かし、同梱した wms.sqlite に対して SELECT を実行する。
// サーバー・API 不要。元ファイルはメモリ上に読むだけなので書き込みは永続しない（＝安全）。

import initSqlJs, { type Database, type SqlValue } from 'sql.js'
// Vite に wasm の URL を解決させる（public へのコピー不要）。
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'

const MAX_ROWS = 200

// 個人情報・パスワードを含むため参照禁止のテーブル。
// 同梱 wms.sqlite からは既に削除済みだが、念のためクエリ側でも明示的に拒否する（多重防御）。
const FORBIDDEN_TABLES = /\b(users|users_groups|users_user_permissions)\b/

let dbPromise: Promise<Database> | null = null

function loadDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const SQL = await initSqlJs({ locateFile: () => wasmUrl })
      // ?v= はキャッシュ対策。users 削除前の古い版をブラウザ/CDN が使い続けないよう、
      // DB の中身を更新したらこの番号を上げる。
      const res = await fetch(import.meta.env.BASE_URL + 'wms.sqlite?v=2')
      if (!res.ok) throw new Error('wms.sqlite（同梱DB）を読み込めませんでした。')
      const buf = await res.arrayBuffer()
      const db = new SQL.Database(new Uint8Array(buf))
      // SQLite エンジン自体を読み取り専用にする。これで UPDATE/DELETE/INSERT/DROP 等は
      // どんな書き方（WITH … DELETE 含む）でもエンジン側で拒否される。
      db.run('PRAGMA query_only = ON;')
      return db
    })()
  }
  return dbPromise
}

export interface RunResult {
  columns: string[]
  rows: (string | number | boolean | null)[][]
  truncated: boolean
}

function cell(v: SqlValue): string | number | null {
  if (v === null) return null
  if (typeof v === 'number' || typeof v === 'string') return v
  return '(blob)' // Uint8Array など
}

/** SELECT（/ WITH … SELECT）を実行して結果を返す。安全のため単一の SELECT のみ許可。 */
export async function runSelect(raw: string): Promise<RunResult> {
  const sql = raw.trim().replace(/;+\s*$/, '')
  const low = sql.toLowerCase()
  if (!sql) throw new Error('SQL が空です。')
  if (!(low.startsWith('select') || low.startsWith('with'))) {
    throw new Error('安全のため SELECT 文（または WITH … SELECT）だけ実行できます。')
  }
  if (sql.includes(';')) {
    throw new Error('複数の文は実行できません（; は1つだけ・末尾のみ）。')
  }
  if (FORBIDDEN_TABLES.test(low)) {
    throw new Error('users（ユーザー）テーブルは個人情報・パスワードを含むため、このツールでは参照できません。')
  }

  const db = await loadDb()
  const result = db.exec(sql) // SQL エラー時は例外
  if (result.length === 0) {
    return { columns: [], rows: [], truncated: false }
  }
  const { columns, values } = result[0]
  const truncated = values.length > MAX_ROWS
  const rows = values.slice(0, MAX_ROWS).map((row) => row.map(cell))
  return { columns, rows, truncated }
}

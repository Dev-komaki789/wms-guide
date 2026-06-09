import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { wmsSource } from './vite-plugin-wms-source'

// WMS 本体の場所。既定は wms-guide の隣（~/projects/wms）。環境変数で上書き可。
const wmsRoot = process.env.WMS_ROOT ?? path.resolve(import.meta.dirname, '../wms')

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages は `https://<user>.github.io/wms-guide/` のサブパス配信なので、
  // 本番ビルドだけ base を `/wms-guide/` にする（dev / preview は `/`）。
  // 環境変数 BASE_PATH で上書き可（別ホスト＝ルート配信なら BASE_PATH=/ で build）。
  base: command === 'build' ? (process.env.BASE_PATH ?? '/wms-guide/') : '/',
  plugins: [react(), tailwindcss(), wmsSource({ root: wmsRoot })],
  build: {
    // 大きいチャンクは Mermaid（図ライブラリ）系。学習ページ用に遅延読み込み済みで
    // 本番の SQL ツールの初期表示には含まれないため、警告のしきい値を上げる。
    chunkSizeWarningLimit: 1500,
  },
  server: {
    // ページB（SQL→ORM 変換）の Django API をローカルでプロキシする。
    // フロントは /api/convert を叩くだけ。キーは Django 側 env に置く。
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
}))

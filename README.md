# wms-guide

自作した倉庫管理システム ([wms](https://github.com/Dev-komaki789/wms)) を自分で
理解し直すための **学習補助サイト**。WMS の画面ごとの解説、Django ORM の解説、
React の解説、SQL → Django ORM 変換ツールなどをまとめている。

## 主な機能

- **WMS 画面別の解説**：画面ごとに「表示データ / 処理の流れ / 関連ファイル」を Mermaid フロー図つきで解説
- **Django ORM の章別解説 + クイズ**：ORM をテーマ別に学習・確認できる構成
- **React の章別解説**：Hooks や状態管理など主要トピックを整理
- **SQL → Django ORM 変換ツール**：SQL を入力すると Django ORM コードと解説を返す（Claude API でサーバ側変換）
- **EC サイトの解説**：連携先 EC サイトの内部構造も同じ形式で解説

## 技術スタック

- フロントエンド: React 19 + TypeScript + Vite + Tailwind CSS 4
- 図解: Mermaid（テキスト DSL でフローチャート描画）
- ブラウザ内 SQL 実行: sql.js
- バックエンド（SQL → ORM 変換 API）: Django + Claude API（`claude-haiku-4-5`）

## メモ

AI を活用して作った WMS を、自分の手で隅々まで理解し直すことを目的にした
個人用の学習補助ツール。SQL → ORM 変換ツールは Django サーバ起動時のみ動作する。

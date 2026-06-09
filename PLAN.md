# WMS 学習サイト（wms-guide）— 開発プラン / 引き継ぎ書

> このファイルは別セッションへの引き継ぎ用です。新しい Claude Code セッションを
> **`~/projects/` で開き**、「`wms-guide/PLAN.md` を読んで続きを作って」と指示すれば再開できます。

## このプロジェクトは何か

小牧さん**自分用の WMS 学習サイト**。AI も活用して作った WMS を、**自分の手で隅々まで理解し直す**ための道具。
（背景の価値観：「自分で説明できるコードだけ増やす」。このサイトはその理解を助ける学習補助。）

- 場所：`~/projects/wms-guide/`（**これから作る**。まだ空）
- 公開範囲：**自分用・ローカル中心**（後から公開に拡張も可）

## 重要な制約（必ず守る）

1. **WMS のソースコードを wms-guide にコピーしない。** WMS 本体は `~/projects/wms/` のまま。
   このサイトは WMS を「**解説する**」もので、本体コードは持たない。
   → 解説を書くときは `~/projects/wms/` を**読みに行く**（だから新セッションは親 `~/projects/` で開く）。
2. **Claude API キーはサーバ側（Django）に置く。** フロントに直書き禁止。ローカルの環境変数で持つ。

```
~/projects/
  ├─ wms/        ← WMS 本体（読む対象。原則 触らない）
  ├─ wms-guide/  ← この解説サイト（書く先）
  └─ portfolio/  ← 別件（参照用に同じ React+Vite+Tailwind スタック）
```

## 構成：1 サイトに 2 ページ

### ページA：WMS 画面別 解説ビューア（Claude が執筆・作りきる）
- WMS の**画面ごとにページ分け**。
- 各ページに「**どんなデータが・どの機能で・どの順番で**表示されるか」を、**図解（Mermaid）つき**で解説。
- 解説文と図は **Claude（私）が `~/projects/wms/` の実コードを読んで書く**（ユーザーが手書きするのではない）。
- **図解は Mermaid**（テキストで書けるフローチャート。`mermaid` を依存追加し、React で描画）。

各画面ページの「型」（テンプレート）：
1. 画面名 / 用途（1 行）
2. スクリーンショット（任意）
3. 表示されるデータ（画面に何が出るか）
4. **処理の流れ**（① リクエスト → ② URL → ③ View → ④ Serializer/Model → ⑤ DB → ⑥ 画面表示、番号付き）＋ Mermaid フロー図
5. 関連ファイル・関数（`urls.py` / `views.py` / `models.py` 等の具体名）
6. 補足（権限、ハンディ/PC 出し分け 等）

### ページB：SQL → ORM 変換ツール（Claude API 使用）
- 別ページ。**左：SQL 入力欄／右：Django ORM 出力＋解説**。
- 変換は**毎回 Claude を呼ぶ**（キャッシュ保存はしない）。
- **解説つき**で出力（「なぜこの ORM になるか」を短く添えて学習補助にする）。
- モデルは **`claude-haiku-4-5`**（用途的に十分・最安。1 回 ≒ 0.5 円程度）。
  - 参考料金：Haiku 4.5 = 入力 $1 / 出力 $5（per 1M tokens）。
- 呼び出しは Django の小さな API（例 `/api/convert`）経由。キーはサーバ側 env。

## 技術スタック
- フロント：**React + Vite + Tailwind v4**（portfolio と同じ。`@tailwindcss/vite`、Node は nvm の 22）。
- バックエンド：**Django**（SQL→ORM 変換 API だけの小さなもの）。Anthropic SDK（`anthropic`）でキーを隠して Claude を呼ぶ。
- 図解：**Mermaid**。

## まず作る範囲（テンプレ試作）
1. **ピッキング画面 1 つ**を、解説＋Mermaid 図解で作る（ページA のテンプレ品質を固める）。
2. **SQL→ORM ページの雛形**（左右レイアウト）。
3. 余力があれば Django `/api/convert` を最小実装してローカルで変換が動くところまで。
→ 質を確認してから、残り画面（マスタ/入荷/出荷/在庫/システムで計 25 画面前後）に展開。

## 進捗（セッション 2 / 2026-06-08）

scaffold とテンプレ試作まで完了。`pnpm build`（型チェック含む）・`pnpm dev` ともに通る。

**やったこと**
- React + Vite + Tailwind v4 で wms-guide を立ち上げ（portfolio と同じスタック。`mermaid` と
  `react-router-dom` を追加）。HashRouter（ローカル/静的配信でも崩れない）。
- ページA のテンプレートを `ScreenDoc` 型（`src/data/types.ts`）に落とし、6 項目
  （画面名/用途・スクショ・表示データ・処理の流れ＋Mermaid・関連ファイル・補足）を
  `ScreenDocView`（`src/components/ScreenDocView.tsx`）が描画。**新画面は ScreenDoc を 1 つ書くだけ**。
- ピッキングを 2 画面執筆（`~/projects/wms/outbound/` を実際に読んで記述。コードはコピーしていない）：
  - `picking-work`（作業画面・**フラッグシップ**）：明細単位の即時コミット〜出荷指示前進までを Mermaid 化。
  - `picking-entry`（入口・対象リスト一覧／開始・引き継ぎロック）。
- Mermaid 描画コンポーネント（`src/components/Mermaid.tsx`、theme=neutral）。
- ページB（SQL→ORM）の雛形（`src/pages/SqlToOrmPage.tsx`）：左に SQL／右に ORM＋解説。
  `/api/convert` へ POST する作りで、API 未起動でもページとして成立（エラー表示）。
- Vite dev プロキシで `/api` → `localhost:8000`（Django）。

**起動方法**
```bash
cd ~/projects/wms-guide
nvm use 22 && pnpm install   # 初回のみ
pnpm dev                     # http://localhost:5173
```

**わかりやすさ強化（セッション 2 追記）**
テンプレート（`ScreenDoc` / `ScreenDocView`）に学習補助の要素を追加。各画面は該当フィールドを書くだけで付く。
- 各 `flowStep.code = { path, lines, notes }`: 番号ステップごとに「コードを見る」（実コードをその場表示）。
  `notes: [{ line, text }]` を足すと、**実コードの該当行の下に解説コメントを緑色で差し込む**
  （`←` 付き）。WMS 本体は書き換えず、ガイド側で注釈を重ねる方式。`line` はファイル内の絶対行番号。
- `sequenceMermaid`（任意）: シーケンス図（作業者/ハンディ/Django/DB のレーン）。
- `stateMermaid`（任意）: 状態遷移図（PickingList の pending→in_progress→completed）。
- `glossary`（任意）: 用語集（PickingList / picked_at / select_for_update など）。
- 注意: Mermaid の **sequenceDiagram のメッセージ文では `<` `>` `{` `}` `<br/>` が構文を壊す**。
  角括弧 `[pk]` や全角丸括弧で回避する（flowchart/stateDiagram は `<br/>` 可）。
- 方針メモ: 「ひとことで言うと／たとえると」要約は不要との判断で削除済み（学習はコード注釈で補う）。

**学習メモのページを追加（セッション 3）** — サイドバー「学習メモ」に2ページ（①→②の順番付き）
- `src/pages/DjangoBasicsPage.tsx`（`#/django-basics`、ナビ「① Django 入門」）… zaiko-mini で
  在庫照会（読み取り）を一から作ったまとめ。1リクエストの流れ(Mermaid) / 手順8工程 / ORM・filter・
  検索フォーム・ForeignKey・N+1とselect_related・テンプレート / つまずき / WMS対応表。末尾に②への導線。
- `src/pages/DjangoCrudPage.tsx`（`#/django-crud`、ナビ「② Django CRUD」）… 追加・更新・削除のまとめ。
  冒頭に「見ていく順番（ロードマップ）」を明示（STEP1 読み取り → STEP2 CRUD、CRUD内は追加→更新→削除）。
  CRUD一覧表 / 共通パターン(1つのViewがGET/POSTを担当)のMermaid / 各操作の要点 / 概念(ModelForm・CSRF・
  get_object_or_404・redirect・instance=) / 注意。
- どちらも ScreenDoc ではなく独立ページ。Mermaid と既存配色（--color-* / Section・Code 風）を流用。

**ページB（SQL→ORM 変換）の API を実装（セッション 4）**
- `server/`（Django + `anthropic` SDK、uv 管理）に `/api/convert` を実装。`config/views.py` の
  `convert` ビューが Claude（`claude-haiku-4-5`）を呼び、**structured outputs**（json_schema）で
  `{orm, explanation}` の形を固定して返す。`@csrf_exempt`、API キーは `ANTHROPIC_API_KEY` env。
- 動かし方は `server/README.md`。**2サーバ構成**：(1) `cd server && export ANTHROPIC_API_KEY=... &&
  uv run python manage.py runserver 8000`、(2) `pnpm dev`(5173)。Vite が `/api`→`:8000` にプロキシ。
- 検証済み: 405/400/500 の各エラー分岐・ルーティング・JSON 処理。Claude 実呼び出しのみ**要 API キー**（未設定）。
- フロント（`SqlToOrmPage.tsx`）は変更不要（`/api/convert` に `{sql}` を POST し `{orm,explanation}` を表示）。

**「画面から探す」を追加（セッション 5）** — ページBの SQL→ORM を拡張
- 画面名を選ぶ → その画面で使われている ORM・SQL ＋ 使用テーブル・カラムを表示。対応4画面:
  ピッキング作業／ピッキング受付／出荷検品／在庫照会。
- **静的データ方式**（重要）: 画面は固定でコードも変わらないので、表示のたびに API を呼ばない。
  WMS の実コードを読んで整理した固定データ `src/data/screen-orm.ts` をフロントが表示するだけ。
  → サーバー不要・即時・無料。**Claude を呼ぶのは手入力の SQL→ORM 変換ボタンだけ**（ユーザー指摘で是正）。
  - 当初は毎回 `/api/screen` で Claude 抽出する実装だったが、API 多用＋テーブル名の誤り（`masters_` 付与）
    が出たため静的データに変更。実 db_table（`locations`/`skus`/`picking_lists` 等）で正確化。
- フロント: `src/components/ScreenOrmExplorer.tsx`（入力＋候補チップ＋結果表示）を `SqlToOrmPage` 上部に。
- バックエンドは `/api/convert` のみ（screen 系エンドポイントは削除）。
- サイドバーをハンバーガーで開閉可能に（`App.tsx`）。SQL→ORM の表示領域も拡大。

**SQL 実行（クエリ結果の表示）を追加（セッション 5）**
- 入力した SQL を **WMS のDB（Postgres・docker）で実行 → 結果の行をテーブル表示**。Claude は不要（純DB）。
- バックエンド `POST /api/run-sql`（`server/config/views.py`）。接続情報は `~/projects/wms/.env` から読む。
  **安全策**: SELECT（/ WITH … SELECT）のみ・単一文のみ・`conn.read_only=True`（書込不可）・
  `statement_timeout=5s`・最大200行。psycopg3 を使用（`uv add "psycopg[binary]"`）。
- フロント: `SqlRunner.tsx`（実行ボタン）＋ `SqlResultTable.tsx`（列・行表示）。手入力欄の下に配置。
  「画面から探す」の各 SQL には `↓ この SQL を下の入力欄へ` ボタン（`%s` を実値に直して実行できる）。
- 検証: 実データで動作確認（picking_lists を JOIN/COUNT/GROUP BY → 実行 → 行表示）。
  DELETE/複数文は 400 で拒否。WMS の DB 起動が前提（`docker compose up -d` + seed）。

**本番＝完全静的サイト化（セッション 5）** — SQL↔ORM ツールのページだけを公開する想定
- **ブラウザ内 SQLite**: SQL 実行を `sql.js`(WASM) ＋ 同梱 `public/wms.sqlite` で行う（`src/lib/browserSql.ts`、
  `SqlRunner.tsx`）。サーバー・API・キー・Postgres 不要。最大200行。
  **書き込み防止（3重）**: ①先頭が SELECT/WITH 以外＆`;` 複数文を拒否、②`PRAGMA query_only = ON`で
  エンジン自体を読み取り専用（`WITH … DELETE` もここで阻止）、③そもそもメモリ上コピーで非永続。
  検証済み: SELECT 可 / DELETE・UPDATE・WITH…DELETE は全て拒否。
- **データの作り方**: `cd server && uv run python ../scripts/export_sqlite.py` で WMS の Postgres 全テーブルを
  `public/wms.sqlite` に書き出す（38表/約2000行/396KB。django_session・django_admin_log は除外、
  auth_user.password は空に）。データ更新時に再実行。
- **本番では非表示/単独化**: `import.meta.env.DEV` で出し分け。本番ビルドでは ORM変換(Claude)を隠し、
  トップ(`/`)を SQL↔ORM ツールにし、サイドバーも消す（`App.tsx` / `main.tsx` / `SqlToOrmPage.tsx`）。
- **デプロイ**: `pnpm build` → `dist/`（`wms.sqlite` と wasm を含む）を任意の静的ホスト（Netlify/Vercel/
  GitHub Pages/S3 等）に置くだけ。HashRouter なのでサーバー側 rewrite 不要。`pnpm preview` で本番確認。
- 開発時(`pnpm dev`)は従来どおり ORM変換(要 Django+キー)・全ページ・サイドバーあり。
- 注意: 同梱 SQLite は公開ダウンロード可能（全データがサンプル前提）。SQLite と Postgres の方言差で一部関数は非対応。
- 旧 `/api/run-sql`（Postgres 実行）は未使用化（フロントはブラウザ SQLite を使用）。`/api/convert` は開発時のみ。
- **コード分割**: Mermaid を使うページ（ScreenPage / DjangoBasics / DjangoCrud）を `React.lazy` で遅延読み込み。
  本番の SQL ツールは Mermaid を一切読み込まない（エントリ ~369KB）。`vite.config.ts` の
  `chunkSizeWarningLimit: 1500` で大チャンク警告を抑制（大チャンク＝遅延の Mermaid 系で初期表示外）。

**実コードの閲覧（コピーせず読みに行く）**
- 各画面の「関連ファイル・関数」に **「コードを見る」** トグルを付けた。押すと dev サーバーの
  `/wms-src?path=...&start=..&end=..` 経由で `~/projects/wms/` の該当行をその場で読み、行番号付きで表示する。
- 仕組み: `vite-plugin-wms-source.ts`（dev ミドルウェア）。WMS 本体を wms-guide に**複製しない**まま
  実コードを見られる（PLAN 制約を遵守）。読み取りは `WMS_ROOT`（既定 `../wms`）配下のみ・書き込みなし。
- 本番ビルドにはこの口が無いので、その場合トグルはエラー文を出すだけ（ローカル学習用の機能）。
- データ側は `ScreenDoc.relatedFiles[].lines: [開始, 終了]` を足すだけで表示される。

**次の一歩**
1. ブラウザで見た目を確認し、ページA テンプレの質を確定（フォント・余白・Mermaid の可読性）。
2. Django `/api/convert` の最小実装（`anthropic` SDK + `claude-haiku-4-5`、キーは env）。
   - 返り値の型はフロント側 `ConvertResult = { orm, explanation }` に合わせる。
3. 質 OK なら残り画面を `src/data/screens/*.ts` に追加し、`screens/index.ts` に登録して展開。

## ディレクトリ構成（wms-guide）
```
src/
  main.tsx                  ルーティング（HashRouter）
  App.tsx                   サイドバー + レイアウト
  index.css                 Tailwind v4 + テーマ変数
  components/
    Mermaid.tsx             Mermaid → SVG 描画
    ScreenDocView.tsx       画面解説テンプレートの描画（6 項目）
  pages/
    HomePage.tsx            目次
    ScreenPage.tsx          /screen/:screenId
    SqlToOrmPage.tsx        ページB（SQL→ORM）
  data/
    types.ts                ScreenDoc 型（テンプレの型定義）
    screens/
      index.ts              画面の登録簿
      picking-work.ts       ピッキング作業（フラッグシップ）
      picking-entry.ts      ピッキング入口
```

## 既に分かっているピッキングの入口（`~/projects/wms/outbound/`）
`outbound/urls.py`（app_name = 'outbound'）より、ハンディのピッキング系：
- `handheld/picking/` → `views.OutboundPickingView`（ピッキング対象リスト一覧）
- `handheld/picking/<pk>/` → `views.OutboundPickingWorkView`（1 リストのピッキング作業画面：棚番・SKU 照合・実ピッキング数入力）
- `handheld/picking/<list_pk>/item/<item_pk>/` → `views.OutboundPickingItemView`
  （**1 明細ごとの即時コミット API**。fetch から呼ばれる。全明細確定でリストを COMPLETED に進める）
- 関連帳票：`picking-lists/<pk>/print/` → `PickingListPrintView`（ピッキングリスト印刷、バーコード付き）

次の一歩：`outbound/views.py` の上記ビュー、`outbound/models.py`、`templates/` のピッキング画面、必要なら `api/` を読んで「処理の流れ」を正確に書く。
WMS 全体像は `~/projects/wms/CLAUDE.md` と `~/projects/wms/docs/` を先に読むとよい。

## 新セッションでの始め方
1. `~/projects/` で Claude Code を開く（`wms/` 読み取り＋`wms-guide/` 書き込みの両方ができる）。
2. 「`wms-guide/PLAN.md` を読んで、ピッキング画面のテンプレ試作から続けて」と指示。
3. まだ scaffold していなければ、wms-guide を React+Vite+Tailwind で立ち上げるところから。

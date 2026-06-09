# wms-guide SQL→ORM 変換 API（Django）

ページB（SQL → Django ORM 変換）のサーバ側。フロント（Vite）が `/api/convert` を
`localhost:8000` にプロキシして呼ぶ。Claude（`claude-haiku-4-5`）に SQL を渡し、
`{ orm, explanation }` を JSON で返す。**API キーはこのサーバの env に置く（フロントには出さない）。**

## 動かし方（2つのサーバを起動する）

### 1. この API サーバ（ターミナルその1）

```bash
cd ~/projects/wms-guide/server
export ANTHROPIC_API_KEY=sk-ant-...   # ← 自分の Anthropic API キー
uv run python manage.py runserver 8000
```

> キーは Anthropic コンソールで発行。export したターミナルでのみ有効。

### 2. フロント（ターミナルその2）

```bash
cd ~/projects/wms-guide
pnpm dev                      # http://localhost:5173
```

ブラウザで http://localhost:5173/#/sql-to-orm を開き、SQL を入れて「ORM に変換」。
Vite が `/api/convert` を :8000 の Django に転送し、Django が Claude を呼んで結果を返す。

## 構成

- `config/views.py` … convert ビュー（Anthropic SDK で Haiku を呼ぶ。structured outputs で
  {orm, explanation} の形を固定）。@csrf_exempt（Cookie 認証の無い JSON API のため）。
- `config/urls.py` … path('api/convert', views.convert)。
- DB は使わない（migrate 不要。runserver の未適用マイグレーション警告は無視してよい）。

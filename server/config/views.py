"""wms-guide のサーバ側 API。

POST /api/convert … 手入力の SQL を Django ORM に変換（学習ツール）。

API キーはこのサーバの env（ANTHROPIC_API_KEY）に置く。
※「画面から探す」は WMS の実コードを基にした静的データ（フロントの src/data/screen-orm.ts）で
  表示するため API は呼ばない。Claude を呼ぶのは下記の手入力 SQL→ORM 変換だけ。
"""

import json
import os
from pathlib import Path

import anthropic
import psycopg
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# WMS 本体の場所（DB 接続情報 .env の読み取りに使う）。既定は wms-guide の隣（~/projects/wms）。
WMS_ROOT = os.environ.get("WMS_ROOT") or str(Path(__file__).resolve().parents[3] / "wms")

MODEL = "claude-haiku-4-5"  # 用途的に十分・最安

CONVERT_SYSTEM_PROMPT = (
    "あなたは SQL を Django ORM に変換し、プログラミング初心者にも分かりやすく解説する専門家です。\n"
    "\n"
    "# orm（出力1: コード）\n"
    "- 対応する Django ORM のコードだけを入れる（前後の説明文やコードフェンス ``` は入れない）。\n"
    "- 必ず複数行に整形する。メソッドチェーン（.filter() / .annotate() / .values() / .order_by() など）は\n"
    "  1 メソッドにつき 1 行で改行し、2 スペースでインデントする。1 行に詰め込まない。\n"
    "- テーブル名からモデル名を推測する（例: stock_stock → Stock、auth_user → User）。\n"
    "\n"
    "# explanation（出力2: 解説）— プログラミング初学者にも分かるよう、できるだけやさしく\n"
    "- 難しい専門用語はできるだけ使わない。使うときは必ず「（＝かみくだいた言い換え）」を添える。\n"
    "- 1文を短く、やさしい日本語で。次の順に書く（全体で 5〜8 行）:\n"
    "  - まず1行で「要するに何をするクエリか」を、専門用語なしの日常語で（例: 「在庫を新しい順に5件だけ取り出します」）。\n"
    "  - 次に行頭「- 」の箇条書きで、SQL のどの部分が ORM のどこになったかを対応づけて、やさしく説明する\n"
    "    （例: 「- WHERE（絞り込み）→ .filter() に対応します」）。\n"
    "  - 最後に、初学者がつまずきやすい点や「なぜこう書くと良いか」を一言。\n"
    "- 上から目線にならず、語りかけるような『です・ます』調で。\n"
)

CONVERT_SCHEMA = {
    "type": "object",
    "properties": {
        "orm": {"type": "string"},
        "explanation": {"type": "string"},
    },
    "required": ["orm", "explanation"],
    "additionalProperties": False,
}

_NO_KEY_MSG = "サーバに ANTHROPIC_API_KEY が設定されていません。環境変数を設定して再起動してください。"


@csrf_exempt
def convert(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST のみ対応しています。"}, status=405)
    try:
        body = json.loads(request.body or b"{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "リクエストボディが JSON ではありません。"}, status=400)

    sql = (body.get("sql") or "").strip()
    if not sql:
        return JsonResponse({"error": "SQL が空です。"}, status=400)
    if not os.environ.get("ANTHROPIC_API_KEY"):
        return JsonResponse({"error": _NO_KEY_MSG}, status=500)

    try:
        client = anthropic.Anthropic()  # ANTHROPIC_API_KEY を env から自動取得
        resp = client.messages.create(
            model=MODEL,
            max_tokens=2000,
            system=CONVERT_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": sql}],
            output_config={"format": {"type": "json_schema", "schema": CONVERT_SCHEMA}},
        )
        text = next(b.text for b in resp.content if b.type == "text")
        data = json.loads(text)
        return JsonResponse({"orm": data["orm"], "explanation": data["explanation"]})
    except anthropic.APIError as e:
        return JsonResponse({"error": f"Claude API エラー: {e}"}, status=502)
    except Exception as e:  # noqa: BLE001
        return JsonResponse({"error": f"変換に失敗しました: {e}"}, status=500)


# ---------------------------------------------------------------------------
# SQL を WMS のDBで実行して結果の行を返す（読み取り専用・SELECT のみ）
# Claude は使わない（純粋な DB アクセス）。
# ---------------------------------------------------------------------------

MAX_ROWS = 200  # 返す最大行数


def _wms_db_params():
    """~/projects/wms/.env から Postgres 接続情報を読む。"""
    envfile = Path(WMS_ROOT) / ".env"
    vals = {}
    for line in envfile.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        vals[k.strip()] = v.strip().strip('"').strip("'")
    return {
        "host": vals.get("POSTGRES_HOST", "localhost"),
        "port": vals.get("POSTGRES_PORT", "5432"),
        "dbname": vals.get("POSTGRES_DB", ""),
        "user": vals.get("POSTGRES_USER", ""),
        "password": vals.get("POSTGRES_PASSWORD", ""),
    }


def _cell(v):
    """JSON で返せる形に整える（日付や Decimal は文字列に）。"""
    if v is None or isinstance(v, (bool, int, float, str)):
        return v
    return str(v)


@csrf_exempt
def run_sql(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST のみ対応しています。"}, status=405)
    try:
        body = json.loads(request.body or b"{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "リクエストボディが JSON ではありません。"}, status=400)

    raw = (body.get("sql") or "").strip()
    if not raw:
        return JsonResponse({"error": "SQL が空です。"}, status=400)

    sql = raw.rstrip(";").strip()
    low = sql.lower()
    # 安全策: SELECT（または WITH … SELECT）のみ・単一文のみ。
    if not (low.startswith("select") or low.startswith("with")):
        return JsonResponse(
            {"error": "安全のため SELECT 文（または WITH … SELECT）だけ実行できます。"}, status=400
        )
    if ";" in sql:
        return JsonResponse({"error": "複数の文は実行できません（; は1つだけ・末尾のみ）。"}, status=400)

    try:
        params = _wms_db_params()
        # 読み取り専用接続。書き込みは Postgres 側でも拒否される。
        with psycopg.connect(connect_timeout=5, **params) as conn:
            conn.read_only = True
            with conn.cursor() as cur:
                cur.execute("SET statement_timeout = '5s'")  # 暴走クエリ対策
                cur.execute(sql)
                columns = [d.name for d in cur.description] if cur.description else []
                fetched = cur.fetchmany(MAX_ROWS + 1)
            conn.rollback()
        truncated = len(fetched) > MAX_ROWS
        rows = [[_cell(v) for v in row] for row in fetched[:MAX_ROWS]]
        return JsonResponse({"columns": columns, "rows": rows, "truncated": truncated})
    except FileNotFoundError:
        return JsonResponse(
            {"error": "WMS の .env（DB接続情報）が見つかりません。"}, status=500
        )
    except psycopg.OperationalError as e:
        return JsonResponse(
            {"error": f"DB に接続できません（WMS の DB が起動しているか確認してください）: {str(e).strip()}"},
            status=502,
        )
    except psycopg.Error as e:
        return JsonResponse({"error": f"SQL 実行エラー: {str(e).strip()}"}, status=400)
    except Exception as e:  # noqa: BLE001
        return JsonResponse({"error": f"実行に失敗しました: {e}"}, status=500)

"""WMS の Postgres を SQLite ファイルに書き出す（本番同梱用）。

使い方（wms-guide/server の uv 環境で実行）:
    cd ~/projects/wms-guide/server
    uv run python ../scripts/export_sqlite.py

出力: wms-guide/public/wms.sqlite（全テーブル・全データ。ブラウザ内 SQLite が読む）。
安全のため django_session / django_admin_log は除外し、auth_user.password は空にする。
"""

import datetime
import decimal
import sqlite3
import uuid
from pathlib import Path

import psycopg

WMS_ROOT = Path(__file__).resolve().parents[2] / "wms"
OUT = Path(__file__).resolve().parents[1] / "public" / "wms.sqlite"

# 公開したくない / 学習に不要なテーブルは除外。
# users 系はパスワード(ハッシュ)・メール等の個人情報を含むため必ず除外する。
SKIP_TABLES = {
    "django_session",
    "django_admin_log",
    "users",
    "users_groups",
    "users_user_permissions",
    "auth_user",
    "auth_user_groups",
    "auth_user_user_permissions",
}


def pg_params():
    vals = {}
    for line in (WMS_ROOT / ".env").read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        vals[k.strip()] = v.strip().strip('"').strip("'")
    return {
        "host": vals.get("POSTGRES_HOST", "localhost"),
        "port": vals.get("POSTGRES_PORT", "5432"),
        "dbname": vals["POSTGRES_DB"],
        "user": vals["POSTGRES_USER"],
        "password": vals["POSTGRES_PASSWORD"],
    }


def affinity(pg_type):
    if pg_type in ("integer", "bigint", "smallint"):
        return "INTEGER"
    if pg_type in ("numeric", "double precision", "real"):
        return "REAL"
    if pg_type == "boolean":
        return "INTEGER"
    return "TEXT"


def conv(v):
    if v is None:
        return None
    if isinstance(v, bool):
        return 1 if v else 0
    if isinstance(v, (int, float, str)):
        return v
    if isinstance(v, decimal.Decimal):
        return float(v)
    if isinstance(v, (datetime.datetime, datetime.date, datetime.time)):
        return v.isoformat(sep=" ") if isinstance(v, datetime.datetime) else v.isoformat()
    if isinstance(v, uuid.UUID):
        return str(v)
    if isinstance(v, (bytes, bytearray, memoryview)):
        return bytes(v)
    return str(v)


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    if OUT.exists():
        OUT.unlink()

    pg = psycopg.connect(**pg_params())
    pg.read_only = True
    sq = sqlite3.connect(OUT)

    with pg.cursor() as cur:
        cur.execute(
            "SELECT table_name FROM information_schema.tables "
            "WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name"
        )
        tables = [r[0] for r in cur.fetchall() if r[0] not in SKIP_TABLES]

    total_rows = 0
    for t in tables:
        with pg.cursor() as cur:
            cur.execute(
                "SELECT column_name, data_type FROM information_schema.columns "
                "WHERE table_schema='public' AND table_name=%s ORDER BY ordinal_position",
                (t,),
            )
            cols = cur.fetchall()
        col_defs = ", ".join(f'"{c}" {affinity(dt)}' for c, dt in cols)
        col_names = [c for c, _ in cols]
        sq.execute(f'CREATE TABLE "{t}" ({col_defs})')

        with pg.cursor(name=f"cur_{t}") as cur:  # server-side cursor（大きい表対策）
            cur.execute(f'SELECT * FROM "{t}"')
            placeholders = ", ".join("?" for _ in col_names)
            insert = f'INSERT INTO "{t}" VALUES ({placeholders})'
            batch = []
            for row in cur:
                vals = [conv(v) for v in row]
                # 念のため、どのテーブルでも password 列があれば必ず空にする（多重防御）。
                if "password" in col_names:
                    vals[col_names.index("password")] = ""
                batch.append(vals)
                if len(batch) >= 1000:
                    sq.executemany(insert, batch)
                    total_rows += len(batch)
                    batch = []
            if batch:
                sq.executemany(insert, batch)
                total_rows += len(batch)

    sq.commit()
    sq.close()
    pg.close()
    size_kb = OUT.stat().st_size / 1024
    print(f"OK: {len(tables)} tables, {total_rows} rows -> {OUT} ({size_kb:.0f} KB)")


if __name__ == "__main__":
    main()

// 初心者向け「ORM 早わかり」まとめ。静的（API は使わない）。SQL ↔ ORM の対応を一覧で示す。

interface Row {
  want: string
  sql: string
  orm: string
}

const ROWS: Row[] = [
  { want: '全部とる', sql: 'SELECT * FROM stock', orm: 'Stock.objects.all()' },
  { want: '条件で絞る', sql: "WHERE status = 'x'", orm: ".filter(status='x')" },
  { want: 'あいまい検索', sql: "WHERE name LIKE '%本%'", orm: ".filter(name__contains='本')" },
  { want: '1件だけ', sql: '… LIMIT 1', orm: '.first() / .get(...)' },
  { want: '並べ替え', sql: 'ORDER BY created DESC', orm: ".order_by('-created')" },
  { want: '件数を数える', sql: 'SELECT COUNT(*) …', orm: '.count()' },
  { want: '表をつなぐ', sql: 'JOIN products …', orm: ".select_related('product')" },
  { want: '集計（合計など）', sql: 'GROUP BY … SUM(qty)', orm: ".values('…').annotate(Sum('qty'))" },
  { want: '追加する', sql: 'INSERT INTO …', orm: 'Stock.objects.create(…)' },
  { want: '更新する', sql: 'UPDATE … SET …', orm: 'obj.save() / qs.update(…)' },
  { want: '削除する', sql: 'DELETE FROM …', orm: 'obj.delete()' },
]

export default function OrmCheatSheet() {
  return (
    <details className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
      <summary className="cursor-pointer text-base font-semibold text-[var(--color-head)]">
        ORM 早わかり（初心者向け・SQL との対応）
      </summary>

      <div className="mt-3 space-y-3 text-sm text-[var(--color-ink)]">
        <p>
          <strong>ORM</strong> は、<strong>SQL を直接書かずに、Python の書き方でデータベースを扱う</strong>
          仕組みです。Django では <code className="rounded bg-[var(--color-mist)] px-1 font-mono">Model.objects</code>
          （＝その表の窓口）から始めて、<code className="rounded bg-[var(--color-mist)] px-1 font-mono">.filter()</code>
          などを後ろに繋いで書きます。裏で Django が SQL に翻訳してくれます。
        </p>

        <div className="overflow-auto rounded-lg border border-[var(--color-line)]">
          <table className="w-full text-left">
            <thead className="bg-[var(--color-mist)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <tr>
                <th className="px-3 py-2 font-medium">やりたいこと</th>
                <th className="px-3 py-2 font-medium">SQL</th>
                <th className="px-3 py-2 font-medium">Django ORM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {ROWS.map((r) => (
                <tr key={r.want}>
                  <td className="whitespace-nowrap px-3 py-1.5 text-[var(--color-head)]">{r.want}</td>
                  <td className="whitespace-nowrap px-3 py-1.5 font-mono text-[13px] text-[var(--color-muted)]">
                    {r.sql}
                  </td>
                  <td className="whitespace-nowrap px-3 py-1.5 font-mono text-[13px] text-[var(--color-accent)]">
                    {r.orm}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="rounded-lg bg-[var(--color-accent-soft)] px-3 py-2 text-[var(--color-ink)]">
          💡 読み方のコツ：<code className="font-mono">Stock.objects</code> を「Stock 表の窓口」と読み、
          その後ろの <code className="font-mono">.filter(...)</code>（＝絞り込み）や
          <code className="font-mono"> .order_by(...)</code>（＝並べ替え）を「窓口にお願いする操作」と考えると、
          英語の文のように読めます。
        </p>
      </div>
    </details>
  )
}

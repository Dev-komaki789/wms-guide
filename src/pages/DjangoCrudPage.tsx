import { Link } from 'react-router-dom'
import Mermaid from '../components/Mermaid'

// 学習メモ（その2）: zaiko-mini の在庫照会画面に「追加・更新・削除」を足して学んだ CRUD のまとめ。
// 「どの順番で見ていくか」を最初に置く。

function Section({
  no,
  title,
  children,
}: {
  no: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-8">
      <h2 className="flex items-baseline gap-2 text-lg font-semibold text-[var(--color-head)]">
        <span className="font-mono text-sm text-[var(--color-muted)]">{no}</span>
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-[var(--color-mist)] px-1.5 py-0.5 font-mono text-[0.85em] text-[var(--color-head)]">
      {children}
    </code>
  )
}

// CRUD 共通パターン: 1つの View が GET（見せる）と POST（変える）を担当する。
const CRUD_FLOW = `flowchart TD
    A["① 画面を開く / リンクを押す<br/>(GET)"] --> V1["View が呼ばれる"]
    V1 --> Q{"request.method は?"}
    Q -- "GET（最初）" --> C["フォーム or 確認画面を表示"]
    C --> B["② 保存 / 削除ボタンを押す<br/>(POST + CSRF)"]
    B --> V2["同じ URL・同じ View が再び呼ばれる"]
    V2 --> Q
    Q -- "POST" --> S["保存 form.save() / 削除 stock.delete()"]
    S --> R["一覧へ redirect"]`

// 学習ロードマップ（見ていく順番）
const roadmap: { step: string; title: string; detail: string; to?: string }[] = [
  {
    step: 'STEP 1',
    title: 'まず「読み取り（R）」の基礎',
    detail:
      '1リクエストの流れ（①〜⑥）・ORM・検索・テーブル連携。データを「見る」仕組み。',
    to: '/django-basics',
  },
  {
    step: 'STEP 2',
    title: 'このページ「CRUD」でデータを変える',
    detail: '追加(C)・更新(U)・削除(D)。フォーム送信(POST)で DB を書き換える仕組み。',
  },
]

// CRUD の中での順番
const crudOrder: { no: number; op: string; why: string }[] = [
  { no: 1, op: '追加（Create）', why: 'POST・フォーム・保存という新しい土台を最初に学ぶ' },
  { no: 2, op: '更新（Update）', why: '追加とほぼ同じ。違いは instance= だけなので差分で学べる' },
  { no: 3, op: '削除（Delete）', why: '「確認 → POST で実行」という安全な作り方を最後に学ぶ' },
]

const crudTable: { op: string; url: string; view: string; method: string; result: string }[] = [
  { op: '参照 Read', url: '/stock/', view: 'stock_list', method: 'GET', result: '一覧表示・検索' },
  { op: '追加 Create', url: '/stock/new/', view: 'stock_create', method: 'GET→フォーム / POST→保存', result: 'INSERT' },
  { op: '更新 Update', url: '/stock/<pk>/edit/', view: 'stock_update', method: 'GET→既存フォーム / POST→更新', result: 'UPDATE' },
  { op: '削除 Delete', url: '/stock/<pk>/delete/', view: 'stock_delete', method: 'GET→確認 / POST→削除', result: 'DELETE' },
]

export default function DjangoCrudPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <header className="border-b border-[var(--color-line)] pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent)]">
            学習メモ その2
          </span>
          <span className="rounded-full bg-[var(--color-mist)] px-2.5 py-0.5 text-xs text-[var(--color-muted)]">
            Django CRUD
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-[var(--color-head)]">
          Django CRUD — 在庫の追加・更新・削除
        </h1>
        <p className="mt-2 text-[var(--color-ink)]">
          在庫照会（読み取り）の画面に、<strong>追加・更新・削除</strong>を足した記録。
          「フォームを送信（POST）して DB を書き換える」仕組みを、追加 → 更新 → 削除の順に学んだ。
        </p>
      </header>

      {/* 見ていく順番（ロードマップ） */}
      <Section no="01" title="見ていく順番（ロードマップ）">
        <ol className="space-y-3">
          {roadmap.map((r) => (
            <li
              key={r.step}
              className="flex gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4"
            >
              <span className="shrink-0 rounded-md bg-[var(--color-accent)] px-2 py-1 font-mono text-xs font-semibold text-white">
                {r.step}
              </span>
              <div>
                <div className="font-medium text-[var(--color-head)]">
                  {r.to ? (
                    <Link to={r.to} className="text-[var(--color-accent)] underline">
                      {r.title}
                    </Link>
                  ) : (
                    r.title
                  )}
                </div>
                <div className="mt-0.5 text-sm text-[var(--color-ink)]">{r.detail}</div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-4 rounded-xl bg-[var(--color-accent-soft)] p-4">
          <div className="text-sm font-medium text-[var(--color-head)]">
            このページ（CRUD）の中の順番
          </div>
          <ol className="mt-2 space-y-1.5">
            {crudOrder.map((c) => (
              <li key={c.no} className="flex gap-2 text-sm text-[var(--color-ink)]">
                <span className="font-semibold text-[var(--color-accent)]">{c.no}.</span>
                <span>
                  <strong>{c.op}</strong> — {c.why}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* CRUD 一覧表 */}
      <Section no="02" title="CRUD 一覧（操作・URL・View・メソッド）">
        <div className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-mist)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <tr>
                <th className="px-3 py-2 font-medium">操作</th>
                <th className="px-3 py-2 font-medium">URL</th>
                <th className="px-3 py-2 font-medium">View</th>
                <th className="px-3 py-2 font-medium">メソッド</th>
                <th className="px-3 py-2 font-medium">DB</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {crudTable.map((r) => (
                <tr key={r.op}>
                  <td className="px-3 py-2 align-top font-medium text-[var(--color-head)]">{r.op}</td>
                  <td className="px-3 py-2 align-top">
                    <Code>{r.url}</Code>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <Code>{r.view}</Code>
                  </td>
                  <td className="px-3 py-2 align-top text-[var(--color-ink)]">{r.method}</td>
                  <td className="px-3 py-2 align-top text-[var(--color-ink)]">{r.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* 共通パターン + 図 */}
      <Section no="03" title="共通パターン: 1つの View が GET と POST を担当">
        <p className="text-[var(--color-ink)]">
          追加・更新・削除はどれも同じ骨格。<strong>1つの View</strong> が、
          <Code>request.method</Code> で「GET（フォーム/確認を見せる）」と「POST（保存/削除する）」を
          出し分ける。POST が終わったら一覧へ <Code>redirect</Code>（二重送信を防ぐ定番）。
        </p>
        <div className="mt-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
          <Mermaid chart={CRUD_FLOW} />
        </div>
      </Section>

      {/* 各操作の要点 */}
      <Section no="04" title="各操作の要点">
        <div className="space-y-3">
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
            <div className="font-medium text-[var(--color-head)]">① 追加（Create）</div>
            <div className="mt-1 text-sm text-[var(--color-ink)]">
              <Code>ModelForm</Code> でモデルから入力フォームを自動生成。GET は空フォーム、POST は
              <Code>form.is_valid()</Code>（入力チェック）→ <Code>form.save()</Code> で新規 INSERT。
              入力チェックのルールは <Code>models.py</Code> の <Code>blank</Code> /{' '}
              <Code>max_length</Code> から自動で来る。
            </div>
          </div>
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
            <div className="font-medium text-[var(--color-head)]">② 更新（Update）</div>
            <div className="mt-1 text-sm text-[var(--color-ink)]">
              追加とほぼ同じ。違いは <Code>StockForm(instance=stock)</Code> で
              <strong>既存データを渡す</strong>こと。これだけで同じフォームが「編集」になる。
              対象は <Code>get_object_or_404(Stock, pk=pk)</Code> で取得（URL の <Code>{'<int:pk>'}</Code> が対象id）。
            </div>
          </div>
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
            <div className="font-medium text-[var(--color-head)]">③ 削除（Delete）</div>
            <div className="mt-1 text-sm text-[var(--color-ink)]">
              削除リンク（GET）で<strong>確認画面</strong>を出し、「削除する」ボタン（POST）で
              <Code>stock.delete()</Code>。GET は安全・POST で変える、を徹底する
              （リンクで即削除すると、クロール等で誤って消える事故が起きるため）。
            </div>
          </div>
        </div>
      </Section>

      {/* 学んだ概念 */}
      <Section no="05" title="学んだ概念">
        <div className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)]">
          <dl>
            {[
              ['ModelForm', 'モデルから入力フォームを自動生成。入力チェックもモデル定義から来る'],
              ['GET と POST', 'GET=見せる・安全 / POST=データを変える。検索は GET、追加更新削除は POST'],
              ['CSRF（{% csrf_token %}）', '他サイトからのなりすまし送信を防ぐ合言葉。POST フォームに必須'],
              ['get_object_or_404', '1件取得。無ければ 404。django.shortcuts 標準。.get() + 無ければ404'],
              ['redirect（POST後）', '保存/削除の後は一覧へリダイレクト。リロードでの二重実行を防ぐ'],
              ["{% url 'name' 引数 %}", 'URL を名前から逆引き。pk を渡せば /stock/5/edit/ のように作れる'],
              ['instance=', '同じフォームを「追加」と「更新」で使い分ける鍵'],
            ].map(([term, desc]) => (
              <div
                key={term}
                className="flex flex-col gap-1 border-b border-[var(--color-line)] px-4 py-3 last:border-b-0 sm:flex-row sm:gap-4"
              >
                <dt className="shrink-0 sm:w-56">
                  <Code>{term}</Code>
                </dt>
                <dd className="text-sm text-[var(--color-ink)]">{desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* つまずき/注意 */}
      <Section no="06" title="注意・つまずきメモ">
        <ul className="space-y-2">
          {[
            'POST フォームに {% csrf_token %} を忘れると 403 になる。',
            '削除は「リンク（GET）で即実行」しない。確認画面 → POST で消す。',
            'フォームの必須チェックは models.py の blank で決まる（blank=True が無ければ必須）。',
            'フォームのラベルは verbose_name（CharField は第1引数、ForeignKey は verbose_name= で指定）。',
            '追加と更新で同じテンプレートを使い回せる（title を context で渡して見出しだけ変える）。',
          ].map((t, i) => (
            <li
              key={i}
              className="flex gap-2 rounded-lg bg-[var(--color-paper)] px-4 py-2.5 text-sm text-[var(--color-ink)] ring-1 ring-[var(--color-line)]"
            >
              <span className="text-[var(--color-warn)]">⚠</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </Section>

      <div className="mt-8 border-t border-[var(--color-line)] pt-4 text-sm">
        <Link to="/django-basics" className="text-[var(--color-accent)] underline">
          ← STEP 1「Django 入門（在庫照会を一から）」に戻る
        </Link>
      </div>
    </article>
  )
}

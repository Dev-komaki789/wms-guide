import { Link } from 'react-router-dom'
import Mermaid from '../components/Mermaid'

// 学習メモ: zaiko-mini（素の Django + SQLite）で在庫照会画面を一から作って学んだことのまとめ。
// WMS の画面（サーバーサイドレンダリング）と同じ仕組みを、最小サイズで通して体感した記録。

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

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
      <div className="font-medium text-[var(--color-head)]">{title}</div>
      <div className="mt-1.5 text-sm text-[var(--color-ink)]">{children}</div>
    </div>
  )
}

const REQUEST_FLOW = `flowchart TD
    A["ブラウザ: /stock/?q=...&category=文具&qty_min=10"] --> B["② URL<br/>config/urls.py → stock/urls.py"]
    B --> C["③ View<br/>stock_list(request)"]
    C --> D["④ Model(ORM)<br/>Stock.objects.select_related('category').filter(...)"]
    D --> E["⑤ DB(SQLite)<br/>stock_stock / stock_category を JOIN"]
    E --> F["⑥ Template<br/>stock_list.html にデータを流し込む"]
    F --> G["完成した HTML をブラウザへ返す"]`

const buildSteps: { no: number; title: string; detail: string }[] = [
  { no: 1, title: 'プロジェクト作成', detail: 'uv で土台を作り Django を入れる → django-admin startproject config .（設定の親）' },
  { no: 2, title: 'アプリ作成', detail: 'startapp stock（機能のまとまり）→ settings.py の INSTALLED_APPS に登録' },
  { no: 3, title: 'モデル定義', detail: 'models.py に Stock（sku_code / product_name / quantity）。テーブルの「形」' },
  { no: 4, title: 'マイグレーション', detail: 'makemigrations（設計図を作る）→ migrate（DBに反映）。SQLite に stock テーブルが出来る' },
  { no: 5, title: 'データ投入', detail: 'シェルで Stock.objects.create(...) を3件。__str__ で一覧が読みやすく表示される' },
  { no: 6, title: 'View 作成', detail: 'views.py に stock_list()。Stock.objects.all() で取り出し render() で HTML を返す' },
  { no: 7, title: 'URL 接続', detail: 'stock/urls.py（空→View）+ config/urls.py（/stock/ → stockアプリへ include）' },
  { no: 8, title: 'テンプレート作成', detail: 'templates/stock/stock_list.html。{% for %} と {{ }} で在庫を表に並べる → 画面完成' },
]

const wmsMap: { mine: string; wms: string }[] = [
  { mine: 'Stock.objects.filter(...)', wms: 'PickingList.objects.filter(picking_list_code=code)（入口画面の検索）' },
  { mine: "request.GET.get('q')", wms: "request.GET.get('code')（スキャン値の受け取り）" },
  { mine: "select_related('category')", wms: "select_related('sku__product', 'location')（明細の N+1 回避）" },
  { mine: '{{ stock.category.name }}', wms: '{{ it.location.location_code }}（繋いだ先の値をドットで辿る）' },
  { mine: 'render(request, template, ctx)', wms: 'ピッキング画面（HTML を返す）' },
]

export default function DjangoBasicsPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <header className="border-b border-[var(--color-line)] pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent)]">
            学習メモ
          </span>
          <span className="rounded-full bg-[var(--color-mist)] px-2.5 py-0.5 text-xs text-[var(--color-muted)]">
            素の Django + SQLite
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-[var(--color-head)]">
          Django 入門 — 在庫照会を一から作って学んだこと
        </h1>
        <p className="mt-2 text-[var(--color-ink)]">
          別プロジェクト <Code>zaiko-mini</Code> で、React も REST API も使わず{' '}
          <strong>素の Django + SQLite</strong> だけで「在庫照会画面」を一から作った記録。
          WMS の画面と同じ「サーバーが HTML を返す」仕組みを、最小サイズで通して体感した。
        </p>
      </header>

      {/* 完成したもの */}
      <Section no="01" title="作ったもの">
        <p className="text-[var(--color-ink)]">
          在庫の一覧表に、次の絞り込みが付いた在庫照会画面：
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            '商品名のあいまい検索（__contains）',
            'SKUコードのあいまい検索',
            'カテゴリのプルダウン絞り込み（ForeignKey 連携）',
            '在庫数の範囲（◯個以上 / ◯個以下）',
            '複数条件の AND 絞り込み',
            '0件のとき「検索結果がありません」表示',
          ].map((t) => (
            <li
              key={t}
              className="flex gap-2 rounded-lg bg-[var(--color-paper)] px-3 py-2 text-sm text-[var(--color-ink)] ring-1 ring-[var(--color-line)]"
            >
              <span className="text-[var(--color-accent)]">▸</span>
              {t}
            </li>
          ))}
        </ul>
      </Section>

      {/* 1リクエストの流れ */}
      <Section no="02" title="1リクエストの流れ（①〜⑥）">
        <p className="text-[var(--color-ink)]">
          ブラウザで <Code>/stock/</Code> を開いた瞬間に起きること。WMS の画面解説と同じ
          「① リクエスト → ② URL → ③ View → ④ Model → ⑤ DB → ⑥ 画面」を、自分の手で組んだ。
        </p>
        <div className="mt-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
          <Mermaid chart={REQUEST_FLOW} />
        </div>
      </Section>

      {/* 作った手順 */}
      <Section no="03" title="作った手順（8工程）">
        <ol className="space-y-3">
          {buildSteps.map((s) => (
            <li
              key={s.no}
              className="flex gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-semibold text-white">
                {s.no}
              </span>
              <div>
                <div className="font-medium text-[var(--color-head)]">{s.title}</div>
                <div className="mt-0.5 text-sm text-[var(--color-ink)]">{s.detail}</div>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* 学んだ概念 */}
      <Section no="04" title="学んだ概念">
        <div className="grid gap-3 sm:grid-cols-2">
          <Card title="ORM（SQLを書かずにDB操作）">
            <Code>Stock.objects.all()</Code> が ORM。裏で Django が SQL に翻訳する。
            <Code>.filter()</Code> = WHERE、<Code>.create()</Code> = INSERT、
            <Code>.get()</Code> = 1件取得。
          </Card>
          <Card title="絞り込み filter と __">
            <Code>__contains</Code>（含む）<Code>__gte</Code>（以上）<Code>__lte</Code>（以下）。
            <Code>filter</Code> を重ねると AND。<Code>category__name</Code> は繋いだ先の項目で絞る。
          </Card>
          <Card title="検索フォーム（GET）">
            <Code>method="get"</Code> で検索語が URL <Code>?q=...</Code> に乗る。
            <Code>name="q"</Code> と <Code>request.GET.get('q')</Code> をペアで一致。
            <Code>value="{'{{ q }}'}"</Code> で入力を残す。
          </Card>
          <Card title="テーブル連携（ForeignKey）">
            在庫は <Code>category_id</Code>（番号）だけ持ち、カテゴリの1行を指す。
            多対一（複数商品 → 1カテゴリ）。逆引きは <Code>category.stock_set.all()</Code>。
          </Card>
          <Card title="N+1 問題と select_related">
            ループ内で繋いだ先に毎回問い合わせると 1+N 本の SQL。
            <Code>select_related('category')</Code> で JOIN 1本にまとめて解決。
          </Card>
          <Card title="テンプレートの2記号">
            <Code>{'{{ }}'}</Code> は値を表示、<Code>{'{% %}'}</Code> は処理（for / if）。
            <Code>{'{% for %}'}</Code> + <Code>{'{% empty %}'}</Code> で0件メッセージ。
          </Card>
        </div>
      </Section>

      {/* つまずきメモ */}
      <Section no="05" title="つまずきメモ">
        <ul className="space-y-2">
          {[
            'makemigrations（設計図を作る）と migrate（DBに反映）は別。migrate を忘れると「no such table」。',
            'Python のコードは bash（$）ではなく Django シェル（>>>）で打つ。',
            '既存データがある表に必須の列を足すと migration が詰まる → 一旦 null=True にして後から割り当て。',
            'Prettier が Django テンプレートの {% if a == b %} を壊す（a="" ="b" に変形）。テンプレートは自動整形オフ。',
            'カテゴリは作成済みなら create せず get で取り出す（create を繰り返すと重複する）。',
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

      {/* WMS との対応 */}
      <Section no="06" title="WMS との対応（同じ仕組み）">
        <p className="text-[var(--color-ink)]">
          ここで手で書いたものは、WMS の画面が大きくやっていることの最小版。骨組みは同じ。
        </p>
        <div className="mt-3 overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-mist)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <tr>
                <th className="px-4 py-2 font-medium">zaiko-mini（自分で書いた）</th>
                <th className="px-4 py-2 font-medium">WMS（同じ仕組み）</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {wmsMap.map((m, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 align-top">
                    <Code>{m.mine}</Code>
                  </td>
                  <td className="px-4 py-2 align-top text-[var(--color-ink)]">{m.wms}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="mt-8 border-t border-[var(--color-line)] pt-4 text-sm">
        <Link to="/django-crud" className="text-[var(--color-accent)] underline">
          次へ → STEP 2「Django CRUD（追加・更新・削除）」
        </Link>
      </div>
    </article>
  )
}

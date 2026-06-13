import type { EcChapter } from './types'

// EC コード解説 #8「商品詳細」。
export const ch08Detail: EcChapter = {
  id: 'detail',
  num: 8,
  title: '商品詳細 ― バリエーション選択と在庫取得',
  summary: '商品詳細ページを読みます。URL の id から1件を取得し、サイズ・色などのバリエーション（SKU）を選ぶと、価格・在庫・カートボタンが連動して変わる――状態の持ち方と派生の良い例です。',
  relatedReact: ['第8章 ルーティング', '第7章 useEffect', '第5章 useState', '第18章 派生state'],
  intro: [
    '一覧から商品をクリックすると、商品詳細ページ（/products/:id）へ来ます。ここでは「どの id か」を URL から受け取り、その商品を取得して、バリエーションを選べるようにします。',
  ],
  sections: [
    {
      id: 'param-fetch',
      heading: '8-1. URL の id から取得する',
      body: [
        'useParams で URL の :id を受け取り（第8章）、useEffect で fetchProduct(id) を呼んで取得します（第7章）。#6 の一覧と同じ「loading / error / cancelled」の形ですが、依存配列が [id] なのがポイント。別の商品へ移動して id が変われば、自動で取り直します。',
      ],
      examples: [
        {
          file: 'src/pages/ProductDetailPage.tsx',
          code: `const { id } = useParams<{ id: string }>()\nconst [product, setProduct] = useState<Product | null>(null)\nconst [selectedSku, setSelectedSku] = useState<Sku | null>(null)\nconst [qty, setQty] = useState(1)\n\nuseEffect(() => {\n  let cancelled = false\n  async function load() {\n    setLoading(true); setError(null)\n    try {\n      const p = await fetchProduct(id!)\n      if (cancelled) return\n      setProduct(p)\n      setSelectedSku(p.skus[0] ?? null)   // 最初のSKUを初期選択\n      setQty(1)\n    } catch { if (!cancelled) setError('商品が見つかりませんでした') }\n    finally { if (!cancelled) setLoading(false) }\n  }\n  load()\n  return () => { cancelled = true }\n}, [id])   // ← id が変わるたび取り直す`,
          note: 'useParams<{ id: string }>() で型を指定（第12章）。取得できたら setSelectedSku(p.skus[0]) で「最初のバリエーション」を選択状態に。複数の state（product / selectedSku / qty）で1画面の状態を表しています。',
        },
      ],
    },
    {
      id: 'select',
      heading: '8-2. バリエーション選択 ― 選択中を state で持つ',
      body: [
        'サイズ・色などのバリエーション（SKU）が複数あるとき、ボタンを並べて「どれを選んでいるか」を selectedSku の state で持ちます。選択中のボタンだけ見た目を変えるのは、第16章の条件付きクラスです。',
      ],
      examples: [
        {
          file: 'src/pages/ProductDetailPage.tsx',
          code: `{product.skus.length > 1 && (\n  <div className="flex flex-wrap gap-2">\n    {product.skus.map((sku) => {\n      const isSel = selectedSku?.id === sku.id\n      return (\n        <button\n          key={sku.id}\n          onClick={() => setSelectedSku(sku)}      // 選択を切り替え\n          className={\`rounded-lg border px-3 py-1.5 text-sm \${\n            isSel\n              ? 'border-brand-600 bg-brand-50 font-semibold text-brand-700'\n              : 'border-slate-300 text-slate-600 hover:bg-slate-50'\n          }\`}\n        >\n          {skuLabel(sku)}\n        </button>\n      )\n    })}\n  </div>\n)}`,
          note: 'skus.length > 1 && (…) で「2つ以上あるときだけ」選択UIを出す（第4章の &&）。map ＋ key（第3章）。isSel（選択中か）で className を出し分け（第16章）。onClick で setSelectedSku（第5章・第6章）。学んだ部品の組み合わせです。',
        },
      ],
    },
    {
      id: 'derived',
      heading: '8-3. 選択に連動して変わる ― 派生で出す',
      body: [
        '価格・在庫・カートボタンは、選んだ SKU に応じて変わります。ここで重要なのは、価格を別の state で持たず「選択中の SKU から計算する（派生）」こと。第18章の通り、計算で出せる値は state にしません。',
      ],
      examples: [
        {
          file: 'src/pages/ProductDetailPage.tsx',
          code: `// 選択中の SKU から「いまの価格」を計算（state にしない）\nconst price = selectedSku?.price_incl_tax ?? null\n\n// 価格表示\n<p className="text-3xl font-bold">\n  {price != null ? formatYen(price) : '価格未定'}（税込）\n</p>\n\n// 在庫・カートも選択中の SKU を渡す\n{selectedSku && (\n  <>\n    <StockBadge skuCode={selectedSku.sku_code} />\n    <AddToCartButton skuCode={selectedSku.sku_code} quantity={qty} block />\n  </>\n)}`,
          note: 'price は selectedSku から派生（第18章）。selectedSku が変われば、次の描画で price も在庫バッジもカートボタンも自動でその SKU のものになります。「選択を1か所(selectedSku)で持ち、あとは派生」――状態を最小限にする設計です。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'もし price や在庫まで別々の state にして、選択のたびに手で更新していたら、更新漏れでズレるバグの温床に。「元になる事実（選択中の SKU）だけ state に持ち、表示は計算で出す」。第18章の教えがそのまま効いています。',
        },
      ],
    },
    {
      id: 'breadcrumb',
      heading: '8-4. パンくず ― カテゴリへ戻るリンク',
      body: [
        '画面上部の「商品一覧 / カテゴリ名」というパンくずは、#6 で見た「URL に状態を持たせる」設計のおかげで素直に書けます。カテゴリ名のリンク先は /?category=... で、一覧ページがその URL を読んで絞り込みます。',
      ],
      examples: [
        {
          file: 'src/pages/ProductDetailPage.tsx',
          code: `<nav className="text-sm text-slate-500">\n  <Link to="/">商品一覧</Link>\n  {product.category_name && (\n    <>\n      <span className="mx-2">/</span>\n      <Link to={\`/?category=\${product.category_code}\`}>{product.category_name}</Link>\n    </>\n  )}\n</nav>`,
          note: '/?category=CAT-... へリンクするだけで、一覧ページが useSearchParams でそれを読み、そのカテゴリで絞り込んだ状態になります（#6）。状態を URL に置くと、こうしたリンクが自然に作れるのが利点です。',
        },
      ],
    },
  ],
}

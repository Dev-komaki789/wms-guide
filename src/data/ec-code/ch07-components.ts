import type { EcChapter } from './types'

// EC コード解説 #7「部品いろいろ」。
export const ch07Components: EcChapter = {
  id: 'components',
  num: 7,
  title: '部品いろいろ ― ProductCard / 価格表示 / 共通スタイル',
  summary: '一覧に並ぶ商品カード ProductCard と、その中の小さな工夫（最安値の表示・共通スタイル・押したときだけ在庫を取る StockBadge）を読みます。props・条件表示・小さなロジックの置き場所が見どころです。',
  relatedReact: ['第2章 props', '第4章 条件で出し分ける', '第16章 スタイリング', '第7章 useEffect'],
  intro: [
    '#6 の一覧では、商品1件ごとに <ProductCard key={p.id} product={p} /> を並べていました。今回はその ProductCard 本体と、関連する小さな部品を読みます。',
  ],
  sections: [
    {
      id: 'productcard',
      heading: '7-1. ProductCard ― props で1商品を受け取る',
      body: [
        'ProductCard は product を props で1つ受け取り、その中身（画像・カテゴリ・名前・価格）を表示するだけの部品です。第2章の「props で受け取って表示」「型を付ける」の実例。画像が無いときの代替表示など、条件表示（第4章）も入っています。',
      ],
      examples: [
        {
          file: 'src/components/ProductCard.tsx',
          code: `export function ProductCard({ product }: { product: Product }) {\n  const singleSku = product.skus.length === 1 ? product.skus[0] : null\n\n  return (\n    <div className={\`\${card} group flex flex-col ...\`}>\n      <Link to={\`/products/\${product.id}\`}>\n        {product.image_url ? (\n          <img src={product.image_url} alt={product.product_name} ... />\n        ) : (\n          <div className="...">画像なし</div>     // 画像が無いときの代替\n        )}\n      </Link>\n      {/* … 名前・価格 … */}\n    </div>\n  )\n}`,
          note: 'product: Product と型を付け（第12章）、{ product } で分割代入（第2章）。image_url ? <img> : <div>画像なし</div> は第4章の三項。クリックで詳細へ飛ぶ <Link>（第8章）も使われています。',
        },
      ],
    },
    {
      id: 'pricelabel',
      heading: '7-2. 価格表示の小さなロジック ― 派生で計算する',
      body: [
        '商品は複数バリエーション（SKU）を持ち、価格が違うことがあります。そこで「最安値、複数なら〜付き」を計算する小さな関数 priceLabel を、部品の外（モジュールの関数）に置いています。第18章「計算で出せる値は state にせず計算する」の実践です。',
      ],
      examples: [
        {
          file: 'src/components/ProductCard.tsx',
          code: `function priceLabel(product: Product): string {\n  const prices = product.skus\n    .map((s) => s.price_incl_tax)\n    .filter((p): p is number => p != null)   // null を除き、型も number に絞る\n  if (prices.length === 0) return '価格未定'\n  const min = Math.min(...prices)\n  const max = Math.max(...prices)\n  return min === max ? formatYen(min) : \`\${formatYen(min)} 〜\`\n}`,
          note: 'これは state ではなく「描画のたびに計算する派生値」（第18章）。filter((p): p is number => p != null) の p is number は TypeScript の“型ガード”で、「null を除いたので、ここから先は number だけ」と型レベルでも保証しています（第12章の一歩進んだ使い方）。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'こうした「表示のための純粋な計算」は、部品の外の普通の関数にすると、部品本体がスッキリし、テストもしやすくなります。金額の整形は utils/format.ts の formatYen（Intl.NumberFormat）に任せています。',
        },
      ],
    },
    {
      id: 'ui',
      heading: '7-3. 共通スタイル ― ui.ts でボタンの見た目を統一',
      body: [
        '「主ボタン」「枠線ボタン」「カード」など、何度も使う見た目は、Tailwind のクラス文字列を ui.ts にまとめ、各所で import して使っています（第16章のスタイリング）。これで見た目がブレず、変更も1か所で済みます。',
      ],
      examples: [
        {
          file: 'src/components/ui.ts',
          code: `export const btnPrimary =\n  'inline-flex items-center justify-center gap-1 rounded-lg bg-brand-600 px-4 py-2 ...'\nexport const card = 'rounded-xl border border-slate-200 bg-white shadow-sm'\n\n// 使う側\nimport { btnPrimary, card } from './ui'\n<button className={btnPrimary}>検索</button>\n<div className={card}>…</div>`,
          note: 'クラスの長い羅列に名前を付けて再利用する、という考え方。第16章の「条件付きクラス」と組み合わせ、className={\`\${btnPrimary} \${block ? "w-full" : ""}\`} のように“ベース＋追加”で使われます（AddToCartButton 参照）。',
        },
      ],
    },
    {
      id: 'stockbadge',
      heading: '7-4. StockBadge ― 「押したときだけ」取得する',
      body: [
        '在庫数は一覧の描画時には取りに行かず、「在庫を見る」ボタンを押したときだけ取得します（サーバー負荷を抑える設計）。useEffect で自動取得するのではなく、クリック（イベント）で取得するのがポイント。第18章「useEffect を使わない場面＝イベントで済むなら使わない」の好例です。',
      ],
      examples: [
        {
          file: 'src/components/StockBadge.tsx',
          code: `export function StockBadge({ skuCode }: { skuCode: string }) {\n  const [stock, setStock] = useState<number | null>(null)\n  const [loading, setLoading] = useState(false)\n  const [error, setError] = useState(false)\n\n  async function check() {            // ← クリックで初めて取得\n    setLoading(true); setError(false)\n    try {\n      const result = await fetchStock(skuCode)\n      setStock(result.stock)\n    } catch { setError(true) }\n    finally { setLoading(false) }\n  }\n\n  if (stock !== null) {               // 取得済み：在庫数 or 在庫なし\n    const inStock = stock > 0\n    return <span className={inStock ? '...emerald...' : '...rose...'}>\n      {inStock ? \`在庫 \${stock}\` : '在庫なし'}\n    </span>\n  }\n  return <button onClick={check} disabled={loading}>      // 未取得：ボタン\n    {loading ? '確認中…' : error ? '再試行' : '在庫を見る'}\n  </button>\n}`,
          note: 'useEffect ではなく onClick の check() で取得（第6章・第18章）。stock が null か否かで「ボタン or 結果」を切り替え（第4章）、取得中・エラーで文言を出し分け。state 3つ（stock/loading/error）で状態を表す、第11章でも見た形です。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: '「最初に1回取る」なら useEffect、「ユーザー操作で取る」なら onClick。StockBadge は後者を選ぶことで、一覧に何十件あっても在庫 API を一斉に叩かずに済んでいます。いつ取得するかの判断も設計のうちです。',
        },
      ],
    },
  ],
}

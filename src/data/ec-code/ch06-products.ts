import type { EcChapter } from './types'

// EC コード解説 #6「商品一覧」。
export const ch06Products: EcChapter = {
  id: 'products',
  num: 6,
  title: '商品一覧 ― データ取得・ページング・URL に状態を持たせる',
  summary: '商品一覧ページを読みます。検索条件やページ番号を「URL に持たせる」やり方、データ取得の loading/error、ページネーション――第3〜8章で学んだことが一気に出てくる総まとめの回です。',
  relatedReact: ['第7章 useEffect', '第8章 ルーティング', '第3章 リストと key', '第4章 条件で出し分ける'],
  intro: [
    '商品一覧は、この本で学んだことが全部出てくる「総合演習」のような画面です。ProductsPage（画面）→ ProductGrid（取得して並べる）→ ProductCard / Pagination（部品）という構成で読み解きます。',
  ],
  sections: [
    {
      id: 'url-state',
      heading: '6-1. 検索条件・ページを URL に持たせる ― useSearchParams',
      body: [
        'ProductsPage は、カテゴリ・検索語・ページ番号を useState ではなく URL（?category=...&search=...&page=2）に持たせています。第8章で学んだ useSearchParams です。こうすると、その URL を共有・ブックマーク・リロードしても同じ状態を再現できます。',
      ],
      examples: [
        {
          file: 'src/pages/ProductsPage.tsx',
          code: `const [searchParams, setSearchParams] = useSearchParams()\nconst category = searchParams.get('category') ?? ''\nconst search = searchParams.get('search') ?? ''\nconst page = Math.max(1, Number(searchParams.get('page')) || 1)\n\nfunction changePage(p: number) {\n  const next = new URLSearchParams(searchParams)\n  if (p > 1) next.set('page', String(p))\n  else next.delete('page')        // 1ページ目なら page= を消して URL をきれいに\n  setSearchParams(next)\n  window.scrollTo({ top: 0, behavior: 'smooth' })\n}`,
          note: 'URL から現在の条件を読み取り（get）、変更時は新しい URLSearchParams を作って setSearchParams。これは第5章「state は新しく作って set」と同じ発想です。状態の置き場所が「コンポーネント」ではなく「URL」なだけ。',
        },
      ],
    },
    {
      id: 'search-form',
      heading: '6-2. 検索フォームと key でのリセット',
      body: [
        '検索フォームの送信では、第6章の onSubmit ＋ preventDefault を使い、FormData から入力値を取り出して URL に反映します。入力欄に key={search} を付けているのが第19章の応用です。',
      ],
      examples: [
        {
          file: 'src/pages/ProductsPage.tsx',
          code: `function submitSearch(e: React.FormEvent<HTMLFormElement>) {\n  e.preventDefault()\n  const term = new FormData(e.currentTarget).get('q')?.toString().trim() ?? ''\n  const next = new URLSearchParams(searchParams)\n  if (term) next.set('search', term)\n  else next.delete('search')\n  next.delete('page')   // 検索が変わったら1ページ目へ\n  setSearchParams(next)\n}\n\n// key={search} … URL の search が消えたら入力欄もリセット\n<input key={search} name="q" type="search" defaultValue={search} ... />`,
          note: 'key={search} は第19章そのもの。カテゴリ変更などで URL の search が空になると、key が変わって input が作り直され、入力欄もクリアされます。「key を変えて意図的にリセット」の実用例です。',
        },
      ],
    },
    {
      id: 'fetch',
      heading: '6-3. データ取得 ― ProductGrid の loading / error',
      body: [
        '実際にサーバーから商品を取ってくるのは ProductGrid です。第7章・第11章で学んだ「useEffect ＋ loading / error / data ＋ cancelled の後片付け」の教科書どおりの形。依存配列に category / search / page を入れ、条件が変わるたびに取り直します。',
      ],
      examples: [
        {
          file: 'src/components/ProductGrid.tsx',
          code: `const [products, setProducts] = useState<Product[]>([])\nconst [count, setCount] = useState(0)\nconst [loading, setLoading] = useState(true)\nconst [error, setError] = useState<string | null>(null)\n\nuseEffect(() => {\n  let cancelled = false\n  async function load() {\n    setLoading(true); setError(null)\n    try {\n      const data = await fetchProducts({ category, search, page })\n      if (cancelled) return\n      setProducts(data.results)\n      setCount(data.count)\n    } catch (e) {\n      if (!cancelled) setError(e instanceof Error ? e.message : '読み込みに失敗しました')\n    } finally {\n      if (!cancelled) setLoading(false)\n    }\n  }\n  load()\n  return () => { cancelled = true }\n}, [category, search, page])   // 条件が変わるたび取り直す`,
          note: '第11章 11-4 とそっくりですね。依存配列 [category, search, page] により、検索やページ変更で自動的に再取得。cancelled は「取得中に条件が変わったら古い結果を捨てる」後片付け（第7章）。',
        },
      ],
    },
    {
      id: 'render',
      heading: '6-4. 表示の出し分け ― 読み込み中・0件・一覧',
      body: [
        '取得状態に応じて表示を出し分けます。第4章の早期 return（loading / error）と、第3章の map ＋ key、そして0件のケアまで、ひととおり入っています。',
      ],
      examples: [
        {
          file: 'src/components/ProductGrid.tsx',
          code: `if (loading) return <GridSkeleton />      // 読み込み中：骨組み表示\nif (error) return <p className="text-rose-600">{error}</p>\n\nreturn (\n  <>\n    <p className="mb-4 text-sm text-slate-500">{count} 件</p>\n    {products.length === 0 ? (\n      <div className="...">該当する商品がありません。</div>   // 0件のケア\n    ) : (\n      <>\n        <div className="grid grid-cols-2 ... lg:grid-cols-4">\n          {products.map((p) => <ProductCard key={p.id} product={p} />)}\n        </div>\n        <Pagination count={count} page={page} onChange={onPageChange} />\n      </>\n    )}\n  </>\n)`,
          note: 'loading 中は GridSkeleton（灰色の枠をパカパカさせる“それっぽい”プレースホルダ）。0件なら専用メッセージ（第3章で触れたケア）。あるなら map で ProductCard を並べ、key={p.id}（第3章の鉄則）。',
        },
      ],
    },
    {
      id: 'pagination',
      heading: '6-5. ページネーション部品',
      body: [
        'Pagination は「総件数 count・現在ページ page・変更通知 onChange」を props で受け取る純粋な部品です（第2章・第6章のコールバック）。表示するページ番号の並びは普通の関数で計算しています（第18章「派生＝計算で出す」）。',
      ],
      examples: [
        {
          file: 'src/components/Pagination.tsx',
          code: `export function Pagination({\n  count, page, onChange,\n}: {\n  count: number\n  page: number\n  onChange: (page: number) => void   // 子→親へ伝えるコールバック\n}) {\n  const totalPages = Math.max(1, Math.ceil(count / PRODUCT_PAGE_SIZE))\n  if (totalPages <= 1) return null   // 1ページなら何も出さない（第4章 null）\n  // pageItems(page, totalPages) で [1, '…', 4, 5, 6, '…', 10] を組み立てて並べる\n}`,
          note: 'onChange は第6章で学んだコールバック props。ボタンが押されたら onChange(item) で親（ProductsPage の changePage）に「このページにして」と伝えます。データは下へ(props)、操作は上へ(コールバック)、の典型です。',
        },
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'この一覧画面だけで、第2・3・4・5・6・7・8・11・18・19章が顔を出しました。逆に言えば、本で学んだ部品が分かっていれば、実コードはこうして「知っているパターンの組み合わせ」として読めます。',
        },
      ],
    },
    {
      id: 'next',
      heading: '6-6. ここまでと、この先',
      body: [
        '#1〜#6 で、EC フロントの背骨（全体像・起動・通信・認証・カート・一覧）を読みました。React 大全の知識が、実コードの中でどう組み合わさるかが見えてきたはずです。',
        'この先（準備中）は、商品カードなどの部品の作り、商品詳細〜カート〜注文の一連の流れ、型定義（api/types.ts）の読み方などを予定しています。読みたい所のリクエストも歓迎です。',
      ],
    },
  ],
}

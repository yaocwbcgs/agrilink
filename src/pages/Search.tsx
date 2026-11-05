import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Search as SearchIcon, Sparkles } from 'lucide-react'
import { Badge, DemoTag } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState, ListRowSkeleton } from '../components/ui/States'
import { SmartImage } from '../components/ui/SmartImage'
import { ProductVisual } from '../components/ui/ProductVisual'
import { useAsync } from '../hooks/useAsync'
import { HOT_KEYWORDS, globalSearch } from '../services/search'
import { CROP_LABEL, MACHINERY_LABEL, PRODUCE_CATEGORY_LABEL } from '../lib/constants'
import { cn, fmtNumber } from '../lib/utils'

export default function SearchPage() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const [input, setInput] = useState(q)
  const [active, setActive] = useState('all')

  useEffect(() => {
    setInput(q)
    setActive('all')
  }, [q])

  const { data, loading } = useAsync(() => globalSearch(q, 6), [q])

  const groups = useMemo(() => {
    if (!data) return []
    return [
      { key: 'listings', label: '供需信息', total: data.listings.total, items: data.listings.items },
      { key: 'products', label: '农资商品', total: data.products.total, items: data.products.items },
      { key: 'machinery', label: '农机服务', total: data.machinery.total, items: data.machinery.items },
      { key: 'diseases', label: '病虫害知识', total: data.diseases.total, items: data.diseases.items },
      { key: 'news', label: '农业资讯', total: data.news.total, items: data.news.items },
    ].filter((g) => g.total > 0)
  }, [data])

  const visible = active === 'all' ? groups : groups.filter((g) => g.key === active)

  const submit = () => {
    if (!input.trim()) return
    setParams({ q: input.trim() })
  }

  return (
    <>
      <section className="border-b border-line/70 bg-cream">
        <div className="shell py-10 lg:py-12">
          <p className="eyebrow">Global Search</p>
          <h1 className="mt-2 text-display-sm font-semibold text-forest">全域搜索</h1>
          <p className="mt-2 text-[12.5px] text-muted">
            一次检索平台内的农产品供需、农资商品、农机资源、病虫害知识与资讯内容。
          </p>

          <div className="mt-5 flex max-w-2xl items-center gap-2 rounded-xl border border-line bg-white p-1.5 shadow-card focus-within:shadow-lift">
            <SearchIcon size={17} className="ml-2.5 text-moss" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="输入品种、病害、农机或商品名称"
              className="min-w-0 flex-1 bg-transparent py-2 text-[13.5px] outline-none placeholder:text-muted/70"
              aria-label="搜索关键词"
            />
            <Button size="md" className="rounded-lg px-5" onClick={submit}>
              搜索
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11.5px]">
            <span className="text-muted">热门：</span>
            {HOT_KEYWORDS.map((k) => (
              <button
                key={k}
                onClick={() => {
                  setInput(k)
                  setParams({ q: k })
                }}
                className="rounded-full border border-line bg-white/70 px-2.5 py-1 text-ink/65 transition hover:border-moss/40 hover:text-forest"
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="shell py-8 lg:py-10">
        {!q ? (
          <EmptyState
            title="输入关键词开始检索"
            description="支持品种名称、病害症状、农机类型、农资商品与文章标题。也可以直接点击上方热门词。"
            icon={<SearchIcon size={22} strokeWidth={1.6} />}
          />
        ) : loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <ListRowSkeleton key={i} />
            ))}
          </div>
        ) : !data || data.total === 0 ? (
          <EmptyState
            title={`没有找到「${q}」相关内容`}
            description="试试更短或更通用的关键词，例如「玉米」「叶斑」「烘干」。"
            action={
              <Link to="/market" className="rounded-lg bg-forest px-4 py-2 text-[12.5px] text-cream">
                去产销大厅看看
              </Link>
            }
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[12.5px] text-muted">
                关键词 <span className="text-forest">「{q}」</span> 共找到{' '}
                <span className="num font-medium text-forest">{data.total}</span> 条结果
              </p>
              <DemoTag />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => setActive('all')} className={cn('chip', active === 'all' && 'chip-active')}>
                全部 <span className="num text-[10px] opacity-70">{data.total}</span>
              </button>
              {groups.map((g) => (
                <button
                  key={g.key}
                  onClick={() => setActive(g.key)}
                  className={cn('chip', active === g.key && 'chip-active')}
                >
                  {g.label} <span className="num text-[10px] opacity-70">{g.total}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-7">
              {visible.map((group) => (
                <div key={group.key}>
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-[15px] font-semibold text-forest">
                      {group.label}
                      <span className="num text-[11px] font-normal text-muted">{group.total}</span>
                    </h2>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {group.key === 'listings' &&
                      (group.items as any[]).map((item) => (
                        <Link
                          key={item.id}
                          to={`/market/${item.id}`}
                          className="group flex gap-3 rounded-panel border border-line bg-white p-3 transition hover:border-moss/40 hover:shadow-card"
                        >
                          <SmartImage src={item.image} alt={item.title} className="h-[72px] w-24 shrink-0 rounded-lg" />
                          <div className="min-w-0">
                            <p className="line-clamp-1 text-[12.5px] font-medium text-forest group-hover:text-moss">
                              {item.title}
                            </p>
                            <p className="mt-1 line-clamp-1 text-[11px] text-muted">
                              {item.region} · {item.quantity}
                              {item.unit}
                            </p>
                            <p className="num mt-1.5 text-[12px] font-medium text-moss">
                              ￥{fmtNumber(item.price)}/{item.unit}
                            </p>
                          </div>
                          <Badge tone="neutral" className="ml-auto self-start">
                            {PRODUCE_CATEGORY_LABEL[item.category as keyof typeof PRODUCE_CATEGORY_LABEL]}
                          </Badge>
                        </Link>
                      ))}

                    {group.key === 'products' &&
                      (group.items as any[]).map((item) => (
                        <Link
                          key={item.id}
                          to={`/shop/${item.id}`}
                          className="group flex gap-3 rounded-panel border border-line bg-white p-3 transition hover:border-moss/40 hover:shadow-card"
                        >
                          <ProductVisual glyph={item.glyph} size="sm" className="h-[72px] w-[72px] shrink-0 rounded-lg" showLabel={false} />
                          <div className="min-w-0">
                            <p className="line-clamp-1 text-[12.5px] font-medium text-forest group-hover:text-moss">
                              {item.name}
                            </p>
                            <p className="mt-1 line-clamp-1 text-[11px] text-muted">{item.spec}</p>
                            <p className="num mt-1.5 text-[12px] font-medium text-moss">
                              ￥{fmtNumber(item.price)}/{item.unit}
                            </p>
                          </div>
                        </Link>
                      ))}

                    {group.key === 'machinery' &&
                      (group.items as any[]).map((item) => (
                        <Link
                          key={item.id}
                          to={`/machinery/${item.id}`}
                          className="group flex gap-3 rounded-panel border border-line bg-white p-3 transition hover:border-moss/40 hover:shadow-card"
                        >
                          <SmartImage src={item.cover} alt={item.name} className="h-[72px] w-24 shrink-0 rounded-lg" />
                          <div className="min-w-0">
                            <p className="line-clamp-1 text-[12.5px] font-medium text-forest group-hover:text-moss">
                              {item.name}
                            </p>
                            <p className="mt-1 line-clamp-1 text-[11px] text-muted">
                              {MACHINERY_LABEL[item.category as keyof typeof MACHINERY_LABEL]} · {item.region}
                            </p>
                            <p className="num mt-1.5 text-[12px] font-medium text-moss">
                              ￥{fmtNumber(item.price)}/{item.priceUnit.replace('元/', '')}
                            </p>
                          </div>
                        </Link>
                      ))}

                    {group.key === 'diseases' &&
                      (group.items as any[]).map((item) => (
                        <Link
                          key={item.id}
                          to={`/disease/library/${item.id}`}
                          className="group flex gap-3 rounded-panel border border-line bg-white p-3 transition hover:border-moss/40 hover:shadow-card"
                        >
                          <SmartImage src={item.image} alt={item.name} className="h-[72px] w-24 shrink-0 rounded-lg" />
                          <div className="min-w-0">
                            <p className="line-clamp-1 text-[12.5px] font-medium text-forest group-hover:text-moss">
                              {item.name}
                            </p>
                            <p className="mt-1 line-clamp-1 text-[11px] text-muted">
                              {CROP_LABEL[item.crop as keyof typeof CROP_LABEL]} · {item.kind === 'disease' ? '病害' : '虫害'}
                            </p>
                            <p className="mt-1 line-clamp-1 text-[10.5px] text-muted/80">{item.symptoms[0]}</p>
                          </div>
                        </Link>
                      ))}

                    {group.key === 'news' &&
                      (group.items as any[]).map((item) => (
                        <Link
                          key={item.id}
                          to={`/news/${item.id}`}
                          className="group flex gap-3 rounded-panel border border-line bg-white p-3 transition hover:border-moss/40 hover:shadow-card"
                        >
                          <SmartImage src={item.cover} alt={item.title} className="h-[72px] w-24 shrink-0 rounded-lg" />
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-[12.5px] font-medium leading-snug text-forest group-hover:text-moss">
                              {item.title}
                            </p>
                            <p className="mt-1.5 text-[10.5px] text-muted">{item.source}</p>
                          </div>
                        </Link>
                      ))}
                  </div>

                  {group.total > group.items.length && (
                    <button
                      onClick={() => setActive(group.key)}
                      className="mt-2.5 inline-flex items-center gap-1 text-[11.5px] text-moss hover:text-forest"
                    >
                      查看全部 {group.total} 条 <ArrowRight size={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2 rounded-panel border border-line bg-sand/30 px-5 py-4 text-[11.5px] text-muted">
              <Sparkles size={13} className="text-moss" />
              搜索结果基于标题、描述、标签与症状文本匹配，可按分类进一步查看完整列表。
            </div>
          </>
        )}
      </section>
    </>
  )
}

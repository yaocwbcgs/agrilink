import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Clock, Eye, Flame, Search, X } from 'lucide-react'
import { PageHero } from '../components/ui/Layout'
import { Button } from '../components/ui/Button'
import { Segmented } from '../components/ui/Tabs'
import { Pagination } from '../components/ui/Pagination'
import { EmptyState, CardSkeleton } from '../components/ui/States'
import { SmartImage } from '../components/ui/SmartImage'
import { Reveal } from '../components/ui/Reveal'
import { useAsync } from '../hooks/useAsync'
import { fetchHotNews, fetchNews } from '../services/news'
import { NEWS_CATEGORY_LABEL, NEWS_CATEGORY_OPTIONS } from '../lib/constants'
import type { NewsCategory } from '../types'
import { cn, fmtDate, fmtNumber } from '../lib/utils'

const PAGE_SIZE = 7

export default function News() {
  const [params, setParams] = useSearchParams()
  const initialCategory = (params.get('category') as NewsCategory | null) ?? 'all'
  const [category, setCategory] = useState<NewsCategory | 'all'>(initialCategory)
  const [keyword, setKeyword] = useState('')
  const [sort, setSort] = useState<'latest' | 'hot'>('latest')
  const [page, setPage] = useState(1)

  const query = useMemo(() => ({ category, keyword, sort, page, pageSize: PAGE_SIZE }), [category, keyword, sort, page])
  const { data, loading } = useAsync(() => fetchNews(query), [query])
  const { data: hot } = useAsync(() => fetchHotNews(5), [])

  const items = data?.items ?? []
  const [lead, ...rest] = items

  return (
    <>
      <PageHero
        eyebrow="Knowledge & Insight · 农业资讯"
        title="把政策、技术与市场读成可执行的动作"
        description="六个栏目：农业政策、种植技术、病虫害防治、农机技术、市场分析与科技动态。支持关键词搜索、分类筛选、收藏与热门排行。"
        breadcrumb={[{ label: '农业资讯' }]}
        action={
          <Link
            to="/disease/library"
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-line bg-white px-4 py-2.5 text-[12.5px] font-medium text-forest transition hover:border-moss/50"
          >
            病虫害知识库
          </Link>
        }
      />

      <section className="shell py-8 lg:py-10">
        <div className="flex flex-col gap-4 border-b border-line/70 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-1 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => {
                setCategory('all')
                setPage(1)
                setParams({})
              }}
              className={cn(
                'shrink-0 rounded-lg px-3 py-2 text-[13px] transition',
                category === 'all' ? 'bg-forest text-cream' : 'text-ink/70 hover:bg-sand/60',
              )}
            >
              全部
            </button>
            {NEWS_CATEGORY_OPTIONS.map((c) => (
              <button
                key={c.value}
                onClick={() => {
                  setCategory(c.value)
                  setPage(1)
                  setParams({ category: c.value })
                }}
                className={cn(
                  'shrink-0 rounded-lg px-3 py-2 text-[13px] transition',
                  category === c.value ? 'bg-forest text-cream' : 'text-ink/70 hover:bg-sand/60',
                )}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value)
                  setPage(1)
                }}
                placeholder="搜索文章标题或标签"
                className="field h-9 pl-8 pr-8 text-[12.5px]"
              />
              {keyword && (
                <button
                  onClick={() => setKeyword('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-forest"
                  aria-label="清空"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <Segmented
              value={sort}
              onChange={setSort}
              options={[
                { value: 'latest', label: '最新' },
                { value: 'hot', label: '最热' },
              ]}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {loading && (
              <div className="grid gap-4 sm:grid-cols-2">
                {[0, 1, 2, 3].map((i) => (
                  <CardSkeleton key={i} rows={2} />
                ))}
              </div>
            )}

            {!loading && items.length === 0 && (
              <EmptyState
                title="没有匹配的文章"
                description="试试其他关键词，或切换到「全部」栏目浏览。"
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setKeyword('')
                      setCategory('all')
                    }}
                  >
                    重置筛选
                  </Button>
                }
              />
            )}

            {!loading && lead && (
              <div className="space-y-4">
                <Reveal>
                  <Link
                    to={`/news/${lead.id}`}
                    className="group grid overflow-hidden rounded-panel border border-line bg-white transition hover:border-moss/40 hover:shadow-lift sm:grid-cols-[1.1fr_1fr]"
                  >
                    <div className="relative">
                      <SmartImage
                        src={lead.cover}
                        alt={lead.title}
                        ratio="16 / 11"
                        className="h-full w-full"
                        imgClassName="transition-transform duration-[1200ms] group-hover:scale-105"
                      />
                      <div className="absolute left-3 top-3 flex gap-1.5">
                        <span className="rounded-full bg-forest/90 px-2.5 py-1 text-[10px] text-cream backdrop-blur">
                          {NEWS_CATEGORY_LABEL[lead.category]}
                        </span>
                        <span className="rounded-full border border-cream/30 bg-cream/20 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-cream backdrop-blur">
                          Lead
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col p-5">
                      <h2 className="text-[19px] font-semibold leading-snug text-forest transition group-hover:text-moss">
                        {lead.title}
                      </h2>
                      <p className="mt-2.5 line-clamp-3 text-[12.5px] leading-relaxed text-muted">{lead.summary}</p>
                      <div className="mt-auto flex items-center gap-3 pt-4 text-[10.5px] text-muted">
                        <span>{lead.source}</span>
                        <span className="h-2.5 w-px bg-line" />
                        <span className="num">{fmtDate(lead.publishedAt)}</span>
                        <span className="ml-auto flex items-center gap-1">
                          <Clock size={11} /> {lead.readMinutes} 分钟
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>

                <div className="grid gap-3 sm:grid-cols-2">
                  {rest.map((a, i) => (
                    <Reveal key={a.id} delay={i * 50}>
                      <Link
                        to={`/news/${a.id}`}
                        className="group flex h-full flex-col overflow-hidden rounded-panel border border-line bg-white transition hover:border-moss/40 hover:shadow-card"
                      >
                        <SmartImage src={a.cover} alt={a.title} ratio="16 / 9" className="w-full" />
                        <div className="flex flex-1 flex-col p-4">
                          <span className="text-[10px] font-medium text-moss">{NEWS_CATEGORY_LABEL[a.category]}</span>
                          <h3 className="mt-1.5 line-clamp-2 text-[14px] font-medium leading-snug text-forest transition group-hover:text-moss">
                            {a.title}
                          </h3>
                          <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-relaxed text-muted">{a.summary}</p>
                          <div className="mt-auto flex items-center justify-between pt-3 text-[10px] text-muted">
                            <span className="num">{fmtDate(a.publishedAt)}</span>
                            <span className="num flex items-center gap-1">
                              <Eye size={10} /> {fmtNumber(a.views)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                </div>

                {data && data.total > PAGE_SIZE && (
                  <Pagination
                    className="pt-2"
                    page={data.page}
                    pageSize={data.pageSize}
                    total={data.total}
                    onChange={(p) => {
                      setPage(p)
                      window.scrollTo({ top: 280, behavior: 'smooth' })
                    }}
                  />
                )}
              </div>
            )}
          </div>

          <aside className="space-y-4 lg:col-span-4">
            <div className="rounded-panel border border-line bg-white p-5">
              <h3 className="flex items-center gap-1.5 text-[13.5px] font-semibold text-forest">
                <Flame size={14} className="text-clay" /> 热门文章
              </h3>
              <div className="mt-3 space-y-1">
                {hot?.map((a, i) => (
                  <Link
                    key={a.id}
                    to={`/news/${a.id}`}
                    className="group flex gap-3 rounded-lg px-2 py-2 transition hover:bg-sand/40"
                  >
                    <span
                      className={cn(
                        'num mt-0.5 font-mono text-[12px]',
                        i < 3 ? 'text-clay' : 'text-muted/50',
                      )}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-2 text-[12px] leading-snug text-ink/80 transition group-hover:text-forest">
                        {a.title}
                      </span>
                      <span className="num mt-1 block text-[10px] text-muted">{fmtNumber(a.views)} 阅读</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-panel border border-line bg-white p-5">
              <h3 className="text-[13.5px] font-semibold text-forest">栏目导航</h3>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {NEWS_CATEGORY_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => {
                      setCategory(c.value)
                      setPage(1)
                      window.scrollTo({ top: 300, behavior: 'smooth' })
                    }}
                    className={cn(
                      'rounded-lg border px-2.5 py-2 text-left text-[11.5px] transition',
                      category === c.value
                        ? 'border-forest bg-forest text-cream'
                        : 'border-line text-ink/70 hover:border-moss/40',
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-panel border border-line bg-forest p-5 text-cream">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-cream/45">Knowledge Base</p>
              <h3 className="mt-2 text-[16px] font-semibold text-cream">病虫害知识库</h3>
              <p className="mt-2 text-[11.5px] leading-relaxed text-cream/60">
                14 类常见病虫害，含症状对照、传播特点与分阶段防控方案。
              </p>
              <Link
                to="/disease/library"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-cream px-3 py-2 text-[11.5px] font-medium text-forest transition hover:bg-white"
              >
                打开知识库 →
              </Link>
            </div>

            <div className="rounded-panel border border-line bg-sand/40 p-4">
              <p className="text-[11px] leading-relaxed text-muted">
                资讯内容为演示资料整理，部分观点为示例性表述，实际生产决策请结合当地农技部门指导。
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}

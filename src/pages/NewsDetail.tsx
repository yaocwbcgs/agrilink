import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Clock, Eye, Heart, Share2 } from 'lucide-react'
import { Breadcrumb } from '../components/ui/Layout'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { SmartImage } from '../components/ui/SmartImage'
import { CardSkeleton, NotFoundState } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { fetchArticleById, fetchHotNews, fetchRecommended } from '../services/news'
import { NEWS } from '../data/news'
import { NEWS_CATEGORY_LABEL } from '../lib/constants'
import { useFavoriteStore } from '../store/userDataStore'
import { toast } from '../store/uiStore'
import { cn, fmtDate, fmtNumber } from '../lib/utils'

export default function NewsDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data, loading, error, reload } = useAsync(() => fetchArticleById(id), [id])
  const { data: hot } = useAsync(() => fetchHotNews(5), [])
  const { data: related } = useAsync(() => (data ? fetchRecommended(data, 3) : Promise.resolve([])), [data?.id])
  const isFav = useFavoriteStore((s) => s.items.some((f) => f.type === 'article' && f.id === id))
  const toggle = useFavoriteStore((s) => s.toggle)

  if (loading) {
    return (
      <div className="shell py-12">
        <CardSkeleton rows={6} />
      </div>
    )
  }
  if (error || !data) {
    return (
      <div className="shell py-20">
        <NotFoundState onBack={() => navigate('/news')} />
        {error && (
          <div className="mt-4 text-center">
            <Button size="sm" variant="secondary" onClick={reload}>
              重新加载
            </Button>
          </div>
        )}
      </div>
    )
  }

  const index = NEWS.findIndex((n) => n.id === data.id)
  const prev = NEWS[index - 1]
  const next = NEWS[index + 1]

  return (
    <>
      <section className="border-b border-line/70 bg-cream">
        <div className="shell py-5">
          <Breadcrumb items={[{ label: '农业资讯', to: '/news' }, { label: NEWS_CATEGORY_LABEL[data.category], to: `/news?category=${data.category}` }, { label: data.title.slice(0, 14) + '…' }]} />
        </div>
      </section>

      <article className="shell py-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <header>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="dark">{NEWS_CATEGORY_LABEL[data.category]}</Badge>
                {data.tags.map((t) => (
                  <Badge key={t} tone="neutral">
                    {t}
                  </Badge>
                ))}
              </div>
              <h1 className="mt-4 text-[28px] font-semibold leading-[1.35] text-forest lg:text-[34px]">{data.title}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-muted">
                <span>{data.source}</span>
                <span>{data.author}</span>
                <span className="num">{fmtDate(data.publishedAt, true)}</span>
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {data.readMinutes} 分钟阅读
                </span>
                <span className="num flex items-center gap-1">
                  <Eye size={11} /> {fmtNumber(data.views)}
                </span>
              </div>
            </header>

            <div className="mt-6 overflow-hidden rounded-panel border border-line bg-white">
              <SmartImage src={data.cover} alt={data.title} ratio="16 / 9" className="w-full" eager />
            </div>

            <p className="mt-6 border-l-2 border-moss/40 pl-4 text-[14px] font-medium leading-[1.9] text-forest/85">
              {data.summary}
            </p>

            <div className="mt-7 space-y-5">
              {data.blocks.map((block, i) => {
                if (block.type === 'h2') {
                  return (
                    <h2 key={i} className="pt-2 text-[19px] font-semibold text-forest">
                      {block.text}
                    </h2>
                  )
                }
                if (block.type === 'quote') {
                  return (
                    <blockquote
                      key={i}
                      className="rounded-r-xl border-l-2 border-clay bg-clay/[0.05] px-5 py-4 text-[13.5px] leading-[1.9] text-[#7C5320]"
                    >
                      {block.text}
                    </blockquote>
                  )
                }
                if (block.type === 'list') {
                  return (
                    <ul key={i} className="space-y-2.5 rounded-xl border border-line bg-sand/20 p-5">
                      {block.items?.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-[13px] leading-[1.85] text-ink/80">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-moss" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )
                }
                return (
                  <p key={i} className="text-[14px] leading-[2] text-ink/80">
                    {block.text}
                  </p>
                )
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-line/70 pt-5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const added = toggle({
                    type: 'article',
                    id: data.id,
                    title: data.title,
                    subtitle: data.source,
                    meta: fmtDate(data.publishedAt),
                    image: data.cover,
                  })
                  toast[added ? 'success' : 'info'](added ? '已收藏文章' : '已取消收藏')
                }}
                iconLeft={<Heart size={13} fill={isFav ? 'currentColor' : 'none'} className={isFav ? 'text-[#B4452F]' : ''} />}
              >
                {isFav ? '已收藏' : '收藏文章'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                iconLeft={<Share2 size={13} />}
                onClick={() => {
                  void navigator.clipboard?.writeText(window.location.href)
                  toast.success('链接已复制')
                }}
              >
                分享
              </Button>
              <Link
                to={`/news?category=${data.category}`}
                className="ml-auto text-[12px] text-moss hover:text-forest"
              >
                查看该栏目全部文章 →
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {prev && (
                <Link
                  to={`/news/${prev.id}`}
                  className="group rounded-xl border border-line bg-white p-4 transition hover:border-moss/40"
                >
                  <p className="flex items-center gap-1 text-[10.5px] text-muted">
                    <ArrowLeft size={11} /> 上一篇
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-[12.5px] text-ink/80 group-hover:text-forest">{prev.title}</p>
                </Link>
              )}
              {next && (
                <Link
                  to={`/news/${next.id}`}
                  className="group rounded-xl border border-line bg-white p-4 text-right transition hover:border-moss/40 sm:col-start-2"
                >
                  <p className="flex items-center justify-end gap-1 text-[10.5px] text-muted">
                    下一篇 <ArrowRight size={11} />
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-[12.5px] text-ink/80 group-hover:text-forest">{next.title}</p>
                </Link>
              )}
            </div>
          </div>

          <aside className="space-y-4 lg:col-span-4">
            <div className="sticky top-[92px] space-y-4">
              <div className="rounded-panel border border-line bg-white p-5">
                <h3 className="text-[13.5px] font-semibold text-forest">热门文章</h3>
                <div className="mt-3 space-y-2">
                  {hot?.map((a, i) => (
                    <Link key={a.id} to={`/news/${a.id}`} className="group flex gap-2.5">
                      <span className={cn('num font-mono text-[11px]', i < 3 ? 'text-clay' : 'text-muted/50')}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="line-clamp-2 text-[11.5px] leading-snug text-ink/75 transition group-hover:text-forest">
                        {a.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-panel border border-line bg-white p-5">
                <h3 className="text-[13.5px] font-semibold text-forest">推荐阅读</h3>
                <div className="mt-3 space-y-3">
                  {related?.map((a) => (
                    <Link key={a.id} to={`/news/${a.id}`} className="group flex gap-2.5">
                      <SmartImage src={a.cover} alt={a.title} className="h-14 w-20 shrink-0 rounded-lg" />
                      <span className="min-w-0">
                        <span className="line-clamp-2 text-[11.5px] leading-snug text-ink/80 group-hover:text-forest">
                          {a.title}
                        </span>
                        <span className="mt-1 block text-[10px] text-muted">{NEWS_CATEGORY_LABEL[a.category]}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-panel border border-line bg-sand/40 p-4">
                <p className="text-[11px] leading-relaxed text-muted">
                  本文为演示内容，用于展示资讯模块的阅读体验；实际生产决策请参考当地农技部门发布的指导意见。
                </p>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </>
  )
}

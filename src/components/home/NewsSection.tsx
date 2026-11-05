import { Link } from 'react-router-dom'
import { ArrowUpRight, Clock } from 'lucide-react'
import { NEWS } from '../../data/news'
import { NEWS_CATEGORY_LABEL } from '../../lib/constants'
import { SmartImage } from '../ui/SmartImage'
import { SectionHeader } from '../ui/Layout'
import { ArrowLink } from '../ui/Button'
import { Reveal } from '../ui/Reveal'
import { fmtDate } from '../../lib/utils'

export function NewsSection() {
  const sorted = [...NEWS].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  const featured = sorted[0]
  const list = sorted.slice(1, 5)

  return (
    <section className="shell py-16 lg:py-24">
      <SectionHeader
        index="07 — 农业资讯"
        title="政策、技术与市场，读得懂也用得上"
        description="政策解读、种植技术、病虫害防控、农机应用、市场分析与科技动态，形成可持续检索的农业知识库。"
        action={<ArrowLink to="/news">进入资讯中心</ArrowLink>}
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <Link
            to={`/news/${featured.id}`}
            className="group flex h-full flex-col overflow-hidden rounded-panel border border-line bg-white transition-all duration-500 hover:border-moss/40 hover:shadow-lift"
          >
            <div className="relative">
              <SmartImage
                src={featured.cover}
                alt={featured.title}
                ratio="16 / 9"
                className="w-full"
                imgClassName="transition-transform duration-[1200ms] group-hover:scale-[1.04]"
              />
              <div className="absolute left-4 top-4 flex items-center gap-2">
                <span className="rounded-full bg-forest/90 px-2.5 py-1 text-[10px] font-medium text-cream backdrop-blur">
                  {NEWS_CATEGORY_LABEL[featured.category]}
                </span>
                <span className="rounded-full border border-cream/30 bg-cream/15 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-cream/90 backdrop-blur">
                  Featured
                </span>
              </div>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h3 className="text-[21px] font-semibold leading-snug text-forest transition group-hover:text-moss">
                {featured.title}
              </h3>
              <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-muted">{featured.summary}</p>
              <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-[11.5px] text-muted">
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em]">{featured.source}</span>
                  <span className="h-2.5 w-px bg-line" />
                  <span className="num">{fmtDate(featured.publishedAt)}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {featured.readMinutes} 分钟
                </span>
              </div>
            </div>
          </Link>
        </Reveal>

        <div className="flex flex-col gap-2 lg:col-span-2">
          {list.map((article, i) => (
            <Reveal key={article.id} delay={80 + i * 60}>
              <Link
                to={`/news/${article.id}`}
                className="group flex items-start gap-3.5 rounded-xl border border-transparent p-3 transition-all duration-300 hover:border-line hover:bg-white"
              >
                <span className="mt-0.5 font-mono text-[11px] text-muted/50">{String(i + 2).padStart(2, '0')}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-moss">{NEWS_CATEGORY_LABEL[article.category]}</span>
                    <span className="num text-[10px] text-muted/70">{fmtDate(article.publishedAt).slice(5)}</span>
                  </div>
                  <h4 className="mt-1 line-clamp-2 text-[13.5px] font-medium leading-snug text-forest transition group-hover:text-moss">
                    {article.title}
                  </h4>
                  <p className="mt-1 line-clamp-1 text-[11px] text-muted">{article.summary}</p>
                </div>
                <ArrowUpRight
                  size={14}
                  className="mt-1 shrink-0 text-muted/40 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-moss"
                />
              </Link>
            </Reveal>
          ))}

          <Reveal delay={340} className="mt-auto">
            <div className="rounded-xl border border-line bg-sand/40 p-4">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">知识库</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink/70">
                病虫害知识库收录 14 类常见病害与虫害，支持按作物、类型与症状检索。
              </p>
              <Link
                to="/disease/library"
                className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-moss transition hover:text-forest"
              >
                打开知识库 →
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

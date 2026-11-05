import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ScanLine, Search, Sparkles, TrendingUp } from 'lucide-react'
import { IMG } from '../../data/images'
import { SmartImage } from '../ui/SmartImage'
import { Button, LinkButton } from '../ui/Button'
import { COMMODITIES } from '../../data/commodities'
import { fmtNumber, pct, priceTone, signed } from '../../lib/utils'
import { Reveal } from '../ui/Reveal'

const HOT = ['条锈病', '植保无人机', '玉米价格', '有机肥', '苹果产地']

export function Hero() {
  const [keyword, setKeyword] = useState('')
  const navigate = useNavigate()
  const corn = COMMODITIES[0]

  return (
    <section className="relative overflow-hidden bg-cream pb-14 pt-8 lg:pb-24 lg:pt-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid opacity-[0.55]"
        style={{ maskImage: 'radial-gradient(90% 70% at 0% 0%, black 0%, transparent 72%)' }}
      />
      <div className="shell relative">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* 文案区 */}
          <div className="lg:col-span-6 xl:col-span-6">
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-moss/25 bg-moss/[0.07] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-moss">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-moss" />
                  </span>
                  农业产业互联网
                </span>
                <span className="h-px w-8 bg-line" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Est. 2026</span>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-6 text-display font-semibold text-forest">
                让农业更智慧
                <br />
                <span className="relative inline-block">
                  让产业链更高效
                  <svg
                    aria-hidden
                    viewBox="0 0 300 14"
                    className="absolute -bottom-1.5 left-0 w-full text-sage/55"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 9c48-6 96-7 148-4 40 2 78 5 148 1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
            </Reveal>

            <Reveal delay={150}>
              <p className="mt-7 max-w-lg text-[14.5px] leading-[1.85] text-ink/70">
                整合农业生产、技术服务、农机资源、农资供应与产销渠道，打造一站式数字农业服务生态。
              </p>
            </Reveal>

            <Reveal delay={220}>
              <form
                className="mt-8 max-w-xl"
                onSubmit={(e) => {
                  e.preventDefault()
                  navigate(`/search${keyword.trim() ? `?q=${encodeURIComponent(keyword.trim())}` : ''}`)
                }}
              >
                <div className="group flex items-center gap-2 rounded-2xl border border-line bg-white p-1.5 shadow-card transition-shadow duration-500 focus-within:shadow-lift">
                  <Search size={17} className="ml-2.5 shrink-0 text-moss" />
                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="搜索品种、病害、农机或农资"
                    className="min-w-0 flex-1 bg-transparent py-2 text-[13.5px] text-ink outline-none placeholder:text-muted/70"
                    aria-label="平台搜索"
                  />
                  <Button type="submit" size="md" className="shrink-0 rounded-xl px-5">
                    搜索
                  </Button>
                </div>
              </form>
            </Reveal>

            <Reveal delay={280}>
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11.5px]">
                <span className="font-mono uppercase tracking-[0.14em] text-muted/70">热门</span>
                {HOT.map((k) => (
                  <button
                    key={k}
                    onClick={() => navigate(`/search?q=${encodeURIComponent(k)}`)}
                    className="rounded-full border border-line/80 bg-white/60 px-2.5 py-1 text-ink/65 transition hover:border-moss/40 hover:text-forest"
                  >
                    {k}
                  </button>
                ))}
              </div>
            </Reveal>

            <Reveal delay={340}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <LinkButton to="/disease" size="lg" iconRight={<ArrowRight size={16} />}>
                  立即体验智能识别
                </LinkButton>
                <LinkButton to="/market/publish" variant="secondary" size="lg">
                  发布供需信息
                </LinkButton>
              </div>
              <p className="mt-5 flex items-center gap-2 text-[11.5px] text-muted">
                <span className="h-1 w-1 rounded-full bg-sage" />
                已服务 128,600 户农户与 3,842 家农业企业 · 演示数据
              </p>
            </Reveal>
          </div>

          {/* 视觉区 */}
          <div className="relative lg:col-span-6">
            <div className="relative mx-auto max-w-[560px] lg:ml-auto">
              <Reveal delay={120} className="relative">
                <div className="relative overflow-hidden rounded-[26px] border border-white/50 shadow-float">
                  <SmartImage
                    src={IMG.heroField}
                    alt="日出时分的金色麦田"
                    ratio="4 / 4.4"
                    eager
                    className="w-full"
                    imgClassName="scale-[1.01]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950/55 via-forest-950/5 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 flex flex-col items-end gap-2 p-5 text-right">
                    <span className="rounded-full border border-cream/25 bg-cream/10 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-cream/80 backdrop-blur">
                      Field Note 01
                    </span>
                    <div>
                      <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-cream/55">
                        Huanghuaihai Plain · 36.7°N
                      </p>
                      <p className="mt-1 text-[14px] font-medium text-cream">黄淮海平原 · 冬小麦主产区</p>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* 悬浮行情卡 */}
              <Reveal delay={260} className="absolute -left-3 top-8 hidden w-[188px] sm:-left-8 sm:top-10 sm:block">
                <button
                  onClick={() => navigate(`/prices/${corn.id}`)}
                  className="w-full rounded-2xl border border-line bg-white/95 p-3.5 text-left shadow-lift backdrop-blur transition hover:-translate-y-0.5 hover:shadow-float"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">今日行情</span>
                    <TrendingUp size={12} className="text-moss" />
                  </div>
                  <p className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-[13px] font-medium text-forest">{corn.name}</span>
                    <span className="num text-[17px] font-semibold text-forest">{fmtNumber(corn.price)}</span>
                    <span className="text-[10px] text-muted">元/吨</span>
                  </p>
                  <p className={`num mt-1 text-[11px] font-medium ${priceTone(corn.change)}`}>
                    {signed(corn.change, 0)} · {pct(corn.changePct)}
                  </p>
                  <div className="mt-2.5 flex h-6 items-end gap-[3px]">
                    {corn.spark.map((v, i) => {
                      const min = Math.min(...corn.spark)
                      const max = Math.max(...corn.spark)
                      const h = 4 + ((v - min) / (max - min || 1)) * 18
                      return (
                        <span
                          key={i}
                          className="flex-1 rounded-sm bg-moss/25"
                          style={{ height: `${h}px`, background: i > corn.spark.length - 5 ? '#34745B' : undefined }}
                        />
                      )
                    })}
                  </div>
                </button>
              </Reveal>

              {/* 悬浮 AI 卡 */}
              <Reveal delay={340} className="absolute -bottom-7 -left-2 w-[228px] sm:-left-10 sm:w-[240px]">
                <button
                  onClick={() => navigate('/disease')}
                  className="group w-full rounded-2xl border border-line bg-white p-3.5 text-left shadow-lift transition hover:-translate-y-0.5 hover:shadow-float"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-moss/10 text-moss">
                      <ScanLine size={14} />
                    </span>
                    <span className="text-[12.5px] font-medium text-forest">病虫害智能识别</span>
                    <Sparkles size={11} className="ml-auto text-clay" />
                  </div>
                  <div className="mt-2.5 flex items-center gap-2.5">
                    <div className="relative h-11 w-11 overflow-hidden rounded-lg">
                      <SmartImage src={IMG.leafTexture} alt="叶片病斑示意" className="h-full w-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11.5px] text-ink/80">小麦条锈病 · 置信度 93.4%</p>
                      <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-clay">模拟识别</p>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between border-t border-line/70 pt-2">
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">上传叶片照片</span>
                    <ArrowRight size={12} className="text-moss transition group-hover:translate-x-0.5" />
                  </div>
                </button>
              </Reveal>
            </div>

            {/* 竖排文字 */}
            <div className="pointer-events-none absolute -right-6 top-1/3 hidden xl:block">
              <span className="writing-vertical font-mono text-[9.5px] uppercase tracking-[0.4em] text-muted/50">
                Every field, with data
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

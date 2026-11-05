import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { SERVICE_MODULES } from '../../data/home'
import { SmartImage } from '../ui/SmartImage'
import { Reveal } from '../ui/Reveal'
import { SectionHeader } from '../ui/Layout'
import { ArrowLink } from '../ui/Button'
import { cn } from '../../lib/utils'

export function ServiceGrid() {
  const [big, ...rest] = SERVICE_MODULES
  const wide = rest[rest.length - 1]
  const smalls = rest.slice(0, rest.length - 1)

  return (
    <section className="shell py-16 lg:py-24" id="services">
      <SectionHeader
        index="01 — 核心服务"
        title={
          <>
            从种到销，六个环节
            <span className="text-muted/70">在一个平台上完成</span>
          </>
        }
        description="围绕生产全过程组织服务能力：识别问题、找到技术、调度装备、采购投入品、判断行情、对接订单。"
        action={<ArrowLink to="/disease">了解服务能力</ArrowLink>}
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-4 lg:grid-rows-[repeat(2,minmax(0,1fr))_auto]">
        {/* 主卡 */}
        <Reveal className="lg:col-span-2 lg:row-span-2">
          <Link
            to={big.to}
            className="group relative flex h-full min-h-[340px] flex-col justify-between overflow-hidden rounded-panel border border-forest-950/20 bg-forest p-6 text-cream shadow-card transition-shadow duration-500 hover:shadow-float lg:min-h-[440px]"
          >
            <SmartImage
              src={big.image}
              alt={big.title}
              className="absolute inset-0 h-full w-full"
              imgClassName="scale-[1.03] opacity-45 transition-transform duration-[1200ms] group-hover:scale-[1.09]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/70 to-forest-950/20" />
            <div className="relative flex items-start justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cream/20 bg-cream/10 backdrop-blur">
                <big.icon size={20} strokeWidth={1.6} />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-cream/45">{big.en}</span>
            </div>
            <div className="relative">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/45">{big.index} / 06</p>
              <h3 className="mt-2 text-[26px] font-semibold leading-tight text-cream">{big.title}</h3>
              <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-cream/65">{big.desc}</p>
              <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5">
                {big.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-1.5 text-[11.5px] text-cream/55">
                    <span className="h-[3px] w-[3px] rounded-full bg-clay" />
                    {b}
                  </li>
                ))}
              </ul>
              <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-cream/25 px-4 py-2 text-[12.5px] font-medium text-cream transition group-hover:border-clay group-hover:bg-clay group-hover:text-[#43290C]">
                {big.cta}
                <ArrowUpRight size={14} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </Link>
        </Reveal>

        {/* 小卡 */}
        {smalls.map((mod, i) => (
          <Reveal key={mod.id} delay={80 + i * 60} className="lg:col-span-1">
            <Link
              to={mod.to}
              className={cn(
                'group flex h-full min-h-[200px] flex-col justify-between rounded-panel border p-5 transition-all duration-500',
                mod.tone === 'sand'
                  ? 'border-line bg-sand/50 hover:border-moss/40'
                  : 'border-line bg-white hover:border-moss/40 hover:shadow-card',
              )}
            >
              <div className="flex items-start justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-moss/[0.08] text-moss transition-colors duration-500 group-hover:bg-forest group-hover:text-cream">
                  <mod.icon size={17} strokeWidth={1.6} />
                </span>
                <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted/60">{mod.index}</span>
              </div>
              <div className="mt-5">
                <h3 className="text-[15.5px] font-semibold text-forest">{mod.title}</h3>
                <p className="mt-2 text-[12px] leading-relaxed text-muted line-clamp-2">{mod.desc}</p>
                <span className="mt-3.5 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-moss">
                  {mod.cta}
                  <ArrowUpRight size={12} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}

        {/* 宽卡 */}
        <Reveal delay={340} className="lg:col-span-4">
          <Link
            to={wide.to}
            className="group flex flex-col-reverse items-stretch overflow-hidden rounded-panel border border-line bg-white transition-all duration-500 hover:border-moss/40 hover:shadow-card sm:flex-row"
          >
            <div className="flex flex-1 flex-col justify-center gap-3 p-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-moss/[0.08] text-moss">
                  <wide.icon size={15} strokeWidth={1.6} />
                </span>
                <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-muted/60">
                  {wide.index} · {wide.en}
                </span>
              </div>
              <h3 className="text-[17px] font-semibold text-forest">{wide.title}</h3>
              <p className="max-w-lg text-[12.5px] leading-relaxed text-muted">{wide.desc}</p>
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-moss">
                {wide.cta}
                <ArrowUpRight size={12} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
            <div className="relative w-full shrink-0 sm:w-[34%]">
              <SmartImage
                src={wide.image}
                alt={wide.title}
                className="h-32 w-full sm:h-full"
                imgClassName="transition-transform duration-[1200ms] group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/40 to-transparent sm:from-white/10" />
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

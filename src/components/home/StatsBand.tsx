import { PLATFORM_STATS, STATS_NOTE } from '../../data/home'
import { fmtNumber } from '../../lib/utils'
import { useCountUp, useInView } from '../../hooks/useInView'
import { Sparkline } from '../charts/Sparkline'

function StatItem({ stat, start, index }: { stat: (typeof PLATFORM_STATS)[number]; start: boolean; index: number }) {
  const value = useCountUp(stat.value, 1500 + index * 120, start)
  return (
    <div className="relative flex flex-col justify-between gap-4 px-1 py-6 lg:px-5 lg:py-2">
      <div>
        <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-cream/40">
          {String(index + 1).padStart(2, '0')} / {String(PLATFORM_STATS.length).padStart(2, '0')}
        </p>
        <p className="mt-3 flex items-baseline gap-1">
          <span className="num text-[30px] font-semibold leading-none tracking-tight text-cream lg:text-[32px]">
            {fmtNumber(value)}
          </span>
          <span className="text-[12px] text-cream/50">{stat.unit}</span>
        </p>
        <p className="mt-2.5 text-[12.5px] text-cream/70">{stat.label}</p>
      </div>
      <div>
        <Sparkline data={stat.spark} color="#9CC0A4" width={110} height={28} className="h-7 w-full max-w-[120px]" />
        <p className="num mt-1.5 text-[10.5px] text-cream/45">{stat.delta}</p>
      </div>
    </div>
  )
}

export function StatsBand() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25 })

  return (
    <section className="relative overflow-hidden bg-forest text-cream">
      <div className="grain pointer-events-none absolute inset-0 opacity-70" aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid opacity-[0.09]"
        style={{ maskImage: 'radial-gradient(80% 100% at 50% 0%, black 0%, transparent 75%)' }}
      />
      <div className="shell relative py-14 lg:py-18">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <p className="eyebrow text-cream/45">02 — 平台数据</p>
            <h2 className="mt-3 text-section font-semibold text-cream">
              一张覆盖生产与交易的网络
            </h2>
            <p className="mt-3 text-[13px] leading-relaxed text-cream/55">
              农户、企业、装备与服务在这里连接。以下为演示环境中的示例统计，用于呈现平台的数据组织方式。
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-cream/15 bg-cream/[0.04] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-clay" />
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-cream/50">Demo Snapshot</span>
            <span className="font-mono text-[10px] text-cream/35">· 非实时</span>
          </div>
        </div>

        <div ref={ref} className="mt-10 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:mt-12 lg:grid-cols-6 lg:gap-x-0 lg:divide-x lg:divide-cream/10">
          {PLATFORM_STATS.map((stat, i) => (
            <StatItem key={stat.id} stat={stat} start={inView} index={i} />
          ))}
        </div>

        <p className="mt-9 border-t border-cream/10 pt-5 text-[11px] leading-relaxed text-cream/35">{STATS_NOTE}</p>
      </div>
    </section>
  )
}

import { MACHINERY } from '../../data/machinery'
import { SectionHeader } from '../ui/Layout'
import { ArrowLink } from '../ui/Button'
import { Reveal } from '../ui/Reveal'
import { MachineryCard } from '../machinery/MachineryCard'

export function MachineryShowcase() {
  const items = MACHINERY.slice(0, 6)

  return (
    <section className="shell py-16 lg:py-24">
      <SectionHeader
        index="05 — 农机服务"
        title="就近找装备，按亩约作业"
        description="拖拉机、收割机、播种机、植保无人机与烘干设备，按区域、价格与档期筛选，在线预约后进入个人中心跟踪订单。"
        action={<ArrowLink to="/machinery">全部农机资源</ArrowLink>}
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((m, i) => (
          <Reveal key={m.id} delay={i * 60}>
            <MachineryCard machine={m} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}

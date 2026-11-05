import { Link, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bug,
  CalendarClock,
  Dna,
  Heart,
  Leaf,
  ScanLine,
  Share2,
  TrendingDown,
} from 'lucide-react'
import { DISEASES, DISEASE_MAP } from '../data/diseases'
import { CROP_LABEL, RISK_LABEL } from '../lib/constants'
import { Breadcrumb } from '../components/ui/Layout'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { RiskBadge } from '../components/ui/Indicators'
import { SmartImage } from '../components/ui/SmartImage'
import { Reveal } from '../components/ui/Reveal'
import { NotFoundState } from '../components/ui/States'
import { useFavoriteStore } from '../store/userDataStore'
import { toast } from '../store/uiStore'
import { cn, fmtNumber } from '../lib/utils'

const PLAN_META = [
  { key: 'agricultural', label: '农业防治', en: 'CULTIVATION', tone: 'from-[#EAF1E7] to-[#DDE9D9]', ink: '#2C6450' },
  { key: 'physical', label: '物理防治', en: 'PHYSICAL', tone: 'from-[#F3EFE3] to-[#E8E1CE]', ink: '#7A6432' },
  { key: 'biological', label: '生物防治', en: 'BIOLOGICAL', tone: 'from-[#E7F0EA] to-[#D6E7DC]', ink: '#2F6350' },
  { key: 'chemical', label: '化学防治参考', en: 'CHEMICAL', tone: 'from-[#F6EDE4] to-[#EDDFD0]', ink: '#8A5A2E' },
  { key: 'prevention', label: '预防建议', en: 'PREVENTION', tone: 'from-[#E9EEF0] to-[#DCE5E8]', ink: '#3E5E66' },
  { key: 'followUp', label: '后续管理', en: 'FOLLOW-UP', tone: 'from-[#EFEDE6] to-[#E3DFD3]', ink: '#5C6152' },
] as const

export default function DiseaseDetail() {
  const { id } = useParams()
  const disease = id ? DISEASE_MAP.get(id) : undefined
  const isFav = useFavoriteStore((s) => s.items.some((f) => f.type === 'article' && f.id === id))
  const toggle = useFavoriteStore((s) => s.toggle)

  if (!disease) {
    return (
      <div className="shell py-20">
        <NotFoundState />
      </div>
    )
  }

  const related = DISEASES.filter((d) => d.id !== disease.id && d.crop === disease.crop).slice(0, 3)
  const fallbackRelated = DISEASES.filter((d) => d.id !== disease.id).slice(0, 3)
  const relatedList = related.length ? related : fallbackRelated

  return (
    <>
      <section className="border-b border-line/70 bg-cream">
        <div className="shell py-6">
          <Breadcrumb
            items={[
              { label: '病虫害识别', to: '/disease' },
              { label: '知识库', to: '/disease/library' },
              { label: disease.name },
            ]}
          />
        </div>
      </section>

      <section className="shell py-8 lg:py-12">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-panel border border-line bg-white shadow-card">
              <SmartImage src={disease.image} alt={disease.name} ratio="16 / 10" className="w-full" eager />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: '危害程度', value: RISK_LABEL[disease.severity], tone: 'text-[#A63E28]' },
                { label: '高发时期', value: disease.season.split('（')[0], tone: 'text-forest' },
                { label: '浏览', value: fmtNumber(disease.viewCount), tone: 'text-forest' },
                { label: '类型', value: disease.kind === 'disease' ? '侵染性病害' : '虫害', tone: 'text-forest' },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-line bg-white px-3.5 py-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">{m.label}</p>
                  <p className={cn('mt-1.5 truncate text-[13px] font-medium', m.tone)}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="flex h-full flex-col rounded-panel border border-line bg-white p-6 shadow-card">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-moss/10 text-moss">
                  {disease.kind === 'disease' ? <Leaf size={14} /> : <Bug size={14} />}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  {disease.kind === 'disease' ? 'Disease' : 'Pest'} · {CROP_LABEL[disease.crop]}
                </span>
              </div>

              <h1 className="mt-3 text-[30px] font-semibold leading-tight text-forest">{disease.name}</h1>
              {disease.alias && <p className="mt-1.5 text-[12.5px] text-muted">俗称：{disease.alias}</p>}

              <div className="mt-4 flex flex-wrap gap-2">
                <RiskBadge level={disease.severity} />
                {disease.tags.map((t) => (
                  <Badge key={t} tone="sage">
                    {t}
                  </Badge>
                ))}
              </div>

              <dl className="mt-5 space-y-3 border-t border-line/70 pt-5">
                <div className="flex gap-3">
                  <Dna size={14} className="mt-0.5 shrink-0 text-muted/60" />
                  <div>
                    <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">病原 / 虫源</dt>
                    <dd className="mt-0.5 text-[12.5px] leading-relaxed text-ink/80">{disease.pathogen}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CalendarClock size={14} className="mt-0.5 shrink-0 text-muted/60" />
                  <div>
                    <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">发生时期</dt>
                    <dd className="mt-0.5 text-[12.5px] text-ink/80">{disease.season}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <TrendingDown size={14} className="mt-0.5 shrink-0 text-muted/60" />
                  <div>
                    <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">潜在损失</dt>
                    <dd className="mt-0.5 text-[12.5px] text-ink/80">{disease.yieldLoss}</dd>
                  </div>
                </div>
              </dl>

              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                <Link
                  to="/disease"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-forest bg-forest px-4 py-2.5 text-[12.5px] font-medium text-cream transition hover:bg-forest-950"
                >
                  <ScanLine size={14} /> 上传图片识别
                </Link>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    const added = toggle({
                      type: 'article',
                      id: disease.id,
                      title: disease.name,
                      subtitle: `${CROP_LABEL[disease.crop]} · ${disease.kind === 'disease' ? '病害' : '虫害'}`,
                      meta: disease.season,
                      image: disease.image,
                    })
                    toast[added ? 'success' : 'info'](added ? '已收藏知识条目' : '已取消收藏')
                  }}
                  iconLeft={<Heart size={14} fill={isFav ? 'currentColor' : 'none'} />}
                >
                  {isFav ? '已收藏' : '收藏'}
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    void navigator.clipboard?.writeText(window.location.href)
                    toast.success('链接已复制', '可粘贴分享给合作社成员')
                  }}
                  iconLeft={<Share2 size={14} />}
                  aria-label="分享"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell pb-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { title: '典型症状', items: disease.symptoms, icon: <Leaf size={13} /> },
            { title: '发生原因', items: disease.causes, icon: <AlertTriangle size={13} /> },
            { title: '传播特点', items: disease.spread, icon: <ArrowRight size={13} /> },
          ].map((block, i) => (
            <Reveal key={block.title} delay={i * 60}>
              <div className="h-full rounded-panel border border-line bg-white p-5">
                <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-moss">
                  {block.icon}
                  {block.title}
                </p>
                <ul className="mt-3 space-y-2.5">
                  {block.items.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-[12px] leading-relaxed text-ink/75">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-moss/50" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="shell pb-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Control Plan</p>
            <h2 className="mt-2 text-[22px] font-semibold text-forest">分阶段防控方案</h2>
          </div>
          <Link to="/news?category=pest" className="hidden items-center gap-1 text-[12px] text-moss hover:text-forest sm:flex">
            更多防控技术 <ArrowRight size={12} />
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PLAN_META.map((meta, i) => (
            <Reveal key={meta.key} delay={i * 40}>
              <div className="h-full rounded-panel border border-line bg-white p-5">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn('flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br', meta.tone)}
                    style={{ color: meta.ink }}
                  >
                    <Leaf size={14} />
                  </span>
                  <div>
                    <p className="text-[13px] font-medium text-forest">{meta.label}</p>
                    <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-muted/60">{meta.en}</p>
                  </div>
                </div>
                <ul className="mt-3.5 space-y-2">
                  {disease.plan[meta.key].map((t) => (
                    <li key={t} className="flex items-start gap-2 text-[11.5px] leading-relaxed text-ink/75">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-moss/50" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="shell pb-14">
        <div className="rounded-panel border border-line bg-white p-5 shadow-card lg:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-semibold text-forest">用药参考</h2>
              <p className="mt-1 text-[12px] text-muted">仅列有效成分类别，不提供剂量；实际用药以农药登记标签为准。</p>
            </div>
            <span className="rounded-full border border-clay/40 bg-clay/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[#94601F]">
              合规提示
            </span>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-line">
            <div className="hidden grid-cols-[1.2fr_1fr_1fr_1.4fr] gap-3 bg-sand/40 px-4 py-2.5 text-[10px] uppercase tracking-[0.1em] text-muted sm:grid">
              <span>参考药剂</span>
              <span>有效成分</span>
              <span>防治对象</span>
              <span>使用提示</span>
            </div>
            {disease.pesticides.map((p) => (
              <div
                key={p.name}
                className="grid gap-1 border-t border-line/70 px-4 py-3 text-[11.5px] sm:grid-cols-[1.2fr_1fr_1fr_1.4fr] sm:gap-3"
              >
                <span className="font-medium text-forest">{p.name}</span>
                <span className="text-ink/70">{p.activeIngredient}</span>
                <span className="text-ink/70">{p.target}</span>
                <span className="text-muted">{p.note}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted">
            <AlertTriangle size={12} className="mt-0.5 shrink-0" />
            禁止使用国家明令禁止的高毒农药；采收前必须严格执行安全间隔期。本页内容不构成用药处方。
          </p>
        </div>
      </section>

      {relatedList.length > 0 && (
        <section className="shell pb-16">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-semibold text-forest">同类作物其他病虫害</h2>
            <Link to="/disease/library" className="flex items-center gap-1 text-[12px] text-moss hover:text-forest">
              返回知识库 <ArrowLeft size={12} />
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {relatedList.map((d) => (
              <Link
                key={d.id}
                to={`/disease/library/${d.id}`}
                className="group flex gap-3 rounded-xl border border-line bg-white p-3 transition hover:border-moss/40 hover:shadow-card"
              >
                <SmartImage src={d.image} alt={d.name} className="h-16 w-20 shrink-0 rounded-lg" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-forest group-hover:text-moss">{d.name}</p>
                  <p className="mt-1 line-clamp-1 text-[11px] text-muted">{CROP_LABEL[d.crop]} · {d.season.split('（')[0]}</p>
                  <div className="mt-1.5">
                    <RiskBadge level={d.severity} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

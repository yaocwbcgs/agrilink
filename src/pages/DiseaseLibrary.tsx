import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bug, Eye, Leaf, Search, SlidersHorizontal, X } from 'lucide-react'
import { PageHero } from '../components/ui/Layout'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/States'
import { Pagination } from '../components/ui/Pagination'
import { Segmented } from '../components/ui/Tabs'
import { RiskBadge } from '../components/ui/Indicators'
import { SmartImage } from '../components/ui/SmartImage'
import { Reveal } from '../components/ui/Reveal'
import { DISEASES } from '../data/diseases'
import { CROP_OPTIONS, CROP_LABEL } from '../lib/constants'
import type { CropKey, PestKind } from '../types'
import { cn, fmtNumber } from '../lib/utils'

const PAGE_SIZE = 9

export default function DiseaseLibrary() {
  const [kind, setKind] = useState<PestKind | 'all'>('all')
  const [crop, setCrop] = useState<CropKey | 'all'>('all')
  const [keyword, setKeyword] = useState('')
  const [sort, setSort] = useState<'hot' | 'name'>('hot')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const k = keyword.trim()
    return DISEASES.filter((d) => {
      if (kind !== 'all' && d.kind !== kind) return false
      if (crop !== 'all' && d.crop !== crop) return false
      if (
        k &&
        ![d.name, d.alias ?? '', d.pathogen, ...d.tags, ...d.symptoms].join(' ').toLowerCase().includes(k.toLowerCase())
      )
        return false
      return true
    }).sort((a, b) => (sort === 'hot' ? b.viewCount - a.viewCount : a.name.localeCompare(b.name, 'zh')))
  }, [kind, crop, keyword, sort])

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const reset = () => {
    setKind('all')
    setCrop('all')
    setKeyword('')
    setPage(1)
  }

  return (
    <>
      <PageHero
        eyebrow="Knowledge Base · 病虫害知识库"
        title="先对照症状，再判断该防还是该治"
        description="收录小麦、玉米、水稻、大豆、果树与蔬菜常见病虫害 14 类，按作物、类型与症状检索，包含诊断要点与分阶段防控技术。"
        breadcrumb={[{ label: '病虫害识别', to: '/disease' }, { label: '知识库' }]}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              to="/disease"
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-forest bg-forest px-4 py-2.5 text-[12.5px] font-medium text-cream transition hover:bg-forest-950"
            >
              上传图片识别
            </Link>
          </div>
        }
        meta={
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11.5px] text-muted">
            <span>共 {DISEASES.length} 条知识条目</span>
            <span>病害 {DISEASES.filter((d) => d.kind === 'disease').length} 条</span>
            <span>虫害 {DISEASES.filter((d) => d.kind === 'pest').length} 条</span>
            <span>覆盖 {new Set(DISEASES.map((d) => d.crop)).size} 类作物</span>
          </div>
        }
      />

      <section className="shell py-8 lg:py-12">
        <div className="rounded-panel border border-line bg-white p-4 shadow-card">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value)
                    setPage(1)
                  }}
                  placeholder="搜索病害名称、俗称或症状，例如「叶片发黄」"
                  className="field pl-9 pr-9"
                />
                {keyword && (
                  <button
                    onClick={() => setKeyword('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-forest"
                    aria-label="清空搜索"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Segmented
                  value={kind}
                  onChange={(v) => {
                    setKind(v)
                    setPage(1)
                  }}
                  options={[
                    { value: 'all', label: '全部' },
                    { value: 'disease', label: '病害' },
                    { value: 'pest', label: '虫害' },
                  ]}
                />
                <Segmented
                  value={sort}
                  onChange={setSort}
                  options={[
                    { value: 'hot', label: '热度' },
                    { value: 'name', label: '名称' },
                  ]}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-line/70 pt-3.5">
              <span className="mr-1 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                <SlidersHorizontal size={11} /> 作物
              </span>
              <button
                onClick={() => {
                  setCrop('all')
                  setPage(1)
                }}
                className={cn('chip', crop === 'all' && 'chip-active')}
              >
                全部作物
              </button>
              {CROP_OPTIONS.filter((c) => DISEASES.some((d) => d.crop === c.value)).map((c) => (
                <button
                  key={c.value}
                  onClick={() => {
                    setCrop(c.value)
                    setPage(1)
                  }}
                  className={cn('chip', crop === c.value && 'chip-active')}
                >
                  {c.label}
                  <span className="num text-[10px] opacity-60">{DISEASES.filter((d) => d.crop === c.value).length}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-[12px] text-muted">
            筛选结果 <span className="num font-medium text-forest">{filtered.length}</span> 条
          </p>
          {(kind !== 'all' || crop !== 'all' || keyword) && (
            <button onClick={reset} className="text-[12px] text-moss hover:text-forest">
              重置筛选
            </button>
          )}
        </div>

        {pageItems.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="没有匹配的病虫害条目"
              description="试试更换作物，或使用更宽泛的关键词，例如「叶斑」「枯萎」「钻心」。"
              action={
                <button onClick={reset} className="rounded-[10px] border border-line bg-white px-4 py-2 text-[12.5px] text-forest">
                  清除全部筛选
                </button>
              }
              icon={<Bug size={22} strokeWidth={1.6} />}
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((d, i) => (
              <Reveal key={d.id} delay={i * 50}>
                <Link
                  to={`/disease/library/${d.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-panel border border-line bg-white transition-all duration-500 hover:-translate-y-0.5 hover:border-moss/40 hover:shadow-lift"
                >
                  <div className="relative">
                    <SmartImage
                      src={d.image}
                      alt={d.name}
                      ratio="16 / 10"
                      className="w-full"
                      imgClassName="transition-transform duration-[1100ms] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-950/50 to-transparent" />
                    <div className="absolute left-3 top-3 flex gap-1.5">
                      <span className="rounded-full bg-forest/85 px-2 py-0.5 text-[10px] text-cream backdrop-blur">
                        {d.kind === 'disease' ? '病害' : '虫害'}
                      </span>
                      <span className="rounded-full border border-cream/30 bg-cream/15 px-2 py-0.5 text-[10px] text-cream backdrop-blur">
                        {CROP_LABEL[d.crop]}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <RiskBadge level={d.severity} />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="text-[15px] font-semibold text-forest transition group-hover:text-moss">{d.name}</h3>
                    {d.alias && <p className="mt-0.5 text-[11px] text-muted">俗称 {d.alias}</p>}
                    <p className="mt-2 line-clamp-2 text-[11.5px] leading-relaxed text-ink/65">
                      {d.symptoms[0]}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {d.tags.slice(0, 2).map((t) => (
                        <Badge key={t} tone="sage">
                          {t}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-auto flex items-center justify-between border-t border-line/60 pt-3 text-[10.5px] text-muted">
                      <span className="flex items-center gap-1">
                        <Eye size={11} /> {fmtNumber(d.viewCount)}
                      </span>
                      <span className="flex items-center gap-1 text-moss">
                        查看防控方案 <Leaf size={11} />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}

        {filtered.length > PAGE_SIZE && (
          <Pagination
            className="mt-8"
            page={page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onChange={(p) => {
              setPage(p)
              window.scrollTo({ top: 260, behavior: 'smooth' })
            }}
          />
        )}
      </section>
    </>
  )
}

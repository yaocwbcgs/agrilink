import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit3, Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import { UserEmpty, UserPageHeader } from './UserLayout'
import { Badge } from '../../components/ui/Badge'
import { Tabs } from '../../components/ui/Tabs'
import { ConfirmDialog } from '../../components/ui/Modal'
import { SmartImage } from '../../components/ui/SmartImage'
import { useListingStore } from '../../store/businessStore'
import { toast } from '../../store/uiStore'
import { LISTING_STATUS_LABEL, PRODUCE_CATEGORY_LABEL } from '../../lib/constants'
import { cn, fmtDate, fmtNumber } from '../../lib/utils'
import type { ListingStatus } from '../../types'

const FILTERS = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '已上架' },
  { value: 'pending', label: '审核中' },
  { value: 'offline', label: '已下架' },
]

export default function UserListings() {
  const listings = useListingStore((s) => s.own)
  const setStatus = useListingStore((s) => s.setStatus)
  const remove = useListingStore((s) => s.remove)
  const [filter, setFilter] = useState<ListingStatus | 'all'>('all')
  const [target, setTarget] = useState<string | null>(null)

  const items = filter === 'all' ? listings : listings.filter((l) => l.status === filter)

  return (
    <div>
      <UserPageHeader
        title="我的供需信息"
        description="管理你发布的供应与采购信息，支持编辑、上下架与删除。"
        action={
          <Link
            to="/market/publish"
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-forest bg-forest px-3.5 py-2 text-[12px] font-medium text-cream transition hover:bg-forest-950"
          >
            <Plus size={13} /> 发布新信息
          </Link>
        }
      />

      <Tabs
        variant="boxed"
        value={filter}
        onChange={(v) => setFilter(v as ListingStatus | 'all')}
        items={FILTERS.map((f) => ({
          value: f.value,
          label: f.label,
          count: f.value === 'all' ? listings.length : listings.filter((l) => l.status === f.value).length,
        }))}
        className="mb-4"
      />

      {items.length === 0 ? (
        <UserEmpty
          title="这里还没有信息"
          description="发布供应或采购信息后，会在这里管理审核状态与上下架。"
          action={
            <Link to="/market/publish" className="rounded-lg bg-forest px-4 py-2 text-[12px] text-cream">
              去发布
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((l) => (
            <article key={l.id} className="rounded-panel border border-line bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <SmartImage src={l.image} alt={l.title} className="h-[92px] w-full shrink-0 rounded-lg sm:w-[132px]" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="line-clamp-1 text-[13.5px] font-medium text-forest">{l.title}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[10.5px] text-muted">
                        <span>{PRODUCE_CATEGORY_LABEL[l.category]}</span>
                        <span>·</span>
                        <span>{l.type === 'supply' ? '供应' : '采购'}</span>
                        <span>·</span>
                        <span className="num">{fmtDate(l.createdAt)}</span>
                      </div>
                    </div>
                    <Badge
                      tone={l.status === 'active' ? 'green' : l.status === 'pending' ? 'amber' : l.status === 'offline' ? 'neutral' : 'red'}
                    >
                      {LISTING_STATUS_LABEL[l.status]}
                    </Badge>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11.5px]">
                    <span className="num text-forest">
                      ￥{fmtNumber(l.price)}
                      {l.priceMax ? `–${fmtNumber(l.priceMax)}` : ''}
                      <span className="text-[10px] text-muted">/{l.unit}</span>
                    </span>
                    <span className="num text-muted">
                      {l.quantity} {l.unit}
                    </span>
                    <span className="text-muted">{l.region}</span>
                    <span className="num text-muted">{l.views} 浏览</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 border-t border-line/60 pt-3">
                    <Link
                      to={`/market/${l.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[11px] text-forest transition hover:border-moss/50"
                    >
                      <Eye size={11} /> 查看
                    </Link>
                    <Link
                      to={`/market/publish?edit=${l.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[11px] text-forest transition hover:border-moss/50"
                    >
                      <Edit3 size={11} /> 编辑
                    </Link>
                    <button
                      onClick={() => {
                        setStatus(l.id, l.status === 'active' ? 'offline' : 'active')
                        toast.success(l.status === 'active' ? '已下架' : '已上架', l.title.slice(0, 20))
                      }}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] transition',
                        l.status === 'active'
                          ? 'border-line text-muted hover:border-[#EBC4B9] hover:text-[#A63E28]'
                          : 'border-line text-forest hover:border-moss/50',
                      )}
                    >
                      {l.status === 'active' ? <EyeOff size={11} /> : <Eye size={11} />}
                      {l.status === 'active' ? '下架' : '上架'}
                    </button>
                    <button
                      onClick={() => setTarget(l.id)}
                      className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[11px] text-[#A63E28] transition hover:border-[#EBC4B9] hover:bg-[#F8E4DF]"
                    >
                      <Trash2 size={11} /> 删除
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!target}
        onClose={() => setTarget(null)}
        onConfirm={() => {
          if (!target) return
          remove(target)
          toast.success('信息已删除')
        }}
        title="删除这条信息"
        description="删除后不可恢复，已收到的询价记录仍会保留在「我的询价」中。"
        confirmLabel="删除"
      />
    </div>
  )
}

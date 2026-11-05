import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Heart, Trash2 } from 'lucide-react'
import { UserEmpty, UserPageHeader } from './UserLayout'
import { Badge } from '../../components/ui/Badge'
import { Tabs } from '../../components/ui/Tabs'
import { SmartImage } from '../../components/ui/SmartImage'
import { useFavoriteStore } from '../../store/userDataStore'
import { toast } from '../../store/uiStore'
import { fmtDate } from '../../lib/utils'
import type { FavoriteType } from '../../types'

const TYPE_LABEL: Record<FavoriteType, string> = {
  listing: '供需信息',
  machinery: '农机服务',
  product: '农资商品',
  article: '文章 / 知识',
}

const TYPE_LINK: Record<FavoriteType, (id: string) => string> = {
  listing: (id) => `/market/${id}`,
  machinery: (id) => `/machinery/${id}`,
  product: (id) => `/shop/${id}`,
  article: (id) =>
    id.startsWith('diag-')
      ? '/disease'
      : id.startsWith('dis-')
        ? `/disease/library/${id}`
        : `/news/${id}`,
}

export default function UserFavorites() {
  const items = useFavoriteStore((s) => s.items)
  const remove = useFavoriteStore((s) => s.remove)
  const [filter, setFilter] = useState<FavoriteType | 'all'>('all')

  const filtered = filter === 'all' ? items : items.filter((i) => i.type === filter)

  return (
    <div>
      <UserPageHeader title="我的收藏" description="收藏的内容保存在本机浏览器，可随时取消。" />

      <Tabs
        value={filter}
        onChange={(v) => setFilter(v as FavoriteType | 'all')}
        items={[
          { value: 'all', label: '全部', count: items.length },
          ...(Object.keys(TYPE_LABEL) as FavoriteType[]).map((t) => ({
            value: t,
            label: TYPE_LABEL[t],
            count: items.filter((i) => i.type === t).length,
          })),
        ]}
        className="mb-4"
      />

      {filtered.length === 0 ? (
        <UserEmpty
          title="还没有收藏内容"
          description="在供需信息、农机、商品或文章页面点击收藏，内容会出现在这里。"
          action={
            <Link to="/market" className="rounded-lg bg-forest px-4 py-2 text-[12px] text-cream">
              去逛逛
            </Link>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((f) => (
            <article key={`${f.type}-${f.id}`} className="flex gap-3 rounded-panel border border-line bg-white p-3">
              {f.image ? (
                <SmartImage src={f.image} alt={f.title} className="h-[76px] w-[92px] shrink-0 rounded-lg" />
              ) : (
                <span className="flex h-[76px] w-[92px] shrink-0 items-center justify-center rounded-lg bg-sand text-moss">
                  <Heart size={18} />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <Badge tone="neutral">{TYPE_LABEL[f.type]}</Badge>
                  <button
                    onClick={() => {
                      remove(f.type, f.id)
                      toast.info('已取消收藏')
                    }}
                    className="shrink-0 rounded p-1 text-muted/50 transition hover:text-[#A63E28]"
                    aria-label="取消收藏"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <Link to={TYPE_LINK[f.type](f.id)} className="mt-1.5 block">
                  <p className="line-clamp-2 text-[12.5px] font-medium leading-snug text-forest hover:text-moss">{f.title}</p>
                </Link>
                <p className="mt-1 line-clamp-1 text-[10.5px] text-muted">{f.meta}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="num text-[9.5px] text-muted/70">{fmtDate(f.addedAt)}</span>
                  <Link
                    to={TYPE_LINK[f.type](f.id)}
                    className="inline-flex items-center gap-0.5 text-[10.5px] text-moss hover:text-forest"
                  >
                    查看 <ArrowUpRight size={10} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

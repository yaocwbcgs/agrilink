import { useMemo, useState } from 'react'
import { Check, MapPin, Search } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { REGIONS } from '../../lib/constants'
import { useUiStore, toast } from '../../store/uiStore'
import { cn } from '../../lib/utils'

export function RegionPicker() {
  const open = useUiStore((s) => s.regionOpen)
  const setOpen = useUiStore((s) => s.setRegionOpen)
  const region = useUiStore((s) => s.region)
  const setRegion = useUiStore((s) => s.setRegion)
  const [query, setQuery] = useState('')

  const list = useMemo(
    () => REGIONS.filter((r) => (query ? r.includes(query.trim()) : true)),
    [query],
  )

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title="选择地区"
      description="用于筛选当地供需、农机与行情，可随时切换"
      size="md"
    >
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="输入省份名称"
          className="field pl-9"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {list.map((r) => {
          const active = region === r
          return (
            <button
              key={r}
              onClick={() => {
                setRegion(r)
                setOpen(false)
                toast.success('地区已切换', `当前查看：${r}`)
              }}
              className={cn(
                'flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-[13px] transition',
                active
                  ? 'border-forest bg-forest text-cream'
                  : 'border-line bg-white text-ink/75 hover:border-moss/50 hover:text-forest',
              )}
            >
              <span className="flex items-center gap-1.5 truncate">
                {active ? <MapPin size={13} /> : null}
                {r}
              </span>
              {active && <Check size={14} />}
            </button>
          )
        })}
      </div>
      {list.length === 0 && <p className="py-8 text-center text-[13px] text-muted">没有匹配的省份</p>}
    </Modal>
  )
}

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { ArrowRight, Search, X } from 'lucide-react'
import { useDebounced, useLockBody } from '../../hooks/useUi'
import { HOT_KEYWORDS, globalSearch, type GlobalSearchResult } from '../../services/search'
import { useUiStore } from '../../store/uiStore'
import { cn } from '../../lib/utils'

const QUICK_LINKS = [
  { label: '病虫害识别', to: '/disease' },
  { label: '供应大厅', to: '/market?tab=supply' },
  { label: '农机预约', to: '/machinery' },
  { label: '农资商城', to: '/shop' },
  { label: '价格行情', to: '/prices' },
]

export function GlobalSearchOverlay() {
  const open = useUiStore((s) => s.searchOpen)
  const setOpen = useUiStore((s) => s.setSearchOpen)
  const [keyword, setKeyword] = useState('')
  const [result, setResult] = useState<GlobalSearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const debounced = useDebounced(keyword, 260)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useLockBody(open)

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setOpen])

  useEffect(() => {
    if (!debounced.trim()) {
      setResult(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    globalSearch(debounced).then((res) => {
      if (cancelled) return
      setResult(res)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [debounced])

  const goSearch = (value: string) => {
    if (!value.trim()) return
    setOpen(false)
    navigate(`/search?q=${encodeURIComponent(value.trim())}`)
  }

  if (!open) return null

  const groups = result
    ? [
        { key: 'listings', label: '供需信息', items: result.listings.items, total: result.listings.total, to: (id: string) => `/market/${id}`, meta: (i: any) => `${i.region} · ${i.quantity}${i.unit}` },
        { key: 'products', label: '农资商品', items: result.products.items, total: result.products.total, to: (id: string) => `/shop/${id}`, meta: (i: any) => `${i.spec} · ￥${i.price}/${i.unit}` },
        { key: 'machinery', label: '农机服务', items: result.machinery.items, total: result.machinery.total, to: (id: string) => `/machinery/${id}`, meta: (i: any) => `${i.region} · ${i.priceUnit}` },
        { key: 'diseases', label: '病虫害知识', items: result.diseases.items, total: result.diseases.total, to: (id: string) => `/disease/library/${id}`, meta: (i: any) => `${i.kind === 'disease' ? '病害' : '虫害'} · ${i.season}` },
        { key: 'news', label: '农业资讯', items: result.news.items, total: result.news.total, to: (id: string) => `/news/${id}`, meta: (i: any) => `${i.source} · ${i.readMinutes} 分钟阅读` },
      ].filter((g) => g.total > 0)
    : []

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-0 pt-0 sm:px-6 sm:pt-[12vh]">
      <div className="absolute inset-0 bg-forest-950/45 backdrop-blur-[3px] animate-fade-in" onClick={() => setOpen(false)} aria-hidden />
      <div className="relative flex h-full w-full flex-col overflow-hidden border-line bg-cream animate-scale-in sm:h-auto sm:max-h-[70vh] sm:max-w-2xl sm:rounded-panel sm:border sm:shadow-float">
        <div className="flex items-center gap-3 border-b border-line/70 bg-white px-5 py-4">
          <Search size={18} className="shrink-0 text-moss" />
          <input
            ref={inputRef}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') goSearch(keyword)
            }}
            placeholder="搜索病虫害、农资、农机、农产品或资讯"
            className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-muted/70"
            aria-label="全局搜索"
          />
          {keyword && (
            <button onClick={() => setKeyword('')} className="rounded p-1 text-muted hover:text-forest" aria-label="清空">
              <X size={15} />
            </button>
          )}
          <button
            onClick={() => setOpen(false)}
            className="hidden shrink-0 rounded border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted sm:block"
          >
            esc
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {!keyword.trim() && (
            <div className="space-y-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">热门搜索</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {HOT_KEYWORDS.map((k) => (
                    <button
                      key={k}
                      onClick={() => setKeyword(k)}
                      className="rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] text-ink/75 transition hover:border-moss/50 hover:text-forest"
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">快速前往</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {QUICK_LINKS.map((l) => (
                    <button
                      key={l.to}
                      onClick={() => {
                        setOpen(false)
                        navigate(l.to)
                      }}
                      className="flex items-center justify-between rounded-lg border border-line bg-white px-3 py-2.5 text-left text-[12.5px] text-ink/80 transition hover:border-moss/50 hover:text-forest"
                    >
                      {l.label}
                      <ArrowRight size={13} className="text-muted" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {keyword.trim() && loading && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-line bg-white p-3">
                  <div className="skeleton h-9 w-9 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-2/3 rounded" />
                    <div className="skeleton h-2.5 w-1/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {keyword.trim() && !loading && result && result.total === 0 && (
            <div className="py-10 text-center">
              <p className="text-[14px] font-medium text-forest">没有找到「{keyword}」相关内容</p>
              <p className="mt-2 text-[12.5px] text-muted">试试更短的关键词，或从热门搜索中选择。</p>
            </div>
          )}

          {keyword.trim() && !loading && groups.length > 0 && (
            <div className="space-y-6">
              {groups.map((group) => (
                <div key={group.key}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                      {group.label} · {group.total}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    {group.items.map((item: any) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setOpen(false)
                          navigate(group.to(item.id))
                        }}
                        className="group flex w-full items-center justify-between gap-4 rounded-lg border border-transparent px-3 py-2.5 text-left transition hover:border-line hover:bg-white"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] text-ink group-hover:text-forest">
                            {item.title ?? item.name}
                          </span>
                          <span className="mt-0.5 block truncate text-[11.5px] text-muted">{group.meta(item)}</span>
                        </span>
                        <ArrowRight size={14} className="shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-forest" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button
                onClick={() => goSearch(keyword)}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-lg border border-forest bg-forest py-2.5 text-[13px] font-medium text-cream transition hover:bg-forest-950',
                )}
              >
                查看「{keyword}」的全部结果（{result?.total ?? 0}）
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

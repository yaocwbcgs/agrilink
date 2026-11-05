import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Pagination({
  page,
  pageSize,
  total,
  onChange,
  className,
}: {
  page: number
  pageSize: number
  total: number
  onChange: (p: number) => void
  className?: string
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  if (total === 0) return null

  const pages: (number | '...')[] = []
  const push = (v: number | '...') => pages.push(v)
  if (pageCount <= 7) {
    for (let i = 1; i <= pageCount; i++) push(i)
  } else {
    push(1)
    if (page > 3) push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(pageCount - 1, page + 1); i++) push(i)
    if (page < pageCount - 2) push('...')
    push(pageCount)
  }

  return (
    <div className={cn('flex flex-col items-center justify-between gap-4 sm:flex-row', className)}>
      <p className="num text-[12px] text-muted">
        共 <span className="text-forest">{total}</span> 条 · 第 {page} / {pageCount} 页
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-forest transition hover:border-moss/50 disabled:opacity-40"
          aria-label="上一页"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((p, idx) =>
          p === '...' ? (
            <span key={`gap-${idx}`} className="px-1.5 text-muted">
              ···
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={cn(
                'num h-9 min-w-9 rounded-lg border px-2 text-[13px] transition',
                p === page
                  ? 'border-forest bg-forest text-cream'
                  : 'border-line bg-white text-ink/70 hover:border-moss/50 hover:text-forest',
              )}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => onChange(Math.min(pageCount, page + 1))}
          disabled={page === pageCount}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-forest transition hover:border-moss/50 disabled:opacity-40"
          aria-label="下一页"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

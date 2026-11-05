import type { ReactNode } from 'react'
import { AlertTriangle, PackageOpen, RotateCw } from 'lucide-react'
import { Button, LinkButton } from './Button'
import { cn } from '../../lib/utils'

export function EmptyState({
  title,
  description,
  action,
  icon,
  compact,
  className,
}: {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
  compact?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-white/60 text-center',
        compact ? 'px-6 py-12' : 'px-8 py-20',
        className,
      )}
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-line bg-sand/50 text-moss">
        {icon ?? <PackageOpen size={22} strokeWidth={1.6} />}
      </div>
      <h3 className="text-[16px] font-medium text-forest">{title}</h3>
      {description && <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function ErrorState({
  message,
  onRetry,
  title = '数据加载失败',
}: {
  message?: string
  onRetry?: () => void
  title?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-line bg-white px-8 py-16 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#EBC4B9] bg-[#F8E4DF] text-[#A63E28]">
        <AlertTriangle size={22} strokeWidth={1.6} />
      </div>
      <h3 className="text-[16px] font-medium text-forest">{title}</h3>
      <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted">
        {message ?? '网络似乎不太稳定，请检查连接后重试。'}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-6" onClick={onRetry} iconLeft={<RotateCw size={14} />}>
          重新加载
        </Button>
      )}
    </div>
  )
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-md', className)} />
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="card overflow-hidden p-0">
      <SkeletonBlock className="h-40 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <SkeletonBlock className="h-4 w-3/4" />
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonBlock key={i} className={cn('h-3', i % 2 === 0 ? 'w-full' : 'w-2/3')} />
        ))}
      </div>
    </div>
  )
}

export function ListRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-card border border-line bg-white p-4">
      <SkeletonBlock className="h-16 w-24 shrink-0" />
      <div className="flex-1 space-y-2.5">
        <SkeletonBlock className="h-4 w-2/3" />
        <SkeletonBlock className="h-3 w-1/2" />
      </div>
      <SkeletonBlock className="h-8 w-20" />
    </div>
  )
}

export function InlineLoader({ label = '加载中' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-[13px] text-muted">
      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-moss" />
      {label}…
    </div>
  )
}

export function NotFoundState({ onBack }: { onBack?: () => void }) {
  return (
    <EmptyState
      title="页面不存在"
      description="你访问的内容可能已被移除或链接有误，可以返回首页继续浏览。"
      action={
        onBack ? (
          <Button onClick={onBack} variant="secondary" size="sm">
            返回上一页
          </Button>
        ) : (
          <LinkButton to="/" size="sm">
            回到首页
          </LinkButton>
        )
      }
      icon={<AlertTriangle size={22} strokeWidth={1.6} />}
    />
  )
}

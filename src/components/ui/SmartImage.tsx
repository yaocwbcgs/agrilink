import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * 图片组件：加载骨架 + 失败兜底
 * 生产环境可将 src 换成 CDN / OSS 地址，无需改动调用方
 */
export function SmartImage({
  src,
  alt,
  className,
  imgClassName,
  ratio,
  fallbackLabel,
  eager,
}: {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  ratio?: string
  fallbackLabel?: string
  eager?: boolean
}) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  return (
    <div
      className={cn('relative overflow-hidden bg-sand', className)}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      {status === 'loading' && <div className="absolute inset-0 skeleton" />}
      {status === 'error' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[radial-gradient(120%_100%_at_20%_0%,#E7EBDE_0%,#D9DFD1_60%,#CBD3C3_100%)] text-[#4B6355]">
          <ImageOff size={22} strokeWidth={1.4} />
          <span className="px-3 text-center font-mono text-[10px] uppercase tracking-[0.16em]">
            {fallbackLabel ?? alt}
          </span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setStatus('ready')}
          onError={() => setStatus('error')}
          className={cn(
            'h-full w-full object-cover transition-all duration-700 ease-smooth',
            status === 'loading' ? 'scale-[1.02] opacity-0 blur-sm' : 'scale-100 opacity-100 blur-0',
            imgClassName,
          )}
        />
      )}
    </div>
  )
}

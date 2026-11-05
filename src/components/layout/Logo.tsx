import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

export function LogoMark({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={cn('shrink-0', className)} aria-hidden>
      <rect width="64" height="64" rx="16" fill="#173D32" />
      <path d="M32 50V24" stroke="#F6F5F0" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M32 34c-6.5 0-10-3.6-10-9.6 6.6 0 10 3.6 10 9.6Z" fill="#83A88B" />
      <path d="M32 34c6.5 0 10-3.6 10-9.6-6.6 0-10 3.6-10 9.6Z" fill="#F6F5F0" opacity="0.9" />
      <path d="M32 26c-4.6-1.6-6.6-5-5.4-9.4 4.7 1.4 6.7 4.8 5.4 9.4Z" fill="#E69A4A" />
      <path d="M32 26c4.6-1.6 6.6-5 5.4-9.4-4.7 1.4-6.7 4.8-5.4 9.4Z" fill="#F3D3AC" />
      <circle cx="32" cy="50" r="3.2" fill="#E69A4A" />
    </svg>
  )
}

export function Logo({ variant = 'dark', compact }: { variant?: 'dark' | 'light'; compact?: boolean }) {
  const isLight = variant === 'light'
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="耘链 AGRI LINK 首页">
      <LogoMark size={compact ? 32 : 36} className="transition-transform duration-500 group-hover:rotate-[-6deg]" />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'text-[17px] font-semibold tracking-[0.04em]',
            isLight ? 'text-cream' : 'text-forest',
            compact && 'text-[15px]',
          )}
        >
          耘链农业
        </span>
        <span
          className={cn(
            'mt-1 font-mono text-[9px] uppercase tracking-[0.32em]',
            isLight ? 'text-cream/55' : 'text-muted',
          )}
        >
          Agri Link
        </span>
      </span>
    </Link>
  )
}

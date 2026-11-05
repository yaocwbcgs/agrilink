import { createPortal } from 'react-dom'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useUiStore } from '../../store/uiStore'
import { cn } from '../../lib/utils'

const iconMap = {
  success: <CheckCircle2 size={17} />,
  error: <XCircle size={17} />,
  info: <Info size={17} />,
}

const toneMap = {
  success: 'border-[#C6DCCB] text-[#2C6450]',
  error: 'border-[#EBC4B9] text-[#A63E28]',
  info: 'border-line text-forest',
}

export function Toaster() {
  const toasts = useUiStore((s) => s.toasts)
  const dismiss = useUiStore((s) => s.dismiss)

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[120] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-lift animate-slide-in-right',
            toneMap[t.variant],
          )}
        >
          <span className="mt-0.5 shrink-0">{iconMap[t.variant]}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-medium text-forest">{t.title}</p>
            {t.description && <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{t.description}</p>}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="-mr-1 -mt-1 flex h-6 w-6 items-center justify-center rounded-full text-muted/70 transition hover:bg-sand hover:text-forest"
            aria-label="关闭提示"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  )
}

import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'

const LINKS = [
  { to: '/', label: '首页' },
  { to: '/disease', label: '病虫害识别' },
  { to: '/market', label: '产销对接' },
  { to: '/machinery', label: '农机服务' },
  { to: '/shop', label: '农资商城' },
  { to: '/prices', label: '价格行情' },
]

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="shell flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-line bg-white text-moss">
        <Compass size={26} strokeWidth={1.5} />
      </span>
      <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.24em] text-muted">Error 404</p>
      <h1 className="mt-3 text-[28px] font-semibold text-forest">这一页没有找到</h1>
      <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted">
        链接可能已经失效，或内容已下架。你可以回到首页，或从下面的入口继续浏览。
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-line bg-white px-4 py-2.5 text-[12.5px] text-forest transition hover:border-moss/50"
        >
          <ArrowLeft size={13} /> 返回上一页
        </button>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-forest bg-forest px-4 py-2.5 text-[12.5px] font-medium text-cream transition hover:bg-forest-950"
        >
          回到首页
        </Link>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {LINKS.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="rounded-full border border-line bg-white/60 px-3 py-1.5 text-[11.5px] text-ink/65 transition hover:border-moss/40 hover:text-forest"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

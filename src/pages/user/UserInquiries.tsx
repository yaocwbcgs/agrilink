import { Link } from 'react-router-dom'
import { CheckCircle2, Clock, MessageSquare } from 'lucide-react'
import { UserEmpty, UserPageHeader } from './UserLayout'
import { Badge } from '../../components/ui/Badge'
import { useInquiryStore } from '../../store/userDataStore'
import { toast } from '../../store/uiStore'
import { fmtDate, fmtNumber, relTime } from '../../lib/utils'

export default function UserInquiries() {
  const items = useInquiryStore((s) => s.items)
  const close = useInquiryStore((s) => s.close)

  return (
    <div>
      <UserPageHeader title="我的询价" description="记录你发出的询价与对方回复，演示环境会在 6 秒后生成模拟回复。" />

      {items.length === 0 ? (
        <UserEmpty
          title="还没有询价记录"
          description="在供需详情页点击「发起询价」，填写数量与价格后即可向对方询价。"
          action={
            <Link to="/market" className="rounded-lg bg-forest px-4 py-2 text-[12px] text-cream">
              去产销大厅
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((i) => (
            <article key={i.id} className="rounded-panel border border-line bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link to={`/market/${i.listingId}`} className="line-clamp-1 text-[13px] font-medium text-forest hover:text-moss">
                    {i.listingTitle}
                  </Link>
                  <p className="mt-1 text-[10.5px] text-muted">
                    {i.sellerName} · <span className="num">{relTime(i.createdAt)}</span>
                  </p>
                </div>
                <Badge tone={i.status === 'replied' ? 'green' : i.status === 'closed' ? 'neutral' : 'amber'}>
                  {i.status === 'replied' ? '已回复' : i.status === 'closed' ? '已关闭' : '等待回复'}
                </Badge>
              </div>

              <div className="mt-3 grid gap-2 rounded-lg bg-sand/25 p-3 text-[11.5px] sm:grid-cols-3">
                <span className="num">
                  意向数量 <span className="text-forest">{i.quantity} {i.unit}</span>
                </span>
                <span className="num">
                  意向单价 <span className="text-forest">￥{fmtNumber(i.offerPrice)}</span>
                </span>
                <span className="num">
                  预计货值 <span className="text-forest">￥{fmtNumber(i.quantity * i.offerPrice)}</span>
                </span>
              </div>

              <p className="mt-2.5 rounded-lg border border-line/70 px-3 py-2 text-[11.5px] leading-relaxed text-ink/70">
                <MessageSquare size={11} className="mr-1 inline text-muted" />
                {i.message}
              </p>

              {i.reply ? (
                <div className="mt-2 rounded-lg border border-moss/20 bg-moss/[0.05] px-3 py-2">
                  <p className="flex items-center gap-1 text-[10px] font-medium text-moss">
                    <CheckCircle2 size={10} /> 对方回复
                  </p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-ink/75">{i.reply}</p>
                </div>
              ) : (
                <p className="mt-2 flex items-center gap-1.5 text-[10.5px] text-muted">
                  <Clock size={11} /> 等待对方回复，通常在 1 个工作日内响应
                </p>
              )}

              <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-3 text-[10.5px] text-muted">
                <span className="num">提交于 {fmtDate(i.createdAt, true)} · 联系 {i.contact.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')}</span>
                {i.status !== 'closed' && (
                  <button
                    onClick={() => {
                      close(i.id)
                      toast.info('询价已关闭')
                    }}
                    className="text-muted transition hover:text-[#A63E28]"
                  >
                    关闭询价
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

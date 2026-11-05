import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { UserEmpty, UserPageHeader } from './UserLayout'
import { Button } from '../../components/ui/Button'
import { useNotificationStore } from '../../store/userDataStore'
import { toast } from '../../store/uiStore'
import { cn, relTime } from '../../lib/utils'

const KIND_LABEL = {
  system: '系统通知',
  order: '订单',
  trade: '交易',
  booking: '预约',
  account: '账户',
}

export default function UserNotifications() {
  const items = useNotificationStore((s) => s.items)
  const markAllRead = useNotificationStore((s) => s.markAllRead)
  const markRead = useNotificationStore((s) => s.markRead)
  const remove = useNotificationStore((s) => s.remove)
  const navigate = useNavigate()
  const unread = items.filter((n) => !n.read).length

  return (
    <div>
      <UserPageHeader
        title="消息通知"
        description="订单、预约、交易与系统消息集中在这里。"
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              markAllRead()
              toast.success('已全部标记为已读')
            }}
            disabled={unread === 0}
            iconLeft={<CheckCheck size={13} />}
          >
            全部已读{unread ? `（${unread}）` : ''}
          </Button>
        }
      />

      {items.length === 0 ? (
        <UserEmpty title="暂无消息" description="有新的订单、预约或审核结果时，会在这里通知你。" />
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <article
              key={n.id}
              className={cn(
                'rounded-panel border p-4 transition',
                n.read ? 'border-line bg-white' : 'border-moss/25 bg-[#F1F5EE]',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  onClick={() => {
                    markRead(n.id)
                    if (n.link) navigate(n.link)
                  }}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded border border-line bg-white px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                      {KIND_LABEL[n.kind]}
                    </span>
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-clay" />}
                    <span className="num ml-auto text-[10px] text-muted">{relTime(n.createdAt)}</span>
                  </div>
                  <p className="mt-1.5 text-[13px] font-medium text-forest">{n.title}</p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{n.body}</p>
                </button>
                <button
                  onClick={() => remove(n.id)}
                  className="shrink-0 rounded p-1 text-muted/40 transition hover:text-[#A63E28]"
                  aria-label="删除消息"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="mt-4 flex items-center gap-1.5 text-[10.5px] text-muted">
        <Bell size={11} /> 消息保存在本机浏览器，最多保留最近 50 条（演示）。
      </p>
    </div>
  )
}

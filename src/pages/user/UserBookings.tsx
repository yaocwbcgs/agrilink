import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, MapPin, Star, Tractor, X } from 'lucide-react'
import { UserEmpty, UserPageHeader } from './UserLayout'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Textarea } from '../../components/ui/Form'
import { useBookingStore } from '../../store/businessStore'
import { toast } from '../../store/uiStore'
import { BOOKING_STATUS_LABEL } from '../../lib/constants'
import { cn, fmtDate, fmtNumber } from '../../lib/utils'
import type { BookingStatus } from '../../types'

const TONE: Record<BookingStatus, 'green' | 'amber' | 'neutral' | 'red' | 'sage'> = {
  pending: 'amber',
  confirmed: 'green',
  serving: 'sage',
  completed: 'neutral',
  cancelled: 'red',
}

const STEPS = ['提交预约', '机主确认', '进场作业', '完成评价']

export default function UserBookings() {
  const bookings = useBookingStore((s) => s.bookings)
  const setStatus = useBookingStore((s) => s.setStatus)
  const review = useBookingStore((s) => s.review)
  const [reviewId, setReviewId] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')

  const current = bookings.find((b) => b.id === reviewId)

  return (
    <div>
      <UserPageHeader
        title="我的农机预约"
        description="跟踪作业订单状态，作业完成后可对机手与服务做出评价。"
        action={
          <Link to="/machinery" className="text-[12px] text-moss hover:text-forest">
            继续找农机 →
          </Link>
        }
      />

      {bookings.length === 0 ? (
        <UserEmpty
          title="还没有农机预约"
          description="在农机服务中选择设备并填写作业面积与时间，即可生成预约订单。"
          action={
            <Link to="/machinery" className="rounded-lg bg-forest px-4 py-2 text-[12px] text-cream">
              去找农机
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const stepIndex =
              b.status === 'pending' ? 0 : b.status === 'confirmed' ? 1 : b.status === 'serving' ? 2 : b.status === 'completed' ? 3 : 0
            return (
              <article key={b.id} className="rounded-panel border border-line bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sand text-moss">
                      <Tractor size={16} />
                    </span>
                    <div>
                      <p className="text-[13px] font-medium text-forest">{b.machineryName}</p>
                      <p className="num mt-0.5 text-[10.5px] text-muted">
                        订单 {b.id} · {fmtDate(b.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge tone={TONE[b.status]}>{BOOKING_STATUS_LABEL[b.status]}</Badge>
                </div>

                <div className="mt-3 grid gap-2 rounded-lg bg-sand/25 p-3 text-[11.5px] text-ink/75 sm:grid-cols-4">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={11} className="text-moss" /> {b.date}
                  </span>
                  <span className="num">{b.area} 亩</span>
                  <span className="flex items-center gap-1.5 truncate">
                    <MapPin size={11} className="shrink-0 text-moss" />
                    <span className="truncate">{b.location}</span>
                  </span>
                  <span className="num text-forest">￥{fmtNumber(b.amount)}</span>
                </div>

                {b.status !== 'cancelled' && (
                  <div className="mt-3 flex items-center gap-1.5">
                    {STEPS.map((s, i) => (
                      <div key={s} className="flex flex-1 items-center gap-1.5">
                        <span
                          className={cn(
                            'flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px]',
                            i <= stepIndex ? 'bg-moss text-white' : 'bg-sand text-muted',
                          )}
                        >
                          {i + 1}
                        </span>
                        <span className={cn('hidden text-[10px] sm:inline', i <= stepIndex ? 'text-forest' : 'text-muted')}>
                          {s}
                        </span>
                        {i < STEPS.length - 1 && (
                          <span className={cn('h-px flex-1', i < stepIndex ? 'bg-moss/50' : 'bg-line')} />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line/60 pt-3">
                  <span className="text-[10.5px] text-muted">作业类型：{b.workType} · 联系：{b.phone}</span>
                  <div className="ml-auto flex gap-2">
                    {(b.status === 'pending' || b.status === 'confirmed') && (
                      <button
                        onClick={() => {
                          setStatus(b.id, 'cancelled')
                          toast.info('预约已取消', '若已产生转场安排，建议同步告知机手')
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[11px] text-muted transition hover:border-[#EBC4B9] hover:text-[#A63E28]"
                      >
                        <X size={11} /> 取消预约
                      </button>
                    )}
                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          setStatus(b.id, 'serving')
                          toast.success('已标记为作业中')
                        }}
                        className="rounded-lg border border-line px-2.5 py-1.5 text-[11px] text-forest transition hover:border-moss/50"
                      >
                        标记开始作业
                      </button>
                    )}
                    {b.status === 'serving' && (
                      <button
                        onClick={() => {
                          setStatus(b.id, 'completed')
                          toast.success('作业已完成', '可以给机手一个评价了')
                        }}
                        className="rounded-lg border border-forest bg-forest px-2.5 py-1.5 text-[11px] text-cream"
                      >
                        确认完成
                      </button>
                    )}
                    {b.status === 'completed' && (
                      <button
                        onClick={() => {
                          setReviewId(b.id)
                          setRating(b.rating ?? 5)
                          setText(b.review ?? '')
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[11px] text-forest transition hover:border-moss/50"
                      >
                        <Star size={11} /> {b.rating ? '修改评价' : '去评价'}
                      </button>
                    )}
                  </div>
                </div>

                {b.review && (
                  <p className="mt-2 rounded-lg bg-moss/[0.05] px-3 py-2 text-[11px] leading-relaxed text-ink/70">
                    <span className="mr-1.5 text-clay">★ {b.rating}</span>
                    {b.review}
                  </p>
                )}
              </article>
            )
          })}
        </div>
      )}

      <Modal
        open={!!reviewId}
        onClose={() => setReviewId(null)}
        title="评价本次作业"
        description={current?.machineryName}
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setReviewId(null)}>
              取消
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (!reviewId) return
                if (text.trim().length < 5) {
                  toast.error('请填写至少 5 个字的评价')
                  return
                }
                review(reviewId, rating, text.trim())
                setReviewId(null)
                setText('')
                toast.success('评价已提交', '感谢你的反馈')
              }}
            >
              提交评价
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="text-[12.5px] font-medium text-forest">作业质量</p>
            <div className="mt-2 flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  aria-label={`${n} 星`}
                  className="p-0.5"
                >
                  <Star
                    size={24}
                    className={n <= rating ? 'text-clay' : 'text-line'}
                    fill={n <= rating ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
              <span className="num ml-2 text-[13px] text-forest">{rating}.0</span>
            </div>
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 200))}
            placeholder="作业是否准时、质量如何、机手沟通是否顺畅？"
            className="min-h-[100px]"
          />
          <p className="text-[10.5px] text-muted">评价将展示在农机详情页，帮助其他用户判断。</p>
        </div>
      </Modal>
    </div>
  )
}

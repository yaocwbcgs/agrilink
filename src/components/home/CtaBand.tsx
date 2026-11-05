import { Link } from 'react-router-dom'
import { ArrowRight, Phone, ScanLine, Upload } from 'lucide-react'
import { IMG } from '../../data/images'
import { SmartImage } from '../ui/SmartImage'
import { Reveal } from '../ui/Reveal'
import { BRAND } from '../../lib/constants'

export function CtaBand() {
  return (
    <section className="shell pb-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-[26px] bg-forest text-cream">
          <SmartImage
            src={IMG.plantingHands}
            alt="育苗移栽作业"
            className="absolute inset-0 h-full w-full"
            imgClassName="opacity-25"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-950/85 to-forest-950/40" />
          <div className="relative grid gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:py-14">
            <div>
              <p className="eyebrow text-cream/45">08 — 现在开始</p>
              <h2 className="mt-3 max-w-xl text-[26px] font-semibold leading-tight text-cream sm:text-[32px]">
                把第一张叶片照片传上来，
                <br className="hidden sm:block" />
                从一次真实的诊断开始。
              </h2>
              <p className="mt-4 max-w-lg text-[13px] leading-relaxed text-cream/55">
                不需要注册也能体验识别与行情查询。发布供需、预约农机与管理订单时，登录后数据会保存在你的账户中。
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  to="/disease"
                  className="inline-flex items-center gap-2 rounded-xl bg-cream px-5 py-3 text-[13.5px] font-medium text-forest transition hover:bg-white"
                >
                  <ScanLine size={16} /> 上传图片识别
                </Link>
                <Link
                  to="/market/publish"
                  className="inline-flex items-center gap-2 rounded-xl border border-cream/25 px-5 py-3 text-[13.5px] font-medium text-cream transition hover:bg-cream/10"
                >
                  <Upload size={15} /> 发布供需信息
                </Link>
                <a
                  href={`tel:${BRAND.phone}`}
                  className="inline-flex items-center gap-1.5 px-2 text-[12.5px] text-cream/60 transition hover:text-cream"
                >
                  <Phone size={13} /> {BRAND.phone}
                </a>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { k: '识别服务', v: '30 秒内返回', d: '模拟模型 · 可替换' },
                { k: '行情覆盖', v: '8 个品种', d: '4 个时间周期' },
                { k: '服务范围', v: '全国 24 省', d: '按区域筛选' },
              ].map((item) => (
                <div
                  key={item.k}
                  className="rounded-xl border border-cream/12 bg-cream/[0.04] px-4 py-3 backdrop-blur-sm"
                >
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-cream/35">{item.k}</p>
                  <p className="mt-1 text-[14px] font-medium text-cream">{item.v}</p>
                  <p className="mt-0.5 text-[10.5px] text-cream/40">{item.d}</p>
                </div>
              ))}
              <Link
                to="/news"
                className="group flex items-center justify-between rounded-xl border border-cream/12 px-4 py-3 text-[12px] text-cream/70 transition hover:bg-cream/[0.06]"
              >
                查看平台使用指南
                <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  CircleDot,
  CloudUpload,
  FileImage,
  ImageUp,
  Info,
  Leaf,
  Loader2,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { PageHero } from '../components/ui/Layout'
import { DemoTag, Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Field } from '../components/ui/Form'
import { RiskBadge } from '../components/ui/Indicators'
import { Tabs } from '../components/ui/Tabs'
import { Reveal } from '../components/ui/Reveal'
import { CROP_OPTIONS } from '../lib/constants'
import { AI_CONFIG, recognizeCropImage } from '../services/recognition'
import { normalizedError } from '../services/client'
import { cn, fmtDate, readFileAsDataURL, validateImage } from '../lib/utils'
import type { CropKey, RecognitionResult } from '../types'
import { toast } from '../store/uiStore'
import { useFavoriteStore } from '../store/userDataStore'
import { DISEASE_MAP } from '../data/diseases'

const TIPS = [
  '选择病斑清晰、光照均匀的叶片或果实局部，避免逆光与模糊',
  '单张照片尽量只拍一处典型症状，不要多片叶混拍',
  '保留少量健康组织作为对照，有助于判断病害边界',
  '拍摄时关闭美颜与滤镜，原图上传识别更准确',
]

const STEPS = [
  { t: '上传图片', d: '拖拽或选择 JPG / PNG / WEBP，单张不超过 8MB' },
  { t: '选择作物', d: '指定作物类型可缩小候选范围，提高结果相关性' },
  { t: '获取方案', d: '得到风险等级、成因、传播特点与四类防控建议' },
]

const PLAN_META = [
  { key: 'agricultural', label: '农业防治', en: 'CULTIVATION', tone: 'from-[#EAF1E7] to-[#DDE9D9]', ink: '#2C6450' },
  { key: 'physical', label: '物理防治', en: 'PHYSICAL', tone: 'from-[#F3EFE3] to-[#E8E1CE]', ink: '#7A6432' },
  { key: 'biological', label: '生物防治', en: 'BIOLOGICAL', tone: 'from-[#E7F0EA] to-[#D6E7DC]', ink: '#2F6350' },
  { key: 'chemical', label: '化学防治参考', en: 'CHEMICAL', tone: 'from-[#F6EDE4] to-[#EDDFD0]', ink: '#8A5A2E' },
  { key: 'prevention', label: '预防建议', en: 'PREVENTION', tone: 'from-[#E9EEF0] to-[#DCE5E8]', ink: '#3E5E66' },
  { key: 'followUp', label: '后续管理', en: 'FOLLOW-UP', tone: 'from-[#EFEDE6] to-[#E3DFD3]', ink: '#5C6152' },
] as const

export default function DiseaseIdentify() {
  const [file, setFile] = useState<File | null>(null)
  const [dataUrl, setDataUrl] = useState<string>('')
  const [crop, setCrop] = useState<CropKey>('wheat')
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [result, setResult] = useState<RecognitionResult | null>(null)
  const [tab, setTab] = useState('plan')
  const inputRef = useRef<HTMLInputElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const toggleFav = useFavoriteStore((s) => s.toggle)

  const handleFile = useCallback(async (next: File) => {
    const invalid = validateImage(next)
    if (invalid) {
      setUploadError(invalid)
      toast.error('图片不符合要求', invalid)
      return
    }
    setUploadError('')
    setError('')
    setFile(next)
    try {
      const url = await readFileAsDataURL(next)
      setDataUrl(url)
    } catch {
      setUploadError('图片读取失败，请重试')
    }
  }, [])

  const reset = () => {
    setFile(null)
    setDataUrl('')
    setResult(null)
    setError('')
    setUploadError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const run = async () => {
    if (!file || !dataUrl) {
      setUploadError('请先上传一张作物照片')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await recognizeCropImage({ file, dataUrl, crop })
      setResult(res)
      setTab('plan')
      toast.success('识别完成', `${res.diseaseName} · 置信度 ${(res.confidence * 100).toFixed(1)}%（模拟识别）`)
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120)
    } catch (err) {
      setError(normalizedError(err))
    } finally {
      setLoading(false)
    }
  }

  const disease = result ? DISEASE_MAP.get(result.diseaseId) : undefined

  return (
    <>
      <PageHero
        eyebrow="AI Diagnosis · 病虫害智能识别"
        title="上传一张叶片照片，先判断风险再决定用药"
        description="图片识别结合作物类型，给出疑似病虫害、置信度、危害程度与分阶段防控建议。当前为演示环境的模拟识别服务，接入真实模型后调用方式不变。"
        breadcrumb={[{ label: '病虫害识别' }]}
        action={
          <div className="flex flex-col items-start gap-2 lg:items-end">
            <DemoTag />
            <Link
              to="/disease/library"
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-line bg-white px-3.5 py-2 text-[12.5px] font-medium text-forest transition hover:border-moss/50"
            >
              浏览病虫害知识库 <ArrowRight size={13} />
            </Link>
          </div>
        }
      />

      <section className="shell py-10 lg:py-14">
        <div className="grid gap-5 lg:grid-cols-12">
          {/* 上传区 */}
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-panel border border-line bg-white shadow-card">
              <div className="flex items-center justify-between border-b border-line/70 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-moss/10 text-moss">
                    <ImageUp size={15} />
                  </span>
                  <div>
                    <h2 className="text-[14px] font-semibold text-forest">上传识别图片</h2>
                    <p className="text-[11px] text-muted">支持 JPG / PNG / WEBP，单张 ≤ 8MB</p>
                  </div>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Step 01</span>
              </div>

              <div className="p-5">
                {!dataUrl ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragging(true)
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setDragging(false)
                      const f = e.dataTransfer.files?.[0]
                      if (f) void handleFile(f)
                    }}
                    onClick={() => inputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
                    }}
                    className={cn(
                      'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 text-center transition-all duration-300',
                      dragging
                        ? 'border-moss bg-moss/[0.06]'
                        : 'border-line bg-sand/20 hover:border-moss/50 hover:bg-sand/40',
                    )}
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-line bg-white text-moss shadow-sm">
                      <CloudUpload size={22} strokeWidth={1.5} />
                    </span>
                    <p className="mt-4 text-[14px] font-medium text-forest">拖拽图片到此处，或点击选择文件</p>
                    <p className="mt-1.5 text-[12px] text-muted">建议近距离拍摄单一病斑，光线均匀、对焦清晰</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-[12px] text-forest">
                      <FileImage size={13} /> 选择本地图片
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative overflow-hidden rounded-xl border border-line bg-sand/30">
                      <img src={dataUrl} alt="待识别图片预览" className="h-[300px] w-full object-cover" />
                      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-forest/85 px-2.5 py-1 text-[10px] text-cream backdrop-blur">
                        <CheckCircle2 size={11} /> 已就绪
                      </div>
                      <div className="absolute right-3 top-3 flex gap-1.5">
                        <button
                          onClick={() => inputRef.current?.click()}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-forest shadow-sm transition hover:bg-white"
                          aria-label="重新选择图片"
                        >
                          <RefreshCw size={14} />
                        </button>
                        <button
                          onClick={reset}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#A63E28] shadow-sm transition hover:bg-white"
                          aria-label="删除图片"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-forest-950/80 to-transparent px-3 pb-2.5 pt-8 text-[10.5px] text-cream/85">
                        <span className="truncate">{file?.name}</span>
                        <span className="num shrink-0">{file ? (file.size / 1024 / 1024).toFixed(2) : 0} MB</span>
                      </div>
                    </div>
                    <p className="text-[11.5px] text-muted">
                      若图片方向不正或模糊，建议重新拍摄后上传，识别准确度会明显提升。
                    </p>
                  </div>
                )}

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) void handleFile(f)
                  }}
                />

                {uploadError && (
                  <p className="mt-3 flex items-center gap-1.5 rounded-lg border border-[#EBC4B9] bg-[#F8E4DF] px-3 py-2 text-[12px] text-[#A63E28]">
                    <AlertTriangle size={13} /> {uploadError}
                  </p>
                )}

                <div className="mt-6">
                  <Field label="作物类型" required hint="选择作物后，识别范围会限定在该作物的常见病虫害中">
                    <div className="flex flex-wrap gap-2">
                      {CROP_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setCrop(opt.value)}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[12.5px] transition',
                            crop === opt.value
                              ? 'border-forest bg-forest text-cream'
                              : 'border-line bg-white text-ink/70 hover:border-moss/50 hover:text-forest',
                          )}
                        >
                          <Leaf size={12} className={crop === opt.value ? 'text-sage' : 'text-moss/60'} />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button
                    onClick={run}
                    loading={loading}
                    size="lg"
                    className="min-w-[168px]"
                    iconLeft={!loading ? <ScanLine size={16} /> : undefined}
                  >
                    {loading ? '正在识别…' : '开始识别'}
                  </Button>
                  {file && (
                    <Button variant="ghost" size="lg" onClick={reset}>
                      清空重来
                    </Button>
                  )}
                  <span className="text-[11.5px] text-muted">
                    预计耗时 {Math.round(AI_CONFIG.mockLatencyMs / 100) / 10} 秒 · 模拟服务
                  </span>
                </div>

                {loading && (
                  <div className="mt-5 overflow-hidden rounded-xl border border-moss/20 bg-moss/[0.04] p-4">
                    <div className="flex items-center gap-2 text-[12.5px] text-moss">
                      <Loader2 size={14} className="animate-spin" />
                      正在提取病斑特征并与知识库比对…
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-moss/10">
                      <div className="h-full w-1/3 animate-[shimmer_1.4s_linear_infinite] rounded-full bg-gradient-to-r from-transparent via-moss to-transparent" />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {['图像预处理', '病斑区域定位', '候选病害比对', '生成防控建议'].map((s, i) => (
                        <span key={s} className="rounded border border-moss/20 bg-white/60 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wide text-moss/70">
                          {String(i + 1).padStart(2, '0')} {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-[#EBC4B9] bg-[#F8E4DF] px-4 py-3">
                    <p className="flex items-start gap-2 text-[12.5px] text-[#A63E28]">
                      <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                      识别失败：{error}
                    </p>
                    <button onClick={run} className="shrink-0 text-[12px] font-medium text-[#A63E28] underline">
                      重试
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 说明区 */}
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-panel border border-line bg-white p-5 shadow-card">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-forest">识别流程</h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">How it works</span>
              </div>
              <ol className="mt-4 space-y-4">
                {STEPS.map((s, i) => (
                  <li key={s.t} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-moss/25 bg-moss/[0.07] font-mono text-[10px] text-moss">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-[13px] font-medium text-forest">{s.t}</p>
                      <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-panel border border-line bg-sand/40 p-5">
              <div className="flex items-center gap-2">
                <Camera size={15} className="text-moss" />
                <h3 className="text-[14px] font-semibold text-forest">拍摄建议</h3>
              </div>
              <ul className="mt-3.5 space-y-2.5">
                {TIPS.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-[12px] leading-relaxed text-ink/70">
                    <CircleDot size={11} className="mt-1 shrink-0 text-moss/50" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-panel border border-clay/25 bg-clay/[0.06] p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-[#9A6420]" />
                <h3 className="text-[13.5px] font-semibold text-[#7C5320]">关于结果可信度</h3>
              </div>
              <p className="mt-2.5 text-[12px] leading-relaxed text-[#7C5320]/85">
                演示环境使用<strong className="font-semibold">模拟识别服务</strong>，结果由作物类型与图片特征映射生成，<strong className="font-semibold">不代表真实诊断结论</strong>。
                生产环境接入图像模型后，页面会显示真实模型版本与置信度。用药前请咨询当地植保部门。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 结果区 */}
      {result && (
        <section ref={resultRef} className="border-t border-line/70 bg-sand/25 py-12 lg:py-16">
          <div className="shell">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">Recognition Result</p>
                <h2 className="mt-2 text-section font-semibold text-forest">识别结果与防控方案</h2>
                <p className="mt-2 text-[12.5px] text-muted">
                  任务编号 <span className="num">{result.taskId}</span> · {fmtDate(result.createdAt, true)} · 耗时{' '}
                  {(result.elapsedMs / 1000).toFixed(1)}s
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-clay/40 bg-clay/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[#94601F]">
                  <Sparkles size={11} /> 模拟识别 · {result.modelVersion}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const added = toggleFav({
                      type: 'article',
                      id: `diag-${result.taskId}`,
                      title: `${result.cropLabel} · ${result.diseaseName}`,
                      subtitle: `识别结果 置信度 ${(result.confidence * 100).toFixed(1)}%`,
                      meta: fmtDate(result.createdAt),
                    })
                    toast[added ? 'success' : 'info'](added ? '已收藏诊断结果' : '已取消收藏')
                  }}
                >
                  收藏结果
                </Button>
                <Button variant="ghost" size="sm" onClick={reset} iconLeft={<RefreshCw size={13} />}>
                  重新识别
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-12">
              {/* 结论卡 */}
              <div className="lg:col-span-4">
                <div className="overflow-hidden rounded-panel border border-line bg-white shadow-card">
                  <div className="relative">
                    <img src={result.imagePreview} alt="识别图片" className="h-44 w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-950/70 to-transparent" />
                    <div className="absolute inset-x-4 bottom-3 flex items-center justify-between">
                      <span className="rounded-full border border-cream/25 bg-cream/15 px-2 py-0.5 text-[10px] text-cream backdrop-blur">
                        {result.kind === 'disease' ? '病害' : '虫害'}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-cream/70">
                        {result.cropLabel}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">疑似病虫害</p>
                    <h3 className="mt-1.5 text-[24px] font-semibold leading-tight text-forest">{result.diseaseName}</h3>
                    {disease?.alias && <p className="mt-1 text-[12px] text-muted">俗称：{disease.alias}</p>}

                    <div className="mt-5 flex items-center justify-between rounded-xl border border-line bg-sand/30 px-4 py-3">
                      <div>
                        <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">识别置信度</p>
                        <p className="num mt-1 text-[22px] font-semibold text-forest">
                          {(result.confidence * 100).toFixed(1)}
                          <span className="ml-0.5 text-[12px] font-normal text-muted">%</span>
                        </p>
                      </div>
                      <ConfidenceRing value={result.confidence} />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[12px] text-muted">危害程度</span>
                      <RiskBadge level={result.severity} />
                    </div>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-[12px] text-muted">高发时期</span>
                      <span className="text-[12px] text-ink/80">{disease?.season ?? '—'}</span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-[12px] text-muted">潜在产量损失</span>
                      <span className="text-[12px] text-ink/80">{disease?.yieldLoss ?? '—'}</span>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <Link
                        to={`/disease/library/${result.diseaseId}`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-forest bg-forest py-2.5 text-[12.5px] font-medium text-cream transition hover:bg-forest-950"
                      >
                        查看完整知识条目
                      </Link>
                      <Link
                        to="/machinery"
                        className="flex items-center justify-center rounded-[10px] border border-line px-3 text-[12.5px] text-forest transition hover:border-moss/50"
                      >
                        约飞防
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* 详情 */}
              <div className="lg:col-span-8">
                <div className="overflow-hidden rounded-panel border border-line bg-white shadow-card">
                  <div className="px-5 pt-5">
                    <Tabs
                      value={tab}
                      onChange={setTab}
                      items={[
                        { value: 'symptom', label: '症状与成因' },
                        { value: 'plan', label: '防控方案' },
                        { value: 'chemical', label: '用药参考' },
                      ]}
                    />
                  </div>

                  <div className="p-5">
                    {tab === 'symptom' && (
                      <div className="grid gap-5 sm:grid-cols-2">
                        <InfoBlock title="典型症状" items={result.symptoms} icon={<Info size={13} />} />
                        <InfoBlock title="发生原因" items={result.causes} icon={<CircleDot size={13} />} />
                        <InfoBlock title="传播特点" items={result.spread} icon={<ArrowRight size={13} />} />
                        <div className="rounded-xl border border-line bg-sand/25 p-4">
                          <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">病原 / 虫源</p>
                          <p className="mt-2 text-[12.5px] leading-relaxed text-ink/80">
                            {disease?.pathogen ?? '以知识库记录为准'}
                          </p>
                          <p className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">风险标签</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {(disease?.tags ?? []).map((t) => (
                              <Badge key={t} tone="sage">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {tab === 'plan' && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {PLAN_META.map((meta) => (
                          <div key={meta.key} className="rounded-xl border border-line p-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn('flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br', meta.tone)}
                                style={{ color: meta.ink }}
                              >
                                <Leaf size={13} />
                              </span>
                              <div>
                                <p className="text-[12.5px] font-medium text-forest">{meta.label}</p>
                                <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-muted/60">{meta.en}</p>
                              </div>
                            </div>
                            <ul className="mt-3 space-y-1.5">
                              {result.plan[meta.key].map((item) => (
                                <li key={item} className="flex items-start gap-1.5 text-[11.5px] leading-relaxed text-ink/75">
                                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-moss/50" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {tab === 'chemical' && (
                      <div>
                        <div className="mb-4 flex items-start gap-2 rounded-xl border border-clay/30 bg-clay/[0.07] px-3.5 py-2.5 text-[11.5px] leading-relaxed text-[#7C5320]">
                          <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                          以下仅为有效成分类别参考，不含剂量。实际用药必须核对当地农药登记标签、防治对象、施药次数与安全间隔期，并遵守农产品质量安全规定。
                        </div>
                        <div className="overflow-hidden rounded-xl border border-line">
                          <div className="hidden grid-cols-[1.2fr_1fr_1fr_1.4fr] gap-3 bg-sand/40 px-4 py-2.5 text-[10px] uppercase tracking-[0.1em] text-muted sm:grid">
                            <span>参考药剂</span>
                            <span>有效成分</span>
                            <span>防治对象</span>
                            <span>使用提示</span>
                          </div>
                          {result.pesticides.map((p) => (
                            <div
                              key={p.name}
                              className="grid gap-1 border-t border-line/70 px-4 py-3 text-[11.5px] sm:grid-cols-[1.2fr_1fr_1fr_1.4fr] sm:gap-3"
                            >
                              <span className="font-medium text-forest">{p.name}</span>
                              <span className="text-ink/70">{p.activeIngredient}</span>
                              <span className="text-ink/70">{p.target}</span>
                              <span className="text-muted">{p.note}</span>
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 text-[11px] leading-relaxed text-muted">
                          数据来源：公开农药登记信息与植保技术资料整理；平台不对具体用药方案承担责任。
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-panel border border-line bg-white px-5 py-4">
                  <p className="text-[12px] text-muted">
                    需要更精确的判断？可将照片与田块信息发送给当地农技人员复核。
                  </p>
                  <div className="flex gap-2">
                    <Link
                      to="/disease/library"
                      className="rounded-lg border border-line px-3 py-1.5 text-[12px] text-forest transition hover:border-moss/50"
                    >
                      对比相似病害
                    </Link>
                    <Link
                      to="/news?category=pest"
                      className="rounded-lg border border-forest bg-forest px-3 py-1.5 text-[12px] text-cream transition hover:bg-forest-950"
                    >
                      阅读防控技术
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {!result && (
        <section className="shell pb-16">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-4 rounded-panel border border-line bg-white px-6 py-5 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-moss/10 text-moss">
                  <Leaf size={16} />
                </span>
                <div>
                  <p className="text-[13.5px] font-medium text-forest">还没有识别结果？可以先查知识库</p>
                  <p className="mt-0.5 text-[12px] text-muted">
                    14 类常见病虫害，支持按作物、类型与症状检索，包含完整防控方案。
                  </p>
                </div>
              </div>
              <Link
                to="/disease/library"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-[10px] border border-forest bg-forest px-4 py-2.5 text-[12.5px] font-medium text-cream transition hover:bg-forest-950"
              >
                进入知识库 <ArrowRight size={13} />
              </Link>
            </div>
          </Reveal>
        </section>
      )}
    </>
  )
}

function ConfidenceRing({ value }: { value: number }) {
  const r = 26
  const c = 2 * Math.PI * r
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0">
      <circle cx="32" cy="32" r={r} fill="none" stroke="#EDEADF" strokeWidth="6" />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke="#34745B"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${c * value} ${c}`}
        transform="rotate(-90 32 32)"
      />
      <text x="32" y="36" textAnchor="middle" className="num" fontSize="12" fill="#173D32" fontWeight="600">
        {Math.round(value * 100)}%
      </text>
    </svg>
  )
}

function InfoBlock({ title, items, icon }: { title: string; items: string[]; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-sand/20 p-4">
      <p className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">
        {icon}
        {title}
      </p>
      <ul className="mt-2.5 space-y-2">
        {items.map((t) => (
          <li key={t} className="flex items-start gap-1.5 text-[11.5px] leading-relaxed text-ink/75">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-moss/50" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  )
}

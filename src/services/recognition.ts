import type { CropKey, Disease, RecognitionResult } from '../types'
import { CROP_LABEL } from '../lib/constants'
import { DISEASES } from '../data/diseases'
import { ApiError, mockRequest } from './client'
import { hashString, mulberry32 } from '../lib/utils'

/**
 * AI 病虫害识别服务
 * ---------------------------------------------------------------
 * 当前演示环境使用 MOCK provider，结果会在 UI 上明确标注“模拟识别”。
 * 接入真实模型时：
 *   1. 配置 VITE_AI_ENDPOINT=https://your-model-gateway/api/ai/recognize
 *   2. 后端接受 multipart/form-data：image(File) + crop(string)
 *   3. 返回 RecognitionResult 结构（见下），或提供适配层转换
 * 前端调用方式与真实环境完全一致，无需改动页面代码。
 */

export const AI_CONFIG = {
  endpoint: (import.meta.env.VITE_AI_ENDPOINT as string | undefined) ?? '',
  enabled: Boolean(import.meta.env.VITE_AI_ENDPOINT),
  provider: 'agrilink-mock',
  modelVersion: 'mock-v0.1.0',
  /** 平均推理耗时（毫秒），仅用于模拟 */
  mockLatencyMs: 1800,
} as const

export interface RecognizeInput {
  file: File
  dataUrl: string
  crop: CropKey
}

export interface RecognitionProvider {
  readonly name: string
  readonly modelVersion: string
  readonly simulated: boolean
  recognize: (input: RecognizeInput) => Promise<RecognitionResult>
}

function pickDisease(crop: CropKey, seed: number): Disease {
  const pool = DISEASES.filter((d) => d.crop === crop)
  const candidates = pool.length ? pool : DISEASES.filter((d) => d.crop === 'vegetable')
  const rand = mulberry32(seed)
  return candidates[Math.floor(rand() * candidates.length)]
}

const mockProvider: RecognitionProvider = {
  name: '演示模拟识别服务（未接入真实模型）',
  modelVersion: AI_CONFIG.modelVersion,
  simulated: true,
  recognize: async ({ file, dataUrl, crop }) => {
    const seed = hashString(`${file.name}-${file.size}-${crop}`)
    const disease = pickDisease(crop, seed)
    const rand = mulberry32(seed + 17)
    const confidence = Number((0.82 + rand() * 0.14).toFixed(3))
    const startedAt = performance.now()

    return mockRequest(
      '智能识别',
      () => ({
        taskId: `task_${seed.toString(36)}`,
        crop,
        cropLabel: CROP_LABEL[crop],
        diseaseId: disease.id,
        diseaseName: disease.name,
        kind: disease.kind,
        confidence,
        severity: disease.severity,
        symptoms: disease.symptoms,
        causes: disease.causes,
        spread: disease.spread,
        plan: disease.plan,
        pesticides: disease.pesticides,
        simulated: true as const,
        provider: mockProvider.name,
        modelVersion: mockProvider.modelVersion,
        elapsedMs: Math.round(performance.now() - startedAt) + AI_CONFIG.mockLatencyMs,
        createdAt: new Date().toISOString(),
        imagePreview: dataUrl,
      }),
      { latency: [1400, 2400] },
    )
  },
}

const remoteProvider: RecognitionProvider = {
  name: '远程识别模型',
  modelVersion: 'remote',
  simulated: false,
  recognize: async ({ file, crop }) => {
    const form = new FormData()
    form.append('image', file)
    form.append('crop', crop)
    const res = await fetch(AI_CONFIG.endpoint, { method: 'POST', body: form })
    if (!res.ok) throw new ApiError('识别服务返回异常，请稍后重试', 'AI_ERROR', res.status)
    return (await res.json()) as RecognitionResult
  },
}

export const recognitionService = AI_CONFIG.enabled ? remoteProvider : mockProvider

export async function recognizeCropImage(input: RecognizeInput) {
  return recognitionService.recognize(input)
}

/** 供后端对齐的请求/响应说明（也用于开发者面板展示） */
export const AI_API_CONTRACT = {
  method: 'POST',
  contentType: 'multipart/form-data',
  fields: ['image: File(jpg/png/webp, <=8MB)', 'crop: wheat|corn|rice|soybean|fruit|vegetable|other'],
  response: [
    'taskId',
    'cropLabel',
    'diseaseName',
    'kind: disease|pest',
    'confidence: 0-1',
    'severity: low|medium|high',
    'symptoms[] / causes[] / spread[]',
    'plan{ agricultural, physical, biological, chemical, prevention, followUp }',
    'pesticides[{ name, activeIngredient, target, note }]',
    'simulated: boolean（真实模型必须返回 false）',
  ],
} as const

/**
 * 统一 API 客户端
 * ---------------------------------------------------------------
 * 演示环境（无 VITE_API_BASE_URL）下所有请求走本地 Mock，带网络延迟与失败重试语义；
 * 配置 VITE_API_BASE_URL 后自动切换为真实 REST 请求，业务层无需修改。
 *
 * 预留的真实接口（后端按此实现即可对接）：
 *   GET    /api/diseases?crop=&kind=&q=
 *   GET    /api/diseases/:id
 *   POST   /api/ai/recognize            （multipart: image, crop）
 *   GET    /api/listings?type=&category=&region=&page=
 *   POST   /api/listings
 *   POST   /api/listings/:id/inquiries
 *   GET    /api/machinery?category=&region=
 *   POST   /api/bookings
 *   GET    /api/products?category=
 *   POST   /api/orders
 *   GET    /api/prices/:symbol?range=&market=
 *   GET    /api/news?category=&q=
 *   POST   /api/auth/login
 */

export const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''
export const USE_MOCK_API = API_BASE.length === 0

export class ApiError extends Error {
  code: string
  status: number
  constructor(message: string, code = 'UNKNOWN', status = 500) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

export interface RequestOptions {
  /** 模拟延迟区间（毫秒） */
  latency?: [number, number]
  /** 模拟失败概率，仅演示环境生效 */
  failRate?: number
  signal?: AbortSignal
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (USE_MOCK_API) {
    throw new ApiError('Mock 模式下请使用 mockRequest', 'MOCK_ONLY', 500)
  }
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(body?.message ?? '请求失败，请稍后重试', body?.code ?? 'HTTP_ERROR', res.status)
  }
  return (await res.json()) as T
}

/** 模拟一次服务端调用：统一延迟、可注入失败率、可取消 */
export function mockRequest<T>(
  label: string,
  resolver: () => T | Promise<T>,
  options: RequestOptions = {},
): Promise<T> {
  const [min, max] = options.latency ?? [240, 620]
  const delay = Math.round(min + Math.random() * (max - min))
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(async () => {
      try {
        if (options.failRate && Math.random() < options.failRate) {
          throw new ApiError(`${label} 服务暂时不可用`, 'SERVICE_UNAVAILABLE', 503)
        }
        resolve(await resolver())
      } catch (err) {
        reject(err instanceof ApiError ? err : new ApiError(`${label} 处理失败`, 'INTERNAL', 500))
      }
    }, delay)
    options.signal?.addEventListener('abort', () => {
      window.clearTimeout(timer)
      reject(new ApiError('请求已取消', 'ABORTED', 499))
    })
  })
}

export function normalizedError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 499) return '请求已取消'
    if (err.status >= 500) return '服务暂时不可用，请稍后重试'
    return err.message
  }
  if (err instanceof Error) return err.message
  return '发生未知错误，请重试'
}

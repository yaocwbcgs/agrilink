import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 生产环境可在此上报监控平台
    console.error('[AgriLink] render error', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#EBC4B9] bg-[#F8E4DF] text-[#A63E28]">
            <AlertTriangle size={24} />
          </span>
          <h1 className="mt-5 text-[22px] font-semibold text-forest">页面遇到了一点问题</h1>
          <p className="mt-2 max-w-md text-[12.5px] leading-relaxed text-muted">
            渲染过程中出现异常，你可以刷新页面重试。若问题持续，请清空本地演示数据后重新进入。
          </p>
          <p className="mt-2 max-w-md font-mono text-[10px] text-muted/60">{this.state.message}</p>
          <div className="mt-5 flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-forest bg-forest px-4 py-2.5 text-[12.5px] text-cream"
            >
              <RotateCw size={13} /> 刷新页面
            </button>
            <a
              href="/"
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-line bg-white px-4 py-2.5 text-[12.5px] text-forest"
            >
              回到首页
            </a>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

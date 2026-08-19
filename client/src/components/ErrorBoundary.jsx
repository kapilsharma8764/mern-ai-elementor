import React from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

/* ------------------------------------------------------------------ *
 * Error se poori app na mare.
 * - App ke around: error screen + "Try again" / "Start fresh"
 * - Har section ke around (compact): sirf wahi section red box dikhata
 *   hai, baaki page chalta rehta hai — jaise Elementor karta hai.
 * ------------------------------------------------------------------ */

export default class ErrorBoundary extends React.Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // console me poora detail — debugging ke liye
    console.error('[builder error]', this.props.label || '', error, info?.componentStack)
    this.props.onError?.(error, info)
  }

  reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    // section-level — chhota red box, baaki page chalta rahe
    if (this.props.compact) {
      return (
        <div className="m-3 rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-[13px] font-semibold text-rose-200">
            <AlertTriangle size={15} />
            {this.props.label || 'Is section me problem aa gayi'}
          </div>
          <p className="mt-1.5 text-[11px] text-rose-200/70">{String(error.message || error)}</p>
          <button onClick={this.reset} className="btn-ghost mt-3 !py-1.5 !text-[11px]">
            <RotateCcw size={12} /> Dobara koshish karo
          </button>
        </div>
      )
    }

    // app-level — poori screen
    return (
      <div className="grid min-h-screen place-items-center bg-ink p-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-panel p-7 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-rose-500/15 text-rose-300">
            <AlertTriangle size={22} />
          </div>
          <h2 className="mt-4 text-lg font-bold">Kuch galat ho gaya</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
            Aapka kaam save hai. Neeche button dabao — page dobara load ho jayega.
          </p>
          <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-black/30 p-3 text-left text-[11px] text-rose-200/80">
            {String(error.message || error)}
          </pre>
          <div className="mt-5 flex justify-center gap-2">
            <button className="btn-primary" onClick={this.reset}>
              <RotateCcw size={15} /> Dobara koshish karo
            </button>
            <button className="btn-ghost" onClick={() => window.location.reload()}>Page reload</button>
          </div>
        </div>
      </div>
    )
  }
}

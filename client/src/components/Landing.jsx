import React, { useEffect, useState } from 'react'
import { useBuilder } from '../store/useBuilder'
import { TEMPLATES } from '../data/templates'
import { WIDGETS } from '../sections/widgets'
import { BRAND } from '../data/brand'
import { PALETTES } from '../data/design'
import Reveal from './Reveal'
import {
  ArrowRight, MousePointerClick, LayoutTemplate, Sparkles, RotateCcw, Wand2, Zap,
  Braces, Globe2, ShieldCheck, Rocket, Cpu, LineChart, FileSearch, Bot,
} from 'lucide-react'

const variantCount = Object.values(WIDGETS).reduce((a, w) => a + Object.keys(w.variants).length, 0)

/* ------------------------------- logo ------------------------------- */
export function PedinnoLogo({ size = 38, showText = true }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative grid shrink-0 place-items-center rounded-[12px] font-black text-white shadow-glow"
        style={{ height: size, width: size, background: 'linear-gradient(135deg,#0f7ef0,#00c6ff)', fontSize: size * 0.42 }}
      >
        pd
        <span className="absolute inset-0 rounded-[12px] ring-1 ring-inset ring-white/30" />
      </div>
      {showText ? (
        <div className="leading-none">
          <div className="text-[19px] font-extrabold tracking-tight">
            {BRAND.name} <span className="grad-text">{BRAND.suffix}</span>
          </div>
          <div className="mt-1 text-[9px] font-semibold tracking-[.22em] text-slate-400">{BRAND.tagline}</div>
        </div>
      ) : null}
    </div>
  )
}

/* --------------------- animated product mock (right) --------------------- */
const MOCK_CARDS = [
  { icon: Bot, label: 'AI INTERVIEW ANALYSIS', bars: [40, 78, 52, 88, 64] },
  { icon: FileSearch, label: 'DOCUMENT EXTRACTION', bars: [70, 45, 90, 58, 80] },
  { icon: Cpu, label: 'WORKFLOW AUTOMATION', bars: [35, 62, 84, 50, 72] },
  { icon: LineChart, label: 'MARKETING AUTOMATION', bars: [55, 85, 48, 76, 92] },
]

function MockPanel() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative">
      {/* glow behind */}
      <div className="absolute -inset-6 rounded-[36px] bg-gradient-to-tr from-brand-500/30 to-cyanx-500/20 blur-3xl" />

      <div className="relative animate-floatSlow rounded-[26px] border border-white/12 bg-panel/80 p-4 shadow-glow backdrop-blur">
        {/* window chrome */}
        <div className="mb-4 flex items-center gap-2 px-1">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <div className="ml-auto flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1 text-[10px] font-semibold text-cyanx-400">
            <Sparkles size={11} className="animate-blink" /> AI processing live
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {MOCK_CARDS.map((c, ci) => {
            const Icon = c.icon
            return (
              <div key={c.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/15 text-brand-300">
                  <Icon size={15} />
                </div>
                <div className="mt-3 text-[10px] font-bold tracking-wide text-slate-300">{c.label}</div>
                <div className="mt-3 flex h-12 items-end gap-1.5">
                  {c.bars.map((h, bi) => (
                    <div
                      key={bi}
                      className="flex-1 origin-bottom rounded-[3px] transition-[height] duration-700 ease-out"
                      style={{
                        height: `${Math.max(18, (h + ((tick + ci * 3 + bi * 7) % 5) * 6) % 100)}%`,
                        background: 'linear-gradient(180deg,#3ad6ff,#0f7ef0)',
                        transitionDelay: `${bi * 60}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* floating chips */}
      <div className="absolute -left-7 top-16 hidden animate-float rounded-xl border border-white/12 bg-panel2/90 px-3.5 py-2.5 text-[11px] font-semibold shadow-soft backdrop-blur sm:block">
        <span className="grad-text">60</span> templates ready
      </div>
      <div className="absolute -right-5 bottom-14 hidden animate-float rounded-xl border border-white/12 bg-panel2/90 px-3.5 py-2.5 text-[11px] font-semibold shadow-soft backdrop-blur sm:block" style={{ animationDelay: '1.4s' }}>
        <span className="text-cyanx-400">drag</span> &amp; drop editor
      </div>
    </div>
  )
}

/* ------------------------------- sections ------------------------------- */
function Ticker() {
  const text = `${BRAND.ticker}   •   ${BRAND.name} ${BRAND.suffix} ${BRAND.product}   •   `
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-[#04102a] py-2.5">
      <div className="flex w-max animate-marquee whitespace-nowrap">
        {[0, 1].map((k) => (
          <span key={k} className="px-4 text-[13px] text-slate-400">
            {text.repeat(4)}
          </span>
        ))}
      </div>
    </div>
  )
}

const STATS = [
  { v: TEMPLATES.length, s: '+', l: 'Ready templates' },
  { v: Object.keys(WIDGETS).length, s: '', l: 'Drag & drop widgets' },
  { v: variantCount, s: '', l: 'Layout variants' },
  { v: 0, s: '', l: 'Lines of code needed' },
]

function Counter({ to, suffix }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!to) return
    let raf, start
    const run = (ts) => {
      start ||= ts
      const p = Math.min(1, (ts - start) / 1100)
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(run)
    }
    raf = requestAnimationFrame(run)
    return () => cancelAnimationFrame(raf)
  }, [to])
  return <>{n}{suffix}</>
}

const STEPS = [
  { icon: Wand2, t: 'Basic details', d: 'Company name, logo, website type aur contact info — ek baar bharo, poori site me auto fill ho jata hai.' },
  { icon: LayoutTemplate, t: 'Template chuno', d: `${TEMPLATES.length} designs, har ek ka apna layout, colour palette aur font pairing.` },
  { icon: MousePointerClick, t: 'Drag & drop edit', d: 'Widgets drag karo, content badlo, spacing tune karo — live preview ke saath.' },
  { icon: Rocket, t: 'Export & launch', d: 'Ek click me clean responsive HTML export, ya project JSON save karke baad me continue karo.' },
]

const FEATURES = [
  { icon: Zap, t: 'Instant personalisation', d: 'Jo details wizard me bhari, wo hero, about, contact aur footer me apne aap chali jaati hain.' },
  { icon: Braces, t: 'Clean exported code', d: 'Export hone wala HTML hand-written jaisa hai — Google Fonts, responsive rules aur zero framework bloat.' },
  { icon: ShieldCheck, t: 'Non-destructive editing', d: 'Har change undo/redo ke saath, aur project localStorage me autosave hota rehta hai.' },
  { icon: Globe2, t: 'Multi-page sites', d: 'Home ke alawa jitne chaho pages banao — header aur footer sab pages me shared rehta hai.' },
]

/* ------------------------------- page ------------------------------- */
export default function Landing() {
  const setStep = useBuilder((s) => s.setStep)
  const site = useBuilder((s) => s.site)
  const business = useBuilder((s) => s.business)
  const continueProject = useBuilder((s) => s.continueProject)
  const serverUp = useBuilder((s) => s.serverUp)
  const [scrolled, setScrolled] = useState(false)

  // refresh pe hamesha yahi page khulta hai; purana kaam yahan se wapas
  const hasProject = !!site
  const pageCount = site?.pages?.length || 0

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const start = () => setStep('wizard')

  return (
    <div className="relative min-h-full overflow-x-hidden bg-ink">
      {/* ------------- ambient background ------------- */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[52%] top-[-22%] h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-brand-500/25 blur-[130px]" />
        <div className="absolute bottom-[-20%] left-[5%] h-[440px] w-[560px] rounded-full bg-cyanx-500/12 blur-[130px]" />
        <div
          className="grid-bg absolute inset-0 opacity-60"
          style={{
            maskImage: 'radial-gradient(ellipse at 50% 22%, #000 35%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 22%, #000 35%, transparent 75%)',
          }}
        />
      </div>

      <div className="relative">
        {/* ------------- nav ------------- */}
        <header className={`sticky top-0 z-40 transition-all ${scrolled ? 'border-b border-white/10 bg-ink/85 backdrop-blur-xl' : ''}`}>
          <div className="mx-auto flex max-w-[1280px] items-center gap-6 px-6 py-4">
            <PedinnoLogo />
            <nav className="ml-4 hidden items-center gap-6 text-[13.5px] font-medium text-slate-300 lg:flex">
              {BRAND.nav.slice(0, 6).map((n, i) => (
                <a
                  key={n}
                  href="#how"
                  className={`relative py-1 transition hover:text-white ${i === 0 ? 'text-white' : ''}`}
                >
                  {n}
                  {i === 0 ? <span className="absolute -bottom-0.5 left-0 h-0.5 w-full rounded bg-gradient-to-r from-brand-400 to-cyanx-500" /> : null}
                </a>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2.5">
              {hasProject ? (
                <button className="btn-ghost !rounded-full" onClick={continueProject}>
                  <RotateCcw size={15} /> <span className="hidden sm:inline">Continue editing</span>
                </button>
              ) : null}
              <button onClick={start} className="pill-cta !px-5 !py-2.5 !text-sm">
                Create Website <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </header>

        <Ticker />

        {/* ------------- hero ------------- */}
        <section className="mx-auto grid max-w-[1280px] items-center gap-14 px-6 pb-16 pt-16 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-20">
          <div>
            <div className="chip mb-7 animate-fadeUp !border-brand-400/30 !bg-brand-500/10">
              <Sparkles size={13} className="text-cyanx-400" />
              {TEMPLATES.length} templates · {Object.keys(WIDGETS).length} widgets · {variantCount} layouts
            </div>

            <h1 className="animate-fadeUp text-[42px] font-extrabold leading-[1.05] tracking-tight sm:text-[58px]" style={{ animationDelay: '.08s' }}>
              Website Builder
              <br />
              <span className="grad-text">Built for Intelligent</span>
              <br />
              Business Automation
            </h1>

            <p className="mt-7 max-w-xl animate-fadeUp text-[15.5px] leading-relaxed text-slate-400" style={{ animationDelay: '.16s' }}>
              {BRAND.name} {BRAND.suffix} ka drag &amp; drop builder — basic details bharo, template chuno,
              aur widgets ko drag karke apni website minutes me ready karo. Coding bilkul zaroori nahi.
            </p>

            <div className="mt-10 flex animate-fadeUp flex-wrap items-center gap-4" style={{ animationDelay: '.24s' }}>
              <button onClick={start} className="pill-cta group relative overflow-hidden">
                <span className="shine absolute inset-0 animate-shimmer" />
                <span className="relative flex items-center gap-2.5">
                  Create Website <ArrowRight size={19} className="transition group-hover:translate-x-1" />
                </span>
              </button>
              <a href="#how" className="btn-ghost !rounded-full !px-6 !py-3.5">See how it works</a>
            </div>

            <p className="mt-5 animate-fadeUp text-xs text-slate-500" style={{ animationDelay: '.3s' }}>
              Free · koi sign-up nahi · 2 minute me ready
            </p>
          </div>

          <div className="animate-fadeUp" style={{ animationDelay: '.2s' }}>
            <MockPanel />
          </div>
        </section>

        {/* ------------- stats ------------- */}
        <Reveal className="mx-auto max-w-[1280px] px-6">
          <div className="grid grid-cols-2 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03] py-8 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.l} className="px-5 text-center">
                <div className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                  <span className="grad-text"><Counter to={s.v} suffix={s.s} /></span>
                </div>
                <div className="mt-2 text-[11.5px] font-medium uppercase tracking-wider text-slate-400">{s.l}</div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ------------- how it works ------------- */}
        <section id="how" className="mx-auto max-w-[1280px] scroll-mt-24 px-6 py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <div className="chip mb-5 !border-brand-400/30 !bg-brand-500/10">How it works</div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-[40px]">Chaar step, ek website</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-400">
              Wizard se lekar export tak — poora flow ek hi jagah, bina kisi setup ke.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              return (
                <Reveal key={s.t} delay={i * 110}>
                  <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-brand-400/40 hover:bg-white/[0.06]">
                    <div className="absolute right-4 top-4 text-[42px] font-black leading-none text-white/[0.04] transition group-hover:text-brand-400/20">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-cyanx-500 text-white shadow-glow">
                      <Icon size={19} />
                    </div>
                    <div className="mt-5 text-[15px] font-bold">{s.t}</div>
                    <p className="mt-2.5 text-[13px] leading-relaxed text-slate-400">{s.d}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </section>

        {/* ------------- template marquee ------------- */}
        <section className="py-6">
          <Reveal className="mx-auto mb-9 max-w-2xl px-6 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-[38px]">
              {TEMPLATES.length} templates, <span className="grad-text">har ek alag</span>
            </h2>
            <p className="mt-4 text-[15px] text-slate-400">
              Education, Business aur Technology — alag layout structure, colour palette aur font pairing ke saath.
            </p>
          </Reveal>

          <div className="relative overflow-hidden py-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-ink to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-ink to-transparent" />
            <div className="flex w-max animate-marquee gap-3">
              {[0, 1].map((pass) => (
                <div key={pass} className="flex gap-3">
                  {TEMPLATES.slice(0, 22).map((t) => {
                    const pal = PALETTES.find((p) => p.id === t.theme.palette)
                    return (
                      <button
                        key={pass + t.id}
                        onClick={start}
                        className="flex w-[210px] shrink-0 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:border-brand-400/50 hover:bg-white/[0.07]"
                      >
                        <span className="h-8 w-8 shrink-0 rounded-lg" style={{ background: `linear-gradient(135deg, ${pal?.primary}, ${pal?.accent})` }} />
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-semibold">{t.name}</span>
                          <span className="block text-[11px] text-slate-500">{t.category}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------- features ------------- */}
        <section className="mx-auto max-w-[1280px] px-6 py-24">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <Reveal>
              <div className="chip mb-5 !border-brand-400/30 !bg-brand-500/10">Why this builder</div>
              <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-[40px]">
                Editor jitna simple, output utna <span className="grad-text">professional</span>
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-slate-400">{BRAND.blurb}</p>
              <button onClick={start} className="pill-cta mt-8">
                Create Website <ArrowRight size={18} />
              </button>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2">
              {FEATURES.map((f, i) => {
                const Icon = f.icon
                return (
                  <Reveal key={f.t} delay={i * 100}>
                    <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-cyanx-500/40">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyanx-500/12 text-cyanx-400">
                        <Icon size={18} />
                      </div>
                      <div className="mt-4 text-[14.5px] font-bold">{f.t}</div>
                      <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{f.d}</p>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        {/* ------------- final CTA ------------- */}
        <section className="px-6 pb-24">
          <Reveal className="mx-auto max-w-[1180px]">
            <div className="relative overflow-hidden rounded-[28px] p-12 text-center sm:p-16" style={{ background: 'linear-gradient(115deg,#0b63cc,#0f7ef0 45%,#00c6ff)' }}>
              <div className="grid-bg pointer-events-none absolute inset-0 opacity-30" />
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 animate-spinSlow rounded-full border border-white/20" />
              <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 animate-spinSlow rounded-full border border-white/15" />
              <div className="relative">
                <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-[42px]">Apni website abhi banao</h2>
                <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/85">
                  Details bharo, template chuno, drag &amp; drop se edit karo — 2 minute me live-ready website taiyaar.
                </p>
                <button
                  onClick={start}
                  className="group mt-9 inline-flex items-center gap-3 rounded-full bg-white px-9 py-4.5 text-base font-bold text-brand-600 shadow-2xl transition hover:-translate-y-0.5 hover:bg-brand-50"
                  style={{ paddingTop: 17, paddingBottom: 17 }}
                >
                  Create Website <ArrowRight size={19} className="transition group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ------------- footer ------------- */}
        <footer className="border-t border-white/10 bg-[#04102a]">
          <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-6 px-6 py-9">
            <div>
              <PedinnoLogo size={34} />
              <p className="mt-4 max-w-sm text-[12.5px] leading-relaxed text-slate-500">
                {BRAND.name} {BRAND.suffix} {BRAND.product} — drag &amp; drop website builder for teams that ship fast.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-3 text-[13px] text-slate-400">
              {BRAND.nav.map((n) => <a key={n} href="#how" className="transition hover:text-white">{n}</a>)}
            </div>
          </div>
          <div className="border-t border-white/8 px-6 py-5 text-center text-[12px] text-slate-600">
            © {new Date().getFullYear()} {BRAND.name} {BRAND.suffix} · {BRAND.site}
          </div>
        </footer>
      </div>
    </div>
  )
}

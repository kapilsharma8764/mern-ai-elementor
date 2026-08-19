import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useBuilder, resolveTheme } from '../store/useBuilder'
import { useTemplates } from '../data/useTemplates'
import { makeBlock } from '../store/useBuilder'
import { BlockView } from '../sections/Renderer'
import { PALETTES, FONTS } from '../data/design'
import { personaliseSite } from '../store/personalise'
import { PedinnoLogo } from './Landing'
import { ChevronLeft, Search, Eye, X, Check } from 'lucide-react'

/** template ke blocks banao aur business info se bhar do — preview = final output */
function previewBlocks(tpl, business) {
  const blocks = tpl.blocks.map((b) => makeBlock(b.type, b.variant))
  const header = blocks.find((b) => b.type === 'header')
  const footer = blocks.find((b) => b.type === 'footer')
  const body = blocks.filter((b) => b !== header && b !== footer)
  const site = personaliseSite(
    { header: header || makeBlock('header'), footer: footer || makeBlock('footer'), pages: [{ id: 'p', name: 'Home', slug: '/', blocks: body }] },
    business
  )
  return [site.header, ...site.pages[0].blocks, site.footer]
}

/** card ke liye halka preview — sirf header + pehle 3 sections
 *  (61 poore previews browser ko atka dete the) */
function cardBlocks(tpl, business) {
  return previewBlocks(tpl, business).slice(0, 4)
}

/** renders a template at full width then scales it down */
function MiniPreview({ tpl, business, height = 300, scale = 0.24 }) {
  const ref = useRef(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setShow(true), { rootMargin: '400px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const theme = useMemo(() => resolveTheme(tpl.theme), [tpl])
  const blocks = useMemo(() => cardBlocks(tpl, business), [tpl, business])

  return (
    <div ref={ref} style={{ height, overflow: 'hidden', position: 'relative', background: theme.bg }}>
      {show ? (
        <div
          className="sitewrap"
          style={{ width: 1280, transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}
        >
          {blocks.map((b) => <BlockView key={b.id} block={b} theme={theme} business={business} />)}
        </div>
      ) : (
        <div className="h-full w-full animate-pulse bg-white/5" />
      )}
    </div>
  )
}

function FullPreview({ tpl, business, onClose, onUse }) {
  const theme = useMemo(() => resolveTheme(tpl.theme), [tpl])
  const blocks = useMemo(() => previewBlocks(tpl, business), [tpl, business])
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur">
      <div className="flex items-center justify-between border-b border-white/10 bg-panel px-5 py-3">
        <div>
          <div className="text-sm font-semibold">#{tpl.no} · {tpl.name}</div>
          <div className="text-xs text-slate-400">{tpl.category} · {tpl.blocks.length} sections</div>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={() => onUse(tpl.id)}><Check size={15} /> Use this template</button>
          <button className="btn-ghost" onClick={onClose}><X size={15} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-[#0d1326] p-4">
        <div className="mx-auto shadow-2xl" style={{ maxWidth: 1440, width: '100%' }}>
          <div className="sitewrap" style={{ background: theme.bg }}>
            {blocks.map((b) => <BlockView key={b.id} block={b} theme={theme} business={business} />)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TemplateGallery() {
  const { business, chooseTemplate, setStep } = useBuilder()
  const { templates: TEMPLATES, categories: TEMPLATE_CATEGORIES, source, loading } = useTemplates()
  const [cat, setCat] = useState('All')
  const [q, setQ] = useState('')
  const [preview, setPreview] = useState(null)

  const recommended = business.type
    ? { education: 'Education', business: 'Business', technology: 'Technology' }[business.type]
    : null

  const list = useMemo(() => {
    let l = TEMPLATES
    if (cat !== 'All') l = l.filter((t) => t.category === cat)
    if (q.trim()) {
      const s = q.toLowerCase()
      l = l.filter((t) => t.name.toLowerCase().includes(s) || t.category.toLowerCase().includes(s))
    }
    if (recommended && cat === 'All') {
      l = [...l].sort((a, b) => (a.category === recommended ? -1 : 0) - (b.category === recommended ? -1 : 0))
    }
    return l
  }, [cat, q, recommended, TEMPLATES])

  return (
    <div className="min-h-full bg-ink">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-ink/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-6 py-4">
          <button className="btn-ghost" onClick={() => setStep('wizard')}><ChevronLeft size={16} /> Basic info</button>
          <PedinnoLogo size={32} showText={false} />
          <div>
            <h2 className="text-lg font-bold">Choose a template</h2>
            <p className="text-xs text-slate-400">
              {loading ? 'Templates aa rahe hain…' : `${TEMPLATES.length} designs`} — har preview me{' '}
              <span className="font-semibold text-brand-300">aapki apni information</span> lagi hui hai.
              {source === 'server' ? (
                <span className="ml-1.5 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                  database se
                </span>
              ) : (
                <span className="ml-1.5 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                  built-in
                </span>
              )}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="field !w-64 !pl-9" placeholder="Search templates" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
          <div className="flex w-full flex-wrap gap-2">
            {TEMPLATE_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  cat === c ? 'bg-brand-500 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {c}
                {c !== 'All' && recommended === c ? <span className="ml-1.5 text-[10px] text-emerald-300">recommended</span> : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((t) => {
            const pal = PALETTES.find((p) => p.id === t.theme.palette)
            const font = FONTS.find((f) => f.id === t.theme.font)
            return (
              <div
                key={t.id}
                onClick={() => chooseTemplate(t.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && chooseTemplate(t.id)}
                title={`${t.name} — click karke use karo`}
                className="group cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-panel transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <div className="relative">
                  <MiniPreview tpl={t} business={business} />
                  {/* hover pe halka overlay — par card khud bhi clickable hai */}
                  <div className="pointer-events-none absolute inset-0 bg-brand-500/0 transition group-hover:bg-brand-500/10" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setPreview(t) }}
                    className="absolute right-2 top-2 rounded-lg bg-ink/80 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur transition hover:bg-ink"
                    title="Poora template dekho"
                  >
                    <Eye size={13} className="mr-1 inline" /> Preview
                  </button>
                </div>
                <div className="flex items-center gap-3 border-t border-white/10 px-3.5 py-3">
                  <span className="h-6 w-6 shrink-0 rounded-md ring-1 ring-white/20" style={{ background: `linear-gradient(135deg, ${pal?.primary}, ${pal?.accent})` }} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{t.name}</div>
                    <div className="truncate text-[11px] text-slate-500">{t.category} · {t.blocks.length} sections</div>
                  </div>
                  <span className="shrink-0 rounded-lg bg-brand-500 px-3 py-1.5 text-[11px] font-bold text-white transition group-hover:bg-brand-400">
                    Use
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        {!list.length ? <p className="py-20 text-center text-sm text-slate-500">No templates match that search.</p> : null}
      </div>

      {preview ? (
        <FullPreview tpl={preview} business={business} onClose={() => setPreview(null)} onUse={(id) => { setPreview(null); chooseTemplate(id) }} />
      ) : null}
    </div>
  )
}

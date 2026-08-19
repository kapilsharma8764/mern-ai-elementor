import React, { useEffect, useRef, useState } from 'react'
import { useBuilder } from '../../store/useBuilder'
import { WIDGETS } from '../../sections/widgets'
import { PALETTES, FONTS } from '../../data/design'
import { useTemplates } from '../../data/useTemplates'
import { LINK_KINDS, sectionAnchor } from '../../sections/links'
import { useImageUpload } from '../../utils/useImageUpload'
import { usedFields, variantsUsing } from '../../sections/usedFields'
import { EyeOff, Wand2, Image as ImageIcon } from 'lucide-react'
import { Trash2, Plus, ChevronUp, ChevronDown, Upload, X, RotateCcw, Layers, Palette as PaletteIcon, SlidersHorizontal } from 'lucide-react'

/* --------------------------- field widgets --------------------------- */
function ImgInput({ value, onChange }) {
  const ref = useRef(null)
  const { uploadImage, busy, progress, error } = useImageUpload()

  const pick = async (f) => {
    const url = await uploadImage(f)
    if (url) onChange(url)
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="relative grid h-11 w-16 shrink-0 place-items-center overflow-hidden rounded-md border border-white/10 bg-white/5">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <Upload size={13} className="text-slate-500" />}
          {busy ? (
            <div className="absolute inset-0 grid place-items-center bg-ink/80 text-[10px] font-bold text-brand-300">{progress}%</div>
          ) : null}
        </div>
        <button className="btn-ghost !py-1.5 !text-[11px] disabled:opacity-50" disabled={busy} onClick={() => ref.current?.click()}>
          {busy ? 'Ja rahi hai…' : 'Upload'}
        </button>
        {value ? <button className="rounded p-1 text-slate-400 hover:text-rose-300" onClick={() => onChange('')}><X size={14} /></button> : null}
        <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
      </div>
      {error ? <p className="mt-1 text-[10px] leading-relaxed text-amber-400/90">{error}</p> : null}
    </div>
  )
}

/** link target chunne ka compact editor */
function LinkField({ value = {}, onChange }) {
  const { site, currentPageId } = useBuilder()
  const page = site?.pages.find((p) => p.id === currentPageId) || site?.pages[0]
  const sections = Array.from(new Set((page?.blocks || []).map((b) => b.type)))
  const kind = value.kind || 'none'
  const set = (patch) => onChange({ ...value, ...patch })

  return (
    <div className="grid gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] p-2">
      <select className="field !py-1.5 !text-[12px]" value={kind} onChange={(e) => set({ kind: e.target.value, target: '' })}>
        {LINK_KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
      </select>

      {kind === 'section' ? (
        <select className="field !py-1.5 !text-[12px]" value={value.target || ''} onChange={(e) => set({ target: e.target.value })}>
          <option value="top">Top of page</option>
          {sections.map((s) => (
            <option key={s} value={sectionAnchor(s)}>{WIDGETS[s]?.label || s}</option>
          ))}
        </select>
      ) : null}

      {kind === 'page' ? (
        <select className="field !py-1.5 !text-[12px]" value={value.target || ''} onChange={(e) => set({ target: e.target.value })}>
          <option value="">Choose a page…</option>
          {(site?.pages || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      ) : null}

      {kind === 'url' ? (
        <input className="field !py-1.5 !text-[12px]" placeholder="https://example.com" value={value.target || ''} onChange={(e) => set({ target: e.target.value })} />
      ) : null}

      {['tel', 'wa', 'mail'].includes(kind) ? (
        <p className="px-0.5 text-[10px] text-slate-500">Aapke diye number/email se apne aap ban jayega.</p>
      ) : null}
    </div>
  )
}

function Field({ f, value, onChange }) {
  if (f.type === 'link') return <LinkField value={value} onChange={onChange} />
  if (f.type === 'textarea') return <textarea className="field min-h-[76px] text-[13px]" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
  if (f.type === 'image') return <ImgInput value={value} onChange={onChange} />
  if (f.type === 'select')
    return (
      <select className="field text-[13px]" value={value ?? ''} onChange={(e) => onChange(isNaN(e.target.value) || e.target.value === '' ? e.target.value : Number(e.target.value))}>
        {f.options.map((o) => <option key={o} value={o}>{String(o)}</option>)}
      </select>
    )
  if (f.type === 'toggle')
    return (
      <button
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition ${value ? 'bg-brand-500' : 'bg-white/15'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${value ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    )
  if (f.type === 'number')
    return <input type="number" className="field text-[13px]" min={f.min} max={f.max} value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} />
  return <input className="field text-[13px]" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
}

function ListField({ f, value = [], onChange, openIndex, used }) {
  const [open, setOpen] = useState(0)
  useEffect(() => { if (typeof openIndex === 'number') setOpen(openIndex) }, [openIndex])
  const items = Array.isArray(value) ? value : []
  const upd = (i, k, v) => onChange(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)))
  const add = () => { onChange([...items, {}]); setOpen(items.length) }
  const del = (i) => onChange(items.filter((_, j) => j !== i))
  const move = (i, d) => {
    const n = [...items]; const j = i + d
    if (j < 0 || j >= n.length) return
    ;[n[i], n[j]] = [n[j], n[i]]
    onChange(n)
  }
  return (
    <div className="grid gap-1.5">
      {items.map((it, i) => (
        <div key={i} className="rounded-lg border border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-1 px-2 py-1.5">
            <button className="flex-1 truncate text-left text-[12px] font-medium text-slate-200" onClick={() => setOpen(open === i ? -1 : i)}>
              {i + 1}. {it[f.fields[0].key] || it.title || it.name || it.label || 'Item'}
            </button>
            <button className="rounded p-1 text-slate-500 hover:text-white" onClick={() => move(i, -1)}><ChevronUp size={13} /></button>
            <button className="rounded p-1 text-slate-500 hover:text-white" onClick={() => move(i, 1)}><ChevronDown size={13} /></button>
            <button className="rounded p-1 text-slate-500 hover:text-rose-300" onClick={() => del(i)}><Trash2 size={13} /></button>
          </div>
          {open === i ? (
            <div className="grid gap-2 border-t border-white/10 p-2.5">
              {f.fields.map((sf) => {
                const shown = !used || used.has(`${f.key}.${sf.key}`)
                return (
                  <div key={sf.key} className={shown ? '' : 'opacity-45'}>
                    <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      {sf.label}
                      {!shown ? <EyeOff size={10} className="text-amber-400/70" title="Is layout me nahi dikhta" /> : null}
                    </div>
                    <Field f={sf} value={it[sf.key]} onChange={(v) => upd(i, sf.key, v)} />
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>
      ))}
      <button className="btn-ghost !py-1.5 !text-[11px]" onClick={add}><Plus size={13} /> {f.addLabel || 'Add item'}</button>
    </div>
  )
}

const Row = ({ label, children }) => (
  <div className="grid grid-cols-[104px_1fr] items-center gap-2">
    <span className="text-[11px] font-medium text-slate-400">{label}</span>
    {children}
  </div>
)

const Slider = ({ value, onChange, min = 0, max = 200, step = 1, suffix = 'px' }) => (
  <div className="flex items-center gap-2">
    <input type="range" min={min} max={max} step={step} value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} className="h-1 flex-1 accent-brand-500" />
    <span className="w-12 text-right text-[11px] tabular-nums text-slate-400">{value ?? 0}{suffix}</span>
  </div>
)

/* ---------------- brand panel — header/footer ke liye ---------------- */
/* Logo, company name aur logo style ab builder me hi badal sakte ho —
   wizard pe wapas jaane ki zaroorat nahi. */
function BrandPanel() {
  const business = useBuilder((s) => s.business)
  const setBusiness = useBuilder((s) => s.setBusiness)
  const save = useBuilder((s) => s.save)
  const { uploadImage, busy, progress, error } = useImageUpload()

  const set = (k, v) => { setBusiness({ [k]: v }); save() }
  const ls = business.logoStyle || {}
  const setLS = (k, v) => set('logoStyle', { ...ls, [k]: v })

  const pickFile = async (file) => {
    const url = await uploadImage(file)
    if (url) set('logo', url)
  }

  const Seg = ({ options, value, onChange }) => (
    <div className="flex gap-1">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`flex-1 rounded-md border px-2 py-1.5 text-[11px] font-medium transition ${
            value === o.id ? 'border-brand-400 bg-brand-500/15 text-white' : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25'
          }`}
        >{o.label}</button>
      ))}
    </div>
  )

  return (
    <div className="mb-4 rounded-lg border border-brand-400/25 bg-brand-500/[0.06] p-3">
      <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-200">
        <ImageIcon size={12} /> Brand — poori site me lagega
      </div>

      <div className="grid gap-3">
        <div>
          <div className="label !mb-1">Company name</div>
          <input className="field !py-1.5 text-[13px]" value={business.name || ''} onChange={(e) => set('name', e.target.value)} />
        </div>

        <div>
          <div className="label !mb-1">Logo</div>
          <div className="flex items-center gap-2">
            <div className="grid h-11 w-16 shrink-0 place-items-center overflow-hidden rounded-md border border-white/10 bg-white/5">
              {business.logo
                ? <img src={business.logo} alt="" className="h-full w-full object-contain p-1" />
                : <Upload size={13} className="text-slate-500" />}
            </div>
            <button className="btn-ghost !py-1.5 !text-[11px] disabled:opacity-50" disabled={busy}
              onClick={() => document.getElementById('brand-logo-input')?.click()}>
              {busy ? `${progress}%` : business.logo ? 'Badlo' : 'Upload'}
            </button>
            {business.logo ? (
              <button className="rounded p-1 text-slate-400 hover:text-rose-300" onClick={() => set('logo', '')}><X size={14} /></button>
            ) : null}
            <input id="brand-logo-input" type="file" accept="image/*" hidden onChange={(e) => pickFile(e.target.files?.[0])} />
          </div>
          {error ? <p className="mt-1 text-[10px] text-amber-400/90">{error}</p> : null}
        </div>

        <div>
          <div className="label !mb-1">Kaise dikhe</div>
          <Seg
            options={[{ id: 'logoName', label: 'Logo + Name' }, { id: 'logo', label: 'Logo' }, { id: 'name', label: 'Name' }]}
            value={ls.mode || 'logoName'} onChange={(v) => setLS('mode', v)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="label !mb-1">Shape</div>
            <Seg options={[{ id: 'square', label: 'Sq' }, { id: 'rounded', label: 'Rnd' }, { id: 'round', label: 'Circle' }]}
              value={ls.shape || 'rounded'} onChange={(v) => setLS('shape', v)} />
          </div>
          <div>
            <div className="label !mb-1">Size</div>
            <Seg options={[{ id: 'sm', label: 'S' }, { id: 'md', label: 'M' }, { id: 'lg', label: 'L' }]}
              value={ls.size || 'md'} onChange={(v) => setLS('size', v)} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* --------------------------- site theme panel --------------------------- */
function ThemePanel() {
  const { site, setTheme, applyTemplateTheme, templateId } = useBuilder()
  const { templates: TEMPLATES } = useTemplates()
  const th = site.theme
  return (
    <div className="grid gap-4 p-3.5">
      <div>
        <div className="label">Website ka rang</div>
        <div className="grid grid-cols-4 gap-2">
          {PALETTES.map((p) => (
            <button key={p.id} onClick={() => setTheme({ palette: p.id })} title={p.name}
              className={`h-11 rounded-lg border-2 transition ${th.palette === p.id ? 'border-brand-400' : 'border-white/10 hover:border-white/30'}`}
              style={{ background: `linear-gradient(135deg, ${p.primary}, ${p.accent})` }} />
          ))}
        </div>
      </div>

      <div>
        <div className="label">Likhawat ka style</div>
        <select className="field text-[13px]" value={th.font} onChange={(e) => setTheme({ font: e.target.value })}>
          {FONTS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      <Row label="Kone">
        <select className="field !py-1.5 text-[12px]" value={th.radius} onChange={(e) => setTheme({ radius: e.target.value })}>
          {[['none','Seedhe'],['sm','Halke gol'],['md','Gol'],['lg','Zyada gol'],['pill','Poore gol']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </Row>
      <Row label="Khali jagah">
        <select className="field !py-1.5 text-[12px]" value={th.density} onChange={(e) => setTheme({ density: e.target.value })}>
          {[['compact','Kam'],['normal','Normal'],['roomy','Zyada']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </Row>
      <Row label="Chaudai">
        <select className="field !py-1.5 text-[12px]" value={th.container} onChange={(e) => setTheme({ container: e.target.value })}>
          {[['narrow','Patli'],['normal','Normal'],['wide','Chaudi'],['full','Poori screen']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </Row>
      <Row label="Heading ka size">
        <Slider value={Math.round((th.headingScale ?? 1) * 100)} min={70} max={140} suffix="%" onChange={(v) => setTheme({ headingScale: v / 100 })} />
      </Row>

      <div>
        <div className="label">Doosra design lagao</div>
        <select className="field text-[13px]" value={templateId || ''} onChange={(e) => applyTemplateTheme(e.target.value)}>
          {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.no ? `#${t.no} ` : ''}{t.name}</option>)}
        </select>
        <p className="mt-1.5 text-[10px] text-slate-500">Applies that template's colours, fonts and spacing — your content and sections stay as they are.</p>
      </div>
    </div>
  )
}

/** canvas me element select karte hi uska field panel me scroll ho jaye */
function ScrollToField({ refs, activeKey }) {
  useEffect(() => {
    if (!activeKey) return
    const el = refs.current?.[activeKey]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeKey, refs])
  return null
}

/* --------------------------- main inspector --------------------------- */
/** panel ko drag karke chaudi/patli karo */
function ResizeHandle({ width, setWidth }) {
  const start = (e) => {
    e.preventDefault()
    const x0 = e.clientX
    const w0 = width
    const move = (ev) => setWidth(Math.min(560, Math.max(280, w0 - (ev.clientX - x0))))
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }
  return (
    <div
      onPointerDown={start}
      title="Drag to resize panel"
      className="absolute left-0 top-0 z-20 h-full w-1.5 cursor-col-resize bg-transparent transition hover:bg-brand-500/40"
    />
  )
}

export default function Inspector() {
  const selectedId = useBuilder((s) => s.selectedId)
  const selectedPath = useBuilder((s) => s.selectedPath)
  const getBlock = useBuilder((s) => s.getBlock)
  const setProp = useBuilder((s) => s.setProp)
  const setStyle = useBuilder((s) => s.setStyle)
  const setVariant = useBuilder((s) => s.setVariant)
  const updateBlock = useBuilder((s) => s.updateBlock)
  const select = useBuilder((s) => s.select)
  const inspectorTab = useBuilder((s) => s.inspectorTab)
  const setInspectorTab = useBuilder((s) => s.setInspectorTab)
  const siteVersion = useBuilder((s) => s.site)   // block badle to panel bhi refresh ho
  const fieldRefs = useRef({})
  const [width, setWidth] = useState(340)
  const tab = inspectorTab
  const setTab = setInspectorTab
  const block = selectedId ? getBlock(selectedId) : null

  if (!block) {
    return (
      <aside className="relative flex h-full shrink-0 flex-col overflow-hidden border-l border-white/10 bg-panel" style={{ width }}>
        <ResizeHandle width={width} setWidth={setWidth} />
        <div className="flex items-center gap-2 border-b border-white/10 px-3.5 py-3">
          <PaletteIcon size={15} className="text-brand-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Poori website ka look</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-16">
          <ThemePanel />
          <p className="px-3.5 pb-6 text-[11px] leading-relaxed text-slate-500">
            Beech me website me kisi bhi cheez pe click karo — uska content, design aur jagah yahan badal sakte ho.
          </p>
        </div>
      </aside>
    )
  }

  const w = WIDGETS[block.type]
  const variants = Object.entries(w.variants)
  const st = block.style || {}
  const activeKey = selectedPath?.[0]
  const used = usedFields(block.type, block.variant)

  return (
    <aside className="relative flex h-full shrink-0 flex-col overflow-hidden border-l border-white/10 bg-panel" style={{ width }}>
      <ResizeHandle width={width} setWidth={setWidth} />
      <ScrollToField refs={fieldRefs} activeKey={activeKey} />
      <div className="border-b border-white/10 px-3.5 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <Layers size={15} className="shrink-0 text-brand-400" />
            <span className="truncate text-[12px] font-bold">{w.label}</span>
          </div>
          <button className="shrink-0 rounded p-1 text-slate-500 hover:text-white" onClick={() => select(null)}><X size={14} /></button>
        </div>
        {selectedPath ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[10.5px] text-slate-500">
            {selectedPath.map((seg, i) => (
              <React.Fragment key={i}>
                {i ? <span className="text-slate-700">/</span> : null}
                <span className={i === selectedPath.length - 1 ? 'font-semibold text-brand-300' : ''}>
                  {typeof seg === 'number' ? `#${seg + 1}` : seg}
                </span>
              </React.Fragment>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex border-b border-white/10">
        {[['content', 'Likhai'], ['design', 'Design']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wider transition ${tab === k ? 'border-b-2 border-brand-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3.5 pb-20">
        {tab === 'content' ? (
          <div className="grid gap-3.5">
            {(selectedId === 'header' || selectedId === 'footer') ? <BrandPanel /> : null}
            {(w.schema || []).map((f) => {
              const isActive = activeKey === f.key
              const shown = used.has(f.key)
              const alt = shown ? [] : variantsUsing(block.type, f.key)
              return (
                <div
                  key={f.key}
                  ref={(el) => { fieldRefs.current[f.key] = el }}
                  className={`rounded-lg transition ${isActive ? '-mx-2 bg-brand-500/10 p-2 ring-1 ring-brand-400/50' : ''}`}
                >
                  <div className="label flex items-center gap-1.5">
                    {f.label}
                    {!shown ? <EyeOff size={11} className="text-amber-400/80" /> : null}
                  </div>
                  <div className={shown ? '' : 'opacity-55'}>
                    {f.type === 'list' ? (
                      <ListField
                        f={f}
                        value={block.props[f.key]}
                        onChange={(v) => setProp(selectedId, f.key, v)}
                        openIndex={isActive && typeof selectedPath?.[1] === 'number' ? selectedPath[1] : undefined}
                        used={used}
                      />
                    ) : (
                      <Field f={f} value={block.props[f.key]} onChange={(v) => setProp(selectedId, f.key, v)} />
                    )}
                  </div>
                  {!shown ? (
                    <div className="mt-1.5 rounded-md border border-amber-400/25 bg-amber-400/10 px-2 py-1.5 text-[10.5px] leading-relaxed text-amber-200/90">
                      Ye <b>{block.variant}</b> layout me nahi dikhta.
                      {alt.length ? (
                        <button
                          className="mt-1 flex items-center gap-1 font-semibold text-amber-200 underline underline-offset-2"
                          onClick={() => setVariant(selectedId, alt[0])}
                        >
                          <Wand2 size={11} /> "{w.variants[alt[0]].name}" layout lagao
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              )
            })}
            {!(w.schema || []).length ? <p className="text-xs text-slate-500">This widget has no editable content.</p> : null}
          </div>
        ) : (
          <div className="grid gap-4">
            {variants.length > 1 ? (
              <div>
                <div className="label">Design chuno</div>
                <div className="grid gap-1.5">
                  {variants.map(([key, v]) => (
                    <button key={key} onClick={() => setVariant(selectedId, key)}
                      className={`rounded-lg border px-3 py-2 text-left text-[12px] transition ${
                        block.variant === key ? 'border-brand-400 bg-brand-500/15 text-white' : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25'
                      }`}>
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid gap-2.5">
              <div className="label !mb-0">Spacing & size</div>
              <Row label="Upar jagah"><Slider value={st.marginTop} min={-80} max={200} onChange={(v) => setStyle(selectedId, 'marginTop', v)} /></Row>
              <Row label="Neeche jagah"><Slider value={st.marginBottom} min={-80} max={200} onChange={(v) => setStyle(selectedId, 'marginBottom', v)} /></Row>
              <Row label="Andar jagah"><Slider value={st.paddingY} min={0} max={160} onChange={(v) => setStyle(selectedId, 'paddingY', v)} /></Row>
              <Row label="Chaudai"><Slider value={st.maxWidth} min={0} max={1600} step={20} onChange={(v) => setStyle(selectedId, 'maxWidth', v)} /></Row>
              <Row label="Text ka size"><Slider value={Math.round((st.fontScale ?? 1) * 100)} min={70} max={150} suffix="%" onChange={(v) => setStyle(selectedId, 'fontScale', v / 100)} /></Row>
            </div>

            <div className="grid gap-2.5">
              <div className="label !mb-0">Rang aur alignment</div>
              <Row label="Text ki side">
                <select className="field !py-1.5 text-[12px]" value={st.align} onChange={(e) => setStyle(selectedId, 'align', e.target.value)}>
                  {[['inherit','Jaisa hai'],['left','Baayin'],['center','Beech'],['right','Daayin']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Row>
              <Row label="Peeche ka rang">
                <div className="flex items-center gap-2">
                  <input type="color" className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent" value={st.bg || '#ffffff'} onChange={(e) => setStyle(selectedId, 'bg', e.target.value)} />
                  <button className="btn-ghost !py-1 !text-[11px]" onClick={() => setStyle(selectedId, 'bg', '')}>Hatao</button>
                </div>
              </Row>
              <Row label="Text ka rang">
                <div className="flex items-center gap-2">
                  <input type="color" className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent" value={st.fg || '#111111'} onChange={(e) => setStyle(selectedId, 'fg', e.target.value)} />
                  <button className="btn-ghost !py-1 !text-[11px]" onClick={() => setStyle(selectedId, 'fg', '')}>Reset</button>
                </div>
              </Row>
            </div>

            <button className="btn-ghost !text-[11px]" onClick={() => updateBlock(selectedId, { style: { marginTop: 0, marginBottom: 0, paddingY: 0, align: 'inherit', bg: '', fg: '', maxWidth: 0, hidden: false, fontScale: 1 } })}>
              <RotateCcw size={13} /> Sab wapas pehle jaisa
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

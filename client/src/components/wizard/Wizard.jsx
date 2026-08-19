import React, { useRef, useState } from 'react'
import { useBuilder } from '../../store/useBuilder'
import { PedinnoLogo } from '../Landing'
import { Logo as SiteLogo } from '../../sections/widgets'
import { resolveTheme } from '../../store/useBuilder'
import { logoPresets, LOGO_COLORS } from '../../data/logoPresets'
import { useImageUpload } from '../../utils/useImageUpload'
import {
  ChevronRight, ChevronLeft, ChevronDown, Upload, X, Building2, Briefcase, Phone, Check, Plus,
} from 'lucide-react'

const TYPES = [
  { id: 'education', label: 'Education', desc: 'School, college, coaching, academy', subs: ['Courses', 'Admissions', 'Institute'] },
  { id: 'business', label: 'Business', desc: 'Company selling products or services', subs: ['Product', 'Services'] },
  { id: 'technology', label: 'Technology', desc: 'SaaS, IT, software, startup', subs: ['Product', 'Services'] },
]

/* ------------------- ready-made logo gallery ------------------- */
function LogoGallery({ name, value, onChange }) {
  const [color, setColor] = useState('')
  const presets = logoPresets(name || 'Your Company', color || undefined)
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Colour</span>
        <button
          type="button"
          onClick={() => setColor('')}
          className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition ${
            !color ? 'border-brand-400 bg-brand-500/15 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/25'
          }`}
        >
          Mixed
        </button>
        {LOGO_COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            title={c.id}
            onClick={() => setColor(c.id)}
            className={`h-7 w-7 rounded-md border-2 transition ${color === c.id ? 'border-brand-400' : 'border-white/10 hover:border-white/30'}`}
            style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
          />
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {presets.map((p) => {
          const active = value === p.uri
          return (
            <button
              key={p.id}
              type="button"
              title={p.label}
              onClick={() => onChange(p.uri)}
              className={`group grid aspect-square place-items-center rounded-xl border p-2.5 transition ${
                active ? 'border-brand-400 bg-brand-500/15' : 'border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.07]'
              }`}
            >
              <img src={p.uri} alt={p.label} className="h-full w-full object-contain transition group-hover:scale-105" />
            </button>
          )
        })}
      </div>
      <p className="text-[11px] leading-relaxed text-slate-500">
        Company name se auto bane hue marks. Koi bhi select karo — wahi header, footer aur favicon me lag jayega.
        Baad me apna logo upload karke replace bhi kar sakte ho.
      </p>
    </div>
  )
}

/* ------------------------- logo: upload ya select ------------------------- */
function LogoField({ value, onChange, name }) {
  const [tab, setTab] = useState('upload')
  const ref = useRef(null)
  const { uploadImage, busy, progress, error: err } = useImageUpload()

  const read = async (file) => {
    const url = await uploadImage(file)
    if (url) onChange(url)
  }
  return (
    <div>
      <label className="label">Company logo</label>

      <div className="mb-3 inline-flex rounded-lg bg-white/5 p-0.5">
        {[['upload', 'Upload my logo'], ['select', 'Select a logo']].map(([k, l]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
              tab === k ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'select' ? (
        <LogoGallery name={name} value={value} onChange={onChange} />
      ) : (
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); read(e.dataTransfer.files?.[0]) }}
        onClick={() => !value && ref.current?.click()}
        className={`flex items-center gap-5 rounded-xl border border-dashed p-4 transition ${
          value ? 'border-white/15 bg-white/[0.03]' : 'cursor-pointer border-white/20 bg-white/[0.02] hover:border-brand-400/60 hover:bg-brand-500/[0.06]'
        }`}
      >
        <div className="grid h-20 w-32 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/10 bg-white/5">
          {value ? <img src={value} alt="logo" className="h-full w-full object-contain p-2" /> : <Upload size={20} className="text-slate-500" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-ghost !py-1.5 !text-xs disabled:opacity-50" disabled={busy} onClick={(e) => { e.stopPropagation(); ref.current?.click() }}>
              {busy ? `Ja raha hai… ${progress}%` : value ? 'Replace logo' : 'Choose file'}
            </button>
            {value ? (
              <button type="button" className="btn-ghost !py-1.5 !text-xs !text-rose-300" onClick={(e) => { e.stopPropagation(); onChange('') }}>
                <X size={13} /> Remove
              </button>
            ) : null}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            Transparent PNG best rehta hai. Drag &amp; drop bhi kar sakte ho — max 2MB.
            Yahi logo header, footer aur browser tab (favicon) me use hoga.
          </p>
          {err ? <p className="mt-1 text-[11px] text-rose-400">{err}</p> : null}
        </div>
      </div>
      )}
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => read(e.target.files?.[0])} />
    </div>
  )
}

/* ------------------- logo display style options ------------------- */
const MODES = [
  { id: 'logoName', label: 'Logo + Name', desc: 'Mark ke saath company name' },
  { id: 'logo', label: 'Logo only', desc: 'Sirf logo mark' },
  { id: 'name', label: 'Name only', desc: 'Sirf text wordmark' },
]
const SHAPES = [
  { id: 'square', label: 'Square' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'round', label: 'Circle' },
]
const SIZES = [{ id: 'sm', label: 'Small' }, { id: 'md', label: 'Medium' }, { id: 'lg', label: 'Large' }]
const POSITIONS = [{ id: 'left', label: 'Left' }, { id: 'center', label: 'Stacked' }]

/** tiny sketch of each mode so choice visually samajh aaye */
function ModeSketch({ mode, hasLogo }) {
  const mark = <span className="grid h-5 w-5 shrink-0 place-items-center rounded-[5px] bg-gradient-to-br from-brand-500 to-cyanx-500 text-[8px] font-black text-white">{hasLogo ? '' : 'A'}</span>
  const name = <span className="h-2 w-14 rounded bg-white/35" />
  return (
    <div className="flex h-9 items-center justify-center gap-1.5 rounded-md bg-white/[0.04]">
      {mode !== 'name' ? mark : null}
      {mode !== 'logo' ? name : null}
    </div>
  )
}

const Seg = ({ options, value, onChange }) => (
  <div className="flex gap-1.5">
    {options.map((o) => (
      <button
        key={o.id}
        type="button"
        onClick={() => onChange(o.id)}
        className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition ${
          value === o.id ? 'border-brand-400 bg-brand-500/15 text-white' : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25'
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
)

/** header jaisa live preview — jo select karoge wahi template me lagega */
function LogoPreview({ business }) {
  const theme = resolveTheme({ palette: 'ocean', font: 'inter', radius: 'md', density: 'normal', container: 'normal', headingScale: 1 })
  return (
    <div>
      <div className="label">Live preview (aapke template ka header aisa dikhega)</div>
      <div className="overflow-hidden rounded-xl border border-white/10">
        <div className="flex items-center justify-between gap-4 bg-white px-5 py-3.5" style={{ color: theme.text }}>
          <SiteLogo t={theme} biz={business} />
          <div className="flex items-center gap-4 text-[12px] font-medium text-slate-500">
            <span>Home</span><span>About</span><span>Services</span>
            <span className="rounded-md px-2.5 py-1 text-white" style={{ background: theme.primary }}>Contact</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 px-5 py-3.5" style={{ background: theme.dark }}>
          <SiteLogo t={theme} biz={business} invert />
          <span className="text-[11px] text-white/45">footer</span>
        </div>
      </div>
    </div>
  )
}

function LogoStyleOptions({ value, onChange, business }) {
  const ls = value || {}
  const set = (k) => (v) => onChange({ ...ls, [k]: v })
  return (
    <div className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div>
        <div className="label">Display style</div>
        <div className="grid gap-2 sm:grid-cols-3">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => set('mode')(m.id)}
              className={`rounded-xl border p-3 text-left transition ${
                ls.mode === m.id ? 'border-brand-400 bg-brand-500/10' : 'border-white/10 bg-white/[0.03] hover:border-white/25'
              }`}
            >
              <ModeSketch mode={m.id} hasLogo={!!business.logo} />
              <div className="mt-2.5 text-[12.5px] font-semibold">{m.label}</div>
              <div className="mt-0.5 text-[11px] text-slate-500">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <div className="label">Shape</div>
          <Seg options={SHAPES} value={ls.shape} onChange={set('shape')} />
        </div>
        <div>
          <div className="label">Size</div>
          <Seg options={SIZES} value={ls.size} onChange={set('size')} />
        </div>
        <div>
          <div className="label">Layout</div>
          <Seg options={POSITIONS} value={ls.position} onChange={set('position')} />
        </div>
      </div>

      <LogoPreview business={business} />
    </div>
  )
}

/* ------------------------- inputs ------------------------- */
const Text = ({ label, value, onChange, ph, area, hint, type = 'text', required }) => (
  <div>
    <label className="label">{label}{required ? ' *' : ''}</label>
    {area ? (
      <textarea className="field min-h-[92px]" placeholder={ph} value={value || ''} onChange={(e) => onChange(e.target.value)} />
    ) : (
      <input type={type} className="field" placeholder={ph} value={value || ''} onChange={(e) => onChange(e.target.value)} />
    )}
    {hint ? <p className="mt-1 text-[11px] text-slate-500">{hint}</p> : null}
  </div>
)

/** chips input — Enter ya comma se item add hota hai */
function Chips({ label, value = [], onChange, ph, hint }) {
  const [draft, setDraft] = useState('')
  const items = Array.isArray(value) ? value : []
  const add = (raw) => {
    const parts = String(raw).split(',').map((s) => s.trim()).filter(Boolean)
    if (!parts.length) return
    onChange([...items, ...parts.filter((p) => !items.includes(p))])
    setDraft('')
  }
  return (
    <div>
      <label className="label">{label}</label>
      <div className="rounded-lg border border-white/10 bg-white/5 p-2 focus-within:border-brand-400/60 focus-within:ring-2 focus-within:ring-brand-500/20">
        {items.length ? (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {items.map((it, i) => (
              <span key={it + i} className="inline-flex items-center gap-1.5 rounded-md bg-brand-500/15 px-2.5 py-1 text-xs font-medium text-brand-200">
                {it}
                <button type="button" className="text-brand-300/70 hover:text-white" onClick={() => onChange(items.filter((_, j) => j !== i))}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        ) : null}
        <div className="flex items-center gap-2">
          <input
            className="min-w-0 flex-1 bg-transparent px-1 py-1 text-sm text-slate-100 outline-none placeholder:text-slate-500"
            placeholder={ph}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(draft) }
              if (e.key === 'Backspace' && !draft && items.length) onChange(items.slice(0, -1))
            }}
            onBlur={() => add(draft)}
          />
          <button type="button" className="btn-ghost !px-2 !py-1" onClick={() => add(draft)}><Plus size={13} /></button>
        </div>
      </div>
      <p className="mt-1 text-[11px] text-slate-500">{hint || 'Type karke Enter dabao — ek ek karke add hote jayenge.'}</p>
    </div>
  )
}

const SectionTitle = ({ children, sub }) => (
  <div className="border-b border-white/10 pb-3">
    <h3 className="text-sm font-bold">{children}</h3>
    {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
  </div>
)

/** kam-zaroori fields ko chhupa ke rakhta hai */
function More({ label = 'More options', children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-[12.5px] font-semibold text-slate-300">{label}</span>
        <ChevronDown size={15} className={`text-slate-500 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? <div className="grid gap-5 border-t border-white/10 p-4">{children}</div> : null}
    </div>
  )
}

const STEPS = [
  { id: 0, label: 'Basics', icon: Building2 },
  { id: 1, label: 'Business', icon: Briefcase },
  { id: 2, label: 'Contact', icon: Phone },
]

/** form me jo fields dikhte hain — progress inhi ka */
const FORM_FIELDS = [
  'name', 'logo', 'slogan', 'about', 'title', 'established',
  'type', 'services', 'products', 'highlights',
  'phone', 'whatsapp', 'email', 'address', 'city', 'timing',
  'altPhone', 'altEmail', 'state', 'pincode', 'mapEmbed', 'workingDays',
  'facebook', 'instagram', 'linkedin', 'metaDescription',
]

export default function Wizard() {
  const { business, setBusiness, setStep, hasSaved, load } = useBuilder()
  const [i, setI] = useState(0)
  const b = business
  const set = (k) => (v) => setBusiness({ [k]: v })
  const last = STEPS.length - 1

  const canNext = i === 0 ? !!b.name.trim() : true
  const next = () => (i < last ? setI(i + 1) : setStep('templates'))

  const filled = FORM_FIELDS.filter((k) => (Array.isArray(b[k]) ? b[k].length : String(b[k] || '').trim())).length

  return (
    <div className="min-h-full bg-ink">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-4"><PedinnoLogo size={34} /></div>
            <h1 className="text-2xl font-extrabold tracking-tight">Create your website</h1>
            <p className="mt-1 text-sm text-slate-400">
              Sirf zaroori details — baaki sab website banne ke baad builder me edit kar sakte ho.
            </p>
          </div>
          {hasSaved() ? <button className="btn-ghost" onClick={() => load()}>Resume last project</button> : null}
        </div>

        {/* stepper */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {STEPS.map((s, idx) => {
            const Icon = s.icon
            const done = idx < i
            const active = idx === i
            return (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => idx <= i && setI(idx)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active ? 'bg-brand-500 text-white' : done ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {done ? <Check size={15} /> : <Icon size={15} />} {s.label}
                </button>
                {idx < last ? <div className="hidden h-px flex-1 bg-white/10 sm:block" /> : null}
              </React.Fragment>
            )
          })}
        </div>

        {/* progress */}
        <div className="mb-8 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(filled / FORM_FIELDS.length) * 100}%`, background: 'linear-gradient(90deg,#0f7ef0,#00c6ff)' }}
            />
          </div>
          <span className="text-[11px] tabular-nums text-slate-500">{filled} details filled</span>
        </div>

        <div className="card p-6">
          {/* ---------------- 1. BASICS ---------------- */}
          {i === 0 && (
            <div className="grid gap-5">
              <SectionTitle sub="Header, hero aur footer me yahi dikhega.">Company basics</SectionTitle>
              <Text label="Company name" value={b.name} onChange={set('name')} ph="e.g. Pedinno AI" required />
              <LogoField value={b.logo} onChange={set('logo')} name={b.name} />
              <LogoStyleOptions value={b.logoStyle} onChange={set('logoStyle')} business={b} />
              <Text label="Tagline" value={b.slogan} onChange={set('slogan')} ph="Ek line me aap kya karte ho" />
              <Text label="About the company" value={b.about} onChange={set('about')} area ph="2-3 sentences — kya karte ho aur kiske liye." />

              <More>
                <Text label="Website headline" value={b.title} onChange={set('title')} ph="Home page ka bada heading" hint="Khali chhoda to company name use hoga." />
                <Text label="Established year" value={b.established} onChange={set('established')} ph="2015" hint="Isse About me 'X+ years' badge ban jata hai." />
              </More>
            </div>
          )}

          {/* ---------------- 2. BUSINESS ---------------- */}
          {i === 1 && (
            <div className="grid gap-5">
              <SectionTitle sub="Isse template recommend hote hain aur sections auto bharte hain.">What you do</SectionTitle>
              <div>
                <label className="label">Website type</label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {TYPES.map((t) => (
                    <button key={t.id} onClick={() => setBusiness({ type: t.id, subType: '' })}
                      className={`rounded-xl border p-4 text-left transition ${
                        b.type === t.id ? 'border-brand-400 bg-brand-500/10' : 'border-white/10 bg-white/[0.03] hover:border-white/25'
                      }`}>
                      <div className="text-sm font-semibold">{t.label}</div>
                      <div className="mt-1 text-xs text-slate-400">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {b.type ? (
                <div>
                  <label className="label">Focus</label>
                  <div className="flex flex-wrap gap-2">
                    {(TYPES.find((t) => t.id === b.type)?.subs || []).map((s) => (
                      <button key={s} onClick={() => setBusiness({ subType: s })}
                        className={`rounded-lg border px-3.5 py-2 text-sm transition ${
                          b.subType === s ? 'border-brand-400 bg-brand-500/15 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <Chips label="Services you offer" value={b.services} onChange={set('services')} ph="Type a service and press Enter" hint="Services section aur footer links me chale jayenge." />

              <More>
                <Chips label="Products" value={b.products} onChange={set('products')} ph="Product name, Enter" />
                <Chips label="Key highlights / USP" value={b.highlights} onChange={set('highlights')} ph="e.g. 24x7 support, ISO certified" hint="About ke bullet points ban jate hain." />
              </More>
            </div>
          )}

          {/* ---------------- 3. CONTACT ---------------- */}
          {i === 2 && (
            <div className="grid gap-5">
              <SectionTitle sub="Contact section, header bar aur footer me use hota hai.">How to reach you</SectionTitle>
              <div className="grid gap-5 sm:grid-cols-2">
                <Text label="Mobile number" value={b.phone} onChange={set('phone')} ph="+91 98765 43210" />
                <Text label="WhatsApp number" value={b.whatsapp} onChange={set('whatsapp')} ph="+91 98765 43210" />
                <Text label="Email" value={b.email} onChange={set('email')} ph="hello@company.com" type="email" />
                <Text label="City" value={b.city} onChange={set('city')} ph="Jaipur" />
              </div>
              <Text label="Address" value={b.address} onChange={set('address')} area ph="Building, street, area" />
              <Text label="Office timing" value={b.timing} onChange={set('timing')} ph="Mon - Sat, 10:00 AM - 7:00 PM" />

              <More label="More options (map, social links, SEO)">
                <Text
                  label="Google Maps embed URL"
                  value={b.mapEmbed}
                  onChange={set('mapEmbed')}
                  ph="https://www.google.com/maps/embed?pb=..."
                  hint="Google Maps -> Share -> Embed a map -> src wala link."
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Text label="Alternate number" value={b.altPhone} onChange={set('altPhone')} ph="Landline / second number" />
                  <Text label="Alternate email" value={b.altEmail} onChange={set('altEmail')} ph="support@company.com" type="email" />
                  <Text label="State" value={b.state} onChange={set('state')} ph="Rajasthan" />
                  <Text label="Pincode" value={b.pincode} onChange={set('pincode')} ph="302001" />
                  <Text label="Facebook" value={b.facebook} onChange={set('facebook')} ph="https://facebook.com/yourpage" />
                  <Text label="Instagram" value={b.instagram} onChange={set('instagram')} ph="https://instagram.com/yourpage" />
                  <Text label="LinkedIn" value={b.linkedin} onChange={set('linkedin')} ph="https://linkedin.com/company/..." />
                  <Text label="Working days" value={b.workingDays} onChange={set('workingDays')} ph="Monday - Saturday" />
                </div>
                <Text label="Meta description (SEO)" value={b.metaDescription} onChange={set('metaDescription')} area ph="Google search me dikhne wali 1-2 line" hint="Khali chhoda to tagline/about se auto bhar jayega." />
              </More>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button className="btn-ghost" onClick={() => (i > 0 ? setI(i - 1) : setStep('landing'))}>
            <ChevronLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-3">
            {i > 0 ? <button className="btn-ghost" onClick={() => setStep('templates')}>Skip to templates</button> : null}
            <button className="btn-primary disabled:opacity-40" onClick={next} disabled={!canNext}>
              {i === last ? 'Choose a template' : 'Continue'} <ChevronRight size={16} />
            </button>
          </div>
        </div>
        {!canNext ? <p className="mt-3 text-right text-xs text-amber-400/80">Company name is required.</p> : null}
      </div>
    </div>
  )
}

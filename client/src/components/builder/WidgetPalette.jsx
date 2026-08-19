import React, { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { widgetGroups } from '../../sections/widgets'
import { useBuilder } from '../../store/useBuilder'
import StructurePanel from './StructurePanel'
import {
  Plus, Search, ChevronDown, Layers, LayoutGrid as GridIcon,
  PanelTop, PanelBottom, Sparkles, LayoutGrid, Rows3, Blocks, Quote, Star,
  Image as ImageIcon, Images, Video, Phone, MapPin, Type, AlignLeft, MousePointerClick,
  Minus, BarChart3, Users, Tag, HelpCircle, Mail, Megaphone, ListOrdered, Trophy, Hash, Boxes,
} from 'lucide-react'

/* Groups ka order — sabse kaam ka pehle */
const GROUP_ORDER = [
  'Sabse Upar', 'Main Content', 'Bharosa Banane Ke Liye',
  'Photo aur Video', 'Sampark', 'Upar aur Neeche', 'Chhoti Cheezein',
]

const ICONS = {
  header: PanelTop, footer: PanelBottom, hero: Sparkles, announce: Megaphone,
  about: AlignLeft, services: LayoutGrid, products: Boxes, stats: BarChart3,
  info: Rows3, chart: BarChart3, bento: Blocks, work: Trophy, bigstats: Hash,
  process: ListOrdered, marquee: Megaphone, testimonials: Quote, logos: Star,
  logocloud: Star, feature: Blocks, gallery: Images, video: Video, team: Users,
  pricing: Tag, faq: HelpCircle, cta: Megaphone, newsletter: Mail,
  contact: Phone, map: MapPin,
  heading: Type, text: AlignLeft, image: ImageIcon, button: MousePointerClick, spacer: Minus,
}

/** ek widget ka card — bada, samjhane wala */
function WidgetCard({ w }) {
  const addBlock = useBuilder((s) => s.addBlock)
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new:${w.key}`, data: { type: 'new', widget: w.key },
  })
  const Icon = ICONS[w.key] || Blocks

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => addBlock(w.key)}
      title="Click karo — page me lag jayega. Ya drag karke jahan chahiye wahan chhodo."
      className={`group cursor-pointer rounded-xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-brand-400/60 hover:bg-brand-500/10 active:scale-[0.98] ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-500/15 text-brand-300">
          <Icon size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-semibold leading-tight text-slate-100">{w.label}</div>
          {w.desc ? <div className="mt-0.5 text-[10.5px] leading-snug text-slate-400">{w.desc}</div> : null}
        </div>
        <span className="mt-0.5 shrink-0 rounded-md bg-white/5 p-1 text-slate-500 opacity-0 transition group-hover:bg-brand-500 group-hover:text-white group-hover:opacity-100">
          <Plus size={12} />
        </span>
      </div>
    </div>
  )
}

export default function WidgetPalette() {
  const [tab, setTab] = useState('structure')
  const [q, setQ] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [closed, setClosed] = useState({})

  const groups = widgetGroups()
  const all = Object.values(groups).flat()
  const searching = q.trim().length > 0
  const match = (w) =>
    w.label.toLowerCase().includes(q.toLowerCase()) ||
    (w.desc || '').toLowerCase().includes(q.toLowerCase())

  const popular = all.filter((w) => w.popular)
  const keys = GROUP_ORDER.filter((g) => groups[g]).concat(Object.keys(groups).filter((g) => !GROUP_ORDER.includes(g)))

  return (
    <aside className="flex h-full w-[264px] shrink-0 flex-col overflow-hidden border-r border-white/10 bg-panel">
      {/* do tabs */}
      <div className="flex shrink-0 border-b border-white/10">
        {[['structure', 'Pages', Layers], ['widgets', 'Cheezein', GridIcon]].map(([k, label, Icon]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold uppercase tracking-wider transition ${
              tab === k ? 'border-b-2 border-brand-500 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {tab === 'structure' ? (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 pb-16">
          <StructurePanel />
        </div>
      ) : (
        <>
          <div className="shrink-0 border-b border-white/10 p-3">
            <p className="mb-2.5 text-[11px] leading-relaxed text-slate-400">
              Jo cheez website me chahiye, uspe <b className="text-slate-200">click</b> karo —
              page ke neeche lag jayegi. Ya <b className="text-slate-200">uthake</b> jahan chahiye wahan chhodo.
            </p>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className="field !py-2 !pl-8 !text-xs"
                placeholder="Dhoondo — jaise photo, review, price"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 pb-16">
            {/* khoj ka result */}
            {searching ? (
              <div className="grid gap-2">
                {all.filter(match).map((w) => <WidgetCard key={w.key} w={w} />)}
                {!all.filter(match).length ? (
                  <p className="py-10 text-center text-[11.5px] text-slate-500">
                    Kuch nahi mila.<br />Doosre shabd se dhoondh ke dekho.
                  </p>
                ) : null}
              </div>
            ) : !showAll ? (
              /* shuruaat me sirf kaam ki cheezein */
              <>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Sabse zyada kaam aane wali
                </div>
                <div className="grid gap-2">
                  {popular.map((w) => <WidgetCard key={w.key} w={w} />)}
                </div>

                <button
                  onClick={() => setShowAll(true)}
                  className="btn-ghost mt-3 w-full !py-2 !text-[11.5px]"
                >
                  Aur {all.length - popular.length} cheezein dekho
                </button>
              </>
            ) : (
              /* poori list, group ke hisaab se */
              <>
                <button
                  onClick={() => setShowAll(false)}
                  className="btn-ghost mb-3 w-full !py-1.5 !text-[11px]"
                >
                  Sirf kaam ki cheezein dikhao
                </button>

                {keys.map((g) => {
                  const items = groups[g]
                  if (!items?.length) return null
                  const open = !closed[g]
                  return (
                    <div key={g} className="mb-3">
                      <button
                        onClick={() => setClosed((c) => ({ ...c, [g]: !c[g] }))}
                        className="mb-1.5 flex w-full items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:text-slate-300"
                      >
                        <ChevronDown size={12} className={`transition ${open ? '' : '-rotate-90'}`} />
                        {g}
                        <span className="ml-auto font-normal normal-case tracking-normal text-slate-600">{items.length}</span>
                      </button>
                      {open ? <div className="grid gap-2">{items.map((w) => <WidgetCard key={w.key} w={w} />)}</div> : null}
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </>
      )}
    </aside>
  )
}

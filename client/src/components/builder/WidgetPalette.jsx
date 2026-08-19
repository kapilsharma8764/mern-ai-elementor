import React, { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { widgetGroups } from '../../sections/widgets'
import { useBuilder } from '../../store/useBuilder'
import StructurePanel from './StructurePanel'
import {
  GripVertical, Plus, Search, ChevronDown, Layers, LayoutGrid as GridIcon,
  PanelTop, PanelBottom, Sparkles, LayoutGrid, Rows3, Blocks, Quote, Star,
  Image as ImageIcon, Images, Video, Phone, MapPin, Type, AlignLeft, MousePointerClick,
  Minus, BarChart3, Users, Tag, HelpCircle, Mail, Megaphone, ListOrdered, Trophy, Hash, Boxes,
} from 'lucide-react'

const GROUP_ORDER = ['Layout', 'Hero', 'Content', 'Social proof', 'Media', 'Contact', 'Basic']

/** har widget ka icon — list scan karna aasan ho jata hai */
const ICONS = {
  header: PanelTop, footer: PanelBottom, hero: Sparkles,
  about: AlignLeft, services: LayoutGrid, products: Boxes, stats: BarChart3,
  info: Rows3, chart: BarChart3, bento: Blocks, work: Trophy, bigstats: Hash,
  process: ListOrdered, marquee: Megaphone, testimonials: Quote, logos: Star,
  gallery: Images, video: Video, team: Users, pricing: Tag, faq: HelpCircle,
  cta: Megaphone, newsletter: Mail, contact: Phone, map: MapPin,
  heading: Type, text: AlignLeft, image: ImageIcon, button: MousePointerClick, spacer: Minus,
}

function PaletteItem({ w }) {
  const addBlock = useBuilder((s) => s.addBlock)
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `new:${w.key}`, data: { type: 'new', widget: w.key } })
  const Icon = ICONS[w.key] || Blocks

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      title={`${w.label} — drag onto the canvas`}
      className={`group flex cursor-grab items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-2.5 pr-1.5 text-xs text-slate-200 transition hover:border-brand-400/60 hover:bg-brand-500/10 active:cursor-grabbing ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <Icon size={14} className="shrink-0 text-brand-300/80" />
      <span className="min-w-0 flex-1 truncate font-medium leading-tight">{w.label}</span>
      <button
        onClick={(e) => { e.stopPropagation(); addBlock(w.key) }}
        onPointerDown={(e) => e.stopPropagation()}
        className="shrink-0 rounded p-1 text-slate-500 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100"
        title="Add to end of page"
      >
        <Plus size={13} />
      </button>
      <GripVertical size={12} className="shrink-0 text-slate-600" />
    </div>
  )
}

export default function WidgetPalette() {
  const [tab, setTab] = useState('structure')   // structure | widgets
  const [q, setQ] = useState('')
  const [closed, setClosed] = useState({})
  const groups = widgetGroups()
  const keys = GROUP_ORDER.filter((g) => groups[g]).concat(Object.keys(groups).filter((g) => !GROUP_ORDER.includes(g)))
  const searching = q.trim().length > 0
  const total = Object.values(groups).reduce((a, g) => a + g.length, 0)

  return (
    <aside className="flex h-full w-[264px] shrink-0 flex-col overflow-hidden border-r border-white/10 bg-panel">
      {/* do tabs — website ka dhaancha, aur widgets */}
      <div className="flex shrink-0 border-b border-white/10">
        {[['structure', 'Pages', Layers], ['widgets', 'Widgets', GridIcon]].map(([k, label, Icon]) => (
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
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Widgets</span>
          <span className="text-[10px] text-slate-500">{total}</span>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="field !py-1.5 !pl-8 !text-xs"
            placeholder="Search widget"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
          Canvas pe drag karo, ya <Plus size={9} className="inline" /> se page ke end me add karo.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 pb-16">
        {keys.map((g) => {
          const items = groups[g].filter((w) => w.label.toLowerCase().includes(q.toLowerCase()))
          if (!items.length) return null
          const open = searching || !closed[g]
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
              {open ? <div className="grid gap-1.5">{items.map((w) => <PaletteItem key={w.key} w={w} />)}</div> : null}
            </div>
          )
        })}
        {searching && !keys.some((g) => groups[g].some((w) => w.label.toLowerCase().includes(q.toLowerCase()))) ? (
          <p className="py-8 text-center text-[11px] text-slate-500">Koi widget nahi mila.</p>
        ) : null}
      </div>
      </>
      )}
    </aside>
  )
}

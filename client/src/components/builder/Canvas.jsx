import React, { useMemo, useRef } from 'react'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDroppable } from '@dnd-kit/core'
import { useBuilder, resolveTheme } from '../../store/useBuilder'
import { BlockView } from '../../sections/Renderer'
import { WIDGETS } from '../../sections/widgets'
import { GripVertical, Copy, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Pencil, Layers } from 'lucide-react'
import AddHere from './AddHere'
import ElementLayer from './ElementEdit'

const DEVICE_W = { desktop: 1280, tablet: 834, mobile: 420 }

function BlockFrame({ block, index, total, theme, business }) {
  const selectedId = useBuilder((s) => s.selectedId)
  const select = useBuilder((s) => s.select)
  const duplicateBlock = useBuilder((s) => s.duplicateBlock)
  const removeBlock = useBuilder((s) => s.removeBlock)
  const moveBlock = useBuilder((s) => s.moveBlock)
  const setStyle = useBuilder((s) => s.setStyle)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const selected = selectedId === block.id
  const w = WIDGETS[block.type]
  const frameRef = useRef(null)
  const setRefs = (el) => { frameRef.current = el; setNodeRef(el) }

  return (
    <div
      ref={setRefs}
      style={{ transform: CSS.Transform.toString(transform), transition, position: 'relative', zIndex: isDragging ? 40 : selected ? 20 : 1 }}
      className={`group relative ${isDragging ? 'opacity-60' : ''}`}
      data-block={block.id}
      onClick={(e) => { e.stopPropagation(); select(block.id) }}
    >
      {/* outline */}
      <div className={`pointer-events-none absolute inset-0 z-10 rounded-[2px] ring-inset transition ${
        selected ? 'ring-2 ring-brand-500' : 'ring-1 ring-transparent group-hover:ring-2 group-hover:ring-brand-400/50'
      }`} />

      {/* toolbar */}
      <div className={`absolute -top-3 right-3 z-30 flex items-center gap-0.5 rounded-lg border border-white/10 bg-panel/95 px-1 py-1 shadow-soft backdrop-blur transition ${
        selected ? 'opacity-100' : 'pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100'
      }`}>
        <span {...listeners} {...attributes} className="cursor-grab rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white active:cursor-grabbing" title="Pakad ke upar-neeche karo">
          <GripVertical size={13} />
        </span>
        <span className="px-1.5 text-[11px] font-semibold text-slate-300">{w?.label || block.type}</span>
        <button
          className="mr-0.5 flex items-center gap-1 rounded bg-brand-500/20 px-2 py-1 text-[11px] font-semibold text-brand-200 transition hover:bg-brand-500 hover:text-white"
          onClick={(e) => { e.stopPropagation(); select(block.id, 'content') }}
          title="Edit content"
        >
          <Pencil size={12} /> Edit
        </button>
        <button className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30" disabled={index === 0} onClick={(e) => { e.stopPropagation(); moveBlock(index, index - 1) }} title="Upar le jao"><ArrowUp size={13} /></button>
        <button className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30" disabled={index === total - 1} onClick={(e) => { e.stopPropagation(); moveBlock(index, index + 1) }} title="Neeche le jao"><ArrowDown size={13} /></button>
        <button className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white" onClick={(e) => { e.stopPropagation(); setStyle(block.id, 'hidden', !block.style.hidden) }} title={block.style.hidden ? 'Show' : 'Hide'}>
          {block.style.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
        <button className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white" onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id) }} title="Copy banao"><Copy size={13} /></button>
        <button className="rounded p-1 text-rose-400 hover:bg-rose-500/20" onClick={(e) => { e.stopPropagation(); removeBlock(block.id) }} title="Hatao"><Trash2 size={13} /></button>
      </div>

      {block.style.hidden ? (
        <div className="flex items-center justify-center gap-2 border border-dashed border-white/15 bg-white/[0.02] py-8 text-xs text-slate-500">
          <EyeOff size={14} /> {w?.label} chhupi hui hai
        </div>
      ) : (
        <>
          <BlockView block={block} theme={theme} business={business} />
          <ElementLayer block={block} frameRef={frameRef} active={!isDragging && !block.style.hidden} />

          {/* Drag strip — section ke baayin kinare pe, hover pe dikhta hai.
              Alag rakha hai taaki andar ka content click karke select ho sake. */}
          <div
            {...listeners}
            {...attributes}
            title="Yahan se pakad ke upar-neeche karo"
            className="absolute inset-y-0 left-0 z-20 flex w-6 cursor-grab items-center justify-center opacity-0 transition group-hover:opacity-100 active:cursor-grabbing"
          >
            <span className="flex h-16 w-1.5 items-center justify-center rounded-full bg-brand-500/70 shadow-soft" />
          </div>
        </>
      )}
    </div>
  )
}

function StaticFrame({ id, block, theme, business, label }) {
  const selectedId = useBuilder((s) => s.selectedId)
  const select = useBuilder((s) => s.select)
  const setStyle = useBuilder((s) => s.setStyle)
  const selected = selectedId === id
  const frameRef = useRef(null)
  const hidden = !!block.style?.hidden
  return (
    <div ref={frameRef} className="group relative" data-block={id} onClick={(e) => { e.stopPropagation(); select(id) }}>
      <div className={`pointer-events-none absolute inset-0 z-10 ring-inset transition ${
        selected ? 'ring-2 ring-brand-500' : 'ring-1 ring-transparent group-hover:ring-2 group-hover:ring-brand-400/50'
      }`} />
      <div className={`absolute ${label === 'Footer' ? '-bottom-3' : '-top-3'} right-3 z-30 flex items-center gap-1 rounded-lg border border-white/10 bg-panel/95 px-1.5 py-1 shadow-soft transition ${
        selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <span className="px-1 text-[11px] font-semibold text-slate-300">{label}</span>
        <button
          className="flex items-center gap-1 rounded bg-brand-500/20 px-2 py-1 text-[11px] font-semibold text-brand-200 transition hover:bg-brand-500 hover:text-white"
          onClick={(e) => { e.stopPropagation(); select(id, 'content') }}
          title="Edit"
        >
          <Pencil size={12} /> Edit
        </button>
        <button
          className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
          onClick={(e) => { e.stopPropagation(); setStyle(id, 'hidden', !hidden) }}
          title={hidden ? `${label} wapas dikhao` : `${label} hatao (kabhi bhi wapas la sakte ho)`}
        >
          {hidden ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
      </div>
      {hidden ? (
        <div className="flex items-center justify-center gap-2 border border-dashed border-white/15 bg-white/[0.02] py-6 text-xs text-slate-500">
          <EyeOff size={14} /> {label} hataya hua hai — wapas laane ke liye aankh dabao
        </div>
      ) : (
        <>
          <BlockView block={block} theme={theme} business={business} />
          <ElementLayer block={{ ...block, id }} frameRef={frameRef} active />
        </>
      )}
    </div>
  )
}

function DropEnd() {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-end' })
  return (
    <div ref={setNodeRef} className={`m-4 rounded-xl border-2 border-dashed p-8 text-center text-xs transition ${
      isOver ? 'border-brand-400 bg-brand-500/10 text-brand-200' : 'border-white/10 text-slate-500'
    }`}>
      Yahan chhodo — page ke aakhir me lag jayega
    </div>
  )
}

/** poore page ke sections ka dropdown — kisi bhi section ko seedha select karo */
function SectionSelect({ page }) {
  const selectedId = useBuilder((s) => s.selectedId)
  const select = useBuilder((s) => s.select)
  const options = [
    { id: 'header', label: 'Header' },
    ...page.blocks.map((b, i) => ({ id: b.id, label: `${i + 1}. ${WIDGETS[b.type]?.label || b.type}`, hidden: b.style?.hidden })),
    { id: 'footer', label: 'Footer' },
  ]
  const jump = (id) => {
    if (!id) return
    select(id, 'content')
    document.querySelector(`[data-block="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  return (
    <div className="mx-auto mb-3 flex max-w-full items-center gap-2" style={{ width: 'fit-content' }}>
      <Layers size={14} className="text-slate-500" />
      <select
        className="field !w-56 !py-1.5 !text-xs"
        value={selectedId || ''}
        onChange={(e) => jump(e.target.value)}
        onClick={(e) => e.stopPropagation()}
      >
        <option value="">Kis cheez pe jaana hai?</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.label}{o.hidden ? ' (hidden)' : ''}</option>
        ))}
      </select>
      <span className="text-[11px] text-slate-500">{page.blocks.length} cheezein “{page.name}” page pe</span>
    </div>
  )
}

export default function Canvas() {
  const site = useBuilder((s) => s.site)
  const business = useBuilder((s) => s.business)
  const device = useBuilder((s) => s.device)
  const select = useBuilder((s) => s.select)
  const page = useBuilder((s) => s.site?.pages.find((p) => p.id === s.currentPageId) || s.site?.pages[0])
  const theme = useMemo(() => resolveTheme(site.theme), [site.theme])
  const width = DEVICE_W[device]

  return (
    <div className="min-w-0 flex-1 overflow-auto overscroll-contain bg-[#0d1326] px-6 pb-24 pt-4" onClick={() => select(null)}>
      <SectionSelect page={page} />

      <div
        className="mx-auto mt-4 select-none bg-white shadow-[0_30px_80px_-40px_rgba(0,0,0,.9)] transition-[width] duration-300"
        style={{ width, maxWidth: '100%' }}
      >
        <div className="sitewrap" style={{ background: theme.bg }}>
          <StaticFrame id="header" block={site.header} theme={theme} business={business} label="Header" />

          <SortableContext items={page.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            {page.blocks.map((b, i) => (
              <React.Fragment key={b.id}>
                <AddHere index={i} />
                <BlockFrame block={b} index={i} total={page.blocks.length} theme={theme} business={business} />
              </React.Fragment>
            ))}
          </SortableContext>

          <AddHere index={page.blocks.length} />
          <DropEnd />

          <StaticFrame id="footer" block={site.footer} theme={theme} business={business} label="Footer" />
        </div>
      </div>
    </div>
  )
}

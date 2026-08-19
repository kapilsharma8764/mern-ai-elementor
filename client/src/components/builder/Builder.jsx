import React, { useEffect, useMemo, useRef, useState } from 'react'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useBuilder, resolveTheme } from '../../store/useBuilder'
import { WIDGETS } from '../../sections/widgets'
import { SiteView } from '../../sections/Renderer'
import WidgetPalette from './WidgetPalette'
import Canvas from './Canvas'
import Inspector from './Inspector'
import Topbar from './Topbar'
import { resolveDrop, applyDrop } from './dnd'
import { X, Monitor, Tablet, Smartphone } from 'lucide-react'

function PreviewOverlay() {
  const { site, business, togglePreview, currentPageId, setPage } = useBuilder()
  const [device, setDevice] = useState('desktop')
  const scrollRef = useRef(null)

  /** preview ke andar links ko asli navigation do */
  const onNavigate = (link, href) => {
    if (link?.kind === 'page') {
      const target = site.pages.find((p) => p.id === link.target)
      if (target) { setPage(target.id); scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); return true }
    }
    if (href?.startsWith('#')) {
      const id = href.slice(1)
      const el = scrollRef.current?.querySelector(`#${CSS.escape(id)}`)
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return true }
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      return true
    }
    return false
  }
  const theme = useMemo(() => resolveTheme(site.theme), [site.theme])
  const page = site.pages.find((p) => p.id === currentPageId) || site.pages[0]
  const W = { desktop: '100%', tablet: 834, mobile: 420 }[device]

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink">
      <div className="flex items-center gap-3 border-b border-white/10 bg-panel px-4 py-2">
        <span className="text-[13px] font-bold">Preview — {business.name || 'Your site'}</span>
        <div className="flex gap-1">
          {site.pages.map((p) => (
            <button key={p.id} onClick={() => setPage(p.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium ${p.id === page.id ? 'bg-brand-500 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
              {p.name}
            </button>
          ))}
        </div>
        <div className="ml-auto flex rounded-lg bg-white/5 p-0.5">
          {[['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]].map(([d, Icon]) => (
            <button key={d} onClick={() => setDevice(d)}
              className={`rounded-md p-1.5 ${device === d ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}><Icon size={15} /></button>
          ))}
        </div>
        <button className="btn-ghost" onClick={togglePreview}><X size={15} /> Close</button>
      </div>
      <div className="flex-1 overflow-auto bg-[#0d1326] p-4" ref={scrollRef}>
        <div className="mx-auto bg-white shadow-2xl" style={{ width: W, maxWidth: '100%' }}>
          <SiteView site={site} theme={theme} business={business} page={page} nav={onNavigate} />
        </div>
      </div>
    </div>
  )
}

export default function Builder() {
  const { site, previewMode, addBlock, moveBlock, undo, redo, currentPageId, selectedPath, clearPath, select } = useBuilder()
  const [activeDrag, setActiveDrag] = useState(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        e.shiftKey ? redo() : undo()
      }
      // Escape — pehle element deselect, phir section
      if (e.key === 'Escape' && !e.target.isContentEditable) {
        selectedPath ? clearPath() : select(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo, selectedPath, clearPath, select])

  if (!site) return null

  const page = site.pages.find((p) => p.id === currentPageId) || site.pages[0]

  const onDragStart = (e) => setActiveDrag(e.active)

  const onDragEnd = (e) => {
    setActiveDrag(null)
    const { active, over } = e
    if (!over) return
    const ids = page.blocks.map((b) => b.id)
    applyDrop(resolveDrop(active.id, over.id, ids), { addBlock, moveBlock })
  }

  const dragLabel = activeDrag
    ? String(activeDrag.id).startsWith('new:')
      ? WIDGETS[String(activeDrag.id).slice(4)]?.label
      : WIDGETS[page.blocks.find((b) => b.id === activeDrag.id)?.type]?.label
    : null

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-ink">
      <Topbar />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActiveDrag(null)}>
        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          <WidgetPalette />
          <Canvas />
          <Inspector />
        </div>
        <DragOverlay dropAnimation={null}>
          {dragLabel ? (
            <div className="rounded-lg border border-brand-400/60 bg-brand-500/90 px-3 py-2 text-xs font-semibold text-white shadow-soft">
              {dragLabel}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      {previewMode ? <PreviewOverlay /> : null}
    </div>
  )
}

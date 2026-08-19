import React, { useState } from 'react'
import { useBuilder } from '../../store/useBuilder'
import { WIDGETS } from '../../sections/widgets'
import {
  PanelTop, PanelBottom, FileText, Plus, ChevronRight, Eye, EyeOff,
  ArrowUp, ArrowDown, Copy, Trash2, Pencil, X, Check,
} from 'lucide-react'

/* ------------------------------------------------------------------ *
 * Website ka poora dhaancha ek nazar me:
 *
 *   HEADER            (sab pages me upar)
 *   PAGES
 *     Home            > sections
 *     Services        > sections
 *     About
 *   FOOTER            (sab pages me neeche)
 *
 * Yahan se koi bhi page ya section select karo, order badlo, hide karo.
 * ------------------------------------------------------------------ */

/** header / footer ki row */
function SiteRow({ id, label, hint, Icon }) {
  const block = useBuilder((s) => (id === 'header' ? s.site?.header : s.site?.footer))
  const selectedId = useBuilder((s) => s.selectedId)
  const select = useBuilder((s) => s.select)
  const setStyle = useBuilder((s) => s.setStyle)

  const hidden = !!block?.style?.hidden
  const active = selectedId === id

  const jump = () => {
    select(id, 'content')
    document.querySelector(`[data-block="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div
      onClick={jump}
      className={`group flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 transition ${
        active ? 'border-brand-400 bg-brand-500/15' : 'border-white/10 bg-white/[0.04] hover:border-white/25'
      } ${hidden ? 'opacity-50' : ''}`}
    >
      <Icon size={14} className="shrink-0 text-brand-300/80" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12px] font-semibold">{label}</div>
        <div className="truncate text-[10px] text-slate-500">{hidden ? 'chhupa hua' : hint}</div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); setStyle(id, 'hidden', !hidden) }}
        className="rounded p-1 text-slate-500 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100"
        title={hidden ? 'Wapas dikhao' : 'Chhupa do'}
      >
        {hidden ? <EyeOff size={12} /> : <Eye size={12} />}
      </button>
    </div>
  )
}

/** ek page ke andar ke sections */
function SectionList({ page }) {
  const selectedId = useBuilder((s) => s.selectedId)
  const select = useBuilder((s) => s.select)
  const moveBlock = useBuilder((s) => s.moveBlock)
  const removeBlock = useBuilder((s) => s.removeBlock)
  const duplicateBlock = useBuilder((s) => s.duplicateBlock)
  const setStyle = useBuilder((s) => s.setStyle)

  if (!page.blocks.length) {
    return <p className="px-2 py-3 text-[11px] text-slate-500">Is page pe abhi kuch nahi. Left me "Cheezein" tab se koi cheez uthake yahan lao.</p>
  }

  return (
    <div className="grid gap-1 py-1 pl-3">
      {page.blocks.map((b, i) => {
        const active = selectedId === b.id
        const hidden = !!b.style?.hidden
        const jump = () => {
          select(b.id, 'content')
          document.querySelector(`[data-block="${b.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
        return (
          <div
            key={b.id}
            onClick={jump}
            className={`group flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1.5 text-[11.5px] transition ${
              active ? 'border-brand-400 bg-brand-500/15 text-white' : 'border-transparent text-slate-300 hover:bg-white/5'
            } ${hidden ? 'opacity-45' : ''}`}
          >
            <span className="w-4 shrink-0 text-[10px] text-slate-600">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate">{WIDGETS[b.type]?.label || b.type}</span>

            <span className="flex shrink-0 items-center opacity-0 transition group-hover:opacity-100">
              <button className="rounded p-0.5 text-slate-500 hover:text-white disabled:opacity-30" disabled={i === 0}
                onClick={(e) => { e.stopPropagation(); moveBlock(i, i - 1) }} title="Upar le jao"><ArrowUp size={11} /></button>
              <button className="rounded p-0.5 text-slate-500 hover:text-white disabled:opacity-30" disabled={i === page.blocks.length - 1}
                onClick={(e) => { e.stopPropagation(); moveBlock(i, i + 1) }} title="Neeche le jao"><ArrowDown size={11} /></button>
              <button className="rounded p-0.5 text-slate-500 hover:text-white"
                onClick={(e) => { e.stopPropagation(); setStyle(b.id, 'hidden', !hidden) }} title={hidden ? 'Wapas dikhao' : 'Chhupa do'}>
                {hidden ? <EyeOff size={11} /> : <Eye size={11} />}
              </button>
              <button className="rounded p-0.5 text-slate-500 hover:text-white"
                onClick={(e) => { e.stopPropagation(); duplicateBlock(b.id) }} title="Copy banao"><Copy size={11} /></button>
              <button className="rounded p-0.5 text-rose-400/70 hover:text-rose-300"
                onClick={(e) => { e.stopPropagation(); removeBlock(b.id) }} title="Hatao"><Trash2 size={11} /></button>
            </span>
          </div>
        )
      })}
    </div>
  )
}

/** ek page ki row */
function PageRow({ page, index, total }) {
  const currentPageId = useBuilder((s) => s.currentPageId)
  const setPage = useBuilder((s) => s.setPage)
  const renamePage = useBuilder((s) => s.renamePage)
  const removePage = useBuilder((s) => s.removePage)

  const active = page.id === currentPageId
  const [open, setOpen] = useState(active)
  const [editing, setEditing] = useState(false)

  return (
    <div className={`rounded-lg border transition ${active ? 'border-brand-400/60 bg-brand-500/10' : 'border-white/10 bg-white/[0.03]'}`}>
      <div className="flex items-center gap-1.5 px-2 py-2">
        <button
          onClick={() => { setPage(page.id); setOpen(!open || !active) }}
          className="shrink-0 rounded p-0.5 text-slate-500 hover:text-white"
          title="Is page ki cheezein dekho"
        >
          <ChevronRight size={13} className={`transition ${open && active ? 'rotate-90' : ''}`} />
        </button>

        <FileText size={13} className="shrink-0 text-slate-400" />

        {editing ? (
          <input
            autoFocus
            defaultValue={page.name}
            onBlur={(e) => { renamePage(page.id, e.target.value || page.name); setEditing(false) }}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            className="min-w-0 flex-1 rounded bg-white/10 px-1.5 py-0.5 text-[12px] outline-none"
          />
        ) : (
          <button onClick={() => { setPage(page.id); setOpen(true) }} className="min-w-0 flex-1 text-left">
            <span className="block truncate text-[12px] font-semibold">{page.name}</span>
            <span className="block text-[10px] text-slate-500">{page.blocks.length} cheezein</span>
          </button>
        )}

        <span className="flex shrink-0 items-center gap-0.5">
          <button className="rounded p-1 text-slate-500 hover:text-white" title="Page ka naam badlo"
            onClick={(e) => { e.stopPropagation(); setEditing(true) }}><Pencil size={11} /></button>
          {total > 1 ? (
            <button className="rounded p-1 text-rose-400/70 hover:text-rose-300" title="Page hatao"
              onClick={(e) => { e.stopPropagation(); removePage(page.id) }}><Trash2 size={11} /></button>
          ) : null}
        </span>
      </div>

      {open && active ? <SectionList page={page} /> : null}
    </div>
  )
}

export default function StructurePanel() {
  const pages = useBuilder((s) => s.site?.pages || [])
  const addPage = useBuilder((s) => s.addPage)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)

  const create = () => {
    const n = newName.trim()
    if (n) addPage(n)
    setNewName('')
    setAdding(false)
  }

  return (
    <div className="grid gap-3">
      {/* HEADER — sabse upar */}
      <div>
        <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Har page me sabse upar</div>
        <SiteRow id="header" label="Header" hint="logo, menu, button" Icon={PanelTop} />
      </div>

      {/* PAGES */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pages</span>
          <span className="text-[10px] text-slate-600">{pages.length}</span>
        </div>

        <div className="grid gap-1.5">
          {pages.map((p, i) => <PageRow key={p.id} page={p} index={i} total={pages.length} />)}
        </div>

        {adding ? (
          <div className="mt-1.5 flex items-center gap-1">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') create(); if (e.key === 'Escape') setAdding(false) }}
              placeholder="Jaise: About, Contact"
              className="field !py-1.5 !text-[12px]"
            />
            <button className="rounded p-1.5 text-emerald-300 hover:bg-white/10" onClick={create}><Check size={14} /></button>
            <button className="rounded p-1.5 text-slate-500 hover:bg-white/10" onClick={() => setAdding(false)}><X size={14} /></button>
          </div>
        ) : (
          <button className="btn-ghost mt-1.5 w-full !py-1.5 !text-[11px]" onClick={() => setAdding(true)}>
            <Plus size={13} /> Naya page banao
          </button>
        )}
      </div>

      {/* FOOTER — sabse neeche */}
      <div>
        <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Har page me sabse neeche</div>
        <SiteRow id="footer" label="Footer" hint="contact, address, copyright" Icon={PanelBottom} />
      </div>
    </div>
  )
}

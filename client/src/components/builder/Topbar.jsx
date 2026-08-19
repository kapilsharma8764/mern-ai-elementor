import React, { useRef, useState } from 'react'
import { useBuilder, resolveTheme } from '../../store/useBuilder'
import { BRAND } from '../../data/brand'
import { Monitor, Tablet, Smartphone, Undo2, Redo2, Eye, Download, LayoutTemplate, Plus, X, Save, FileCode2, MoreHorizontal, ExternalLink, Cloud, CloudOff, Check, Loader2, AlertTriangle } from 'lucide-react'

function PageTabs() {
  const { site, currentPageId, setPage, addPage, removePage, renamePage } = useBuilder()
  const [editing, setEditing] = useState(null)
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {site.pages.map((p) => {
        const active = p.id === currentPageId
        return (
          <div key={p.id}
            className={`group flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              active ? 'bg-brand-500 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}>
            {editing === p.id ? (
              <input
                autoFocus defaultValue={p.name}
                onBlur={(e) => { renamePage(p.id, e.target.value || p.name); setEditing(null) }}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                className="w-24 bg-transparent outline-none"
              />
            ) : (
              <button onClick={() => (active ? setEditing(p.id) : setPage(p.id))}>{p.name}</button>
            )}
            {site.pages.length > 1 ? (
              <button className="opacity-0 transition group-hover:opacity-60 hover:!opacity-100" onClick={() => removePage(p.id)}><X size={12} /></button>
            ) : null}
          </div>
        )
      })}
      <button className="shrink-0 rounded-lg bg-white/5 px-2 py-1.5 text-slate-400 hover:bg-white/10 hover:text-white" onClick={() => addPage('New Page')} title="Add page">
        <Plus size={14} />
      </button>
    </div>
  )
}

/** "Saved ✓" / "Sav ho raha hai…" / "Offline" — user ko hamesha pata rahe */
function SyncBadge() {
  const state = useBuilder((s) => s.syncState)
  const error = useBuilder((s) => s.syncError)
  const lastSavedAt = useBuilder((s) => s.lastSavedAt)
  const serverUp = useBuilder((s) => s.serverUp)

  const ago = () => {
    if (!lastSavedAt) return ''
    const sec = Math.round((Date.now() - new Date(lastSavedAt)) / 1000)
    if (sec < 5) return 'abhi'
    if (sec < 60) return `${sec}s pehle`
    const min = Math.round(sec / 60)
    return min < 60 ? `${min} min pehle` : `${Math.round(min / 60)} ghante pehle`
  }

  const look = {
    saving: { Icon: Loader2, cls: 'text-brand-300', text: 'Save ho raha hai…', spin: true },
    saved:  { Icon: Check,   cls: 'text-emerald-300', text: `Saved ${ago()}` },
    error:  { Icon: AlertTriangle, cls: 'text-amber-300', text: 'Save nahi hua' },
    offline:{ Icon: CloudOff, cls: 'text-slate-400', text: 'Offline — browser me safe' },
    idle:   { Icon: Cloud,   cls: 'text-slate-400', text: serverUp ? 'Cloud se juda' : 'Browser me safe' },
  }[state] || {}

  const { Icon = Cloud, cls = 'text-slate-400', text = '', spin } = look

  return (
    <span
      title={error || (serverUp ? 'Cloud (MongoDB) me save ho raha hai' : 'Server band hai — browser me save ho raha hai')}
      className={`hidden items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-[11px] font-medium sm:flex ${cls}`}
    >
      <Icon size={13} className={spin ? 'animate-spin' : ''} />
      {text}
    </span>
  )
}

export default function Topbar() {
  const s = useBuilder()
  const { device, setDevice, undo, redo, past, future, togglePreview, setStep, business, site } = s
  const [menu, setMenu] = useState(false)

  // export ka code (React server-renderer ke saath) tabhi load hota hai jab
  // user click kare — isliye pehli baar app khulne pe bundle halka rehta hai
  const [busy, setBusy] = useState('')

  const exportCurrent = async () => {
    setBusy('export')
    const { pageToHtml, fileNameFor, downloadHtml } = await import('../../utils/exportSite')
    const theme = resolveTheme(site.theme)
    const page = site.pages.find((p) => p.id === s.currentPageId) || site.pages[0]
    downloadHtml(fileNameFor(page), pageToHtml({ site, theme, business, page, allPages: site.pages }))
    setBusy('')
  }
  const openBrowser = async () => {
    setBusy('browser')
    const { siteToHtml, openInBrowser } = await import('../../utils/exportSite')
    openInBrowser(siteToHtml({ site, theme: resolveTheme(site.theme), business }))
    setBusy('')
  }
  const exportAll = async () => {
    setBusy('export')
    const { pageToHtml, fileNameFor, downloadHtml } = await import('../../utils/exportSite')
    const theme = resolveTheme(site.theme)
    site.pages.forEach((page, i) =>
      setTimeout(() => downloadHtml(fileNameFor(page), pageToHtml({ site, theme, business, page, allPages: site.pages })), i * 350)
    )
    setBusy('')
  }
  const exportJson = async () => {
    const { exportProjectJson } = await import('../../utils/exportSite')
    exportProjectJson(s)
  }

  const devices = [['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]]

  return (
    <header className="flex shrink-0 items-center gap-3 overflow-x-auto border-b border-white/10 bg-panel px-3 py-2">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-[10px] text-[13px] font-black text-white" style={{ background: 'linear-gradient(135deg,#0f7ef0,#00c6ff)' }}>pd</div>
        <div className="leading-tight">
          <div className="text-[13px] font-bold">{business.name || 'Untitled site'}</div>
          <div className="text-[10px] text-slate-500">{BRAND.name} {BRAND.suffix} {BRAND.product}</div>
        </div>
      </div>

      <div className="mx-2 h-6 w-px bg-white/10" />
      <PageTabs />

      <div className="ml-auto flex items-center gap-1.5">
        <SyncBadge />
        <div className="flex rounded-lg bg-white/5 p-0.5">
          {devices.map(([d, Icon]) => (
            <button key={d} onClick={() => setDevice(d)} title={d}
              className={`rounded-md p-1.5 transition ${device === d ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}>
              <Icon size={15} />
            </button>
          ))}
        </div>

        <button className="btn-ghost !px-2 disabled:opacity-30" onClick={undo} disabled={!past.length} title="Undo (Ctrl+Z)"><Undo2 size={15} /></button>
        <button className="btn-ghost !px-2 disabled:opacity-30" onClick={redo} disabled={!future.length} title="Redo (Ctrl+Shift+Z)"><Redo2 size={15} /></button>

        <button className="btn-ghost" onClick={togglePreview}><Eye size={15} /> Preview</button>
        <button className="btn-ghost disabled:opacity-50" onClick={openBrowser} disabled={!!busy} title="Poori website naye browser tab me kholo">
          <ExternalLink size={15} /> {busy === 'browser' ? 'Khul raha hai…' : 'Open in browser'}
        </button>
        <button className="btn-primary disabled:opacity-50" onClick={exportCurrent} disabled={!!busy}>
          <Download size={15} /> {busy === 'export' ? 'Ban raha hai…' : 'Export HTML'}
        </button>

        <div className="relative">
          <button className="btn-ghost !px-2" onClick={() => setMenu(!menu)}><MoreHorizontal size={15} /></button>
          {menu ? (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenu(false)} />
              <div className="absolute right-0 top-full z-40 mt-1 w-56 overflow-hidden rounded-xl border border-white/10 bg-panel2 py-1 shadow-soft">
                {[
                  [FileCode2, 'Export all pages', () => { exportAll(); setMenu(false) }],
                  [Save, 'Download project (.json)', () => { exportJson(); setMenu(false) }],
                  [LayoutTemplate, 'Change template', () => { setStep('templates'); setMenu(false) }],
                  [X, 'Start over', () => { if (confirm('Discard this project and start again?')) s.reset() }],
                ].map(([Icon, label, fn]) => (
                  <button key={label} onClick={fn} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] text-slate-200 hover:bg-white/10">
                    <Icon size={14} className="text-slate-400" /> {label}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  )
}

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useBuilder } from '../../store/useBuilder'
import { widgetGroups } from '../../sections/widgets'
import { Plus, Search } from 'lucide-react'

const GROUP_ORDER = ['Hero', 'Content', 'Social proof', 'Media', 'Contact', 'Basic', 'Layout']

/** widget picker popover — kisi bhi position pe naya section insert karta hai */
function Picker({ anchor, onPick, onClose }) {
  const [q, setQ] = useState('')
  const groups = widgetGroups()
  const keys = GROUP_ORDER.filter((g) => groups[g]).concat(Object.keys(groups).filter((g) => !GROUP_ORDER.includes(g)))
  const box = anchor?.getBoundingClientRect()

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!box) return null
  const top = Math.min(box.bottom + 8, window.innerHeight - 420)
  const left = Math.min(Math.max(12, box.left + box.width / 2 - 170), window.innerWidth - 352)

  return createPortal(
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose} />
      <div
        className="fixed z-[61] w-[340px] overflow-hidden rounded-xl border border-white/12 bg-panel2 shadow-soft"
        style={{ top, left }}
      >
        <div className="border-b border-white/10 p-2.5">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input autoFocus className="field !py-1.5 !pl-8 !text-xs" placeholder="Kya lagana hai? jaise photo, review" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        <div className="max-h-[330px] overflow-y-auto p-2.5">
          {keys.map((g) => {
            const items = groups[g].filter((w) => w.label.toLowerCase().includes(q.toLowerCase()))
            if (!items.length) return null
            return (
              <div key={g} className="mb-3">
                <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{g}</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {items.map((w) => (
                    <button
                      key={w.key}
                      onClick={() => { onPick(w.key); onClose() }}
                      className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-left text-[11.5px] font-medium text-slate-200 transition hover:border-brand-400/60 hover:bg-brand-500/15"
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>,
    document.body
  )
}

/** sections ke beech ka "+ Add section" strip — hover pe dikhta hai */
export default function AddHere({ index }) {
  const addBlock = useBuilder((s) => s.addBlock)
  const [open, setOpen] = useState(false)
  const btn = useRef(null)

  return (
    <div
      className="group/add relative z-20 flex h-7 items-center justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      <div className={`pointer-events-none absolute inset-x-6 h-px bg-brand-400/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0 group-hover/add:opacity-100'}`} />
      <button
        ref={btn}
        onClick={() => setOpen(true)}
        className={`relative inline-flex items-center gap-1.5 rounded-full border border-brand-400/60 bg-panel px-3 py-1 text-[11px] font-semibold text-brand-200 shadow-soft transition hover:bg-brand-500 hover:text-white ${
          open ? 'opacity-100' : 'opacity-0 group-hover/add:opacity-100'
        }`}
      >
        <Plus size={13} /> Yahan kuch lagao
      </button>
      {open ? <Picker anchor={btn.current} onPick={(type) => addBlock(type, index)} onClose={() => setOpen(false)} /> : null}
    </div>
  )
}

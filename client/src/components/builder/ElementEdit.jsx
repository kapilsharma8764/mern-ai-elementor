import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useBuilder } from '../../store/useBuilder'
import { WIDGETS } from '../../sections/widgets'
import { pathGet, pathsWithValue, stringPaths, labelForPath, listInfo, isMultiline, pathKey } from '../../utils/propPath'
import { Pencil, Copy, Trash2, ChevronUp, ChevronDown, GripVertical, Type, Image as ImageIcon, Upload, X } from 'lucide-react'
import { useImageUpload } from '../../utils/useImageUpload'

/* ------------------------------------------------------------------ *
 * Elementor-style element editing.
 * Widget renderers ko chhue bina DOM node ko uske prop path se map karta
 * hai: text ka exact match dhoondh ke, aur ek hi text ke multiple nodes
 * hon to DOM order = prop order maan ke.
 * ------------------------------------------------------------------ */

/** kya ye node "leaf" text hai — iske andar wahi text dobara to nahi */
function isTextLeaf(el, text) {
  return !Array.from(el.children).some((c) => c.textContent.trim() === text)
}

/** clicked DOM node -> prop path */
export function resolvePath(frameEl, node, props) {
  if (!frameEl || !node || !props) return null

  // explicit binding (image slots) — sabse reliable, khali image pe bhi chalta hai
  const bound = node.closest?.('[data-bind]')
  if (bound && frameEl.contains(bound)) {
    try { return JSON.parse(bound.getAttribute('data-bind')) } catch (e) { /* ignore */ }
  }

  // text — sabse deep leaf dhoondo
  let el = node
  while (el && el !== frameEl) {
    const text = el.textContent?.trim()
    if (text && text.length <= 400 && isTextLeaf(el, text)) {
      const matches = pathsWithValue(props, text)
      if (matches.length) {
        if (matches.length === 1) return matches[0]
        // same text ke kai nodes — DOM order se index nikaalo
        const sameNodes = Array.from(frameEl.querySelectorAll('*')).filter(
          (n) => n.textContent.trim() === text && isTextLeaf(n, text)
        )
        const i = sameNodes.indexOf(el)
        return matches[Math.min(Math.max(i, 0), matches.length - 1)]
      }
    }
    el = el.parentElement
  }

  // fallback — text kisi aur text ke saath wrap hai ("quote", ✓ point, 15+)
  el = node
  while (el && el !== frameEl) {
    const text = el.textContent?.trim()
    if (text && text.length <= 400) {
      const candidates = stringPaths(props)
        .map((pth) => ({ pth, val: String(pathGet(props, pth)).trim() }))
        .filter(({ val }) => val.length > 2 && text.includes(val))
        .sort((a, b) => b.val.length - a.val.length)   // sabse specific match
      if (candidates.length) return candidates[0].pth
    }
    el = el.parentElement
  }
  return null
}

/** path ke liye wapas DOM node — outline aur inline edit ke liye */
export function nodeForPath(frameEl, props, path) {
  if (!frameEl || !path) return null

  // bound slot (image) — value khali ho tab bhi milta hai
  const key = JSON.stringify(path)
  const bound = Array.from(frameEl.querySelectorAll('[data-bind]'))
    .find((n) => n.getAttribute('data-bind') === key)
  if (bound) { bound.__partial = false; return bound }

  const value = pathGet(props, path)
  if (typeof value !== 'string' || !value.trim()) return null

  const text = value.trim()
  const nodes = Array.from(frameEl.querySelectorAll('*')).filter(
    (n) => n.textContent.trim() === text && isTextLeaf(n, text)
  )
  if (nodes.length) {
    const matches = pathsWithValue(props, text)
    const idx = matches.findIndex((m) => pathKey(m) === pathKey(path))
    const hit = nodes[Math.min(Math.max(idx, 0), nodes.length - 1)] || nodes[0]
    hit.__partial = false     // stale flag clear
    return hit
  }

  // partial — value kisi bade text ka hissa hai; sabse chhota wrapper lo
  const wrappers = Array.from(frameEl.querySelectorAll('*'))
    .filter((n) => n.textContent.includes(text))
    .sort((a, b) => a.textContent.length - b.textContent.length)
  if (!wrappers.length) return null
  const all = pathsWithValue(props, text)
  const i = all.findIndex((m) => pathKey(m) === pathKey(path))
  const node = wrappers[Math.min(Math.max(i, 0), wrappers.length - 1)] || wrappers[0]
  node.__partial = true
  return node
}

/** list ke har item ka container element — drag reorder ke liye */
function itemContainers(frameEl, props, key) {
  const arr = props?.[key]
  if (!Array.isArray(arr)) return []
  const nodes = arr.map((item, i) => {
    const field = Object.keys(item || {}).find((k) => typeof item[k] === 'string' && item[k].trim())
    return field ? nodeForPath(frameEl, props, [key, i, field]) : null
  })
  if (nodes.some((n) => !n)) return []

  // har node ko upar tak le jao jab tak wo kisi doosre item ka node na samet le
  return nodes.map((n, i) => {
    let el = n
    while (el.parentElement && el.parentElement !== frameEl) {
      const p = el.parentElement
      const swallows = nodes.some((other, j) => j !== i && p.contains(other))
      if (swallows) break
      el = p
    }
    return el
  })
}

const rectIn = (el, frameEl) => {
  const a = el.getBoundingClientRect()
  const b = frameEl.getBoundingClientRect()
  return { top: a.top - b.top, left: a.left - b.left, width: a.width, height: a.height }
}

/* ------------------------------------------------------------------ */
export default function ElementLayer({ block, frameRef, active, dragHandle }) {
  // har block pe ek ElementLayer hota hai — isliye poora store subscribe karne
  // ki jagah sirf jo chahiye wahi lete hain (warna har keystroke pe sab re-render)
  const selectedId = useBuilder((s) => s.selectedId)
  const selectedPath = useBuilder((s) => s.selectedPath)
  const selectElement = useBuilder((s) => s.selectElement)
  const setPropPath = useBuilder((s) => s.setPropPath)
  const moveListItem = useBuilder((s) => s.moveListItem)
  const duplicateListItem = useBuilder((s) => s.duplicateListItem)
  const removeListItem = useBuilder((s) => s.removeListItem)
  const [hover, setHover] = useState(null)   // { rect, label }
  const [selRect, setSelRect] = useState(null)
  const [editing, setEditing] = useState(false)
  const dragRef = useRef(null)
  const overlayRef = useRef(null)
  const rafRef = useRef(0)
  const fileRef = useRef(null)

  /** overlay ko hata ke uske neeche ka asli element uthao */
  const pick = useCallback((clientX, clientY) => {
    const ov = overlayRef.current
    if (!ov) return null
    const prev = ov.style.pointerEvents
    ov.style.pointerEvents = 'none'
    const el = document.elementFromPoint(clientX, clientY)
    ov.style.pointerEvents = prev
    return el
  }, [])
  const widget = WIDGETS[block.type]
  const mine = selectedId === block.id && selectedPath

  /* ---------- hover outline ---------- */
  const onMove = useCallback((e) => {
    const frame = frameRef.current
    if (!frame || editing || dragRef.current) return
    const { clientX, clientY } = e
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const under = pick(clientX, clientY)
      const path = under ? resolvePath(frame, under, block.props) : null
      if (!path) return setHover(null)
      const node = nodeForPath(frame, block.props, path)
      if (!node) return setHover(null)
      setHover({ rect: rectIn(node, frame), label: labelForPath(widget, path), partial: !!node.__partial })
    })
  }, [block.props, editing, frameRef, widget, pick])

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  /* ---------- selected outline (re-measure on change) ---------- */
  useEffect(() => {
    const frame = frameRef.current
    if (!frame || !mine) { setSelRect(null); return }
    const measure = () => {
      const node = nodeForPath(frame, block.props, selectedPath)
      setSelRect(node ? { ...rectIn(node, frame), partial: !!node.__partial } : null)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(frame)
    return () => ro.disconnect()
  }, [mine, selectedPath, block.props, frameRef])

  /* ---------- inline editing ---------- */
  useEffect(() => {
    const frame = frameRef.current
    if (!frame || !mine || !editing) return
    const node = nodeForPath(frame, block.props, selectedPath)
    if (!node || node.tagName === 'IMG' || node.__partial) { setEditing(false); return }

    node.setAttribute('contenteditable', 'plaintext-only')
    node.style.outline = 'none'
    node.focus()
    const range = document.createRange()
    range.selectNodeContents(node)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)

    const multiline = isMultiline(widget, selectedPath)
    const commit = () => {
      const val = node.innerText.replace(/ /g, ' ')
      node.removeAttribute('contenteditable')
      setEditing(false)
      setPropPath(block.id, selectedPath, multiline ? val : val.replace(/\n/g, ' ').trim())
    }
    const onKey = (e) => {
      e.stopPropagation()
      if (e.key === 'Escape') { node.innerText = pathGet(block.props, selectedPath); commit() }
      if (e.key === 'Enter' && !multiline) { e.preventDefault(); commit() }
    }
    node.addEventListener('blur', commit)
    node.addEventListener('keydown', onKey)
    return () => {
      node.removeEventListener('blur', commit)
      node.removeEventListener('keydown', onKey)
      node.removeAttribute('contenteditable')
    }
  }, [editing, mine, selectedPath, block.id, block.props, frameRef, setPropPath, widget])

  /* ---------- list item drag reorder ---------- */
  const info = mine ? listInfo(selectedPath) : null
  const isImage = mine && /image|logo|avatar|photo/i.test(String(selectedPath[selectedPath.length - 1]))

  const { uploadImage, busy: uploading, progress } = useImageUpload()

  const readImage = async (file) => {
    if (!file) return
    const url = await uploadImage(file)
    if (url) setPropPath(block.id, selectedPath, url)
  }

  const startDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const frame = frameRef.current
    if (!frame || !info) return
    const boxes = itemContainers(frame, block.props, info.key)
    if (boxes.length < 2) return
    dragRef.current = { from: info.index, boxes, to: info.index }

    const onPointerMove = (ev) => {
      const d = dragRef.current
      if (!d) return
      const i = d.boxes.findIndex((el) => {
        const r = el.getBoundingClientRect()
        return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom
      })
      if (i >= 0 && i !== d.to) {
        d.to = i
        setHover({ rect: rectIn(d.boxes[i], frame), label: `Move here (${i + 1})`, drop: true })
      }
    }
    const onPointerUp = () => {
      const d = dragRef.current
      dragRef.current = null
      setHover(null)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      if (d && d.to !== d.from) moveListItem(block.id, info.key, d.from, d.to)
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  if (!active) return null

  const showHover = hover && !(selRect && hover.rect.top === selRect.top && hover.rect.left === selRect.left)

  return (
    <>
      {/* Sirf click / hover / inline-edit ke liye.
          Drag ke listeners yahan NAHI hain — dnd-kit drag ke baad click ko
          nigal jata tha, isliye section ke andar kuch select hi nahi hota tha.
          Drag ab alag strip aur toolbar grip se hota hai (Canvas.jsx). */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-[15]"
        style={{ pointerEvents: editing ? 'none' : 'auto' }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          const under = pick(e.clientX, e.clientY)
          const path = under ? resolvePath(frameRef.current, under, block.props) : null
          if (path && /image|logo|avatar|photo/i.test(String(path[path.length - 1]))) {
            e.preventDefault()
            const file = e.dataTransfer.files?.[0]
            if (file && file.type.startsWith('image/')) {
              uploadImage(file).then((url) => { if (url) setPropPath(block.id, path, url) })
            }
          }
        }}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        onClick={(e) => {
          e.stopPropagation()
          const under = pick(e.clientX, e.clientY)
          const path = under ? resolvePath(frameRef.current, under, block.props) : null
          selectElement(block.id, path)
        }}
        onDoubleClick={(e) => {
          e.stopPropagation()
          const under = pick(e.clientX, e.clientY)
          const path = under ? resolvePath(frameRef.current, under, block.props) : null
          if (path) {
            selectElement(block.id, path)
            const n = nodeForPath(frameRef.current, block.props, path)
            if (n && !n.__partial && n.tagName !== 'IMG') setEditing(true)
          }
        }}
      />

      {/* hover outline */}
      {showHover ? (
        <div
          className={`pointer-events-none absolute z-[16] rounded-[3px] ${
            hover.drop ? 'ring-2 ring-emerald-400 bg-emerald-400/10' : hover.partial ? 'ring-2 ring-dashed ring-cyanx-400/70' : 'ring-2 ring-cyanx-400/70'
          }`}
          style={{ ...hover.rect }}
        >
          <span className={`absolute -top-[19px] left-0 whitespace-nowrap rounded-t px-1.5 py-0.5 text-[10px] font-bold text-white ${hover.drop ? 'bg-emerald-500' : 'bg-cyanx-500'}`}>
            {hover.label}
          </span>
        </div>
      ) : null}

      {/* selected outline + element toolbar */}
      {selRect ? (
        <div className={`pointer-events-none absolute z-[17] rounded-[3px] ring-2 ring-brand-500 ${selRect.partial ? 'ring-dashed' : ''}`} style={{ top: selRect.top, left: selRect.left, width: selRect.width, height: selRect.height }}>
          <div className="pointer-events-auto absolute -top-[27px] left-0 flex items-center gap-0.5 rounded-md border border-white/10 bg-panel/95 px-1 py-0.5 shadow-soft backdrop-blur">
            <span className="flex items-center gap-1 px-1 text-[10px] font-bold text-brand-200">
              {isImage ? <ImageIcon size={11} /> : <Type size={11} />}
              {labelForPath(widget, selectedPath)}
            </span>

            {isImage ? (
              <>
                <button
                  className="flex items-center gap-1 rounded bg-brand-500/20 px-1.5 py-1 text-[10px] font-semibold text-brand-200 transition hover:bg-brand-500 hover:text-white disabled:opacity-60"
                  title="Upload image"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload size={11} /> {uploading ? `${progress}%` : 'Upload'}
                </button>
                {pathGet(block.props, selectedPath) ? (
                  <button className="rounded p-1 text-rose-400 hover:bg-rose-500/20" title="Remove image" onClick={() => setPropPath(block.id, selectedPath, '')}>
                    <X size={11} />
                  </button>
                ) : null}
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => readImage(e.target.files?.[0])} />
              </>
            ) : (
              <button
                className="rounded p-1 text-slate-300 hover:bg-white/10 hover:text-white"
                title={selRect.partial ? 'Edit in the panel →' : 'Edit inline (or double-click)'}
                onClick={() => (selRect.partial ? null : setEditing(true))}
              >
                <Pencil size={11} />
              </button>
            )}

            {info ? (
              <>
                <span className="mx-0.5 h-3 w-px bg-white/15" />
                <span onPointerDown={startDrag} className="cursor-grab rounded p-1 text-slate-300 hover:bg-white/10 hover:text-white active:cursor-grabbing" title="Drag to reorder">
                  <GripVertical size={11} />
                </span>
                <button className="rounded p-1 text-slate-300 hover:bg-white/10 hover:text-white" title="Move up" onClick={() => moveListItem(block.id, info.key, info.index, info.index - 1)}>
                  <ChevronUp size={11} />
                </button>
                <button className="rounded p-1 text-slate-300 hover:bg-white/10 hover:text-white" title="Move down" onClick={() => moveListItem(block.id, info.key, info.index, info.index + 1)}>
                  <ChevronDown size={11} />
                </button>
                <button className="rounded p-1 text-slate-300 hover:bg-white/10 hover:text-white" title="Duplicate item" onClick={() => duplicateListItem(block.id, info.key, info.index)}>
                  <Copy size={11} />
                </button>
                <button className="rounded p-1 text-rose-400 hover:bg-rose-500/20" title="Delete item" onClick={() => removeListItem(block.id, info.key, info.index)}>
                  <Trash2 size={11} />
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  )
}

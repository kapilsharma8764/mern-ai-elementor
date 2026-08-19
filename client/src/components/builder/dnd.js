/* ------------------------------------------------------------------ *
 * Drag & drop ka faisla ek jagah — Builder isse use karta hai aur test
 * bhi isi ko check karta hai (UI ke bina).
 * ------------------------------------------------------------------ */

/**
 * @param activeId  drag ho raha item ("new:hero" ya block id)
 * @param overId    jispe chhoda ("canvas-end" ya block id)
 * @param blockIds  current page ke block ids, order me
 * @returns { type: 'add', widget, index } | { type: 'move', from, to } | null
 */
export function resolveDrop(activeId, overId, blockIds = []) {
  if (!activeId || !overId) return null
  const a = String(activeId)
  const o = String(overId)

  // palette se naya widget
  if (a.startsWith('new:')) {
    const widget = a.slice(4)
    if (!widget) return null
    if (o === 'canvas-end') return { type: 'add', widget, index: blockIds.length }
    const i = blockIds.indexOf(o)
    return { type: 'add', widget, index: i >= 0 ? i : blockIds.length }
  }

  // maujooda section ka reorder
  const from = blockIds.indexOf(a)
  if (from < 0) return null
  const to = o === 'canvas-end' ? blockIds.length - 1 : blockIds.indexOf(o)
  if (to < 0 || to === from) return null
  return { type: 'move', from, to }
}

/** resolveDrop ka result store pe apply karo */
export function applyDrop(drop, { addBlock, moveBlock }) {
  if (!drop) return null
  if (drop.type === 'add') return addBlock(drop.widget, drop.index)
  if (drop.type === 'move') { moveBlock(drop.from, drop.to); return true }
  return null
}

/* ------------------------------------------------------------------ *
 * Prop path helpers — canvas ke DOM element ko widget ke prop se jodne
 * ke liye. Path example: ['title']  ya  ['items', 2, 'text']
 * ------------------------------------------------------------------ */

export const pathGet = (obj, path) => path.reduce((o, k) => (o == null ? o : o[k]), obj)

export function pathSet(obj, path, value) {
  const out = Array.isArray(obj) ? [...obj] : { ...obj }
  let cur = out
  for (let i = 0; i < path.length - 1; i++) {
    const k = path[i]
    const next = cur[k]
    cur[k] = Array.isArray(next) ? [...next] : { ...next }
    cur = cur[k]
  }
  cur[path[path.length - 1]] = value
  return out
}

export const pathKey = (path) => path.join('.')

/** props me se har string value ka path — DOM order jaisa hi (top-level pehle, phir lists) */
export function stringPaths(props) {
  const out = []
  const walk = (val, path) => {
    if (typeof val === 'string') { if (val.trim()) out.push(path); return }
    if (Array.isArray(val)) return val.forEach((v, i) => walk(v, [...path, i]))
    if (val && typeof val === 'object') return Object.entries(val).forEach(([k, v]) => walk(v, [...path, k]))
  }
  walk(props, [])
  return out
}

/** kisi exact text ke saare matching paths */
export function pathsWithValue(props, value) {
  const target = String(value).trim()
  return stringPaths(props).filter((p) => String(pathGet(props, p)).trim() === target)
}

/** field ka human label — inspector schema se, warna key se */
export function labelForPath(widget, path) {
  if (!path?.length) return 'Section'
  const schema = widget?.schema || []
  const top = schema.find((f) => f.key === path[0])
  if (!top) return String(path[path.length - 1])
  if (path.length === 1) return top.label
  const sub = (top.fields || []).find((f) => f.key === path[path.length - 1])
  return sub ? `${top.label} ${Number(path[1]) + 1} · ${sub.label}` : top.label
}

/** path list ka hai to uska info — { key, index, field } */
export function listInfo(path) {
  if (!path || path.length < 3) return null
  const [key, index, field] = path
  if (typeof index !== 'number') return null
  return { key, index, field }
}

/** is path pe multiline text allowed hai? */
export function isMultiline(widget, path) {
  const schema = widget?.schema || []
  const top = schema.find((f) => f.key === path?.[0])
  if (!top) return false
  if (path.length === 1) return top.type === 'textarea'
  const sub = (top.fields || []).find((f) => f.key === path[path.length - 1])
  return sub?.type === 'textarea'
}

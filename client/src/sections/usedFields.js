import { WIDGETS } from './widgets'
import MAP from './usedFields.generated.json'

/* ------------------------------------------------------------------ *
 * Kaun sa variant kaun se fields dikhata hai — ye map build ke time
 * `npm run gen:fields` se banta hai (scripts/gen-usedfields.jsx).
 *
 * Yahan sirf lookup hota hai — koi rendering nahi. Isliye:
 *  - browser bundle me React ka server-renderer nahi jata
 *  - Inspector ke render ke andar dusra React render nahi chalta
 *    (yahi crash ki jad thi)
 * ------------------------------------------------------------------ */

const cache = new Map()

/** Set of field keys jo is variant me actually render hote hain.
 *  List fields ke liye `list.sub` bhi milta hai (e.g. "items.image"). */
export function usedFields(type, variant) {
  const ck = `${type}:${variant}`
  if (cache.has(ck)) return cache.get(ck)

  let set
  const found = MAP[ck]
  if (found) {
    set = new Set(found)
  } else {
    // map me nahi mila (naya widget, map purana) — sab dikha do
    const widget = WIDGETS[type]
    set = new Set((widget?.schema || []).map((f) => f.key))
    for (const f of widget?.schema || []) {
      for (const sf of f.fields || []) set.add(`${f.key}.${sf.key}`)
    }
  }
  cache.set(ck, set)
  return set
}

/** kaun se variants is field ko dikhate hain */
export function variantsUsing(type, fieldKey) {
  const widget = WIDGETS[type]
  if (!widget) return []
  return Object.keys(widget.variants).filter((v) => usedFields(type, v).has(fieldKey))
}

/** list ke andar ka ek subfield is variant me dikhta hai? */
export const usesSub = (type, variant, listKey, subKey) =>
  usedFields(type, variant).has(`${listKey}.${subKey}`)

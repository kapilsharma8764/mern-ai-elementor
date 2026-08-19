import { fileStore } from './fileStore.js'
import { mongoStore } from './mongoStore.js'

/* ------------------------------------------------------------------ *
 * Kaunsa storage use hoga — apne aap tay hota hai:
 *
 *   MONGODB_URI hai aur connected hai  ->  MongoDB
 *   warna                              ->  local files
 *
 * Routes ko farak nahi padta — dono ka interface ek hai:
 *   list, create, get, update, remove, makeSlug, findBySlug
 * ------------------------------------------------------------------ */

export function store() {
  return mongoStore.ready() ? mongoStore : fileStore
}

/** health/status me dikhane ke liye */
export function storageInfo() {
  const s = store()
  return { kind: s.kind, detail: s.info() }
}

import { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { TEMPLATES as LOCAL_TEMPLATES, TEMPLATE_CATEGORIES as LOCAL_CATEGORIES } from './templates'

/* ------------------------------------------------------------------ *
 * Templates ab server (database) se aate hain.
 *
 * Server band ho ya net na ho -> client ke built-in templates chalte
 * hain, isliye gallery kabhi khali nahi dikhti.
 *
 * Naya template add karna ho to bas DB me daal do — code chhune ki
 * zaroorat nahi (POST /api/templates).
 * ------------------------------------------------------------------ */

let cache = null           // ek hi baar fetch, phir cache

export function useTemplates() {
  const [templates, setTemplates] = useState(cache || LOCAL_TEMPLATES)
  const [source, setSource] = useState(cache ? 'server' : 'local')
  const [loading, setLoading] = useState(!cache)

  useEffect(() => {
    if (cache) return
    let alive = true

    api.templates
      .list()
      .then((list) => {
        if (!alive || !Array.isArray(list) || !list.length) return
        cache = list
        setTemplates(list)
        setSource('server')
      })
      .catch(() => {
        // server band — built-in templates hi theek hain
        setSource('local')
      })
      .finally(() => alive && setLoading(false))

    return () => { alive = false }
  }, [])

  const categories = ['All', ...Array.from(new Set(templates.map((t) => t.category)))]

  return { templates, categories, source, loading }
}

/** ek template dhoondo — pehle server wale me, phir built-in me */
export function findTemplate(id, templates) {
  return (
    (templates || cache || []).find((t) => t.id === id || t.key === id) ||
    LOCAL_TEMPLATES.find((t) => t.id === id) ||
    null
  )
}

/** store ke liye — bina hook ke */
export const loadedTemplates = () => cache || LOCAL_TEMPLATES

export { LOCAL_TEMPLATES, LOCAL_CATEGORIES }

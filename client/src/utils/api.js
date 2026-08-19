/* ------------------------------------------------------------------ *
 * Server se baat karne ka ek hi darwaza.
 * Server band ho ya net na ho — app tootna nahi chahiye, isliye har
 * call ka saaf error aata hai aur store localStorage pe fallback
 * kar sakta hai.
 * ------------------------------------------------------------------ */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

/** login (Step 8) tak sab 'demo' owner ke andar */
const owner = () => localStorage.getItem('wb.owner') || 'demo'

async function call(path, { method = 'GET', body, timeout = 15000 } = {}) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(`${BASE}/api${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-owner': owner() },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    })
    const isJson = (res.headers.get('content-type') || '').includes('application/json')
    const data = isJson ? await res.json() : await res.text()
    if (!res.ok) {
      const err = new Error(data?.error || `Request fail (${res.status})`)
      err.status = res.status
      err.detail = data?.detail
      throw err
    }
    return data
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Server ne jawab nahi diya (timeout)')
    if (e.message === 'Failed to fetch') throw new Error('Server band hai ya net nahi chal raha')
    throw e
  } finally {
    clearTimeout(timer)
  }
}

/** server ka absolute URL — /uploads/x.webp ko poora URL banane ke liye */
export const fileUrl = (u) => (u && u.startsWith('/uploads') ? BASE + u : u)

export const api = {
  /** server zinda hai? DB juda hai? */
  health: () => call('/health'),

  /** image upload — base64 ki jagah asli file */
  async upload(file, { onProgress } = {}) {
    const form = new FormData()
    form.append('file', file)

    // fetch me progress nahi milta, isliye XHR
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${BASE}/api/upload`)
      xhr.setRequestHeader('x-owner', owner())
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
      }
      xhr.onload = () => {
        let data = {}
        try { data = JSON.parse(xhr.responseText) } catch { /* ignore */ }
        if (xhr.status >= 200 && xhr.status < 300) resolve({ ...data, url: fileUrl(data.url) })
        else reject(new Error(data.error || `Upload fail (${xhr.status})`))
      }
      xhr.onerror = () => reject(new Error('Server band hai ya net nahi chal raha'))
      xhr.ontimeout = () => reject(new Error('Upload me bahut time lag gaya'))
      xhr.timeout = 120000
      xhr.send(form)
    })
  },

  templates: {
    list:       ()          => call('/templates'),
    get:        (key)       => call(`/templates/${key}`),
    categories: ()          => call('/templates/categories'),
    // admin
    create:     (payload)   => call('/templates', { method: 'POST', body: payload }),
    update:     (key, p)    => call(`/templates/${key}`, { method: 'PATCH', body: p }),
    remove:     (key)       => call(`/templates/${key}`, { method: 'DELETE' }),
  },

  sites: {
    list:   ()                       => call('/sites'),
    create: (payload)                => call('/sites', { method: 'POST', body: payload }),
    get:    (id)                     => call(`/sites/${id}`),
    save:   (id, patch)              => call(`/sites/${id}`, { method: 'PATCH', body: patch }),
    slug:   (id, slug)               => call(`/sites/${id}/slug`, { method: 'PUT', body: { slug } }),
    remove: (id)                     => call(`/sites/${id}`, { method: 'DELETE' }),
  },
}

/** server available hai ya nahi — app start pe ek baar check */
export async function serverAvailable() {
  try {
    const h = await api.health()
    return { up: true, db: h.db === 'connected', detail: h.dbError }
  } catch (e) {
    return { up: false, db: false, detail: e.message }
  }
}

/**
 * Autosave helper — har keystroke pe request na jaye, isliye debounce.
 * Aakhri change ke `wait` ms baad ek hi request jati hai.
 */
export function makeAutosave(wait = 2000) {
  let timer = null
  let pending = null
  let inFlight = false

  const flush = async () => {
    if (!pending || inFlight) return
    const { id, patch, onDone, onError } = pending
    pending = null
    inFlight = true
    try {
      const r = await api.sites.save(id, patch)
      onDone?.(r)
    } catch (e) {
      onError?.(e)
    } finally {
      inFlight = false
      if (pending) flush()      // beech me aur changes aaye to unhe bhejo
    }
  }

  return {
    push(id, patch, { onDone, onError } = {}) {
      pending = { id, patch, onDone, onError }
      clearTimeout(timer)
      timer = setTimeout(flush, wait)
    },
    /** turant bhejo — jaise tab band karte waqt */
    flushNow() {
      clearTimeout(timer)
      return flush()
    },
  }
}

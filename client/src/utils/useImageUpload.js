import { useCallback, useState } from 'react'
import { api } from './api'

/* ------------------------------------------------------------------ *
 * Image upload — ek hi jagah, saare upload buttons ise use karte hain.
 *
 * Server chal raha ho  -> file server pe jaati hai, URL milta hai
 * Server band ho       -> base64 pe fallback (kaam rukta nahi)
 *
 * Isliye internet/server ki dikkat me bhi user ka kaam nahi rukta.
 * ------------------------------------------------------------------ */

const MAX_MB = 10

/** file ko base64 me badlo — fallback ke liye */
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = () => reject(new Error('File padhi nahi ja saki'))
    r.readAsDataURL(file)
  })

export function useImageUpload() {
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const uploadImage = useCallback(async (file) => {
    setError('')
    if (!file) return null

    if (!file.type.startsWith('image/')) {
      setError('Sirf image file chalegi (JPG, PNG, WEBP, SVG)')
      return null
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Image ${MAX_MB} MB se choti honi chahiye`)
      return null
    }

    setBusy(true)
    setProgress(0)
    try {
      const res = await api.upload(file, { onProgress: setProgress })
      return res.url                                  // "/uploads/abc.webp" ka poora URL
    } catch (e) {
      // server band hai -> base64 pe chalao, kaam ruke na
      try {
        const b64 = await toBase64(file)
        setError('Server band hai — image abhi browser me hai, baad me apne aap upload ho jayegi')
        return b64
      } catch {
        setError(e.message || 'Upload fail ho gaya')
        return null
      }
    } finally {
      setBusy(false)
      setProgress(0)
    }
  }, [])

  return { uploadImage, busy, progress, error, clearError: () => setError('') }
}

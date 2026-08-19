import React, { useEffect, useState } from 'react'
import { useBuilder } from './store/useBuilder'
import Landing from './components/Landing'
import Wizard from './components/wizard/Wizard'
import TemplateGallery from './components/TemplateGallery'
import Builder from './components/builder/Builder'
import { GOOGLE_FONTS_HREF } from './data/design'

export default function App() {
  const step = useBuilder((s) => s.step)
  const site = useBuilder((s) => s.site)
  const initServer = useBuilder((s) => s.initServer)
  const saveNow = useBuilder((s) => s.saveNow)
  const [booting, setBooting] = useState(true)

  /* app khulte hi: server zinda hai kya, aur pichhla project kholo */
  useEffect(() => {
    initServer().finally(() => setBooting(false))
  }, [initServer])

  /* tab band karte waqt jo bacha hua change hai wo turant bhej do */
  useEffect(() => {
    const flush = () => saveNow()
    window.addEventListener('beforeunload', flush)
    document.addEventListener('visibilitychange', () => document.hidden && flush())
    return () => window.removeEventListener('beforeunload', flush)
  }, [saveNow])

  /* Google fonts */
  useEffect(() => {
    if (document.getElementById('gf')) return
    const l = document.createElement('link')
    l.id = 'gf'; l.rel = 'stylesheet'; l.href = GOOGLE_FONTS_HREF
    document.head.appendChild(l)
  }, [])

  if (booting) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-brand-400" />
          <p className="mt-4 text-[13px] text-slate-400">Aapka project khul raha hai…</p>
        </div>
      </div>
    )
  }

  if (step === 'builder' && site) return <Builder />
  if (step === 'templates') return <TemplateGallery />
  if (step === 'wizard') return <Wizard />
  return <Landing />
}

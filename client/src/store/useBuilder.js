import { create } from 'zustand'
import { WIDGETS, defaultsFor, firstVariant } from '../sections/widgets'
import { TEMPLATES, templateById } from '../data/templates'
import { findTemplate, loadedTemplates } from '../data/useTemplates'
import { paletteById, fontById, RADIUS, DENSITY, CONTAINERS } from '../data/design'
import { pathSet, pathGet } from '../utils/propPath'
import { personaliseSite, personaliseBlock, buildCopy } from './personalise'
import { api, makeAutosave } from '../utils/api'

const uid = () => Math.random().toString(36).slice(2, 10)
const clone = (o) => JSON.parse(JSON.stringify(o))
const KEY = 'wb.project.v1'

export const emptyBusiness = {
  /* identity */
  name: '',
  logo: '',            // single logo upload — favicon ke liye bhi yahi use hota hai
  logoStyle: {         // template me logo kaise dikhega
    mode: 'logoName',  // logoName | logo | name
    shape: 'rounded',  // square | rounded | round
    size: 'md',        // sm | md | lg
    position: 'left',  // left | center
  },
  title: '',
  slogan: '',
  about: '',
  established: '',
  owner: '',

  /* business */
  type: '',
  subType: '',
  industry: '',
  services: [],        // chips
  products: [],        // chips
  highlights: [],      // chips — USP / key points
  audience: '',

  /* contact */
  phone: '',
  whatsapp: '',
  altPhone: '',
  email: '',
  altEmail: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  mapEmbed: '',
  timing: '',
  workingDays: '',

  /* online presence + seo */
  website: '',
  facebook: '',
  instagram: '',
  linkedin: '',
  twitter: '',
  youtube: '',
  metaDescription: '',
  keywords: '',
  regNumber: '',
  copyright: '',
}

/** full address ek line me */
export const fullAddress = (b) =>
  [b.address, b.city, b.state, b.pincode, b.country].filter(Boolean).join(', ')

/** social links jo bhare gaye hain */
export const socialList = (b) =>
  [
    ['Facebook', b.facebook], ['Instagram', b.instagram], ['LinkedIn', b.linkedin],
    ['X', b.twitter], ['YouTube', b.youtube],
  ].filter(([, v]) => v)

export const emptyBlockStyle = {
  marginTop: 0,
  marginBottom: 0,
  paddingY: 0, // extra vertical padding
  align: 'inherit',
  bg: '', // override background
  fg: '', // override text colour
  maxWidth: 0, // 0 = template default
  hidden: false,
  fontScale: 1,
}

export function makeBlock(type, variant) {
  return {
    id: uid(),
    type,
    variant: variant || firstVariant(type),
    props: defaultsFor(type),
    style: { ...emptyBlockStyle },
  }
}

function themeFromTemplate(tpl) {
  return {
    palette: tpl.theme.palette,
    font: tpl.theme.font,
    radius: tpl.theme.radius,
    density: tpl.theme.density,
    container: tpl.theme.container,
    headingScale: tpl.theme.headingScale,
    imageSeed: tpl.theme.imageSeed ?? 0,
  }
}

/** Flatten theme tokens into concrete values used by section renderers */
export function resolveTheme(theme) {
  const pal = paletteById(theme.palette)
  const font = fontById(theme.font)
  const r = RADIUS[theme.radius] ?? RADIUS.md
  // "pill" sirf buttons/chips pe achha lagta hai — images aur cards oval ban jate hain,
  // isliye surfaces ke liye radius ko cap kar dete hain.
  const surface = theme.radius === 'pill' ? '20px' : r
  return {
    ...pal,
    headingFont: font.heading,
    bodyFont: font.body,
    radius: surface,        // cards, images, panels
    radiusBtn: r,           // buttons, chips, pills
    radiusMedia: theme.radius === 'pill' ? '20px' : (theme.radius === 'lg' ? '16px' : r),
    density: DENSITY[theme.density] ?? 1,
    container: CONTAINERS[theme.container] ?? CONTAINERS.normal,
    headingScale: theme.headingScale ?? 1,
    imageSeed: theme.imageSeed ?? 0,      // har template ke placeholder gradients alag
  }
}

function buildPagesFromTemplate(tpl, biz) {
  const blocks = tpl.blocks.map((b) => {
    const blk = makeBlock(b.type, b.variant)
    return blk
  })
  const header = blocks.find((b) => b.type === 'header')
  const footer = blocks.find((b) => b.type === 'footer')
  const body = blocks.filter((b) => b !== header && b !== footer)

  const home = { id: uid(), name: 'Home', slug: '/', blocks: body }
  const pages = [home]

  return {
    header: header || makeBlock('header'),
    footer: footer || makeBlock('footer'),
    pages,
  }
}

/** ek hi autosave engine — 1.5 sec debounce */
const autosave = makeAutosave(1500)

/** ek waqt me ek hi createProject chale (warna do project ban jate) */
let creating = false

const initialState = {
  step: 'landing', // landing | wizard | templates | builder
  business: { ...emptyBusiness },
  templateId: null,
  site: null, // { header, footer, pages, theme }
  currentPageId: null,
  selectedId: null, // block id (or 'header'/'footer')
  inspectorTab: 'content', // content | design — Edit button isse control karta hai
  selectedPath: null, // Elementor-style element selection: ['items', 2, 'title']
  device: 'desktop', // desktop | tablet | mobile
  previewMode: false,
  dragType: null, // widget type currently dragged from palette
  past: [],
  future: [],

  /* ---- server sync ---- */
  projectId: null,          // server pe is project ki id
  serverUp: false,          // server chal raha hai?
  syncState: 'idle',        // idle | saving | saved | error | offline
  syncError: '',
  lastSavedAt: null,
}

export const useBuilder = create((set, get) => ({
  ...initialState,

  /* ---------------- history ---------------- */
  _snap() {
    const { site } = get()
    if (!site) return
    set((s) => ({ past: [...s.past.slice(-49), clone(s.site)], future: [] }))
  },
  undo() {
    const { past, site } = get()
    if (!past.length) return
    const prev = past[past.length - 1]
    set((s) => ({ site: prev, past: s.past.slice(0, -1), future: [clone(site), ...s.future].slice(0, 50) }))
  },
  redo() {
    const { future, site } = get()
    if (!future.length) return
    set((s) => ({ site: future[0], future: s.future.slice(1), past: [...s.past, clone(site)] }))
  },

  /* ---------------- flow ---------------- */
  setStep: (step) => set({ step }),
  setBusiness: (patch) => set((s) => ({ business: { ...s.business, ...patch } })),

  chooseTemplate(id) {
    // pehle server se aaye templates me dhoondo, phir built-in me
    const tpl = findTemplate(id, loadedTemplates()) || templateById(id)
    if (!tpl) return
    const biz = get().business
    const built = buildPagesFromTemplate(tpl, biz)
    let site = { ...built, theme: themeFromTemplate(tpl) }
    site = personaliseSite(site, biz)
    set({
      templateId: id,
      site,
      currentPageId: site.pages[0].id,
      selectedId: null,
      step: 'builder',
      past: [],
      future: [],
    })
    get().save()
    // server pe project bana do (agar pehle se nahi hai)
    get().createProject()
  },

  /** swap template but keep the business info / pages you added */
  applyTemplateTheme(id) {
    const tpl = findTemplate(id, loadedTemplates()) || templateById(id)
    if (!tpl) return
    get()._snap()
    set((s) => ({ templateId: id, site: { ...s.site, theme: themeFromTemplate(tpl) } }))
  },

  /* ---------------- theme ---------------- */
  setTheme(patch) {
    get()._snap()
    set((s) => ({ site: { ...s.site, theme: { ...s.site.theme, ...patch } } }))
  },

  /* ---------------- pages ---------------- */
  addPage(name) {
    get()._snap()
    const page = {
      id: uid(),
      name: name || 'New Page',
      slug: '/' + (name || 'new-page').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      blocks: [makeBlock('heading'), makeBlock('text')],
    }
    set((s) => ({ site: { ...s.site, pages: [...s.site.pages, page] }, currentPageId: page.id }))
  },
  renamePage(id, name) {
    get()._snap()
    set((s) => ({ site: { ...s.site, pages: s.site.pages.map((p) => (p.id === id ? { ...p, name } : p)) } }))
  },
  removePage(id) {
    const { site } = get()
    if (site.pages.length <= 1) return
    get()._snap()
    const pages = site.pages.filter((p) => p.id !== id)
    set((s) => ({ site: { ...s.site, pages }, currentPageId: pages[0].id }))
  },
  setPage: (id) => set({ currentPageId: id, selectedId: null }),

  /* ---------------- blocks ---------------- */
  currentPage() {
    const { site, currentPageId } = get()
    return site?.pages.find((p) => p.id === currentPageId) || site?.pages[0]
  },

  addBlock(type, index) {
    get()._snap()
    const blk = makeBlock(type)
    // naya section bhi turant business info se bhar do — stock text kabhi na dikhe
    try {
      const biz = get().business
      if (biz?.name) personaliseBlock(blk, buildCopy(biz), biz)
    } catch (e) { /* defaults hi rahenge */ }
    set((s) => {
      const pages = s.site.pages.map((p) => {
        if (p.id !== s.currentPageId) return p
        const blocks = [...p.blocks]
        blocks.splice(index ?? blocks.length, 0, blk)
        return { ...p, blocks }
      })
      return { site: { ...s.site, pages }, selectedId: blk.id }
    })
    return blk.id
  },

  moveBlock(from, to) {
    if (from === to) return
    get()._snap()
    set((s) => ({
      site: {
        ...s.site,
        pages: s.site.pages.map((p) => {
          if (p.id !== s.currentPageId) return p
          const blocks = [...p.blocks]
          const [m] = blocks.splice(from, 1)
          blocks.splice(to, 0, m)
          return { ...p, blocks }
        }),
      },
    }))
  },

  duplicateBlock(id) {
    get()._snap()
    set((s) => ({
      site: {
        ...s.site,
        pages: s.site.pages.map((p) => {
          if (p.id !== s.currentPageId) return p
          const i = p.blocks.findIndex((b) => b.id === id)
          if (i < 0) return p
          const copy = { ...clone(p.blocks[i]), id: uid() }
          const blocks = [...p.blocks]
          blocks.splice(i + 1, 0, copy)
          return { ...p, blocks }
        }),
      },
    }))
  },

  removeBlock(id) {
    get()._snap()
    set((s) => ({
      selectedId: s.selectedId === id ? null : s.selectedId,
      site: {
        ...s.site,
        pages: s.site.pages.map((p) => (p.id !== s.currentPageId ? p : { ...p, blocks: p.blocks.filter((b) => b.id !== id) })),
      },
    }))
  },

  getBlock(id) {
    const { site } = get()
    if (!site) return null
    if (id === 'header') return site.header
    if (id === 'footer') return site.footer
    return get().currentPage()?.blocks.find((b) => b.id === id) || null
  },

  updateBlock(id, patch, { history = true } = {}) {
    if (history) get()._snap()
    set((s) => {
      if (id === 'header') return { site: { ...s.site, header: { ...s.site.header, ...patch } } }
      if (id === 'footer') return { site: { ...s.site, footer: { ...s.site.footer, ...patch } } }
      return {
        site: {
          ...s.site,
          pages: s.site.pages.map((p) => (p.id !== s.currentPageId ? p : { ...p, blocks: p.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),
        },
      }
    })
  },

  setProp(id, key, value) {
    const b = get().getBlock(id)
    if (!b) return
    get().updateBlock(id, { props: { ...b.props, [key]: value } })
  },
  setStyle(id, key, value) {
    const b = get().getBlock(id)
    if (!b) return
    get().updateBlock(id, { style: { ...b.style, [key]: value } })
  },
  setVariant(id, variant) {
    get().updateBlock(id, { variant })
  },

  select: (id, tab) => set(tab ? { selectedId: id, inspectorTab: tab, selectedPath: null } : { selectedId: id, selectedPath: null }),

  /** canvas me kisi element pe click — block + uska exact prop path select */
  selectElement(id, path) {
    set({ selectedId: id, selectedPath: path || null, inspectorTab: 'content' })
  },
  clearPath: () => set({ selectedPath: null }),

  /** nested prop update — inline editing isse chalti hai */
  setPropPath(id, path, value) {
    const b = get().getBlock(id)
    if (!b || !path?.length) return
    if (String(pathGet(b.props, path)) === String(value)) return
    get().updateBlock(id, { props: pathSet(b.props, path, value) })
  },

  /* ---- list item operations (Elementor jaisa element reorder) ---- */
  moveListItem(id, key, from, to) {
    const b = get().getBlock(id)
    const arr = b?.props?.[key]
    if (!Array.isArray(arr) || from === to || to < 0 || to >= arr.length) return
    const next = [...arr]
    const [m] = next.splice(from, 1)
    next.splice(to, 0, m)
    get().updateBlock(id, { props: { ...b.props, [key]: next } })
    const p = get().selectedPath
    if (p && p[0] === key && p[1] === from) set({ selectedPath: [key, to, p[2]] })
  },
  duplicateListItem(id, key, index) {
    const b = get().getBlock(id)
    const arr = b?.props?.[key]
    if (!Array.isArray(arr)) return
    const next = [...arr]
    next.splice(index + 1, 0, JSON.parse(JSON.stringify(arr[index])))
    get().updateBlock(id, { props: { ...b.props, [key]: next } })
  },
  removeListItem(id, key, index) {
    const b = get().getBlock(id)
    const arr = b?.props?.[key]
    if (!Array.isArray(arr) || arr.length <= 1) return
    get().updateBlock(id, { props: { ...b.props, [key]: arr.filter((_, i) => i !== index) } })
    set({ selectedPath: null })
  },
  setInspectorTab: (inspectorTab) => set({ inspectorTab }),
  setDevice: (device) => set({ device }),
  togglePreview: () => set((s) => ({ previewMode: !s.previewMode })),
  setDragType: (t) => set({ dragType: t }),

  /* ---------------- persistence ---------------- */

  /**
   * save() do jagah karta hai:
   *  1. localStorage — turant, offline backup (images ab URL hain to chhota hai)
   *  2. server — debounce ke saath, taaki har keystroke pe request na jaye
   */
  save() {
    const { business, site, templateId, currentPageId, projectId, serverUp } = get()

    // local backup — server band ho tab bhi kaam na khoye
    try {
      localStorage.setItem(KEY, JSON.stringify({ business, site, templateId, currentPageId, projectId }))
    } catch (e) {
      // quota bhar gaya (purane base64 images) — ab server hi sahara hai
      if (!serverUp) set({ syncState: 'error', syncError: 'Browser ki memory bhar gayi — server chalu karo' })
    }

    // project abhi tak nahi bana (template chunte hi banta hai, par request
    // me thoda time lagta hai) — to bana lo, warna ye edits sirf local rehte
    if (!projectId && serverUp && site) {
      get().createProject()
      return
    }

    // server pe autosave
    if (projectId && serverUp) {
      set({ syncState: 'saving' })
      autosave.push(
        projectId,
        { business, site, templateId },
        {
          onDone: (r) => set({ syncState: 'saved', lastSavedAt: r.updatedAt || new Date().toISOString(), syncError: '' }),
          onError: (e) => set({ syncState: 'error', syncError: e.message }),
        }
      )
    }
  },

  /** app khulte hi — server zinda hai? phir project load karo */
  /**
   * Browser me jo bacha hai usse project wapas laao.
   * Refresh karne pe ye zaroori hai — warna banaya hua kaam chhod ke
   * landing page khul jata tha.
   */
  restoreLocal() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY) || '{}')
      if (!d.site) return false
      // Data wapas le aao, par step 'landing' hi rahega.
      // Refresh pe hamesha front page khulta hai — wahan se "Continue"
      // dabao to builder khulega, ya naya banao.
      set({
        business: { ...emptyBusiness, ...(d.business || {}) },
        site: d.site,
        templateId: d.templateId || null,
        projectId: d.projectId || null,
        currentPageId: d.currentPageId || d.site?.pages?.[0]?.id || null,
        selectedId: null,
        selectedPath: null,
        past: [],
        future: [],
      })
      return true
    } catch (e) {
      return false
    }
  },

  /** landing se "Continue editing" — wahi project wapas kholo */
  continueProject() {
    if (get().site) set({ step: 'builder', selectedId: null, selectedPath: null })
  },

  async initServer() {
    // 1) Sabse pehle local se wapas le aao — server ka intezaar kiye bina
    //    user ko apna kaam turant dikh jaye.
    const hadLocal = get().restoreLocal()

    let saved = {}
    try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') } catch (e) { /* ignore */ }

    // 2) Ab server se poochho
    try {
      await api.health()
      set({ serverUp: true, syncState: hadLocal ? 'saved' : 'idle' })
    } catch (e) {
      // server band — local wala hi chalega
      set({ serverUp: false, syncState: 'offline', syncError: e.message })
      return { serverUp: false, loaded: hadLocal }
    }

    // 3) Server pe project hai to uska taaza version le aao
    if (saved.projectId) {
      try {
        const doc = await api.sites.get(saved.projectId)
        if (doc?.site) {
          // sirf data — step landing hi rahega (front page se shuruaat)
          set({
            projectId: doc.id,
            business: { ...emptyBusiness, ...doc.business },
            site: doc.site,
            templateId: doc.templateId,
            currentPageId: doc.site?.pages?.[0]?.id || null,
            syncState: 'saved',
            lastSavedAt: doc.updatedAt,
          })
          return { serverUp: true, loaded: true }
        }
      } catch (e) {
        // project delete ho gaya ya id purani hai — local wala chalta rahega,
        // aur agli baar naya project ban jayega
        set({ projectId: null, syncError: '' })
        try {
          const d = JSON.parse(localStorage.getItem(KEY) || '{}')
          delete d.projectId
          localStorage.setItem(KEY, JSON.stringify(d))
        } catch (err) { /* ignore */ }
      }
    }

    // 4) Local site hai par server pe project nahi — abhi bana do,
    //    taaki aage ka kaam cloud me jata rahe
    if (get().site && !get().projectId) {
      await get().createProject()
      return { serverUp: true, loaded: true }
    }

    return { serverUp: true, loaded: hadLocal }
  },

  /** server pe naya project banao (template chunte waqt) */
  async createProject() {
    const { business, site, templateId, serverUp, projectId } = get()
    if (!serverUp || projectId || creating) return projectId
    creating = true
    try {
      const doc = await api.sites.create({ business, site, templateId })
      set({ projectId: doc.id, syncState: 'saved', lastSavedAt: doc.updatedAt })
      creating = false
      // jo edits project banne se pehle hue the, wo ab bhej do
      get().save()
      return doc.id
    } catch (e) {
      creating = false
      set({ syncState: 'error', syncError: e.message })
      return null
    }
  },

  /** turant save — tab band karte waqt ya publish se pehle */
  async saveNow() {
    const { projectId, serverUp } = get()
    if (!projectId || !serverUp) return
    await autosave.flushNow()
  },
  load() {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return false
      const d = JSON.parse(raw)
      if (!d.site) return false
      set({ ...d, step: 'builder', past: [], future: [] })
      return true
    } catch (e) { return false }
  },
  hasSaved() {
    try { return !!localStorage.getItem(KEY) } catch (e) { return false }
  },
  reset() {
    try { localStorage.removeItem(KEY) } catch (e) {}
    set({ ...initialState, business: { ...emptyBusiness }, serverUp: get().serverUp })
  },

  /** mere saare projects (dashboard ke liye) */
  async listProjects() {
    try { return await api.sites.list() } catch { return [] }
  },

  /** kisi purane project ko kholo */
  async openProject(id) {
    const doc = await api.sites.get(id)
    set({
      projectId: doc.id,
      business: { ...emptyBusiness, ...doc.business },
      site: doc.site,
      templateId: doc.templateId,
      currentPageId: doc.site?.pages?.[0]?.id || null,
      step: doc.site ? 'builder' : 'wizard',
      selectedId: null,
      past: [],
      future: [],
      syncState: 'saved',
      lastSavedAt: doc.updatedAt,
    })
    get().save()
  },
}))

// autosave
useBuilder.subscribe((s, prev) => {
  if (s.site && s.site !== prev.site) useBuilder.getState().save()
})

export { TEMPLATES, WIDGETS }

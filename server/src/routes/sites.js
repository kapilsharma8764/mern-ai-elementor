import { Router } from 'express'
import { store } from '../storage/index.js'

/* ------------------------------------------------------------------ *
 * Website projects ka CRUD.
 *
 * Storage ka pata nahi — `store()` khud tay karta hai ki local files
 * use karni hain ya MongoDB. Isliye MongoDB ke bina bhi sab chalta hai.
 *
 * Login (Step 8) tak owner = 'demo'.
 * ------------------------------------------------------------------ */

const router = Router()

const ownerOf = (req) => req.header('x-owner') || 'demo'

/** GET /api/sites — mere saare projects (halki list) */
router.get('/', async (req, res, next) => {
  try {
    res.json(await store().list(ownerOf(req)))
  } catch (e) { next(e) }
})

/** POST /api/sites — naya project */
router.post('/', async (req, res, next) => {
  try {
    const { business = {}, site = null, templateId = null, name } = req.body || {}
    const doc = await store().create({ owner: ownerOf(req), name, business, site, templateId })
    res.status(201).json(doc)
  } catch (e) { next(e) }
})

/** GET /api/sites/:id — poora project (builder ise load karta hai) */
router.get('/:id', async (req, res, next) => {
  try {
    const doc = await store().get(req.params.id, ownerOf(req))
    if (!doc) return res.status(404).json({ error: 'Project nahi mila' })
    res.json(doc)
  } catch (e) {
    if (e.name === 'CastError') return res.status(400).json({ error: 'Galat id' })
    next(e)
  }
})

/** PATCH /api/sites/:id — autosave (frontend 2 sec debounce karke bhejta hai) */
router.patch('/:id', async (req, res, next) => {
  try {
    const patch = {}
    const { business, site, templateId, name } = req.body || {}
    if (business !== undefined) patch.business = business
    if (site !== undefined) patch.site = site
    if (templateId !== undefined) patch.templateId = templateId
    if (name !== undefined) patch.name = name
    // company ka naam badla par project ka naam nahi bheja -> saath me update
    if (business?.name && !name) patch.name = business.name

    if (!Object.keys(patch).length) return res.status(400).json({ error: 'Kuch bheja hi nahi' })

    const doc = await store().update(req.params.id, ownerOf(req), patch)
    if (!doc) return res.status(404).json({ error: 'Project nahi mila' })

    // autosave ka response chhota — poora site wapas bhejne ki zaroorat nahi
    res.json({ id: doc.id, updatedAt: doc.updatedAt, saved: true })
  } catch (e) {
    if (e.name === 'CastError') return res.status(400).json({ error: 'Galat id' })
    next(e)
  }
})

/** PUT /api/sites/:id/slug — live URL ka naam badlo */
router.put('/:id/slug', async (req, res, next) => {
  try {
    const s = store()
    const slug = await s.makeSlug(req.body?.slug, req.params.id)
    const doc = await s.update(req.params.id, ownerOf(req), { slug })
    if (!doc) return res.status(404).json({ error: 'Project nahi mila' })
    res.json({ id: doc.id, slug: doc.slug })
  } catch (e) {
    if (e.name === 'CastError') return res.status(400).json({ error: 'Galat id' })
    next(e)
  }
})

/** DELETE /api/sites/:id */
router.delete('/:id', async (req, res, next) => {
  try {
    const doc = await store().remove(req.params.id, ownerOf(req))
    if (!doc) return res.status(404).json({ error: 'Project nahi mila' })
    res.json({ deleted: true, id: doc.id })
  } catch (e) {
    if (e.name === 'CastError') return res.status(400).json({ error: 'Galat id' })
    next(e)
  }
})

export default router

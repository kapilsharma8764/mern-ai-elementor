import { Router } from 'express'
import Template from '../models/Template.js'
import { dbState } from '../db.js'

/* ------------------------------------------------------------------ *
 * Templates ab database se aate hain, client ke code se nahi.
 *
 * Fayda: naya template add karna ho, ya kisi ko hide/rename karna ho —
 * code chhue bina ho jata hai. Admin panel bhi inhi routes pe banega.
 * ------------------------------------------------------------------ */

const router = Router()

const needDB = (req, res, next) =>
  dbState().connected
    ? next()
    : res.status(503).json({ error: 'Database connected nahi hai' })

/** GET /api/templates — gallery ke liye saare active templates */
router.get('/', needDB, async (req, res, next) => {
  try {
    const q = { active: true }
    if (req.query.category && req.query.category !== 'All') q.category = req.query.category

    const docs = await Template.find(q).sort({ no: 1 })
    res.json(docs.map((d) => d.toClient()))
  } catch (e) { next(e) }
})

/** GET /api/templates/categories — filter buttons ke liye */
router.get('/categories', needDB, async (req, res, next) => {
  try {
    const cats = await Template.distinct('category', { active: true })
    res.json(['All', ...cats.sort()])
  } catch (e) { next(e) }
})

/** GET /api/templates/:key */
router.get('/:key', needDB, async (req, res, next) => {
  try {
    const doc = await Template.findOne({ key: req.params.key })
    if (!doc) return res.status(404).json({ error: 'Template nahi mila' })
    res.json(doc.toClient())
  } catch (e) { next(e) }
})

/* ---------------- admin ke liye (Step 8 me login lagega) ---------------- */

/** POST /api/templates — naya template */
router.post('/', needDB, async (req, res, next) => {
  try {
    const { name, category, blocks, theme, tags, no } = req.body || {}
    if (!name || !Array.isArray(blocks) || !blocks.length) {
      return res.status(400).json({ error: 'name aur blocks zaroori hain' })
    }
    const count = await Template.countDocuments()
    const doc = await Template.create({
      key: req.body.key || `tpl-custom-${Date.now()}`,
      no: no ?? count + 1,
      name, category: category || 'Business',
      tags: tags || [], theme: theme || {}, blocks,
      builtIn: false,
    })
    res.status(201).json(doc.toClient())
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Is key ka template pehle se hai' })
    next(e)
  }
})

/** PATCH /api/templates/:key — naam/category/order/hide badlo */
router.patch('/:key', needDB, async (req, res, next) => {
  try {
    const allowed = ['name', 'category', 'tags', 'no', 'active', 'theme', 'blocks']
    const patch = {}
    for (const k of allowed) if (req.body?.[k] !== undefined) patch[k] = req.body[k]
    if (!Object.keys(patch).length) return res.status(400).json({ error: 'Kuch bheja hi nahi' })

    const doc = await Template.findOneAndUpdate({ key: req.params.key }, { $set: patch }, { new: true })
    if (!doc) return res.status(404).json({ error: 'Template nahi mila' })
    res.json(doc.toClient())
  } catch (e) { next(e) }
})

/** DELETE /api/templates/:key */
router.delete('/:key', needDB, async (req, res, next) => {
  try {
    const doc = await Template.findOneAndDelete({ key: req.params.key })
    if (!doc) return res.status(404).json({ error: 'Template nahi mila' })
    res.json({ deleted: true, key: doc.key })
  } catch (e) { next(e) }
})

/** POST /api/templates/seed — client se aaye templates DB me daalo */
router.post('/seed/bulk', needDB, async (req, res, next) => {
  try {
    const list = req.body?.templates
    if (!Array.isArray(list) || !list.length) {
      return res.status(400).json({ error: 'templates array chahiye' })
    }
    const ops = list.map((t) => ({
      updateOne: {
        filter: { key: t.id || t.key },
        update: {
          $set: {
            key: t.id || t.key,
            no: t.no ?? 0,
            name: t.name,
            category: t.category || 'Business',
            tags: t.tags || [],
            blank: !!t.blank,
            theme: t.theme || {},
            blocks: t.blocks || [],
            builtIn: true,
          },
        },
        upsert: true,
      },
    }))
    const r = await Template.bulkWrite(ops)
    const total = await Template.countDocuments()
    res.json({ added: r.upsertedCount, updated: r.modifiedCount, total })
  } catch (e) { next(e) }
})

export default router

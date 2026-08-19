import Site from '../models/Site.js'
import { dbState } from '../db.js'

/* ------------------------------------------------------------------ *
 * MongoDB storage — fileStore jaisa hi interface.
 * Jab .env me MONGODB_URI aa jayega, ye apne aap use hone lagega.
 * Routes ka code badalne ki zaroorat nahi.
 * ------------------------------------------------------------------ */

const out = (doc) => (doc ? { ...doc.toObject(), id: String(doc._id) } : null)

export const mongoStore = {
  kind: 'mongo',
  ready: () => dbState().connected,
  info: () => 'MongoDB',

  makeSlug: (base, ignoreId) => Site.makeSlug(base, ignoreId),

  async list(owner) {
    const docs = await Site.find({ owner }).sort({ updatedAt: -1 }).limit(100)
    return docs.map((d) => ({ ...d.toListItem(), id: String(d._id) }))
  },

  async create({ owner, name, business = {}, site = null, templateId = null }) {
    const title = name || business.name || 'Untitled website'
    const doc = await Site.create({
      owner,
      name: title,
      slug: await Site.makeSlug(title),
      business,
      site,
      templateId,
    })
    return out(doc)
  },

  async get(id, owner) {
    return out(await Site.findOne({ _id: id, owner }))
  },

  async update(id, owner, patch) {
    return out(await Site.findOneAndUpdate({ _id: id, owner }, { $set: patch }, { new: true }))
  },

  async remove(id, owner) {
    return out(await Site.findOneAndDelete({ _id: id, owner }))
  },

  async findBySlug(slug) {
    return out(await Site.findOne({ slug }))
  },
}

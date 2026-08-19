import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

/* ------------------------------------------------------------------ *
 * File storage — MongoDB ke bina, sab kuch local disk pe.
 *
 * Har project ek JSON file:  server/data/sites/<id>.json
 *
 * Fayda: koi account, koi API key, koi internet nahi. Aage MongoDB
 * lagana ho to sirf .env me MONGODB_URI daal do — routes ka code
 * bilkul same rahega (dono driver ka interface ek hai).
 * ------------------------------------------------------------------ */

const DIR = path.join(process.cwd(), 'data', 'sites')

const ensureDir = () => fs.mkdir(DIR, { recursive: true })
const fileOf = (id) => path.join(DIR, `${id}.json`)

const read = async (id) => {
  try {
    return JSON.parse(await fs.readFile(fileOf(id), 'utf8'))
  } catch {
    return null
  }
}

const write = async (doc) => {
  await ensureDir()
  // pehle temp file me likho, phir rename — bijli gayi to file adhoori nahi bachegi
  const tmp = fileOf(doc.id) + '.tmp'
  await fs.writeFile(tmp, JSON.stringify(doc, null, 2))
  await fs.rename(tmp, fileOf(doc.id))
  return doc
}

const allDocs = async () => {
  await ensureDir()
  const files = (await fs.readdir(DIR)).filter((f) => f.endsWith('.json'))
  const docs = await Promise.all(files.map((f) => read(path.basename(f, '.json'))))
  return docs.filter(Boolean)
}

const listItem = (d) => ({
  id: d.id,
  name: d.name,
  slug: d.slug,
  company: d.business?.name || '',
  logo: d.business?.logo || '',
  pages: d.site?.pages?.length || 0,
  published: !!d.published,
  updatedAt: d.updatedAt,
  createdAt: d.createdAt,
})

const slugify = (base) =>
  String(base || 'site')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'site'

export const fileStore = {
  kind: 'file',
  ready: () => true,
  info: () => `local files (${path.relative(process.cwd(), DIR)})`,

  async makeSlug(base, ignoreId = null) {
    const clean = slugify(base)
    const docs = await allDocs()
    const taken = new Set(docs.filter((d) => d.id !== ignoreId).map((d) => d.slug))
    let slug = clean
    let n = 1
    while (taken.has(slug)) { n += 1; slug = `${clean}-${n}` }
    return slug
  },

  async list(owner) {
    const docs = await allDocs()
    return docs
      .filter((d) => d.owner === owner)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 100)
      .map(listItem)
  },

  async create({ owner, name, business = {}, site = null, templateId = null }) {
    const now = new Date().toISOString()
    const title = name || business.name || 'Untitled website'
    const doc = {
      id: crypto.randomUUID(),
      owner,
      name: title,
      slug: await this.makeSlug(title),
      business,
      site,
      templateId,
      published: false,
      publishedAt: null,
      publishedHtml: '',
      createdAt: now,
      updatedAt: now,
    }
    return write(doc)
  },

  async get(id, owner) {
    const doc = await read(id)
    if (!doc || doc.owner !== owner) return null
    return doc
  },

  async update(id, owner, patch) {
    const doc = await read(id)
    if (!doc || doc.owner !== owner) return null
    Object.assign(doc, patch, { updatedAt: new Date().toISOString() })
    return write(doc)
  },

  async remove(id, owner) {
    const doc = await read(id)
    if (!doc || doc.owner !== owner) return null
    await fs.unlink(fileOf(id))
    return doc
  },

  /** live site serve karne ke liye — slug se dhoondo */
  async findBySlug(slug) {
    const docs = await allDocs()
    return docs.find((d) => d.slug === slug) || null
  },
}

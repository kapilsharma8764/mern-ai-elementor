import mongoose from 'mongoose'

/* ------------------------------------------------------------------ *
 * Ek website ka poora project.
 *
 * `business` aur `site` ke andar ka structure jaan-boojh kar free-form
 * (Mixed) rakha hai — kyunki wo frontend ke store ka **bilkul wahi
 * object** hai. Naya widget ya naya field add karo, DB ko chhune ki
 * zaroorat nahi padegi.
 * ------------------------------------------------------------------ */

const SiteSchema = new mongoose.Schema(
  {
    // Step 8 (login) tak 'demo' rahega, phir asli user id aayegi
    owner: { type: String, default: 'demo', index: true },

    name: { type: String, default: 'Untitled website', trim: true },

    // live URL ka hissa:  /s/<slug>
    slug: { type: String, unique: true, sparse: true, lowercase: true, trim: true, index: true },

    // wizard wali saari details (company, logo, services, contact, seo)
    business: { type: mongoose.Schema.Types.Mixed, default: {} },

    // theme + header + footer + pages[]  — frontend ke store ka site object
    site: { type: mongoose.Schema.Types.Mixed, default: null },

    templateId: { type: String, default: null },

    published: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    publishedHtml: { type: String, default: '' },   // Step 7 me bharega
  },
  { timestamps: true, minimize: false }   // minimize:false -> khali objects bhi save hon
)

/** list me poora HTML/site nahi bhejna — response chhota rahe */
SiteSchema.methods.toListItem = function toListItem() {
  return {
    id: this._id,
    name: this.name,
    slug: this.slug,
    company: this.business?.name || '',
    logo: this.business?.logo || '',
    pages: this.site?.pages?.length || 0,
    published: this.published,
    updatedAt: this.updatedAt,
    createdAt: this.createdAt,
  }
}

/** naam se slug banao, aur takrav ho to -2, -3 lagao */
SiteSchema.statics.makeSlug = async function makeSlug(base, ignoreId = null) {
  const clean =
    String(base || 'site')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'site'

  let slug = clean
  let n = 1
  // eslint-disable-next-line no-await-in-loop
  while (await this.exists({ slug, ...(ignoreId ? { _id: { $ne: ignoreId } } : {}) })) {
    n += 1
    slug = `${clean}-${n}`
  }
  return slug
}

export default mongoose.model('Site', SiteSchema)

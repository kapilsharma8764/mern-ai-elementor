import mongoose from 'mongoose'

/* ------------------------------------------------------------------ *
 * Template = ek "recipe" — kaunse sections, kis order me, kaunsa
 * variant, aur kaunsa colour/font.
 *
 * Isme koi HTML ya code nahi hota. Sirf ye list:
 *   blocks: [ { type: 'hero', variant: 'mesh' }, ... ]
 *   theme:  { palette, font, radius, density, container }
 *
 * Isliye naya template add karne ke liye code chhune ki zaroorat nahi —
 * bas ek document DB me daal do.
 * ------------------------------------------------------------------ */

const TemplateSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, index: true },   // 'tpl-12' — client isse pehchanta hai
    no: { type: Number, default: 0 },                   // gallery me order
    name: { type: String, required: true, trim: true },
    category: { type: String, default: 'Business', index: true },
    tags: { type: [String], default: [] },

    blank: { type: Boolean, default: false },           // khali canvas wala

    theme: { type: mongoose.Schema.Types.Mixed, default: {} },
    blocks: { type: [mongoose.Schema.Types.Mixed], default: [] },

    active: { type: Boolean, default: true, index: true },  // hide karna ho to false
    builtIn: { type: Boolean, default: true },              // seed se aaya ya admin ne banaya
  },
  { timestamps: true, minimize: false }
)

TemplateSchema.methods.toClient = function toClient() {
  return {
    id: this.key,
    key: this.key,
    no: this.no,
    name: this.name,
    category: this.category,
    tags: this.tags,
    blank: this.blank,
    theme: this.theme,
    blocks: this.blocks,
  }
}

export default mongoose.model('Template', TemplateSchema)

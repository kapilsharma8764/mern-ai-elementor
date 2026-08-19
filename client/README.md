# Website Builder — drag & drop

React + Tailwind website builder. Wizard se basic info lo → 60 built-in templates me se ek chuno →
drag & drop se widgets add/reorder/edit karo → live preview → HTML export.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
npm run smoke    # renders all 60 templates + all widget variants, fails loudly on errors
```

## Flow

1. **Basic Information** (`src/components/wizard/Wizard.jsx`)
   - Company name, logo, square logo (favicon), title, slogan, about
   - Website type: Education / Business (Product · Services) / Technology
   - Contact: mobile, WhatsApp, alternate number, email, address, Google Maps embed, office timing
   - Sab kuch localStorage me autosave hota hai — "Resume last project" se wapas aa jata hai.

2. **Templates** (`src/components/TemplateGallery.jsx`)
   - 60 templates, har ek ka apna layout signature + palette + font pairing + corner radius + spacing + container width.
   - Live mini-preview (lazy loaded), full-screen preview, category filter + search.
   - Chosen template automatically business info se personalise ho jata hai.

3. **Builder** (`src/components/builder/`)
   - **Left:** widget palette — 25 widgets, 66 layout variants. Drag karo canvas pe, ya `+` se append.
   - **Center:** canvas. Har section hover pe toolbar deta hai — drag handle, up/down, hide, duplicate, delete.
     Desktop / tablet / mobile widths.
   - **Right:** inspector — **Content** tab (schema-driven fields, repeatable lists, image upload)
     aur **Design** tab (layout variant switch, margins, padding, max-width, text scale, align, bg/text colour).
     Kuch select na ho to site-wide theme panel dikhta hai (palette, font, radius, spacing, width, heading size).
   - Multi-page: tabs se page add / rename (active tab pe click) / delete.
   - Undo / redo (Ctrl+Z, Ctrl+Shift+Z), preview overlay, HTML export (current page ya sab pages), project `.json` download.

## Structure

```
src/
  data/design.js        palettes, font pairings, radius/density/container tokens
  data/templates.js     20 layout structures x 3 variant-shifted passes = 60 templates
  sections/primitives.jsx  Wrap, Section, H, P, Btn, Img, Grid, Card…
  sections/widgets.jsx     every widget + its variants + edit schema
  sections/Renderer.jsx    BlockView (applies per-block style overrides), SiteView
  store/useBuilder.js      zustand store: business, site, pages, blocks, history, persistence
  utils/exportSite.jsx     static HTML export (renderToStaticMarkup + Google Fonts + responsive CSS)
```

## Naya widget add karna

`src/sections/widgets.jsx` me ek object add karo:

```js
const myWidget = {
  label: 'My Widget',
  group: 'Content',
  defaults: { title: 'Hello' },
  schema: [F.text('title', 'Title')],
  variants: { plain: { name: 'Plain', render: ({ p, t, biz }) => (...) } },
}
```
…aur usse `WIDGETS` export me register kar do. Palette, inspector aur export automatically pick kar lenge.

## Next (MERN)

Abhi sab frontend + localStorage pe hai. Backend jodte waqt:
`site` object (`{ theme, header, footer, pages[] }`) hi poora document hai — usse Mongo me save/load
kar do, aur `utils/exportSite.jsx` server pe reuse karke published HTML serve kar sakte ho.

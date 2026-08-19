# Elementor jaisa builder — WordPress aur PHP ke bina

**Sawaal:** Elementor WordPress + PHP ka hai. Uske drag & drop, editing aur widgets ko
hum apne React/Node system me kaise laayein?

**Jawab:** WordPress asal me sirf **do cheezein** de raha tha — *database* aur *PHP render*.
Baaki teen cheezein (widgets, drag & drop, editing) **browser me chalti hain, WordPress se
unka koi lena-dena nahi**. Isliye teeno hamare React me waise hi ban jaati hain — aur ban chuki hain.

Ye doc har mechanism ka **exact translation** deta hai: Elementor kaise karta hai → hum kaise karte hain.

---

## Elementor ke 5 hisse aur unki WordPress-nirbharta

| Hissa | WordPress chahiye? | Kyun |
|---|---|---|
| Widget definition | ❌ nahi | Sirf ek data structure hai (fields + render). PHP me likha hai, par PHP zaroori nahi. |
| Drag & drop | ❌ nahi | Pure browser JS (jQuery UI sortable). |
| Inline editing | ❌ nahi | DOM attribute + contentEditable. |
| **Data save** | ✅ haan | WP database (`_elementor_data` post meta) |
| **Published page render** | ✅ haan | PHP `render()` server pe chalta hai |

To sirf aakhri do ko replace karna hai. Neeche teeno "nahi" wale hisse aur dono "haan" wale hisse — sab ka code.

---

## 1. Widgets — PHP class ki jagah JS object

**Elementor (PHP):**
```php
class Widget_Heading extends Widget_Base {
  public function get_name()  { return 'heading'; }
  public function get_title() { return 'Heading'; }

  protected function register_controls() {
    $this->start_controls_section('section_title', ['label' => 'Heading']);
      $this->add_control('title', [
        'type'    => Controls_Manager::TEXTAREA,
        'default' => 'Add Your Heading Text Here',
      ]);
      $this->add_control('link', ['type' => Controls_Manager::URL]);
      $this->add_control('header_size', [
        'type' => Controls_Manager::SELECT,
        'options' => ['h1'=>'H1','h2'=>'H2','h3'=>'H3'],
        'default' => 'h2',
      ]);
    $this->end_controls_section();
  }

  protected function render() {
    $s = $this->get_settings_for_display();
    echo '<h2 class="elementor-heading-title">' . $s['title'] . '</h2>';
  }
}
```

**Hamara (React) — `src/sections/widgets.jsx`:**
```js
const heading = {
  label: 'Heading',
  group: 'Basic',
  defaults: { text: 'A section heading', level: 2, align: 'left' },
  schema: [
    F.text('text', 'Text'),
    { key: 'link', label: 'Links to', type: 'link' },
    F.sel('level', 'Level', [1, 2, 3, 4]),
  ],
  variants: {
    plain: {
      name: 'Plain',
      render: ({ p, t, biz, nav }) => <H t={t} level={p.level}>{p.text}</H>,
    },
  },
}
```

Do farq, dono hamare haq me:

1. **`variants`** — ek widget ke kai layouts. Elementor me ye "skins" hain jo bahut kam widgets me hain;
   hamare paas 33 widgets pe **89 variants** hain.
2. **PHP nahi** — render ek React component hai, isliye **editor aur published site dono me same code
   chalta hai**. Elementor ko do renderer maintain karne padte hain (PHP frontend ke liye,
   JS editor preview ke liye) — unka classic bug source yahi hai.

> **PHP ki zaroorat kyun nahi:** widget definition sirf *data* hai. PHP ho ya JS ya JSON — farq nahi padta.

---

## 2. Drag & drop — jQuery UI ki jagah dnd-kit

**Elementor** (`assets/dev/js/editor/elements/views/behaviors/sortable.js`) jQuery UI sortable use karta hai:
```js
events: { sortstart, sortover, sortout, sortupdate, sortreceive }
// drop hone pe:
$e.run('preview/drop', { container, model, options: { at: index } })
```

**Hamara** (`src/components/builder/dnd.js`) — wahi faisla, pure function me:
```js
export function resolveDrop(activeId, overId, blockIds = []) {
  if (a.startsWith('new:')) {                    // palette se naya widget
    const widget = a.slice(4)
    if (o === 'canvas-end') return { type: 'add', widget, index: blockIds.length }
    const i = blockIds.indexOf(o)
    return { type: 'add', widget, index: i >= 0 ? i : blockIds.length }
  }
  const from = blockIds.indexOf(a)               // maujooda section ka reorder
  const to = o === 'canvas-end' ? blockIds.length - 1 : blockIds.indexOf(o)
  return (to < 0 || to === from) ? null : { type: 'move', from, to }
}
```

Fayda: ye **pure function** hai — UI ke bina test ho jaata hai (`scripts/e2e2.jsx` me palette-drop,
end-drop, reorder aur teen galat cases test hote hain). Elementor me ye logic views ke andar bandha hai,
isliye unit-test nahi ho sakta.

> **WordPress ki zaroorat kyun nahi:** drag & drop poora browser me hota hai. Server ko sirf
> final JSON chahiye — wo bhi save karte waqt.

---

## 3. Inline editing — dono ka tarika bilkul ek hai

**Elementor** (`includes/base/widget-base.php:917`) DOM pe prop ka path likh deta hai:
```php
protected function add_inline_editing_attributes( $key ) {
  $this->add_render_attribute( $key, [
    'class' => 'elementor-inline-editing',
    'data-elementor-setting-key' => $key,      // "title"  ya  "items.2.title"
  ] );
}
```

Phir JS wahi attribute padh ke sahi setting update karta hai
(`inline-editing.js`):
```js
var key = $element.data().elementorSettingKey,
    keyParts = key.split('.'),
    isRepeaterKey = 3 === keyParts.length;      // items . 2 . title
```

**Hamara** (`src/sections/primitives.jsx`) — same idea, JSON path ke saath:
```jsx
export function Img({ t, src, bind, ... }) {
  const dataBind = bind ? JSON.stringify(Array.isArray(bind) ? bind : [bind]) : undefined
  return <img src={src} data-bind={dataBind} ... />
}
// use: <Img src={s.image} bind={['items', i, 'image']} />
```

aur `src/components/builder/ElementEdit.jsx` usse padh ke turant sahi prop select karta hai:
```js
const bound = node.closest?.('[data-bind]')
if (bound) return JSON.parse(bound.getAttribute('data-bind'))
```

**Abhi ka status:** images pe `data-bind` laga hua hai → **47/47 = 100% sahi**.
Text ke liye abhi text-matching fallback hai → **96.6%**. Text pe bhi `bind` lagate hi 100% ho jayega.

> **WordPress ki zaroorat kyun nahi:** ye sirf DOM attribute + `contenteditable` hai.

---

## 4. Data save — WP database ki jagah MongoDB

Elementor poore page ko **ek JSON** me WP post meta `_elementor_data` me rakhta hai.
Hamara state pehle se bilkul waisa hi ek JSON hai (`src/store/useBuilder.js`):

```js
{
  business: { name, logo, services: [], phone, email, ... },
  site: {
    theme:  { palette, font, radius, density, container, headingScale },
    header: { id, type, variant, props, style },
    footer: { ... },
    pages:  [ { id, name, slug, blocks: [ { id, type, variant, props, style } ] } ]
  }
}
```

Iska matlab **Mongo me alag schema banane ki zaroorat hi nahi** — seedha yahi object save karo:

```js
// server/models/Site.js
import mongoose from 'mongoose'

const SiteSchema = new mongoose.Schema({
  owner:     { type: String, index: true },
  slug:      { type: String, unique: true },     // yahi live URL banega
  business:  { type: Object, default: {} },
  site:      { type: Object, default: {} },      // theme + header + footer + pages
  published: { type: Boolean, default: false },
  publishedHtml: String,
}, { timestamps: true, minimize: false })

export default mongoose.model('Site', SiteSchema)
```

```js
// server/routes/sites.js
router.post('/sites',        async (req, res) => res.json(await Site.create(req.body)))
router.get ('/sites/:id',    async (req, res) => res.json(await Site.findById(req.params.id)))
router.patch('/sites/:id',   async (req, res) =>       // autosave (frontend se debounced)
  res.json(await Site.findByIdAndUpdate(req.params.id, req.body, { new: true })))
```

Frontend me `save()`/`load()` ko localStorage se API pe move karna hai — baaki kuch nahi badalta.

> **Zaroori:** abhi images **base64** me localStorage me jaati hain. localStorage ki limit **~5MB** hai,
> to 3-4 images ke baad save chup-chaap fail hone lagega. Isliye upload endpoint zaroori hai:
> ```js
> router.post('/upload', multer({ dest: 'uploads/' }).single('file'),
>   (req, res) => res.json({ url: `/uploads/${req.file.filename}` }))
> ```
> Uske baad `props.image` me base64 ki jagah chhota sa URL jayega.

---

## 5. Published page render — PHP ki jagah React SSR

Yahi wo jagah hai jahan log samajhte hain "PHP chahiye hoga". **Nahi chahiye** — React Node pe bhi render
hota hai, aur hum ye already kar rahe hain (`src/utils/exportSite.jsx`):

```jsx
import { renderToStaticMarkup } from 'react-dom/server'

const html = renderToStaticMarkup(
  <div className="sitewrap">
    <BlockView block={site.header} theme={theme} business={business} />
    {page.blocks.map((b) => <BlockView key={b.id} block={b} theme={theme} business={business} />)}
    <BlockView block={site.footer} theme={theme} business={business} />
  </div>
)
```

Ye **wahi function hai** jo abhi "Export HTML" aur "Open in browser" chalata hai, aur jo hamare
saare Node tests me chalta hai — matlab **server pe chalna already proven hai**.

Publish endpoint bas itna:
```js
router.post('/sites/:id/publish', async (req, res) => {
  const doc = await Site.findById(req.params.id)
  const html = siteToHtml({                       // wahi frontend wala function
    site: doc.site,
    theme: resolveTheme(doc.site.theme),
    business: doc.business,
  })
  doc.publishedHtml = html
  doc.published = true
  await doc.save()
  res.json({ url: `/s/${doc.slug}` })
})

// asli live website — blob URL nahi, proper URL
app.get('/s/:slug', async (req, res) => {
  const doc = await Site.findOne({ slug: req.params.slug, published: true })
  if (!doc) return res.status(404).send('Not found')
  res.type('html').send(doc.publishedHtml)
})
```

Yahan hum Elementor se **aage** hain: unke paas editor JS me aur frontend PHP me **do alag renderer**
hain, isliye "editor me kuch aur, live site pe kuch aur" wale bugs aate hain. Hamare paas **ek hi
renderer** hai — canvas, preview, export aur published site sab wahi code chalate hain.

---

## Bacha kya hai — nested Container

Elementor v3 me Section+Column hata ke ek **nestable flex Container** aaya. Yahi ek cheez hamare paas
nahi hai — hamare sections flat hain, isliye user apna 2/3-column layout nahi bana sakta.

Ye bhi WordPress ka mohtaaj nahi, bas recursive rendering hai:

```js
const container = {
  label: 'Container',
  defaults: { columns: 2, gap: 24, children: [[], []] },   // har column ke apne blocks
  schema: [F.sel('columns', 'Columns', [1,2,3,4]), F.num('gap', 'Gap')],
  variants: { flex: { name: 'Columns', render: ({ p, t, biz, nav }) => (
    <Section t={t}><Wrap t={t}>
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${p.columns}, minmax(0,1fr))`, gap:p.gap }}>
        {p.children.map((col, i) => (
          <div key={i} data-slot={i}>
            {col.map((b) => <BlockView key={b.id} block={b} theme={t} business={biz} nav={nav} />)}
          </div>
        ))}
      </div>
    </Wrap></Section>
  ) } },
}
```

Builder side me sirf itna: `dnd.js` ko `containerId + slotIndex` bhi mile, aur `Canvas.jsx` har slot ke
liye ek `SortableContext` + `AddHere` render kare.

---

## Kaam ka order

| Phase | Kaam | Time | Milega kya |
|---|---|---|---|
| 1 | Text pe `data-bind` | 2-3 ghante | Element select 100% |
| 2 | **Container widget** | 1-2 din | User apna layout bana payega — Elementor wali asli power |
| 3 | Express + Mongo (save/load/upload) | 2-3 din | localStorage ki 5MB limit khatam, multi-project |
| 4 | Publish + `/s/:slug` | 1 din | Client ko bhejne layak **asli live URL** |

---

## Ek line me

WordPress sirf **database** aur **PHP render** de raha tha. Pehla **MongoDB** se badal jaata hai,
doosra **`renderToStaticMarkup()`** se — jo hamare project me pehle se chal raha hai.
Widgets, drag & drop aur inline editing — teeno WordPress se azaad hain aur teeno ban chuke hain.

**Elementor ka code copy karne ki zaroorat nahi (GPL-3 hai, aur poora WP se bandha hua hai) —
uske patterns kaafi hain, aur wo patterns hamare paas already hain.**

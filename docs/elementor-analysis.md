# Elementor analysis → hamare builder me kya use kar sakte hain

Source: `elementor-main/` (Elementor plugin, ~100 MB). Focus: **Edit, Drag & Drop, Widgets**.
Hamara code: `src/sections/`, `src/components/builder/`, `src/store/`.

---

## 1. Widget architecture

**Elementor kaise karta hai** — `includes/widgets/*.php`, har widget ek class:

```php
class Widget_Heading extends Widget_Base {
  get_name()  => 'heading'
  get_title() => 'Heading'
  get_icon()  => 'eicon-t-letter'
  get_categories()

  register_controls() {
    $this->start_controls_section('section_title', ['label' => 'Heading']);
      $this->add_control('title', ['type' => TEXTAREA, 'default' => '...', 'placeholder' => '...']);
      $this->add_control('link',  ['type' => URL]);
      $this->add_control('size',  ['type' => SELECT, 'options' => [...], 'condition' => [...]]);
    $this->end_controls_section();
    // ...phir TAB_STYLE me styling controls
  }
  render() { /* HTML */ }
}
```

Control types (`includes/controls/`): text, textarea, select, select2, number, slider, switcher, choose,
color, media, gallery, icons, url, repeater, dimensions, box-shadow, font, code, date-time, structure.
Controls **teen tabs** me bantay hain: **Content · Style · Advanced**.

**Hamare paas kya hai** — `src/sections/widgets.jsx` me `WIDGETS` registry:

```js
{ label, group, defaults, schema: [F.text('title','Title'), F.list('items', ...)], variants: { … } }
```

Schema types: `text, textarea, image, select, number, toggle, list, link` — Elementor ke core set ke
kaafi kareeb. Inspector ke do tabs (Content / Design) unke Content / Style se match karte hain.

**Kya adopt karna chahiye**

| Elementor feature | Kyun kaam ka hai | Hamare yahan kahan |
|---|---|---|
| `condition` — field tabhi dikhe jab doosra field kuch ho (200+ jagah use hota hai) | Panel chhota aur samajhne layak rehta hai | `Inspector.jsx` — schema me `condition: { flip: true }` |
| `placeholder` + `description` per control | User ko pata chale kya likhna hai | schema field me ek key |
| Control ka **separator** aur grouping | Lambi list padhne layak | `Inspector.jsx` |
| `Group_Control_Typography` — ek control group (family + size + weight + spacing) | Typography ek jagah | naya `F.typography()` field |

---

## 2. Inline editing — yahan hum already same raaste pe hain ✅

`includes/base/widget-base.php`:

```php
protected function add_inline_editing_attributes( $key, $toolbar = 'basic' ) {
  $this->add_render_attribute( $key, [
    'class' => 'elementor-inline-editing',
    'data-elementor-setting-key' => $key,     // e.g. "title"  ya  "items.2.title"
  ] );
}
```

`assets/dev/js/editor/elements/views/behaviors/inline-editing.js`:

```js
var elementorSettingKey = $element.data().elementorSettingKey,
    keyParts = elementorSettingKey.split('.'),
    isRepeaterKey = 3 === keyParts.length;   // items . 2 . title
```

Matlab: **DOM element pe seedha prop-path likha hota hai**, koi guess-work nahi.

**Hamare yahan** — `Img` primitive pe `data-bind='["items",2,"image"]'` hai (isliye images 47/47 =
100% sahi resolve hoti hain), par **text ke liye hum text-matching kar rahe hain**
(`ElementEdit.jsx` → `resolvePath`), isliye accuracy 96.6% hai — jahan do fields ek hi line me hote
hain (`Name / Role`, `₹999/mo`) wahan galat field select ho jata hai.

> **Sabse zyada faayde wala change:** har editable text pe bhi `data-bind` laga do — `H`, `P`, `Btn`
> primitives me `bind` prop add karke. Text-matching fallback hata sakte hain, accuracy 100% ho
> jayegi, aur code bhi chhota hoga.

---

## 3. Drag & drop

**Elementor** — jQuery UI sortable, `assets/dev/js/editor/elements/views/behaviors/sortable.js`:

- Events: `sortstart, sortover, sortout, sortupdate, sortreceive`
- **Placeholder** asli item ki naapi hui `clientWidth/clientHeight` aur `flex-basis/grow/shrink`
  copy karke banta hai — isliye flex layout me UI uchalta nahi
- **Connected lists** — ek container se doosre me widget drag ho jata hai
- Drop hone pe `$e.run('preview/drop', { container, model, options: { at: index } })`
  → `components/preview/commands/drop.js` → `container.view.createElementFromModel(model, { at })`

**Hamare yahan** — `@dnd-kit` + `src/components/builder/dnd.js` ka pure `resolveDrop()`
(isliye drag-drop bina UI ke test ho jata hai). Kaam karta hai, par:

| Elementor ke paas hai | Hamare paas | Adopt karein? |
|---|---|---|
| Naapa hua drop **placeholder** | patli line + "Add section" button | ✅ asli height ka placeholder — drop kahan girega saaf dikhega |
| **Nested containers** me drop | sirf sections ke beech (flat list) | ✅ sabse bada structural gap — neeche point 4 |
| Ek section ko **doosre page** pe drag | nahi | ⚪ baad me |
| Drag ke waqt auto-scroll | dnd-kit karta hai | ✅ already |

---

## 4. Container / flexbox model — sabse bada structural farq

Elementor v3 me **Section + Column** ko hata ke ek hi **Container** aaya (`modules/atomic-widgets/elements/flexbox`,
`div-block`): flex/grid, nestable, har container ke apne padding/gap/align controls. Isse user
khud columns bana leta hai — 2 column, 3 column, card ke andar card.

**Hamare yahan** — sections flat hain; columns sirf widget ke andar hard-coded hain
(`services.columns` jaisa). User apna layout nahi bana sakta.

> **Recommend:** ek `container` widget add karo — 1/2/3/4 columns, gap, align, aur uske andar
> `AddHere` + `SortableContext` (nested). `Renderer.jsx` recursive ho jayega, `dnd.js` ko
> `containerId` chahiye hoga. Ye ek din ka kaam hai par builder ki power double kar dega.

---

## 5. Atomic Widgets (Elementor v4 ki direction) — hamare design ko validate karta hai

`modules/atomic-widgets/elements/atomic-heading/atomic-heading.php`:

```php
protected static function define_props_schema(): array {
  return [
    'tag'   => String_Prop_Type::make()->enum(['h1'…'h6'])->default('h2'),
    'title' => Html_V3_Prop_Type::make()->default([...])->alias('text','content','heading'),
    'link'  => Link_Prop_Type::make(),
    'classes' => Classes_Prop_Type::make()->default([]),
  ];
}
protected function define_atomic_controls(): array {
  return [ Section::make()->set_items([
    Inline_Editing_Control::bind_to('title')->set_placeholder('Type your title here'),
  ]) ];
}
```

Do cheezein seekhne layak:

1. **Typed prop schema** — `enum`, `default`, `description`, validation. Hamara schema untyped hai;
   `enum` aur validate add karna aasan hai aur galat data se bachata hai.
2. **`Control::bind_to('propPath')`** — control seedha prop path se bandha hota hai. Hamara
   `usedFields.js` ye rishta *guess* karta hai (sentinel render se). Agar variants me explicit
   `bind` likh dein to guess ki zaroorat hi nahi rahegi — aur "image upload ki par dikhi nahi"
   wali problem structurally khatam.

---

## 6. Global tokens (Kits) — `core/kits/documents/tabs/`

- `global-colors.php` — system colors: `primary, secondary, text, accent` + custom
- `global-typography.php` — primary/secondary/text/accent typography
- `theme-style-buttons.php`, `theme-style-typography.php`, `theme-style-form-fields.php`,
  `theme-style-images.php` — poori site ke default styles

Widget control me global reference save hota hai (raw hex nahi), isliye token badlo → poori site badal jati hai.

**Hamare yahan** — `design.js` me 20 palettes + 14 font pairings, theme se sab widgets style lete hain — ye
already Kits jaisa hai ✅. **Gap:** per-block override (`style.bg`, `style.fg`) raw hex save karta hai,
isliye palette badalne pe wo override purane rang pe atka rehta hai.

> **Adopt:** color picker me "Theme colour" option (primary/accent/text/alt) — value `token:primary`
> save ho, render pe resolve ho.

---

## 7. Responsive — `core/breakpoints/`

Breakpoints: `mobile, mobile_extra, tablet, tablet_extra, laptop, widescreen`.
`add_responsive_control()` har device ka alag value banata hai (`padding_tablet`, `padding_mobile`).

**Hamare yahan** — fluid typography (`cqw` container units) + desktop/tablet/mobile preview ✅.
**Gap:** per-device value nahi — mobile pe alag padding nahi de sakte.

> **Adopt:** `block.style` ko `{ base: {...}, tablet: {...}, mobile: {...}` banao; Inspector me
> device icon ke hisaab se wahi layer edit ho. Export me media queries ban jayein.

---

## 8. Style → CSS (inline nahi)

Elementor ka control CSS khud declare karta hai:

```php
'selectors' => [ '{{WRAPPER}}' => 'text-align: {{VALUE}};' ],
```

Isse ek stylesheet generate hoti hai — inline styles nahi.

**Hamare yahan** sab inline `style={{...}}` hai. Isliye **hover states, media queries aur
pseudo-elements possible nahi**, aur exported HTML bada hota hai.

> **Adopt (baad me):** har block ko `wb-<id>` class do aur ek `<style>` block generate karo.
> Tab hover effects (`work.rows` ka hover fill!) aur per-device CSS dono mil jayenge.

---

## 9. History / Undo

Elementor: command-based (`$e.run(...)`), har command apni history entry likhta hai with title —
side panel me "Edited Heading", "Added Widget" dikhta hai, kisi bhi step pe jump kar sakte ho.

**Hamare yahan** — poore `site` ka snapshot (50 tak). Chalta hai, par entries ke naam nahi.

> **Adopt (chhota):** `_snap(label)` me label do → History panel with named steps.

---

## 10. Template library

`includes/template-library/` + `modules/cloud-library` — templates JSON, position pe insert,
apna section save karke reuse.

**Hamare yahan** — 61 templates ✅. **Gap:** user apna section save nahi kar sakta.

> **Adopt:** "Save as my block" — block JSON localStorage me, palette me "My blocks" group.

---

## Priority — kya pehle karein

| # | Kaam | Faayda | Mehnat | Files |
|---|---|---|---|---|
| 1 | **Text pe `data-bind`** (Elementor ka `data-elementor-setting-key`) | Element select 96.6% → 100%, fuzzy matching code hatega | S | `primitives.jsx`, `widgets*.jsx`, `ElementEdit.jsx` |
| 2 | **Container widget** (nested columns + nested drop) | User apna layout bana payega — builder ki asli power | L | naya `container` widget, `Renderer.jsx`, `dnd.js`, `Canvas.jsx` |
| 3 | **Field `condition`** | Panel saaf, kam confusion | S | `Inspector.jsx` + schema |
| 4 | **Drop placeholder (naapa hua)** | Drag karte waqt saaf dikhe kahan girega | S | `AddHere.jsx`, `Canvas.jsx` |
| 5 | **Theme colour tokens** per-block override me | Palette badlo to override bhi sahi rahe | M | `Inspector.jsx`, `Renderer.jsx` |
| 6 | **Per-device style layers** | Mobile pe alag spacing | M | `useBuilder.js`, `Inspector.jsx`, `exportSite.jsx` |
| 7 | **CSS classes + `<style>`** (inline styles ki jagah) | Hover states, media queries, chhota HTML | L | `Renderer.jsx`, `exportSite.jsx` |
| 8 | **Named history + panel** | Undo samajh aaye | S | `useBuilder.js`, naya panel |
| 9 | **Save as my block** | Reuse | S | `useBuilder.js`, `WidgetPalette.jsx` |

**Note:** Elementor GPL-3 hai — code copy karna hamare project pe GPL thop dega.
Sirf **ideas aur architecture patterns** lena hai, code nahi. Upar ka sab kuch pattern-level hai.

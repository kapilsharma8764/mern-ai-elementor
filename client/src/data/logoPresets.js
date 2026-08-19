/* ------------------------------------------------------------------ *
 * Ready-made logo marks — company name se auto generate hote hain.
 * Har preset ek self-contained SVG data URI deta hai, isliye ye upload
 * kiye hue logo ki tarah hi kaam karta hai: header, footer, favicon aur
 * exported HTML — sab jagah.
 * ------------------------------------------------------------------ */

export const LOGO_COLORS = [
  { id: 'blue', from: '#0f7ef0', to: '#00c6ff' },
  { id: 'violet', from: '#7c3aed', to: '#c084fc' },
  { id: 'emerald', from: '#059669', to: '#84cc16' },
  { id: 'sunset', from: '#ea580c', to: '#f59e0b' },
  { id: 'rose', from: '#e11d48', to: '#f472b6' },
  { id: 'slate', from: '#111827', to: '#6b7280' },
]

/** company name se 1-2 letter ka monogram */
export function initialsOf(name = '') {
  const words = String(name).trim().split(/\s+/).filter(Boolean)
  if (!words.length) return 'A'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

const S = 128 // viewBox size

/** shape ke andar monogram — har shape ka apna path/element */
const SHAPES = {
  circle: {
    name: 'Circle',
    body: (f) => `<circle cx="64" cy="64" r="60" fill="${f}"/>`,
  },
  squircle: {
    name: 'Squircle',
    body: (f) => `<rect x="4" y="4" width="120" height="120" rx="34" fill="${f}"/>`,
  },
  square: {
    name: 'Square',
    body: (f) => `<rect x="4" y="4" width="120" height="120" rx="8" fill="${f}"/>`,
  },
  hexagon: {
    name: 'Hexagon',
    body: (f) => `<path d="M64 4 118 34.5v59L64 124 10 93.5v-59z" fill="${f}"/>`,
  },
  shield: {
    name: 'Shield',
    body: (f) => `<path d="M64 5l52 18v40c0 30-21 53-52 60-31-7-52-30-52-60V23z" fill="${f}"/>`,
  },
  ring: {
    name: 'Ring',
    body: (f) => `<circle cx="64" cy="64" r="58" fill="none" stroke="${f}" stroke-width="9"/>`,
    inkOnLight: true,
  },
  outline: {
    name: 'Outline',
    body: (f) => `<rect x="7" y="7" width="114" height="114" rx="26" fill="none" stroke="${f}" stroke-width="8"/>`,
    inkOnLight: true,
  },
  split: {
    name: 'Split',
    body: (f, c) => `<rect x="4" y="4" width="120" height="120" rx="26" fill="${c.from}"/><path d="M124 4v120H64z" fill="${c.to}" opacity=".85"/>`,
  },
  badge: {
    name: 'Badge',
    body: (f, c) => `<rect x="4" y="4" width="120" height="120" rx="26" fill="${f}"/><rect x="34" y="100" width="60" height="8" rx="4" fill="#fff" opacity=".85"/>`,
  },
  stack: {
    name: 'Stack',
    body: (f, c) => `<rect x="4" y="22" width="102" height="102" rx="24" fill="${c.to}" opacity=".55"/><rect x="22" y="4" width="102" height="102" rx="24" fill="${c.from}"/>`,
    textDx: 9, textDy: -9,
  },
  chevron: {
    name: 'Chevron',
    body: (f) => `<path d="M64 6l58 34v48L64 122 6 88V40z" fill="${f}" opacity=".18"/><path d="M64 6l58 34v48L64 122 6 88V40z" fill="none" stroke="${f}" stroke-width="8" stroke-linejoin="round"/>`,
    inkOnLight: true,
  },
  dot: {
    name: 'Dot mark',
    body: (f, c) => `<circle cx="64" cy="64" r="60" fill="${f}" opacity=".14"/><circle cx="64" cy="64" r="42" fill="none" stroke="${c.from}" stroke-width="7"/>`,
    inkOnLight: true,
  },
}

const FONTS = {
  sans: "font-family='Inter, Segoe UI, Helvetica, Arial, sans-serif' font-weight='800'",
  serif: "font-family='Georgia, Times New Roman, serif' font-weight='700'",
  mono: "font-family='JetBrains Mono, Consolas, monospace' font-weight='700'",
}

function buildSvg({ shape, color, font, text }) {
  const sh = SHAPES[shape]
  const gid = `g${shape}${color.id}`
  const fill = `url(#${gid})`
  const inkOnLight = sh.inkOnLight
  const textFill = inkOnLight ? color.from : '#ffffff'
  const size = text.length > 1 ? 46 : 58
  const dx = sh.textDx || 0
  const dy = sh.textDy || 0

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${color.from}"/><stop offset="1" stop-color="${color.to}"/>
</linearGradient></defs>
${sh.body(fill, color)}
<text x="${64 + dx}" y="${64 + dy}" fill="${textFill}" ${FONTS[font]} font-size="${size}" text-anchor="middle" dominant-baseline="central" letter-spacing="-1">${text}</text>
</svg>`
}

export const toDataUri = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\n\s*/g, ' '))}`

const COMBOS = [
  ['squircle', 'sans'], ['circle', 'sans'], ['hexagon', 'sans'], ['shield', 'serif'],
  ['outline', 'sans'], ['ring', 'serif'], ['split', 'sans'], ['badge', 'sans'],
  ['stack', 'sans'], ['chevron', 'mono'], ['dot', 'mono'], ['square', 'serif'],
]

/** name ke hisaab se logo options — colour har combo ke liye rotate hota hai */
export function logoPresets(name, colorId) {
  const text = initialsOf(name)
  const out = []
  COMBOS.forEach(([shape, font], i) => {
    const color = colorId
      ? LOGO_COLORS.find((c) => c.id === colorId) || LOGO_COLORS[0]
      : LOGO_COLORS[i % LOGO_COLORS.length]
    const svg = buildSvg({ shape, color, font, text })
    out.push({
      id: `${shape}-${font}-${color.id}`,
      label: SHAPES[shape].name,
      color: color.id,
      uri: toDataUri(svg),
    })
  })
  return out
}

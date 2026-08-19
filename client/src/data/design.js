// ---- Color palettes -------------------------------------------------------
// Each palette drives the whole site render (sections read from theme).
export const PALETTES = [
  { id: 'indigo',   name: 'Indigo Night',  primary: '#4f46e5', accent: '#22d3ee', bg: '#ffffff', alt: '#f5f6ff', text: '#0f172a', sub: '#4b5563', dark: '#0b1020' },
  { id: 'emerald',  name: 'Emerald',       primary: '#059669', accent: '#84cc16', bg: '#ffffff', alt: '#f2fbf6', text: '#0b1f17', sub: '#4b5f57', dark: '#04150f' },
  { id: 'sunset',   name: 'Sunset',        primary: '#ea580c', accent: '#f59e0b', bg: '#fffdfb', alt: '#fff5ec', text: '#2a1509', sub: '#6b4b33', dark: '#1b0d04' },
  { id: 'rose',     name: 'Rose Quartz',   primary: '#e11d48', accent: '#f472b6', bg: '#ffffff', alt: '#fff1f4', text: '#1f0a10', sub: '#6b4650', dark: '#1a060c' },
  { id: 'ocean',    name: 'Ocean',         primary: '#0284c7', accent: '#38bdf8', bg: '#ffffff', alt: '#eff9ff', text: '#08203a', sub: '#41607d', dark: '#05192b' },
  { id: 'violet',   name: 'Violet Bloom',  primary: '#7c3aed', accent: '#c084fc', bg: '#ffffff', alt: '#f8f4ff', text: '#190b2e', sub: '#5a4a73', dark: '#120725' },
  { id: 'slate',    name: 'Mono Slate',    primary: '#111827', accent: '#6b7280', bg: '#ffffff', alt: '#f4f5f7', text: '#0b0f19', sub: '#525b6b', dark: '#0b0f19' },
  { id: 'gold',     name: 'Royal Gold',    primary: '#b45309', accent: '#eab308', bg: '#fffdf7', alt: '#fdf6e3', text: '#241a05', sub: '#6a5a33', dark: '#1a1204' },
  { id: 'teal',     name: 'Teal Mint',     primary: '#0d9488', accent: '#2dd4bf', bg: '#ffffff', alt: '#effcfa', text: '#062725', sub: '#3f6663', dark: '#03201e' },
  { id: 'crimson',  name: 'Crimson Tech',  primary: '#dc2626', accent: '#fb923c', bg: '#ffffff', alt: '#fff4f2', text: '#1c0808', sub: '#6b4141', dark: '#170505' },
  { id: 'midnight', name: 'Midnight',      primary: '#2563eb', accent: '#60a5fa', bg: '#0f172a', alt: '#131c31', text: '#eef2ff', sub: '#9fb0d0', dark: '#080d1a', darkMode: true },
  { id: 'carbon',   name: 'Carbon Neon',   primary: '#22c55e', accent: '#a3e635', bg: '#0a0f0c', alt: '#101812', text: '#e8ffef', sub: '#8fb79c', dark: '#050806', darkMode: true },
  // --- modern editorial / agency palettes ---
  { id: 'noir',     name: 'Noir Lime',     primary: '#111111', accent: '#d7ff3e', bg: '#ffffff', alt: '#f3f3f0', text: '#0a0a0a', sub: '#5a5a55', dark: '#0a0a0a' },
  { id: 'cream',    name: 'Warm Cream',    primary: '#1c1917', accent: '#f97316', bg: '#faf7f2', alt: '#f1e9dc', text: '#1c1917', sub: '#6b6058', dark: '#17110c' },
  { id: 'mesh',     name: 'Violet Mesh',   primary: '#7c3aed', accent: '#f0abfc', bg: '#0b0620', alt: '#140b30', text: '#f3edff', sub: '#a795cc', dark: '#070315', darkMode: true },
  { id: 'forest',   name: 'Deep Forest',   primary: '#10b981', accent: '#a7f3d0', bg: '#04140f', alt: '#08201a', text: '#e8fff6', sub: '#84b3a2', dark: '#010b08', darkMode: true },
  { id: 'electric', name: 'Electric Blue', primary: '#1d4ed8', accent: '#22d3ee', bg: '#f8fafc', alt: '#eef3ff', text: '#0a1128', sub: '#4c5b7a', dark: '#050b1c' },
  { id: 'coral',    name: 'Coral Pop',     primary: '#f43f5e', accent: '#fb923c', bg: '#fffaf8', alt: '#ffeee9', text: '#26100f', sub: '#6e4b47', dark: '#1a0708' },
  { id: 'ink',      name: 'Ink & Paper',   primary: '#1e293b', accent: '#0ea5e9', bg: '#ffffff', alt: '#f1f5f9', text: '#020617', sub: '#475569', dark: '#020617' },
  { id: 'sand',     name: 'Sand Stone',    primary: '#78350f', accent: '#d6d3d1', bg: '#fbf9f6', alt: '#efe9e1', text: '#221a12', sub: '#6c5c4c', dark: '#1a120a' },
]

export const paletteById = (id) => PALETTES.find((p) => p.id === id) || PALETTES[0]

// ---- Font pairings --------------------------------------------------------
export const FONTS = [
  { id: 'inter',    name: 'Inter / Inter',            heading: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" },
  { id: 'playfair', name: 'Playfair / Inter',         heading: "'Playfair Display', Georgia, serif", body: "'Inter', system-ui, sans-serif" },
  { id: 'poppins',  name: 'Poppins / Poppins',        heading: "'Poppins', system-ui, sans-serif", body: "'Poppins', system-ui, sans-serif" },
  { id: 'space',    name: 'Space Grotesk / Inter',    heading: "'Space Grotesk', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" },
  { id: 'dmserif',  name: 'DM Serif / DM Sans',       heading: "'DM Serif Display', Georgia, serif", body: "'DM Sans', system-ui, sans-serif" },
  { id: 'mono',     name: 'JetBrains Mono / Inter',   heading: "'JetBrains Mono', ui-monospace, monospace", body: "'Inter', system-ui, sans-serif" },
  { id: 'bebas',    name: 'Bebas / Inter',            heading: "'Bebas Neue', Impact, sans-serif", body: "'Inter', system-ui, sans-serif" },
  { id: 'lora',     name: 'Lora / Lato',              heading: "'Lora', Georgia, serif", body: "'Lato', system-ui, sans-serif" },
  { id: 'anton',    name: 'Anton / Inter',            heading: "'Anton', Impact, sans-serif", body: "'Inter', system-ui, sans-serif" },
  { id: 'syne',     name: 'Syne / Manrope',           heading: "'Syne', system-ui, sans-serif", body: "'Manrope', system-ui, sans-serif" },
  { id: 'sora',     name: 'Sora / Inter',             heading: "'Sora', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" },
  { id: 'outfit',   name: 'Outfit / Outfit',          heading: "'Outfit', system-ui, sans-serif", body: "'Outfit', system-ui, sans-serif" },
  { id: 'archivo',  name: 'Archivo Black / Inter',    heading: "'Archivo Black', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" },
  { id: 'fraunces', name: 'Fraunces / Manrope',       heading: "'Fraunces', Georgia, serif", body: "'Manrope', system-ui, sans-serif" },
]
export const fontById = (id) => FONTS.find((f) => f.id === id) || FONTS[0]

export const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@500;700;900&family=Poppins:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=DM+Serif+Display&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;600;800&family=Bebas+Neue&family=Lora:wght@400;600;700&family=Lato:wght@300;400;700;900&family=Anton&family=Syne:wght@600;700;800&family=Manrope:wght@400;500;700;800&family=Sora:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&family=Archivo+Black&family=Fraunces:opsz,wght@9..144,400;9..144,700;9..144,900&display=swap'

// ---- Layout knobs that visibly change structure ---------------------------
export const RADIUS = { none: '0px', sm: '6px', md: '12px', lg: '20px', pill: '999px' }
export const DENSITY = { compact: 0.75, normal: 1, roomy: 1.35 }
export const CONTAINERS = { narrow: '1040px', normal: '1180px', wide: '1360px', full: '100%' }

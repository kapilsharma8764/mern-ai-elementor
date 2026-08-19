import React from 'react'

export const px = (n) => `${n}px`

/**
 * Fluid font size — section ki apni chaudai (cqw) ke hisaab se scale hota hai,
 * isliye mobile/tablet preview me heading kabhi overflow nahi hoti.
 */
export const fluid = (min, cqw, max, scale = 1) =>
  `calc(clamp(${min}px, ${cqw}cqw, ${max}px) * ${scale})`

/** lamba text kabhi container se bahar na nikle */
export const safeText = {
  overflowWrap: 'anywhere',
  wordBreak: 'normal',
  hyphens: 'auto',
}

/** container width + section vertical padding derived from theme */
export function Wrap({ t, children, style, className = '' }) {
  return (
    <div
      className={className}
      style={{ maxWidth: t.container, margin: '0 auto', padding: `0 clamp(16px, 4cqw, 32px)`, minWidth: 0, ...style }}
    >
      {children}
    </div>
  )
}

export function Section({ t, tone = 'bg', children, style = {}, pad }) {
  const bg = tone === 'alt' ? t.alt : tone === 'primary' ? t.primary : tone === 'dark' ? t.dark : t.bg
  const fg = tone === 'primary' || tone === 'dark' ? '#fff' : t.text
  const p = (pad ?? 88) * t.density
  return (
    <section style={{ background: bg, color: fg, padding: `${px(p)} 0`, ...style }}>{children}</section>
  )
}

export function Eyebrow({ t, children, center }) {
  if (!children) return null
  return (
    <div
      style={{
        display: 'inline-block',
        color: t.primary,
        background: hexA(t.primary, 0.1),
        borderRadius: t.radiusBtn ?? t.radius,
        padding: '6px 12px',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '.12em',
        textTransform: 'uppercase',
        margin: center ? '0 auto 14px' : '0 0 14px',
      }}
    >
      {children}
    </div>
  )
}

export function H({ t, level = 2, children, style }) {
  // [min, cqw, max] — har heading level ka fluid range
  const sizes = { 1: [30, 6.0, 56], 2: [24, 4.2, 40], 3: [20, 2.6, 26], 4: [16, 1.7, 19] }
  const [mn, cq, mx] = sizes[level] || sizes[2]
  const Tag = `h${level}`
  return (
    <Tag
      style={{
        fontFamily: t.headingFont,
        fontSize: fluid(mn, cq, mx, t.headingScale ?? 1),
        lineHeight: level < 3 ? 1.08 : 1.2,
        ...safeText,
        fontWeight: level > 2 ? 700 : 800,
        letterSpacing: '-.02em',
        margin: 0,
        ...style,
      }}
    >
      {children}
    </Tag>
  )
}

export function P({ t, children, style, dim = true }) {
  return (
    <p style={{ fontFamily: t.bodyFont, fontSize: 16, lineHeight: 1.7, color: dim ? t.sub : 'inherit', margin: 0, ...safeText, ...style }}>
      {children}
    </p>
  )
}

export function Btn({ t, children, variant = 'solid', size = 'md' }) {
  const pad = size === 'lg' ? '15px 28px' : size === 'sm' ? '8px 14px' : '12px 22px'
  const base = {
    display: 'inline-block',
    borderRadius: t.radiusBtn ?? t.radius,
    padding: pad,
    fontFamily: t.bodyFont,
    fontWeight: 600,
    fontSize: size === 'lg' ? 16 : 14,
    textDecoration: 'none',
    cursor: 'pointer',
    border: '1px solid transparent',
  }
  const styles = {
    solid: { ...base, background: t.primary, color: '#fff' },
    accent: { ...base, background: t.accent, color: '#08131f' },
    outline: { ...base, background: 'transparent', color: 'inherit', borderColor: hexA('#888888', 0.45) },
    ghost: { ...base, background: hexA(t.primary, 0.12), color: t.primary },
    light: { ...base, background: '#fff', color: t.primary },
  }
  return <span style={styles[variant] || styles.solid}>{children}</span>
}

/** image placeholder — uses real src if given, else a themed gradient block */
export function Img({ t, src, alt = '', ratio = '4/3', radius, style, seed = 0, label, bind, avatar }) {
  const r = radius ?? t.radiusMedia ?? t.radius
  // bind = is image slot ka prop path — builder isse image select/edit karta hai
  const dataBind = bind ? JSON.stringify(Array.isArray(bind) ? bind : [bind]) : undefined
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        data-bind={dataBind}
        data-avatar={avatar ? '1' : undefined}
        style={{ width: '100%', aspectRatio: ratio, objectFit: 'cover', borderRadius: r, display: 'block', ...style }}
      />
    )
  }
  // template ka imageSeed + section ka apna seed -> har jagah alag gradient
  const angles = [135, 45, 200, 320, 90, 250, 165, 20]
  const a = angles[(seed + (t.imageSeed || 0) * 3) % angles.length]
  const mix = ((seed + (t.imageSeed || 0)) % 3)
  return (
    <div
      data-bind={dataBind}
      data-avatar={avatar ? '1' : undefined}
      style={{
        width: '100%',
        aspectRatio: ratio,
        borderRadius: r,
        background:
          mix === 0
            ? `linear-gradient(${a}deg, ${hexA(t.primary, 0.85)}, ${hexA(t.accent, 0.75)})`
            : mix === 1
              ? `radial-gradient(circle at 30% 25%, ${hexA(t.accent, 0.9)}, ${hexA(t.primary, 0.8)} 70%)`
              : `linear-gradient(${a}deg, ${hexA(t.accent, 0.8)} 0%, ${hexA(t.primary, 0.9)} 55%, ${hexA(t.accent, 0.6)} 100%)`,
        display: 'grid',
        placeItems: 'center',
        color: 'rgba(255,255,255,.85)',
        fontFamily: t.bodyFont,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '.06em',
        ...style,
      }}
    >
      {label ?? 'IMAGE'}
    </div>
  )
}

export function Grid({ cols = 3, gap = 24, children, style, responsive }) {
  // responsive = chhoti width pe columns apne aap kam ho jate hain
  const min = cols >= 4 ? 200 : cols === 3 ? 240 : 280
  const cssCols = responsive
    ? `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`
    : `repeat(${cols}, minmax(0,1fr))`
  return (
    <div style={{ display: 'grid', gridTemplateColumns: cssCols, gap, minWidth: 0, ...style }}>
      {children}
    </div>
  )
}

export function Card({ t, children, style, tone = 'surface' }) {
  const bgs = { surface: '#ffffff', alt: t.alt, glass: hexA('#ffffff', 0.08), none: 'transparent' }
  return (
    <div
      style={{
        background: t.darkMode && tone === 'surface' ? hexA('#ffffff', 0.05) : bgs[tone],
        border: `1px solid ${hexA(t.text, t.darkMode ? 0.14 : 0.08)}`,
        borderRadius: t.radius,
        padding: 24 * t.density,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function Stars({ n = 5, color }) {
  return <div style={{ color, letterSpacing: 2, fontSize: 14 }}>{'★'.repeat(n)}</div>
}

export function hexA(hex, a) {
  const h = (hex || '#000000').replace('#', '')
  const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const num = parseInt(f, 16)
  const r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255
  return `rgba(${r},${g},${b},${a})`
}

export function SectionHead({ t, eyebrow, title, sub, align = 'center', max = 640 }) {
  const center = align === 'center'
  return (
    <div style={{ textAlign: align, maxWidth: center ? max : 'none', margin: center ? '0 auto 48px' : '0 0 44px' }}>
      <Eyebrow t={t} center={center}>{eyebrow}</Eyebrow>
      <H t={t} level={2}>{title}</H>
      {sub ? <P t={t} style={{ marginTop: 14 }}>{sub}</P> : null}
    </div>
  )
}

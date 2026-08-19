import React from 'react'
import { Wrap, Section, H, P, Btn, Img, Grid, Card, Stars, hexA, SectionHead, Eyebrow, fluid } from './primitives'
import { EXTRA_VARIANTS, EXTRA_WIDGETS } from './widgetsPro'
import { SAAS_VARIANTS, SAAS_WIDGETS } from './widgetsSaaS'
import { A } from './links'

/* ------------------------------------------------------------------ *
 * Every widget: { label, group, defaults, schema, variants }
 * render({ p, t, biz })  ->  p = props, t = theme, biz = business info
 * ------------------------------------------------------------------ */

export const addressOf = (biz) =>
  [biz.address, biz.city, biz.state, biz.pincode, biz.country].filter(Boolean).join(', ')

export const socialsOf = (biz) =>
  [['Facebook', biz.facebook], ['Instagram', biz.instagram], ['LinkedIn', biz.linkedin],
   ['X', biz.twitter], ['YouTube', biz.youtube]].filter(([, v]) => v)

const F = {
  text: (key, label, extra = {}) => ({ key, label, type: 'text', ...extra }),
  area: (key, label, extra = {}) => ({ key, label, type: 'textarea', ...extra }),
  img: (key, label) => ({ key, label, type: 'image' }),
  num: (key, label, extra = {}) => ({ key, label, type: 'number', min: 0, ...extra }),
  sel: (key, label, options) => ({ key, label, type: 'select', options }),
  bool: (key, label) => ({ key, label, type: 'toggle' }),
  list: (key, label, fields, addLabel = 'Add item') => ({ key, label, type: 'list', fields, addLabel }),
}

/* =============================== HEADER =============================== */
const navOf = (p) => p.links || []

export const LOGO_SIZES = { sm: 30, md: 38, lg: 52 }
export const defaultLogoStyle = { mode: 'logoName', shape: 'rounded', size: 'md', position: 'left' }

/** Logo — wizard me chuna gaya display style yahan apply hota hai. */
export const Logo = ({ t, biz, invert, style: override }) => {
  const ls = { ...defaultLogoStyle, ...(biz.logoStyle || {}), ...(override || {}) }
  const h = LOGO_SIZES[ls.size] || LOGO_SIZES.md
  const showMark = ls.mode !== 'name'
  const showName = ls.mode !== 'logo' || !biz.logo
  const radius = ls.shape === 'round' ? '999px' : ls.shape === 'square' ? '0px' : t.radius

  const mark = biz.logo ? (
    ls.shape === 'square' ? (
      <img src={biz.logo} alt={biz.name || 'logo'} style={{ height: h, width: 'auto', maxWidth: h * 3.2, objectFit: 'contain', display: 'block' }} />
    ) : (
      <span style={{ height: h, width: h, borderRadius: radius, overflow: 'hidden', display: 'grid', placeItems: 'center', background: hexA(invert ? '#ffffff' : t.text, 0.06), flexShrink: 0 }}>
        <img src={biz.logo} alt={biz.name || 'logo'} style={{ height: '100%', width: '100%', objectFit: 'contain', padding: h * 0.12 }} />
      </span>
    )
  ) : (
    <span style={{ height: h, width: h, borderRadius: radius, background: `linear-gradient(135deg, ${t.primary}, ${t.accent})`, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontFamily: t.headingFont, fontSize: h * 0.44, flexShrink: 0 }}>
      {(biz.name || 'A').slice(0, 1).toUpperCase()}
    </span>
  )

  return (
    <div data-brand="logo" title="Logo — click karke badlo" style={{
      display: 'flex',
      alignItems: 'center',
      gap: h * 0.28,
      cursor: 'pointer',
      flexDirection: ls.position === 'center' ? 'column' : 'row',
      textAlign: ls.position === 'center' ? 'center' : 'left',
      justifyContent: ls.position === 'center' ? 'center' : 'flex-start',
    }}>
      {showMark ? mark : null}
      {showName ? (
        <span style={{ fontFamily: t.headingFont, fontWeight: 800, fontSize: h * 0.5, lineHeight: 1.15, color: invert ? '#fff' : 'inherit', overflowWrap: 'anywhere' }}>
          {biz.name || 'Your Company'}
        </span>
      ) : null}
    </div>
  )
}

const Nav = ({ t, p, biz, nav, invert, gap = 26 }) => (
  <nav style={{ display: 'flex', gap, alignItems: 'center', flexWrap: 'wrap', fontFamily: t.bodyFont, fontSize: 15, fontWeight: 500, opacity: invert ? 0.92 : 0.85 }}>
    {navOf(p).map((l, i) => (
      <A key={i} link={l.link} biz={biz} onNavigate={nav} style={{ color: invert ? '#fff' : 'inherit' }}>{l.label}</A>
    ))}
  </nav>
)

const header = {
  label: 'Header',
  desc: 'Logo, menu aur button',
  popular: true,
  group: 'Layout',
  defaults: {
    links: [
      { label: 'Home', link: { kind: 'section', target: 'top' } },
      { label: 'About', link: { kind: 'section', target: 's-about' } },
      { label: 'Services',
  desc: 'Aap kya kaam karte ho',
  popular: true, link: { kind: 'section', target: 's-services' } },
      { label: 'Contact', link: { kind: 'section', target: 's-contact' } },
    ],
    cta: 'Get a Quote',
    ctaLink: { kind: 'section', target: 's-contact' },
  },
  schema: [
    F.list('links', 'Menu links', [F.text('label', 'Label'), { key: 'link', label: 'Links to', type: 'link' }], 'Add link'),
    F.text('cta', 'Button text'),
    { key: 'ctaLink', label: 'Button links to', type: 'link' },
  ],
  variants: {
    classic: {
      name: 'Classic left logo',
      render: ({ p, t, biz, nav }) => (
        <header style={{ background: t.bg, borderBottom: `1px solid ${hexA(t.text, 0.08)}`, color: t.text }}>
          <Wrap t={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', minHeight: 76, paddingTop: 12, paddingBottom: 12 }}>
            <Logo t={t} biz={biz} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              <Nav t={t} p={p} biz={biz} nav={nav} />
              <A link={p.ctaLink} biz={biz} onNavigate={nav}><Btn t={t} size="sm">{p.cta}</Btn></A>
            </div>
          </Wrap>
        </header>
      ),
    },
    centered: {
      name: 'Centered logo',
      render: ({ p, t, biz, nav }) => (
        <header style={{ background: t.bg, borderBottom: `1px solid ${hexA(t.text, 0.08)}`, color: t.text, textAlign: 'center' }}>
          <Wrap t={t} style={{ padding: '22px 24px' }}>
            <div style={{ display: 'inline-flex' }}><Logo t={t} biz={biz} /></div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}><Nav t={t} p={p} biz={biz} nav={nav} gap={34} /></div>
          </Wrap>
        </header>
      ),
    },
    split: {
      name: 'Split nav',
      render: ({ p, t, biz, nav }) => {
        const l = navOf(p)
        const half = Math.ceil(l.length / 2)
        const navStyle = { display: 'flex', gap: 24, fontFamily: t.bodyFont, fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }
        return (
          <header style={{ background: t.alt, color: t.text }}>
            <Wrap t={t} style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', minHeight: 84, gap: 20, paddingTop: 12, paddingBottom: 12 }}>
              <nav style={navStyle}>{l.slice(0, half).map((x, i) => <A key={i} link={x.link} biz={biz} onNavigate={nav}>{x.label}</A>)}</nav>
              <Logo t={t} biz={biz} />
              <nav style={{ ...navStyle, justifyContent: 'flex-end' }}>{l.slice(half).map((x, i) => <A key={i} link={x.link} biz={biz} onNavigate={nav}>{x.label}</A>)}</nav>
            </Wrap>
          </header>
        )
      },
    },
    topbar: {
      name: 'With top info bar',
      render: ({ p, t, biz, nav }) => {
        const hours = [biz.workingDays, biz.timing].filter(Boolean).join(', ')
        const right = [biz.phone, hours].filter(Boolean)
        const showBar = !!(biz.email || right.length)
        return (
        <header style={{ color: t.text }}>
          {showBar ? (
          <div style={{ background: t.primary, color: '#fff', fontSize: 13, fontFamily: t.bodyFont }}>
            <Wrap t={t} style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px', justifyContent: 'space-between', padding: '9px clamp(16px, 4cqw, 32px)' }}>
              <span>{biz.email}</span>
              <span>{right.join('  /  ')}</span>
            </Wrap>
          </div>
          ) : null}
          <div style={{ background: t.bg, borderBottom: `1px solid ${hexA(t.text, 0.08)}` }}>
            <Wrap t={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', minHeight: 74, paddingTop: 12, paddingBottom: 12 }}>
              <Logo t={t} biz={biz} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}><Nav t={t} p={p} biz={biz} nav={nav} /><A link={p.ctaLink} biz={biz} onNavigate={nav}><Btn t={t} size="sm" variant="ghost">{p.cta}</Btn></A></div>
            </Wrap>
          </div>
        </header>
        )
      },
    },
    floating: {
      name: 'Floating pill',
      render: ({ p, t, biz, nav }) => (
        <header style={{ background: t.bg, padding: '20px 0', color: t.text }}>
          <Wrap t={t}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', background: t.darkMode ? hexA('#ffffff', 0.06) : '#fff', border: `1px solid ${hexA(t.text, 0.1)}`, borderRadius: 999, padding: '10px 12px 10px 20px', boxShadow: '0 10px 30px -18px rgba(0,0,0,.5)' }}>
              <Logo t={t} biz={biz} />
              <Nav t={t} p={p} biz={biz} nav={nav} gap={22} />
              <A link={p.ctaLink} biz={biz} onNavigate={nav}><Btn t={t} size="sm">{p.cta}</Btn></A>
            </div>
          </Wrap>
        </header>
      ),
    },
  },
}

/* =============================== HERO / SLIDER =============================== */
const hero = {
  label: 'Hero / Front Slider',
  desc: 'Sabse upar bada photo aur heading',
  popular: true,
  group: 'Hero',
  defaults: {
    eyebrow: 'Welcome',
    title: 'We build things that grow your business',
    sub: 'A short line about what you do and why customers should trust you. Keep it clear and human.',
    cta: 'Get Started',
    ctaLink: { kind: 'section', target: 's-contact' },
    cta2: 'Learn more',
    cta2Link: { kind: 'section', target: 's-about' },
    image: '',
    slides: [{ title: 'Design that converts' }, { title: 'Engineering you can trust' }, { title: 'Support that never sleeps' }],
  },
  schema: [
    F.text('eyebrow', 'Eyebrow'), F.text('title', 'Headline'), F.area('sub', 'Sub headline'),
    F.text('cta', 'Primary button'), { key: 'ctaLink', label: 'Primary button links to', type: 'link' },
    F.text('cta2', 'Secondary button'), { key: 'cta2Link', label: 'Secondary button links to', type: 'link' },
    F.img('image', 'Hero image'),
    F.list('slides', 'Slider captions', [F.text('title', 'Caption')], 'Add slide'),
  ],
  variants: {
    split: {
      name: 'Split text + image',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} pad={96}>
          <Wrap t={t}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 56, alignItems: 'center' }}>
              <div>
                <Eyebrow t={t}>{p.eyebrow}</Eyebrow>
                <H t={t} level={1}>{p.title}</H>
                <P t={t} style={{ marginTop: 18, fontSize: 18 }}>{p.sub}</P>
                <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>
                  <A link={p.ctaLink} biz={biz} onNavigate={nav}><Btn t={t} size="lg">{p.cta}</Btn></A><A link={p.cta2Link} biz={biz} onNavigate={nav}><Btn t={t} size="lg" variant="outline">{p.cta2}</Btn></A>
                </div>
              </div>
              <Img t={t} src={p.image} ratio="4/3" seed={1} bind="image" />
            </div>
          </Wrap>
        </Section>
      ),
    },
    centered: {
      name: 'Centered big type',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} pad={120}>
          <Wrap t={t} style={{ textAlign: 'center', maxWidth: 860 }}>
            <Eyebrow t={t} center>{p.eyebrow}</Eyebrow>
            <H t={t} level={1} style={{ fontSize: fluid(32, 6.2, 64, t.headingScale ?? 1) }}>{p.title}</H>
            <P t={t} style={{ marginTop: 20, fontSize: 18, maxWidth: 620, marginInline: 'auto' }}>{p.sub}</P>
            <div style={{ display: 'flex', gap: 12, marginTop: 32, justifyContent: 'center' }}>
              <A link={p.ctaLink} biz={biz} onNavigate={nav}><Btn t={t} size="lg">{p.cta}</Btn></A><A link={p.cta2Link} biz={biz} onNavigate={nav}><Btn t={t} size="lg" variant="ghost">{p.cta2}</Btn></A>
            </div>
          </Wrap>
        </Section>
      ),
    },
    slider: {
      name: 'Full-bleed slider',
      render: ({ p, t, biz, nav }) => (
        <section style={{ position: 'relative', minHeight: 520, display: 'grid', alignItems: 'center', background: `linear-gradient(115deg, ${t.primary}, ${t.accent})`, color: '#fff' }}>
          {p.image ? <img src={p.image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} /> : null}
          <Wrap t={t} style={{ position: 'relative', padding: 'clamp(40px, 7cqw, 90px) clamp(16px, 4cqw, 32px)' }}>
            <div style={{ maxWidth: 720 }}>
              <div style={{ display: 'inline-block', background: 'rgba(255,255,255,.18)', borderRadius: t.radius, padding: '6px 12px', fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 14, fontFamily: t.bodyFont }}>{p.eyebrow}</div>
              <H t={t} level={1} style={{ fontSize: fluid(30, 5.8, 60, t.headingScale ?? 1) }}>{p.title}</H>
              <P t={t} dim={false} style={{ marginTop: 18, fontSize: 18, opacity: 0.92 }}>{p.sub}</P>
              <div style={{ display: 'flex', gap: 12, marginTop: 30 }}><A link={p.ctaLink} biz={biz} onNavigate={nav}><Btn t={t} size="lg" variant="light">{p.cta}</Btn></A><A link={p.cta2Link} biz={biz} onNavigate={nav}><Btn t={t} size="lg" variant="outline">{p.cta2}</Btn></A></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 48 }}>
              {(p.slides || []).map((s, i) => (
                <div key={i} style={{ flex: 1, borderTop: `3px solid ${i === 0 ? '#fff' : 'rgba(255,255,255,.35)'}`, paddingTop: 12, fontSize: 14, fontWeight: 600, opacity: i === 0 ? 1 : 0.7, fontFamily: t.bodyFont }}>{s.title}</div>
              ))}
            </div>
          </Wrap>
        </section>
      ),
    },
    overlap: {
      name: 'Card overlap',
      render: ({ p, t, biz, nav }) => (
        <section style={{ background: t.alt, color: t.text, padding: `clamp(34px, 6.67cqw, ${80 * t.density}px) 0` }}>
          <Wrap t={t}>
            <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
              <Eyebrow t={t} center>{p.eyebrow}</Eyebrow>
              <H t={t} level={1}>{p.title}</H>
              <P t={t} style={{ marginTop: 16 }}>{p.sub}</P>
              <div style={{ display: 'flex', gap: 12, marginTop: 26, justifyContent: 'center' }}><A link={p.ctaLink} biz={biz} onNavigate={nav}><Btn t={t} size="lg">{p.cta}</Btn></A></div>
            </div>
            <div style={{ marginTop: 48, borderRadius: t.radius, overflow: 'hidden', border: `1px solid ${hexA(t.text, 0.1)}`, boxShadow: '0 40px 80px -50px rgba(0,0,0,.6)' }}>
              <Img t={t} src={p.image} ratio="16/7" radius="0px" seed={3} label="DASHBOARD PREVIEW" bind="image" />
            </div>
          </Wrap>
        </section>
      ),
    },
    minimal: {
      name: 'Editorial left rule',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} pad={110}>
          <Wrap t={t}>
            <div style={{ borderLeft: `4px solid ${t.primary}`, paddingLeft: 32, maxWidth: 900 }}>
              <div style={{ fontFamily: t.bodyFont, letterSpacing: '.3em', textTransform: 'uppercase', fontSize: 11, color: t.sub, marginBottom: 18 }}>{p.eyebrow}</div>
              <H t={t} level={1} style={{ fontSize: fluid(30, 5.6, 58, t.headingScale ?? 1) }}>{p.title}</H>
              <P t={t} style={{ marginTop: 22, fontSize: 18, maxWidth: 620 }}>{p.sub}</P>
              <div style={{ marginTop: 28, display: 'flex', gap: 20, alignItems: 'center' }}>
                <A link={p.ctaLink} biz={biz} onNavigate={nav}><Btn t={t} size="lg">{p.cta}</Btn></A>
                <span style={{ fontFamily: t.bodyFont, fontWeight: 600, borderBottom: `2px solid ${t.primary}`, paddingBottom: 2 }}>{p.cta2}</span>
              </div>
            </div>
          </Wrap>
        </Section>
      ),
    },
    collage: {
      name: 'Collage grid',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} pad={84}>
          <Wrap t={t}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 44, alignItems: 'center' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Img t={t} src={p.image} ratio="3/4" seed={2} bind="image" />
                <div style={{ display: 'grid', gap: 16 }}>
                  <Img t={t} ratio="1/1" seed={4} /><Img t={t} ratio="1/1" seed={5} />
                </div>
              </div>
              <div>
                <Eyebrow t={t}>{p.eyebrow}</Eyebrow>
                <H t={t} level={1}>{p.title}</H>
                <P t={t} style={{ marginTop: 18, fontSize: 17 }}>{p.sub}</P>
                <div style={{ display: 'flex', gap: 12, marginTop: 28 }}><A link={p.ctaLink} biz={biz} onNavigate={nav}><Btn t={t} size="lg">{p.cta}</Btn></A><A link={p.cta2Link} biz={biz} onNavigate={nav}><Btn t={t} size="lg" variant="outline">{p.cta2}</Btn></A></div>
              </div>
            </div>
          </Wrap>
        </Section>
      ),
    },
  },
}

/* =============================== ABOUT =============================== */
const about = {
  label: 'About Section',
  desc: 'Company ki kahani',
  popular: true,
  group: 'Content',
  defaults: {
    eyebrow: 'About us',
    title: 'Built on trust, delivered with care',
    body: 'Tell your story here - when you started, what problem you solve and who you serve. Two or three sentences is plenty for the home page.',
    points: [{ label: 'ISO certified process' }, { label: '15+ years of experience' }, { label: 'Dedicated support team' }],
    image: '',
    years: '15',
  },
  schema: [
    F.text('eyebrow', 'Eyebrow'), F.text('title', 'Title'), F.area('body', 'Body'),
    F.list('points', 'Bullet points', [F.text('label', 'Point')]), F.img('image', 'Image'), F.text('years', 'Years badge'),
  ],
  variants: {
    imageLeft: {
      name: 'Image left + bullets',
      render: ({ p, t, biz, nav }) => (
        <Section t={t}>
          <Wrap t={t}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 56, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Img t={t} src={p.image} ratio="1/1" seed={6} bind="image" />
                <div style={{ position: 'absolute', right: -14, bottom: -14, background: t.primary, color: '#fff', borderRadius: t.radius, padding: '18px 22px', fontFamily: t.headingFont, fontWeight: 800, lineHeight: 1 }}>
                  <div style={{ fontSize: 34 }}>{p.years}+</div><div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>YEARS</div>
                </div>
              </div>
              <div>
                <Eyebrow t={t}>{p.eyebrow}</Eyebrow>
                <H t={t} level={2}>{p.title}</H>
                <P t={t} style={{ marginTop: 16 }}>{p.body}</P>
                <div style={{ marginTop: 24, display: 'grid', gap: 12 }}>
                  {(p.points || []).map((x, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', fontFamily: t.bodyFont }}>
                      <span style={{ width: 22, height: 22, borderRadius: 999, background: hexA(t.primary, 0.15), color: t.primary, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800 }}>✓</span>
                      {x.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Wrap>
        </Section>
      ),
    },
    stacked: {
      name: 'Centered statement',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="alt">
          <Wrap t={t} style={{ textAlign: 'center', maxWidth: 780 }}>
            <Eyebrow t={t} center>{p.eyebrow}</Eyebrow>
            <H t={t} level={2} style={{ fontSize: fluid(24, 4.4, 40) }}>{p.title}</H>
            <P t={t} style={{ marginTop: 18, fontSize: 18 }}>{p.body}</P>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 26 }}>
              {(p.points || []).map((x, i) => (
                <span key={i} style={{ border: `1px solid ${hexA(t.text, 0.14)}`, borderRadius: 999, padding: '8px 16px', fontSize: 14, fontFamily: t.bodyFont }}>{x.label}</span>
              ))}
            </div>
          </Wrap>
        </Section>
      ),
    },
    twoCol: {
      name: 'Two column text',
      render: ({ p, t, biz, nav }) => (
        <Section t={t}>
          <Wrap t={t}>
            <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 60 }}>
              <div><Eyebrow t={t}>{p.eyebrow}</Eyebrow><H t={t} level={2}>{p.title}</H></div>
              <div>
                <P t={t} style={{ fontSize: 17 }}>{p.body}</P>
                <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {(p.points || []).map((x, i) => (
                    <div key={i} style={{ borderTop: `2px solid ${t.primary}`, paddingTop: 12, fontFamily: t.bodyFont, fontWeight: 600 }}>{x.label}</div>
                  ))}
                </div>
              </div>
            </div>
          </Wrap>
        </Section>
      ),
    },
    banner: {
      name: 'Dark banner',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="dark">
          <Wrap t={t}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 44, alignItems: 'center' }}>
              <div style={{ flex: '1.1 1 320px', minWidth: 0 }}>
                <Eyebrow t={t}>{p.eyebrow}</Eyebrow>
                <H t={t} level={2} style={{ color: '#fff' }}>{p.title}</H>
                <P t={t} dim={false} style={{ marginTop: 16, opacity: 0.8, maxWidth: '52ch' }}>{p.body}</P>
              </div>
              <div style={{ flex: '1 1 300px', minWidth: 0, maxWidth: 520 }}>
                <Img t={t} src={p.image} ratio="16/10" seed={8} bind="image" />
              </div>
            </div>
          </Wrap>
        </Section>
      ),
    },
  },
}

/* =============================== SERVICES =============================== */
const services = {
  label: 'Services',
  group: 'Content',
  defaults: {
    eyebrow: 'What we do',
    title: 'Services built around your goals',
    sub: 'Everything you need, under one roof.',
    columns: 3,
    items: [
      { title: 'Consulting', text: 'Strategy sessions that turn goals into a concrete roadmap.', icon: '◆' },
      { title: 'Implementation', text: 'Hands-on delivery by a senior team, on time and on budget.', icon: '◈' },
      { title: 'Support', text: 'Ongoing maintenance, monitoring and improvements.', icon: '◇' },
      { title: 'Training', text: 'Workshops so your team can own the result confidently.', icon: '❖' },
      { title: 'Audit', text: 'A deep review of what you have and what to fix first.', icon: '⬢' },
      { title: 'Managed care', text: 'We run it end to end while you focus on your business.', icon: '⬡' },
    ],
  },
  schema: [
    F.text('eyebrow', 'Eyebrow'), F.text('title', 'Title'), F.area('sub', 'Sub text'),
    F.sel('columns', 'Columns', [2, 3, 4]),
    F.list('items', 'Services', [F.text('icon', 'Icon'), F.text('title', 'Title'), F.area('text', 'Description'), F.img('image', 'Image')], 'Add service'),
  ],
  variants: {
    cards: {
      name: 'Icon cards',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="alt">
          <Wrap t={t}>
            <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} sub={p.sub} />
            <Grid cols={p.columns || 3} gap={22} responsive>
              {(p.items || []).map((s, i) => (
                <Card key={i} t={t}>
                  <div style={{ width: 46, height: 46, borderRadius: t.radius, background: hexA(t.primary, 0.12), color: t.primary, display: 'grid', placeItems: 'center', fontSize: 20 }}>{s.icon || '◆'}</div>
                  <H t={t} level={4} style={{ marginTop: 16 }}>{s.title}</H>
                  <P t={t} style={{ marginTop: 8, fontSize: 15 }}>{s.text}</P>
                </Card>
              ))}
            </Grid>
          </Wrap>
        </Section>
      ),
    },
    imageCards: {
      name: 'Image cards',
      render: ({ p, t, biz, nav }) => (
        <Section t={t}>
          <Wrap t={t}>
            <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} sub={p.sub} align="left" />
            <Grid cols={p.columns || 3} gap={24} responsive>
              {(p.items || []).map((s, i) => (
                <div key={i} style={{ border: `1px solid ${hexA(t.text, 0.1)}`, borderRadius: t.radius, overflow: 'hidden' }}>
                  <Img t={t} src={s.image} ratio="16/10" radius="0px" seed={i} bind={['items', i, 'image']} />
                  <div style={{ padding: 22 }}>
                    <H t={t} level={4}>{s.title}</H>
                    <P t={t} style={{ marginTop: 8, fontSize: 15 }}>{s.text}</P>
                    <div style={{ marginTop: 14, color: t.primary, fontWeight: 700, fontFamily: t.bodyFont, fontSize: 14 }}>Read more →</div>
                  </div>
                </div>
              ))}
            </Grid>
          </Wrap>
        </Section>
      ),
    },
    rows: {
      name: 'Numbered rows',
      render: ({ p, t, biz, nav }) => (
        <Section t={t}>
          <Wrap t={t}>
            <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} sub={p.sub} align="left" />
            <div>
              {(p.items || []).map((s, i) => (
                <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px', padding: '24px 0', borderTop: `1px solid ${hexA(t.text, 0.12)}`, alignItems: 'flex-start' }}>
                  <div style={{ fontFamily: t.headingFont, fontSize: fluid(20, 3, 28), fontWeight: 800, color: hexA(t.primary, 0.5), width: 56 }}>{String(i + 1).padStart(2, '0')}</div>
                  <H t={t} level={4} style={{ flex: '1 1 180px', minWidth: 0 }}>{s.title}</H>
                  <P t={t} style={{ flex: '1.4 1 240px', minWidth: 0 }}>{s.text}</P>
                </div>
              ))}
            </div>
          </Wrap>
        </Section>
      ),
    },
    tiles: {
      name: 'Bold dark tiles',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="dark">
          <Wrap t={t}>
            <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} sub={p.sub} />
            <Grid cols={p.columns || 3} gap={2} style={{ borderRadius: t.radius, overflow: 'hidden', border: `1px solid ${hexA('#ffffff', 0.12)}` }}>
              {(p.items || []).map((s, i) => (
                <div key={i} style={{ background: hexA('#ffffff', 0.04), padding: 30 }}>
                  <div style={{ fontSize: 24, color: t.accent }}>{s.icon || '◆'}</div>
                  <H t={t} level={4} style={{ marginTop: 14, color: '#fff' }}>{s.title}</H>
                  <P t={t} dim={false} style={{ marginTop: 8, fontSize: 15, opacity: 0.7 }}>{s.text}</P>
                </div>
              ))}
            </Grid>
          </Wrap>
        </Section>
      ),
    },
    sticky: {
      name: 'Sticky split list',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="alt">
          <Wrap t={t}>
            <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 50 }}>
              <div>
                <Eyebrow t={t}>{p.eyebrow}</Eyebrow><H t={t} level={2}>{p.title}</H>
                <P t={t} style={{ marginTop: 14 }}>{p.sub}</P>
                <div style={{ marginTop: 22 }}><Btn t={t}>All services</Btn></div>
              </div>
              <Grid cols={2} gap={18} responsive>
                {(p.items || []).map((s, i) => (
                  <div key={i} style={{ background: t.bg, borderRadius: t.radius, padding: 22, borderLeft: `3px solid ${i % 2 ? t.accent : t.primary}` }}>
                    <H t={t} level={4}>{s.title}</H><P t={t} style={{ marginTop: 8, fontSize: 14 }}>{s.text}</P>
                  </div>
                ))}
              </Grid>
            </div>
          </Wrap>
        </Section>
      ),
    },
  },
}

/* =============================== PRODUCTS =============================== */
const products = {
  label: 'Product Information',
  desc: 'Saman ki list, price ke saath',
  popular: true,
  group: 'Content',
  defaults: {
    eyebrow: 'Our products',
    title: 'Products people actually love',
    sub: '',
    columns: 3,
    items: [
      { title: 'Starter Kit', text: 'Everything to get moving in a week.', price: '₹4,999', tag: 'Popular' },
      { title: 'Pro Suite', text: 'Advanced modules for growing teams.', price: '₹12,499', tag: '' },
      { title: 'Enterprise', text: 'Custom builds with SLA-backed support.', price: 'Custom', tag: 'New' },
    ],
  },
  schema: [
    F.text('eyebrow', 'Eyebrow'), F.text('title', 'Title'), F.area('sub', 'Sub text'), F.sel('columns', 'Columns', [2, 3, 4]),
    F.list('items', 'Products', [F.text('title', 'Name'), F.area('text', 'Description'), F.text('price', 'Price'), F.text('tag', 'Badge'), F.img('image', 'Image')], 'Add product'),
  ],
  variants: {
    grid: {
      name: 'Product grid',
      render: ({ p, t, biz, nav }) => (
        <Section t={t}>
          <Wrap t={t}>
            <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} sub={p.sub} />
            <Grid cols={p.columns || 3} gap={24} responsive>
              {(p.items || []).map((s, i) => (
                <div key={i} style={{ border: `1px solid ${hexA(t.text, 0.1)}`, borderRadius: t.radius, overflow: 'hidden', background: t.darkMode ? hexA('#ffffff', 0.04) : '#fff' }}>
                  <div style={{ position: 'relative' }}>
                    <Img t={t} src={s.image} ratio="1/1" radius="0px" seed={i + 3} label="PRODUCT" bind={['items', i, 'image']} />
                    {s.tag ? <span style={{ position: 'absolute', top: 12, left: 12, background: t.accent, color: '#08131f', borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 700, fontFamily: t.bodyFont }}>{s.tag}</span> : null}
                  </div>
                  <div style={{ padding: 20 }}>
                    <H t={t} level={4}>{s.title}</H>
                    <P t={t} style={{ marginTop: 6, fontSize: 14 }}>{s.text}</P>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                      <span style={{ fontFamily: t.headingFont, fontWeight: 800, fontSize: 20, color: t.primary }}>{s.price}</span>
                      <Btn t={t} size="sm">Buy</Btn>
                    </div>
                  </div>
                </div>
              ))}
            </Grid>
          </Wrap>
        </Section>
      ),
    },
    spec: {
      name: 'Feature spec rows',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="alt">
          <Wrap t={t}>
            <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} sub={p.sub} align="left" />
            <div style={{ display: 'grid', gap: 20 }}>
              {(p.items || []).map((s, i) => (
                <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: 22, alignItems: 'center', background: t.bg, borderRadius: t.radius, padding: 16, border: `1px solid ${hexA(t.text, 0.08)}` }}>
                  <div style={{ width: 200, maxWidth: '100%', flexShrink: 0 }}>
                    <Img t={t} src={s.image} ratio="16/10" seed={i + 7} label="PRODUCT" bind={['items', i, 'image']} />
                  </div>
                  <div style={{ flex: '1 1 240px', minWidth: 0 }}><H t={t} level={4}>{s.title}</H><P t={t} style={{ marginTop: 8 }}>{s.text}</P></div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: t.headingFont, fontWeight: 800, fontSize: 24 }}>{s.price}</div>
                    <div style={{ marginTop: 12 }}><Btn t={t} size="sm" variant="ghost">Details</Btn></div>
                  </div>
                </div>
              ))}
            </div>
          </Wrap>
        </Section>
      ),
    },
    showcase: {
      name: 'Single showcase',
      render: ({ p, t, biz, nav }) => {
        const s = (p.items || [])[0] || {}
        return (
          <Section t={t} tone="dark">
            <Wrap t={t}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
                <Img t={t} src={s.image} ratio="4/3" seed={9} label="PRODUCT" bind={['items', 0, 'image']} />
                <div>
                  <Eyebrow t={t}>{p.eyebrow}</Eyebrow>
                  <H t={t} level={2} style={{ color: '#fff' }}>{s.title || p.title}</H>
                  <P t={t} dim={false} style={{ marginTop: 14, opacity: 0.78 }}>{s.text}</P>
                  <div style={{ marginTop: 22, display: 'grid', gap: 10 }}>
                    {(p.items || []).slice(1).map((x, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${hexA('#ffffff', 0.12)}`, paddingBottom: 10, fontFamily: t.bodyFont, color: '#fff' }}>
                        <span style={{ opacity: 0.8 }}>{x.title}</span><span style={{ fontWeight: 700 }}>{x.price}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 26 }}><Btn t={t} size="lg" variant="accent">Order now</Btn></div>
                </div>
              </div>
            </Wrap>
          </Section>
        )
      },
    },
  },
}

/* =============================== TESTIMONIALS =============================== */
const testimonials = {
  label: 'Testimonial',
  desc: 'Logon ke review aur tareef',
  popular: true,
  group: 'Social Proof',
  defaults: {
    eyebrow: 'Testimonials',
    title: 'What our clients say',
    items: [
      { name: 'Rahul Mehta', role: 'CEO, Northline', text: 'They understood the brief on day one and shipped ahead of schedule. Rare.' },
      { name: 'Anita Verma', role: 'Director, Bluecore', text: 'Communication was excellent throughout and the results speak for themselves.' },
      { name: 'Sameer Khan', role: 'Founder, Craftly', text: 'Our enquiries tripled within two months of going live. Worth every rupee.' },
    ],
  },
  schema: [
    F.text('eyebrow', 'Eyebrow'), F.text('title', 'Title'),
    F.list('items', 'Reviews', [F.text('name', 'Name'), F.text('role', 'Role'), F.area('text', 'Quote'), F.img('avatar', 'Avatar')], 'Add review'),
  ],
  variants: {
    cards: {
      name: 'Quote cards',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="alt">
          <Wrap t={t}>
            <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} />
            <Grid cols={3} gap={22} responsive>
              {(p.items || []).map((s, i) => (
                <Card key={i} t={t}>
                  <Stars color={t.accent} />
                  <P t={t} style={{ marginTop: 14, fontSize: 15 }}>"{s.text}"</P>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 20 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 999, overflow: 'hidden', background: hexA(t.primary, 0.18), display: 'grid', placeItems: 'center', color: t.primary, fontWeight: 800, fontFamily: t.headingFont }}>
                      {s.avatar ? <img src={s.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (s.name || 'A')[0]}
                    </div>
                    <div style={{ fontFamily: t.bodyFont }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: t.sub }}>{s.role}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </Grid>
          </Wrap>
        </Section>
      ),
    },
    bigquote: {
      name: 'Single big quote',
      render: ({ p, t, biz, nav }) => {
        const s = (p.items || [])[0] || {}
        return (
          <Section t={t} tone="primary">
            <Wrap t={t} style={{ textAlign: 'center', maxWidth: 820 }}>
              <div aria-hidden style={{ fontSize: fluid(36, 5, 60), lineHeight: 1, fontFamily: t.headingFont, opacity: 0.4 }}>&ldquo;</div>
              <H t={t} level={2} style={{ fontSize: fluid(20, 3.4, 34), marginTop: 10, color: '#fff' }}>{s.text}</H>
              <div style={{ marginTop: 26, fontFamily: t.bodyFont, opacity: 0.9 }}>
                <div style={{ fontWeight: 700 }}>{s.name}</div><div style={{ fontSize: 13 }}>{s.role}</div>
              </div>
            </Wrap>
          </Section>
        )
      },
    },
    marquee: {
      name: 'Wide strip',
      render: ({ p, t, biz, nav }) => (
        <Section t={t}>
          <Wrap t={t}>
            <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} align="left" />
            <div style={{ display: 'flex', gap: 18, overflow: 'hidden' }}>
              {(p.items || []).map((s, i) => (
                <div key={i} style={{ minWidth: 320, flex: 1, borderLeft: `3px solid ${t.primary}`, paddingLeft: 20 }}>
                  <P t={t} style={{ fontSize: 16, fontStyle: 'italic' }}>"{s.text}"</P>
                  <div style={{ marginTop: 14, fontFamily: t.bodyFont, fontWeight: 700, fontSize: 14 }}>{s.name} <span style={{ color: t.sub, fontWeight: 400 }}>/ {s.role}</span></div>
                </div>
              ))}
            </div>
          </Wrap>
        </Section>
      ),
    },
    stacked: {
      name: 'Alternating rows',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="alt">
          <Wrap t={t} style={{ maxWidth: 880 }}>
            <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} />
            <div style={{ display: 'grid', gap: 18 }}>
              {(p.items || []).map((s, i) => (
                <div key={i} style={{ background: t.bg, borderRadius: t.radius, padding: 24, marginLeft: i % 2 ? 60 : 0, marginRight: i % 2 ? 0 : 60, border: `1px solid ${hexA(t.text, 0.08)}` }}>
                  <P t={t} style={{ fontSize: 15 }}>"{s.text}"</P>
                  <div style={{ marginTop: 12, fontFamily: t.bodyFont, fontSize: 13, fontWeight: 700 }}>{s.name} · <span style={{ color: t.sub, fontWeight: 400 }}>{s.role}</span></div>
                </div>
              ))}
            </div>
          </Wrap>
        </Section>
      ),
    },
  },
}

/* =============================== STATS =============================== */
const stats = {
  label: 'Stats',
  desc: '500+ customer, 15 saal',
  popular: false,
  group: 'Content',
  defaults: {
    title: 'Numbers that matter',
    items: [
      { value: '1,200+', label: 'Projects delivered' },
      { value: '98%', label: 'Client retention' },
      { value: '15', label: 'Years in business' },
      { value: '24/7', label: 'Support coverage' },
    ],
  },
  schema: [F.text('title', 'Title'), F.list('items', 'Stats', [F.text('value', 'Value'), F.text('label', 'Label')], 'Add stat')],
  variants: {
    strip: {
      name: 'Simple strip',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} pad={56}>
          <Wrap t={t}>
            <Grid cols={(p.items || []).length || 4} gap={20}>
              {(p.items || []).map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: t.headingFont, fontSize: fluid(26, 4.4, 40), fontWeight: 800, color: t.primary }}>{s.value}</div>
                  <div style={{ fontFamily: t.bodyFont, fontSize: 14, color: t.sub, marginTop: 6 }}>{s.label}</div>
                </div>
              ))}
            </Grid>
          </Wrap>
        </Section>
      ),
    },
    bordered: {
      name: 'Bordered boxes',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="alt">
          <Wrap t={t}>
            <Grid cols={(p.items || []).length || 4} gap={0} style={{ border: `1px solid ${hexA(t.text, 0.12)}`, borderRadius: t.radius, overflow: 'hidden' }}>
              {(p.items || []).map((s, i) => (
                <div key={i} style={{ padding: 30, borderLeft: i ? `1px solid ${hexA(t.text, 0.12)}` : 'none' }}>
                  <div style={{ fontFamily: t.headingFont, fontSize: fluid(24, 4, 36), fontWeight: 800 }}>{s.value}</div>
                  <div style={{ fontFamily: t.bodyFont, fontSize: 13, color: t.sub, marginTop: 8, textTransform: 'uppercase', letterSpacing: '.08em' }}>{s.label}</div>
                </div>
              ))}
            </Grid>
          </Wrap>
        </Section>
      ),
    },
    onPrimary: {
      name: 'On primary colour',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="primary" pad={64}>
          <Wrap t={t}>
            <Grid cols={(p.items || []).length || 4} gap={20}>
              {(p.items || []).map((s, i) => (
                <div key={i} style={{ textAlign: 'center', color: '#fff' }}>
                  <div style={{ fontFamily: t.headingFont, fontSize: fluid(28, 4.6, 42), fontWeight: 800 }}>{s.value}</div>
                  <div style={{ fontFamily: t.bodyFont, fontSize: 14, opacity: 0.85, marginTop: 6 }}>{s.label}</div>
                </div>
              ))}
            </Grid>
          </Wrap>
        </Section>
      ),
    },
  },
}

/* =============================== INFORMATION =============================== */
const info = {
  label: 'Information',
  desc: 'Point-by-point jaankari',
  popular: false,
  group: 'Content',
  defaults: {
    eyebrow: 'Why us',
    title: 'Information that helps you decide',
    items: [
      { title: 'Transparent pricing', text: 'No hidden costs. You approve every line before we start.' },
      { title: 'Certified team', text: 'Every engineer on the project is trained and certified.' },
      { title: 'On-time delivery', text: '94% of our projects ship on or before the promised date.' },
      { title: 'After-sales care', text: 'Free support window on every engagement we deliver.' },
    ],
  },
  schema: [F.text('eyebrow', 'Eyebrow'), F.text('title', 'Title'), F.list('items', 'Points', [F.text('title', 'Title'), F.area('text', 'Text')], 'Add point')],
  variants: {
    twoCol: {
      name: 'Two column list',
      render: ({ p, t, biz, nav }) => (
        <Section t={t}>
          <Wrap t={t}>
            <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} align="left" />
            <Grid cols={2} gap={30} responsive>
              {(p.items || []).map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 16 }}>
                  <div style={{ minWidth: 34, height: 34, borderRadius: t.radius, background: t.primary, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontFamily: t.headingFont, fontSize: 14 }}>{i + 1}</div>
                  <div><H t={t} level={4}>{s.title}</H><P t={t} style={{ marginTop: 6, fontSize: 15 }}>{s.text}</P></div>
                </div>
              ))}
            </Grid>
          </Wrap>
        </Section>
      ),
    },
    accordionish: {
      name: 'Stacked rows',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="alt">
          <Wrap t={t} style={{ maxWidth: 900 }}>
            <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} />
            <div>
              {(p.items || []).map((s, i) => (
                <div key={i} style={{ background: t.bg, borderRadius: t.radius, padding: '20px 24px', marginBottom: 12, border: `1px solid ${hexA(t.text, 0.08)}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <H t={t} level={4}>{s.title}</H><span style={{ color: t.primary, fontSize: 22 }}>+</span>
                  </div>
                  <P t={t} style={{ marginTop: 10, fontSize: 15 }}>{s.text}</P>
                </div>
              ))}
            </div>
          </Wrap>
        </Section>
      ),
    },
    iconRow: {
      name: 'Icon row',
      render: ({ p, t, biz, nav }) => (
        <Section t={t}>
          <Wrap t={t}>
            <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} />
            <Grid cols={(p.items || []).length > 3 ? 4 : 3} gap={26}>
              {(p.items || []).map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ width: 60, height: 60, margin: '0 auto', borderRadius: 999, background: hexA(t.accent, 0.2), color: t.primary, display: 'grid', placeItems: 'center', fontSize: 22 }}>◆</div>
                  <H t={t} level={4} style={{ marginTop: 16 }}>{s.title}</H>
                  <P t={t} style={{ marginTop: 8, fontSize: 14 }}>{s.text}</P>
                </div>
              ))}
            </Grid>
          </Wrap>
        </Section>
      ),
    },
  },
}

/* =============================== GRAPH + INFO =============================== */
const chart = {
  label: 'Graph & Information',
  desc: 'Growth chart ke saath jaankari',
  popular: false,
  group: 'Content',
  defaults: {
    eyebrow: 'Performance',
    title: 'Growth you can measure',
    body: 'A short explanation of what this chart shows and why it matters to your customer.',
    bars: [
      { label: '2021', value: 35 }, { label: '2022', value: 52 },
      { label: '2023', value: 68 }, { label: '2024', value: 81 }, { label: '2025', value: 96 },
    ],
  },
  schema: [
    F.text('eyebrow', 'Eyebrow'), F.text('title', 'Title'), F.area('body', 'Body'),
    F.list('bars', 'Data points', [F.text('label', 'Label'), F.num('value', 'Value (0-100)')], 'Add point'),
  ],
  variants: {
    bars: {
      name: 'Bar chart + text',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="alt">
          <Wrap t={t}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 56, alignItems: 'center' }}>
              <div>
                <Eyebrow t={t}>{p.eyebrow}</Eyebrow><H t={t} level={2}>{p.title}</H>
                <P t={t} style={{ marginTop: 16 }}>{p.body}</P>
              </div>
              <div style={{ background: t.bg, borderRadius: t.radius, padding: 28, border: `1px solid ${hexA(t.text, 0.08)}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 220 }}>
                  {(p.bars || []).map((b, i) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ height: `${Math.max(4, Math.min(100, Number(b.value) || 0))}%`, background: `linear-gradient(180deg, ${t.accent}, ${t.primary})`, borderRadius: `${t.radius} ${t.radius} 4px 4px`, minHeight: 8 }} />
                      <div style={{ marginTop: 10, fontSize: 12, color: t.sub, fontFamily: t.bodyFont }}>{b.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Wrap>
        </Section>
      ),
    },
    donut: {
      name: 'Donut + legend',
      render: ({ p, t, biz, nav }) => {
        const data = (p.bars || []).slice(0, 5)
        const total = data.reduce((a, b) => a + (Number(b.value) || 0), 0) || 1
        const colors = [t.primary, t.accent, hexA(t.primary, 0.6), hexA(t.accent, 0.6), hexA(t.primary, 0.3)]
        let acc = 0
        const stops = data.map((d, i) => {
          const from = (acc / total) * 100
          acc += Number(d.value) || 0
          const to = (acc / total) * 100
          return `${colors[i % colors.length]} ${from}% ${to}%`
        }).join(', ')
        return (
          <Section t={t}>
            <Wrap t={t}>
              <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} sub={p.body} />
              <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 50, alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 260, height: 260, borderRadius: 999, background: `conic-gradient(${stops})`, display: 'grid', placeItems: 'center', margin: '0 auto' }}>
                  <div style={{ width: 150, height: 150, borderRadius: 999, background: t.bg, display: 'grid', placeItems: 'center', fontFamily: t.headingFont, fontWeight: 800, fontSize: 22 }}>100%</div>
                </div>
                <div style={{ display: 'grid', gap: 14 }}>
                  {data.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: t.bodyFont }}>
                      <span style={{ width: 14, height: 14, borderRadius: 4, background: colors[i % colors.length] }} />
                      <span style={{ flex: 1 }}>{d.label}</span>
                      <strong>{Math.round(((Number(d.value) || 0) / total) * 100)}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            </Wrap>
          </Section>
        )
      },
    },
    progress: {
      name: 'Skill bars',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="dark">
          <Wrap t={t}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
              <div>
                <Eyebrow t={t}>{p.eyebrow}</Eyebrow><H t={t} level={2} style={{ color: '#fff' }}>{p.title}</H>
                <P t={t} dim={false} style={{ marginTop: 14, opacity: 0.75 }}>{p.body}</P>
              </div>
              <div style={{ display: 'grid', gap: 18 }}>
                {(p.bars || []).map((b, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: t.bodyFont, fontSize: 14, color: '#fff', marginBottom: 8 }}>
                      <span>{b.label}</span><span>{b.value}%</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 999, background: hexA('#ffffff', 0.12) }}>
                      <div style={{ width: `${Math.min(100, Number(b.value) || 0)}%`, height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${t.primary}, ${t.accent})` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Wrap>
        </Section>
      ),
    },
  },
}

/* =============================== CONTACT / ENQUIRY =============================== */
const Input = ({ t, ph, area }) => {
  const st = { width: '100%', border: `1px solid ${hexA(t.text, 0.16)}`, borderRadius: t.radius, padding: '13px 14px', fontFamily: t.bodyFont, fontSize: 15, background: t.bg, color: t.text, outline: 'none' }
  return area ? <textarea placeholder={ph} rows={4} style={{ ...st, resize: 'vertical' }} /> : <input placeholder={ph} style={st} />
}

const contact = {
  label: 'Contact / Enquiry Form',
  desc: 'Customer message bhej sake',
  popular: true,
  group: 'Contact',
  defaults: {
    eyebrow: 'Contact',
    title: 'Send us an enquiry',
    sub: 'Fill the form and our team will get back within one business day.',
    button: 'Send enquiry',
    showMap: true,
  },
  schema: [F.text('eyebrow', 'Eyebrow'), F.text('title', 'Title'), F.area('sub', 'Sub text'), F.text('button', 'Button text'), F.bool('showMap', 'Show map')],
  variants: {
    split: {
      name: 'Form + details',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="alt">
          <Wrap t={t}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 50 }}>
              <div>
                <Eyebrow t={t}>{p.eyebrow}</Eyebrow><H t={t} level={2}>{p.title}</H>
                <P t={t} style={{ marginTop: 14 }}>{p.sub}</P>
                <div style={{ marginTop: 28, display: 'grid', gap: 16, fontFamily: t.bodyFont }}>
                  {[['Phone', biz.phone], ['WhatsApp', biz.whatsapp === biz.phone ? '' : biz.whatsapp], ['Alt. number', biz.altPhone],
                    ['Email', biz.email], ['Alt. email', biz.altEmail], ['Address', addressOf(biz)],
                    ['Working days', biz.workingDays], ['Office timing', biz.timing]]
                    .filter(([, v]) => v).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', gap: 12 }}>
                        <span style={{ minWidth: 110, color: t.sub, fontSize: 13, textTransform: 'uppercase', letterSpacing: '.06em' }}>{k}</span>
                        <span style={{ fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                </div>
              </div>
              <div style={{ background: t.bg, borderRadius: t.radius, padding: 28, border: `1px solid ${hexA(t.text, 0.08)}` }}>
                <div style={{ display: 'grid', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}><Input t={t} ph="Your name" /><Input t={t} ph="Phone number" /></div>
                  <Input t={t} ph="Email address" />
                  <Input t={t} ph="How can we help?" area />
                  <div><A link={p.buttonLink} biz={biz} onNavigate={nav}><Btn t={t} size="lg">{p.button}</Btn></A></div>
                </div>
              </div>
            </div>
          </Wrap>
        </Section>
      ),
    },
    centered: {
      name: 'Centered form',
      render: ({ p, t, biz, nav }) => (
        <Section t={t}>
          <Wrap t={t} style={{ maxWidth: 720 }}>
            <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} sub={p.sub} />
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 26px', margin: '-24px 0 34px', fontFamily: t.bodyFont, fontSize: 14, color: t.sub }}>
              {[biz.phone, biz.email, addressOf(biz), [biz.workingDays, biz.timing].filter(Boolean).join(', ')]
                .filter(Boolean)
                .map((v, i) => <span key={i}>{v}</span>)}
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}><Input t={t} ph="Your name" /><Input t={t} ph="Phone number" /></div>
              <Input t={t} ph="Email address" />
              <Input t={t} ph="Message" area />
              <div style={{ textAlign: 'center' }}><A link={p.buttonLink} biz={biz} onNavigate={nav}><Btn t={t} size="lg">{p.button}</Btn></A></div>
            </div>
          </Wrap>
        </Section>
      ),
    },
    withMap: {
      name: 'Map + form',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="dark">
          <Wrap t={t}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 40, alignItems: 'stretch' }}>
              <div style={{ borderRadius: t.radius, overflow: 'hidden', minHeight: 380, background: hexA('#ffffff', 0.06), display: 'grid' }}>
                {biz.mapEmbed ? (
                  <iframe title="map" src={biz.mapEmbed} style={{ width: '100%', height: '100%', border: 0, minHeight: 380 }} loading="lazy" />
                ) : (
                  <div style={{ display: 'grid', placeItems: 'center', color: '#fff', fontFamily: t.bodyFont, opacity: 0.75, textAlign: 'center', padding: 30 }}>
                    <div>
                      <div style={{ fontSize: 30 }}>📍</div>
                      {addressOf(biz) ? <div style={{ marginTop: 10, fontWeight: 700 }}>{addressOf(biz)}</div> : null}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Eyebrow t={t}>{p.eyebrow}</Eyebrow><H t={t} level={2} style={{ color: '#fff' }}>{p.title}</H>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 22px', marginTop: 16, fontFamily: t.bodyFont, fontSize: 14, color: '#fff', opacity: 0.8 }}>
                  {[biz.phone, biz.email, [biz.workingDays, biz.timing].filter(Boolean).join(', ')].filter(Boolean).map((v, i) => (
                    <span key={i}>{v}</span>
                  ))}
                </div>
                <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
                  <Input t={t} ph="Your name" /><Input t={t} ph="Phone" /><Input t={t} ph="Message" area />
                  <div><Btn t={t} size="lg" variant="accent">{p.button}</Btn></div>
                </div>
              </div>
            </div>
          </Wrap>
        </Section>
      ),
    },
  },
}

/* =============================== MAP =============================== */
const map = {
  label: 'Google Map',
  desc: 'Dukaan ya office kahan hai',
  popular: false,
  group: 'Contact',
  defaults: { title: 'Find us', height: 420 },
  schema: [F.text('title', 'Title'), F.num('height', 'Height (px)', { min: 200, max: 800 })],
  variants: {
    full: {
      name: 'Full width map',
      render: ({ p, t, biz, nav }) => (
        <section style={{ background: t.bg }}>
          {biz.mapEmbed ? (
            <iframe title="map" src={biz.mapEmbed} style={{ width: '100%', height: p.height || 420, border: 0, display: 'block' }} loading="lazy" />
          ) : (
            <div style={{ height: p.height || 420, background: `linear-gradient(135deg, ${hexA(t.primary, 0.15)}, ${hexA(t.accent, 0.15)})`, display: 'grid', placeItems: 'center', color: t.text, fontFamily: t.bodyFont }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 34 }}>📍</div>
                {addressOf(biz) ? <div style={{ fontWeight: 700, marginTop: 8 }}>{addressOf(biz)}</div> : null}
              </div>
            </div>
          )}
        </section>
      ),
    },
    boxed: {
      name: 'Boxed map',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="alt" pad={60}>
          <Wrap t={t}>
            <H t={t} level={3} style={{ marginBottom: 18 }}>{p.title}</H>
            <div style={{ borderRadius: t.radius, overflow: 'hidden', border: `1px solid ${hexA(t.text, 0.1)}` }}>
              {biz.mapEmbed ? (
                <iframe title="map" src={biz.mapEmbed} style={{ width: '100%', height: p.height || 420, border: 0, display: 'block' }} loading="lazy" />
              ) : (
                <div style={{ height: p.height || 420, background: `linear-gradient(135deg, ${hexA(t.primary, 0.18)}, ${hexA(t.accent, 0.18)})`, display: 'grid', placeItems: 'center' }}>
                  <span style={{ fontFamily: t.bodyFont, fontWeight: 700 }}>{addressOf(biz)}</span>
                </div>
              )}
            </div>
          </Wrap>
        </Section>
      ),
    },
  },
}

/* =============================== GALLERY =============================== */
const gallery = {
  label: 'Gallery',
  desc: 'Apne kaam ki photos',
  popular: true,
  group: 'Media',
  defaults: { eyebrow: 'Gallery', title: 'A look at our work', items: [{}, {}, {}, {}, {}, {}] },
  schema: [F.text('eyebrow', 'Eyebrow'), F.text('title', 'Title'), F.list('items', 'Images', [F.img('image', 'Image'), F.text('caption', 'Caption')], 'Add image')],
  variants: {
    grid: {
      name: 'Even grid',
      render: ({ p, t, biz, nav }) => (
        <Section t={t}>
          <Wrap t={t}>
            <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {(p.items || []).map((s, i) => <Img key={i} t={t} src={s.image} ratio="4/3" seed={i + 2} bind={['items', i, 'image']} />)}
            </div>
          </Wrap>
        </Section>
      ),
    },
    masonry: {
      name: 'Masonry mosaic',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="alt">
          <Wrap t={t}>
            <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} align="left" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: 150, gap: 14 }}>
              {(p.items || []).map((s, i) => (
                <div key={i} style={{ gridColumn: i % 5 === 0 ? 'span 2' : 'span 1', gridRow: i % 3 === 0 ? 'span 2' : 'span 1' }}>
                  <Img t={t} src={s.image} ratio="auto" seed={i} style={{ height: '100%', aspectRatio: 'auto' }} bind={['items', i, 'image']} />
                </div>
              ))}
            </div>
          </Wrap>
        </Section>
      ),
    },
  },
}

/* =============================== TEAM =============================== */
const team = {
  label: 'Team',
  desc: 'Team members ki photo aur naam',
  popular: false,
  group: 'Content',
  defaults: {
    eyebrow: 'Our team', title: 'The people behind the work',
    items: [
      { name: 'Aarav Sharma', role: 'Founder & CEO' }, { name: 'Priya Nair', role: 'Head of Design' },
      { name: 'Vikram Rao', role: 'Lead Engineer' }, { name: 'Neha Gupta', role: 'Client Success' },
    ],
  },
  schema: [F.text('eyebrow', 'Eyebrow'), F.text('title', 'Title'), F.list('items', 'Members', [F.text('name', 'Name'), F.text('role', 'Role'), F.img('image', 'Photo')], 'Add member')],
  variants: {
    cards: {
      name: 'Photo cards',
      render: ({ p, t, biz, nav }) => (
        <Section t={t}>
          <Wrap t={t}>
            <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 22 }}>
              {(p.items || []).map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ maxWidth: 220, margin: '0 auto' }}>
                    <Img t={t} src={s.image} ratio="1/1" radius="999px" seed={i + 4} label="PHOTO" bind={['items', i, 'image']} avatar />
                  </div>
                  <H t={t} level={4} style={{ marginTop: 16 }}>{s.name}</H>
                  <div style={{ fontFamily: t.bodyFont, fontSize: 13, color: t.sub, marginTop: 4 }}>{s.role}</div>
                </div>
              ))}
            </div>
          </Wrap>
        </Section>
      ),
    },
    strip: {
      name: 'Square strip',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="alt">
          <Wrap t={t}>
            <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} align="left" />
            <Grid cols={4} gap={0} style={{ borderRadius: t.radius, overflow: 'hidden' }}>
              {(p.items || []).map((s, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <Img t={t} src={s.image} ratio="3/4" radius="0px" seed={i + 6} label="PHOTO" bind={['items', i, 'image']} />
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, background: 'linear-gradient(transparent, rgba(0,0,0,.75))', color: '#fff', fontFamily: t.bodyFont }}>
                    <div style={{ fontWeight: 700 }}>{s.name}</div><div style={{ fontSize: 12, opacity: 0.85 }}>{s.role}</div>
                  </div>
                </div>
              ))}
            </Grid>
          </Wrap>
        </Section>
      ),
    },
  },
}

/* =============================== PRICING =============================== */
const pricing = {
  label: 'Pricing',
  desc: 'Package aur unke rate',
  popular: true,
  group: 'Content',
  defaults: {
    eyebrow: 'Pricing', title: 'Simple, honest plans',
    items: [
      { name: 'Basic', price: '₹9,999', period: '/mo', features: 'Single page\nEmail support\n1 revision', featured: false },
      { name: 'Growth', price: '₹24,999', period: '/mo', features: 'Up to 8 pages\nPriority support\nUnlimited revisions', featured: true },
      { name: 'Scale', price: 'Custom', period: '', features: 'Custom build\nDedicated manager\nSLA', featured: false },
    ],
  },
  schema: [F.text('eyebrow', 'Eyebrow'), F.text('title', 'Title'), F.list('items', 'Plans', [F.text('name', 'Plan'), F.text('price', 'Price'), F.text('period', 'Period'), F.area('features', 'Features (one per line)'), F.bool('featured', 'Highlight'), { key: 'link', label: 'Button links to', type: 'link' }], 'Add plan')],
  variants: {
    cards: {
      name: 'Plan cards',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="alt">
          <Wrap t={t}>
            <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} />
            <Grid cols={3} gap={22} responsive>
              {(p.items || []).map((s, i) => (
                <div key={i} style={{ background: s.featured ? t.primary : t.bg, color: s.featured ? '#fff' : t.text, borderRadius: t.radius, padding: 30, border: `1px solid ${hexA(t.text, 0.1)}`, transform: s.featured ? 'scale(1.03)' : 'none' }}>
                  <div style={{ fontFamily: t.bodyFont, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 12, opacity: 0.8 }}>{s.name}</div>
                  <div style={{ fontFamily: t.headingFont, fontSize: fluid(26, 4.4, 40), fontWeight: 800, marginTop: 12 }}>{s.price}<span style={{ fontSize: 15, fontWeight: 500, opacity: 0.7 }}>{s.period}</span></div>
                  <div style={{ marginTop: 20, display: 'grid', gap: 10, fontFamily: t.bodyFont, fontSize: 15 }}>
                    {String(s.features || '').split('\n').filter(Boolean).map((f, j) => <div key={j}>✓ &nbsp;{f}</div>)}
                  </div>
                  <div style={{ marginTop: 26 }}><A link={s.link} biz={biz} onNavigate={nav}><Btn t={t} variant={s.featured ? 'light' : 'solid'}>Choose plan</Btn></A></div>
                </div>
              ))}
            </Grid>
          </Wrap>
        </Section>
      ),
    },
    table: {
      name: 'Compact table',
      render: ({ p, t, biz, nav }) => (
        <Section t={t}>
          <Wrap t={t} style={{ maxWidth: 900 }}>
            <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} />
            <div style={{ border: `1px solid ${hexA(t.text, 0.12)}`, borderRadius: t.radius, overflow: 'hidden' }}>
              {(p.items || []).map((s, i) => (
                <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 20px', padding: '20px 22px', alignItems: 'center', borderTop: i ? `1px solid ${hexA(t.text, 0.12)}` : 'none', background: s.featured ? hexA(t.primary, 0.06) : 'transparent' }}>
                  <div><div style={{ fontFamily: t.headingFont, fontWeight: 800, fontSize: 18 }}>{s.name}</div><div style={{ color: t.primary, fontWeight: 700, fontFamily: t.bodyFont }}>{s.price}{s.period}</div></div>
                  <div style={{ fontFamily: t.bodyFont, fontSize: 14, color: t.sub }}>{String(s.features || '').split('\n').filter(Boolean).join(' · ')}</div>
                  <div style={{ textAlign: 'right' }}><A link={s.link} biz={biz} onNavigate={nav}><Btn t={t} size="sm" variant={s.featured ? 'solid' : 'ghost'}>Select</Btn></A></div>
                </div>
              ))}
            </div>
          </Wrap>
        </Section>
      ),
    },
  },
}

/* =============================== FAQ =============================== */
const faq = {
  label: 'FAQ',
  desc: 'Sawal aur jawab',
  popular: false,
  group: 'Content',
  defaults: {
    eyebrow: 'FAQ', title: 'Questions, answered',
    items: [
      { q: 'How long does a project take?', a: 'Most engagements run 3-6 weeks depending on scope and content readiness.' },
      { q: 'Do you offer support after launch?', a: 'Yes, every project includes 30 days of free post-launch support.' },
      { q: 'Can you work with our existing team?', a: 'Absolutely - we regularly embed with in-house teams.' },
    ],
  },
  schema: [F.text('eyebrow', 'Eyebrow'), F.text('title', 'Title'), F.list('items', 'Questions', [F.text('q', 'Question'), F.area('a', 'Answer')], 'Add question')],
  variants: {
    list: {
      name: 'Accordion list',
      render: ({ p, t, biz, nav }) => (
        <Section t={t}>
          <Wrap t={t} style={{ maxWidth: 820 }}>
            <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} />
            <div>
              {(p.items || []).map((s, i) => (
                <div key={i} style={{ borderBottom: `1px solid ${hexA(t.text, 0.12)}`, padding: '20px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20 }}>
                    <H t={t} level={4}>{s.q}</H><span style={{ color: t.primary, fontSize: 20 }}>{i === 0 ? '−' : '+'}</span>
                  </div>
                  {i === 0 ? <P t={t} style={{ marginTop: 12 }}>{s.a}</P> : null}
                </div>
              ))}
            </div>
          </Wrap>
        </Section>
      ),
    },
    twoCol: {
      name: 'Two column Q&A',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="alt">
          <Wrap t={t}>
            <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 50 }}>
              <div><Eyebrow t={t}>{p.eyebrow}</Eyebrow><H t={t} level={2}>{p.title}</H></div>
              <div style={{ display: 'grid', gap: 22 }}>
                {(p.items || []).map((s, i) => (
                  <div key={i}><H t={t} level={4}>{s.q}</H><P t={t} style={{ marginTop: 8, fontSize: 15 }}>{s.a}</P></div>
                ))}
              </div>
            </div>
          </Wrap>
        </Section>
      ),
    },
  },
}

/* =============================== LOGOS =============================== */
const logos = {
  label: 'Client Logos',
  desc: 'Kin companies ke saath kaam kiya',
  popular: false,
  group: 'Social Proof',
  defaults: { title: 'Trusted by teams across India', items: [{ label: 'NORTHLINE' }, { label: 'BLUECORE' }, { label: 'CRAFTLY' }, { label: 'VERTEX' }, { label: 'ORBIT' }] },
  schema: [F.text('title', 'Title'), F.list('items', 'Logos', [F.text('label', 'Name'), F.img('image', 'Logo image')], 'Add logo')],
  variants: {
    row: {
      name: 'Text row',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} pad={48}>
          <Wrap t={t}>
            {p.title ? <div style={{ textAlign: 'center', fontFamily: t.bodyFont, fontSize: 13, letterSpacing: '.16em', textTransform: 'uppercase', color: t.sub, marginBottom: 26 }}>{p.title}</div> : null}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 30, flexWrap: 'wrap' }}>
              {(p.items || []).map((s, i) => s.image
                ? <img key={i} src={s.image} alt="" style={{ height: 34, objectFit: 'contain', opacity: 0.7 }} />
                : <span key={i} style={{ fontFamily: t.headingFont, fontWeight: 800, fontSize: 20, opacity: 0.45, letterSpacing: '.05em' }}>{s.label}</span>)}
            </div>
          </Wrap>
        </Section>
      ),
    },
    boxed: {
      name: 'Boxed grid',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="alt" pad={60}>
          <Wrap t={t}>
            <Grid cols={5} gap={0} style={{ border: `1px solid ${hexA(t.text, 0.12)}`, borderRadius: t.radius, overflow: 'hidden' }}>
              {(p.items || []).map((s, i) => (
                <div key={i} style={{ padding: 26, display: 'grid', placeItems: 'center', borderLeft: i ? `1px solid ${hexA(t.text, 0.12)}` : 'none' }}>
                  {s.image ? <img src={s.image} alt="" style={{ height: 30, objectFit: 'contain' }} /> : <span style={{ fontFamily: t.headingFont, fontWeight: 800, opacity: 0.5 }}>{s.label}</span>}
                </div>
              ))}
            </Grid>
          </Wrap>
        </Section>
      ),
    },
  },
}

/* =============================== CTA =============================== */
const cta = {
  label: 'Call To Action',
  desc: '"Abhi call karo" wala bada box',
  popular: false,
  group: 'Content',
  defaults: {
    title: 'Ready to start your project?', sub: 'Tell us what you need and get a free quote in 24 hours.',
    button: 'Talk to us', buttonLink: { kind: 'section', target: 's-contact' },
    button2: 'Call now', button2Link: { kind: 'tel' },
  },
  schema: [
    F.text('title', 'Title'), F.area('sub', 'Sub text'),
    F.text('button', 'Primary button'), { key: 'buttonLink', label: 'Primary button links to', type: 'link' },
    F.text('button2', 'Secondary button'), { key: 'button2Link', label: 'Secondary button links to', type: 'link' },
  ],
  variants: {
    band: {
      name: 'Colour band',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="primary" pad={70}>
          <Wrap t={t}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30, flexWrap: 'wrap' }}>
              <div>
                <H t={t} level={2} style={{ fontSize: fluid(22, 3.4, 34), color: '#fff' }}>{p.title}</H>
                <P t={t} dim={false} style={{ marginTop: 10, opacity: 0.9 }}>{p.sub}</P>
              </div>
              <div style={{ display: 'flex', gap: 12 }}><A link={p.buttonLink} biz={biz} onNavigate={nav}><Btn t={t} size="lg" variant="light">{p.button}</Btn></A><A link={p.button2Link} biz={biz} onNavigate={nav}><Btn t={t} size="lg" variant="outline">{p.button2}</Btn></A></div>
            </div>
          </Wrap>
        </Section>
      ),
    },
    boxed: {
      name: 'Boxed card',
      render: ({ p, t, biz, nav }) => (
        <Section t={t}>
          <Wrap t={t}>
            <div style={{ borderRadius: t.radius, background: `linear-gradient(120deg, ${t.primary}, ${t.accent})`, color: '#fff', padding: 'clamp(24px, 4cqw, 56px)', textAlign: 'center' }}>
              <H t={t} level={2} style={{ color: '#fff' }}>{p.title}</H>
              <P t={t} dim={false} style={{ marginTop: 12, opacity: 0.92, maxWidth: 560, marginInline: 'auto' }}>{p.sub}</P>
              <div style={{ display: 'flex', gap: 12, marginTop: 26, justifyContent: 'center' }}><A link={p.buttonLink} biz={biz} onNavigate={nav}><Btn t={t} size="lg" variant="light">{p.button}</Btn></A></div>
            </div>
          </Wrap>
        </Section>
      ),
    },
    minimal: {
      name: 'Minimal centered',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="alt" pad={72}>
          <Wrap t={t} style={{ textAlign: 'center', maxWidth: 640 }}>
            <H t={t} level={2}>{p.title}</H>
            <P t={t} style={{ marginTop: 12 }}>{p.sub}</P>
            <div style={{ marginTop: 24 }}><A link={p.buttonLink} biz={biz} onNavigate={nav}><Btn t={t} size="lg">{p.button}</Btn></A></div>
          </Wrap>
        </Section>
      ),
    },
  },
}

/* =============================== NEWSLETTER =============================== */
const newsletter = {
  label: 'Newsletter',
  desc: 'Customer ka email lo',
  popular: false,
  group: 'Content',
  defaults: { title: 'Get updates in your inbox', sub: 'One useful email a month. No spam, ever.', button: 'Subscribe' },
  schema: [F.text('title', 'Title'), F.area('sub', 'Sub text'), F.text('button', 'Button')],
  variants: {
    inline: {
      name: 'Inline field',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} pad={60}>
          <Wrap t={t}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
              <div><H t={t} level={3}>{p.title}</H><P t={t} style={{ marginTop: 8 }}>{p.sub}</P></div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}><Input t={t} ph="you@company.com" /></div><Btn t={t}>{p.button}</Btn>
              </div>
            </div>
          </Wrap>
        </Section>
      ),
    },
    centered: {
      name: 'Centered dark',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="dark" pad={70}>
          <Wrap t={t} style={{ textAlign: 'center', maxWidth: 600 }}>
            <H t={t} level={3} style={{ color: '#fff' }}>{p.title}</H>
            <P t={t} dim={false} style={{ marginTop: 10, opacity: 0.75 }}>{p.sub}</P>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <div style={{ flex: 1 }}><Input t={t} ph="you@company.com" /></div><Btn t={t} variant="accent">{p.button}</Btn>
            </div>
          </Wrap>
        </Section>
      ),
    },
  },
}

/* =============================== BASIC WIDGETS =============================== */
const heading = {
  label: 'Heading',
  desc: 'Bas ek moti line',
  popular: false,
  group: 'Basic',
  defaults: { text: 'A section heading', level: 2, align: 'left' },
  schema: [F.text('text', 'Text'), F.sel('level', 'Level', [1, 2, 3, 4]), F.sel('align', 'Align', ['left', 'center', 'right'])],
  variants: { plain: { name: 'Plain', render: ({ p, t, biz, nav }) => (
    <Section t={t} pad={30}><Wrap t={t}><H t={t} level={Number(p.level) || 2} style={{ textAlign: p.align }}>{p.text}</H></Wrap></Section>
  ) } },
}

const textBlock = {
  label: 'Text',
  desc: 'Simple paragraph',
  popular: false,
  group: 'Basic',
  defaults: { text: 'Write anything here. This block is great for paragraphs of copy, notices or long descriptions.', align: 'left', size: 16 },
  schema: [F.area('text', 'Text'), F.sel('align', 'Align', ['left', 'center', 'right']), F.num('size', 'Font size', { min: 12, max: 32 })],
  variants: { plain: { name: 'Plain', render: ({ p, t, biz, nav }) => (
    <Section t={t} pad={30}><Wrap t={t}><P t={t} style={{ textAlign: p.align, fontSize: Number(p.size) || 16, whiteSpace: 'pre-wrap' }}>{p.text}</P></Wrap></Section>
  ) } },
}

const imageBlock = {
  label: 'Image',
  desc: 'Ek photo lagao',
  popular: false,
  group: 'Basic',
  defaults: { image: '', ratio: '16/9', caption: '', full: false },
  schema: [F.img('image', 'Image'), F.sel('ratio', 'Aspect ratio', ['16/9', '4/3', '1/1', '3/4', '21/9']), F.text('caption', 'Caption'), F.bool('full', 'Full width')],
  variants: { plain: { name: 'Plain', render: ({ p, t, biz, nav }) => (
    <Section t={t} pad={36}>
      {p.full ? <Img t={t} src={p.image} ratio={p.ratio} radius="0px" seed={1} bind="image" /> : <Wrap t={t}><Img t={t} src={p.image} ratio={p.ratio} seed={1} bind="image" /></Wrap>}
      {p.caption ? <Wrap t={t}><P t={t} style={{ marginTop: 10, fontSize: 13, textAlign: 'center' }}>{p.caption}</P></Wrap> : null}
    </Section>
  ) } },
}

const buttonBlock = {
  label: 'Button',
  desc: 'Click karne wala button',
  popular: false,
  group: 'Basic',
  defaults: { text: 'Click here', align: 'center', variant: 'solid', link: { kind: 'section', target: 's-contact' } },
  schema: [
    F.text('text', 'Text'), { key: 'link', label: 'Links to', type: 'link' },
    F.sel('align', 'Align', ['left', 'center', 'right']),
    F.sel('variant', 'Style', ['solid', 'accent', 'outline', 'ghost']),
  ],
  variants: { plain: { name: 'Plain', render: ({ p, t, biz, nav }) => (
    <Section t={t} pad={24}>
      <Wrap t={t} style={{ textAlign: p.align }}>
        <A link={p.link} biz={biz} onNavigate={nav}><Btn t={t} size="lg" variant={p.variant}>{p.text}</Btn></A>
      </Wrap>
    </Section>
  ) } },
}

const spacer = {
  label: 'Spacer / Divider',
  desc: 'Do cheezon ke beech gap ya line',
  popular: false,
  group: 'Basic',
  defaults: { height: 60, line: true },
  schema: [F.num('height', 'Height (px)', { min: 0, max: 300 }), F.bool('line', 'Show divider line')],
  variants: { plain: { name: 'Plain', render: ({ p, t, biz, nav }) => (
    <div style={{ background: t.bg, padding: `${(Number(p.height) || 60) / 2}px 0` }}>
      {p.line ? <Wrap t={t}><div style={{ height: 1, background: hexA(t.text, 0.12) }} /></Wrap> : null}
    </div>
  ) } },
}

const video = {
  label: 'Video',
  desc: 'YouTube video lagao',
  popular: false,
  group: 'Media',
  defaults: { title: 'Watch how it works', url: '' },
  schema: [F.text('title', 'Title'), F.text('url', 'Embed URL (YouTube embed link)')],
  variants: { boxed: { name: 'Boxed', render: ({ p, t, biz, nav }) => (
    <Section t={t} tone="alt">
      <Wrap t={t}>
        {p.title ? <SectionHead t={t} title={p.title} /> : null}
        <div style={{ borderRadius: t.radius, overflow: 'hidden', aspectRatio: '16/9', background: '#000' }}>
          {p.url ? <iframe title="video" src={p.url} style={{ width: '100%', height: '100%', border: 0 }} allowFullScreen /> :
            <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', background: `linear-gradient(135deg, ${t.primary}, ${t.accent})`, color: '#fff', fontSize: 40 }}>▶</div>}
        </div>
      </Wrap>
    </Section>
  ) } },
}

/* =============================== FOOTER =============================== */
const footer = {
  label: 'Footer',
  desc: 'Contact, links aur copyright',
  popular: true,
  group: 'Layout',
  defaults: {
    about: 'We help businesses grow with design, engineering and honest advice.',
    cols: [
      { title: 'Company', links: 'About\nCareers\nBlog' },
      { title: 'Services', links: 'Consulting\nDevelopment\nSupport' },
    ],
    copyright: '',
    social: '',
  },
  schema: [
    F.area('about', 'About text'),
    F.list('cols', 'Link columns', [F.text('title', 'Column title'), F.area('links', 'Links (one per line)')], 'Add column'),
    F.text('social', 'Social override (comma separated)'), F.text('copyright', 'Copyright override'),
  ],
  variants: {
    columns: {
      name: 'Multi column',
      render: ({ p, t, biz, nav }) => (
        <footer style={{ background: t.dark, color: '#fff', padding: `clamp(29px, 5.33cqw, ${64 * t.density}px) 0 28px` }}>
          <Wrap t={t}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(auto-fit, minmax(150px, 1fr)) 1.2fr', gap: 40 }}>
              <div>
                <Logo t={t} biz={biz} invert />
                <P t={t} dim={false} style={{ marginTop: 16, opacity: 0.65, fontSize: 14 }}>{p.about}</P>
              </div>
              {(p.cols || []).map((c, i) => (
                <div key={i}>
                  <div style={{ fontFamily: t.headingFont, fontWeight: 800, fontSize: 14, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 14 }}>{c.title}</div>
                  <div style={{ display: 'grid', gap: 9, fontFamily: t.bodyFont, fontSize: 14, opacity: 0.7 }}>
                    {String(c.links || '').split('\n').filter(Boolean).map((l, j) => <span key={j}>{l}</span>)}
                  </div>
                </div>
              ))}
              <div>
                <div style={{ fontFamily: t.headingFont, fontWeight: 800, fontSize: 14, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 14 }}>Contact</div>
                <div style={{ display: 'grid', gap: 9, fontFamily: t.bodyFont, fontSize: 14, opacity: 0.7 }}>
                  {biz.phone ? <span>{biz.phone}</span> : null}
                  {biz.whatsapp && biz.whatsapp !== biz.phone ? <span>WhatsApp: {biz.whatsapp}</span> : null}
                  {biz.email ? <span>{biz.email}</span> : null}
                  {addressOf(biz) ? <span>{addressOf(biz)}</span> : null}
                  {biz.workingDays || biz.timing ? <span>{[biz.workingDays, biz.timing].filter(Boolean).join(', ')}</span> : null}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 40, paddingTop: 20, borderTop: `1px solid ${hexA('#ffffff', 0.12)}`, display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', fontFamily: t.bodyFont, fontSize: 13, opacity: 0.6 }}>
              <span>{p.copyright || biz.copyright || `© ${new Date().getFullYear()} ${biz.name || 'Your Company'}. All rights reserved.`}</span>
              <span style={{ display: 'flex', gap: 14 }}>
                {p.social ? p.social : socialsOf(biz).map(([k]) => <span key={k}>{k}</span>)}
              </span>
            </div>
          </Wrap>
        </footer>
      ),
    },
    simple: {
      name: 'Simple centered',
      render: ({ p, t, biz, nav }) => (
        <footer style={{ background: t.alt, color: t.text, padding: `clamp(20px, 4.00cqw, ${48 * t.density}px) 0`, borderTop: `1px solid ${hexA(t.text, 0.1)}`, textAlign: 'center' }}>
          <Wrap t={t}>
            <div style={{ display: 'inline-flex' }}><Logo t={t} biz={biz} /></div>
            <P t={t} style={{ marginTop: 14, maxWidth: 520, marginInline: 'auto', fontSize: 14 }}>{p.about}</P>
            <div style={{ marginTop: 18, display: 'flex', gap: 16, justifyContent: 'center', fontFamily: t.bodyFont, fontSize: 14, color: t.sub }}>
              {p.social ? p.social : socialsOf(biz).map(([k]) => <span key={k}>{k}</span>)}
            </div>
            <div style={{ marginTop: 20, fontFamily: t.bodyFont, fontSize: 13, color: t.sub }}>{p.copyright || biz.copyright || `© ${new Date().getFullYear()} ${biz.name || 'Your Company'}`}</div>
          </Wrap>
        </footer>
      ),
    },
    bigcta: {
      name: 'Big CTA footer',
      render: ({ p, t, biz, nav }) => (
        <footer style={{ background: t.dark, color: '#fff', padding: `clamp(32px, 5.83cqw, ${70 * t.density}px) 0 26px` }}>
          <Wrap t={t}>
            <H t={t} level={2} style={{ fontSize: fluid(26, 4.6, 46), color: '#fff', maxWidth: '18ch' }}>Let&rsquo;s build something together.</H>
            <div style={{ marginTop: 22 }}><Btn t={t} size="lg" variant="accent">{biz.phone || 'Contact us'}</Btn></div>
            <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 26, opacity: 0.7, fontFamily: t.bodyFont, fontSize: 14 }}>
              {(p.cols || []).map((c, i) => (
                <div key={i}>
                  <div style={{ fontWeight: 800, marginBottom: 10 }}>{c.title}</div>
                  {String(c.links || '').split('\n').filter(Boolean).map((l, j) => <div key={j} style={{ marginBottom: 6 }}>{l}</div>)}
                </div>
              ))}
              <div>
                <div style={{ fontWeight: 800, marginBottom: 10 }}>Reach us</div>
                <div>{biz.email}</div><div>{addressOf(biz)}</div>
                <div style={{ marginTop: 8 }}>{socialsOf(biz).map(([k]) => k).join(' · ')}</div>
              </div>
            </div>
            <div style={{ marginTop: 36, paddingTop: 18, borderTop: `1px solid ${hexA('#ffffff', 0.12)}`, fontSize: 13, opacity: 0.55, fontFamily: t.bodyFont }}>
              {p.copyright || biz.copyright || `© ${new Date().getFullYear()} ${biz.name || 'Your Company'}`}
            </div>
          </Wrap>
        </footer>
      ),
    },
    bar: {
      name: 'Slim bar',
      render: ({ p, t, biz, nav }) => (
        <footer style={{ background: t.primary, color: '#fff', padding: '22px 0', fontFamily: t.bodyFont, fontSize: 14 }}>
          <Wrap t={t} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <span>{p.copyright || biz.copyright || `© ${new Date().getFullYear()} ${biz.name || 'Your Company'}`}</span>
            <span style={{ opacity: 0.85 }}>{[biz.phone, biz.email, biz.city].filter(Boolean).join('  ·  ')}</span>
          </Wrap>
        </footer>
      ),
    },
  },
}

const BASE = {
  header, hero, about, services, products, testimonials, stats, info, chart,
  contact, map, gallery, team, pricing, faq, logos, cta, newsletter,
  heading, text: textBlock, image: imageBlock, button: buttonBlock, spacer, video, footer,
}

// premium + SaaS variants ko base widgets me merge karo
;[EXTRA_VARIANTS, SAAS_VARIANTS].forEach((set) => {
  Object.entries(set).forEach(([key, variants]) => {
    if (BASE[key]) Object.assign(BASE[key].variants, variants)
  })
})

export const WIDGETS = { ...BASE, ...EXTRA_WIDGETS, ...SAAS_WIDGETS }

export const widgetGroups = () => {
  const g = {}
  Object.entries(WIDGETS).forEach(([key, w]) => {
    ;(g[w.group] ||= []).push({ key, ...w })
  })
  return g
}

export const defaultsFor = (type) => JSON.parse(JSON.stringify(WIDGETS[type]?.defaults || {}))
export const firstVariant = (type) => Object.keys(WIDGETS[type]?.variants || { plain: 1 })[0]

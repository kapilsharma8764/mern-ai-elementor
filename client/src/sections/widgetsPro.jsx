import React from 'react'
import { Wrap, Section, H, P, Btn, Img, Grid, hexA, SectionHead, Eyebrow, fluid, safeText } from './primitives'
import { A } from './links'

/* ------------------------------------------------------------------ *
 * Premium sections — modern agency / SaaS template look:
 * mesh gradient heroes, editorial type, bento grids, work lists,
 * scrolling marquees aur big-number stats.
 * ------------------------------------------------------------------ */

const F = {
  text: (key, label, extra = {}) => ({ key, label, type: 'text', ...extra }),
  area: (key, label, extra = {}) => ({ key, label, type: 'textarea', ...extra }),
  img: (key, label) => ({ key, label, type: 'image' }),
  num: (key, label, extra = {}) => ({ key, label, type: 'number', min: 0, ...extra }),
  sel: (key, label, options) => ({ key, label, type: 'select', options }),
  bool: (key, label) => ({ key, label, type: 'toggle' }),
  list: (key, label, fields, addLabel = 'Add item') => ({ key, label, type: 'list', fields, addLabel }),
}

/** layered radial gradients — "mesh" background */
const mesh = (t, o = 1) => ({
  backgroundColor: t.darkMode ? t.dark : '#0a0a12',
  backgroundImage: [
    `radial-gradient(60% 55% at 18% 20%, ${hexA(t.primary, 0.75 * o)} 0%, transparent 60%)`,
    `radial-gradient(50% 50% at 82% 25%, ${hexA(t.accent, 0.6 * o)} 0%, transparent 62%)`,
    `radial-gradient(65% 60% at 55% 95%, ${hexA(t.primary, 0.45 * o)} 0%, transparent 65%)`,
    `radial-gradient(40% 40% at 92% 80%, ${hexA(t.accent, 0.35 * o)} 0%, transparent 60%)`,
  ].join(', '),
})

/** ek chhota inline keyframe — canvas aur exported HTML dono me chalta hai */
const Keyframes = ({ name, from, to }) => (
  <style dangerouslySetInnerHTML={{ __html: `@keyframes ${name}{from{transform:${from}}to{transform:${to}}}` }} />
)

/* =============================== EXTRA HERO VARIANTS =============================== */
export const HERO_VARIANTS = {
  mesh: {
    name: 'Mesh gradient · display type',
    render: ({ p, t, biz, nav }) => (
      <section style={{ ...mesh(t), color: '#fff', padding: `clamp(50px, 10.00cqw, ${120 * t.density}px) 0 clamp(42px, 8.33cqw, ${100 * t.density}px)` }}>
        <Wrap t={t}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontFamily: t.bodyFont, fontSize: 12, letterSpacing: '.18em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 42 }}>
            {(p.slides || []).slice(0, 4).map((s, i) => (
              <span key={i}>[{String(i + 1).padStart(2, '0')}] {s.title}</span>
            ))}
          </div>
          <H t={t} level={1} style={{ fontSize: fluid(34, 7.4, 84, t.headingScale ?? 1), lineHeight: 1, letterSpacing: '-.035em', maxWidth: '18ch' }}>
            {p.title}
          </H>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 30, marginTop: 46, alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <P t={t} dim={false} style={{ fontSize: 17, opacity: 0.82, maxWidth: '48ch', flex: '1 1 320px' }}>{p.sub}</P>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <A link={p.ctaLink} biz={biz} onNavigate={nav}><Btn t={t} size="lg" variant="light">{p.cta}</Btn></A>
              <A link={p.cta2Link} biz={biz} onNavigate={nav}><Btn t={t} size="lg" variant="outline">{p.cta2}</Btn></A>
            </div>
          </div>
        </Wrap>
      </section>
    ),
  },

  editorial: {
    name: 'Editorial · huge headline',
    render: ({ p, t, biz, nav }) => (
      <section style={{ background: t.bg, color: t.text, paddingTop: 70 * t.density }}>
        <Wrap t={t}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'flex-start' }}>
            <H t={t} level={1} style={{ fontSize: fluid(32, 6.6, 76, t.headingScale ?? 1), lineHeight: 1.02, letterSpacing: '-.03em', flex: '3 1 320px', maxWidth: '16ch' }}>
              {p.title}
            </H>
            <div style={{ paddingTop: 8, flex: '1 1 240px', minWidth: 0 }}>
              <div style={{ fontFamily: t.bodyFont, fontSize: 11, letterSpacing: '.24em', textTransform: 'uppercase', color: t.sub, marginBottom: 14 }}>{p.eyebrow}</div>
              <P t={t} style={{ fontSize: 15 }}>{p.sub}</P>
              <div style={{ marginTop: 22, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <A link={p.ctaLink} biz={biz} onNavigate={nav}><Btn t={t}>{p.cta}</Btn></A><A link={p.cta2Link} biz={biz} onNavigate={nav}><Btn t={t} variant="outline">{p.cta2}</Btn></A>
              </div>
            </div>
          </div>
        </Wrap>
        <div style={{ marginTop: 60 * t.density }}>
          <Img t={t} src={p.image} ratio="21/9" radius="0px" seed={11} bind="image" label="COVER IMAGE" />
        </div>
      </section>
    ),
  },

  bento: {
    name: 'Bento panel',
    render: ({ p, t, biz, nav }) => (
      <section style={{ background: t.bg, color: t.text, padding: `clamp(20px, 4.00cqw, ${48 * t.density}px) 0 clamp(29px, 5.83cqw, ${70 * t.density}px)` }}>
        <Wrap t={t}>
          <div style={{ borderRadius: 28, overflow: 'hidden', ...mesh(t), color: '#fff', padding: 'clamp(24px, 4cqw, 46px)', minHeight: 340, display: 'flex', flexWrap: 'wrap', gap: 36, alignItems: 'center' }}>
            <div style={{ flex: '1 1 320px', minWidth: 0 }}>
              <Eyebrow t={t}>{p.eyebrow}</Eyebrow>
              <H t={t} level={1} style={{ fontSize: fluid(28, 4.6, 52, t.headingScale ?? 1), lineHeight: 1.05 }}>{p.title}</H>
              <P t={t} dim={false} style={{ marginTop: 18, opacity: 0.85, maxWidth: '46ch' }}>{p.sub}</P>
              <div style={{ display: 'flex', gap: 12, marginTop: 28 }}><A link={p.ctaLink} biz={biz} onNavigate={nav}><Btn t={t} size="lg" variant="light">{p.cta}</Btn></A></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: '1 1 260px', minWidth: 0 }}>
              {(p.slides || []).slice(0, 4).map((s, i) => (
                <div key={i} style={{ background: hexA('#ffffff', 0.12), backdropFilter: 'blur(6px)', border: `1px solid ${hexA('#ffffff', 0.18)}`, borderRadius: 16, padding: 18, minHeight: 110, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: t.headingFont, fontSize: 22, fontWeight: 800 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ fontFamily: t.bodyFont, fontSize: 13, opacity: 0.9 }}>{s.title}</span>
                </div>
              ))}
            </div>
          </div>
        </Wrap>
      </section>
    ),
  },

  statcard: {
    name: 'Dark + floating stat card',
    render: ({ p, t, biz, nav }) => (
      <section style={{ position: 'relative', ...mesh(t, 0.8), color: '#fff', padding: `clamp(42px, 8.33cqw, ${100 * t.density}px) 0` }}>
        {p.image ? <img src={p.image} alt="" data-bind='["image"]' style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} /> : null}
        <Wrap t={t} style={{ position: 'relative' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 44, alignItems: 'center' }}>
            <div style={{ flex: '1.2 1 340px', minWidth: 0 }}>
              <div style={{ fontFamily: t.bodyFont, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', opacity: 0.65, marginBottom: 18 }}>{p.eyebrow}</div>
              <H t={t} level={1} style={{ fontSize: fluid(28, 5.0, 56, t.headingScale ?? 1), lineHeight: 1.06 }}>{p.title}</H>
              <P t={t} dim={false} style={{ marginTop: 20, opacity: 0.78, maxWidth: '48ch' }}>{p.sub}</P>
              <div style={{ display: 'flex', gap: 12, marginTop: 30, flexWrap: 'wrap' }}>
                <A link={p.ctaLink} biz={biz} onNavigate={nav}><Btn t={t} size="lg" variant="light">{p.cta}</Btn></A><A link={p.cta2Link} biz={biz} onNavigate={nav}><Btn t={t} size="lg" variant="outline">{p.cta2}</Btn></A>
              </div>
            </div>
            <div style={{ flex: '1 1 280px', minWidth: 0, background: hexA('#ffffff', 0.1), border: `1px solid ${hexA('#ffffff', 0.2)}`, borderRadius: 20, padding: 26, backdropFilter: 'blur(8px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: t.bodyFont, fontSize: 12, opacity: 0.7 }}>
                <span>{(p.slides || [])[0]?.title || 'Growth'}</span><span style={{ color: t.accent }}>+18.6%</span>
              </div>
              <div style={{ fontFamily: t.headingFont, fontSize: fluid(30, 4.4, 46), fontWeight: 800, marginTop: 8 }}>12,480</div>
              <svg viewBox="0 0 240 70" style={{ width: '100%', height: 70, marginTop: 14 }} preserveAspectRatio="none">
                <polyline points="0,58 40,44 80,50 120,28 160,34 200,14 240,6" fill="none" stroke={t.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
                {(p.slides || []).slice(1, 3).map((s, i) => (
                  <div key={i} style={{ background: hexA('#ffffff', 0.08), borderRadius: 12, padding: 12, fontFamily: t.bodyFont, fontSize: 12, opacity: 0.85 }}>{s.title}</div>
                ))}
              </div>
            </div>
          </div>
        </Wrap>
      </section>
    ),
  },
}

/* =============================== MARQUEE =============================== */
const marquee = {
  label: 'Marquee Strip',
  desc: 'Text jo side se chalta rehta hai',
  popular: false,
  group: 'Content',
  defaults: { text: 'Design · Engineering · Automation · Support', repeat: 4, tone: 'primary' },
  schema: [F.text('text', 'Text'), F.num('repeat', 'Repeats', { min: 2, max: 8 }), F.sel('tone', 'Tone', ['primary', 'dark', 'alt', 'outline'])],
  variants: {
    strip: {
      name: 'Scrolling strip',
      render: ({ p, t, biz, nav }) => {
        const bg = p.tone === 'dark' ? t.dark : p.tone === 'alt' ? t.alt : p.tone === 'outline' ? 'transparent' : t.primary
        const fg = p.tone === 'alt' || p.tone === 'outline' ? t.text : '#fff'
        const n = Math.max(2, Number(p.repeat) || 4)
        return (
          <section style={{ background: bg, color: fg, overflow: 'hidden', padding: `clamp(9px, 1.83cqw, ${22 * t.density}px) 0`, borderTop: p.tone === 'outline' ? `1px solid ${hexA(t.text, 0.14)}` : 'none', borderBottom: p.tone === 'outline' ? `1px solid ${hexA(t.text, 0.14)}` : 'none' }}>
            <Keyframes name="wbmarq" from="translateX(0)" to="translateX(-50%)" />
            <div style={{ display: 'flex', width: 'max-content', animation: 'wbmarq 24s linear infinite' }}>
              {[0, 1].map((k) => (
                <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 26, paddingRight: 26, fontFamily: t.headingFont, fontSize: fluid(20, 3.2, 34), fontWeight: 800, letterSpacing: '-.02em', whiteSpace: 'nowrap' }}>
                  {Array.from({ length: n }).map((_, i) => (
                    <React.Fragment key={i}>
                      <span>{p.text}</span>
                      <span style={{ opacity: 0.45 }}>✦</span>
                    </React.Fragment>
                  ))}
                </span>
              ))}
            </div>
          </section>
        )
      },
    },
    ticker: {
      name: 'Thin ticker',
      render: ({ p, t, biz, nav }) => (
        <section style={{ background: t.dark, color: '#fff', overflow: 'hidden', padding: '11px 0' }}>
          <Keyframes name="wbtick" from="translateX(0)" to="translateX(-50%)" />
          <div style={{ display: 'flex', width: 'max-content', animation: 'wbtick 30s linear infinite' }}>
            {[0, 1].map((k) => (
              <span key={k} style={{ display: 'flex', gap: 30, paddingRight: 30, fontFamily: t.bodyFont, fontSize: 13, whiteSpace: 'nowrap', opacity: 0.85 }}>
                {Array.from({ length: Math.max(2, Number(p.repeat) || 4) }).map((_, i) => (
                  <React.Fragment key={i}><span>{p.text}</span><span style={{ color: t.accent }}>•</span></React.Fragment>
                ))}
              </span>
            ))}
          </div>
        </section>
      ),
    },
  },
}

/* =============================== BENTO GRID =============================== */
const bento = {
  label: 'Bento Grid',
  desc: 'Chhote-bade box me khaasiyat',
  popular: false,
  group: 'Content',
  defaults: {
    eyebrow: 'Capabilities',
    title: 'Everything in one system',
    items: [
      { title: 'Automated workflows', text: 'Repeat work runs itself, end to end.' },
      { title: 'No coding required', text: 'Visual setup that anyone on the team can run.' },
      { title: 'Scalable as you grow', text: 'Same system at 10 users or 10,000.' },
      { title: 'Powerful analytics', text: 'Numbers you can act on, not just look at.' },
      { title: 'Secure by default', text: 'Encrypted, access-controlled and audited.' },
    ],
  },
  schema: [
    F.text('eyebrow', 'Eyebrow'), F.text('title', 'Title'),
    F.list('items', 'Cards', [F.text('title', 'Title'), F.area('text', 'Text'), F.img('image', 'Image')], 'Add card'),
  ],
  variants: {
    grid: {
      name: 'Asymmetric bento',
      render: ({ p, t, biz, nav }) => {
        const items = p.items || []
        const spans = [
          { c: 'span 2', r: 'span 2' }, { c: 'span 2', r: 'span 1' }, { c: 'span 1', r: 'span 1' },
          { c: 'span 1', r: 'span 1' }, { c: 'span 2', r: 'span 1' }, { c: 'span 2', r: 'span 1' },
        ]
        return (
          <Section t={t} tone="alt">
            <Wrap t={t}>
              <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} align="left" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gridAutoRows: 'minmax(150px, auto)', gap: 14 }}>
                {items.map((s, i) => {
                  const sp = spans[i % spans.length]
                  const feature = i === 0
                  return (
                    <div key={i} style={{
                      gridColumn: sp.c, gridRow: sp.r,
                      borderRadius: 20, padding: 24, overflow: 'hidden',
                      ...(feature ? { ...mesh(t, 0.9), color: '#fff' } : { background: t.bg, border: `1px solid ${hexA(t.text, 0.1)}` }),
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: feature ? hexA('#ffffff', 0.2) : hexA(t.primary, 0.12), color: feature ? '#fff' : t.primary, display: 'grid', placeItems: 'center', fontSize: 15 }}>◆</div>
                      <div>
                        <H t={t} level={feature ? 3 : 4} style={{ color: feature ? '#fff' : undefined }}>{s.title}</H>
                        <P t={t} dim={!feature} style={{ marginTop: 8, fontSize: 13.5, opacity: feature ? 0.85 : 1 }}>{s.text}</P>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Wrap>
          </Section>
        )
      },
    },
    cards: {
      name: 'Even panels',
      render: ({ p, t, biz, nav }) => (
        <Section t={t}>
          <Wrap t={t}>
            <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} />
            <Grid cols={3} gap={14} responsive>
              {(p.items || []).map((s, i) => (
                <div key={i} style={{ borderRadius: 20, padding: 26, background: i % 4 === 0 ? t.primary : t.alt, color: i % 4 === 0 ? '#fff' : t.text, minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: t.headingFont, fontSize: 13, letterSpacing: '.16em', textTransform: 'uppercase', opacity: 0.7 }}>{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <H t={t} level={4} style={{ color: i % 4 === 0 ? '#fff' : undefined }}>{s.title}</H>
                    <P t={t} dim={i % 4 !== 0} style={{ marginTop: 8, fontSize: 14, opacity: i % 4 === 0 ? 0.85 : 1 }}>{s.text}</P>
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

/* =============================== WORK / PORTFOLIO =============================== */
const work = {
  label: 'Featured Work',
  desc: 'Ab tak kiye hue project',
  popular: false,
  group: 'Content',
  defaults: {
    eyebrow: 'Selected work',
    title: 'Featured Works',
    items: [
      { title: 'Northline Rebrand', tag: 'Branding', year: '2025' },
      { title: 'Bluecore Platform', tag: 'Product design', year: '2025' },
      { title: 'Craftly Storefront', tag: 'E-commerce', year: '2024' },
      { title: 'Vertex Dashboard', tag: 'Data & AI', year: '2024' },
    ],
  },
  schema: [
    F.text('eyebrow', 'Eyebrow'), F.text('title', 'Title'),
    F.list('items', 'Projects', [F.text('title', 'Project'), F.text('tag', 'Category'), F.text('year', 'Year'), F.img('image', 'Image')], 'Add project'),
  ],
  variants: {
    rows: {
      name: 'Hover rows',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="dark">
          <Wrap t={t}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 20, marginBottom: 34 }}>
              <H t={t} level={2} style={{ color: '#fff' }}>{p.title}</H>
              <span style={{ fontFamily: t.bodyFont, fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: hexA('#ffffff', 0.5) }}>{p.eyebrow}</span>
            </div>
            <div style={{ borderTop: `1px solid ${hexA('#ffffff', 0.16)}` }}>
              {(p.items || []).map((s, i) => (
                <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', alignItems: 'center', padding: '22px 0', borderBottom: `1px solid ${hexA('#ffffff', 0.16)}`, color: '#fff' }}>
                  <span style={{ fontFamily: t.bodyFont, fontSize: 12, opacity: 0.45, width: 34 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ ...safeText, fontFamily: t.headingFont, fontSize: fluid(20, 3.2, 30), fontWeight: 800, letterSpacing: '-.02em', flex: '1 1 200px', minWidth: 0 }}>{s.title}</span>
                  <span style={{ fontFamily: t.bodyFont, fontSize: 13, opacity: 0.6 }}>{s.tag}</span>
                  <span style={{ fontFamily: t.bodyFont, fontSize: 13, opacity: 0.6, width: 48 }}>{s.year}</span>
                  <span aria-hidden style={{ color: t.accent, fontSize: 20 }}>↗</span>
                </div>
              ))}
            </div>
          </Wrap>
        </Section>
      ),
    },
    covers: {
      name: 'Cover cards',
      render: ({ p, t, biz, nav }) => (
        <Section t={t}>
          <Wrap t={t}>
            <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} align="left" />
            <Grid cols={2} gap={20} responsive>
              {(p.items || []).map((s, i) => (
                <div key={i}>
                  <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden' }}>
                    <Img t={t} src={s.image} ratio="4/3" radius="0px" seed={i + 12} bind={['items', i, 'image']} label="PROJECT" />
                    <span style={{ position: 'absolute', top: 14, left: 14, background: hexA('#000000', 0.55), color: '#fff', borderRadius: 999, padding: '5px 12px', fontSize: 11, fontFamily: t.bodyFont, fontWeight: 600, backdropFilter: 'blur(6px)' }}>{s.tag}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14 }}>
                    <H t={t} level={4} style={{ fontSize: 20 }}>{s.title}</H>
                    <span style={{ fontFamily: t.bodyFont, fontSize: 13, color: t.sub }}>{s.year}</span>
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

/* =============================== BIG STATS =============================== */
const bigstats = {
  label: 'Big Numbers',
  desc: 'Bahut bade numbers, dhyan khinchne ko',
  popular: false,
  group: 'Content',
  defaults: {
    items: [
      { value: '65', label: 'Completed projects' },
      { value: '82', label: 'Happy clients' },
      { value: '15', label: 'Years of experience' },
    ],
  },
  schema: [F.list('items', 'Numbers', [F.text('value', 'Number'), F.text('label', 'Label')], 'Add number')],
  variants: {
    editorial: {
      name: 'Editorial dashes',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="dark" pad={70}>
          <Wrap t={t}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(16px, 3cqw, 40px)', flexWrap: 'wrap' }}>
              {(p.items || []).map((s, i) => (
                <React.Fragment key={i}>
                  {i ? <span aria-hidden style={{ fontFamily: t.headingFont, fontSize: fluid(28, 5, 64), color: t.accent, lineHeight: 1.5, opacity: 0.8 }}>–</span> : null}
                  <div style={{ color: '#fff', flex: '1 1 140px', minWidth: 0 }}>
                    <div style={{ fontFamily: t.headingFont, fontSize: fluid(44, 8.4, 96, t.headingScale ?? 1), fontWeight: 800, lineHeight: 0.95, letterSpacing: '-.04em' }}>{s.value}</div>
                    <div style={{ ...safeText, fontFamily: t.bodyFont, fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', opacity: 0.55, marginTop: 14 }}>{s.label}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </Wrap>
        </Section>
      ),
    },
    outline: {
      name: 'Outline numbers',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="alt">
          <Wrap t={t}>
            <Grid cols={(p.items || []).length || 3} gap={26}>
              {(p.items || []).map((s, i) => (
                <div key={i} style={{ borderTop: `2px solid ${t.primary}`, paddingTop: 22 }}>
                  <div style={{ fontFamily: t.headingFont, fontSize: fluid(40, 6.5, 72, t.headingScale ?? 1), fontWeight: 800, lineHeight: 1.05, letterSpacing: '-.04em', color: 'transparent', WebkitTextStroke: `2px ${t.primary}` }}>{s.value}</div>
                  <div style={{ fontFamily: t.bodyFont, fontSize: 14, color: t.sub, marginTop: 14 }}>{s.label}</div>
                </div>
              ))}
            </Grid>
          </Wrap>
        </Section>
      ),
    },
  },
}

/* =============================== PROCESS =============================== */
const process = {
  label: 'Process Steps',
  desc: '1-2-3 karke tarika batao',
  popular: false,
  group: 'Content',
  defaults: {
    eyebrow: 'How we work',
    title: 'From brief to build',
    items: [
      { title: 'Discovery', text: 'We map goals, users and constraints before touching design.' },
      { title: 'Design', text: 'Wireframes to polished UI, reviewed with you at every step.' },
      { title: 'Build', text: 'Clean, fast, responsive implementation with tests.' },
      { title: 'Launch & care', text: 'Go live, measure, iterate — we stay after handover.' },
    ],
  },
  schema: [
    F.text('eyebrow', 'Eyebrow'), F.text('title', 'Title'),
    F.list('items', 'Steps', [F.text('title', 'Step'), F.area('text', 'Description')], 'Add step'),
  ],
  variants: {
    bignum: {
      name: 'Big ghost numbers',
      render: ({ p, t, biz, nav }) => (
        <Section t={t}>
          <Wrap t={t}>
            <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} align="left" />
            <div style={{ display: 'grid', gap: 0 }}>
              {(p.items || []).map((s, i) => (
                <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 30px', alignItems: 'center', padding: '26px 0', borderTop: `1px solid ${hexA(t.text, 0.12)}` }}>
                  <span style={{ fontFamily: t.headingFont, fontSize: fluid(36, 5.4, 64), fontWeight: 800, lineHeight: 1.1, color: 'transparent', WebkitTextStroke: `1.5px ${hexA(t.text, 0.25)}`, width: 110 }}>{String(i + 1).padStart(2, '0')}</span>
                  <H t={t} level={3} style={{ flex: '1 1 180px', minWidth: 0 }}>{s.title}</H>
                  <P t={t} style={{ flex: '1.4 1 260px', minWidth: 0 }}>{s.text}</P>
                </div>
              ))}
            </div>
          </Wrap>
        </Section>
      ),
    },
    timeline: {
      name: 'Vertical timeline',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="alt">
          <Wrap t={t} style={{ maxWidth: 860 }}>
            <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} />
            <div style={{ position: 'relative', paddingLeft: 40 }}>
              <div style={{ position: 'absolute', left: 13, top: 6, bottom: 6, width: 2, background: hexA(t.primary, 0.25) }} />
              {(p.items || []).map((s, i) => (
                <div key={i} style={{ position: 'relative', paddingBottom: 30 }}>
                  <span style={{ position: 'absolute', left: -34, top: 2, width: 28, height: 28, borderRadius: 999, background: t.primary, color: '#fff', display: 'grid', placeItems: 'center', fontFamily: t.headingFont, fontWeight: 800, fontSize: 13 }}>{i + 1}</span>
                  <H t={t} level={4}>{s.title}</H>
                  <P t={t} style={{ marginTop: 7, fontSize: 15 }}>{s.text}</P>
                </div>
              ))}
            </div>
          </Wrap>
        </Section>
      ),
    },
  },
}

export const EXTRA_VARIANTS = { hero: HERO_VARIANTS }
export const EXTRA_WIDGETS = { marquee, bento, work, bigstats, process }

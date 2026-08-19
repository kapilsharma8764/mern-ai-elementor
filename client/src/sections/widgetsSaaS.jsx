import React from 'react'
import { Wrap, Section, H, P, Btn, Img, hexA, SectionHead, fluid, safeText } from './primitives'
import { A } from './links'

/* ------------------------------------------------------------------ *
 * Polished SaaS sections — announcement bar, centred gradient hero,
 * product UI mockup aur logo cloud. Modern SaaS sites jaisa structure.
 * ------------------------------------------------------------------ */

const F = {
  text: (key, label, extra = {}) => ({ key, label, type: 'text', ...extra }),
  area: (key, label, extra = {}) => ({ key, label, type: 'textarea', ...extra }),
  img: (key, label) => ({ key, label, type: 'image' }),
  sel: (key, label, options) => ({ key, label, type: 'select', options }),
  bool: (key, label) => ({ key, label, type: 'toggle' }),
  list: (key, label, fields, addLabel = 'Add item') => ({ key, label, type: 'list', fields, addLabel }),
}

/** halka dotted texture — hero backgrounds ko depth deta hai */
const dots = (color, size = 22) => ({
  backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`,
  backgroundSize: `${size}px ${size}px`,
})

/* =============================== ANNOUNCEMENT BAR =============================== */
const announce = {
  label: 'Upar ki Patti',
  desc: 'Offer ya zaroori khabar',
  popular: false,
  group: 'Upar aur Neeche',
  defaults: { text: 'We just launched something new', linkText: 'Read the announcement', tone: 'dark', ctaLink: { kind: 'section', target: 's-contact' } },
  schema: [
    F.text('text', 'Message'), F.text('linkText', 'Link text'),
    F.sel('tone', 'Tone', ['dark', 'primary', 'soft']),
    { key: 'ctaLink', label: 'Links to', type: 'link' },
  ],
  variants: {
    bar: {
      name: 'Slim bar',
      render: ({ p, t, biz, nav }) => {
        const bg = p.tone === 'primary' ? t.primary : p.tone === 'soft' ? t.alt : t.dark
        const fg = p.tone === 'soft' ? t.text : '#fff'
        return (
          <div style={{ background: bg, color: fg, fontFamily: t.bodyFont, fontSize: 14 }}>
            <Wrap t={t} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', alignItems: 'center', padding: '11px clamp(16px, 4cqw, 32px)' }}>
              <span style={{ width: 7, height: 7, borderRadius: 999, background: t.accent, flexShrink: 0 }} />
              <span style={{ ...safeText }}>{p.text}</span>
              {p.linkText ? (
                <>
                  <span style={{ opacity: 0.35 }}>|</span>
                  <A link={p.ctaLink} biz={biz} onNavigate={nav} style={{ fontWeight: 600, color: p.tone === 'soft' ? t.primary : '#fff' }}>
                    {p.linkText} →
                  </A>
                </>
              ) : null}
            </Wrap>
          </div>
        )
      },
    },
    pill: {
      name: 'Centered pill',
      render: ({ p, t, biz, nav }) => (
        <div style={{ background: t.bg, padding: '18px 0 0' }}>
          <Wrap t={t} style={{ display: 'flex', justifyContent: 'center' }}>
            <A link={p.ctaLink} biz={biz} onNavigate={nav}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, border: `1px solid ${hexA(t.text, 0.14)}`, background: hexA(t.primary, 0.06), borderRadius: 999, padding: '7px 16px', fontFamily: t.bodyFont, fontSize: 13.5, color: t.text }}>
                <span style={{ background: t.primary, color: '#fff', borderRadius: 999, padding: '2px 9px', fontSize: 11, fontWeight: 700 }}>New</span>
                {p.text}
                <span style={{ color: t.primary, fontWeight: 700 }}>→</span>
              </span>
            </A>
          </Wrap>
        </div>
      ),
    },
  },
}

/* =============================== SAAS HERO =============================== */
export const HERO_SAAS = {
  gradient: {
    name: 'Centered gradient · SaaS',
    render: ({ p, t, biz, nav }) => (
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(180deg, ${t.primary} 0%, ${hexA(t.primary, 0.72)} 45%, ${t.bg} 100%)`,
          color: '#fff',
          padding: `${96 * t.density}px 0 ${88 * t.density}px`,
          textAlign: 'center',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, ...dots(hexA('#ffffff', 0.18), 20), maskImage: 'radial-gradient(ellipse at 50% 62%, #000 20%, transparent 72%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 62%, #000 20%, transparent 72%)' }} />
        <Wrap t={t} style={{ position: 'relative', maxWidth: 900 }}>
          <H t={t} level={1} style={{ fontSize: fluid(34, 6.4, 68, t.headingScale ?? 1), lineHeight: 1.08, letterSpacing: '-.025em' }}>
            {p.title}
          </H>
          <P t={t} dim={false} style={{ marginTop: 22, fontSize: 17.5, lineHeight: 1.65, opacity: 0.88, maxWidth: '54ch', marginInline: 'auto' }}>
            {p.sub}
          </P>
          <div style={{ display: 'flex', gap: 14, marginTop: 34, justifyContent: 'center', flexWrap: 'wrap' }}>
            <A link={p.ctaLink} biz={biz} onNavigate={nav}>
              <span style={{ display: 'inline-block', background: '#fff', color: t.primary, borderRadius: 999, padding: '15px 30px', fontFamily: t.bodyFont, fontWeight: 700, fontSize: 15.5 }}>{p.cta}</span>
            </A>
            <A link={p.cta2Link} biz={biz} onNavigate={nav}>
              <span style={{ display: 'inline-block', background: hexA('#ffffff', 0.16), color: '#fff', border: `1px solid ${hexA('#ffffff', 0.3)}`, borderRadius: 999, padding: '15px 28px', fontFamily: t.bodyFont, fontWeight: 600, fontSize: 15.5 }}>{p.cta2} ›</span>
            </A>
          </div>
          {p.eyebrow ? (
            <div style={{ marginTop: 56, fontFamily: t.bodyFont, fontSize: 14.5, opacity: 0.72 }}>{p.eyebrow}</div>
          ) : null}
        </Wrap>
      </section>
    ),
  },

  mockup: {
    name: 'Headline + app mockup',
    render: ({ p, t, biz, nav }) => (
      <section style={{ position: 'relative', overflow: 'hidden', background: t.alt, color: t.text, padding: `${84 * t.density}px 0 0` }}>
        <div style={{ position: 'absolute', inset: 0, ...dots(hexA(t.text, 0.07), 24) }} />
        <Wrap t={t} style={{ position: 'relative', textAlign: 'center', maxWidth: 860 }}>
          <span style={{ display: 'inline-block', background: hexA(t.primary, 0.1), color: t.primary, borderRadius: 999, padding: '6px 14px', fontFamily: t.bodyFont, fontSize: 12.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>
            {p.eyebrow}
          </span>
          <H t={t} level={1} style={{ marginTop: 20, fontSize: fluid(32, 5.8, 62, t.headingScale ?? 1), lineHeight: 1.08, letterSpacing: '-.025em' }}>{p.title}</H>
          <P t={t} style={{ marginTop: 18, fontSize: 17, maxWidth: '52ch', marginInline: 'auto' }}>{p.sub}</P>
          <div style={{ display: 'flex', gap: 12, marginTop: 30, justifyContent: 'center', flexWrap: 'wrap' }}>
            <A link={p.ctaLink} biz={biz} onNavigate={nav}><Btn t={t} size="lg">{p.cta}</Btn></A><A link={p.cta2Link} biz={biz} onNavigate={nav}><Btn t={t} size="lg" variant="outline">{p.cta2}</Btn></A>
          </div>
        </Wrap>

        {/* browser frame */}
        <Wrap t={t} style={{ position: 'relative', marginTop: 52 }}>
          <div style={{ borderRadius: '18px 18px 0 0', border: `1px solid ${hexA(t.text, 0.12)}`, borderBottom: 'none', background: t.bg, overflow: 'hidden', boxShadow: '0 -10px 60px -20px rgba(0,0,0,.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 16px', borderBottom: `1px solid ${hexA(t.text, 0.1)}`, background: t.alt }}>
              {['#ff5f57', '#febc2e', '#28c840'].map((c) => <span key={c} style={{ width: 10, height: 10, borderRadius: 999, background: c }} />)}
              <span style={{ marginLeft: 12, flex: 1, maxWidth: 320, height: 20, borderRadius: 999, background: hexA(t.text, 0.07) }} />
            </div>
            {p.image ? (
              <img src={p.image} alt="" data-bind='["image"]' style={{ width: '100%', display: 'block' }} />
            ) : (
              <div data-bind='["image"]' style={{ padding: 22, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, minHeight: 280 }}>
                {(p.slides || []).slice(0, 4).map((s, i) => (
                  <div key={i} style={{ border: `1px solid ${hexA(t.text, 0.1)}`, borderRadius: 14, padding: 16, background: t.bg }}>
                    <div style={{ width: 26, height: 26, borderRadius: 8, background: hexA(t.primary, 0.14) }} />
                    <div style={{ marginTop: 12, fontFamily: t.bodyFont, fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: t.sub }}>{s.title}</div>
                    <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-end', gap: 5, height: 52 }}>
                      {[46, 72, 38, 84, 60].map((h, j) => (
                        <div key={j} style={{ flex: 1, height: `${h}%`, borderRadius: 3, background: `linear-gradient(180deg, ${hexA(t.accent, 0.9)}, ${t.primary})` }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Wrap>
      </section>
    ),
  },
}

/* =============================== SAAS HEADER =============================== */
export const HEADER_SAAS = {
  saas: {
    name: 'SaaS · sign in + pill CTA',
    render: ({ p, t, biz, nav }) => (
      <header style={{ background: t.bg, borderBottom: `1px solid ${hexA(t.text, 0.08)}`, color: t.text }}>
        <Wrap t={t} style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', minHeight: 74, paddingTop: 12, paddingBottom: 12 }}>
          <SaaSLogo t={t} biz={biz} />
          <nav style={{ display: 'flex', gap: 26, flexWrap: 'wrap', marginInline: 'auto', fontFamily: t.bodyFont, fontSize: 14.5, fontWeight: 500 }}>
            {(p.links || []).map((l, i) => (
              <A key={i} link={l.link} biz={biz} onNavigate={nav} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, opacity: 0.85 }}>
                {l.label}
              </A>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontFamily: t.bodyFont, fontSize: 14.5, opacity: 0.75 }}>Sign in</span>
            <A link={p.ctaLink} biz={biz} onNavigate={nav}>
              <span style={{ display: 'inline-block', background: t.primary, color: '#fff', borderRadius: 999, padding: '11px 22px', fontFamily: t.bodyFont, fontWeight: 600, fontSize: 14.5 }}>{p.cta}</span>
            </A>
          </div>
        </Wrap>
      </header>
    ),
  },
}

const SaaSLogo = ({ t, biz }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    {biz.logo
      ? <img src={biz.logo} alt="" style={{ height: 32, width: 'auto', objectFit: 'contain' }} />
      : <span style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg, ${t.primary}, ${t.accent})`, color: '#fff', display: 'grid', placeItems: 'center', fontFamily: t.headingFont, fontWeight: 800, fontSize: 14 }}>{(biz.name || 'A')[0].toUpperCase()}</span>}
    <span style={{ fontFamily: t.headingFont, fontWeight: 800, fontSize: 19, letterSpacing: '-.01em' }}>{biz.name || 'Your Company'}</span>
  </div>
)

/* =============================== LOGO CLOUD =============================== */
const logocloud = {
  label: 'Logo ki Line',
  desc: 'Client logo ek line me',
  popular: false,
  group: 'Bharosa Banane Ke Liye',
  defaults: {
    title: 'Trusted by modern teams',
    items: [{ label: 'NVIDIA' }, { label: 'INDEED' }, { label: 'ADYEN' }, { label: 'GILEAD' }, { label: 'SWIGGY' }, { label: 'VISMA' }],
  },
  schema: [F.text('title', 'Title'), F.list('items', 'Logos', [F.text('label', 'Name'), F.img('image', 'Logo image')], 'Add logo')],
  variants: {
    grid: {
      name: 'Muted grid',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} pad={56}>
          <Wrap t={t}>
            {p.title ? (
              <div style={{ textAlign: 'center', fontFamily: t.bodyFont, fontSize: 14, color: t.sub, marginBottom: 30 }}>{p.title}</div>
            ) : null}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '26px 30px', alignItems: 'center', justifyItems: 'center' }}>
              {(p.items || []).map((s, i) =>
                s.image
                  ? <img key={i} src={s.image} alt="" data-bind={JSON.stringify(['items', i, 'image'])} style={{ height: 26, objectFit: 'contain', opacity: 0.55, filter: 'grayscale(1)' }} />
                  : <span key={i} style={{ fontFamily: t.headingFont, fontWeight: 700, fontSize: 16, letterSpacing: '.04em', color: t.sub, opacity: 0.75 }}>{s.label}</span>
              )}
            </div>
          </Wrap>
        </Section>
      ),
    },
    strip: {
      name: 'Bordered strip',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="alt" pad={40}>
          <Wrap t={t}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px 34px', alignItems: 'center', justifyContent: 'center', borderTop: `1px solid ${hexA(t.text, 0.1)}`, borderBottom: `1px solid ${hexA(t.text, 0.1)}`, padding: '22px 0' }}>
              {(p.items || []).map((s, i) =>
                s.image
                  ? <img key={i} src={s.image} alt="" data-bind={JSON.stringify(['items', i, 'image'])} style={{ height: 24, objectFit: 'contain', opacity: 0.6 }} />
                  : <span key={i} style={{ fontFamily: t.headingFont, fontWeight: 700, fontSize: 15, color: t.sub }}>{s.label}</span>
              )}
            </div>
          </Wrap>
        </Section>
      ),
    },
  },
}

/* =============================== FEATURE SPLIT =============================== */
const feature = {
  label: 'Photo + Baat',
  desc: 'Ek taraf photo, doosri taraf likha',
  popular: false,
  group: 'Main Content',
  defaults: {
    eyebrow: 'Platform',
    title: 'Built for the way your team actually works',
    body: 'Explain one capability properly instead of listing ten. Show the screen, name the outcome.',
    points: [{ label: 'Set up in minutes, not weeks' }, { label: 'Works with the tools you already use' }, { label: 'Enterprise-grade security' }],
    cta: 'See how it works',
    ctaLink: { kind: 'section', target: 's-contact' },
    image: '',
    flip: false,
  },
  schema: [
    F.text('eyebrow', 'Eyebrow'), F.text('title', 'Title'), F.area('body', 'Body'),
    F.list('points', 'Bullet points', [F.text('label', 'Point')]), F.text('cta', 'Button'), { key: 'ctaLink', label: 'Button links to', type: 'link' },
    F.img('image', 'Screenshot'), F.bool('flip', 'Image on left'),
  ],
  variants: {
    split: {
      name: 'Text + screenshot',
      render: ({ p, t, biz, nav }) => (
        <Section t={t}>
          <Wrap t={t}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 50, alignItems: 'center', flexDirection: p.flip ? 'row-reverse' : 'row' }}>
              <div style={{ flex: '1 1 320px', minWidth: 0 }}>
                <div style={{ fontFamily: t.bodyFont, fontSize: 12, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: t.primary, marginBottom: 14 }}>{p.eyebrow}</div>
                <H t={t} level={2} style={{ maxWidth: '18ch' }}>{p.title}</H>
                <P t={t} style={{ marginTop: 16, maxWidth: '50ch' }}>{p.body}</P>
                <div style={{ marginTop: 22, display: 'grid', gap: 11 }}>
                  {(p.points || []).map((x, i) => (
                    <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', fontFamily: t.bodyFont, fontSize: 15 }}>
                      <span style={{ marginTop: 3, width: 18, height: 18, borderRadius: 999, background: hexA(t.primary, 0.14), color: t.primary, display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>✓</span>
                      <span style={safeText}>{x.label}</span>
                    </div>
                  ))}
                </div>
                {p.cta ? <div style={{ marginTop: 26 }}><A link={p.ctaLink} biz={biz} onNavigate={nav}><Btn t={t}>{p.cta}</Btn></A></div> : null}
              </div>
              <div style={{ flex: '1 1 340px', minWidth: 0 }}>
                <div style={{ borderRadius: t.radius, overflow: 'hidden', border: `1px solid ${hexA(t.text, 0.12)}`, background: t.alt, boxShadow: '0 30px 60px -35px rgba(0,0,0,.5)' }}>
                  <div style={{ display: 'flex', gap: 6, padding: '10px 14px', borderBottom: `1px solid ${hexA(t.text, 0.1)}` }}>
                    {['#ff5f57', '#febc2e', '#28c840'].map((c) => <span key={c} style={{ width: 9, height: 9, borderRadius: 999, background: c }} />)}
                  </div>
                  <Img t={t} src={p.image} ratio="16/10" radius="0px" seed={13} bind="image" label="SCREENSHOT" />
                </div>
              </div>
            </div>
          </Wrap>
        </Section>
      ),
    },
    stacked: {
      name: 'Centered + wide screenshot',
      render: ({ p, t, biz, nav }) => (
        <Section t={t} tone="alt">
          <Wrap t={t}>
            <SectionHead t={t} eyebrow={p.eyebrow} title={p.title} sub={p.body} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 30px', justifyContent: 'center', marginBottom: 34 }}>
              {(p.points || []).map((x, i) => (
                <span key={i} style={{ fontFamily: t.bodyFont, fontSize: 14, color: t.sub }}>✓ &nbsp;{x.label}</span>
              ))}
            </div>
            <div style={{ borderRadius: t.radius, overflow: 'hidden', border: `1px solid ${hexA(t.text, 0.12)}`, background: t.bg }}>
              <Img t={t} src={p.image} ratio="16/8" radius="0px" seed={15} bind="image" label="PRODUCT SCREENSHOT" />
            </div>
          </Wrap>
        </Section>
      ),
    },
  },
}

export const SAAS_VARIANTS = { hero: HERO_SAAS, header: HEADER_SAAS }
export const SAAS_WIDGETS = { announce, logocloud, feature }

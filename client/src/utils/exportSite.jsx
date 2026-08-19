import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { BlockView } from '../sections/Renderer'
import { GOOGLE_FONTS_HREF } from '../data/design'

/** LocalBusiness JSON-LD taaki search engines ko details mil jayein */
function schema(b) {
  if (!b.name) return ''
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: b.name,
    description: b.metaDescription || b.slogan || b.about || undefined,
    url: b.website || undefined,
    telephone: b.phone || undefined,
    email: b.email || undefined,
    foundingDate: b.established || undefined,
    address: (b.address || b.city) ? {
      '@type': 'PostalAddress',
      streetAddress: b.address || undefined,
      addressLocality: b.city || undefined,
      addressRegion: b.state || undefined,
      postalCode: b.pincode || undefined,
      addressCountry: b.country || undefined,
    } : undefined,
    openingHours: [b.workingDays, b.timing].filter(Boolean).join(' ') || undefined,
    sameAs: [b.facebook, b.instagram, b.linkedin, b.twitter, b.youtube].filter(Boolean),
  }
  return `<script type="application/ld+json">${JSON.stringify(data, (k, v) => (v === undefined || (Array.isArray(v) && !v.length) ? undefined : v))}<\/script>`
}

const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

/** page-links ke target (page id) ko asli file name me badlo */
function withResolvedLinks(site, allPages) {
  const map = {}
  ;(allPages || []).forEach((p) => { map[p.id] = fileNameFor(p) })
  const fix = (l) => (l && l.kind === 'page' && map[l.target] ? { ...l, target: map[l.target] } : l)
  const header = { ...site.header, props: { ...site.header.props } }
  if (Array.isArray(header.props.links)) header.props.links = header.props.links.map((l) => ({ ...l, link: fix(l.link) }))
  header.props.ctaLink = fix(header.props.ctaLink)
  return { ...site, header }
}

/* ------------------------------------------------------------------ *
 * Poori site ek self-contained HTML file me — saare pages andar,
 * chhota sa router unke beech switch karta hai. "Open in browser" isse
 * use karta hai, isliye asli browser tab me website waise hi chalti hai.
 * ------------------------------------------------------------------ */
export function siteToHtml({ site: rawSite, theme, business }) {
  const pages = rawSite.pages
  const site = withResolvedLinks(rawSite, pages)

  const bodies = pages.map((page, i) => {
    const html = renderToStaticMarkup(
      <div className="sitewrap">
        <span id="top" />
        <BlockView block={site.header} theme={theme} business={business} />
        {page.blocks.map((b) => <BlockView key={b.id} block={b} theme={theme} business={business} />)}
        <BlockView block={site.footer} theme={theme} business={business} />
      </div>
    )
    return `<div class="wb-page" data-page="${fileNameFor(page)}"${i ? ' hidden' : ''}>${html}</div>`
  }).join('\n')

  const router = `
<script>
(function () {
  var pages = [].slice.call(document.querySelectorAll('.wb-page'));
  function show(name) {
    var found = false;
    pages.forEach(function (p) {
      var on = p.getAttribute('data-page') === name;
      if (on) found = true;
      p.hidden = !on;
    });
    if (found && typeof window.scrollTo === 'function') {
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (err) { window.scrollTo(0, 0); }
    }
    return found;
  }
  document.addEventListener('click', function (e) {
    var el = e.target;
    var a = el && el.closest ? el.closest('a') : null;
    if (!a && el && el.parentElement && el.parentElement.closest) a = el.parentElement.closest('a');
    if (!a) return;
    var h = a.getAttribute('href') || '';
    if (/\.html$/.test(h)) { if (show(h)) e.preventDefault(); }
  });
})();
</script>`

  return htmlShell({
    title: business.name || 'Website',
    theme, business,
    body: bodies + (pages.length > 1 ? pageNav(pages) : '') + router,
  })
}

const pageNav = (pages) =>
  `<nav class="exported-nav">${pages.map((p) => `<a href="${fileNameFor(p)}">${esc(p.name)}</a>`).join('')}</nav>`

export function pageToHtml({ site: rawSite, theme, business, page, allPages }) {
  const site = withResolvedLinks(rawSite, allPages)
  const body = renderToStaticMarkup(
    <div className="sitewrap">
      <span id="top" />
      <BlockView block={site.header} theme={theme} business={business} />
      {page.blocks.map((b) => <BlockView key={b.id} block={b} theme={theme} business={business} />)}
      <BlockView block={site.footer} theme={theme} business={business} />
    </div>
  )

  const title = `${business.name || 'Website'}${page.name && page.name !== 'Home' ? ' — ' + page.name : ''}`
  const nav = (allPages || [])
    .map((p) => `<a href="${p === page ? '#' : fileNameFor(p)}">${esc(p.name)}</a>`)
    .join('')

  return htmlShell({
    title,
    theme,
    business,
    body: body + ((allPages || []).length > 1 ? `<nav class="exported-nav">${nav}</nav>` : ''),
  })
}

/** shared HTML document — page export aur browser preview dono isse bante hain */
function htmlShell({ title, theme, business, body }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(business.metaDescription || business.slogan || business.about || '')}" />
${business.keywords ? `<meta name="keywords" content="${esc(business.keywords)}" />` : ''}
${business.owner ? `<meta name="author" content="${esc(business.owner)}" />` : ''}
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(business.metaDescription || business.slogan || '')}" />
<meta property="og:type" content="website" />
${business.logo ? `<meta property="og:image" content="${business.logo}" />` : ''}
${business.logo ? `<link rel="icon" href="${business.logo}" />` : ''}
${schema(business)}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${GOOGLE_FONTS_HREF}" rel="stylesheet">
<style>
  *{box-sizing:border-box} html{scroll-behavior:smooth}
  body{margin:0;background:${theme.bg};color:${theme.text};font-family:${theme.bodyFont}}
  .sitewrap{container-type:inline-size}
  .sitewrap section,.sitewrap header,.sitewrap footer{container-type:inline-size}
  .sitewrap [id^="s-"]{scroll-margin-top:80px}
  a{text-decoration:none}
  img{max-width:100%} a{color:inherit}
  .exported-nav{position:fixed;bottom:14px;left:50%;transform:translateX(-50%);z-index:99;display:flex;gap:6px;background:rgba(17,23,43,.92);padding:8px 10px;border-radius:999px;font:600 12px ${theme.bodyFont};backdrop-filter:blur(6px)}
  .exported-nav a{color:#e7ecff;text-decoration:none;padding:5px 12px;border-radius:999px;background:rgba(255,255,255,.08)}
  .wb-page[hidden]{display:none}
  @media (max-width:760px){
    [style*="grid-template-columns"]{grid-template-columns:1fr !important}
  }
</style>
</head>
<body>
${body}
</body>
</html>`
}

/** poori site ko naye browser tab me kholo */
export function openInBrowser(html) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank', 'noopener')
  setTimeout(() => URL.revokeObjectURL(url), 60000)
  return win
}

export const fileNameFor = (page) =>
  page.slug === '/' || page.name.toLowerCase() === 'home'
    ? 'index.html'
    : `${page.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.html`

export function downloadHtml(name, html) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function exportProjectJson(state) {
  const data = JSON.stringify({ business: state.business, site: state.site, templateId: state.templateId }, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(state.business.name || 'website').toLowerCase().replace(/\s+/g, '-')}-project.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

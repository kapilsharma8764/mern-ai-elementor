import React from 'react'
import { WIDGETS } from './widgets'
import { sectionAnchor } from './links'
import ErrorBoundary from '../components/ErrorBoundary'

/** Renders one block with its per-block style overrides applied. */
export function BlockView({ block, theme, business, nav }) {
  const w = WIDGETS[block.type]
  if (!w) return null
  const variant = w.variants[block.variant] || Object.values(w.variants)[0]
  const st = block.style || {}
  if (st.hidden) return null

  const t = {
    ...theme,
    headingScale: (theme.headingScale ?? 1) * (st.fontScale ?? 1),
    container: st.maxWidth ? `${st.maxWidth}px` : theme.container,
  }

  const wrapStyle = {
    marginTop: st.marginTop || 0,
    marginBottom: st.marginBottom || 0,
    paddingTop: st.paddingY || 0,
    paddingBottom: st.paddingY || 0,
    background: st.bg || undefined,
    color: st.fg || undefined,
    textAlign: st.align !== 'inherit' ? st.align : undefined,
  }

  return (
    <div id={sectionAnchor(block.type)} style={{ scrollMarginTop: 80, ...wrapStyle }}>
      <ErrorBoundary compact label={`"${w.label}" section render nahi ho paya`}>
        {variant.render({ p: block.props || {}, t, biz: business, nav })}
      </ErrorBoundary>
    </div>
  )
}

/** Full site render: header + page blocks + footer */
export function SiteView({ site, theme, business, page, children, nav }) {
  return (
    <div className="sitewrap" style={{ background: theme.bg, fontFamily: theme.bodyFont, color: theme.text }}>
      <span id="top" />
      {children ? (
        children
      ) : (
        <>
          <BlockView block={site.header} theme={theme} business={business} nav={nav} />
          {page.blocks.map((b) => <BlockView key={b.id} block={b} theme={theme} business={business} nav={nav} />)}
          <BlockView block={site.footer} theme={theme} business={business} nav={nav} />
        </>
      )}
    </div>
  )
}

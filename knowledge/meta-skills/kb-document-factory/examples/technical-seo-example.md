<!-- ============================================================
     EXAMPLE: A complete cheat-sheet article at production quality.
     
     This is what a finished KB article looks like.
     Use as reference when writing new articles.
     ============================================================ -->
---
title: "Technical SEO Fundamentals"
format: cheat-sheet
layer: domain
category: "seo"
status: confirmed
confidence: high
last_verified: 2026-04-09
tags: [seo, technical, crawling, indexing, performance, structured-data]
cross_refs: [core-web-vitals, structured-data, content-strategy, nextjs-architecture]
---

# Technical SEO Fundamentals

> One-line: Core technical SEO operations — crawling, indexing, page speed, structured data, and URL management. Reference when building, auditing, or debugging search visibility.

## Crawling & Indexing

| Concept | What It Does | Implementation | Common Mistakes |
|---------|-------------|----------------|-----------------|
| robots.txt | Controls which URLs crawlers can access | Root-level file: `User-agent: * \n Disallow: /admin/` | Blocking CSS/JS files → pages render blank to Google |
| XML Sitemap | Declares all indexable URLs with priority and frequency | Auto-generate from routes, submit to Search Console | Including noindex pages, 404s, or redirect chains |
| Canonical tags | Resolves duplicate content by declaring the preferred URL | `<link rel="canonical" href="https://example.com/page">` | Self-referencing canonicals on paginated content |
| Meta robots | Per-page control over indexing and link following | `<meta name="robots" content="noindex, follow">` | Using `noindex` on pages you want ranked |
| Hreflang | Signals language/region variants to avoid duplicate content | `<link rel="alternate" hreflang="sv" href="...">` | Missing self-referencing hreflang, inconsistent x-default |
| robots meta vs X-Robots-Tag | Same function, different delivery | Meta tag in HTML head vs HTTP response header | Using both with conflicting directives |

## Page Speed & Core Web Vitals

| Metric | Target | How to Measure | How to Fix When Failing |
|--------|--------|---------------|------------------------|
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse, CrUX, PageSpeed Insights | Preload hero image, use `<link rel="preload">`, optimize server TTFB, use CDN |
| INP (Interaction to Next Paint) | < 200ms | CrUX, Web Vitals JS library | Code-split JS, defer non-critical scripts, use `requestIdleCallback`, web workers |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse, CrUX | Set explicit `width`/`height` on images/video, avoid injecting content above viewport |
| TTFB (Time to First Byte) | < 800ms | WebPageTest, `curl -o /dev/null -w "%{time_starttransfer}"` | Server caching, CDN, database query optimization, edge rendering |
| FCP (First Contentful Paint) | < 1.8s | Lighthouse | Inline critical CSS, defer non-critical CSS, minimize render-blocking resources |

## Structured Data (JSON-LD)

| Type | When to Use | Key Properties | Validation |
|------|------------|----------------|------------|
| `Article` | Blog posts, news, guides | `headline`, `datePublished`, `author`, `image` | Rich Results Test |
| `Product` | E-commerce product pages | `name`, `price`, `availability`, `review` | Rich Results Test |
| `FAQ` | FAQ sections on any page | `mainEntity` → array of `Question` + `acceptedAnswer` | Rich Results Test |
| `Organization` | Homepage, about page | `name`, `url`, `logo`, `sameAs` (social profiles) | Rich Results Test |
| `BreadcrumbList` | All pages with breadcrumb nav | `itemListElement` → ordered `ListItem` with `name` + `item` | Rich Results Test |
| `LocalBusiness` | Local businesses with physical locations | `name`, `address`, `geo`, `openingHours`, `telephone` | Rich Results Test |

**CRITICAL:** Always use JSON-LD format (not Microdata or RDFa). Place in `<head>` or end of `<body>`. Google explicitly recommends JSON-LD.

## URL Structure

| Principle | Good | Bad | Why |
|-----------|------|-----|-----|
| Descriptive slugs | `/seo/technical-guide` | `/p?id=4827` | Humans and crawlers understand content from URL |
| Consistent trailing slashes | Always `/path/` or never `/path` | Mixed | Causes duplicate content issues |
| Lowercase only | `/about-us` | `/About-Us` | Some servers treat as different URLs |
| Hyphens, not underscores | `/core-web-vitals` | `/core_web_vitals` | Google treats hyphens as word separators |
| No excessive depth | `/category/page` | `/a/b/c/d/e/page` | Crawl budget waste, diluted link equity |
| HTTPS enforced | `https://` with HSTS header | `http://` or mixed content | Ranking signal, trust, security |

## Internal Linking

| Concept | What It Does | Implementation | Common Mistakes |
|---------|-------------|----------------|-----------------|
| Anchor text | Signals topic relevance of target page | Use descriptive text: "technical SEO guide" not "click here" | Over-optimized exact-match anchors |
| Link equity flow | Distributes authority through site | Link from strong pages to important pages | Orphan pages with zero internal links |
| Breadcrumbs | Navigation hierarchy + structured data | Use `BreadcrumbList` JSON-LD + visual breadcrumbs | Inconsistent hierarchy across sections |
| Pagination | Handles multi-page content | `rel="next"` / `rel="prev"` (still useful though not required) | Noindexing paginated pages instead of using canonical |
| Hub pages | Central pages that link to all category content | Create topic hub → link to all subtopic pages | Burying important content 4+ clicks from homepage |

## Quick Reference

```
robots.txt         → root-level, controls crawl access
XML sitemap        → /sitemap.xml, auto-generated, submitted to GSC
canonical          → <link rel="canonical" href="..."> in <head>
JSON-LD            → <script type="application/ld+json"> in <head>
hreflang           → <link rel="alternate" hreflang="xx" href="...">
Core Web Vitals    → LCP < 2.5s, INP < 200ms, CLS < 0.1
HTTPS              → enforce via HSTS: Strict-Transport-Security: max-age=31536000
noindex            → <meta name="robots" content="noindex"> — removes from index
nofollow           → rel="nofollow" on link — don't pass equity
Search Console     → verify ownership → submit sitemap → monitor coverage
```

## Common Mistakes

| ❌ Don't | ✅ Instead | Why |
|----------|-----------|-----|
| Block CSS/JS in robots.txt | Allow all rendering resources | Google needs to render pages to evaluate them |
| Use JavaScript-only rendering for critical content | Server-side render or use static generation | Googlebot can render JS but it's delayed and unreliable |
| Create pages without internal links pointing to them | Ensure every page has ≥1 internal link from a crawled page | Orphan pages may never be discovered or indexed |
| Ignore Search Console coverage errors | Review weekly, fix "Excluded" and "Error" states | These reveal indexing problems before they impact rankings |
| Use meta keywords tag | Don't use it at all | Google has ignored it since 2009 — it wastes bytes |
| Assume mobile and desktop indexing are separate | Build mobile-first | Google uses mobile-first indexing — desktop version is secondary |

## Related

- [[core-web-vitals]] — Deep dive on each performance metric with optimization techniques
- [[structured-data]] — Comprehensive JSON-LD patterns for all schema types
- [[content-strategy]] — How technical SEO intersects with content planning
- [[nextjs-architecture]] — Framework-specific SEO implementation for Next.js
- Component: [[seo-foundation]] — Drop-in module for meta tags, sitemap, robots, JSON-LD
- Quality gate: [[seo-audit]] — Checklist for verifying SEO completeness

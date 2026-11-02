# TRNDZZ — Implementation Roadmap & Task Tracker

**Vision:** Multi-tenant B2B trade intelligence, verified supplier directory, and specification-driven procurement ecosystem (`trndzz.com` + `*.trndzz.com`, starting with `aluminium.trndzz.com`).

---

## Completed
- [x] Product pivot finalized: Multi-tenant B2B Trade Intelligence, Vendor Directory & RFQ Ecosystem
- [x] `docs/PRD.md` rewritten — Problem statement, 5 platform pillars, subdomain topology, Claim & Convert loop, RFQ engine, industrial design system, and 3-Horizon roadmap
- [x] `.github/copilot-instructions.md` rewritten & deduplicated — Multi-tenant `proxy.ts` rules, Server Actions contract, RBAC & vendor verification guards, folder architecture, and UI rules
- [x] `prisma/schema.prisma` rewritten & validated on Prisma 7 — Core Horizon 1 models (`Vertical`, `ValueChainStage`, `Category`, `SpecAttributeDefinition`, `User`/Better Auth, `Article`, `CommodityIndicator`, `Company`, `CompanyClaimRequest`, `Rfq`, `RfqVendorMatch`, `RfqQuote`, `ArticleCompanyMention`, `PlatformStats`)

---

## Horizon 1 — Phase 1A: Foundation & Multi-Tenant Core
- [x] Clean up legacy AI-blog & forum artifacts (`lib/googleTrends.ts` remnants, old `/posts`, `/tags`, `/topics`, `/admin/drafts` routes, unused scripts)
- [x] Run initial Prisma migration (`20261101000000_init_b2b_multitenant_ecosystem`) and build seed script (`prisma/seed.ts`) for Flagship Vertical **`aluminium.trndzz.com`**:
  - Value-chain stages: Upstream (Bauxite/Alumina/Primary Ingots), Midstream (Rolling/Coils/Extrusion Plants), Downstream (Roofing/Fenestration/Fabricators), Cross-Stream (Equipment/Coatings/Logistics)
  - Core categories & `SpecAttributeDefinition` schemas (e.g., Gauge `mm`, Alloy Grade `AA1100`/`AA3003`/`AA6063`, Temper, Surface Finish)
  - Initial `CommodityIndicator` tickers (`LME Aluminium Cash USD/MT`, `0.55mm Stucco Coil Lagos ₦/MT`, `USD/NGN FX`)
  - Sample pre-seeded `UNCLAIMED` & `VERIFIED` aluminium suppliers + live RFQs
- [x] Implement `proxy.ts` subdomain router (`trndzz.com` / `localhost:3000` → `(macro)` vs `aluminium.trndzz.com` / `aluminium.localhost:3000` → `/vertical/[verticalSlug]`)
- [x] Configure `better-auth` with Prisma adapter, cross-subdomain cookies (`.trndzz.com`), email/password auth, and server-side RBAC helpers (`SUPER_ADMIN`, `EDITOR`, `ANALYST`, `USER` + `CompanyMember` guards)
- [x] Implement industrial design tokens in `app/globals.css` (`Plus Jakarta Sans`, `Inter`, `JetBrains Mono` with `tabular-nums`, Cobalt/Amber/Emerald/Obsidian palette, dynamic `--vertical-accent`) + Macro & Vertical Portal shells verified via `pnpm build`

---

## Horizon 1 — Phase 1B: The 4 Core Loop Engines (`aluminium.trndzz.com` + `trndzz.com`)

### 1. Trndzz Pulse (Value-Chain News & Commodity Price Trackers)
- [x] Build `lib/services/article.service.ts` & `lib/services/commodity.service.ts` + Zod validators & Server Actions
- [x] Build Commodity Price Ticker Bar (sticky/top strip showing LME & regional `₦` benchmarks with % change) and `/prices` historical chart page (`Recharts`)
- [x] Build Vertical Pulse pages (`/pulse`, `/pulse/stage/[stageSlug]`, `/pulse/[articleSlug]`) + Macro Hub (`trndzz.com`) cross-sector aggregation (`/news`, `/news/[slug]`)
- [x] Build Admin Pulse CMS (`/admin/pulse`, `/admin/prices`) with value-chain tagging and `ArticleCompanyMention` picker

### 2. Verified B2B Supplier Directory & "Claim & Convert" Loop
- [x] Build `lib/services/company.service.ts` & `lib/services/claim.service.ts` + Server Actions
- [x] Build `/directory` search & multi-facet filtering (`BusinessRole`, `StreamPosition`, `Category`, `headquartersState` / `coverageStates`, `VerificationTier`)
- [x] Build `/directory/[companySlug]` profile page (capabilities, SON/MANCAP/ISO certifications, products, and conditional *"Claim This Business"* banner for `UNCLAIMED` listings)
- [x] Build `/directory/[companySlug]/claim` verification submission form (work email, phone, job title, CAC `RC Number`, document proof URL)
- [x] Build Admin Directory Seeder & Claim Verification Queue (`/admin/directory`, `/admin/claims`) transitioning profiles `UNCLAIMED → CLAIMED` + `VERIFIED`

### 3. Structured RFQ Broadcasting & Procurement Engine (*Trndzz Biz* Core)
- [x] Build `lib/services/rfq.service.ts` — dynamic Zod spec validation against `SpecAttributeDefinition`, reference code generator (`RFQ-ALU-YYYY-NNNNN`), and automated supplier matching (`RfqVendorMatch`)
- [x] Build `/rfq/new` specification-driven RFQ submission form & `/rfq` + `/rfq/[referenceNumber]` public tender board & supplier quoting engine
- [x] Implement RFQ notification triggers (instant quote workflow for `CLAIMED`/`VERIFIED` suppliers; *"Claim & Verify"* matched RFQ teaser count for matched `UNCLAIMED` directory companies)
- [x] Build Buyer Dashboard (`/dashboard/rfqs`) with side-by-side standardized `RfqQuote` comparison matrix & award workflow
- [x] Build Vendor Workspace (`/dashboard/quotes`, `/dashboard/company`, `/dashboard/claims`) for profile management, product listings, and submitting quotes

### 4. Contextual Cross-Linking & SEO Infrastructure
- [x] Build inline/sidebar Contextual Commerce Widgets on `/pulse/[articleSlug]` & `/directory/[companySlug]`: dynamically render mentioned/category-matched Verified Suppliers + **1-Click Contextual RFQ Drawer** pre-populated with `categoryId` and `sourceArticleId` / `targetCompanyId`
- [x] Add JSON-LD structured data (`NewsArticle`, `Organization`, `Product`, `BreadcrumbList`), dynamic vertical sitemaps, `robots.ts`, and `PlatformStats` social proof bar

---

## Horizon 1 — Phase 2: Storefronts, *Trndzz Learn* & Verticals #2–#3
- [ ] Expand *Trndzz Biz* `/products` into full multi-vendor specification-searchable storefronts with datasheet downloads & multi-item RFQ cart
- [ ] Add *Trndzz Learn* Prisma models (`KnowledgeResource`, `ResourceLead`) and build `/learn` gated whitepapers, quarterly sector outlook reports & B2B lead capture
- [ ] Build Ecosystem Semantic Search (`/search` powered by OpenAI embeddings across articles, suppliers, products & public RFQs)
- [ ] Provision Verticals #2 and #3 (`steel.trndzz.com` and `solar.trndzz.com`) via `/admin/verticals` with zero codebase overhead

---

## Horizon 2 & 3 — Scale, Monetization & Transactional Trade (Future)
- [ ] Automated Vendor SaaS billing (`VERIFIED_PRO` & `ENTERPRISE_SPONSOR` tiers via Paystack/Flutterwave) + vendor lead/impression analytics
- [ ] Assisted Trade concierge desk & analyst-verified high-value RFQ workflows
- [ ] Data & Intelligence Subscriptions (state-by-state wholesale price indices & supply-demand heatmaps)
- [ ] Transactional B2B rails: escrow payments, invoice financing partnerships, third-party inspection booking, and logistics tracking

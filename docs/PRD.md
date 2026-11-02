# Product Requirements Document (PRD)

## Project: **TRNDZZ** (`trndzz.com`)
**Classification:** Multi-Tenant B2B Trade Intelligence, Vendor Directory & Procurement Ecosystem  
**Flagship Vertical:** `aluminium.trndzz.com` (followed by `steel.trndzz.com`, `solar.trndzz.com`)  
**Primary Market:** Nigeria & West Africa, scaling pan-African & across emerging industrial corridors

---

## 1. Comprehensive Problem Statement

### The Core Friction
Across emerging and high-growth markets—particularly in West Africa and the broader African continent—industrial supply chains (Aluminium, Steel, Solar, Agribusiness, and Construction Materials) operate in severe information silos. Industry participants face four interconnected structural problems:

1. **Fragmented Supplier Discovery & Trust Deficit:**  
   Procurement managers, real estate developers, EPCs, and contractors struggle to locate vetted, specification-compliant suppliers. Searching for an aluminium coil importer, extrusion plant, or roofing contractor relies on word-of-mouth, outdated generic directories, or unverified social media pages. General B2B directories treat all vendors as interchangeable, failing to distinguish between **upstream** raw material importers, **midstream** processors/extruders, and **downstream** fabricators/installers.
2. **Disconnect Between Market Intelligence and Procurement:**  
   Industry news, commodity price shifts (e.g., LME aluminium fluctuations, NGN/USD FX rates, ECOWAS/CET import tariffs), and regulatory updates (e.g., SON/MANCAP standards) live on generic news websites completely detached from vendor registries. When a buyer reads about a price shift or building code update, there is no immediate pathway to request quotes from verified suppliers meeting that standard.
3. **Inefficient, Manual RFQ Processes:**  
   B2B sourcing remains dominated by cold calls, fragmented WhatsApp chats, and unstructured emails. Buyers cannot broadcast a structured **Request for Quotation (RFQ)** with strict technical parameters (e.g., `0.55mm` gauge, stucco-embossed finish, `AA3003` alloy, `25 MT`, delivered to Lagos) to multiple pre-qualified vendors simultaneously and compare standardized quotes.
4. **High Digital Customer Acquisition Costs for Legitimate Manufacturers:**  
   Authentic manufacturers, extruders, fabricators, and industrial equipment providers lack dedicated, high-intent digital trade portals to showcase technical capabilities, SON/ISO certifications, annual production capacities, and specification-indexed catalogs to serious commercial buyers.

---

## 2. Product Overview & Multi-Tenant Architecture

### Executive Summary
**Trndzz (`trndzz.com`)** is a multi-industry B2B digital ecosystem and trade portal engine built on a single Next.js + PostgreSQL multi-tenant codebase:

- **Macro Hub (`trndzz.com`):** Cross-sector business intelligence aggregator showcasing macro industrial developments, cross-industry commodity & FX trackers, featured verified manufacturers, and live procurement activity across all verticals.
- **Vertical Portals (`*.trndzz.com`):** Each subdomain (`aluminium.trndzz.com`, `steel.trndzz.com`, `solar.trndzz.com`) operates as a deep, standalone vertical trade hub modeled after the value-chain depth of platforms like **AL Circle**, tailored to regional procurement realities.

Launching a new vertical requires **zero codebase duplication**—creating and activating a `Vertical` record with its `ValueChainStage`s, `Category` taxonomy, `SpecAttributeDefinition` schemas, and `CommodityIndicator` tickers automatically provisions `[slug].trndzz.com` via `proxy.ts` subdomain routing.

---

## 3. Core Platform Pillars

Every vertical on Trndzz integrates five core engines into one unified experience (with **Horizon 1 Phase 1** delivering the Core Loop across Pillars 1, 2, 3, and 5, and **Phase 2** expanding Pillar 3 storefronts and Pillar 4 gated intelligence):

### Pillar 1: Value-Chain News & Editorial Engine (*Trndzz Pulse*)
- Daily sector-specific journalism, commodity price trackers, tariff/regulatory analysis, and executive interviews.
- Strictly organized by **Value-Chain Stage**:
  - **Upstream:** Raw material extraction & primary imports (e.g., Bauxite, Alumina, Primary Ingots).
  - **Midstream:** Smelting, billets, rolling mills, coil coating, extrusion plants.
  - **Downstream:** Roofing sheets, architectural extrusions, curtain walls, fenestration, installation.
  - **Cross-Stream:** Machinery, anodizing/powder-coating chemicals, testing, logistics, trade finance.
- **Commodity & Regional Price Trackers:** Live/curated tickers tracking global benchmarks (e.g., LME Aluminium Cash in `USD/MT`) alongside regional wholesale/ex-factory benchmarks (e.g., `0.55mm` Stucco Coil in `₦/MT` or `₦/sqm`).

### Pillar 2: Verified B2B Supplier Directory & "Claim & Convert" Engine
- Deeply indexed, filterable registry of industrial businesses mapped by:
  - **Business Role:** `MANUFACTURER`, `IMPORTER`, `PROCESSOR_EXTRUDER`, `DISTRIBUTOR`, `FABRICATOR_INSTALLER`, `EQUIPMENT_SUPPLIER`, `SERVICE_PROVIDER`.
  - **Value-Chain Stream Position:** Upstream, Midstream, Downstream, Cross-Stream.
  - **Geography:** Headquarters state/country + active supply coverage states across Nigeria & West Africa.
  - **Operational Proof:** Production capacity, year established, CAC (`RC Number`), and verified certifications (`SON MANCAP`, `ISO 9001`, etc.).
- **"Claim & Convert" Onboarding Loop:** Editorial/research analysts pre-seed 500+ legitimate companies as `UNCLAIMED` profiles. Profiles surface prominent *"Claim This Business"* CTAs and receive masked teaser notifications when buyers broadcast matching RFQs—converting passive directory entries into active `CLAIMED` and `VERIFIED` vendor accounts.

### Pillar 3: Specification-Driven B2B Marketplace & RFQ Engine (*Trndzz Biz*)
- **Structured Technical Specifications:** Each vertical and category defines machine-readable `SpecAttributeDefinition` rules (e.g., Alloy Grade, Gauge/Thickness in `mm`, Temper, Coating/Finish, Width).
- **Central RFQ Broadcasting System (Phase 1 Core):** Buyers submit a structured RFQ once; Trndzz validates technical specs, matches pre-qualified suppliers by vertical, category, business role, and delivery state, notifies verified vendors, and collects apples-to-apples `RfqQuote` proposals (unit price, total price, lead time in days, MOQ, payment terms, validity, proforma/MTC attachment).
- **Vendor Product Catalogs (Phase 1 Foundation → Phase 2 Full Storefronts):** Claimed suppliers list industrial products with structured JSON specifications, MOQs, datasheets, and indicative price bands.

### Pillar 4: Knowledge Hub & Market Intelligence (*Trndzz Learn* — Phase 2)
- Gated industry whitepapers, quarterly sector outlook reports, SON/import regulatory guides, digital trade magazines, and technical webinars.
- Captures high-intent commercial leads (capturing buyer role, company, project timeline, and procurement volume before unlocking downloads).

### Pillar 5: Contextual Cross-Linking Architecture
- Relational tissue connecting editorial intelligence directly to B2B commerce:
  - Articles tag specific `Category` taxonomies and `ArticleCompanyMention` records.
  - Reading an article on *"SON Enforcement on 0.45mm–0.55mm Roofing Coils"* dynamically renders **Verified Manufacturers & Importers** for Aluminium Coils alongside a **1-Click Contextual RFQ Drawer** pre-populated with the article's category, vertical, and attribution (`sourceArticleId`).

---

## 4. Multi-Tenant Subdomain & URL Topology

Subdomain resolution is handled in Next.js 16 via `proxy.ts` (never `middleware.ts`), supporting `*.trndzz.com` in production and `*.localhost:3000` in local development, with cross-subdomain session cookies (`domain: .trndzz.com`).

### 4.1 Macro Hub (`trndzz.com`)
```text
/                              → Cross-sector intelligence hub, commodity bar, vertical portals grid, live RFQ ticker
/news                          → Cross-industry featured editorial feed
/news/[slug]                   → Macro cross-sector article
/verticals                     → Directory of all active & upcoming *.trndzz.com industrial portals
/search                        → Ecosystem-wide semantic & structured search (articles, suppliers, products, RFQs)
/auth/login | /auth/register   → Unified single sign-on across all *.trndzz.com subdomains
/dashboard                     → Buyer & Vendor workspace (RFQs, Quotes, Company Profile, Team, Claims)
/admin                         → Super-Admin & Editorial command center (Verticals, Pulse, Directory, Claims, RFQs)
/about | /contact | /advertise → Corporate, sponsorship & legal pages (/privacy, /terms)
```

### 4.2 Vertical Portal (`[vertical].trndzz.com`, e.g., `aluminium.trndzz.com`)
Rewritten internally by `proxy.ts` to `/vertical/[verticalSlug]/...`:
```text
/                              → Vertical home: commodity price bar, Upstream/Midstream/Downstream Pulse, featured verified suppliers, recent RFQs
/pulse                         → All vertical news & analysis (filterable by stream stage & article type)
/pulse/stage/[stageSlug]       → Value-chain stage hub (e.g., /pulse/stage/downstream)
/pulse/[articleSlug]           → Vertical article + contextual verified suppliers + 1-click RFQ CTA
/prices                        → Vertical commodity & regional price tracker with historical charts
/directory                     → Verified B2B Supplier Directory (filter by role, stream, category, state, tier)
/directory/[companySlug]       → Vendor storefront/profile: capabilities, certs, products, "Claim" or "Request Quote"
/directory/[companySlug]/claim → Guided "Claim & Convert" verification submission flow
/rfq                           → Public Live RFQ Tender Board (filterable by category & delivery state)
/rfq/new                       → Structured specification-driven RFQ submission form (pre-fillable from articles/profiles)
/rfq/[referenceNumber]         → Public RFQ summary & Vendor Quote submission portal
/products                      → Specification-filtered industrial product catalog (Trndzz Biz)
/learn                         → Gated whitepapers, sector reports & regulatory guides (Phase 2)
```

---

## 5. Roles, Permissions & Verification Tiers

### 5.1 Platform Roles (`User.role`)
| Role | Capabilities |
|---|---|
| `SUPER_ADMIN` | Full platform control: launch/configure verticals, manage taxonomy/specs, approve claims, vet RFQs, manage users & roles |
| `EDITOR` | Create/publish `Trndzz Pulse` articles, seed `UNCLAIMED` directory companies, link companies to articles |
| `ANALYST` | Update `CommodityIndicator` prices, review/verify `CompanyClaimRequest`s, validate & match `Rfq` submissions |
| `USER` | Submit RFQs as a buyer, claim a company, or act within an assigned `Company` workspace |

### 5.2 Vendor Workspace Roles (`CompanyMember.role`)
| Role | Capabilities |
|---|---|
| `OWNER` | Full control of company profile, certifications, team members, billing/tier, products, and RFQ quotes |
| `ADMIN` | Edit company profile, manage product catalog, view matched RFQs, submit/withdraw quotes |
| `SALES_REP` | View matched RFQs and submit `RfqQuote` responses on behalf of the company |

### 5.3 Supplier Verification Tiers (`Company.verificationTier`)
| Tier | Badge | How Earned / Monetized | Capabilities |
|---|---|---|---|
| `UNVERIFIED` | Neutral Gray | Pre-seeded (`UNCLAIMED`) or newly claimed pending docs | Basic directory listing; receives masked RFQ claim teasers |
| `VERIFIED` | Emerald Check | CAC (`RC Number`) + work email/domain + operational proof vetted | Verified trust badge, eligible to quote on `VERIFIED_VENDORS_ONLY` RFQs, contextual article mentions |
| `VERIFIED_PRO` | Cobalt + Gold | Horizon 2 recurring SaaS subscription | Priority directory ranking, instant RFQ WhatsApp/email alerts, full product catalog, lead analytics |
| `ENTERPRISE_SPONSOR` | Amber Crown | Annual enterprise contract | Category sponsorship banners, featured homepage placement, whitepaper co-branding, dedicated account support |

---

## 6. Core Operational Workflows

### 6.1 The "Claim & Convert" Vendor Loop
```text
Analyst seeds Company (claimStatus: UNCLAIMED)
        │
        ▼
Profile ranks on Google & surfaces in Pulse articles + RFQ matches
        │
        ▼
Buyer submits RFQ in matching Category/State
        │
        ▼
System creates RfqVendorMatch → sends masked RFQ teaser to company's public email
        │
        ▼
Company executive clicks "Claim Profile to View & Quote" → submits CompanyClaimRequest (CAC + work email)
        │
        ▼
Admin/Analyst approves → Company becomes CLAIMED + VERIFIED, requester becomes OWNER, unlocks full RFQ quoting
```

### 6.2 Structured RFQ Broadcast & Matching Engine
```text
Buyer submits RFQ (/rfq/new) with Category + Zod-validated technical specs + Quantity + Delivery State
        │
        ▼
System generates Reference (e.g., RFQ-ALU-2026-00042) & validates specs against SpecAttributeDefinition
        │
        ▼
Auto-matching queries Companies in Vertical + Category (+ preferred BusinessRole & coverageStates)
        │
        ├─► CLAIMED & VERIFIED vendors: Instant dashboard + email notification → submit structured RfqQuote
        └─► UNCLAIMED pre-seeded vendors: Masked lead alert prompting profile claim
        │
        ▼
Buyer compares standardized quotes side-by-side (₦/unit, lead time, MOQ, payment terms, certs) → Awards quote
```

---

## 7. Core Horizon 1 Data Architecture

Implemented in `prisma/schema.prisma` (Prisma 7 + PostgreSQL):

- **Identity (`better-auth`):** `User`, `Session`, `Account`, `Verification`
- **Multi-Tenant Taxonomy:** `Vertical`, `ValueChainStage`, `Category`, `SpecAttributeDefinition`
- **Pillar 1 (*Trndzz Pulse*):** `Article`, `CommodityIndicator`, `CommodityPricePoint`
- **Pillar 2 (*Supplier Directory*):** `Company`, `CompanyVertical`, `CompanyCategory`, `CompanyCertification`, `CompanyMember`, `CompanyClaimRequest`, `CompanyProduct`
- **Pillar 3 (*RFQ Engine*):** `Rfq`, `RfqVendorMatch`, `RfqQuote`
- **Pillar 5 (*Cross-Linking*):** `ArticleCompanyMention` + `Rfq.sourceArticleId`
- **Social Proof Cache:** `PlatformStats` (active verticals, indexed companies, verified suppliers, open RFQs, monthly readers)

> **Phase 2 Schema Expansion (Planned):** `KnowledgeResource` and `ResourceDownloadLead` for *Trndzz Learn* gated whitepapers, plus `VendorSubscription` and `PriceIndexSeries` for Horizon 2 SaaS & data monetization.

---

## 8. Design System & UX Principles

### Design Philosophy
Trndzz combines the editorial authority of **Bloomberg / AL Circle** with the structured specification clarity of **Thomasnet**. Every screen must convey **institutional trust, data precision, and low-bandwidth speed** for both corporate procurement desks and on-site engineers on mobile networks across West Africa.

### Color System
| Token | Light | Dark | Usage |
|---|---|---|---|
| `--primary` | `#1D4ED8` | `#3B82F6` | Primary actions, active states, links (Macro Signal Cobalt) |
| `--vertical-accent` | Dynamic | Dynamic | Overridden per vertical (`#0284C7` Aluminium, `#4F46E5` Steel, `#D97706` Solar) |
| `--accent-amber` | `#D97706` | `#F59E0B` | Primary RFQ CTAs, Enterprise Sponsor badges, Claim banners |
| `--verified` | `#059669` | `#10B981` | Verified supplier badges, positive price ticks, awarded RFQs |
| `--danger` | `#DC2626` | `#EF4444` | Negative price ticks, rejected claims, validation errors |
| `--bg` | `#F8FAFC` | `#0B0F19` | Page canvas (clean industrial slate in light; deep obsidian in dark) |
| `--bg-card` | `#FFFFFF` | `#111827` | Directory cards, RFQ rows, price ticker cards |
| `--border` | `#E2E8F0` | `#1F2937` | High-clarity tabular borders and card dividers |

### Typography
- **Headlines & Portal Mastheads:** `Plus Jakarta Sans` (`700`, `800`) via `next/font`
- **Body, Directory & Forms:** `Inter` (`400`, `500`, `600`) via `next/font`
- **Prices, Specs & Reference Codes:** `JetBrains Mono` (`500`) — mandatory `tabular-nums` for commodity tickers (`₦`, `$`), gauges (`0.55mm`), alloys (`AA3003`), capacities, and RFQ IDs

### Currency & Localization Standards
- **Default commercial currency:** Nigerian Naira (`₦` / `NGN`) for local RFQs, quotes, and regional market surveys.
- **Global exchange benchmarks:** Explicit currency labels (`USD/MT`) permitted where international indices (e.g., LME Aluminium) are displayed alongside local `₦` benchmarks.

---

## 9. SEO & Contextual Growth Strategy

1. **Subdomain Topical Authority:** Search engines treat `aluminium.trndzz.com` as a dedicated sector authority while root `trndzz.com` aggregates domain equity.
2. **Programmatic B2B Long-Tail Pages:** Filterable, crawlable landing paths for high-intent commercial queries (e.g., *"Verified Aluminium Coil Importers in Lagos"*, *"0.55mm Stucco Aluminium Sheet Price Nigeria"*).
3. **Structured Data (JSON-LD):**
   - `NewsArticle` on *Trndzz Pulse* stories
   - `Organization` / `LocalBusiness` on *Supplier Directory* profiles
   - `Product` on *CompanyProduct* specifications
   - `BreadcrumbList` across all vertical value-chain hierarchies
4. **Zero AI Slop:** Editorial content is human-curated/authored trade journalism; AI (`OpenAI`) is strictly reserved for structured semantic search, entity extraction suggestions, and RFQ spec normalization—never auto-generated spam articles.

---

## 10. Phased Strategic Roadmap

### Horizon 1: Vertical Validation & Directory Density (Months 1–12)
- **Phase 1A — Foundation & Core Loop (Current Build):**
  - Multi-tenant `proxy.ts` subdomain routing (`trndzz.com` + `aluminium.trndzz.com`)
  - Cross-subdomain auth (`better-auth`) + Buyer/Vendor/Admin RBAC
  - *Trndzz Pulse*: Value-chain news engine + Commodity Price Tracker (`LME` + regional `₦` benchmarks)
  - *Verified Supplier Directory*: Role/stage/state filtering + pre-seeded `UNCLAIMED` profiles + **Claim & Convert** verification workflow
  - *Structured RFQ Engine*: Dynamic spec-driven RFQ submission, vendor matching, and standardized `RfqQuote` comparison
  - *Contextual Cross-Linking*: Mentioned verified suppliers + 1-click pre-filled RFQ drawer embedded inside Pulse articles
- **Phase 1B — Storefronts, Knowledge Hub & Verticals #2–#3:**
  - *Trndzz Biz*: Full specification-searchable multi-vendor product catalog & datasheets
  - *Trndzz Learn*: Gated industry whitepapers, SON regulatory guides & B2B lead capture
  - Replicate multi-tenant configuration to launch `steel.trndzz.com` and `solar.trndzz.com` with zero codebase changes

### Horizon 2: Marketplace Liquidity & Monetization Scale (Years 1–3)
- **Recurring Vendor SaaS Tiers:** Automated billing (Paystack/Flutterwave) for `VERIFIED_PRO` and `ENTERPRISE_SPONSOR` memberships, priority placement, instant WhatsApp/email RFQ alerts, and vendor impression/lead analytics.
- **Assisted Trade & Lead Intermediation:** Analyst-vetted high-value RFQs, specification verification, and concierge supplier matching.
- **Data & Intelligence Subscriptions:** Paid regional price indices (state-by-state wholesale coil/roofing/rebar/panel pricing), supply-demand heatmaps, and downloadable annual directories.

### Horizon 3: Transactional B2B Infrastructure (Years 3–5+)
- **End-to-End Digital Trade Execution:** Escrow payment rails, B2B invoice financing/credit partnerships, third-party quality/SGS/SON inspection booking, and haulage/logistics tracking integrated directly into the RFQ award workflow.
- **Pan-African & Global Trade Corridor:** Cross-border sourcing connecting West/East/Southern African downstream fabricators and EPCs with global upstream/midstream producers across 20+ industrial verticals.

---

## 11. Horizon 1 Launch & 90-Day Success Metrics

- **Directory Density:** 500+ profiled aluminium & roofing value-chain businesses indexed on `aluminium.trndzz.com`
- **Claim & Convert Rate:** ≥ 15% of pre-seeded profiles claimed and verified within 90 days of receiving RFQ match alerts
- **Procurement Liquidity:** Measurable weekly buyer RFQs receiving ≥ 3 comparable quotes from verified suppliers within 48 hours
- **Editorial-to-RFQ Conversion:** ≥ 3% click-through from *Trndzz Pulse* articles into supplier profiles or contextual RFQ forms
- **Zero-Overhead Multi-Tenancy:** Provisioning `steel.trndzz.com` and `solar.trndzz.com` purely via Admin configuration with zero code deployments

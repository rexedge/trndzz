# TRNDZZ – Engineering, Multi-Tenancy & UI Guidelines

**Project:** TRNDZZ (`trndzz.com` & `*.trndzz.com`) — Multi-Tenant B2B Trade Intelligence, Vendor Directory & Procurement Ecosystem  
**Stack:** Next.js 16 (App Router) + Server Actions + Prisma 7 + PostgreSQL + Better Auth + Tailwind CSS v4 + shadcn/ui

This document defines **mandatory engineering, multi-tenant, security, and UI/UX rules** for TRNDZZ. These rules are **non-negotiable**.

---

## 0. Platform Overview

**TRNDZZ** organizes fragmented African & emerging-market industrial supply chains into deep vertical B2B trade portals on a single multi-tenant codebase:

- **Macro Hub (`trndzz.com`):** Cross-sector trade intelligence aggregator, macro commodity/FX bar, vertical portal directory, unified authentication, `/dashboard` workspace, and `/admin` command center.
- **Vertical Portals (`[vertical].trndzz.com`, e.g., `aluminium.trndzz.com`, `steel.trndzz.com`, `solar.trndzz.com`):** Standalone sector ecosystems integrating five pillars:
  1. **Trndzz Pulse:** Value-chain journalism (`UPSTREAM`, `MIDSTREAM`, `DOWNSTREAM`, `CROSS_STREAM`) + Commodity & Regional Price Trackers.
  2. **Verified Supplier Directory:** Indexed companies mapped by `BusinessRole`, geography, capacity, certifications, and the **"Claim & Convert"** onboarding loop (`UNCLAIMED → CLAIM_PENDING → CLAIMED`).
  3. **Trndzz Biz (Marketplace & RFQ Engine):** Dynamic `SpecAttributeDefinition` schemas, structured buyer RFQ broadcasting, vendor matching (`RfqVendorMatch`), and comparable supplier quoting (`RfqQuote`).
  4. **Trndzz Learn (Phase 2):** Gated whitepapers, regulatory guides, and sector reports for B2B lead capture.
  5. **Contextual Cross-Linking:** Relational links (`ArticleCompanyMention`, category/spec bindings, `Rfq.sourceArticleId`) connecting editorial content directly to verified vendors and 1-click RFQ forms.

**What TRNDZZ is NOT:**
- Not an AI auto-blog or content farm (AI is strictly for semantic search & spec/entity assistance, never article generation)
- Not a generic consumer social forum or Nairaland-style gossip board
- Not separate codebases per industry vertical (zero codebase duplication across `*.trndzz.com`)

---

## 1. Core Engineering Principles

- **Multi-tenant by configuration, not code duplication** — adding a vertical in Admin immediately provisions `[slug].trndzz.com`
- **Mobile-first & low-bandwidth resilient** — engineered for both corporate procurement desks and field engineers on mobile networks across West Africa
- **Server-first architecture** — React Server Components by default; minimal client JavaScript
- **Strict domain isolation** — business logic and Prisma queries live exclusively in `lib/services/*.service.ts`
- **Production-grade safety** — strict Zod validation, server-enforced RBAC, zero uncaught exceptions in Server Actions

---

## 2. Multi-Tenant Subdomain Routing (`proxy.ts`)

1. **Use `proxy.ts` exclusively** at the project root (Next.js 16 convention). **NEVER** create or use `middleware.ts`.
2. **Host & Subdomain Resolution Rules in `proxy.ts`:**
   - Root macro hosts (`trndzz.com`, `www.trndzz.com`, `localhost:3000`) serve macro routes (`app/(macro)/...`) plus shared routes (`/auth`, `/dashboard`, `/admin`, `/api`).
   - Vertical subdomains (`[slug].trndzz.com` in production, `[slug].localhost:3000` locally) rewrite cleanly to `/vertical/[verticalSlug]/...`.
   - Shared `/auth`, `/dashboard`, and `/api` paths remain accessible or redirect cleanly to canonical auth endpoints with cross-subdomain cookies (`domain: .trndzz.com` in production).
3. **Tenant Validation:**
   - `app/vertical/[verticalSlug]/layout.tsx` MUST resolve the active `Vertical` via cached `vertical.service.ts` and invoke `notFound()` if the slug does not exist or is not `ACTIVE` (unless previewed by `SUPER_ADMIN` / `EDITOR`).
   - Every vertical database query MUST explicitly filter by `verticalId`. Never leak records across verticals unless explicitly rendering the macro hub (`trndzz.com`).

---

## 3. Next.js 16 App Router & Components

- Use **Next.js App Router only** (`/app`). Do **NOT** use `/pages`.
- **Server Components by default.** Only add `"use client"` to leaf interactive components (forms, filter drawers, quote comparison tables, Recharts price charts).
- Always `await params` and `await searchParams` in Server Components and Route Handlers.
- Do **NOT** fetch data inside Client Components (no `useEffect` data fetching, no React Query, no SWR). Pass server-fetched data down as serializable props or trigger Server Actions.

---

## 4. Server Actions (Strict Contract)

All mutations MUST use **Server Actions** inside `app/actions/` and adhere to every rule below:

1. Start file with `'use server';`
2. Validate all inputs with **Zod** schemas from `lib/validators/` (including dynamic technical specification validation against `SpecAttributeDefinition` where applicable).
3. **Never throw unhandled errors** to the client. Catch all operational/database errors and log securely on the server.
4. Always return a typed `ActionResponse<T>`:
   ```ts
   export type ActionResponse<T = undefined> = {
     success: boolean;
     message: string;
     data?: T;
     errors?: Record<string, string[]>;
   };
   ```
5. Enforce **server-side authentication & authorization** before executing any service call:
   - Platform admin actions: verify `User.role` (`SUPER_ADMIN`, `EDITOR`, `ANALYST`).
   - Vendor actions (editing company profile, managing products, submitting `RfqQuote`): verify active `CompanyMember` record (`OWNER`, `ADMIN`, `SALES_REP`) AND `Company.claimStatus === 'CLAIMED'`.
   - Quoting on `VERIFIED_VENDORS_ONLY` RFQs: verify `Company.verificationTier !== 'UNVERIFIED'`.
6. Never trust `userId`, `companyId`, `role`, or `verificationTier` passed from client form fields without verifying ownership on the server.

---

## 5. Folder Structure (Mandatory)

```text
proxy.ts                              # Next.js 16 subdomain router (trndzz.com vs *.trndzz.com)
app/
  ├── actions/                        # Server Actions (mutations only)
  │   ├── auth.actions.ts
  │   ├── vertical.actions.ts         # Super-admin vertical, stage, category & spec CRUD
  │   ├── article.actions.ts          # Trndzz Pulse publishing & company cross-linking
  │   ├── commodity.actions.ts        # Price indicator & data point updates
  │   ├── company.actions.ts          # Directory seeding, vendor profile & product management
  │   ├── claim.actions.ts            # "Claim & Convert" submission & admin verification
  │   └── rfq.actions.ts              # Buyer RFQ submission, matching & supplier quoting
  ├── (macro)/                        # Root domain (trndzz.com) pages
  │   ├── page.tsx                    # Macro cross-sector intelligence hub
  │   ├── news/                       # Cross-sector editorial feed & article pages
  │   ├── verticals/                  # All industry portals directory
  │   ├── search/                     # Ecosystem semantic & structured search
  │   └── (legal)/                    # about, contact, advertise, privacy, terms
  ├── vertical/[verticalSlug]/        # Rewritten target for *.trndzz.com subdomains
  │   ├── layout.tsx                  # Resolves Vertical tenant, injects accent CSS vars & nav
  │   ├── page.tsx                    # Vertical home (Price bar + Pulse + Directory + Live RFQs)
  │   ├── pulse/                      # News feed, /stage/[stageSlug], /[articleSlug]
  │   ├── prices/                     # Commodity & regional price trackers
  │   ├── directory/                  # Supplier registry, /[companySlug], /[companySlug]/claim
  │   ├── rfq/                        # Live RFQ board, /new, /[referenceNumber]
  │   └── products/                   # Specification-filtered product catalog
  ├── auth/                           # Unified login, register, verify-email
  ├── dashboard/                      # Authenticated Buyer & Vendor workspace
  │   ├── page.tsx                    # Overview
  │   ├── rfqs/                       # Buyer's submitted RFQs & quote comparison matrix
  │   ├── quotes/                     # Supplier's matched RFQs & submitted quotes
  │   ├── company/                    # Claimed company profile, certs, products, team
  │   └── claims/                     # Track pending CompanyClaimRequests
  ├── admin/                          # Platform Super-Admin, Editor & Analyst console
  │   ├── page.tsx                    # Ecosystem KPIs
  │   ├── verticals/                  # Manage verticals, stages, categories, spec schemas
  │   ├── pulse/                      # Editorial CMS & contextual company mentions
  │   ├── prices/                     # Commodity ticker updates
  │   ├── directory/                  # Seed companies & manage verification tiers
  │   ├── claims/                     # Review & approve/reject Claim & Convert requests
  │   └── rfqs/                       # Vet buyer RFQs & monitor vendor match liquidity
  ├── api/                            # Auth handlers, webhooks & cron routes only
  ├── loading.tsx
  ├── error.tsx
  └── not-found.tsx

components/
  ├── macro/                          # Macro hub components
  ├── vertical/                       # Vertical shell, masthead, stream navigation
  ├── pulse/                          # Article cards, value-chain badges, commodity ticker bar
  ├── directory/                      # Supplier cards, role/tier badges, claim CTA banners
  ├── rfq/                            # Dynamic spec form, RFQ cards, quote comparison table
  ├── cross-link/                     # Contextual supplier cards & 1-click inline RFQ drawer
  ├── dashboard/                      # Buyer/Vendor workspace components
  ├── admin/                          # Admin console tables & editors
  ├── ui/                             # shadcn/ui primitives
  └── providers/                      # Theme & PostHog providers

lib/
  ├── auth/                           # Better Auth server & cross-subdomain session helpers
  ├── http/                           # Centralized axios client (never use raw fetch)
  ├── prisma/                         # Prisma 7 singleton client
  ├── tenancy/                        # Hostname parsing & vertical tenant resolution helpers
  ├── validators/                     # Zod schemas (static + dynamic spec validators)
  ├── services/                       # Server-only domain services (all Prisma access here)
  │   ├── vertical.service.ts
  │   ├── article.service.ts
  │   ├── commodity.service.ts
  │   ├── company.service.ts
  │   ├── claim.service.ts
  │   ├── rfq.service.ts
  │   ├── search.service.ts
  │   └── stats.service.ts
  └── utils/

store/
  └── useRfqDraftStore.ts             # Zustand store (client UI state only)
```

---

## 6. Database, Money & Technical Spec Rules

- **Prisma 7 only** (`prisma/schema.prisma` + `prisma.config.ts`). Keep all Prisma queries inside `lib/services/` (`import 'server-only'`).
- **Decimal Precision:** Never use JavaScript `number` floats for prices or quantities in persistence. Map Prisma `Decimal` cleanly to formatted strings/numbers at serialization boundaries before passing to Client Components.
- **Currency & Units:**
  - Default commercial currency is **Nigerian Naira (`₦` / `NGN`)**.
  - International commodity benchmarks (e.g., LME Aluminium) must explicitly store and render their currency code (`USD/MT` vs `₦/MT`).
- **Dynamic Specifications (`Json`):**
  - `CompanyProduct.specifications` and `Rfq.specifications` MUST be validated server-side against the active `SpecAttributeDefinition` records for that `verticalId` + `categoryId`.

---

## 7. Design System, Typography & UX Rules

- **Styling:** Tailwind CSS v4 + `shadcn/ui` only. No custom `.css` component files and no inline styles (except CSS custom property injection `--vertical-accent` on the vertical layout root).
- **Industrial Palette:**
  - Macro Primary: Signal Cobalt (`#1D4ED8` light / `#3B82F6` dark)
  - RFQ / Claim Accent: Industrial Amber (`#D97706` light / `#F59E0B` dark)
  - Verified Trust / Positive Tick: Emerald (`#059669` light / `#10B981` dark)
  - Alert / Negative Tick: Crimson (`#DC2626` light / `#EF4444` dark)
  - Dark Canvas: Deep Obsidian (`#0B0F19`), Card (`#111827`), Border (`#1F2937`)
  - Light Canvas: Clean Slate (`#F8FAFC`), Card (`#FFFFFF`), Border (`#E2E8F0`)
- **Typography (`next/font`):**
  - Headlines: `Plus Jakarta Sans` (700, 800)
  - UI & Editorial Body: `Inter` (400, 500, 600)
  - Prices, Gauges, Alloys, Capacities & RFQ Codes: `JetBrains Mono` (500) with `tabular-nums`
- **Route Resilience:** Every route segment MUST provide `loading.tsx` (using `shadcn/ui` `Skeleton`, never spinners), `error.tsx`, and `not-found.tsx`, plus actionable empty states.
- **Feedback:** Use `sonner` toast notifications for all form and action outcomes.
- **External Links:** All external vendor websites and source citations must render with `rel="noopener noreferrer"`.

---

## 8. HTTP, Networking & AI Boundaries

- **HTTP Client:** Use the centralized **axios** instance (`lib/http/axios.ts`) for external HTTP calls (PostHog queries, commodity feeds). Never use raw `fetch` in application code.
- **AI Usage:** `OpenAI` is permitted strictly for semantic search, supplier/RFQ matching assistance, and structured specification normalization—**never** for auto-generating news articles or fake vendor reviews.

---

## 9. Forbidden Practices

- Using Pages Router (`/pages`)
- Creating `middleware.ts` instead of `proxy.ts`
- Querying vertical data without scoping by `verticalId`
- Fetching data inside Client Components or importing `@prisma/client` on the client
- Throwing uncaught exceptions in Server Actions
- Allowing `UNCLAIMED` companies to view buyer PII or submit `RfqQuote` records before claim approval
- Using spinners instead of `Skeleton` placeholders, or leaving blank loading/empty screens
- Auto-generating editorial content with AI
- Hardcoding single-industry logic in UI components instead of reading from `Vertical`, `ValueChainStage`, and `SpecAttributeDefinition`

---

*This document is the single source of truth for TRNDZZ engineering and architecture.*

# TRNDZZ — Local Pre-Launch, Staging & Wildcard DNS Go-Live Runbook

> **Current Stage:** Local Pre-Launch Development (`localhost:3000` + `*.localhost:3000` against Neon PostgreSQL). Nothing is deployed to `trndzz.com` yet—every subsystem is engineered to work locally with zero paid third-party keys required.

---

## Stage 1 — Local Pre-Launch Development (Current Mode)

All 3 verticals, cross-subdomain auth, printable spec sheets, and transactional alerts run locally out of the box:

- **Macro Hub:** `http://localhost:3000`
- **Aluminium Portal:** `http://aluminium.localhost:3000`
- **Steel Portal:** `http://steel.localhost:3000`
- **Solar & Clean Energy Portal:** `http://solar.localhost:3000`
- **Admin Command Center:** `http://localhost:3000/admin`
- **Health Readiness Probe:** `http://localhost:3000/api/health`

### How Pre-Launch Fallbacks Work Locally
1. **Transactional Emails (`RESEND_API_KEY=""`):**
   - Leaving `RESEND_API_KEY` empty automatically switches `lib/services/notification.service.ts` into **`DRY_RUN_LOGGED`** mode.
   - Every Buyer RFQ Receipt, Verified Supplier Invite, Unclaimed **"Claim & Convert" Teaser**, Quote Alert, and CAC Claim Approval is persisted to `NotificationDispatch` and inspectable at `http://localhost:3000/admin/notifications` with clickable `*.localhost:3000` deep links.
2. **Printable Datasheets & Whitepapers (`/api/documents/[kind]/[slug]`):**
   - Seeded catalog SKUs and *Trndzz Learn* dossiers render printable HTML/PDF-ready engineering documents locally at `/api/documents/datasheet/[slug]` and `/api/documents/dossier/[slug]` without requiring external CDN domains.
3. **Ecosystem Search (`OPENAI_API_KEY=""`):**
   - Falls back cleanly to deterministic multi-entity PostgreSQL + domain-synonym specification search if `OPENAI_API_KEY` is unset.
4. **PostHog Telemetry (`NEXT_PUBLIC_POSTHOG_KEY=""`):**
   - `trackB2BEvent` safely no-ops when `NEXT_PUBLIC_POSTHOG_KEY` is blank.

---

## Stage 2 — Pre-DNS Cloud Staging (e.g., `*.vercel.app` Before Buying/Pointing `trndzz.com`)

You can deploy to a cloud preview URL **before** configuring custom domains or wildcard DNS:

1. Push `main` to GitHub and import into Vercel / Railway / Render.
2. Set `DATABASE_URL`, `DIRECT_URL`, and a 32+ character `BETTER_AUTH_SECRET`.
3. Set `NEXT_PUBLIC_APP_URL` and `BETTER_AUTH_URL` to your staging URL (e.g., `https://trend-pulse-staging.vercel.app`).
4. **Automatic Path-Based Vertical Fallback:**
   - `buildVerticalUrl()` in `lib/tenancy/host.ts` automatically detects `.vercel.app`, `.up.railway.app`, and `.onrender.com` hostnames (which do not support 2nd-level wildcard SSL like `aluminium.project.vercel.app`) and routes vertical links to `/vertical/aluminium`, `/vertical/steel`, and `/vertical/solar` until your custom root domain is attached.

---

## Stage 3 — Production Wildcard Subdomain Cutover (`trndzz.com` + `*.trndzz.com`)

When you are ready to go live on your custom domain:

### 1. DNS & Wildcard SSL Configuration
Add two records at your DNS provider (Cloudflare / Route53 / Vercel DNS):
- `A` record: `@` (`trndzz.com`) → Hosting ingress IP (e.g., `76.76.21.21` on Vercel)
- `CNAME` record: `*` (`*.trndzz.com`) → Hosting wildcard target (note: Vercel requires nameservers pointed to Vercel DNS to issue Let's Encrypt wildcard certificates for `*.trndzz.com`).

### 2. Production Environment Variables
```env
NEXT_PUBLIC_APP_URL="https://trndzz.com"
NEXT_PUBLIC_ROOT_DOMAIN="trndzz.com"
BETTER_AUTH_URL="https://trndzz.com"
BETTER_AUTH_SECRET="<production-32-byte-secret>"
```
With `NODE_ENV=production`, Better Auth (`lib/auth/auth.ts`) automatically enables `crossSubDomainCookies` scoped to `.trndzz.com`, keeping buyers and suppliers signed in across `trndzz.com`, `aluminium.trndzz.com`, `steel.trndzz.com`, and `solar.trndzz.com`.

### 3. Activating Live Resend Email & PostHog Funnels
1. Verify `trndzz.com` (SPF + DKIM) in Resend and set:
   - `RESEND_API_KEY="re_live_..."`
   - `EMAIL_FROM="Trndzz Trade Desk <alerts@trndzz.com>"`
   - *(Optional)* `WHATSAPP_ALERT_WEBHOOK_URL="https://..."` for instant WhatsApp Business alerts to verified mills.
2. Add `NEXT_PUBLIC_POSTHOG_KEY` to activate cross-subdomain conversion funnel tracking (`pulse_contextual_rfq_opened` → `rfq_broadcast_submitted` → `company_claim_submitted` → `supplier_quote_submitted`).

### 4. Post-Deploy Smoke Checklist
- [ ] `GET https://trndzz.com/api/health` returns HTTP `200` with `"status": "ok"` and `"activeVerticals": 3`.
- [ ] Visit `https://aluminium.trndzz.com`, `https://steel.trndzz.com`, and `https://solar.trndzz.com` and verify `proxy.ts` subdomain routing + dynamic `--vertical-accent` theme tokens.
- [ ] Sign in on `https://trndzz.com/auth/login` and confirm session persistence on `https://aluminium.trndzz.com/rfq/new`.
- [ ] Upload your first real supplier batch via `/admin/directory` (**Bulk CSV Importer**) and verify alert dispatches in `/admin/notifications`.


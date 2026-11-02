# TRNDZZ (`trndzz.com`)

**Multi-Tenant B2B Trade Intelligence, Verified Supplier Directory & Procurement Ecosystem**

Trndzz organizes fragmented industrial supply chains across West Africa and emerging markets into specialized vertical trade portals on a single Next.js + PostgreSQL codebase:

- **Macro Hub (`trndzz.com`):** Cross-sector business intelligence, macro commodity/FX trackers, vertical portals directory, unified authentication, and buyer/vendor workspaces.
- **Vertical Portals (`*.trndzz.com`):** Deep, standalone sector hubs—starting with **`aluminium.trndzz.com`**, followed by **`steel.trndzz.com`** and **`solar.trndzz.com`**—combining:
  1. **Trndzz Pulse:** Value-chain journalism (Upstream, Midstream, Downstream) & commodity price trackers
  2. **Verified B2B Supplier Directory:** Role-mapped industrial registry with the **"Claim & Convert"** onboarding loop
  3. **Trndzz Biz:** Specification-driven product catalogs & structured RFQ broadcasting engine
  4. **Trndzz Learn:** Gated whitepapers, regulatory guides & market intelligence
  5. **Contextual Cross-Linking:** Relational widgets turning trade articles directly into verified vendor quotes

---

## Documentation

- **Product Requirements Document:** [`docs/PRD.md`](./docs/PRD.md)
- **Engineering & Architecture Rules:** [`.github/copilot-instructions.md`](./.github/copilot-instructions.md)
- **Database Schema (Prisma 7):** [`prisma/schema.prisma`](./prisma/schema.prisma)
- **Implementation Roadmap & Tasks:** [`tasks.md`](./tasks.md)

---

## Local Development

1. **Configure Environment:**
   Copy `.env.example` to `.env` and configure `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, and AWS S3 credentials.

2. **Install Dependencies:**
   ```bash
   pnpm install
   ```

3. **Validate & Push/Migrate Prisma 7 Schema:**
   ```bash
   npx prisma validate
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Start Development Server:**
   ```bash
   pnpm dev
   ```
   - Macro Hub: `http://localhost:3000`
   - Flagship Aluminium Vertical: `http://aluminium.localhost:3000`

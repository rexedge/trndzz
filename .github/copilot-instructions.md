# ChatGPT Codex – Engineering & UI Guidelines

**Project Standard: Next.js App Router + Server Actions**

This document defines **mandatory engineering, UI/UX, and architectural rules** that must be followed when generating or modifying code in this project.

These rules are **non-negotiable**.

---

## 1. Core Principles

-   **Mobile-first by default**
-   **Production-grade code only**
-   **Strict separation of concerns**
-   **Server-first architecture**
-   **Security, performance, and accessibility first**
-   **Optimized for low-end mobile devices**
-   **Designed for scalability and maintainability**

---

## 2. Framework & Architecture

### Next.js

-   Use **Next.js App Router only**
-   All routing must live inside `/app`
-   Do **NOT** use `/pages`
-   Do **NOT** use legacy APIs

### Components

-   **Server Components by default**
-   Use **Client Components only when interactivity is required**
-   Avoid `"use client"` unless absolutely necessary

### Data Fetching & Mutations

-   Use **Server Actions exclusively**
-   Do **NOT** fetch data inside Client Components
-   Do **NOT** use React Query, SWR, or similar

---

## 3. Server Actions (Strict Rules)

All Server Actions MUST:

1. Live inside:

    ```
    app/actions
    ```

2. Validate inputs using **Zod**

3. **Never throw errors**

4. Always return a structured response:

```ts
{
  success: boolean;
  message: string;
  data?: any;
  errors?: any;
}
```

5. Be guarded by:

    - Authentication (server-side)
    - Role-based access control when required

6. Never expose:
    - Secrets
    - Business logic
    - Authorization logic
    - Internal IDs

---

## 4. Server Components Rules

-   Always `await params` and `searchParams`
-   Do not assume synchronous access
-   Perform authentication on the server
-   Redirect or block unauthorized users server-side

---

## 5. Styling & UI System

### Styling

-   **Tailwind CSS only**
-   No CSS files
-   No inline styles
-   Maintain consistent spacing, padding, and layout rhythm

### UI Components

-   Use **shadcn/ui** as the base UI system
-   Extend shadcn components when necessary
-   Use **shadcn Skeleton components** for loading states

### Animations

-   Use **Framer Motion sparingly**
-   Only subtle, meaningful animations
-   Never animate for decoration alone

---

## 6. Loading, Error & Empty States

Every route **must include**:

```
loading.tsx
error.tsx
not-found.tsx
```

Rules:

-   Never leave a screen blank
-   Always show skeletons while loading
-   Always show helpful empty states when no data exists
-   Display actionable messages to users

---

## 7. Forms & Validation

-   Use **React Hook Form** for all forms
-   Use **Zod** for schema validation
-   Integrate Zod with React Hook Form resolvers
-   Display validation errors clearly
-   Ensure:
    -   Proper labels
    -   Keyboard navigation
    -   Accessible error messages

---

## 8. State Management

-   Use **Zustand only**
-   Zustand stores must live inside:
    ```
    store/
    ```
-   Use Zustand for:
    -   Global state
    -   Persistent local storage
-   Avoid unnecessary client-side state
-   Prefer server-derived state whenever possible

---

## 9. HTTP & Networking

-   Use **axios for all HTTP requests**
-   Never use `fetch` directly
-   Use a centralized axios instance

### Middleware

-   Use `proxy.ts`
-   Do **NOT** use `middleware.ts`
-   Follow Next.js 16 conventions

---

## 10. Database Access

-   Use **Prisma only**
-   Use **type-safe Prisma queries**
-   No raw SQL unless explicitly approved
-   Prisma access must:
    -   Be server-only
    -   Never run on the client
    -   Live in domain-specific services

---

## 11. Folder Structure (Mandatory)

```
app/
  ├── actions/
  ├── (auth)/
  ├── (dashboard)/
  ├── loading.tsx
  ├── error.tsx
  └── not-found.tsx

lib/
  ├── auth/
  ├── prisma/
  ├── validators/
  └── utils/

store/
  └── useAppStore.ts
```

Use **clear, domain-based folders**.
Avoid dumping unrelated logic into shared folders.

---

## 12. Authentication & Authorization

-   Handle authentication **on the server**
-   Enforce **role-based access control**
-   Guard:
    -   Routes
    -   Server Actions
-   Never expose auth logic to the client
-   Never trust client-side role checks

---

## 13. UX & Accessibility

-   Mobile-first layout and typography
-   Smaller font sizes on mobile, scale up on tablet/desktop
-   Ensure:
    -   Keyboard accessibility
    -   Proper contrast
    -   Clear focus states
-   Maintain visual consistency across screens

---

## 14. Performance Guidelines

-   Optimize for **low-end mobile devices**
-   Avoid over-fetching
-   Avoid duplicate requests
-   Prefer server-side computation
-   Minimize client-side JavaScript
-   Use skeletons instead of spinners

---

## 15. Notifications & Feedback

-   Use **toast from `sonner`**
-   Provide feedback for:
    -   Success
    -   Errors
    -   Empty states
-   Never silently fail

---

## 16. Currency & Localization

-   Default currency: **Nigerian Naira (₦)**
-   Do not assume USD unless explicitly requested

---

## 17. Code Quality Standards

-   Keep code:
    -   Modular
    -   Readable
    -   Scalable
    -   Production-ready
-   Avoid:
    -   God components
    -   Tight coupling
    -   Magic values
-   Use clear naming conventions
-   Document complex logic inline

---

## 18. Forbidden Practices

🚫 Using Pages Router
🚫 Throwing errors in Server Actions
🚫 Fetching data in Client Components
🚫 Exposing secrets to the client
🚫 Using middleware.ts
🚫 Inline styles or CSS files
🚫 Over-animating UI
🚫 Blank screens
🚫 Skipping loading/error states

---

## 19. Codex Instruction

When generating code, **ChatGPT Codex must**:

-   Follow all rules above
-   Assume this is a **production application**
-   Ask for clarification only when absolutely required
-   Prefer correctness over brevity
-   Optimize for maintainability and scalability

---

### ✅ This document is the **single source of truth** for all generated code.

### ❌ Any deviation from these rules is strictly prohibited.

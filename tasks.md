# Trend Pulse Tasks

## Completed
- Added loading/error/not-found boundaries with shadcn skeletons for root, posts, and admin routes.
- Rebuilt admin experience with server actions + Zod validation + RHF UI; replaced inline styles with shadcn/Tailwind; fixed async cookies usage.
- Improved homepage feed with mobile-first layout, richer excerpts/date metadata, and paginated navigation (page param).
- Locked article pages to published content only, added not-found handling, and added per-article SEO metadata.
- Updated global metadata to Trend Pulse defaults and wired global toaster support.

## To Do
- Replace client fetches with axios per Copilot rules and add toast feedback for admin actions.
- Enhance freshness pipeline: incorporate live web research in generation, reintroduce a safe scheduler/manual trigger, and reinforce review-before-publish.
- Ensure server actions never throw and return structured responses; add graceful empty/error states as needed.

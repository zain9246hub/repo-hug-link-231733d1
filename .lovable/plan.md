# Replication Guide for New Project

Generate a single document `REPLICATION_GUIDE.md` (saved to `/mnt/documents/`) that lists **everything** your new Lovable project needs to know to replicate this app's logic and flow step by step.

## What the guide will contain

### 1. Initial Setup Questions (to ask the new project AI)
A copy-paste prompt block covering:
- Enable Lovable Cloud (backend)
- Confirm tech stack: React + Vite + Tailwind + TypeScript + shadcn/ui
- Hash-based routing (HashRouter)
- Mobile-first layout with bottom navigation
- Dark/light theme via `next-themes`

### 2. Database Setup (Step 1)
- Full SQL migration with all 25 tables, the `app_role` enum, 7 helper functions, all RLS policies, triggers, indexes, and realtime publication
- 2 storage buckets (`property-images`, `ad-images`, public)
- Order: extensions → enum → tables → functions → triggers → policies → realtime

### 3. Authentication Setup (Step 2)
- Email/password + Google OAuth
- Auto-create profile on signup with `user_type` (owner/broker/builder)
- Admin gate: hardcoded email `kureshizain04@gmail.com` + `user_roles` check via `has_role` RPC
- `useAuth` hook pattern (listener BEFORE getSession)
- `AuthGuard` and `AdminRoute` wrappers
- Role-based redirect after login (owner → /, broker → /broker-dashboard, builder → /builder-dashboard)

### 4. Core Feature Modules (Step 3, ordered by dependency)
For each module: tables used, key pages, hooks, flow description.

1. **Properties** — listing, search, details, masked phone via `get_published_properties` RPC
2. **Saved Properties / Wishlist** — `saved_properties` table + `use-saved-properties`
3. **Requirements** — `area_requirements` triggers `notify_brokers_on_requirement`
4. **Brokers** — directory, profile, reviews (auto-rating trigger), inquiries, clients, leads
5. **Builders** — projects, leads, inquiries
6. **Chat** — `chat_messages` with realtime by city/state/area
7. **Notifications** — `notifications` + `broker_notifications` with realtime unread count
8. **Rent Tracker** — `rentals` table with due-date logic
9. **Subscriptions & Quotas** — `subscriptions`, `feature_usage`, `payment_history`
10. **Ads** — `admin_ads`, `ad_applications`, `ad_customers` (admin-only management)
11. **Site Visits & Contact Requests** — owner-facing inbox
12. **Property Invites** — token-based co-listing

### 5. Routing Map (Step 4)
Complete `App.tsx` route table marking each as Public / Protected (`AuthGuard`) / Admin (`AdminRoute`).

### 6. Layout & UX (Step 5)
- `MobileLayout` with `MobileHeader`, `BottomNavigation`, `Footer`, lazy `LocationChat`
- Bottom nav hidden on `/property/*` and `/list-property`
- `ScrollProgress` + `ScrollToTop`
- Lazy-loaded pages with `Suspense` fallback

### 7. Conventions & Gotchas
- Never edit `client.ts`, `types.ts`, `.env`
- Roles ALWAYS in `user_roles` table, never on profiles
- Use `has_role()` security-definer function in RLS to avoid recursion
- Phone numbers masked in public property reads
- Realtime tables: `notifications`, `broker_notifications`, `chat_messages`

### 8. Step-by-Step Build Order (Copy-paste prompts)
A numbered sequence of prompts to feed your new Lovable project, one per phase, so it builds in the correct dependency order without breaking.

## Deliverable
Single file: `/mnt/documents/REPLICATION_GUIDE.md` — emitted as a downloadable artifact when complete.

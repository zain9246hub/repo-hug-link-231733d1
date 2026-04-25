

# Full Database Schema Completion Plan

## Current State
Your project already has **16 tables** in the database: properties, profiles, brokers, broker_clients, broker_inquiries, broker_notifications, broker_reviews, builder_projects, builder_inquiries, admin_ads, ad_applications, ad_customers, area_requirements, chat_messages, feature_usage, property_invites, subscriptions, user_roles.

However, several features still use **localStorage** instead of the database:
- **Saved/Wishlist properties** — stored in localStorage
- **Rent tracker** — stored in localStorage
- **Notifications** — hardcoded static data

## Plan

### Step 1: Create missing tables via migration

**`saved_properties`** — Persist user wishlists
- `id`, `user_id`, `property_id`, `created_at`
- RLS: users can CRUD only their own saved properties

**`rentals`** — Persist rent tracker data
- `id`, `user_id`, `property_name`, `city`, `state`, `rent_amount`, `due_date`, `due_time`, `phone_number`, `status` (paid/pending), `last_paid`, `created_at`
- RLS: users can CRUD only their own rentals

**`notifications`** — Persist user notifications
- `id`, `user_id`, `type`, `title`, `description`, `is_read`, `created_at`, `metadata` (jsonb)
- RLS: users can read/update/delete their own notifications; system can insert
- Enable realtime for live notification updates

### Step 2: Update code to use database instead of localStorage

1. **SavedProperties page + PropertyDetails** — Replace localStorage calls with `saved_properties` table queries via Supabase SDK
2. **use-rentals hook** — Replace localStorage with `rentals` table CRUD operations
3. **Notifications page** — Fetch from `notifications` table instead of static data; keep rent-due notifications generated from rentals table

### Step 3: Add RLS policies for all new tables
- All new tables will have RLS enabled with user-scoped policies
- Insert policies check `auth.uid() = user_id`

### Technical Details
- Migration SQL will create all 3 tables with proper constraints and defaults
- `saved_properties` will have a unique constraint on `(user_id, property_id)` to prevent duplicates
- `notifications` table will be added to `supabase_realtime` publication for live updates
- No changes to existing tables required


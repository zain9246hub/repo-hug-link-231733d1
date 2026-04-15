
-- ============================================
-- SCALING INDEXES FOR SURAT PROPERTY APP
-- ============================================

-- Properties (most queried table)
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties (city);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON public.properties (listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON public.properties (user_id);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON public.properties (property_type);
CREATE INDEX IF NOT EXISTS idx_properties_is_featured ON public.properties (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_properties_is_urgent ON public.properties (is_urgent) WHERE is_urgent = true;
CREATE INDEX IF NOT EXISTS idx_properties_city_status ON public.properties (city, status);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties (created_at DESC);

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles (user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON public.profiles (is_active) WHERE is_active = true;

-- Brokers
CREATE INDEX IF NOT EXISTS idx_brokers_user_id ON public.brokers (user_id);
CREATE INDEX IF NOT EXISTS idx_brokers_verified ON public.brokers (verified) WHERE verified = true;
CREATE INDEX IF NOT EXISTS idx_brokers_areas ON public.brokers USING GIN (areas);

-- Builder Projects
CREATE INDEX IF NOT EXISTS idx_builder_projects_user_id ON public.builder_projects (user_id);
CREATE INDEX IF NOT EXISTS idx_builder_projects_city ON public.builder_projects (city);
CREATE INDEX IF NOT EXISTS idx_builder_projects_status ON public.builder_projects (status);

-- Builder Inquiries
CREATE INDEX IF NOT EXISTS idx_builder_inquiries_builder_user_id ON public.builder_inquiries (builder_user_id);
CREATE INDEX IF NOT EXISTS idx_builder_inquiries_status ON public.builder_inquiries (status);

-- Broker Inquiries
CREATE INDEX IF NOT EXISTS idx_broker_inquiries_broker_id ON public.broker_inquiries (broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_inquiries_status ON public.broker_inquiries (status);

-- Broker Clients
CREATE INDEX IF NOT EXISTS idx_broker_clients_broker_id ON public.broker_clients (broker_id);

-- Broker Notifications
CREATE INDEX IF NOT EXISTS idx_broker_notifications_broker_id ON public.broker_notifications (broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_notifications_is_read ON public.broker_notifications (broker_id, is_read) WHERE is_read = false;

-- Broker Reviews
CREATE INDEX IF NOT EXISTS idx_broker_reviews_broker_id ON public.broker_reviews (broker_id);

-- Subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_status ON public.subscriptions (plan, status);

-- Chat Messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_city_state ON public.chat_messages (city, state);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages (created_at DESC);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications (user_id, is_read) WHERE is_read = false;

-- Saved Properties
CREATE INDEX IF NOT EXISTS idx_saved_properties_user_id ON public.saved_properties (user_id);

-- Rentals
CREATE INDEX IF NOT EXISTS idx_rentals_user_id ON public.rentals (user_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON public.rentals (status);

-- Ad Applications
CREATE INDEX IF NOT EXISTS idx_ad_applications_user_id ON public.ad_applications (user_id);
CREATE INDEX IF NOT EXISTS idx_ad_applications_status ON public.ad_applications (status);

-- Admin Ads
CREATE INDEX IF NOT EXISTS idx_admin_ads_status ON public.admin_ads (status);
CREATE INDEX IF NOT EXISTS idx_admin_ads_placement ON public.admin_ads (placement);

-- Ad Customers
CREATE INDEX IF NOT EXISTS idx_ad_customers_status ON public.ad_customers (status);

-- Contact Requests
CREATE INDEX IF NOT EXISTS idx_contact_requests_owner_id ON public.contact_requests (owner_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_property_id ON public.contact_requests (property_id);

-- Site Visits
CREATE INDEX IF NOT EXISTS idx_site_visits_user_id ON public.site_visits (user_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_property_id ON public.site_visits (property_id);

-- Property Views
CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON public.property_views (property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_created_at ON public.property_views (created_at DESC);

-- Payment History
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON public.payment_history (user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON public.payment_history (status);

-- Property Invites
CREATE INDEX IF NOT EXISTS idx_property_invites_property_id ON public.property_invites (property_id);
CREATE INDEX IF NOT EXISTS idx_property_invites_invited_email ON public.property_invites (invited_email);

-- Area Requirements
CREATE INDEX IF NOT EXISTS idx_area_requirements_user_id ON public.area_requirements (user_id);
CREATE INDEX IF NOT EXISTS idx_area_requirements_city_area ON public.area_requirements (city, area);

-- Feature Usage
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature ON public.feature_usage (feature);
CREATE INDEX IF NOT EXISTS idx_feature_usage_created_at ON public.feature_usage (created_at DESC);

-- User Roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles (user_id);


-- 1. property_views - track property view analytics
CREATE TABLE public.property_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view property view counts" ON public.property_views FOR SELECT USING (true);
CREATE POLICY "Authenticated users can record views" ON public.property_views FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_property_views_property ON public.property_views(property_id);
CREATE INDEX idx_property_views_user ON public.property_views(user_id);

-- 2. site_visits - schedule property visits
CREATE TABLE public.site_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  visit_time TIME NOT NULL DEFAULT '10:00',
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own site visits" ON public.site_visits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create site visits" ON public.site_visits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own site visits" ON public.site_visits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own site visits" ON public.site_visits FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Property owners can view visits" ON public.site_visits FOR SELECT USING (
  property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid())
);
CREATE POLICY "Property owners can update visit status" ON public.site_visits FOR UPDATE USING (
  property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid())
);

CREATE INDEX idx_site_visits_property ON public.site_visits(property_id);
CREATE INDEX idx_site_visits_user ON public.site_visits(user_id);

-- 3. contact_requests - contact property owners
CREATE TABLE public.contact_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contact requests" ON public.contact_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create contact requests" ON public.contact_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can view contact requests for their properties" ON public.contact_requests FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners can update contact request status" ON public.contact_requests FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Admins can view all contact requests" ON public.contact_requests FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE INDEX idx_contact_requests_property ON public.contact_requests(property_id);
CREATE INDEX idx_contact_requests_owner ON public.contact_requests(owner_id);

-- 4. payment_history - track all payments
CREATE TABLE public.payment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_type TEXT NOT NULL DEFAULT 'subscription',
  reference_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON public.payment_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON public.payment_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all payments" ON public.payment_history FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update payments" ON public.payment_history FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE INDEX idx_payment_history_user ON public.payment_history(user_id);

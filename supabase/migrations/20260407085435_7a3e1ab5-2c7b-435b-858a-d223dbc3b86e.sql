
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL DEFAULT 'Anonymous',
  user_avatar TEXT,
  content TEXT NOT NULL,
  area TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view chat messages" ON public.chat_messages FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON public.chat_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.area_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  area TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Surat',
  property_type TEXT NOT NULL DEFAULT 'any',
  budget TEXT,
  bedrooms TEXT,
  description TEXT NOT NULL,
  phone TEXT,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.area_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view requirements" ON public.area_requirements FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert requirements" ON public.area_requirements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own requirements" ON public.area_requirements FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own requirements" ON public.area_requirements FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Broker can delete own notifications" ON public.broker_notifications FOR DELETE TO authenticated USING (broker_id IN (SELECT id FROM brokers WHERE user_id = auth.uid()));

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.area_requirements;

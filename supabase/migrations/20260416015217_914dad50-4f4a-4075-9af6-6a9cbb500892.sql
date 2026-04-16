
CREATE TABLE public.briefings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  semana TEXT NOT NULL,
  datos JSONB NOT NULL,
  resumen_ejecutivo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own briefings" ON public.briefings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own briefings" ON public.briefings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own briefings" ON public.briefings FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_briefings_user_semana ON public.briefings (user_id, created_at DESC);

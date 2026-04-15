
-- Create eventos table
CREATE TABLE public.eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_fin TIMESTAMP WITH TIME ZONE,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view eventos" ON public.eventos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert eventos" ON public.eventos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth users can update own eventos" ON public.eventos FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth users can delete own eventos" ON public.eventos FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all eventos" ON public.eventos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON public.eventos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create notas table
CREATE TABLE public.notas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  contenido TEXT,
  color TEXT NOT NULL DEFAULT '#fbbf24',
  prioridad TEXT NOT NULL DEFAULT 'media',
  fijada BOOLEAN NOT NULL DEFAULT false,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notas" ON public.notas FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notas" ON public.notas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notas" ON public.notas FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notas" ON public.notas FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_notas_updated_at BEFORE UPDATE ON public.notas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

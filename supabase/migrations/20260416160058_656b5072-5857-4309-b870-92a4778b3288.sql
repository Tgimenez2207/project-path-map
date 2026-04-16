
-- 1. Add columns to presupuestos
ALTER TABLE public.presupuestos
  ADD COLUMN IF NOT EXISTS origen text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS datos_computo jsonb;

-- 2. Create computos table
CREATE TABLE public.computos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  superficie numeric NOT NULL,
  tipologia text NOT NULL,
  ubicacion text NOT NULL,
  terminaciones text NOT NULL DEFAULT 'estandar',
  pisos integer NOT NULL DEFAULT 1,
  observaciones text,
  resultado jsonb NOT NULL,
  presupuesto_id uuid REFERENCES public.presupuestos(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.computos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view computos" ON public.computos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert computos" ON public.computos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin/fin can delete computos" ON public.computos FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finanzas'::app_role));

-- 3. Create presupuesto_rubros table (detailed breakdown from AI)
CREATE TABLE public.presupuesto_rubros (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  presupuesto_id uuid NOT NULL REFERENCES public.presupuestos(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  incidencia numeric NOT NULL DEFAULT 0,
  costo_min numeric,
  costo_max numeric,
  costo_estimado numeric NOT NULL DEFAULT 0,
  unidad text NOT NULL DEFAULT 'gl',
  observaciones text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.presupuesto_rubros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view presupuesto_rubros" ON public.presupuesto_rubros FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/fin can insert presupuesto_rubros" ON public.presupuesto_rubros FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finanzas'::app_role));
CREATE POLICY "Admin/fin can update presupuesto_rubros" ON public.presupuesto_rubros FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finanzas'::app_role));
CREATE POLICY "Admin/fin can delete presupuesto_rubros" ON public.presupuesto_rubros FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finanzas'::app_role));

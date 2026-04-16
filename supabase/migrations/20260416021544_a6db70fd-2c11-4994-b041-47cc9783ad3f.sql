
-- Enum for contract types
CREATE TYPE public.tipo_contrato AS ENUM ('compraventa','locacion_obra','subcontrato','provision','honorarios','alquiler','otro');

-- Enum for contract states
CREATE TYPE public.estado_contrato AS ENUM ('borrador','revision','pendiente_firma','firmado','en_ejecucion','finalizado','rescindido');

-- Contract templates
CREATE TABLE public.plantillas_contrato (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo tipo_contrato NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  cuerpo TEXT NOT NULL DEFAULT '',
  variables TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.plantillas_contrato ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view plantillas" ON public.plantillas_contrato FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage plantillas" ON public.plantillas_contrato FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Contracts
CREATE TABLE public.contratos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT NOT NULL,
  tipo tipo_contrato NOT NULL DEFAULT 'otro',
  titulo TEXT NOT NULL,
  estado estado_contrato NOT NULL DEFAULT 'borrador',
  parte_a JSONB NOT NULL DEFAULT '{}',
  parte_b JSONB NOT NULL DEFAULT '{}',
  obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
  obra_nombre TEXT,
  fecha_creacion DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin DATE,
  fecha_firma DATE,
  monto_total NUMERIC NOT NULL DEFAULT 0,
  moneda public.moneda NOT NULL DEFAULT 'USD',
  forma_pago TEXT NOT NULL DEFAULT '',
  hitos JSONB NOT NULL DEFAULT '[]',
  cuerpo TEXT NOT NULL DEFAULT '',
  plantilla_id UUID REFERENCES public.plantillas_contrato(id) ON DELETE SET NULL,
  adjuntos TEXT[] NOT NULL DEFAULT '{}',
  notas TEXT NOT NULL DEFAULT '',
  creado_por TEXT NOT NULL DEFAULT '',
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view contratos" ON public.contratos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/fin can insert contratos" ON public.contratos FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finanzas'::app_role));
CREATE POLICY "Admin/fin can update contratos" ON public.contratos FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finanzas'::app_role));
CREATE POLICY "Admin/fin can delete contratos" ON public.contratos FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finanzas'::app_role));

CREATE INDEX idx_contratos_estado ON public.contratos (estado);
CREATE INDEX idx_contratos_tipo ON public.contratos (tipo);
CREATE INDEX idx_contratos_obra ON public.contratos (obra_id);

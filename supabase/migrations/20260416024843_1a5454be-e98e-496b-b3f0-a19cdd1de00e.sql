
-- Add enrichment columns to clientes
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS tipo_cliente_app text DEFAULT 'comprador_unidad';
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS apellido text;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS dni text;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS cuit text;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS rubro text;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS ciudad text;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS provincia text;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS estado_cliente text DEFAULT 'activo';
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS unidades_compradas integer DEFAULT 0;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS monto_total_operado numeric DEFAULT 0;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS moneda_operado text DEFAULT 'USD';
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS score_ia jsonb;

-- Add enrichment columns to proveedores
ALTER TABLE public.proveedores ADD COLUMN IF NOT EXISTS contacto text;
ALTER TABLE public.proveedores ADD COLUMN IF NOT EXISTS ciudad text;
ALTER TABLE public.proveedores ADD COLUMN IF NOT EXISTS provincia text;
ALTER TABLE public.proveedores ADD COLUMN IF NOT EXISTS subrubro text DEFAULT '';
ALTER TABLE public.proveedores ADD COLUMN IF NOT EXISTS web text;
ALTER TABLE public.proveedores ADD COLUMN IF NOT EXISTS resumen_ia text;
ALTER TABLE public.proveedores ADD COLUMN IF NOT EXISTS enriquecido_ia boolean DEFAULT false;

-- Pagos de clientes
CREATE TABLE IF NOT EXISTS public.pagos_clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  monto numeric NOT NULL DEFAULT 0,
  moneda text NOT NULL DEFAULT 'USD',
  concepto text NOT NULL DEFAULT '',
  pagado_en_fecha boolean NOT NULL DEFAULT true,
  dias_demora integer NOT NULL DEFAULT 0,
  obra_id uuid REFERENCES public.obras(id),
  obra_nombre text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pagos_clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can view pagos_clientes" ON public.pagos_clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/ventas/fin can insert pagos_clientes" ON public.pagos_clientes FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ventas') OR has_role(auth.uid(), 'finanzas'));
CREATE POLICY "Admin/ventas/fin can update pagos_clientes" ON public.pagos_clientes FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ventas') OR has_role(auth.uid(), 'finanzas'));
CREATE POLICY "Admin/ventas/fin can delete pagos_clientes" ON public.pagos_clientes FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ventas') OR has_role(auth.uid(), 'finanzas'));

-- Interacciones de clientes
CREATE TABLE IF NOT EXISTS public.interacciones_clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  tipo text NOT NULL DEFAULT 'consulta',
  descripcion text NOT NULL DEFAULT '',
  resolucion text,
  autor text NOT NULL DEFAULT '',
  obra_id uuid REFERENCES public.obras(id),
  obra_nombre text,
  tono text NOT NULL DEFAULT 'neutro',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.interacciones_clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can view interacciones_clientes" ON public.interacciones_clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/ventas/fin can insert interacciones_clientes" ON public.interacciones_clientes FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ventas') OR has_role(auth.uid(), 'finanzas'));
CREATE POLICY "Admin/ventas/fin can update interacciones_clientes" ON public.interacciones_clientes FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ventas') OR has_role(auth.uid(), 'finanzas'));
CREATE POLICY "Admin/ventas/fin can delete interacciones_clientes" ON public.interacciones_clientes FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ventas') OR has_role(auth.uid(), 'finanzas'));

-- Evaluaciones de clientes
CREATE TABLE IF NOT EXISTS public.evaluaciones_clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  obra_id uuid REFERENCES public.obras(id),
  obra_nombre text,
  autor text NOT NULL DEFAULT '',
  puntualidad_pagos integer NOT NULL DEFAULT 3,
  comunicacion integer NOT NULL DEFAULT 3,
  flexibilidad integer NOT NULL DEFAULT 3,
  cumplimiento_acuerdos integer NOT NULL DEFAULT 3,
  recomendaria boolean NOT NULL DEFAULT true,
  comentario text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.evaluaciones_clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can view evaluaciones_clientes" ON public.evaluaciones_clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/ventas/fin can insert evaluaciones_clientes" ON public.evaluaciones_clientes FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ventas') OR has_role(auth.uid(), 'finanzas'));
CREATE POLICY "Admin/ventas/fin can update evaluaciones_clientes" ON public.evaluaciones_clientes FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ventas') OR has_role(auth.uid(), 'finanzas'));
CREATE POLICY "Admin/ventas/fin can delete evaluaciones_clientes" ON public.evaluaciones_clientes FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ventas') OR has_role(auth.uid(), 'finanzas'));

-- Evaluaciones de proveedores
CREATE TABLE IF NOT EXISTS public.evaluaciones_proveedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id uuid NOT NULL REFERENCES public.proveedores(id) ON DELETE CASCADE,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  obra_id uuid REFERENCES public.obras(id),
  obra_nombre text,
  autor text NOT NULL DEFAULT '',
  puntualidad integer NOT NULL DEFAULT 3,
  calidad integer NOT NULL DEFAULT 3,
  precio integer NOT NULL DEFAULT 3,
  comunicacion integer NOT NULL DEFAULT 3,
  comentario text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.evaluaciones_proveedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can view evaluaciones_proveedores" ON public.evaluaciones_proveedores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/fin can insert evaluaciones_proveedores" ON public.evaluaciones_proveedores FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'finanzas'));
CREATE POLICY "Admin/fin can update evaluaciones_proveedores" ON public.evaluaciones_proveedores FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'finanzas'));
CREATE POLICY "Admin/fin can delete evaluaciones_proveedores" ON public.evaluaciones_proveedores FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'finanzas'));

-- Cotizaciones de proveedores
CREATE TABLE IF NOT EXISTS public.cotizaciones_proveedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id uuid NOT NULL REFERENCES public.proveedores(id) ON DELETE CASCADE,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  descripcion text NOT NULL DEFAULT '',
  monto numeric NOT NULL DEFAULT 0,
  moneda text NOT NULL DEFAULT 'ARS',
  obra_id uuid REFERENCES public.obras(id),
  ganada boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cotizaciones_proveedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can view cotizaciones_proveedores" ON public.cotizaciones_proveedores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/fin can insert cotizaciones_proveedores" ON public.cotizaciones_proveedores FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'finanzas'));
CREATE POLICY "Admin/fin can update cotizaciones_proveedores" ON public.cotizaciones_proveedores FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'finanzas'));
CREATE POLICY "Admin/fin can delete cotizaciones_proveedores" ON public.cotizaciones_proveedores FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'finanzas'));

-- Tareas personales
CREATE TABLE IF NOT EXISTS public.tareas_personales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  titulo text NOT NULL,
  descripcion text,
  prioridad text NOT NULL DEFAULT 'media',
  estado text NOT NULL DEFAULT 'pendiente',
  area text NOT NULL DEFAULT 'otro',
  obra_id uuid REFERENCES public.obras(id),
  obra_nombre text,
  fecha_vencimiento date,
  fecha_completada date,
  subtareas jsonb DEFAULT '[]'::jsonb,
  recurrente boolean DEFAULT false,
  frecuencia_recurrencia text,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tareas_personales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tareas_personales" ON public.tareas_personales FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tareas_personales" ON public.tareas_personales FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tareas_personales" ON public.tareas_personales FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tareas_personales" ON public.tareas_personales FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Trigger for updated_at on tareas_personales
CREATE TRIGGER update_tareas_personales_updated_at
  BEFORE UPDATE ON public.tareas_personales
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Nodos Gantt table
CREATE TABLE IF NOT EXISTS public.nodos_gantt (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id uuid NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.nodos_gantt(id),
  tipo text NOT NULL DEFAULT 'tarea',
  nombre text NOT NULL,
  responsable text,
  inicio integer NOT NULL DEFAULT 0,
  duracion integer NOT NULL DEFAULT 1,
  avance integer NOT NULL DEFAULT 0,
  estado text NOT NULL DEFAULT 'pendiente',
  critica boolean DEFAULT false,
  dependencias uuid[] DEFAULT '{}',
  orden integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.nodos_gantt ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can view nodos_gantt" ON public.nodos_gantt FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/ops can insert nodos_gantt" ON public.nodos_gantt FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operaciones'));
CREATE POLICY "Admin/ops can update nodos_gantt" ON public.nodos_gantt FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operaciones'));
CREATE POLICY "Admin/ops can delete nodos_gantt" ON public.nodos_gantt FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operaciones'));

CREATE TRIGGER update_nodos_gantt_updated_at
  BEFORE UPDATE ON public.nodos_gantt
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

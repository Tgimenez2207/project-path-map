
-- 1. Extend productos table with material/catalog fields
ALTER TABLE public.productos
  ADD COLUMN IF NOT EXISTS foto_url text,
  ADD COLUMN IF NOT EXISTS marca text,
  ADD COLUMN IF NOT EXISTS modelo text,
  ADD COLUMN IF NOT EXISTS precio_referencia numeric,
  ADD COLUMN IF NOT EXISTS moneda text NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS proveedor_id uuid REFERENCES public.proveedores(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS es_terminacion boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS descripcion text,
  ADD COLUMN IF NOT EXISTS caracteristicas jsonb;

-- 2. Create selecciones_terminacion table
CREATE TABLE public.selecciones_terminacion (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unidad_id uuid NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
  producto_id uuid NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  categoria text NOT NULL DEFAULT '',
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  estado text NOT NULL DEFAULT 'pendiente',
  notas text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.selecciones_terminacion ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view all selections
CREATE POLICY "Auth users can view selecciones_terminacion"
  ON public.selecciones_terminacion FOR SELECT TO authenticated USING (true);

-- Admin/ventas can insert
CREATE POLICY "Admin/ventas can insert selecciones_terminacion"
  ON public.selecciones_terminacion FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ventas'::app_role));

-- Admin/ventas can update (approve/reject)
CREATE POLICY "Admin/ventas can update selecciones_terminacion"
  ON public.selecciones_terminacion FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ventas'::app_role));

-- Admin/ventas can delete
CREATE POLICY "Admin/ventas can delete selecciones_terminacion"
  ON public.selecciones_terminacion FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ventas'::app_role));

-- Anon users (portal) can view productos marked as terminacion
CREATE POLICY "Anon can view terminacion productos"
  ON public.productos FOR SELECT TO anon USING (es_terminacion = true);

-- Anon users can insert their own selections (portal)
CREATE POLICY "Anon can insert selecciones_terminacion"
  ON public.selecciones_terminacion FOR INSERT TO anon WITH CHECK (true);

-- Anon users can view their own selections
CREATE POLICY "Anon can view selecciones_terminacion"
  ON public.selecciones_terminacion FOR SELECT TO anon USING (true);


CREATE TABLE public.precios_producto (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id uuid NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  proveedor_id uuid NOT NULL REFERENCES public.proveedores(id) ON DELETE CASCADE,
  precio numeric NOT NULL DEFAULT 0,
  moneda text NOT NULL DEFAULT 'USD',
  lista text NOT NULL DEFAULT 'General',
  fecha_vigencia date NOT NULL DEFAULT CURRENT_DATE,
  vigente boolean NOT NULL DEFAULT true,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.precios_producto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view precios_producto"
  ON public.precios_producto FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin/ops can insert precios_producto"
  ON public.precios_producto FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operaciones'::app_role));

CREATE POLICY "Admin/ops can update precios_producto"
  ON public.precios_producto FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operaciones'::app_role));

CREATE POLICY "Admin/ops can delete precios_producto"
  ON public.precios_producto FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operaciones'::app_role));

CREATE INDEX idx_precios_producto_producto ON public.precios_producto(producto_id);
CREATE INDEX idx_precios_producto_proveedor ON public.precios_producto(proveedor_id);

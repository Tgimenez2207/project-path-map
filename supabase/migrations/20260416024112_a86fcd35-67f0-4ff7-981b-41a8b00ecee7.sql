
-- Cuentas de tesorería
CREATE TABLE public.cuentas_tesoreria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'banco',
  banco TEXT,
  nro_cuenta TEXT,
  cbu TEXT,
  moneda TEXT NOT NULL DEFAULT 'ARS',
  saldo_inicial NUMERIC NOT NULL DEFAULT 0,
  activa BOOLEAN NOT NULL DEFAULT true,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cuentas_tesoreria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view cuentas_tesoreria" ON public.cuentas_tesoreria FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/fin can insert cuentas_tesoreria" ON public.cuentas_tesoreria FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finanzas'::app_role));
CREATE POLICY "Admin/fin can update cuentas_tesoreria" ON public.cuentas_tesoreria FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finanzas'::app_role));
CREATE POLICY "Admin/fin can delete cuentas_tesoreria" ON public.cuentas_tesoreria FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finanzas'::app_role));

-- Movimientos de tesorería
CREATE TABLE public.movimientos_tesoreria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo TEXT NOT NULL DEFAULT 'egreso',
  categoria TEXT NOT NULL DEFAULT 'otro',
  descripcion TEXT NOT NULL,
  monto NUMERIC NOT NULL DEFAULT 0,
  moneda TEXT NOT NULL DEFAULT 'ARS',
  cuenta_id UUID REFERENCES public.cuentas_tesoreria(id) ON DELETE SET NULL,
  cuenta_destino_id UUID REFERENCES public.cuentas_tesoreria(id) ON DELETE SET NULL,
  obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
  obra_nombre TEXT,
  proveedor_id UUID REFERENCES public.proveedores(id) ON DELETE SET NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  contrato_id UUID REFERENCES public.contratos(id) ON DELETE SET NULL,
  cheque_id UUID,
  comprobante TEXT,
  notas TEXT,
  creado_por TEXT NOT NULL DEFAULT '',
  conciliado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.movimientos_tesoreria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view movimientos_tesoreria" ON public.movimientos_tesoreria FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/fin can insert movimientos_tesoreria" ON public.movimientos_tesoreria FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finanzas'::app_role));
CREATE POLICY "Admin/fin can update movimientos_tesoreria" ON public.movimientos_tesoreria FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finanzas'::app_role));
CREATE POLICY "Admin/fin can delete movimientos_tesoreria" ON public.movimientos_tesoreria FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finanzas'::app_role));

-- Cheques
CREATE TABLE public.cheques (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL DEFAULT 'propio',
  numero TEXT NOT NULL,
  banco TEXT NOT NULL,
  titular TEXT NOT NULL DEFAULT '',
  monto NUMERIC NOT NULL DEFAULT 0,
  moneda TEXT NOT NULL DEFAULT 'ARS',
  fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE NOT NULL,
  estado TEXT NOT NULL DEFAULT 'en_cartera',
  cuenta_id UUID REFERENCES public.cuentas_tesoreria(id) ON DELETE SET NULL,
  recibi_de TEXT,
  fecha_deposito DATE,
  fecha_endoso DATE,
  endosado_a TEXT,
  motivo_rechazo TEXT,
  obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
  obra_nombre TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cheques ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view cheques" ON public.cheques FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/fin can insert cheques" ON public.cheques FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finanzas'::app_role));
CREATE POLICY "Admin/fin can update cheques" ON public.cheques FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finanzas'::app_role));
CREATE POLICY "Admin/fin can delete cheques" ON public.cheques FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finanzas'::app_role));

-- Costos fijos
CREATE TABLE public.costos_fijos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  descripcion TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'otro',
  monto NUMERIC NOT NULL DEFAULT 0,
  moneda TEXT NOT NULL DEFAULT 'ARS',
  es_recurrente BOOLEAN NOT NULL DEFAULT true,
  frecuencia TEXT DEFAULT 'mensual',
  proximo_vencimiento DATE,
  activo BOOLEAN NOT NULL DEFAULT true,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.costos_fijos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view costos_fijos" ON public.costos_fijos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/fin can insert costos_fijos" ON public.costos_fijos FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finanzas'::app_role));
CREATE POLICY "Admin/fin can update costos_fijos" ON public.costos_fijos FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finanzas'::app_role));
CREATE POLICY "Admin/fin can delete costos_fijos" ON public.costos_fijos FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finanzas'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_cuentas_tesoreria_updated_at BEFORE UPDATE ON public.cuentas_tesoreria FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_movimientos_tesoreria_updated_at BEFORE UPDATE ON public.movimientos_tesoreria FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cheques_updated_at BEFORE UPDATE ON public.cheques FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_costos_fijos_updated_at BEFORE UPDATE ON public.costos_fijos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

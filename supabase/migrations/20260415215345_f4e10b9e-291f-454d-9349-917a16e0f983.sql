
-- Enums
CREATE TYPE public.estado_obra AS ENUM ('planificacion', 'en_curso', 'pausada', 'finalizada', 'cancelada');
CREATE TYPE public.estado_unidad AS ENUM ('disponible', 'reservada', 'vendida', 'bloqueada');
CREATE TYPE public.estado_presupuesto AS ENUM ('borrador', 'pendiente', 'aprobado', 'rechazado', 'finalizado');
CREATE TYPE public.estado_pago AS ENUM ('pendiente', 'aprobado', 'rechazado', 'vencido');
CREATE TYPE public.estado_etapa AS ENUM ('pendiente', 'en_curso', 'completada');
CREATE TYPE public.estado_tarea AS ENUM ('pendiente', 'en_curso', 'completada');
CREATE TYPE public.prioridad_tarea AS ENUM ('baja', 'media', 'alta');
CREATE TYPE public.tipo_movimiento AS ENUM ('ingreso', 'egreso', 'transferencia');
CREATE TYPE public.tipo_complemento AS ENUM ('cochera', 'baulera');
CREATE TYPE public.tipo_cliente AS ENUM ('persona', 'empresa');
CREATE TYPE public.tipo_proveedor AS ENUM ('proveedor', 'contratista');
CREATE TYPE public.tipo_unidad AS ENUM ('departamento', 'local', 'oficina', 'casa');
CREATE TYPE public.tipo_vehiculo AS ENUM ('camioneta', 'camion', 'auto', 'utilitario');
CREATE TYPE public.estado_vehiculo AS ENUM ('disponible', 'en_uso', 'mantenimiento');
CREATE TYPE public.estado_herramienta AS ENUM ('disponible', 'en_uso', 'mantenimiento', 'baja');
CREATE TYPE public.moneda AS ENUM ('ARS', 'USD');

-- Obras
CREATE TABLE public.obras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  direccion TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  estado public.estado_obra NOT NULL DEFAULT 'planificacion',
  fecha_inicio DATE NOT NULL,
  fecha_fin_estimada DATE,
  descripcion TEXT,
  imagen TEXT,
  progreso INT NOT NULL DEFAULT 0 CHECK (progreso >= 0 AND progreso <= 100),
  presupuesto_total NUMERIC,
  moneda public.moneda NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Etapas
CREATE TABLE public.etapas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  orden INT NOT NULL,
  fecha_inicio DATE,
  fecha_fin DATE,
  estado public.estado_etapa NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tareas
CREATE TABLE public.tareas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  etapa_id UUID NOT NULL REFERENCES public.etapas(id) ON DELETE CASCADE,
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  estado public.estado_tarea NOT NULL DEFAULT 'pendiente',
  prioridad public.prioridad_tarea NOT NULL DEFAULT 'media',
  asignado_a TEXT,
  fecha_vencimiento DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bitácora
CREATE TABLE public.bitacora (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  autor TEXT NOT NULL,
  imagenes TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Clientes
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo public.tipo_cliente NOT NULL DEFAULT 'persona',
  nombre TEXT NOT NULL,
  documento TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Proveedores
CREATE TABLE public.proveedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo public.tipo_proveedor NOT NULL DEFAULT 'proveedor',
  razon_social TEXT NOT NULL,
  cuit TEXT NOT NULL,
  rubro TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unidades
CREATE TABLE public.unidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  tipo public.tipo_unidad NOT NULL DEFAULT 'departamento',
  piso INT,
  torre TEXT,
  superficie NUMERIC NOT NULL,
  ambientes INT,
  estado public.estado_unidad NOT NULL DEFAULT 'disponible',
  precio_lista NUMERIC NOT NULL,
  moneda public.moneda NOT NULL DEFAULT 'USD',
  descripcion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Complementos
CREATE TABLE public.complementos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidad_id UUID NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
  tipo public.tipo_complemento NOT NULL,
  codigo TEXT NOT NULL,
  precio NUMERIC NOT NULL,
  moneda public.moneda NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Compradores
CREATE TABLE public.compradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidad_id UUID NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  porcentaje NUMERIC NOT NULL CHECK (porcentaje > 0 AND porcentaje <= 100),
  fecha_asignacion DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Planes de pago
CREATE TABLE public.planes_pago (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidad_id UUID REFERENCES public.unidades(id) ON DELETE SET NULL,
  obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  monto_total NUMERIC NOT NULL,
  moneda public.moneda NOT NULL DEFAULT 'USD',
  cantidad_cuotas INT NOT NULL,
  tasa_interes NUMERIC NOT NULL DEFAULT 0,
  fecha_inicio DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cuotas
CREATE TABLE public.cuotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_pago_id UUID NOT NULL REFERENCES public.planes_pago(id) ON DELETE CASCADE,
  numero INT NOT NULL,
  monto NUMERIC NOT NULL,
  moneda public.moneda NOT NULL DEFAULT 'USD',
  fecha_vencimiento DATE NOT NULL,
  estado public.estado_pago NOT NULL DEFAULT 'pendiente',
  fecha_pago DATE,
  monto_pagado NUMERIC,
  interes_mora NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Presupuestos
CREATE TABLE public.presupuestos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
  numero TEXT NOT NULL,
  proveedor_id UUID REFERENCES public.proveedores(id) ON DELETE SET NULL,
  descripcion TEXT NOT NULL,
  monto_total NUMERIC NOT NULL,
  moneda public.moneda NOT NULL DEFAULT 'USD',
  estado public.estado_presupuesto NOT NULL DEFAULT 'borrador',
  fecha_creacion DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_validez DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Items presupuesto
CREATE TABLE public.items_presupuesto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  presupuesto_id UUID NOT NULL REFERENCES public.presupuestos(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  cantidad NUMERIC NOT NULL,
  unidad TEXT NOT NULL,
  precio_unitario NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Depósitos
CREATE TABLE public.depositos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  ubicacion TEXT NOT NULL,
  responsable TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Productos
CREATE TABLE public.productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  unidad_medida TEXT NOT NULL,
  stock_minimo NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stock
CREATE TABLE public.stock_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  deposito_id UUID NOT NULL REFERENCES public.depositos(id) ON DELETE CASCADE,
  cantidad NUMERIC NOT NULL DEFAULT 0,
  ultima_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(producto_id, deposito_id)
);

-- Movimientos de stock
CREATE TABLE public.movimientos_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo public.tipo_movimiento NOT NULL,
  producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  deposito_origen_id UUID REFERENCES public.depositos(id) ON DELETE SET NULL,
  deposito_destino_id UUID REFERENCES public.depositos(id) ON DELETE SET NULL,
  cantidad NUMERIC NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  motivo TEXT,
  responsable TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vehículos
CREATE TABLE public.vehiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patente TEXT NOT NULL UNIQUE,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  anio INT NOT NULL,
  tipo public.tipo_vehiculo NOT NULL,
  kilometraje INT NOT NULL DEFAULT 0,
  estado public.estado_vehiculo NOT NULL DEFAULT 'disponible',
  proximo_vencimiento DATE,
  tipo_vencimiento TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mantenimientos
CREATE TABLE public.mantenimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehiculo_id UUID NOT NULL REFERENCES public.vehiculos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  fecha DATE NOT NULL,
  kilometraje INT NOT NULL,
  costo NUMERIC NOT NULL,
  descripcion TEXT,
  proximo_mantenimiento DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Herramientas
CREATE TABLE public.herramientas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  estado public.estado_herramienta NOT NULL DEFAULT 'disponible',
  ubicacion_actual TEXT NOT NULL,
  asignado_a TEXT,
  fecha_compra DATE,
  valor_compra NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_obras_updated_at BEFORE UPDATE ON public.obras FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_etapas_updated_at BEFORE UPDATE ON public.etapas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tareas_updated_at BEFORE UPDATE ON public.tareas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_proveedores_updated_at BEFORE UPDATE ON public.proveedores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_unidades_updated_at BEFORE UPDATE ON public.unidades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_planes_pago_updated_at BEFORE UPDATE ON public.planes_pago FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_presupuestos_updated_at BEFORE UPDATE ON public.presupuestos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vehiculos_updated_at BEFORE UPDATE ON public.vehiculos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_herramientas_updated_at BEFORE UPDATE ON public.herramientas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bitacora ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complementos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planes_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cuotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presupuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items_presupuesto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depositos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mantenimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.herramientas ENABLE ROW LEVEL SECURITY;

-- Temporary permissive policies for authenticated users (will be refined with roles in Phase 2)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'obras','etapas','tareas','bitacora','clientes','proveedores','unidades',
    'complementos','compradores','planes_pago','cuotas','presupuestos',
    'items_presupuesto','depositos','productos','stock_items','movimientos_stock',
    'vehiculos','mantenimientos','herramientas'
  ])
  LOOP
    EXECUTE format('CREATE POLICY "Authenticated read %1$s" ON public.%1$s FOR SELECT TO authenticated USING (true)', tbl);
    EXECUTE format('CREATE POLICY "Authenticated insert %1$s" ON public.%1$s FOR INSERT TO authenticated WITH CHECK (true)', tbl);
    EXECUTE format('CREATE POLICY "Authenticated update %1$s" ON public.%1$s FOR UPDATE TO authenticated USING (true) WITH CHECK (true)', tbl);
    EXECUTE format('CREATE POLICY "Authenticated delete %1$s" ON public.%1$s FOR DELETE TO authenticated USING (true)', tbl);
  END LOOP;
END $$;

-- Also allow anon read for now (demo mode without auth)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'obras','etapas','tareas','bitacora','clientes','proveedores','unidades',
    'complementos','compradores','planes_pago','cuotas','presupuestos',
    'items_presupuesto','depositos','productos','stock_items','movimientos_stock',
    'vehiculos','mantenimientos','herramientas'
  ])
  LOOP
    EXECUTE format('CREATE POLICY "Anon read %1$s" ON public.%1$s FOR SELECT TO anon USING (true)', tbl);
    EXECUTE format('CREATE POLICY "Anon insert %1$s" ON public.%1$s FOR INSERT TO anon WITH CHECK (true)', tbl);
    EXECUTE format('CREATE POLICY "Anon update %1$s" ON public.%1$s FOR UPDATE TO anon USING (true) WITH CHECK (true)', tbl);
    EXECUTE format('CREATE POLICY "Anon delete %1$s" ON public.%1$s FOR DELETE TO anon USING (true)', tbl);
  END LOOP;
END $$;

-- Indexes
CREATE INDEX idx_etapas_obra ON public.etapas(obra_id);
CREATE INDEX idx_tareas_obra ON public.tareas(obra_id);
CREATE INDEX idx_tareas_etapa ON public.tareas(etapa_id);
CREATE INDEX idx_bitacora_obra ON public.bitacora(obra_id);
CREATE INDEX idx_unidades_obra ON public.unidades(obra_id);
CREATE INDEX idx_complementos_unidad ON public.complementos(unidad_id);
CREATE INDEX idx_compradores_unidad ON public.compradores(unidad_id);
CREATE INDEX idx_compradores_cliente ON public.compradores(cliente_id);
CREATE INDEX idx_cuotas_plan ON public.cuotas(plan_pago_id);
CREATE INDEX idx_presupuestos_obra ON public.presupuestos(obra_id);
CREATE INDEX idx_items_presupuesto ON public.items_presupuesto(presupuesto_id);
CREATE INDEX idx_stock_producto ON public.stock_items(producto_id);
CREATE INDEX idx_stock_deposito ON public.stock_items(deposito_id);
CREATE INDEX idx_movimientos_producto ON public.movimientos_stock(producto_id);
CREATE INDEX idx_mantenimientos_vehiculo ON public.mantenimientos(vehiculo_id);

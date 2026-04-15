
-- ============================================================
-- Drop ALL existing permissive anon and authenticated policies
-- ============================================================

-- Helper: list of all tables to clean
-- obras
DROP POLICY IF EXISTS "Anon read obras" ON public.obras;
DROP POLICY IF EXISTS "Anon insert obras" ON public.obras;
DROP POLICY IF EXISTS "Anon update obras" ON public.obras;
DROP POLICY IF EXISTS "Anon delete obras" ON public.obras;
DROP POLICY IF EXISTS "Authenticated read obras" ON public.obras;
DROP POLICY IF EXISTS "Authenticated insert obras" ON public.obras;
DROP POLICY IF EXISTS "Authenticated update obras" ON public.obras;
DROP POLICY IF EXISTS "Authenticated delete obras" ON public.obras;

-- etapas
DROP POLICY IF EXISTS "Anon read etapas" ON public.etapas;
DROP POLICY IF EXISTS "Anon insert etapas" ON public.etapas;
DROP POLICY IF EXISTS "Anon update etapas" ON public.etapas;
DROP POLICY IF EXISTS "Anon delete etapas" ON public.etapas;
DROP POLICY IF EXISTS "Authenticated read etapas" ON public.etapas;
DROP POLICY IF EXISTS "Authenticated insert etapas" ON public.etapas;
DROP POLICY IF EXISTS "Authenticated update etapas" ON public.etapas;
DROP POLICY IF EXISTS "Authenticated delete etapas" ON public.etapas;

-- tareas
DROP POLICY IF EXISTS "Anon read tareas" ON public.tareas;
DROP POLICY IF EXISTS "Anon insert tareas" ON public.tareas;
DROP POLICY IF EXISTS "Anon update tareas" ON public.tareas;
DROP POLICY IF EXISTS "Anon delete tareas" ON public.tareas;
DROP POLICY IF EXISTS "Authenticated read tareas" ON public.tareas;
DROP POLICY IF EXISTS "Authenticated insert tareas" ON public.tareas;
DROP POLICY IF EXISTS "Authenticated update tareas" ON public.tareas;
DROP POLICY IF EXISTS "Authenticated delete tareas" ON public.tareas;

-- bitacora
DROP POLICY IF EXISTS "Anon read bitacora" ON public.bitacora;
DROP POLICY IF EXISTS "Anon insert bitacora" ON public.bitacora;
DROP POLICY IF EXISTS "Anon update bitacora" ON public.bitacora;
DROP POLICY IF EXISTS "Anon delete bitacora" ON public.bitacora;
DROP POLICY IF EXISTS "Authenticated read bitacora" ON public.bitacora;
DROP POLICY IF EXISTS "Authenticated insert bitacora" ON public.bitacora;
DROP POLICY IF EXISTS "Authenticated update bitacora" ON public.bitacora;
DROP POLICY IF EXISTS "Authenticated delete bitacora" ON public.bitacora;

-- unidades
DROP POLICY IF EXISTS "Anon read unidades" ON public.unidades;
DROP POLICY IF EXISTS "Anon insert unidades" ON public.unidades;
DROP POLICY IF EXISTS "Anon update unidades" ON public.unidades;
DROP POLICY IF EXISTS "Anon delete unidades" ON public.unidades;
DROP POLICY IF EXISTS "Authenticated read unidades" ON public.unidades;
DROP POLICY IF EXISTS "Authenticated insert unidades" ON public.unidades;
DROP POLICY IF EXISTS "Authenticated update unidades" ON public.unidades;
DROP POLICY IF EXISTS "Authenticated delete unidades" ON public.unidades;

-- complementos
DROP POLICY IF EXISTS "Anon read complementos" ON public.complementos;
DROP POLICY IF EXISTS "Anon insert complementos" ON public.complementos;
DROP POLICY IF EXISTS "Anon update complementos" ON public.complementos;
DROP POLICY IF EXISTS "Anon delete complementos" ON public.complementos;
DROP POLICY IF EXISTS "Authenticated read complementos" ON public.complementos;
DROP POLICY IF EXISTS "Authenticated insert complementos" ON public.complementos;
DROP POLICY IF EXISTS "Authenticated update complementos" ON public.complementos;
DROP POLICY IF EXISTS "Authenticated delete complementos" ON public.complementos;

-- compradores
DROP POLICY IF EXISTS "Anon read compradores" ON public.compradores;
DROP POLICY IF EXISTS "Anon insert compradores" ON public.compradores;
DROP POLICY IF EXISTS "Anon update compradores" ON public.compradores;
DROP POLICY IF EXISTS "Anon delete compradores" ON public.compradores;
DROP POLICY IF EXISTS "Authenticated read compradores" ON public.compradores;
DROP POLICY IF EXISTS "Authenticated insert compradores" ON public.compradores;
DROP POLICY IF EXISTS "Authenticated update compradores" ON public.compradores;
DROP POLICY IF EXISTS "Authenticated delete compradores" ON public.compradores;

-- clientes
DROP POLICY IF EXISTS "Anon read clientes" ON public.clientes;
DROP POLICY IF EXISTS "Anon insert clientes" ON public.clientes;
DROP POLICY IF EXISTS "Anon update clientes" ON public.clientes;
DROP POLICY IF EXISTS "Anon delete clientes" ON public.clientes;
DROP POLICY IF EXISTS "Authenticated read clientes" ON public.clientes;
DROP POLICY IF EXISTS "Authenticated insert clientes" ON public.clientes;
DROP POLICY IF EXISTS "Authenticated update clientes" ON public.clientes;
DROP POLICY IF EXISTS "Authenticated delete clientes" ON public.clientes;

-- proveedores
DROP POLICY IF EXISTS "Anon read proveedores" ON public.proveedores;
DROP POLICY IF EXISTS "Anon insert proveedores" ON public.proveedores;
DROP POLICY IF EXISTS "Anon update proveedores" ON public.proveedores;
DROP POLICY IF EXISTS "Anon delete proveedores" ON public.proveedores;
DROP POLICY IF EXISTS "Authenticated read proveedores" ON public.proveedores;
DROP POLICY IF EXISTS "Authenticated insert proveedores" ON public.proveedores;
DROP POLICY IF EXISTS "Authenticated update proveedores" ON public.proveedores;
DROP POLICY IF EXISTS "Authenticated delete proveedores" ON public.proveedores;

-- presupuestos
DROP POLICY IF EXISTS "Anon read presupuestos" ON public.presupuestos;
DROP POLICY IF EXISTS "Anon insert presupuestos" ON public.presupuestos;
DROP POLICY IF EXISTS "Anon update presupuestos" ON public.presupuestos;
DROP POLICY IF EXISTS "Anon delete presupuestos" ON public.presupuestos;
DROP POLICY IF EXISTS "Authenticated read presupuestos" ON public.presupuestos;
DROP POLICY IF EXISTS "Authenticated insert presupuestos" ON public.presupuestos;
DROP POLICY IF EXISTS "Authenticated update presupuestos" ON public.presupuestos;
DROP POLICY IF EXISTS "Authenticated delete presupuestos" ON public.presupuestos;

-- items_presupuesto
DROP POLICY IF EXISTS "Anon read items_presupuesto" ON public.items_presupuesto;
DROP POLICY IF EXISTS "Anon insert items_presupuesto" ON public.items_presupuesto;
DROP POLICY IF EXISTS "Anon update items_presupuesto" ON public.items_presupuesto;
DROP POLICY IF EXISTS "Anon delete items_presupuesto" ON public.items_presupuesto;
DROP POLICY IF EXISTS "Authenticated read items_presupuesto" ON public.items_presupuesto;
DROP POLICY IF EXISTS "Authenticated insert items_presupuesto" ON public.items_presupuesto;
DROP POLICY IF EXISTS "Authenticated update items_presupuesto" ON public.items_presupuesto;
DROP POLICY IF EXISTS "Authenticated delete items_presupuesto" ON public.items_presupuesto;

-- cuotas
DROP POLICY IF EXISTS "Anon read cuotas" ON public.cuotas;
DROP POLICY IF EXISTS "Anon insert cuotas" ON public.cuotas;
DROP POLICY IF EXISTS "Anon update cuotas" ON public.cuotas;
DROP POLICY IF EXISTS "Anon delete cuotas" ON public.cuotas;
DROP POLICY IF EXISTS "Authenticated read cuotas" ON public.cuotas;
DROP POLICY IF EXISTS "Authenticated insert cuotas" ON public.cuotas;
DROP POLICY IF EXISTS "Authenticated update cuotas" ON public.cuotas;
DROP POLICY IF EXISTS "Authenticated delete cuotas" ON public.cuotas;

-- planes_pago
DROP POLICY IF EXISTS "Anon read planes_pago" ON public.planes_pago;
DROP POLICY IF EXISTS "Anon insert planes_pago" ON public.planes_pago;
DROP POLICY IF EXISTS "Anon update planes_pago" ON public.planes_pago;
DROP POLICY IF EXISTS "Anon delete planes_pago" ON public.planes_pago;
DROP POLICY IF EXISTS "Authenticated read planes_pago" ON public.planes_pago;
DROP POLICY IF EXISTS "Authenticated insert planes_pago" ON public.planes_pago;
DROP POLICY IF EXISTS "Authenticated update planes_pago" ON public.planes_pago;
DROP POLICY IF EXISTS "Authenticated delete planes_pago" ON public.planes_pago;

-- productos
DROP POLICY IF EXISTS "Anon read productos" ON public.productos;
DROP POLICY IF EXISTS "Anon insert productos" ON public.productos;
DROP POLICY IF EXISTS "Anon update productos" ON public.productos;
DROP POLICY IF EXISTS "Anon delete productos" ON public.productos;
DROP POLICY IF EXISTS "Authenticated read productos" ON public.productos;
DROP POLICY IF EXISTS "Authenticated insert productos" ON public.productos;
DROP POLICY IF EXISTS "Authenticated update productos" ON public.productos;
DROP POLICY IF EXISTS "Authenticated delete productos" ON public.productos;

-- stock_items
DROP POLICY IF EXISTS "Anon read stock_items" ON public.stock_items;
DROP POLICY IF EXISTS "Anon insert stock_items" ON public.stock_items;
DROP POLICY IF EXISTS "Anon update stock_items" ON public.stock_items;
DROP POLICY IF EXISTS "Anon delete stock_items" ON public.stock_items;
DROP POLICY IF EXISTS "Authenticated read stock_items" ON public.stock_items;
DROP POLICY IF EXISTS "Authenticated insert stock_items" ON public.stock_items;
DROP POLICY IF EXISTS "Authenticated update stock_items" ON public.stock_items;
DROP POLICY IF EXISTS "Authenticated delete stock_items" ON public.stock_items;

-- movimientos_stock
DROP POLICY IF EXISTS "Anon read movimientos_stock" ON public.movimientos_stock;
DROP POLICY IF EXISTS "Anon insert movimientos_stock" ON public.movimientos_stock;
DROP POLICY IF EXISTS "Anon update movimientos_stock" ON public.movimientos_stock;
DROP POLICY IF EXISTS "Anon delete movimientos_stock" ON public.movimientos_stock;
DROP POLICY IF EXISTS "Authenticated read movimientos_stock" ON public.movimientos_stock;
DROP POLICY IF EXISTS "Authenticated insert movimientos_stock" ON public.movimientos_stock;
DROP POLICY IF EXISTS "Authenticated update movimientos_stock" ON public.movimientos_stock;
DROP POLICY IF EXISTS "Authenticated delete movimientos_stock" ON public.movimientos_stock;

-- depositos
DROP POLICY IF EXISTS "Anon read depositos" ON public.depositos;
DROP POLICY IF EXISTS "Anon insert depositos" ON public.depositos;
DROP POLICY IF EXISTS "Anon update depositos" ON public.depositos;
DROP POLICY IF EXISTS "Anon delete depositos" ON public.depositos;
DROP POLICY IF EXISTS "Authenticated read depositos" ON public.depositos;
DROP POLICY IF EXISTS "Authenticated insert depositos" ON public.depositos;
DROP POLICY IF EXISTS "Authenticated update depositos" ON public.depositos;
DROP POLICY IF EXISTS "Authenticated delete depositos" ON public.depositos;

-- herramientas
DROP POLICY IF EXISTS "Anon read herramientas" ON public.herramientas;
DROP POLICY IF EXISTS "Anon insert herramientas" ON public.herramientas;
DROP POLICY IF EXISTS "Anon update herramientas" ON public.herramientas;
DROP POLICY IF EXISTS "Anon delete herramientas" ON public.herramientas;
DROP POLICY IF EXISTS "Authenticated read herramientas" ON public.herramientas;
DROP POLICY IF EXISTS "Authenticated insert herramientas" ON public.herramientas;
DROP POLICY IF EXISTS "Authenticated update herramientas" ON public.herramientas;
DROP POLICY IF EXISTS "Authenticated delete herramientas" ON public.herramientas;

-- vehiculos
DROP POLICY IF EXISTS "Anon read vehiculos" ON public.vehiculos;
DROP POLICY IF EXISTS "Anon insert vehiculos" ON public.vehiculos;
DROP POLICY IF EXISTS "Anon update vehiculos" ON public.vehiculos;
DROP POLICY IF EXISTS "Anon delete vehiculos" ON public.vehiculos;
DROP POLICY IF EXISTS "Authenticated read vehiculos" ON public.vehiculos;
DROP POLICY IF EXISTS "Authenticated insert vehiculos" ON public.vehiculos;
DROP POLICY IF EXISTS "Authenticated update vehiculos" ON public.vehiculos;
DROP POLICY IF EXISTS "Authenticated delete vehiculos" ON public.vehiculos;

-- mantenimientos
DROP POLICY IF EXISTS "Anon read mantenimientos" ON public.mantenimientos;
DROP POLICY IF EXISTS "Anon insert mantenimientos" ON public.mantenimientos;
DROP POLICY IF EXISTS "Anon update mantenimientos" ON public.mantenimientos;
DROP POLICY IF EXISTS "Anon delete mantenimientos" ON public.mantenimientos;
DROP POLICY IF EXISTS "Authenticated read mantenimientos" ON public.mantenimientos;
DROP POLICY IF EXISTS "Authenticated insert mantenimientos" ON public.mantenimientos;
DROP POLICY IF EXISTS "Authenticated update mantenimientos" ON public.mantenimientos;
DROP POLICY IF EXISTS "Authenticated delete mantenimientos" ON public.mantenimientos;

-- ============================================================
-- NEW ROLE-BASED POLICIES
-- ============================================================

-- Helper expression shortcuts (used inline):
-- has_role(auth.uid(), 'admin') = is admin
-- admin OR operaciones = construction ops
-- admin OR finanzas = finance ops
-- admin OR ventas = sales ops

-- ===================== OBRAS (admin, operaciones) =====================
CREATE POLICY "Auth users can view obras" ON public.obras FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/ops can insert obras" ON public.obras FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));
CREATE POLICY "Admin/ops can update obras" ON public.obras FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));
CREATE POLICY "Admin/ops can delete obras" ON public.obras FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));

-- ===================== ETAPAS (admin, operaciones) =====================
CREATE POLICY "Auth users can view etapas" ON public.etapas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/ops can insert etapas" ON public.etapas FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));
CREATE POLICY "Admin/ops can update etapas" ON public.etapas FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));
CREATE POLICY "Admin/ops can delete etapas" ON public.etapas FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));

-- ===================== TAREAS (admin, operaciones) =====================
CREATE POLICY "Auth users can view tareas" ON public.tareas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/ops can insert tareas" ON public.tareas FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));
CREATE POLICY "Admin/ops can update tareas" ON public.tareas FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));
CREATE POLICY "Admin/ops can delete tareas" ON public.tareas FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));

-- ===================== BITACORA (admin, operaciones) =====================
CREATE POLICY "Auth users can view bitacora" ON public.bitacora FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/ops can insert bitacora" ON public.bitacora FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));
CREATE POLICY "Admin/ops can update bitacora" ON public.bitacora FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));
CREATE POLICY "Admin/ops can delete bitacora" ON public.bitacora FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));

-- ===================== UNIDADES (admin, ventas) =====================
CREATE POLICY "Auth users can view unidades" ON public.unidades FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/ventas can insert unidades" ON public.unidades FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'ventas'::app_role));
CREATE POLICY "Admin/ventas can update unidades" ON public.unidades FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'ventas'::app_role));
CREATE POLICY "Admin/ventas can delete unidades" ON public.unidades FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'ventas'::app_role));

-- ===================== COMPLEMENTOS (admin, ventas) =====================
CREATE POLICY "Auth users can view complementos" ON public.complementos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/ventas can insert complementos" ON public.complementos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'ventas'::app_role));
CREATE POLICY "Admin/ventas can update complementos" ON public.complementos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'ventas'::app_role));
CREATE POLICY "Admin/ventas can delete complementos" ON public.complementos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'ventas'::app_role));

-- ===================== COMPRADORES (admin, ventas) =====================
CREATE POLICY "Auth users can view compradores" ON public.compradores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/ventas can insert compradores" ON public.compradores FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'ventas'::app_role));
CREATE POLICY "Admin/ventas can update compradores" ON public.compradores FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'ventas'::app_role));
CREATE POLICY "Admin/ventas can delete compradores" ON public.compradores FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'ventas'::app_role));

-- ===================== CLIENTES (admin, ventas, finanzas) =====================
CREATE POLICY "Auth users can view clientes" ON public.clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/ventas/fin can insert clientes" ON public.clientes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'ventas'::app_role) OR public.has_role(auth.uid(), 'finanzas'::app_role));
CREATE POLICY "Admin/ventas/fin can update clientes" ON public.clientes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'ventas'::app_role) OR public.has_role(auth.uid(), 'finanzas'::app_role));
CREATE POLICY "Admin/ventas/fin can delete clientes" ON public.clientes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'ventas'::app_role) OR public.has_role(auth.uid(), 'finanzas'::app_role));

-- ===================== PROVEEDORES (admin, finanzas) =====================
CREATE POLICY "Auth users can view proveedores" ON public.proveedores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/fin can insert proveedores" ON public.proveedores FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'finanzas'::app_role));
CREATE POLICY "Admin/fin can update proveedores" ON public.proveedores FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'finanzas'::app_role));
CREATE POLICY "Admin/fin can delete proveedores" ON public.proveedores FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'finanzas'::app_role));

-- ===================== PRESUPUESTOS (admin, finanzas) =====================
CREATE POLICY "Auth users can view presupuestos" ON public.presupuestos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/fin can insert presupuestos" ON public.presupuestos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'finanzas'::app_role));
CREATE POLICY "Admin/fin can update presupuestos" ON public.presupuestos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'finanzas'::app_role));
CREATE POLICY "Admin/fin can delete presupuestos" ON public.presupuestos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'finanzas'::app_role));

-- ===================== ITEMS_PRESUPUESTO (admin, finanzas) =====================
CREATE POLICY "Auth users can view items_presupuesto" ON public.items_presupuesto FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/fin can insert items_presupuesto" ON public.items_presupuesto FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'finanzas'::app_role));
CREATE POLICY "Admin/fin can update items_presupuesto" ON public.items_presupuesto FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'finanzas'::app_role));
CREATE POLICY "Admin/fin can delete items_presupuesto" ON public.items_presupuesto FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'finanzas'::app_role));

-- ===================== CUOTAS (admin, finanzas) =====================
CREATE POLICY "Auth users can view cuotas" ON public.cuotas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/fin can insert cuotas" ON public.cuotas FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'finanzas'::app_role));
CREATE POLICY "Admin/fin can update cuotas" ON public.cuotas FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'finanzas'::app_role));
CREATE POLICY "Admin/fin can delete cuotas" ON public.cuotas FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'finanzas'::app_role));

-- ===================== PLANES_PAGO (admin, finanzas) =====================
CREATE POLICY "Auth users can view planes_pago" ON public.planes_pago FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/fin can insert planes_pago" ON public.planes_pago FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'finanzas'::app_role));
CREATE POLICY "Admin/fin can update planes_pago" ON public.planes_pago FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'finanzas'::app_role));
CREATE POLICY "Admin/fin can delete planes_pago" ON public.planes_pago FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'finanzas'::app_role));

-- ===================== PRODUCTOS (admin, operaciones) =====================
CREATE POLICY "Auth users can view productos" ON public.productos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/ops can insert productos" ON public.productos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));
CREATE POLICY "Admin/ops can update productos" ON public.productos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));
CREATE POLICY "Admin/ops can delete productos" ON public.productos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));

-- ===================== STOCK_ITEMS (admin, operaciones) =====================
CREATE POLICY "Auth users can view stock_items" ON public.stock_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/ops can insert stock_items" ON public.stock_items FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));
CREATE POLICY "Admin/ops can update stock_items" ON public.stock_items FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));
CREATE POLICY "Admin/ops can delete stock_items" ON public.stock_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));

-- ===================== MOVIMIENTOS_STOCK (admin, operaciones) =====================
CREATE POLICY "Auth users can view movimientos_stock" ON public.movimientos_stock FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/ops can insert movimientos_stock" ON public.movimientos_stock FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));
CREATE POLICY "Admin/ops can update movimientos_stock" ON public.movimientos_stock FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));
CREATE POLICY "Admin/ops can delete movimientos_stock" ON public.movimientos_stock FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));

-- ===================== DEPOSITOS (admin, operaciones) =====================
CREATE POLICY "Auth users can view depositos" ON public.depositos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/ops can insert depositos" ON public.depositos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));
CREATE POLICY "Admin/ops can update depositos" ON public.depositos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));
CREATE POLICY "Admin/ops can delete depositos" ON public.depositos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));

-- ===================== HERRAMIENTAS (admin, operaciones) =====================
CREATE POLICY "Auth users can view herramientas" ON public.herramientas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/ops can insert herramientas" ON public.herramientas FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));
CREATE POLICY "Admin/ops can update herramientas" ON public.herramientas FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));
CREATE POLICY "Admin/ops can delete herramientas" ON public.herramientas FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));

-- ===================== VEHICULOS (admin, operaciones) =====================
CREATE POLICY "Auth users can view vehiculos" ON public.vehiculos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/ops can insert vehiculos" ON public.vehiculos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));
CREATE POLICY "Admin/ops can update vehiculos" ON public.vehiculos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));
CREATE POLICY "Admin/ops can delete vehiculos" ON public.vehiculos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));

-- ===================== MANTENIMIENTOS (admin, operaciones) =====================
CREATE POLICY "Auth users can view mantenimientos" ON public.mantenimientos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/ops can insert mantenimientos" ON public.mantenimientos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));
CREATE POLICY "Admin/ops can update mantenimientos" ON public.mantenimientos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));
CREATE POLICY "Admin/ops can delete mantenimientos" ON public.mantenimientos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operaciones'::app_role));

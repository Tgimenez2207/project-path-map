

# Plan: Integración Materiales + Stock + Catálogo de Terminaciones

## Idea central

En lugar de crear una tabla `materiales` separada del stock, **extender la tabla `productos` existente** para que también sirva como catálogo de terminaciones. Así un mismo producto puede estar en el inventario (stock) Y ser una opción de terminación para clientes.

## Estructura actual del Stock

```text
productos (catálogo)          stock_items (inventario)
├── nombre, codigo            ├── producto_id → productos
├── categoria                 ├── deposito_id → depositos
├── unidad_medida             └── cantidad
└── stock_minimo
```

## Cambios propuestos

### 1. Ampliar tabla `productos` (migración)

Agregar campos para que funcione como catálogo de materiales/terminaciones:

- `foto_url` (text) — foto del material
- `marca` (text) — marca comercial
- `modelo` (text) — modelo específico
- `precio_referencia` (numeric) — precio de referencia
- `moneda` (text, default 'USD')
- `proveedor_id` (uuid, FK a proveedores, nullable) — proveedor principal
- `es_terminacion` (bool, default false) — si aplica como opción de terminación para clientes
- `descripcion` (text) — descripción detallada
- `caracteristicas` (jsonb) — atributos técnicos (color, medidas, etc.)

### 2. Crear tabla `selecciones_terminacion` (migración)

Para que el cliente elija terminaciones desde el portal:

- `id`, `unidad_id`, `producto_id`, `categoria`, `cliente_id`, `estado` (pendiente/aprobada/rechazada), `notas`, `created_at`

### 3. Página `/materiales` — Catálogo visual (nueva)

Vista de galería con fotos, filtros por categoría, proveedor y precio. CRUD completo. Al crear un material, automáticamente se crea el `producto` en el sistema de stock.

- Filtro toggle "Solo terminaciones" para ver qué productos están disponibles para clientes
- Badge del stock actual (si tiene stock_items asociados)
- Link directo al proveedor

### 4. Vincular Stock ↔ Materiales

- Desde Stock: al ver un producto, link "Ver en catálogo" si tiene foto/precio
- Desde Materiales: badge con cantidad en stock actual, botón "Ver stock" para ir al detalle de inventario
- Misma tabla `productos` = un solo lugar de verdad

### 5. Portal del cliente — `/portal/terminaciones`

Catálogo filtrado (`es_terminacion = true`) con fotos y precios. El cliente elige por unidad, se guarda en `selecciones_terminacion`.

### 6. Pestaña "Terminaciones" en UnidadDetalle

Ver selecciones del cliente, aprobar/rechazar, con foto del material elegido.

## Archivos a crear/modificar

- **Migración SQL**: ampliar `productos`, crear `selecciones_terminacion` + RLS
- `src/pages/Materiales.tsx` — Catálogo visual con CRUD
- `src/pages/Stock.tsx` — Agregar links cruzados al catálogo
- `src/pages/portal/PortalTerminaciones.tsx` — Selección de terminaciones
- `src/pages/UnidadDetalle.tsx` — Pestaña terminaciones
- `src/components/layout/AppSidebar.tsx` — Entrada "Materiales"
- `src/components/layout/PortalSidebar.tsx` — Entrada "Terminaciones"
- `src/App.tsx` — Rutas nuevas
- `src/hooks/useSupabaseData.ts` — Hooks nuevos

## Ventaja de este enfoque

Un solo producto puede ser inventariado en Stock Y ofrecido como terminación al cliente. No hay duplicación de datos. Si comprás 100 m² de porcelanato, el stock se actualiza y el cliente ve la misma ficha con foto y precio.




# Plan: Multi-proveedor con listas de precios y comparador

## Problema actual
Cada producto tiene un solo `proveedor_id` y un solo `precio_referencia`. No se pueden asociar múltiples proveedores ni comparar precios entre ellos.

## Cambios propuestos

### 1. Nueva tabla `precios_producto` (migración)

Tabla intermedia que vincula productos con proveedores y sus precios:

```text
precios_producto
├── id (uuid, PK)
├── producto_id (uuid, FK → productos)
├── proveedor_id (uuid, FK → proveedores)
├── precio (numeric)
├── moneda (text, default 'USD')
├── lista (text) — nombre de lista de precios (ej: "Lista Mayorista", "Lista Minorista")
├── fecha_vigencia (date) — desde cuándo aplica este precio
├── vigente (boolean, default true)
├── notas (text, nullable)
├── created_at (timestamptz)
```

RLS: mismas políticas que `productos` (admin/ops escritura, authenticated lectura).

### 2. Actualizar Materiales.tsx

- **En la tarjeta del material**: mostrar cantidad de proveedores asociados y rango de precio (min-max) en lugar de un solo precio.
- **En el formulario de edición**: reemplazar el campo "Proveedor" + "Precio ref." por una sección "Proveedores y Precios" donde se pueden agregar/quitar filas (proveedor, precio, moneda, lista, fecha).
- **Nuevo botón "Comparar precios"** en cada tarjeta: abre un diálogo con tabla comparativa de todos los proveedores/listas para ese producto, ordenada por precio.

### 3. Vista de comparación de precios

Diálogo o panel que muestra para un producto seleccionado:
- Tabla con columnas: Proveedor, Lista, Precio, Moneda, Fecha vigencia, Diferencia %
- Resaltado del precio más bajo
- Ordenable por precio

### 4. Hooks nuevos en useSupabaseData.ts

- `usePreciosProducto(productoId)` — precios de un producto con join a proveedores
- `usePreciosProductos()` — todos los precios (para vista general)

### Archivos a crear/modificar

- **Migración SQL**: crear `precios_producto` + RLS
- **`src/pages/Materiales.tsx`**: multi-proveedor en form, rango de precios en tarjeta, comparador
- **`src/hooks/useSupabaseData.ts`**: hooks para `precios_producto`

### Nota sobre `proveedor_id` existente en `productos`

Se mantiene como "proveedor principal" para compatibilidad con Stock. Los precios detallados se gestionan desde la nueva tabla.


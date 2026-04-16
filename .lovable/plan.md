

# Plan: Flujo integrado Cómputo IA → Presupuesto guardado

## Problema actual
El Cómputo IA genera una estimación que solo se puede exportar a CSV. Los presupuestos se crean manualmente en otra pestaña. No hay conexión entre ambos.

## Flujo propuesto

```text
┌──────────────┐    "Convertir en     ┌──────────────────┐    Guardar    ┌───────────────┐
│  Cómputo IA  │──  Presupuesto" ──>  │ Formulario con   │──────────>   │ Presupuesto   │
│  (genera     │                      │ datos prellenados │              │ en DB con     │
│   estimación)│                      │ + rubros como     │              │ desglose de   │
└──────────────┘                      │   ítems detalle   │              │ rubros        │
                                      └──────────────────┘              └───────────────┘
```

## Cambios

### 1. Nueva tabla `presupuesto_items` (migración)
Almacena el desglose por rubros de cada presupuesto:
- `id`, `presupuesto_id` (FK), `nombre` (rubro), `incidencia`, `costo_min`, `costo_max`, `costo_estimado`, `unidad`, `observaciones`
- RLS: mismas políticas que `presupuestos`

### 2. Agregar columna `origen` a `presupuestos` (migración)
- Campo `origen TEXT DEFAULT 'manual'` para distinguir presupuestos creados manualmente vs generados desde Cómputo IA
- Campo `datos_computo JSONB` para guardar los supuestos, recomendaciones y parámetros originales del cómputo

### 3. Botón "Convertir en Presupuesto" en ComputoIATab
Después de generar un cómputo, aparece un botón que:
- Abre un diálogo con datos prellenados (descripción auto-generada, monto total, moneda USD)
- Permite seleccionar obra y proveedor antes de guardar
- Al guardar: inserta el presupuesto + todos los rubros como `presupuesto_items`

### 4. Vista detalle con desglose de rubros en PresupuestosListTab
- Al ver un presupuesto que tiene ítems, mostrar la tabla de rubros con incidencias y costos
- Badge "Generado por IA" cuando `origen = 'computo_ia'`

### 5. Historial de cómputos guardados
- Nueva tabla `computos` para persistir cada cómputo generado (parámetros de entrada + resultado completo)
- En la pestaña Cómputo IA, mostrar un listado de cómputos anteriores que se pueden volver a ver o convertir en presupuesto

## Archivos a modificar/crear
- **Migración SQL**: crear `presupuesto_items`, `computos`, agregar columnas a `presupuestos`
- `src/components/presupuestos/ComputoIATab.tsx`: botón convertir, historial de cómputos
- `src/components/presupuestos/PresupuestosListTab.tsx`: vista detalle con rubros, badge origen
- `src/hooks/useSupabaseData.ts`: hooks para `presupuesto_items` y `computos`


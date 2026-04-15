

# Plan: Módulo de Proveedores con IA

## Resumen
Reemplazar completamente `src/pages/Proveedores.tsx` con un módulo avanzado que incluye evaluaciones, cotizaciones, análisis IA, y comparación entre proveedores. Se usa estado local con mock data (sin nuevas tablas en DB). Se crea una edge function para el análisis IA.

## Archivos a crear/modificar

### 1. Crear `src/types/proveedores.ts`
Tipos `Proveedor`, `Evaluacion`, `Cotizacion`, `RubroProveedor`, `EstadoProveedor` exactamente como se especifica.

### 2. Crear `src/data/mockProveedores.ts`
8-10 proveedores con rubros variados, 2-3 evaluaciones y 1-2 cotizaciones cada uno. Datos realistas del mercado argentino.

### 3. Crear `supabase/functions/ai-proveedores/index.ts`
Edge function que usa Lovable AI Gateway (no Anthropic directo). Soporta dos modos:
- `analizar`: análisis individual de un proveedor
- `comparar`: recomendación entre proveedores seleccionados

Reutiliza el patrón de `ai-rinde` con CORS headers y manejo de 429/402.

### 4. Reemplazar `src/pages/Proveedores.tsx`
Componente completo con:
- **Estado local** con `useState` para proveedores (mock), filtros, selección, detalle
- **Header** con contadores y botón "Comparar" (visible cuando hay 2+ seleccionados)
- **Barra de filtros**: búsqueda + select rubro + select estado + select ordenar
- **4 KPIs**: activos, rating promedio, cotizaciones del mes, en evaluación
- **Grid de cards** (2 cols desktop, 1 mobile) con checkbox de selección, rating con estrellas Unicode, badges por rubro con colores, botones "Ver detalle" y "Analizar con IA"
- **Sheet de detalle** (shadcn Sheet desde la derecha) con 4 tabs:
  - Resumen (contacto, notas, resumen IA)
  - Evaluaciones (lista + formulario nueva evaluación con sliders 1-5)
  - Cotizaciones (tabla + formulario nueva cotización)
  - IA (chat contextual del proveedor via edge function)
- **Dialog de comparación** (max-w-4xl) con tabla comparativa, celdas ganadoras en verde, botón "Que la IA recomiende"
- **Dialog nuevo proveedor** con todos los campos del spec
- **Función `calcularRating`** como se especifica
- Formateo con `toLocaleString('es-AR')`, inputs `min={0}`

### 5. Agregar estilos mobile
FAB fijo en mobile cuando hay proveedores seleccionados para el botón "Comparar".

## Detalles técnicos

- **IA**: Edge function `ai-proveedores` usa `LOVABLE_API_KEY` + Lovable AI Gateway con `google/gemini-3-flash-preview`
- **Sin migraciones DB**: Todo el módulo usa estado local con mock data (el spec no pide persistencia en Supabase para las nuevas entidades evaluaciones/cotizaciones)
- **La tabla `proveedores` existente en Supabase no se usa** en esta nueva versión -- el spec pide mock data con estructura diferente
- **Sidebar**: Ya tiene el item "Proveedores" con ícono `Truck`, se mantiene


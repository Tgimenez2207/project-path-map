

# Plan: Módulo Simulador de Rinde Inmobiliario

## Resumen
Crear una nueva página "Simulador de Rinde" que permite calcular la rentabilidad de proyectos inmobiliarios con inputs interactivos, resultados en tiempo real, análisis con IA (via Lovable AI Gateway) y exportación PDF.

## Cambios a realizar

### 1. Crear edge function para análisis IA
**Archivo:** `supabase/functions/ai-rinde/index.ts`

El prompt del usuario menciona Anthropic API directamente, pero el proyecto ya usa Lovable AI Gateway (ver `ai-copilot`). Se reutilizará ese patrón con `google/gemini-3-flash-preview` -- no requiere API key adicional.

La función recibirá los inputs y resultados del simulador, y devolverá el análisis estructurado usando el mismo system prompt de experto inmobiliario argentino que se describe en el spec.

### 2. Crear la página del simulador
**Archivo:** `src/pages/SimuladorRinde.tsx`

Componente completo con:
- **Estado:** `inputs` (todos los campos del formulario), `escenario` (optimista/base/conservador), `isLoadingIA`, `analisisIA`
- **Cálculos en `useMemo`:** costoTotal, utilidadNeta, margenSobreCostos, ROI anualizado, punto de equilibrio, etc. -- exactamente como se especifica
- **Layout dos columnas** (60/40 en desktop, stacked en mobile):
  - Izquierda: 3 Cards con formulario (Datos del proyecto, Estructura de costos con sliders+inputs para %, Precio de venta)
  - Derecha: Panel sticky con KPIs (grid 2x2 principal + secundario), tabla desglose, barras de composición de costos
- **Selector de escenario:** ToggleGroup con 3 opciones prominentes
- **Análisis IA:** Llama a la edge function `ai-rinde` y muestra resultado en Card con Sparkles icon
- **Exportar PDF:** `window.print()` con estilos `@media print` para ocultar sidebar y formulario
- Formateo con `.toLocaleString('es-AR')`, inputs con `min={0}`

### 3. Agregar ruta y navegación
**Archivo:** `src/App.tsx`
- Import `SimuladorRinde` y agregar `<Route path="simulador" element={<SimuladorRinde />} />`

**Archivo:** `src/components/layout/AppSidebar.tsx`
- Agregar item `{ title: 'Simulador de Rinde', url: '/simulador', icon: Calculator, module: 'simulador' }` en `menuItems`

### 4. Estilos de impresión
**Archivo:** `src/index.css`
- Agregar bloque `@media print` para ocultar sidebar y columna de formulario, expandir resultados al 100%

## Detalles técnicos

- **IA:** Edge function `ai-rinde` usa Lovable AI Gateway (no Anthropic directamente) con `LOVABLE_API_KEY` ya configurado
- **Sin base de datos:** Este módulo es puramente de cálculo client-side, no requiere tablas ni migraciones
- **Acceso:** Se filtra por `canAccess('simulador')` -- disponible para todos los roles autenticados


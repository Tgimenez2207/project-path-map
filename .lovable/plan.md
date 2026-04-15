

# Plan: Módulo Gantt de Obra

## Resumen
Crear un diagrama de Gantt interactivo para visualizar el cronograma de cada obra, con barras posicionadas por tiempo, collapse/expand de etapas, edición inline, y análisis IA del cronograma. Se integra como nueva tab en ObraDetalle y como página standalone.

## Archivos a crear

### 1. `src/types/gantt.ts`
Tipos `TipoNodo`, `EstadoNodo`, `NodoGantt` según el spec.

### 2. `src/data/mockGantt.ts`
~20 nodos con la estructura jerárica especificada (5 etapas, subetapas y tareas), 240 días totales, TODAY_OFFSET=135.

### 3. `src/pages/GanttObra.tsx`
Página completa del Gantt con:
- **Header**: botón volver, nombre obra, botones "Análisis IA", "Exportar" (print), "Nueva tarea"
- **Toolbar**: controles de zoom (Meses/Semanas/Días), botón "Hoy" (scroll programático), leyenda de colores
- **Gantt chart**: div con overflow-x scroll, columna izquierda sticky (260px, z-10, bg sólido) con nombres indentados por tipo + collapse/expand, área derecha con barras coloreadas posicionadas por `left` y `width` calculados con `dayPx`, overlay de avance, línea roja "hoy"
- **Sheet de detalle** (shadcn Sheet derecha): campos editables para inicio, duración, avance (Slider), responsable, dependencia (Select), estado (Select), notas, botón eliminar
- **Dialog nuevo nodo**: formulario con nombre, tipo, padre, inicio, duración, responsable, dependencia, crítica, notas
- **Card de análisis IA**: debajo del Gantt, usa edge function `ai-copilot` (ya existente, ya soporta contexto genérico) para analizar riesgos del cronograma
- **Mobile**: versión simplificada tipo lista con progress bars
- Scroll automático al día "hoy" al montar (`useRef` + `scrollTo`)

### 4. Modificar `src/pages/ObraDetalle.tsx`
- Agregar tab "Cronograma" con ícono `GanttChart` entre "Etapas y Tareas" y "Bitácora"
- Agregar botón "Ver Gantt completo" en Quick Actions que navega a `/obras/:obraId/cronograma`
- El contenido de la tab muestra una versión embebida simplificada o un link al Gantt completo

### 5. Modificar `src/App.tsx`
- Agregar import y ruta: `<Route path="obras/:obraId/cronograma" element={<GanttObra />} />`

## Detalles técnicos

- **IA**: Reutiliza la edge function `ai-copilot` existente (ya acepta contexto genérico). No se crea nueva edge function.
- **Sin migraciones DB**: Todo el módulo usa estado local con mock data.
- **Sticky column**: La columna izquierda usa `position: sticky; left: 0; z-index: 10` con `bg-background` para quedar fija durante scroll horizontal.
- **Barras**: Posición calculada como `left: nodo.inicioOffset * dayPx`, `width: nodo.duracion * dayPx`. Colores: rojo para ruta crítica, azul para etapas, verde para subetapas, naranja para tareas.
- **Dependencias**: Se renderizan visualmente como flechas simples (líneas SVG o borders) entre barras conectadas.


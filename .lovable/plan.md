

# Plan: Consolidar IA en un Hub Central

## Problema actual
La IA está dispersa en 5 lugares distintos sin conexión clara:
1. **Sidebar "IA Copilot"** → `/ia` (IAPanel.tsx) — solo muestra alertas por obra, redundante con el tab IA de ObraDetalle
2. **Tab "IA" en ObraDetalle** → IACopilotTab.tsx — chat + alertas por obra
3. **MarketingDialog** en ObraDetalle — genera contenido marketing
4. **Proveedores** — análisis, comparación y chat IA inline
5. **Simulador de Rinde** — análisis IA del rinde

El IAPanel de la sidebar es el más débil: solo replica alertas que ya están en cada obra. No agrega valor.

## Solución
Transformar `/ia` (IAPanel.tsx) en un **Hub de IA centralizado** que sirva como punto de entrada único, con accesos directos a todas las funcionalidades IA del sistema.

## Cambios a realizar

### 1. Reescribir `src/pages/IAPanel.tsx` como Hub de IA

Nueva estructura con 3 secciones:

**a) Chat IA general (protagonista)**
Un copilot conversacional que no está atado a una obra específica. Usa la edge function `ai-copilot` existente pero con un system prompt genérico sobre gestión de obras. El usuario puede preguntar sobre cualquier tema del negocio. Streaming con el mismo patrón de IACopilotTab.

**b) Accesos directos a funcionalidades IA**
Grid de cards que linkean a cada feature IA existente:
- "Analizar obra" → navega a `/obras/:id` tab IA
- "Comparar proveedores" → navega a `/proveedores`
- "Simular rinde" → navega a `/simulador`
- "Generar contenido" → navega a `/obras/:id` (marketing)

Cada card muestra icono, título, descripción corta de qué hace.

**c) Resumen de alertas cross-obra**
Mantener la funcionalidad actual de IAPanel (analizar todas las obras) pero como sección colapsable secundaria, no como feature principal.

### 2. Renombrar en sidebar
Cambiar "IA Copilot" → "Asistente IA" en `AppSidebar.tsx` para diferenciarlo del copilot contextual de cada obra.

### 3. Crear edge function `ai-assistant` (o reutilizar `ai-copilot`)
Adaptar `ai-copilot` para que funcione sin `obraContext` obligatorio (hacerlo opcional). Si no recibe contexto de obra, usa un prompt genérico de experto en construcción. Esto evita crear otra edge function.

## Archivos a modificar
- `src/pages/IAPanel.tsx` — reescribir completo
- `src/components/layout/AppSidebar.tsx` — renombrar label
- `supabase/functions/ai-copilot/index.ts` — hacer `obraContext` opcional

## Detalles técnicos
- El chat general reutiliza el patrón de streaming SSE existente en IACopilotTab
- Los mensajes del chat general se persisten en localStorage con key `ia-assistant-general`
- No se crean tablas nuevas ni migraciones
- Las funcionalidades IA en Proveedores, Simulador y ObraDetalle quedan intactas — solo se agrega un hub que las conecta


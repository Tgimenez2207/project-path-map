

## Plan: Módulo de IA — Copilot, Alertas y Marketing

### Nota importante sobre la API de IA

En lugar de llamar directamente a la API de Claude/Anthropic (que requiere una API key del usuario), vamos a usar **Lovable AI Gateway** que ya está integrado en el proyecto. Esto significa que no necesitas configurar ninguna API key externa. El modelo usado sera potente y compatible con todo lo solicitado.

Si preferis usar Claude directamente con tu propia API key, indicalo y ajustamos.

---

### Archivos a crear

1. **`src/pages/IAPanel.tsx`** — Pagina global `/ia` con grid de obras y analisis por obra
2. **`src/components/obra/IACopilotTab.tsx`** — Tab de IA Copilot (chat + alertas)
3. **`src/components/obra/MarketingDialog.tsx`** — Dialog de generacion de contenido marketing
4. **`supabase/functions/ai-copilot/index.ts`** — Edge function para chat copilot
5. **`supabase/functions/ai-alerts/index.ts`** — Edge function para alertas JSON
6. **`supabase/functions/ai-marketing/index.ts`** — Edge function para contenido marketing

### Archivos a modificar

1. **`src/pages/ObraDetalle.tsx`** — Agregar tab "IA Copilot", boton "Generar Contenido" en Quick Actions
2. **`src/components/layout/AppSidebar.tsx`** — Agregar item "IA Copilot" con icono Sparkles en menuItems
3. **`src/App.tsx`** — Agregar ruta `/ia` con IAPanel

---

### Detalle por componente

#### 1. Tab "IA Copilot" en ObraDetalle (`IACopilotTab.tsx`)

**Seccion A — Chat Copilot:**
- Input con placeholder y boton "Consultar" (icono Send)
- Historial de mensajes: usuario en `bg-muted/50`, IA en `bg-primary/10`
- Skeleton mientras carga
- useState local para historial (se resetea al cambiar obra)
- Llama a edge function `ai-copilot` pasando datos de la obra como contexto

**Seccion B — Alertas Inteligentes:**
- Se genera automaticamente al montar el componente
- Llama a edge function `ai-alerts` con datos de la obra
- Parsea JSON con alertas (max 4)
- Renderiza con Badge: danger=destructive+AlertTriangle, warning=bg-warning/10+Clock, info=bg-info/10+Info

#### 2. Dialog Marketing (`MarketingDialog.tsx`)

- RadioGroup con 4 opciones: Instagram, LinkedIn, Update compradores, Ficha tecnica
- Textarea para contexto adicional
- Boton "Generar" que llama a edge function `ai-marketing`
- Output en textarea editable + boton "Copiar al portapapeles"

#### 3. Pagina IAPanel (`/ia`)

- Header "NATO OBRAS Intelligence"
- Grid de cards, una por obra de mockObras
- Cada card: nombre, progreso, boton "Analizar"
- Al analizar: llama a `ai-alerts` y muestra alertas en Accordion debajo
- Estado: `{ [obraId]: Alerta[] }` en useState

#### 4. Edge Functions (3 funciones)

Todas usan Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`) con `LOVABLE_API_KEY`:

- **ai-copilot**: Recibe mensajes + datos de obra, responde como copilot de construccion
- **ai-alerts**: Recibe datos de obra, responde JSON con alertas (tool calling para structured output)
- **ai-marketing**: Recibe tipo de contenido + datos de obra, genera el copy solicitado

#### 5. Cambios en ObraDetalle.tsx

- Nueva tab entre Finanzas y Documentos: `<TabsTrigger value="ia">` con icono Sparkles
- Nuevo boton en Quick Actions: "Generar Contenido" que abre MarketingDialog
- Import de los nuevos componentes

#### 6. Sidebar y rutas

- Agregar `{ title: 'IA Copilot', url: '/ia', icon: Sparkles, module: 'ia' }` en menuItems
- Agregar `<Route path="ia" element={<IAPanel />} />` en App.tsx

### Manejo de errores

- try/catch en todos los fetch
- Toast via Sonner: "Error al conectar con la IA. Intenta de nuevo."
- Skeleton en estados de carga




# Plan: Directorio Nacional de Proveedores

## Overview
Create a new page at `/proveedores/directorio` with a searchable directory of providers, AI-powered web search, reviews system, and import-to-my-providers functionality.

## Files to create

### 1. `src/types/directorio.ts`
Type definitions as specified (RubroDirectorio, ProveedorDirectorio, ReseñaDirectorio, etc.)

### 2. `src/data/mockDirectorio.ts`
16 mock providers with varied rubros, provinces, availability, reviews. Include `calcRating` helper.

### 3. `src/pages/DirectorioProveedores.tsx`
Full page component with:
- Header with back navigation to `/proveedores`
- Search bar with "Buscar con IA" button
- 4 filter selects (rubro, provincia, rating, disponibilidad) + clear button
- 3 tabs: Base NATO OBRAS / Resultados IA / Guardados
- 4 KPI cards (total, verified with reviews, available now, provinces covered)
- 2-column grid of provider cards (1-col on mobile)
- Inline expandable detail panel (col-span-2) with contact info, dimension bars, reviews, import/bookmark actions
- Review submission dialog (4 sliders + comment + optional obra)
- Review report modal
- IA loading state with animation
- Empty states per tab

### 4. AI search via Edge Function
The spec calls Anthropic directly from the client -- this must go through a Supabase Edge Function using the Lovable AI Gateway instead. Create `supabase/functions/ai-directorio/index.ts` that takes a search query, calls Lovable AI with tool-calling to return structured provider data, and returns JSON.

## Files to modify

### 5. `src/App.tsx`
Add route: `<Route path="proveedores/directorio" element={<DirectorioProveedores />} />`

### 6. `src/pages/Proveedores.tsx`
Add a prominent button in the header linking to `/proveedores/directorio` with Search icon and "Buscar en el directorio nacional" label.

## Technical details

- **AI search**: Edge function `ai-directorio` uses Lovable AI Gateway with `google/gemini-3-flash-preview` and tool-calling to extract structured provider data. The system prompt instructs the model to search for Argentine construction providers.
- **Inline detail panel**: Rendered by iterating the filtered array and inserting a col-span-2 detail div after the selected card's row position. This requires calculating grid row positions (every 2 cards = 1 row in desktop).
- **Mobile**: Filters collapse into a Sheet. Grid becomes single column.
- **Import action**: Updates local state, shows toast. In production this would insert into the `proveedores` Supabase table.
- **Review form**: 4 Slider components (1-5) for dimensions, optional obra select, textarea comment. Adds review to local state.
- **No DB migration needed**: This feature uses mock data locally for now, matching the spec's approach.

## Scope
- ~800 lines for DirectorioProveedores.tsx (large single-page component)
- ~300 lines for mockDirectorio.ts
- ~50 lines for types
- ~80 lines for edge function
- Minor edits to App.tsx and Proveedores.tsx


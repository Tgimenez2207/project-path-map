
# Plan: Cómputo IA desde plano (PDF/imagen)

## Idea
Sumar al **Cómputo IA** la opción de subir un plano (PDF o imagen) y que la IA estime superficies, ambientes y cómputo a partir del análisis visual, además del modo manual actual.

## Flujo

```text
┌──────────────┐   sube plano    ┌──────────────┐   análisis    ┌─────────────────┐
│ Cómputo IA   │ ──────────────► │ Edge Function│ ────────────► │ Gemini Vision   │
│ (tab nuevo)  │   PDF/JPG/PNG   │ ai-plano     │   imagen+ctx  │ extrae datos    │
└──────────────┘                 └──────────────┘                └─────────────────┘
                                        │
                                        ▼
                              ┌─────────────────────┐
                              │ Pre-completa form   │
                              │ Cómputo IA + edita  │
                              │ → Genera cómputo    │
                              │ → Convierte a $     │
                              └─────────────────────┘
```

## Cambios

### 1. UI — `ComputoIATab.tsx`
- Dos modos en tabs internos: **"Manual"** (actual) y **"Desde plano"** (nuevo).
- Modo "Desde plano":
  - Dropzone para subir PDF/JPG/PNG (sube a bucket `documentos`, carpeta `planos/`).
  - Preview del archivo.
  - Campos opcionales de contexto: ubicación, nivel de terminaciones, observaciones.
  - Botón "Analizar plano con IA" → llama a `ai-plano`.
  - Resultado: muestra datos extraídos (superficie estimada, tipología detectada, ambientes, observaciones) en un formulario editable.
  - Botón "Generar cómputo" reutiliza el flujo existente de `ai-computo` con esos datos.

### 2. Edge function nueva — `supabase/functions/ai-plano/index.ts`
- Recibe `{ imageUrl, contexto }`.
- Llama a Lovable AI Gateway con `google/gemini-2.5-pro` (vision-capable, mejor para planos).
- System prompt: experto en lectura de planos arquitectónicos argentinos.
- Tool calling para devolver estructura: `{ superficieEstimadaM2, tipologia, cantidadAmbientes, cantidadPisos, ambientesDetectados[], observaciones[], confianza }`.
- Maneja 429/402 y errores de imagen.

### 3. Storage
- Reutiliza bucket `documentos` (ya existe, público). Carpeta `planos/`.
- Para PDFs: usar primera página. Si el modelo no procesa PDF directo, convertir client-side a imagen con `pdfjs-dist` antes de subir, o pasar la URL del PDF (Gemini 2.5 Pro acepta PDF).

### 4. Sin migración SQL
No requiere tablas nuevas — el resultado fluye al cómputo existente.

## Archivos
- **crear** `supabase/functions/ai-plano/index.ts`
- **modificar** `src/components/presupuestos/ComputoIATab.tsx` — agregar tabs internos y modo plano
- **opcional** `package.json` — agregar `pdfjs-dist` si convertimos PDF→imagen en cliente

## Notas
- Modelo: `google/gemini-2.5-pro` (mejor visión + razonamiento para planos). Fallback a `google/gemini-3-flash-preview` si hay límites.
- Mensaje claro al usuario: la estimación es referencial, debe validar con plano real acotado.
- Mostrar nivel de confianza devuelto por la IA.

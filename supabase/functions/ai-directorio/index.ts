import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function searchFirecrawl(apiKey: string, query: string, limit: number) {
  const res = await fetch("https://api.firecrawl.dev/v2/search", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, limit, lang: "es", country: "AR", scrapeOptions: { formats: ["markdown"] } }),
  });
  if (!res.ok) {
    const t = await res.text();
    console.error("Firecrawl error:", res.status, t);
    if (res.status === 402) throw { status: 402, message: "Créditos de Firecrawl agotados." };
    throw new Error(`Firecrawl error: ${res.status}`);
  }
  const data = await res.json();
  const raw = data.data;
  return Array.isArray(raw) ? raw : raw?.web && Array.isArray(raw.web) ? raw.web : [];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) {
      return new Response(JSON.stringify({ error: "Falta el campo query" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY no configurada");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY no configurada");

    // Step 1: Search providers
    console.log("Searching Firecrawl for:", query);
    const results = await searchFirecrawl(FIRECRAWL_API_KEY, `${query} proveedores constructora Argentina contacto`, 10);
    console.log(`Firecrawl returned ${results.length} results`);

    if (!results.length) {
      return new Response(JSON.stringify({ proveedores: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const webContext = results.map((r: any, i: number) => {
      const parts = [`--- Resultado ${i + 1} ---`];
      if (r.title) parts.push(`Título: ${r.title}`);
      if (r.url) parts.push(`URL: ${r.url}`);
      if (r.description) parts.push(`Descripción: ${r.description}`);
      if (r.markdown) parts.push(`Contenido:\n${r.markdown.slice(0, 2000)}`);
      return parts.join("\n");
    }).join("\n\n");

    // Step 2: Extract providers with AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Sos un asistente que extrae datos de proveedores y contratistas de construcción en Argentina a partir de resultados de búsqueda web reales. 
REGLAS CRÍTICAS:
- Solo extraé información que esté EXPLÍCITAMENTE presente en los resultados de búsqueda.
- NO inventes datos. Si un campo no está en los resultados, dejalo vacío.
- La razón social, teléfono, email y web deben ser EXACTAMENTE como aparecen en los resultados.
- Si un resultado no es un proveedor de construcción, ignoralo.
- Devolvé solo proveedores reales que aparezcan en los resultados web provistos.`,
          },
          {
            role: "user",
            content: `A partir de estos resultados de búsqueda web reales sobre "${query}", extraé los proveedores y contratistas de construcción que encuentres. Solo usá datos que estén presentes en los resultados.\n\n${webContext}\n\nExtraé los proveedores usando la función provista. Si no encontrás proveedores válidos, devolvé un array vacío.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "devolver_proveedores",
              description: "Devuelve proveedores extraídos de resultados de búsqueda web reales",
              parameters: {
                type: "object",
                properties: {
                  proveedores: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        razonSocial: { type: "string", description: "Nombre exacto como aparece en la web" },
                        rubro: { type: "string", enum: ["electricista","plomero","hormigon","carpinteria","pintura","estructura","sanitaria","albanileria","gas","climatizacion","impermeabilizacion","paisajismo","ascensores","seguridad","otro"] },
                        subrubro: { type: "string" },
                        descripcion: { type: "string" },
                        contacto: { type: "string" },
                        telefono: { type: "string" },
                        email: { type: "string" },
                        web: { type: "string" },
                        ciudad: { type: "string" },
                        provincia: { type: "string" },
                        zonasCobertura: { type: "array", items: { type: "string" } },
                        cuit: { type: "string" },
                        disponibilidad: { type: "string", enum: ["disponible","disponible_30dias","no_disponible"] },
                        fuenteUrl: { type: "string" },
                      },
                      required: ["razonSocial","rubro","subrubro","descripcion","ciudad","provincia"],
                    },
                  },
                },
                required: ["proveedores"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "devolver_proveedores" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Límite de consultas excedido." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Créditos de IA agotados." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await aiResponse.text();
      console.error("AI gateway error:", status, t);
      throw new Error("Error del gateway de IA");
    }

    const data = await aiResponse.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ proveedores: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const args = JSON.parse(toolCall.function.arguments);
    const proveedores = args.proveedores || [];

    // Step 3: Search Google reviews for each provider (in parallel, max 5)
    const proveedoresConReseñas = await Promise.all(
      proveedores.slice(0, 5).map(async (prov: any) => {
        try {
          const reviewQuery = `"${prov.razonSocial}" reseñas opiniones Google ${prov.ciudad || ''} ${prov.provincia || ''}`;
          const reviewResults = await searchFirecrawl(FIRECRAWL_API_KEY, reviewQuery, 3);
          
          if (!reviewResults.length) return { ...prov, reseñasGoogle: [] };

          const reviewContext = reviewResults.map((r: any, i: number) => {
            const parts = [`--- Reseña ${i + 1} ---`];
            if (r.title) parts.push(`Título: ${r.title}`);
            if (r.url) parts.push(`URL: ${r.url}`);
            if (r.markdown) parts.push(`Contenido:\n${r.markdown.slice(0, 1500)}`);
            return parts.join("\n");
          }).join("\n\n");

          const reviewAI = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                {
                  role: "system",
                  content: `Extraé reseñas y opiniones reales de Google sobre un proveedor de construcción.
REGLAS:
- Solo extraé reseñas que estén EXPLÍCITAMENTE en los resultados.
- NO inventes reseñas ni nombres de autores.
- Si encontrás una calificación de Google (ej: "4.2 estrellas", "3.8/5"), incluila.
- Los puntajes deben ser de 1 a 5. Si la fuente usa otra escala, convertilo.
- Si no hay reseñas reales, devolvé un array vacío.`,
                },
                {
                  role: "user",
                  content: `Extraé las reseñas/opiniones reales sobre "${prov.razonSocial}" de estos resultados:\n\n${reviewContext}`,
                },
              ],
              tools: [
                {
                  type: "function",
                  function: {
                    name: "devolver_reseñas",
                    description: "Devuelve reseñas extraídas de la web",
                    parameters: {
                      type: "object",
                      properties: {
                        ratingGoogle: { type: "number", description: "Calificación promedio de Google (1-5) si se encontró" },
                        cantidadReseñasGoogle: { type: "number", description: "Cantidad total de reseñas en Google si se menciona" },
                        reseñas: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              autorNombre: { type: "string" },
                              fecha: { type: "string" },
                              rating: { type: "number", description: "Calificación 1-5" },
                              comentario: { type: "string" },
                              fuenteUrl: { type: "string" },
                            },
                            required: ["comentario"],
                          },
                        },
                      },
                      required: ["reseñas"],
                    },
                  },
                },
              ],
              tool_choice: { type: "function", function: { name: "devolver_reseñas" } },
            }),
          });

          if (!reviewAI.ok) {
            console.error("Review AI error:", reviewAI.status);
            return { ...prov, reseñasGoogle: [] };
          }

          const reviewData = await reviewAI.json();
          const reviewToolCall = reviewData.choices?.[0]?.message?.tool_calls?.[0];
          if (!reviewToolCall) return { ...prov, reseñasGoogle: [] };

          const reviewArgs = JSON.parse(reviewToolCall.function.arguments);
          return {
            ...prov,
            ratingGoogle: reviewArgs.ratingGoogle || null,
            cantidadReseñasGoogle: reviewArgs.cantidadReseñasGoogle || null,
            reseñasGoogle: reviewArgs.reseñas || [],
          };
        } catch (err) {
          console.error(`Error buscando reseñas para ${prov.razonSocial}:`, err);
          return { ...prov, reseñasGoogle: [] };
        }
      })
    );

    // Add remaining providers (beyond 5) without reviews
    const remaining = proveedores.slice(5).map((p: any) => ({ ...p, reseñasGoogle: [] }));

    return new Response(JSON.stringify({ proveedores: [...proveedoresConReseñas, ...remaining] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("ai-directorio error:", e);
    if (e.status === 402) {
      return new Response(JSON.stringify({ error: e.message }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

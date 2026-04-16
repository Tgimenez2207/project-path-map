import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Priority Argentine construction/real-estate portals
const DOMAIN_PRIORITY = [
  "infobae.com", "lanacion.com.ar", "clarin.com", "ambito.com",
  "cronista.com", "camarco.org.ar", "cedu.com.ar", "uocra.org",
  "areasglobales.com", "reporteinmobiliario.com", "infoconstruccion.com",
  "iprofesional.com", "bae.com.ar", "telam.com.ar",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { busqueda } = await req.json();

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY no configurada");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY no configurada");

    // Build search queries - use single combined query to avoid timeouts
    const searchQuery = busqueda
      ? `${busqueda} Argentina construcción`
      : "construcción inmobiliario materiales créditos hipotecarios Argentina noticias";

    // Step 1: Search real news with Firecrawl (single query to stay within timeout)
    console.log("Searching news with Firecrawl:", searchQuery);

    const searchResponse = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 15,
        lang: "es",
        country: "AR",
        tbs: "qdr:w",
        scrapeOptions: {
          formats: ["markdown"],
        },
      }),
    });

    if (!searchResponse.ok) {
      const errText = await searchResponse.text();
      console.error("Firecrawl search error:", searchResponse.status, errText);
      if (searchResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de búsqueda agotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Firecrawl error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    const rawData = searchData.data;
    const allResults = Array.isArray(rawData) ? rawData
      : rawData?.web && Array.isArray(rawData.web) ? rawData.web
      : [];

    console.log(`Firecrawl returned ${allResults.length} results`);

    console.log(`Total Firecrawl results: ${allResults.length}`);

    if (!allResults.length) {
      return new Response(JSON.stringify({ noticias: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduplicate by URL
    const seen = new Set<string>();
    const uniqueResults = allResults.filter(r => {
      if (!r.url || seen.has(r.url)) return false;
      seen.add(r.url);
      return true;
    });

    // Step 2: Build context from real search results
    const webContext = uniqueResults.slice(0, 20).map((r: any, i: number) => {
      const parts = [`--- Artículo ${i + 1} ---`];
      if (r.title) parts.push(`Título: ${r.title}`);
      if (r.url) parts.push(`URL: ${r.url}`);
      if (r.description) parts.push(`Descripción: ${r.description}`);
      if (r.markdown) parts.push(`Contenido:\n${r.markdown.slice(0, 1500)}`);
      return parts.join("\n");
    }).join("\n\n");

    // Step 3: Use AI to extract and categorize news from real results
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Sos un analista del sector construcción e inmobiliario de Argentina. Tu tarea es extraer y categorizar noticias REALES de los resultados de búsqueda web provistos.

REGLAS CRÍTICAS:
- Solo extraé noticias que estén PRESENTES en los resultados de búsqueda.
- NO inventes noticias. Cada noticia debe corresponder a un artículo real.
- El título debe ser el título real del artículo (podés resumirlo si es muy largo).
- La URL debe ser la URL EXACTA del artículo encontrado.
- La fuente debe ser el nombre del medio real (extraído de la URL).
- El resumen debe basarse en el contenido real del artículo.
- Si un resultado no es relevante para construcción/inmobiliario, ignoralo.
- Escribí en español rioplatense.`,
          },
          {
            role: "user",
            content: `Extraé las noticias relevantes para el sector construcción/inmobiliario de estos resultados de búsqueda web reales:

${webContext}

Usá la función provista para devolver las noticias estructuradas. Solo incluí noticias reales encontradas en los resultados.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "devolver_noticias",
              description: "Devuelve noticias extraídas de resultados de búsqueda web reales",
              parameters: {
                type: "object",
                properties: {
                  noticias: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        titulo: { type: "string", description: "Título real del artículo" },
                        resumen: { type: "string", description: "Resumen de 2-3 oraciones basado en el contenido real" },
                        categoria: {
                          type: "string",
                          enum: ["construccion", "inmobiliario", "materiales", "regulatorio", "economia", "tecnologia"],
                        },
                        fuente: { type: "string", description: "Nombre del medio (ej: Infobae, La Nación)" },
                        url: { type: "string", description: "URL exacta del artículo" },
                        fecha: { type: "string", description: "Fecha en formato DD/MM/YYYY" },
                        relevancia: { type: "string", enum: ["alta", "media", "baja"] },
                      },
                      required: ["titulo", "resumen", "categoria", "fuente", "url", "fecha", "relevancia"],
                    },
                  },
                },
                required: ["noticias"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "devolver_noticias" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Límite de consultas excedido. Intentá en unos minutos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA agotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResponse.text();
      console.error("AI gateway error:", status, t);
      throw new Error("Error del gateway de IA");
    }

    const data = await aiResponse.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ noticias: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const args = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-noticias error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

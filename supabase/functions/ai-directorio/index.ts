import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    // Step 1: Search the real web with Firecrawl
    console.log("Searching Firecrawl for:", query);
    const searchResponse = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `${query} proveedores constructora Argentina contacto`,
        limit: 10,
        lang: "es",
        country: "AR",
        scrapeOptions: {
          formats: ["markdown"],
        },
      }),
    });

    if (!searchResponse.ok) {
      const errText = await searchResponse.text();
      console.error("Firecrawl error:", searchResponse.status, errText);
      if (searchResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de Firecrawl agotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Firecrawl error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    const results = searchData.data || [];
    console.log(`Firecrawl returned ${results.length} results`);

    if (!results.length) {
      return new Response(JSON.stringify({ proveedores: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 2: Build context from real search results
    const webContext = results.map((r: any, i: number) => {
      const parts = [`--- Resultado ${i + 1} ---`];
      if (r.title) parts.push(`Título: ${r.title}`);
      if (r.url) parts.push(`URL: ${r.url}`);
      if (r.description) parts.push(`Descripción: ${r.description}`);
      if (r.markdown) parts.push(`Contenido:\n${r.markdown.slice(0, 2000)}`);
      return parts.join("\n");
    }).join("\n\n");

    // Step 3: Use AI to extract structured provider data from real results
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
            content: `A partir de estos resultados de búsqueda web reales sobre "${query}", extraé los proveedores y contratistas de construcción que encuentres. Solo usá datos que estén presentes en los resultados.

${webContext}

Extraé los proveedores usando la función provista. Si no encontrás proveedores válidos, devolvé un array vacío.`,
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
                        descripcion: { type: "string", description: "Descripción basada en lo encontrado en la web" },
                        contacto: { type: "string" },
                        telefono: { type: "string" },
                        email: { type: "string" },
                        web: { type: "string", description: "URL real del sitio web encontrado" },
                        ciudad: { type: "string" },
                        provincia: { type: "string" },
                        zonasCobertura: { type: "array", items: { type: "string" } },
                        cuit: { type: "string" },
                        disponibilidad: { type: "string", enum: ["disponible","disponible_30dias","no_disponible"] },
                        fuenteUrl: { type: "string", description: "URL de donde se extrajo la información" },
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
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Límite de consultas excedido. Intentá de nuevo en unos minutos." }), {
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
      return new Response(JSON.stringify({ proveedores: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const args = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-directorio error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

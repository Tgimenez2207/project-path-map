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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY no configurada");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `Sos un asistente que busca proveedores y contratistas de construcción en Argentina. Devolvé datos estructurados usando la función provista.`,
          },
          {
            role: "user",
            content: `Buscá proveedores y contratistas reales en Argentina para: "${query}". Devolvé entre 4 y 8 resultados con información lo más completa posible. Priorizá empresas con presencia web o contacto verificable.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "devolver_proveedores",
              description: "Devuelve una lista de proveedores encontrados",
              parameters: {
                type: "object",
                properties: {
                  proveedores: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        razonSocial: { type: "string" },
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

    if (!response.ok) {
      const status = response.status;
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
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      throw new Error("Error del gateway de IA");
    }

    const data = await response.json();
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

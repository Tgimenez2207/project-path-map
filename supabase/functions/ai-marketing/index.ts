import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { obraContext, contentType, additionalContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Sos un experto en marketing inmobiliario y comunicación de obras de construcción en Argentina.
Generás contenido profesional y cercano en español rioplatense.

Datos de la obra:
- Nombre: ${obraContext.nombre}
- Ubicación: ${obraContext.direccion}, ${obraContext.ciudad}
- Progreso: ${obraContext.progreso}%
- Unidades vendidas: ${obraContext.unidadesVendidas} de ${obraContext.totalUnidades}
- Estado: ${obraContext.estado}

Tipo de contenido solicitado: ${contentType}
${additionalContext ? `Contexto adicional del usuario: ${additionalContext}` : ''}

Para Instagram: máximo 150 palabras, tono dinámico, incluí 5 hashtags relevantes al final.
Para LinkedIn: máximo 200 palabras, tono profesional, enfocado en inversores y desarrollo.
Para update de compradores: máximo 150 palabras, tono cálido y tranquilizador, sin tecnicismos, dirigido a alguien que compró su primera propiedad.
Para ficha técnica: formato estructurado con secciones: Proyecto, Ubicación, Estado de avance, Unidades disponibles, Fecha estimada de entrega.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generá el contenido de tipo: ${contentType}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de peticiones excedido." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Error del gateway de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "No se pudo generar contenido.";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-marketing error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

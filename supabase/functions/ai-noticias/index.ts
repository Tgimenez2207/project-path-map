import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { busqueda } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const now = new Date();
    const mesAnio = now.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
    const anio = now.getFullYear();

    const queries = busqueda
      ? [busqueda]
      : [
          `construcción inmobiliario Argentina noticias ${mesAnio}`,
          `precios materiales construcción Argentina variación ${anio}`,
          `regulaciones permisos obras Argentina ${anio}`,
          `mercado inmobiliario Argentina tendencias ${mesAnio}`,
          `costos construcción índice CAC Argentina ${anio}`,
        ];

    const systemPrompt = `Sos un analista experto en el sector construcción e inmobiliario de Argentina. Tu tarea es generar un resumen de noticias recientes y relevantes para constructoras, desarrolladoras y arquitectos argentinos basándote en tu conocimiento actualizado.

IMPORTANTE: Devolvé ÚNICAMENTE un JSON válido con este formato exacto, sin texto adicional, sin markdown, sin backticks:

{
  "noticias": [
    {
      "titulo": "string conciso y claro",
      "resumen": "2-3 oraciones explicando la noticia y por qué importa para el sector. En español rioplatense.",
      "categoria": "construccion" | "inmobiliario" | "materiales" | "regulatorio" | "economia" | "tecnologia",
      "fuente": "nombre del medio o institución",
      "fecha": "fecha aproximada en formato DD/MM/YYYY",
      "relevancia": "alta" | "media" | "baja"
    }
  ]
}

Criterios de relevancia:
- alta: impacto directo en costos, regulaciones vigentes o tendencias de mercado
- media: información útil pero no urgente
- baja: contexto general o tendencias internacionales

Devolvé entre 8 y 12 noticias. Priorizá fuentes argentinas confiables: Infobae, La Nación, Clarín, Ámbito, El Cronista, CEDU, UOCRA, INDEC, BCRA, CAC (Cámara Argentina de Construcción).`;

    const userPrompt = `Generá noticias relevantes sobre: ${queries.join(" | ")}. 
Período: última semana. País: Argentina.
Incluí noticias sobre: sector construcción, mercado inmobiliario, precios de materiales (acero, cemento, ladrillos, madera), cambios regulatorios, índices de costos (CAC, ICC), créditos hipotecarios y política de vivienda.
Fecha actual: ${now.toLocaleDateString("es-AR")}`;

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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido, intentá en unos minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ text }), {
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

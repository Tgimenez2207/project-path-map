import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = mode === 'comparar'
      ? `Sos un experto en scoring de clientes para la industria inmobiliaria y de construcción en Argentina.
Te van a dar los perfiles y scores de varios clientes.
Analizá y recomendá con cuál trabajar primero y por qué.
Respondé en español rioplatense, máximo 300 palabras.
Sé directo y accionable.`
      : `Sos un experto en scoring de clientes para la industria inmobiliaria y de construcción en Argentina.
Analizás perfiles de clientes y generás scores predictivos basados en comportamiento histórico.

Devolvé ÚNICAMENTE un JSON válido con este formato exacto, sin texto adicional, sin markdown, sin backticks:
{
  "scoreGlobal": number entre 0-100,
  "probabilidadPagoTiempo": number entre 0-100,
  "riesgoConflicto": number entre 0-100,
  "potencialRecompra": number entre 0-100,
  "segmento": "premium" | "estandar" | "riesgo" | "sin_datos",
  "resumen": "2-3 oraciones evaluando al cliente en español rioplatense",
  "alertas": ["alerta 1", "alerta 2"],
  "recomendaciones": ["recomendación 1", "recomendación 2", "recomendación 3"],
  "generadoEn": "${new Date().toISOString()}"
}

Criterios de segmento:
- premium: score >= 75, bajo riesgo, alta confiabilidad
- estandar: score 50-74, comportamiento aceptable con áreas de mejora
- riesgo: score < 50, señales de alerta importantes
- sin_datos: menos de 2 pagos y 1 evaluación

Las alertas son señales de riesgo concretas.
Las recomendaciones son acciones específicas para el equipo comercial.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Demasiadas solicitudes. Intentá en unos segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA agotados." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(
        JSON.stringify({ error: "Error del servicio de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const texto = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ texto }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-scoring-clientes error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

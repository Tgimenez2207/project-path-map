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
    const { mode, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let userContent = "";

    if (mode === "analizar") {
      const p = data.proveedor;
      userContent = `Analizá este proveedor y dame una evaluación completa:

Proveedor: ${p.razonSocial}
Rubro: ${p.rubro} — ${p.subrubro}
Ubicación: ${p.ciudad}, ${p.provincia}
Estado: ${p.estado}
Rating general: ${p.rating}/5 (${p.cantEvaluaciones} evaluaciones)

Detalle de evaluaciones:
${p.evaluacionesDetalle}

Cotizaciones registradas: ${p.totalCotizaciones}
Cotizaciones ganadas: ${p.cotizacionesGanadas}

Dame: 1) Evaluación general en 2 líneas, 2) Puntos fuertes, 3) Puntos débiles o riesgos, 4) Recomendación: ¿conviene seguir trabajando con este proveedor? ¿Para qué tipo de obras o tareas es más adecuado?`;
    } else if (mode === "comparar") {
      userContent = `Compará estos proveedores y recomendá cuál contratar:

${data.proveedores}

¿Cuál recomendás y por qué? ¿Hay algún riesgo a considerar?`;
    } else if (mode === "chat") {
      userContent = data.message;
    } else {
      return new Response(JSON.stringify({ error: "Modo inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Sos un experto en gestión de proveedores para la industria de la construcción en Argentina. Analizás datos de proveedores y das recomendaciones concretas en español rioplatense. Respondés de forma directa y accionable. Máximo 250 palabras.${
      mode === "chat" && data.context
        ? `\n\nContexto del proveedor:\n${data.context}`
        : ""
    }`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Demasiadas solicitudes. Esperá un momento." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA agotados." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI error:", status, text);
      throw new Error("Error en el servicio de IA");
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ result: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-proveedores error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

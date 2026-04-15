import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { inputs, resultados, escenario } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Sos un experto en desarrollo inmobiliario en Argentina y Latinoamérica. Analizás rindes de proyectos y das recomendaciones concretas y accionables en español rioplatense. Respondés en formato estructurado con secciones claras. Máximo 400 palabras.`;

    const userPrompt = `Analizá este rinde inmobiliario y dame tu evaluación:

Proyecto: ${inputs.nombre || 'Sin nombre'} (${inputs.tipo})
Superficie terreno: ${inputs.supTerreno} m²
Superficie construida: ${inputs.supConstruida} m²
Unidades: ${inputs.numUnidades}
Plazo: ${inputs.plazoMeses} meses
Escenario: ${escenario}

COSTOS:
- Terreno: USD ${inputs.cTerreno?.toLocaleString() || 0}
- Construcción: USD ${resultados.cConst?.toLocaleString() || 0} (USD ${inputs.cConstruccionM2}/m²)
- Honorarios: USD ${resultados.cHonorarios?.toLocaleString() || 0} (${inputs.pHonorarios}%)
- Comercialización: USD ${resultados.cComercializacion?.toLocaleString() || 0} (${inputs.pComercializacion}%)
- Imprevistos: USD ${resultados.cImprevistos?.toLocaleString() || 0} (${inputs.pImprevistos}%)
- Impuestos: USD ${resultados.cImpuestos?.toLocaleString() || 0} (${inputs.pImpuestos}%)
- Financiamiento: USD ${inputs.cFinanciamiento?.toLocaleString() || 0}
- TOTAL: USD ${resultados.costoTotal?.toLocaleString() || 0}

RESULTADO:
- Precio de venta: USD ${inputs.pvM2}/m²
- Ingreso bruto estimado: USD ${resultados.ingresosBrutos?.toLocaleString() || 0}
- Utilidad neta: USD ${resultados.utilidadNeta?.toLocaleString() || 0}
- Margen sobre costos: ${resultados.margenSobreCostos?.toFixed(1) || 0}%
- ROI anualizado: ${resultados.roiAnualizado?.toFixed(1) || 0}%
- Punto de equilibrio: ${resultados.puntoEquilibrio || 0} unidades

Dame: 1) Evaluación general del rinde, 2) Los 2-3 rubros donde hay más oportunidad de optimizar, 3) Recomendación de precio de venta mínimo para llegar al 25% de margen, 4) Alertas o riesgos que ves en los números.`;

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
        return new Response(JSON.stringify({ error: "Límite de peticiones excedido. Intentá de nuevo en unos segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados. Agregá fondos en Settings > Workspace > Usage." }), {
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
    const texto = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ analisis: texto }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-rinde error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

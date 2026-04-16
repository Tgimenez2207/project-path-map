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
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Sos un CFO y asesor financiero senior especializado en empresas constructoras y desarrolladoras inmobiliarias de Argentina.

Tu rol es analizar la situación de caja, cheques, costos fijos y flujo de fondos, y dar recomendaciones concretas y accionables.

Respondés en español rioplatense, tono profesional pero directo.
Máximo 400 palabras. 

Estructurá tu análisis con estas secciones:
1) 📊 **Salud financiera general** — evaluación de la posición de caja y liquidez
2) 🚨 **Alertas urgentes** — cheques por vencer, descalce de monedas, caja insuficiente
3) 💡 **Oportunidades de optimización** — reducción de costos, renegociación, timing de pagos
4) 📋 **Recomendaciones para los próximos 30 días** — acciones concretas priorizadas

Consideraciones clave:
- Argentina tiene alta inflación, por lo que mantener exceso de liquidez en ARS tiene costo de oportunidad
- Los cheques propios por vencer necesitan cobertura de fondos en la cuenta emisora
- Los cheques de terceros en cartera son activos que pueden endosarse para cubrir obligaciones
- Los costos fijos deben evaluarse vs el flujo de ingresos esperado
- La conciliación bancaria pendiente es un riesgo operativo`;

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
            ...messages,
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de solicitudes excedido. Intentá de nuevo en unos minutos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA agotados. Agregá fondos en Settings > Workspace > Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const texto = data.choices?.[0]?.message?.content || "No se pudo generar el análisis.";

    return new Response(JSON.stringify({ texto }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-finanzas error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

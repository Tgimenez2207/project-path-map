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
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Sos el asistente ejecutivo de NATO OBRAS, un software de gestión para constructoras y desarrolladoras argentinas.
Tu tarea es generar el briefing semanal del dueño/director.

Devolvé ÚNICAMENTE un JSON válido con este formato exacto, sin texto adicional, sin markdown, sin backticks:

{
  "generadoEn": "ISO timestamp",
  "semana": "rango de fechas ej: 14 al 20 de abril de 2026",
  "saludoPersonalizado": "saludo breve con nombre y contexto del lunes",
  "kpis": {
    "obrasActivas": number,
    "obrasEnRutaCritica": number,
    "avancePromedio": number,
    "avanceAnterior": number,
    "pagosPendientesUSD": number,
    "cantProveedoresPendientes": number,
    "clientesEnRiesgo": number
  },
  "alertas": [
    {
      "id": "string único",
      "severidad": "critica" | "advertencia" | "info",
      "titulo": "título corto y claro",
      "descripcion": "2 oraciones explicando el problema y el riesgo concreto",
      "obraNombre": "nombre de la obra si aplica",
      "modulo": "obras|presupuesto|cronograma|documentacion|clientes|proveedores|stock|general",
      "accionSugerida": "acción concreta en una línea"
    }
  ],
  "obras": [
    {
      "id": "string",
      "nombre": "string",
      "progreso": number,
      "progresoAnterior": number,
      "alertas": ["label corto 1", "label corto 2"],
      "estado": "ok" | "warning" | "danger"
    }
  ],
  "agenda": [
    {
      "orden": number,
      "accion": "qué hacer, en lenguaje directo",
      "contexto": "módulo o área · urgencia",
      "urgencia": "urgente" | "esta_semana" | "planificar",
      "modulo": "string"
    }
  ],
  "resumenEjecutivo": "párrafo de 4-6 oraciones con visión ejecutiva de la semana. Qué está bien, qué necesita atención urgente, y qué oportunidad hay para aprovechar. Tono directo, rioplatense, como un CFO que habla con el dueño."
}

Reglas:
- Máximo 4-5 alertas (priorizadas por impacto)
- Máximo 4 items en agenda
- Las alertas críticas siempre van primero
- El resumen ejecutivo termina con algo positivo si hay algo positivo
- Tono: directo, sin vueltas, como habla un socio de confianza`;

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
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const texto =
      data.choices?.[0]?.message?.content || "No se pudo generar el briefing.";

    return new Response(JSON.stringify({ texto }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-briefing error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

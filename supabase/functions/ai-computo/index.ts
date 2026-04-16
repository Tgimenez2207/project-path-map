import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { superficie, tipologia, ubicacion, terminaciones, pisos, observaciones } = await req.json();

    if (!superficie || !tipologia || !ubicacion) {
      return new Response(JSON.stringify({ error: "Faltan campos requeridos: superficie, tipología, ubicación" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY no configurada");

    const systemPrompt = `Sos un estimador de costos de construcción experto en Argentina, especializado en estudios de arquitectura.

Tu trabajo es generar un cómputo métrico estimativo desglosado por rubros de obra a partir de los datos del proyecto.

REGLAS:
- Usá precios de mercado argentino actualizados (en USD/m²).
- Desglosá por rubros estándar de construcción: Estructura, Albañilería, Instalación Eléctrica, Instalación Sanitaria, Instalación de Gas, Pisos y Revestimientos, Pintura, Carpintería, Herrería, Vidrios, Impermeabilización, Climatización, Ascensores (si aplica), Paisajismo, Equipamiento especial.
- Incluí incidencia porcentual de cada rubro sobre el total.
- Ajustá los precios según el nivel de terminaciones (económica, estándar, premium).
- Incluí un rango de precio (mínimo y máximo) por rubro.
- Agregá un subtotal de costo directo, gastos generales (12-15%), beneficio (8-10%), e IVA (21%).
- Comentá supuestos clave que asumiste.
- El monto total debe estar en USD.`;

    const userPrompt = `Generá un cómputo estimativo para este proyecto:

- Superficie cubierta: ${superficie} m²
- Tipología: ${tipologia}
- Ubicación: ${ubicacion}
- Nivel de terminaciones: ${terminaciones || 'estándar'}
- Cantidad de pisos: ${pisos || '1'}
${observaciones ? `- Observaciones adicionales: ${observaciones}` : ''}

Devolvé los datos usando la función provista.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "devolver_computo",
              description: "Devuelve el cómputo estimativo desglosado por rubros",
              parameters: {
                type: "object",
                properties: {
                  resumen: {
                    type: "object",
                    properties: {
                      superficie: { type: "number" },
                      tipologia: { type: "string" },
                      ubicacion: { type: "string" },
                      terminaciones: { type: "string" },
                      costoM2Estimado: { type: "number", description: "Costo por m² promedio en USD" },
                      costoDirectoTotal: { type: "number" },
                      gastosGenerales: { type: "number" },
                      beneficio: { type: "number" },
                      subtotalSinIVA: { type: "number" },
                      iva: { type: "number" },
                      totalConIVA: { type: "number" },
                    },
                    required: ["superficie", "tipologia", "costoM2Estimado", "costoDirectoTotal", "gastosGenerales", "beneficio", "subtotalSinIVA", "iva", "totalConIVA"],
                  },
                  rubros: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        nombre: { type: "string" },
                        incidencia: { type: "number", description: "Porcentaje sobre costo directo" },
                        costoMin: { type: "number", description: "Costo mínimo en USD" },
                        costoMax: { type: "number", description: "Costo máximo en USD" },
                        costoEstimado: { type: "number", description: "Costo estimado en USD" },
                        unidad: { type: "string", description: "gl, m2, ml, etc." },
                        observaciones: { type: "string" },
                      },
                      required: ["nombre", "incidencia", "costoEstimado"],
                    },
                  },
                  supuestos: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de supuestos asumidos para la estimación",
                  },
                  recomendaciones: {
                    type: "array",
                    items: { type: "string" },
                    description: "Recomendaciones para optimizar costos",
                  },
                },
                required: ["resumen", "rubros", "supuestos"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "devolver_computo" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Límite de consultas excedido. Intentá de nuevo en unos minutos." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Créditos de IA agotados." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await aiResponse.text();
      console.error("AI error:", status, t);
      throw new Error("Error del gateway de IA");
    }

    const data = await aiResponse.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No se pudo generar el cómputo" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const args = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-computo error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

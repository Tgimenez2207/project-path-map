import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { fileUrl, mimeType, contexto } = await req.json();

    if (!fileUrl) {
      return new Response(JSON.stringify({ error: "Falta fileUrl" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY no configurada");

    const systemPrompt = `Sos un experto en lectura de planos arquitectónicos en Argentina.
Analizás planos (plantas, cortes, vistas) y extraés información cuantitativa para estimar un cómputo de obra.

REGLAS:
- Identificá la tipología (vivienda unifamiliar, edificio, oficinas, comercial, etc.).
- Estimá la superficie cubierta total en m² leyendo cotas, escalas o referencias visuales.
- Contá ambientes (dormitorios, baños, cocina, living, etc.).
- Identificá cantidad de pisos/niveles.
- Detectá elementos especiales relevantes (pileta, cochera, ascensor, subsuelo, terraza, etc.).
- Si la imagen no es clara o no es un plano, indicá confianza baja y explicá por qué.
- La estimación es referencial — siempre incluí supuestos y observaciones.
- Confianza: alta (cotas claras + escala), media (cotas parciales), baja (sin cotas o imagen poco legible).`;

    const userContent: any[] = [
      {
        type: "text",
        text: `Analizá este plano arquitectónico y extraé los datos solicitados.${contexto ? `\n\nContexto adicional del proyecto: ${contexto}` : ""}`,
      },
      {
        type: "image_url",
        image_url: { url: fileUrl },
      },
    ];

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "devolver_analisis_plano",
              description: "Devuelve los datos extraídos del plano",
              parameters: {
                type: "object",
                properties: {
                  superficieEstimadaM2: { type: "number", description: "Superficie cubierta total estimada en m²" },
                  tipologia: { type: "string", description: "Tipología detectada (ej: Vivienda unifamiliar, Edificio residencial, Oficinas, etc.)" },
                  cantidadAmbientes: { type: "number" },
                  cantidadPisos: { type: "number" },
                  ambientesDetectados: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de ambientes identificados (ej: 3 dormitorios, 2 baños, cocina, living)",
                  },
                  elementosEspeciales: {
                    type: "array",
                    items: { type: "string" },
                    description: "Elementos relevantes detectados (pileta, cochera, ascensor, etc.)",
                  },
                  observaciones: {
                    type: "array",
                    items: { type: "string" },
                    description: "Observaciones del análisis",
                  },
                  confianza: {
                    type: "string",
                    enum: ["alta", "media", "baja"],
                    description: "Nivel de confianza en la estimación",
                  },
                  motivoConfianza: { type: "string", description: "Por qué este nivel de confianza" },
                },
                required: ["superficieEstimadaM2", "tipologia", "cantidadPisos", "confianza"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "devolver_analisis_plano" } },
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
      return new Response(JSON.stringify({ error: "La IA no pudo analizar el plano. Probá con una imagen más clara." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const args = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-plano error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

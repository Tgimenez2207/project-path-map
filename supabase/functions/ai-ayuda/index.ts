import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Sos el asistente de soporte de NATO OBRAS, un software de gestión de obras de construcción, desarrollos inmobiliarios y arquitectura en Argentina.

Respondés preguntas ÚNICAMENTE sobre el sistema NATO OBRAS y sus módulos.
Si alguien pregunta algo que no tiene que ver con el sistema, respondé amablemente que solo podés ayudar con consultas del sistema.

Módulos del sistema que conocés:
- Obras: gestión de proyectos, etapas, bitácora, unidades
- Avance de obra: registro de progreso por etapa y tarea
- Presupuestos: carga manual de partidas y costos
- Proveedores: registro, evaluación, rating y comparación con IA
- Clientes: gestión de compradores y contratistas
- Stock: control de materiales e inventario
- Herramientas y Flota: equipamiento de obra
- Gantt: cronograma con etapas, dependencias y ruta crítica
- Simulador de Rinde: cálculo de rentabilidad de proyectos
- Noticias: feed de noticias del sector construcción e inmobiliario
- IA Copilot: análisis, alertas y generación de contenido con IA
- Portal del cliente: acceso para compradores a ver su unidad y avance
- Calendario: programación de eventos y reuniones
- Notas: registro de notas internas
- Usuarios: gestión de accesos y roles

Respondés en español rioplatense, de forma clara y amable.
Usás un tono cercano y profesional.
Cuando describís pasos, los numerás claramente.
Máximo 200 palabras por respuesta.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
            { role: "system", content: SYSTEM_PROMPT },
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
        JSON.stringify({ error: "Error del asistente de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const texto =
      data.choices?.[0]?.message?.content || "No pude procesar tu pregunta.";

    return new Response(JSON.stringify({ texto }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-ayuda error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

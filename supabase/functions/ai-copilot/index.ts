import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, obraContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt: string;

    if (obraContext) {
      systemPrompt = `Sos un copilot experto en gestión de obras de construcción en Argentina. 
Tenés acceso a los datos reales de la obra y respondés preguntas en español rioplatense de forma concisa y accionable.
Cuando detectes desvíos o riesgos, los mencionás proactivamente.

Datos de la obra:
Nombre: ${obraContext.nombre}
Progreso: ${obraContext.progreso}%
Presupuesto total: ${obraContext.moneda} ${obraContext.presupuestoTotal}
Estado: ${obraContext.estado}
Etapas: ${JSON.stringify(obraContext.etapas)}
Tareas: ${JSON.stringify(obraContext.tareas)}
Bitácora reciente: ${JSON.stringify(obraContext.bitacora)}`;
    } else {
      systemPrompt = `Sos un asistente experto en gestión de empresas constructoras y desarrollo inmobiliario en Argentina.
Respondés en español rioplatense de forma concisa, práctica y accionable.
Podés ayudar con:
- Planificación y seguimiento de obras
- Gestión de proveedores y contratistas
- Análisis de costos y presupuestos
- Normativa y regulaciones de construcción en Argentina
- Gestión de equipos y recursos
- Comercialización inmobiliaria
- Finanzas y flujo de caja de proyectos
Siempre que sea posible, dás ejemplos concretos y números de referencia del mercado argentino.`;
    }

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
          ...messages,
        ],
        stream: true,
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

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-copilot error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

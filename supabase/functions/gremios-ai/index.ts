// Edge function: gremios-ai
// Modos: "presupuesto" (genera texto profesional) | "chat" (asistente)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PresupuestoBody {
  mode: "presupuesto";
  perfil: {
    nombre: string;
    rubroLabel: string;
    matricula?: string;
    telefono: string;
    email: string;
  };
  form: {
    cliente: string;
    telefono?: string;
    email?: string;
    descripcionTrabajo: string;
    montoTotal: number;
    incluyeMateriales: boolean | "por_separado";
    condicionesPago: string;
    validezDias: number;
  };
}

interface ChatBody {
  mode: "chat";
  perfil: { nombre: string; rubroLabel: string; ciudad: string };
  messages: { role: "user" | "assistant"; content: string }[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY no configurada");

    const body = (await req.json()) as PresupuestoBody | ChatBody;

    let systemPrompt = "";
    let userMessages: { role: string; content: string }[] = [];

    if (body.mode === "presupuesto") {
      const { perfil, form } = body;
      systemPrompt = `Sos un asistente que redacta presupuestos profesionales para gremialistas independientes de la construcción en Argentina. Redactás en primera persona del prestador. Usás un tono profesional pero cercano, en español rioplatense. El texto debe verse bien impreso o enviado por WhatsApp. Incluí siempre: encabezado con datos del prestador, descripción clara del trabajo, monto total en letras y números, condiciones de pago, validez del presupuesto y una frase de cierre cordial. Máximo 300 palabras.`;
      const matLabel =
        form.incluyeMateriales === true
          ? "Sí, materiales incluidos en el precio"
          : form.incluyeMateriales === false
            ? "No, solo mano de obra"
            : "Materiales se presupuestan por separado";
      userMessages = [
        {
          role: "user",
          content: `Generá un presupuesto profesional con estos datos:

Prestador: ${perfil.nombre}
Rubro: ${perfil.rubroLabel}
${perfil.matricula ? `Matrícula: ${perfil.matricula}` : ""}
Teléfono: ${perfil.telefono}
Email: ${perfil.email}

Cliente: ${form.cliente}
${form.telefono ? `Tel. cliente: ${form.telefono}` : ""}

Trabajo a realizar: ${form.descripcionTrabajo}
Incluye materiales: ${matLabel}
Monto total: $${form.montoTotal.toLocaleString("es-AR")}
Condiciones de pago: ${form.condicionesPago}
Validez: ${form.validezDias} días corridos desde la fecha de emisión
Fecha de emisión: ${new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}`,
        },
      ];
    } else if (body.mode === "chat") {
      const { perfil, messages } = body;
      systemPrompt = `Sos un asistente de negocio para gremialistas independientes de la construcción en Argentina. Tu usuario es ${perfil.nombre}, ${perfil.rubroLabel} de ${perfil.ciudad}.

Respondés preguntas sobre:
- Precios y tarifas de mercado actuales en Argentina
- Cómo cobrar deudas y manejar clientes morosos
- Certificaciones, habilitaciones y requisitos legales
- Cómo conseguir más clientes y hacer crecer el negocio
- Facturación, monotributo, impuestos para independientes
- Presupuestación y negociación

Reglas:
- Respondés en español rioplatense, tono cercano y directo
- Máximo 200 palabras por respuesta
- Usás viñetas o listas cuando hay varios puntos
- Cuando hablás de precios, avisás que son orientativos y pueden variar por zona y materiales
- Si no sabés algo con certeza, lo decís claramente
- No usás emojis en exceso — máximo 1-2 por respuesta`;
      userMessages = messages.map((m) => ({ role: m.role, content: m.content }));
    } else {
      return new Response(JSON.stringify({ error: "modo inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...userMessages],
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Esperá un momento." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(
          JSON.stringify({ error: "Sin créditos disponibles. Recargá tu workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await resp.text();
      console.error("AI gateway error:", resp.status, t);
      return new Response(JSON.stringify({ error: "Error del proveedor de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("gremios-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

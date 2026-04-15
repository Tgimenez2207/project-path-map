import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const today = new Date().toISOString().slice(0, 10);
    const in7days = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    const in3days = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);

    // Get all admin/ops users to notify
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .in("role", ["admin", "operaciones", "finanzas"]);

    const adminOpsUsers = (roles || []).filter(r => r.role === "admin" || r.role === "operaciones").map(r => r.user_id);
    const finUsers = (roles || []).filter(r => r.role === "admin" || r.role === "finanzas").map(r => r.user_id);
    const allUsers = [...new Set([...adminOpsUsers, ...finUsers])];

    const notifications: any[] = [];

    // 1. Vehicle expirations within 7 days
    const { data: vehiculos } = await supabase
      .from("vehiculos")
      .select("id, marca, modelo, patente, proximo_vencimiento, tipo_vencimiento")
      .not("proximo_vencimiento", "is", null)
      .lte("proximo_vencimiento", in7days);

    for (const v of vehiculos || []) {
      const days = Math.ceil((new Date(v.proximo_vencimiento).getTime() - Date.now()) / 86400000);
      const urgencia = days <= 0 ? "⚠️ VENCIDO" : days <= 3 ? "🔴 Urgente" : "🟡 Próximo";
      for (const uid of adminOpsUsers) {
        notifications.push({
          user_id: uid,
          tipo: "vehiculo_vencimiento",
          titulo: `${urgencia}: ${v.tipo_vencimiento || "Vencimiento"} — ${v.marca} ${v.modelo}`,
          mensaje: `El vehículo ${v.patente} (${v.marca} ${v.modelo}) tiene ${v.tipo_vencimiento || "un vencimiento"} el ${v.proximo_vencimiento}. ${days <= 0 ? "Ya está vencido." : `Faltan ${days} días.`}`,
          referencia_id: v.id,
          referencia_tipo: "vehiculo",
        });
      }
    }

    // 2. Pending/overdue installments
    const { data: cuotas } = await supabase
      .from("cuotas")
      .select("id, numero, monto, moneda, fecha_vencimiento, plan_pago_id, estado")
      .in("estado", ["pendiente", "vencido"])
      .lte("fecha_vencimiento", in7days);

    for (const c of cuotas || []) {
      const days = Math.ceil((new Date(c.fecha_vencimiento).getTime() - Date.now()) / 86400000);
      const urgencia = days <= 0 ? "⚠️ Vencida" : days <= 3 ? "🔴 Urgente" : "🟡 Próxima";
      for (const uid of finUsers) {
        notifications.push({
          user_id: uid,
          tipo: "cuota_pendiente",
          titulo: `${urgencia}: Cuota #${c.numero} — ${c.moneda} ${c.monto}`,
          mensaje: `La cuota #${c.numero} por ${c.moneda} ${Number(c.monto).toLocaleString("es-AR")} vence el ${c.fecha_vencimiento}. ${days <= 0 ? "Ya está vencida." : `Faltan ${days} días.`}`,
          referencia_id: c.id,
          referencia_tipo: "cuota",
        });
      }
    }

    // 3. Obras in planning with start date approaching
    const { data: obras } = await supabase
      .from("obras")
      .select("id, nombre, fecha_inicio, estado")
      .eq("estado", "planificacion")
      .lte("fecha_inicio", in7days);

    for (const o of obras || []) {
      const days = Math.ceil((new Date(o.fecha_inicio).getTime() - Date.now()) / 86400000);
      const msg = days <= 0
        ? `La obra "${o.nombre}" tenía inicio programado para ${o.fecha_inicio} y sigue en planificación.`
        : `La obra "${o.nombre}" inicia en ${days} días (${o.fecha_inicio}) y sigue en planificación.`;
      for (const uid of adminOpsUsers) {
        notifications.push({
          user_id: uid,
          tipo: "obra_planificacion",
          titulo: `📋 Obra por iniciar: ${o.nombre}`,
          mensaje: msg,
          referencia_id: o.id,
          referencia_tipo: "obra",
        });
      }
    }

    // 4. Overdue tasks
    const { data: tareas } = await supabase
      .from("tareas")
      .select("id, titulo, fecha_vencimiento, obra_id, estado")
      .in("estado", ["pendiente", "en_curso"])
      .not("fecha_vencimiento", "is", null)
      .lte("fecha_vencimiento", today);

    for (const t of tareas || []) {
      for (const uid of adminOpsUsers) {
        notifications.push({
          user_id: uid,
          tipo: "tarea_vencida",
          titulo: `🔴 Tarea vencida: ${t.titulo}`,
          mensaje: `La tarea "${t.titulo}" venció el ${t.fecha_vencimiento} y está ${t.estado === "pendiente" ? "pendiente" : "en curso"}.`,
          referencia_id: t.id,
          referencia_tipo: "tarea",
        });
      }
    }

    // 5. Vehicle maintenance due
    const { data: mantenimientos } = await supabase
      .from("mantenimientos")
      .select("id, vehiculo_id, tipo, proximo_mantenimiento")
      .not("proximo_mantenimiento", "is", null)
      .lte("proximo_mantenimiento", in7days);

    for (const m of mantenimientos || []) {
      const days = Math.ceil((new Date(m.proximo_mantenimiento).getTime() - Date.now()) / 86400000);
      for (const uid of adminOpsUsers) {
        notifications.push({
          user_id: uid,
          tipo: "vehiculo_vencimiento",
          titulo: `🔧 Mantenimiento próximo: ${m.tipo}`,
          mensaje: `El mantenimiento "${m.tipo}" está programado para ${m.proximo_mantenimiento}. ${days <= 0 ? "Ya está atrasado." : `Faltan ${days} días.`}`,
          referencia_id: m.vehiculo_id,
          referencia_tipo: "vehiculo",
        });
      }
    }

    // Clear old unread notifications from today to avoid duplicates, then insert
    if (notifications.length > 0) {
      // Delete today's auto-generated notifications to avoid duplication on re-run
      await supabase
        .from("notificaciones")
        .delete()
        .gte("created_at", today + "T00:00:00Z")
        .lte("created_at", today + "T23:59:59Z");

      // Insert in batches of 100
      for (let i = 0; i < notifications.length; i += 100) {
        await supabase.from("notificaciones").insert(notifications.slice(i, i + 100));
      }
    }

    return new Response(
      JSON.stringify({ ok: true, generated: notifications.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("check-alerts error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

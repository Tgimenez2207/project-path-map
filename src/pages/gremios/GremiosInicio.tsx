import { useNavigate } from 'react-router-dom';
import { Sparkles, Wrench, Calendar, MessageSquare, ChevronRight, TrendingUp, AlertCircle, DollarSign, Clock, Users, FileText } from 'lucide-react';
import { useGremios } from '@/contexts/GremiosContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const today = new Date().toISOString().slice(0, 10);
const fmt = (n: number) => `$${n.toLocaleString('es-AR')}`;

function diasDesde(iso?: string): number {
  if (!iso) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
}

export default function GremiosInicio() {
  const navigate = useNavigate();
  const { trabajos, presupuestos, turnos, clientesAgrupados } = useGremios();
  const mesActual = new Date().getMonth();

  const cobradoMes = trabajos
    .filter((t) => t.estadoCobro === 'cobrado' && new Date(t.fecha).getMonth() === mesActual)
    .reduce((a, t) => a + t.monto, 0);
  const porCobrar = trabajos
    .filter((t) => t.estadoCobro === 'pendiente' || t.estadoCobro === 'vencido')
    .reduce((a, t) => a + t.monto, 0);
  const trabajosActivos = trabajos.filter((t) => t.estadoTrabajo === 'en_curso').length;
  const pagosVencidos = trabajos.filter((t) => t.estadoCobro === 'vencido').length;
  const turnosHoy = turnos.filter((t) => t.fecha === today).length;
  const turnosProximos = [...turnos]
    .filter((t) => t.fecha >= today)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora))
    .slice(0, 4);
  const presupPorConvertir = presupuestos.filter((p) => p.estado === 'aceptado').length;
  const presupEnviados = presupuestos.filter((p) => p.estado === 'enviado').length;

  const recientes = [...trabajos].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5);
  const topClientes = [...clientesAgrupados].slice(0, 4);

  const KPIS = [
    { label: 'Cobrado este mes', value: fmt(cobradoMes), icon: TrendingUp, accent: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { label: 'Por cobrar', value: fmt(porCobrar), icon: DollarSign, accent: 'text-amber-600', bg: 'bg-amber-500/10' },
    { label: 'Trabajos activos', value: trabajosActivos, icon: Wrench, accent: 'text-foreground', bg: 'bg-muted' },
    { label: 'Pagos vencidos', value: pagosVencidos, icon: AlertCircle, accent: pagosVencidos > 0 ? 'text-red-600' : 'text-foreground', bg: pagosVencidos > 0 ? 'bg-red-500/10' : 'bg-muted' },
  ];

  const acciones = [
    { label: 'Nuevo presupuesto', sub: 'Items + IVA + PDF', icon: Sparkles, path: '/portal/gremios/presupuestos', primary: true },
    { label: 'Registrar trabajo', sub: 'Con bitácora', icon: Wrench, path: '/portal/gremios/trabajos' },
    { label: 'Mi agenda', sub: `${turnosHoy} turnos hoy`, icon: Calendar, path: '/portal/gremios/agenda' },
    { label: 'Consultá la IA', sub: 'Precios, consejos', icon: MessageSquare, path: '/portal/gremios/asistente' },
  ];

  return (
    <div className="p-4 xl:p-0 space-y-6 xl:space-y-8">
      {/* Alertas inteligentes */}
      {(pagosVencidos > 0 || presupPorConvertir > 0 || presupEnviados > 0) && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
          {pagosVencidos > 0 && (
            <button
              onClick={() => navigate('/portal/gremios/trabajos')}
              className="text-left p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 hover:bg-red-100 transition-colors"
            >
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-red-900">{pagosVencidos} pago{pagosVencidos > 1 ? 's' : ''} vencido{pagosVencidos > 1 ? 's' : ''}</p>
                <p className="text-xs text-red-700 truncate">Hacé seguimiento ya</p>
              </div>
            </button>
          )}
          {presupEnviados > 0 && (
            <button
              onClick={() => navigate('/portal/gremios/presupuestos')}
              className="text-left p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-3 hover:bg-blue-100 transition-colors"
            >
              <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-blue-900">{presupEnviados} presupuesto{presupEnviados > 1 ? 's' : ''} esperando respuesta</p>
                <p className="text-xs text-blue-700 truncate">Hacé un seguimiento</p>
              </div>
            </button>
          )}
          {presupPorConvertir > 0 && (
            <button
              onClick={() => navigate('/portal/gremios/presupuestos')}
              className="text-left p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-3 hover:bg-emerald-100 transition-colors"
            >
              <Wrench className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-emerald-900">{presupPorConvertir} presupuesto{presupPorConvertir > 1 ? 's' : ''} aceptado{presupPorConvertir > 1 ? 's' : ''}</p>
                <p className="text-xs text-emerald-700 truncate">Convertilo en trabajo</p>
              </div>
            </button>
          )}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 xl:gap-4">
        {KPIS.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="p-3 xl:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs xl:text-sm text-muted-foreground">{k.label}</p>
                  <p className={`text-lg xl:text-2xl font-bold mt-1 ${k.accent}`}>{k.value}</p>
                </div>
                <div className={`hidden xl:flex h-10 w-10 rounded-xl ${k.bg} ${k.accent} items-center justify-center`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Acciones rápidas */}
      <div>
        <h2 className="text-sm xl:text-base font-semibold mb-3">Acciones rápidas</h2>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 xl:gap-4">
          {acciones.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.path}
                onClick={() => navigate(a.path)}
                className={`p-4 xl:p-5 rounded-xl text-left transition-all xl:hover:scale-[1.02] ${
                  a.primary
                    ? 'bg-foreground text-background hover:bg-foreground/90'
                    : 'border bg-card hover:bg-muted/50'
                }`}
              >
                <Icon className="h-5 w-5 xl:h-6 xl:w-6 mb-2" />
                <p className="font-medium text-sm xl:text-base">{a.label}</p>
                <p className={`text-xs xl:text-sm mt-0.5 ${a.primary ? 'opacity-70' : 'text-muted-foreground'}`}>
                  {a.sub}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de trabajos + agenda */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm xl:text-base font-semibold">Trabajos recientes</h2>
            <button
              onClick={() => navigate('/portal/gremios/trabajos')}
              className="text-xs text-primary flex items-center gap-1 hover:underline"
            >
              Ver todos <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {recientes.map((t) => {
              const color =
                t.estadoCobro === 'cobrado'
                  ? 'text-emerald-600'
                  : t.estadoCobro === 'vencido'
                    ? 'text-red-600'
                    : 'text-amber-600';
              const badgeLabel =
                t.estadoCobro === 'cobrado'
                  ? 'Cobrado ✓'
                  : t.estadoCobro === 'vencido'
                    ? `Vencido hace ${diasDesde(t.fechaVencimientoCobro)}d`
                    : t.estadoCobro === 'pendiente'
                      ? 'Pendiente'
                      : 'Cancelado';
              return (
                <Card
                  key={t.id}
                  className="p-3 xl:p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => navigate('/portal/gremios/trabajos')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm xl:text-base font-medium truncate">{t.descripcion}</p>
                      <p className="text-xs xl:text-sm text-muted-foreground">{t.cliente}</p>
                      <p className="hidden xl:block text-xs text-muted-foreground truncate mt-0.5">{t.direccion}</p>
                    </div>
                    <p className={`text-sm xl:text-lg font-bold whitespace-nowrap ${color}`}>{fmt(t.monto)}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-[10px] xl:text-xs">
                      {badgeLabel}
                    </Badge>
                    <p className="text-[10px] xl:text-xs text-muted-foreground">
                      {new Date(t.fecha).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          {/* Próximos turnos (desktop) */}
          <div className="hidden xl:block">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">Próximos turnos</h2>
              <button
                onClick={() => navigate('/portal/gremios/agenda')}
                className="text-xs text-primary flex items-center gap-1 hover:underline"
              >
                Ver agenda <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <Card className="p-2">
              {turnosProximos.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No hay turnos próximos</p>
              ) : (
                <div className="divide-y">
                  {turnosProximos.map((t) => (
                    <div key={t.id} className="p-3 flex gap-3">
                      <div className="flex flex-col items-center justify-center w-12 shrink-0">
                        <p className="text-xs text-muted-foreground uppercase">
                          {new Date(t.fecha + 'T00:00:00').toLocaleDateString('es-AR', { month: 'short' })}
                        </p>
                        <p className="text-lg font-bold leading-none">
                          {new Date(t.fecha + 'T00:00:00').getDate()}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" /> {t.hora}
                        </div>
                        <p className="text-sm font-medium truncate">{t.titulo}</p>
                        <p className="text-xs text-muted-foreground truncate">{t.cliente}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Top clientes (desktop) */}
          <div className="hidden xl:block">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">Top clientes</h2>
              <button
                onClick={() => navigate('/portal/gremios/clientes')}
                className="text-xs text-primary flex items-center gap-1 hover:underline"
              >
                Ver todos <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <Card className="p-2">
              {topClientes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Sin clientes aún</p>
              ) : (
                <div className="divide-y">
                  {topClientes.map((c) => (
                    <button
                      key={c.cliente}
                      className="w-full text-left p-3 flex items-center gap-3 hover:bg-muted/30 rounded-md"
                      onClick={() => navigate('/portal/gremios/clientes')}
                    >
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm flex-shrink-0">
                        {c.cliente.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{c.cliente}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.trabajos.length} trabajos
                        </p>
                      </div>
                      <p className="text-sm font-bold text-emerald-600 whitespace-nowrap">
                        {fmt(c.totalCobrado)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

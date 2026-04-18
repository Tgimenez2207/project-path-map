import { useNavigate } from 'react-router-dom';
import { Sparkles, Wrench, Calendar, MessageSquare, ChevronRight } from 'lucide-react';
import { mockTrabajos, mockTurnos } from '@/data/mockGremios';
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
  const trabajos = mockTrabajos;
  const mesActual = new Date().getMonth();

  const cobradoMes = trabajos
    .filter((t) => t.estadoCobro === 'cobrado' && new Date(t.fecha).getMonth() === mesActual)
    .reduce((a, t) => a + t.monto, 0);
  const porCobrar = trabajos
    .filter((t) => t.estadoCobro === 'pendiente' || t.estadoCobro === 'vencido')
    .reduce((a, t) => a + t.monto, 0);
  const trabajosActivos = trabajos.filter((t) => t.estadoTrabajo === 'en_curso').length;
  const pagosVencidos = trabajos.filter((t) => t.estadoCobro === 'vencido').length;
  const turnosHoy = mockTurnos.filter((t) => t.fecha === today).length;

  const recientes = [...trabajos].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 4);

  const acciones = [
    {
      label: 'Nuevo presupuesto',
      sub: 'La IA te ayuda',
      icon: Sparkles,
      path: '/portal/gremios/presupuestos',
      primary: true,
    },
    { label: 'Registrar trabajo', sub: 'Rápido, en 30 seg', icon: Wrench, path: '/portal/gremios/trabajos' },
    { label: 'Mi agenda', sub: `${turnosHoy} turnos hoy`, icon: Calendar, path: '/portal/gremios/agenda' },
    { label: 'Consultá la IA', sub: 'Precios, consejos', icon: MessageSquare, path: '/portal/gremios/asistente' },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Cobrado este mes</p>
          <p className="text-lg font-bold text-emerald-600">{fmt(cobradoMes)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Por cobrar</p>
          <p className="text-lg font-bold text-amber-600">{fmt(porCobrar)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Trabajos activos</p>
          <p className="text-lg font-bold">{trabajosActivos}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Pagos vencidos</p>
          <p className={`text-lg font-bold ${pagosVencidos > 0 ? 'text-red-600' : ''}`}>{pagosVencidos}</p>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Acciones rápidas</h2>
        <div className="grid grid-cols-2 gap-3">
          {acciones.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.path}
                onClick={() => navigate(a.path)}
                className={`p-4 rounded-xl text-left transition-colors ${
                  a.primary
                    ? 'bg-foreground text-background hover:bg-foreground/90'
                    : 'border bg-card hover:bg-muted/50'
                }`}
              >
                <Icon className="h-5 w-5 mb-2" />
                <p className="font-medium text-sm">{a.label}</p>
                <p className={`text-xs ${a.primary ? 'opacity-70' : 'text-muted-foreground'}`}>{a.sub}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trabajos recientes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Trabajos recientes</h2>
          <button
            onClick={() => navigate('/portal/gremios/trabajos')}
            className="text-xs text-primary flex items-center gap-1"
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
                className="p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => navigate('/portal/gremios/trabajos')}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.descripcion}</p>
                    <p className="text-xs text-muted-foreground">{t.cliente}</p>
                  </div>
                  <p className={`text-sm font-bold whitespace-nowrap ${color}`}>{fmt(t.monto)}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-[10px]">
                    {badgeLabel}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(t.fecha).toLocaleDateString('es-AR')}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

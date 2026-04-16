import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { AppRole } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2, DollarSign, Users, Package, Plus, ArrowUpRight, TrendingUp, AlertTriangle, ListTodo, Gauge, CalendarClock, StickyNote, Clock,
} from 'lucide-react';
import { useObras, useUnidades, useClientes, useCuotas, useTareasAll, useStockAlerts, useVehiculos, useEventosHoy, useNotasRecientes } from '@/hooks/useSupabaseData';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from 'recharts';

const COLORS = ['hsl(24, 100%, 50%)', 'hsl(142, 71%, 45%)', 'hsl(48, 96%, 53%)', 'hsl(220, 70%, 55%)'];
const PIE_COLORS = ['hsl(142, 71%, 45%)', 'hsl(48, 96%, 53%)', 'hsl(24, 100%, 50%)', 'hsl(220, 10%, 70%)'];

export default function Dashboard() {
  const { profile, user } = useAuth();
  const { data: obras = [], isLoading: obrasLoading } = useObras();
  const { data: unidades = [] } = useUnidades();
  const { data: clientes = [] } = useClientes();
  const { data: cuotas = [] } = useCuotas();
  const { data: tareas = [] } = useTareasAll();
  const { data: stockAlerts = [] } = useStockAlerts();
  const { data: vehiculos = [] } = useVehiculos();
  const { data: eventosHoy = [] } = useEventosHoy(user?.id);
  const { data: notasRecientes = [] } = useNotasRecientes(user?.id);

  // KPIs
  const obrasActivas = obras.filter(o => o.estado === 'en_curso').length;
  const unidadesVendidas = unidades.filter(u => u.estado === 'vendida').length;
  const cuotasPendientes = cuotas.filter(c => c.estado === 'pendiente' || c.estado === 'vencido');
  const montoPendiente = cuotasPendientes.reduce((sum, c) => sum + Number(c.monto), 0);
  const cuotasVencidas = cuotas.filter(c => c.estado === 'vencido');
  const tareasVencidas = tareas.filter(t => t.estado !== 'completada' && t.fecha_vencimiento && new Date(t.fecha_vencimiento) < new Date());

  // Chart data: avance por obra
  const avanceData = useMemo(() =>
    obras.map(o => ({ nombre: o.nombre.length > 15 ? o.nombre.substring(0, 15) + '…' : o.nombre, progreso: o.progreso, full: o.nombre })),
    [obras]
  );

  // Chart data: distribución de unidades
  const unidadesDistribucion = useMemo(() => {
    const d = unidades.filter(u => u.estado === 'disponible').length;
    const r = unidades.filter(u => u.estado === 'reservada').length;
    const v = unidades.filter(u => u.estado === 'vendida').length;
    const b = unidades.filter(u => u.estado === 'bloqueada').length;
    return [
      { name: 'Disponibles', value: d },
      { name: 'Reservadas', value: r },
      { name: 'Vendidas', value: v },
      { name: 'Bloqueadas', value: b },
    ].filter(x => x.value > 0);
  }, [unidades]);

  // Chart data: cuotas por mes (últimos 6 meses)
  const cuotasPorMes = useMemo(() => {
    const months: Record<string, { cobrado: number; pendiente: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
      months[key] = { cobrado: 0, pendiente: 0 };
    }
    cuotas.forEach(c => {
      const fecha = new Date(c.fecha_vencimiento);
      const key = fecha.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
      if (months[key]) {
        if (c.estado === 'aprobado') months[key].cobrado += Number(c.monto);
        else months[key].pendiente += Number(c.monto);
      }
    });
    return Object.entries(months).map(([mes, v]) => ({ mes, ...v }));
  }, [cuotas]);

  // Chart data: tareas por estado
  const tareasEstado = useMemo(() => {
    const pendientes = tareas.filter(t => t.estado === 'pendiente').length;
    const enCurso = tareas.filter(t => t.estado === 'en_curso').length;
    const completadas = tareas.filter(t => t.estado === 'completada').length;
    return [
      { name: 'Pendientes', value: pendientes },
      { name: 'En curso', value: enCurso },
      { name: 'Completadas', value: completadas },
    ].filter(x => x.value > 0);
  }, [tareas]);

  const TAREAS_COLORS = ['hsl(48, 96%, 53%)', 'hsl(24, 100%, 50%)', 'hsl(142, 71%, 45%)'];

  if (obrasLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1,2].map(i => <Skeleton key={i} className="h-72 w-full" />)}
        </div>
      </div>
    );
  }

  const stats = [
    { title: 'Obras Activas', value: obrasActivas, icon: Building2, change: `${obras.length} total`, color: 'text-primary' },
    { title: 'Unidades Vendidas', value: unidadesVendidas, total: unidades.length, icon: Package, change: `${Math.round(unidadesVendidas / (unidades.length || 1) * 100)}% del total`, color: 'text-success' },
    { title: 'Clientes', value: clientes.length, icon: Users, change: `${clientes.filter(c => c.tipo === 'empresa').length} empresas`, color: 'text-info' },
    { title: 'Cobros Pendientes', value: `USD ${Math.round(montoPendiente).toLocaleString()}`, icon: DollarSign, change: `${cuotasVencidas.length} cuotas vencidas`, color: 'text-warning' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Bienvenido, {profile?.nombre?.split(' ')[0] || 'Usuario'}</h1>
          <p className="text-muted-foreground">Panel de control del Sistema de Gestión de Obras</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm py-1 px-3 gap-1">
            <Gauge className="h-3 w-3" />
            {tareas.filter(t => t.estado !== 'completada').length} tareas activas
          </Badge>
          <Badge variant="outline" className="text-sm py-1 px-3 gap-1">
            <Building2 className="h-3 w-3" />
            {vehiculos.length} vehículos
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value}{stat.total !== undefined && <span className="text-sm font-normal text-muted-foreground">/{stat.total}</span>}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><TrendingUp className="h-3 w-3" />{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Avance por Obra */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Avance por Obra</CardTitle></CardHeader>
          <CardContent>
            {avanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={avanceData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <YAxis dataKey="nombre" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, 'Progreso']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                  />
                  <Bar dataKey="progreso" fill="hsl(24, 100%, 50%)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center py-12">Sin datos de obras</p>}
          </CardContent>
        </Card>

        {/* Distribución de Unidades */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Distribución de Unidades</CardTitle></CardHeader>
          <CardContent>
            {unidadesDistribucion.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={unidadesDistribucion} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={55} paddingAngle={3} strokeWidth={0}>
                    {unidadesDistribucion.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center py-12">Sin datos de unidades</p>}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Flujo de Cobranza */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Flujo de Cobranza (últimos 6 meses)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={cuotasPorMes} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number, name: string) => [`USD ${value.toLocaleString()}`, name === 'cobrado' ? 'Cobrado' : 'Pendiente']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                />
                <Area type="monotone" dataKey="cobrado" stackId="1" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.3} />
                <Area type="monotone" dataKey="pendiente" stackId="1" stroke="hsl(48, 96%, 53%)" fill="hsl(48, 96%, 53%)" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tareas por Estado */}
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><ListTodo className="h-5 w-5" />Tareas por Estado</CardTitle></CardHeader>
          <CardContent>
            {tareasEstado.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={tareasEstado} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={55} paddingAngle={3} strokeWidth={0}>
                    {tareasEstado.map((_, i) => <Cell key={i} fill={TAREAS_COLORS[i % TAREAS_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center py-12">Sin tareas</p>}
          </CardContent>
        </Card>
      </div>

      {/* Alerts + Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-warning" />Alertas</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {cuotasVencidas.length > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div>
                  <p className="font-medium text-sm">{cuotasVencidas.length} cuota(s) vencida(s)</p>
                  <p className="text-xs text-muted-foreground">Total: USD {cuotasVencidas.reduce((s, c) => s + Number(c.monto), 0).toLocaleString()}</p>
                </div>
                <Badge variant="destructive">Vencido</Badge>
              </div>
            )}
            {tareasVencidas.length > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
                <div>
                  <p className="font-medium text-sm">{tareasVencidas.length} tarea(s) vencida(s)</p>
                  <p className="text-xs text-muted-foreground">Con fecha límite pasada</p>
                </div>
                <Badge className="bg-warning text-warning-foreground">Atención</Badge>
              </div>
            )}
            {stockAlerts.length > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="font-medium text-sm">{stockAlerts.length} producto(s) con stock bajo</p>
                  <p className="text-xs text-muted-foreground">Por debajo del mínimo</p>
                </div>
                <Link to="/stock"><Button variant="ghost" size="sm"><ArrowUpRight className="h-4 w-4" /></Button></Link>
              </div>
            )}
            {cuotasVencidas.length === 0 && tareasVencidas.length === 0 && stockAlerts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">✅ Sin alertas activas</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Acciones Rápidas</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2"><Plus className="h-5 w-5" /><span>Nueva Obra</span></Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2"><DollarSign className="h-5 w-5" /><span>Registrar Pago</span></Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2"><Package className="h-5 w-5" /><span>Nueva Unidad</span></Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2"><Users className="h-5 w-5" /><span>Nuevo Cliente</span></Button>
          </CardContent>
        </Card>
      </div>

      {/* Obras en Curso */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Obras en Curso</CardTitle>
          <Link to="/obras"><Button variant="ghost" size="sm">Ver todas <ArrowUpRight className="h-4 w-4 ml-1" /></Button></Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {obras.map((obra) => {
              const obraUnidades = unidades.filter(u => u.obra_id === obra.id);
              const vendidas = obraUnidades.filter(u => u.estado === 'vendida').length;
              return (
                <Link key={obra.id} to={`/obras/${obra.id}`}>
                  <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center"><Building2 className="h-6 w-6 text-primary" /></div>
                      <div>
                        <h3 className="font-medium">{obra.nombre}</h3>
                        <p className="text-sm text-muted-foreground">{obra.direccion} • {vendidas}/{obraUnidades.length} vendidas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-24">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Avance</span>
                          <span className="font-medium">{obra.progreso}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${obra.progreso}%` }} />
                        </div>
                      </div>
                      <Badge variant={obra.estado === 'en_curso' ? 'default' : 'secondary'}>
                        {obra.estado === 'en_curso' ? 'En curso' : obra.estado === 'planificacion' ? 'Planificación' : obra.estado}
                      </Badge>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  BarChart2, TrendingUp, TrendingDown, Download, Sparkles, DollarSign,
  ArrowUpRight, ArrowDownRight, RefreshCw, Building2, CheckCircle, Clock, Filter,
} from 'lucide-react';
import type {
  PeriodoFinanciero, ResumenFinanciero, AnalisisIAFinanciero,
} from '@/types/finanzas';
import {
  mockMovimientos, mockFlujoCaja, mockRentabilidad, mockDesgloseCostos,
} from '@/data/mockFinanzas';

const getPeriodoLabel = (p: PeriodoFinanciero) =>
  p === 'mes' ? 'Último mes' : p === 'trimestre' ? 'Último trimestre' : 'Este año';

export default function DashboardFinanciero() {
  const [periodo, setPeriodo] = useState<PeriodoFinanciero>('trimestre');
  const [analisisIA, setAnalisisIA] = useState<AnalisisIAFinanciero | null>(null);
  const [isLoadingIA, setIsLoadingIA] = useState(false);
  const [tabActiva, setTabActiva] = useState('overview');
  const [movimientos, setMovimientos] = useState(mockMovimientos);

  // Movimientos filters
  const [filtroTipoMov, setFiltroTipoMov] = useState<'todos' | 'cobro' | 'pago'>('todos');
  const [filtroEstadoMov, setFiltroEstadoMov] = useState<'todos' | 'pendiente' | 'realizado'>('todos');
  const [busquedaMov, setBusquedaMov] = useState('');

  const movimientosFiltrados = useMemo(() => {
    const ahora = new Date();
    const desde = periodo === 'mes'
      ? new Date(ahora.getFullYear(), ahora.getMonth(), 1)
      : periodo === 'trimestre'
      ? new Date(ahora.getFullYear(), ahora.getMonth() - 3, 1)
      : new Date(ahora.getFullYear(), 0, 1);
    return movimientos.filter(m => new Date(m.fecha) >= desde || !m.pagado);
  }, [periodo, movimientos]);

  const resumen: ResumenFinanciero = useMemo(() => {
    const cobros = movimientosFiltrados.filter(m => m.tipo === 'cobro' && m.pagado);
    const pagos = movimientosFiltrados.filter(m => m.tipo === 'pago' && m.pagado);
    const porCobrar = movimientosFiltrados.filter(m => m.tipo === 'cobro' && !m.pagado).reduce((a, m) => a + m.monto, 0);
    const porPagar = movimientosFiltrados.filter(m => m.tipo === 'pago' && !m.pagado).reduce((a, m) => a + m.monto, 0);
    const facturacion = cobros.reduce((a, m) => a + m.monto, 0);
    const costos = pagos.reduce((a, m) => a + m.monto, 0);
    const utilidad = facturacion - costos;
    const flujoCajaLibre = mockFlujoCaja.slice(-1)[0]?.neto || 0;
    return {
      facturacionTotal: facturacion,
      facturacionAnterior: Math.round(facturacion * 0.88),
      costosTotal: costos,
      costosAnterior: Math.round(costos * 0.82),
      utilidadNeta: utilidad,
      margenNeto: facturacion > 0 ? (utilidad / facturacion) * 100 : 0,
      flujoCajaLibre,
      porCobrar,
      porPagar,
      moneda: 'USD' as const,
    };
  }, [movimientosFiltrados]);

  const movimientosTabla = useMemo(() => {
    let list = movimientosFiltrados;
    if (filtroTipoMov !== 'todos') list = list.filter(m => m.tipo === filtroTipoMov);
    if (filtroEstadoMov === 'pendiente') list = list.filter(m => !m.pagado);
    if (filtroEstadoMov === 'realizado') list = list.filter(m => m.pagado);
    if (busquedaMov) {
      const q = busquedaMov.toLowerCase();
      list = list.filter(m => m.concepto.toLowerCase().includes(q) || m.contraparte.toLowerCase().includes(q));
    }
    return list.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [movimientosFiltrados, filtroTipoMov, filtroEstadoMov, busquedaMov]);

  const flujosConAcumulado = useMemo(() => {
    return mockFlujoCaja.reduce((acc, mes, i) => {
      const anterior = i > 0 ? acc[i - 1].acumulado : 0;
      return [...acc, { ...mes, acumulado: anterior + mes.neto }];
    }, [] as (typeof mockFlujoCaja[0] & { acumulado: number })[]);
  }, []);

  const marcarPagado = (id: string) => {
    setMovimientos(prev => prev.map(m => m.id === id ? { ...m, pagado: true } : m));
    toast({ title: 'Movimiento actualizado', description: 'Marcado como pagado.' });
  };

  const handleAnalisisIA = async () => {
    setIsLoadingIA(true);
    try {
      const prompt = `Analizá este estado financiero consolidado:

RESUMEN:
- Facturación: USD ${resumen.facturacionTotal.toLocaleString()}
- Costos: USD ${resumen.costosTotal.toLocaleString()}
- Utilidad neta: USD ${resumen.utilidadNeta.toLocaleString()}
- Margen neto: ${resumen.margenNeto.toFixed(1)}%
- Flujo de caja libre (último mes): USD ${resumen.flujoCajaLibre.toLocaleString()}
- Por cobrar: USD ${resumen.porCobrar.toLocaleString()}
- Por pagar: USD ${resumen.porPagar.toLocaleString()}

RENTABILIDAD POR OBRA:
${mockRentabilidad.map(o => `- ${o.obraNombre}: margen ${o.margen.toFixed(1)}% (${o.estado})`).join('\n')}

FLUJO DE CAJA ÚLTIMOS 6 MESES:
${mockFlujoCaja.map(m => `- ${m.mes}: neto ${m.neto >= 0 ? '+' : ''}USD ${m.neto.toLocaleString()}`).join('\n')}

COSTOS FUERA DE RANGO:
${mockDesgloseCostos.filter(d => d.estado !== 'ok').map(d => `- ${d.rubro}: ${d.porcentaje.toFixed(1)}% del total`).join('\n')}

VENCIMIENTOS PRÓXIMOS:
${movimientos.filter(m => !m.pagado).map(m => `- ${m.tipo === 'cobro' ? 'COBRAR' : 'PAGAR'} ${m.contraparte}: USD ${m.monto.toLocaleString()} — vence ${m.vencimiento}`).join('\n')}

Dame: 1) Evaluación general de la salud financiera, 2) Las 2-3 alertas más importantes, 3) Proyección de flujo de caja para los próximos 60 días, 4) Recomendaciones concretas para mejorar el margen.`;

      const { data, error } = await supabase.functions.invoke('ai-finanzas', {
        body: { messages: [{ role: 'user', content: prompt }] },
      });
      if (error) throw error;

      setAnalisisIA({
        resumen: data?.texto || '',
        alertas: [], proyeccion: '', recomendaciones: [],
        generadoEn: new Date().toISOString(),
      });
    } catch {
      toast({ title: 'Error', description: 'Error al analizar. Intentá de nuevo.', variant: 'destructive' });
    } finally {
      setIsLoadingIA(false);
    }
  };

  const MetricCard = ({ label, valor, delta, deltaPos, sub }: {
    label: string; valor: string; delta: string; deltaPos: boolean; sub: string;
  }) => (
    <Card>
      <CardContent className="pt-4 pb-3">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold">{valor}</p>
        <p className={`text-xs flex items-center gap-1 mt-1 ${deltaPos ? 'text-emerald-600' : 'text-red-500'}`}>
          {deltaPos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {delta}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard Financiero</h1>
          <p className="text-sm text-muted-foreground">
            Consolidado de todas las obras · {getPeriodoLabel(periodo)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 no-print">
          {(['mes', 'trimestre', 'anio'] as PeriodoFinanciero[]).map(p => (
            <Button key={p} variant={periodo === p ? 'default' : 'outline'} size="sm"
              onClick={() => setPeriodo(p)}>
              {p === 'mes' ? 'Mes' : p === 'trimestre' ? 'Trimestre' : 'Año'}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-1" />PDF
          </Button>
          <Button size="sm" onClick={handleAnalisisIA} disabled={isLoadingIA}>
            <Sparkles className="h-4 w-4 mr-1" />
            {isLoadingIA ? 'Analizando...' : 'Análisis IA'}
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Facturación" valor={`USD ${(resumen.facturacionTotal / 1000).toFixed(0)}K`}
          delta={`${resumen.facturacionTotal >= resumen.facturacionAnterior ? '+' : ''}${((resumen.facturacionTotal - resumen.facturacionAnterior) / resumen.facturacionAnterior * 100).toFixed(0)}%`}
          deltaPos={resumen.facturacionTotal >= resumen.facturacionAnterior} sub="vs período anterior" />
        <MetricCard label="Costos totales" valor={`USD ${(resumen.costosTotal / 1000).toFixed(0)}K`}
          delta={`${resumen.costosTotal <= resumen.facturacionTotal * 0.8 ? 'Controlados' : 'En alza'}`}
          deltaPos={resumen.costosTotal <= resumen.facturacionTotal * 0.8} sub="sobre facturación" />
        <MetricCard label="Margen neto" valor={`${resumen.margenNeto.toFixed(1)}%`}
          delta={resumen.margenNeto >= 20 ? 'Margen saludable' : 'Revisar costos'}
          deltaPos={resumen.margenNeto >= 20} sub="utilidad / facturación" />
        <MetricCard label="Flujo de caja" valor={`${resumen.flujoCajaLibre >= 0 ? '+' : '−'}USD ${(Math.abs(resumen.flujoCajaLibre) / 1000).toFixed(0)}K`}
          delta={resumen.flujoCajaLibre >= 0 ? 'Superávit' : 'Déficit este mes'}
          deltaPos={resumen.flujoCajaLibre >= 0} sub="último mes cerrado" />
      </div>

      {/* Tabs */}
      <Tabs value={tabActiva} onValueChange={setTabActiva}>
        <TabsList className="no-print">
          <TabsTrigger value="overview">Vista general</TabsTrigger>
          <TabsTrigger value="rentabilidad">Rentabilidad</TabsTrigger>
          <TabsTrigger value="flujo">Flujo de caja</TabsTrigger>
          <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rentabilidad por obra */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Rentabilidad por obra</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[...mockRentabilidad].sort((a, b) => b.margen - a.margen).map(obra => (
                  <div key={obra.obraId}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm truncate mr-2">{obra.obraNombre}</span>
                      <span className={`text-sm font-bold ${
                        obra.margen >= 20 ? 'text-emerald-600' :
                        obra.margen >= 10 ? 'text-amber-600' : 'text-red-500'
                      }`}>{obra.margen.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${
                        obra.margen >= 20 ? 'bg-emerald-500' :
                        obra.margen >= 10 ? 'bg-amber-500' : 'bg-red-500'
                      }`} style={{ width: `${Math.min(obra.margen * 2, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Flujo de caja visual */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Flujo de caja — últimos 6 meses</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-2 h-40">
                  {mockFlujoCaja.map((mes, i) => {
                    const max = Math.max(...mockFlujoCaja.map(m => Math.abs(m.neto)));
                    const alto = max > 0 ? (Math.abs(mes.neto) / max) * 100 : 0;
                    return (
                      <div key={i} className="flex flex-col items-center gap-1 flex-1">
                        <span className={`text-[10px] font-medium ${mes.neto >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {mes.neto >= 0 ? '+' : '−'}{(Math.abs(mes.neto) / 1000).toFixed(0)}K
                        </span>
                        <div className="w-full flex items-end justify-center h-24">
                          <div className={`w-full max-w-8 rounded-t ${mes.neto >= 0 ? 'bg-emerald-400' : 'bg-red-400'}`}
                            style={{ height: `${alto}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{mes.mes}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Desglose de costos */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Desglose de costos</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rubro</TableHead>
                      <TableHead className="text-right">USD</TableHead>
                      <TableHead className="text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDesgloseCostos.map(d => (
                      <TableRow key={d.rubro}>
                        <TableCell className="text-sm">{d.rubro}</TableCell>
                        <TableCell className="text-right text-sm">{d.monto.toLocaleString('es-AR')}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className={
                            d.estado === 'danger' ? 'border-red-300 text-red-700 bg-red-50' :
                            d.estado === 'warning' ? 'border-amber-300 text-amber-700 bg-amber-50' : ''
                          }>
                            {d.porcentaje.toFixed(1)}%{d.estado === 'danger' ? ' ↑' : ''}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Próximos vencimientos */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Próximos vencimientos</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-xs text-emerald-600">Por cobrar</p>
                    <p className="text-sm font-bold text-emerald-700">USD {(resumen.porCobrar / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-xs text-red-600">Por pagar</p>
                    <p className="text-sm font-bold text-red-700">USD {(resumen.porPagar / 1000).toFixed(0)}K</p>
                  </div>
                  <div className={`text-center p-2 rounded-lg border ${
                    resumen.porCobrar - resumen.porPagar >= 0
                      ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className={`text-sm font-bold ${
                      resumen.porCobrar - resumen.porPagar >= 0 ? 'text-emerald-700' : 'text-red-700'
                    }`}>USD {((resumen.porCobrar - resumen.porPagar) / 1000).toFixed(0)}K</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {movimientos
                    .filter(m => !m.pagado)
                    .sort((a, b) => new Date(a.vencimiento).getTime() - new Date(b.vencimiento).getTime())
                    .slice(0, 5)
                    .map(m => (
                      <div key={m.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                        <div>
                          <p className="text-sm font-medium">{m.contraparte}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(m.vencimiento).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                          </p>
                        </div>
                        <span className={`text-sm font-medium ${m.tipo === 'cobro' ? 'text-emerald-600' : 'text-red-500'}`}>
                          {m.tipo === 'cobro' ? '+' : '−'}USD {m.monto.toLocaleString('es-AR')}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Análisis IA */}
          {isLoadingIA && (
            <Card>
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  <span className="font-medium">Analizando datos financieros...</span>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          )}
          {analisisIA && !isLoadingIA && (
            <Card className="bg-muted/30 border-primary/20">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold">Análisis financiero ejecutivo — IA</h2>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleAnalisisIA} className="no-print">
                    <RefreshCw className="h-3.5 w-3.5 mr-1" />Regenerar
                  </Button>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{analisisIA.resumen}</p>
                <p className="text-xs text-muted-foreground mt-3">
                  Generado: {new Date(analisisIA.generadoEn).toLocaleDateString('es-AR')}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Rentabilidad */}
        <TabsContent value="rentabilidad" className="space-y-4 mt-4">
          {mockRentabilidad.map(obra => (
            <Card key={obra.obraId} className={
              obra.estado === 'danger' ? 'border-red-300' :
              obra.estado === 'warning' ? 'border-amber-300' : ''
            }>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{obra.obraNombre}</h3>
                  <Badge variant="outline" className={
                    obra.margen >= 20 ? 'border-emerald-300 text-emerald-700 bg-emerald-50' :
                    obra.margen >= 10 ? 'border-amber-300 text-amber-700 bg-amber-50' :
                    'border-red-300 text-red-700 bg-red-50'
                  }>{obra.margen.toFixed(1)}% margen</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Ingresos</p>
                    <p className="text-lg font-bold text-emerald-600">USD {obra.ingresos.toLocaleString('es-AR')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Costos</p>
                    <p className="text-lg font-bold text-red-500">USD {obra.costos.toLocaleString('es-AR')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Utilidad</p>
                    <p className={`text-lg font-bold ${obra.utilidad >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      USD {obra.utilidad.toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${
                    obra.margen >= 20 ? 'bg-emerald-500' : obra.margen >= 10 ? 'bg-amber-500' : 'bg-red-500'
                  }`} style={{ width: `${Math.min(obra.margen * 2, 100)}%` }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Flujo de caja */}
        <TabsContent value="flujo" className="mt-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Flujo de caja detallado</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mes</TableHead>
                    <TableHead className="text-right">Ingresos</TableHead>
                    <TableHead className="text-right">Egresos</TableHead>
                    <TableHead className="text-right">Neto</TableHead>
                    <TableHead className="text-right">Acumulado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flujosConAcumulado.map(m => (
                    <TableRow key={`${m.mes}-${m.anio}`}>
                      <TableCell className="font-medium">{m.mes} {m.anio}</TableCell>
                      <TableCell className="text-right text-emerald-600">
                        USD {m.ingresos.toLocaleString('es-AR')}
                      </TableCell>
                      <TableCell className="text-right text-red-500">
                        USD {m.egresos.toLocaleString('es-AR')}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${m.neto >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {m.neto >= 0 ? '+' : '−'}USD {Math.abs(m.neto).toLocaleString('es-AR')}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${m.acumulado >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {m.acumulado >= 0 ? '+' : '−'}USD {Math.abs(m.acumulado).toLocaleString('es-AR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Movimientos */}
        <TabsContent value="movimientos" className="space-y-4 mt-4">
          <div className="flex flex-wrap gap-2 no-print">
            {(['todos', 'cobro', 'pago'] as const).map(t => (
              <Button key={t} variant={filtroTipoMov === t ? 'default' : 'outline'} size="sm"
                onClick={() => setFiltroTipoMov(t)}>
                {t === 'todos' ? 'Todos' : t === 'cobro' ? 'Cobros' : 'Pagos'}
              </Button>
            ))}
            {(['todos', 'pendiente', 'realizado'] as const).map(e => (
              <Button key={e} variant={filtroEstadoMov === e ? 'default' : 'outline'} size="sm"
                onClick={() => setFiltroEstadoMov(e)}>
                {e === 'todos' ? 'Todos' : e === 'pendiente' ? 'Pendientes' : 'Realizados'}
              </Button>
            ))}
            <Input placeholder="Buscar concepto o contraparte..."
              value={busquedaMov} onChange={e => setBusquedaMov(e.target.value)}
              className="max-w-xs h-9" />
          </div>
          <Card>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead>Contraparte</TableHead>
                      <TableHead>Obra</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="no-print"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimientosTabla.slice(0, 15).map(m => (
                      <TableRow key={m.id}>
                        <TableCell className="text-sm">
                          {new Date(m.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            m.tipo === 'cobro'
                              ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                              : 'border-red-300 text-red-700 bg-red-50'
                          }>{m.tipo === 'cobro' ? 'Cobro' : 'Pago'}</Badge>
                        </TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">{m.concepto}</TableCell>
                        <TableCell className="text-sm">{m.contraparte}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{m.obraNombre || '—'}</TableCell>
                        <TableCell className={`text-right text-sm font-medium ${
                          m.tipo === 'cobro' ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {m.tipo === 'cobro' ? '+' : '−'}USD {m.monto.toLocaleString('es-AR')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            m.pagado ? '' : 'border-amber-300 text-amber-700 bg-amber-50'
                          }>
                            {m.pagado ? 'Realizado' : 'Pendiente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="no-print">
                          {!m.pagado && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs"
                              onClick={() => marcarPagado(m.id)}>
                              <CheckCircle className="h-3 w-3 mr-1" />Pagado
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

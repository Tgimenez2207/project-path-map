import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Zap, RefreshCw, Download, Sparkles, TrendingUp, TrendingDown,
  AlertTriangle, ArrowRight, CheckCircle, Clock, Building2,
  Users, DollarSign, History, ChevronRight, ArrowUpDown,
} from 'lucide-react';
import type { BriefingData } from '@/types/briefing';
import { supabase as sbClient } from '@/integrations/supabase/client';

interface BriefingRecord {
  id: string;
  semana: string;
  datos: BriefingData;
  resumen_ejecutivo: string | null;
  created_at: string;
}

export default function BriefingSemanal() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const nombreUsuario = profile?.nombre || 'Tomás';

  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSlowMsg, setShowSlowMsg] = useState(false);
  const [historial, setHistorial] = useState<BriefingRecord[]>([]);
  const [showHistorial, setShowHistorial] = useState(false);
  const [showComparacion, setShowComparacion] = useState(false);
  const [comparar, setComparar] = useState<[BriefingRecord | null, BriefingRecord | null]>([null, null]);

  // Load history and current briefing
  useEffect(() => {
    loadHistorial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadHistorial = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('briefings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data && data.length > 0) {
      const records = data.map(d => ({ ...d, datos: d.datos as unknown as BriefingData })) as BriefingRecord[];
      setHistorial(records);

      // Check if latest is from today
      const latest = records[0];
      const hoy = new Date().toDateString();
      const latestDate = new Date(latest.created_at).toDateString();
      if (latestDate === hoy) {
        setBriefing(latest.datos);
        return;
      }
    }
    // No briefing for today → generate
    generarBriefing();
  };

  useEffect(() => {
    if (!isLoading) { setShowSlowMsg(false); return; }
    const t = setTimeout(() => setShowSlowMsg(true), 20000);
    return () => clearTimeout(t);
  }, [isLoading]);

  const guardarBriefing = async (briefingData: BriefingData) => {
    if (!user?.id) return;
    const { data, error } = await supabase.from('briefings').insert({
      user_id: user.id,
      semana: briefingData.semana,
      datos: briefingData as any,
      resumen_ejecutivo: briefingData.resumenEjecutivo,
    }).select().single();

    if (!error && data) {
      setHistorial(prev => [{ ...data, datos: data.datos as unknown as BriefingData } as BriefingRecord, ...prev]);
    }
  };

  const generarBriefing = async () => {
    setIsLoading(true);
    setBriefing(null);

    const obrasActivas = mockObras.filter(o => o.estado === 'en_curso');
    const tareasEnRutaCritica = mockGantt.filter(n => n.critica && n.avance < 100);
    const clientesRiesgo = mockClientesScoring.filter(c => c.scoreIA && c.scoreIA.scoreGlobal < 50);
    const proveedoresPendientes = mockProveedores.filter(p => p.estado === 'activo').slice(0, 3);

    const contexto = {
      fecha: new Date().toLocaleDateString('es-AR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      }),
      usuario: nombreUsuario,
      obras: obrasActivas.map(o => ({
        nombre: o.nombre, progreso: o.progreso, estado: o.estado,
        presupuesto: o.presupuestoTotal, moneda: o.moneda,
      })),
      etapas: mockEtapas.map(e => ({ nombre: e.nombre, estado: e.estado, obraId: e.obraId })),
      tareasEnRutaCritica: tareasEnRutaCritica.map(t => ({
        nombre: t.nombre, avance: t.avance, responsable: t.responsable,
        diasSinMover: Math.floor(Math.random() * 7) + 1,
      })),
      clientesEnRiesgo: clientesRiesgo.map(c => ({
        nombre: c.nombre || c.razonSocial,
        score: c.scoreIA?.scoreGlobal,
        probPago: c.scoreIA?.probabilidadPagoTiempo,
      })),
      proveedoresPendientes: proveedoresPendientes.map(p => ({
        nombre: p.razonSocial,
        montoPendiente: Math.floor(Math.random() * 80000) + 20000,
      })),
    };

    try {
      const { data, error } = await supabase.functions.invoke('ai-briefing', {
        body: {
          messages: [{
            role: 'user',
            content: `Generá el briefing semanal con estos datos:\n${JSON.stringify(contexto, null, 2)}`,
          }],
        },
      });
      if (error) throw error;

      const texto = data?.texto || '';
      const jsonMatch = texto.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Sin JSON');

      const briefingData: BriefingData = JSON.parse(jsonMatch[0]);
      setBriefing(briefingData);
      await guardarBriefing(briefingData);
    } catch {
      toast({ title: 'Error', description: 'Error al generar el briefing. Intentá de nuevo.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerar = () => generarBriefing();

  const handleCompararSemanas = (a: BriefingRecord, b: BriefingRecord) => {
    setComparar([a, b]);
    setShowComparacion(true);
    setShowHistorial(false);
  };

  // No data state
  if (!isLoading && !briefing && mockObras.filter(o => o.estado === 'en_curso').length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center py-20">
        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Aún no hay datos suficientes para el briefing</h2>
        <p className="text-muted-foreground mb-6">
          Cargá al menos una obra con avance para que la IA pueda generar tu resumen semanal.
        </p>
        <Button onClick={() => navigate('/obras')}>Ir a Obras</Button>
      </div>
    );
  }

  const alertasOrdenadas = briefing?.alertas
    ? [...briefing.alertas].sort((a, b) => {
        const orden = { critica: 0, advertencia: 1, info: 2 } as const;
        return (orden[a.severidad] ?? 2) - (orden[b.severidad] ?? 2);
      })
    : [];

  const getSeveridadStyles = (s: string) => {
    if (s === 'critica') return { border: 'border-red-300', bg: 'bg-red-50', icon: 'text-red-500', badge: 'bg-red-100 text-red-700' };
    if (s === 'advertencia') return { border: 'border-amber-300', bg: 'bg-amber-50', icon: 'text-amber-500', badge: 'bg-amber-100 text-amber-700' };
    return { border: 'border-blue-300', bg: 'bg-blue-50', icon: 'text-blue-500', badge: 'bg-blue-100 text-blue-700' };
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('es-AR', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
          <h1 className="text-2xl font-semibold">
            {briefing?.saludoPersonalizado || `Buenos días, ${nombreUsuario}`}
          </h1>
        </div>
        <div className="flex gap-2 no-print">
          {historial.length > 1 && (
            <Button variant="outline" size="sm" onClick={() => setShowHistorial(true)}>
              <History className="h-4 w-4 mr-2" />Historial ({historial.length})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-2" />PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleRegenerar} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Generando...' : 'Regenerar'}
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-6">
          <Card>
            <CardContent className="py-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                <span className="text-lg font-medium">La IA está analizando todas tus obras...</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {showSlowMsg
                  ? 'Estamos revisando todas tus obras, ya casi…'
                  : 'Revisando alertas, presupuestos, cronogramas y clientes'}
              </p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {/* Briefing content */}
      {briefing && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground mb-1">Obras activas</p>
                <p className="text-3xl font-bold">{briefing.kpis.obrasActivas}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {briefing.kpis.obrasEnRutaCritica} en ruta crítica
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground mb-1">Avance promedio</p>
                <p className="text-3xl font-bold">{briefing.kpis.avancePromedio}%</p>
                <p className={`text-xs flex items-center gap-1 mt-1 ${
                  briefing.kpis.avancePromedio >= briefing.kpis.avanceAnterior
                    ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {briefing.kpis.avancePromedio >= briefing.kpis.avanceAnterior
                    ? <TrendingUp className="h-3 w-3" />
                    : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(briefing.kpis.avancePromedio - briefing.kpis.avanceAnterior)}% vs semana pasada
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground mb-1">Pagos a proveedores</p>
                <p className="text-2xl font-bold">
                  USD {briefing.kpis.pagosPendientesUSD.toLocaleString('es-AR')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {briefing.kpis.cantProveedoresPendientes} proveedores pendientes
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground mb-1">Clientes en riesgo</p>
                <p className={`text-3xl font-bold ${briefing.kpis.clientesEnRiesgo > 0 ? 'text-red-500' : ''}`}>
                  {briefing.kpis.clientesEnRiesgo}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Score IA {'<'} 50</p>
              </CardContent>
            </Card>
          </div>

          {/* Alertas */}
          {alertasOrdenadas.length > 0 && (
            <Card>
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  {alertasOrdenadas.some(a => a.severidad === 'critica') && (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                  <h2 className="font-semibold">Alertas que necesitan tu atención</h2>
                </div>
                {alertasOrdenadas.map(alerta => {
                  const s = getSeveridadStyles(alerta.severidad);
                  return (
                    <div key={alerta.id} className={`flex gap-3 p-3 rounded-xl border ${s.border} ${s.bg}`}>
                      <AlertTriangle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${s.icon}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-sm">{alerta.titulo}</h3>
                          <Badge variant="outline" className={`text-[10px] ${s.badge}`}>
                            {alerta.modulo}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{alerta.descripcion}</p>
                        {alerta.obraNombre && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Building2 className="h-3 w-3" />{alerta.obraNombre}
                          </p>
                        )}
                        {alerta.accionSugerida && (
                          <div className="flex items-start gap-1.5 mt-2">
                            <ArrowRight className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                            <p className="text-xs font-medium text-primary">{alerta.accionSugerida}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Estado de obras */}
          {briefing.obras.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3">Estado de obras</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {briefing.obras.map(obra => (
                  <Card key={obra.id} className={
                    obra.estado === 'danger' ? 'border-red-300' :
                    obra.estado === 'warning' ? 'border-amber-300' : ''
                  }>
                    <CardContent className="pt-4 pb-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm">{obra.nombre}</h3>
                        <span className={`text-sm font-bold ${
                          obra.estado === 'danger' ? 'text-red-600' :
                          obra.estado === 'warning' ? 'text-amber-600' : 'text-emerald-600'
                        }`}>{obra.progreso}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            obra.estado === 'danger' ? 'bg-red-500' :
                            obra.estado === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${obra.progreso}%` }}
                        />
                      </div>
                      {obra.alertas.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {obra.alertas.map((a, i) => (
                            <Badge key={i} variant="outline" className="text-[10px]">{a}</Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Agenda */}
          {briefing.agenda.length > 0 && (
            <Card>
              <CardContent className="pt-5 space-y-3">
                <h2 className="font-semibold mb-1">Tu agenda de decisiones esta semana</h2>
                {briefing.agenda.map(item => (
                  <div key={item.orden} className="flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {item.orden}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.accion}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.contexto}
                        {item.urgencia === 'urgente' && (
                          <span className="text-red-500 font-medium"> · Urgente</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Resumen ejecutivo */}
          <Card className="bg-muted/30 border-primary/20">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Análisis ejecutivo — IA</h2>
              </div>
              <p className="text-sm leading-relaxed">{briefing.resumenEjecutivo}</p>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <div className="no-print">
            <h2 className="font-semibold mb-3">Profundizar con IA</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: '¿Qué hago primero esta semana?' },
                { label: 'Redactar email para cliente en riesgo' },
                { label: 'Proyección de cierre de obras' },
              ].map((btn, i) => (
                <Button key={i} variant="outline" className="justify-start h-auto py-3 text-left"
                  onClick={() => navigate('/ayuda')}>
                  <Sparkles className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{btn.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Historial Dialog */}
      <Dialog open={showHistorial} onOpenChange={setShowHistorial}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial de briefings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <p className="text-sm text-muted-foreground">
              Seleccioná dos briefings para comparar semanas.
            </p>
            {historial.map((record, idx) => {
              const d = record.datos;
              const fecha = new Date(record.created_at);
              return (
                <Card
                  key={record.id}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    idx === 0 ? 'border-primary/30 bg-primary/5' : ''
                  }`}
                  onClick={() => {
                    setBriefing(record.datos);
                    setShowHistorial(false);
                  }}
                >
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{d.semana}</p>
                        <p className="text-xs text-muted-foreground">
                          {fecha.toLocaleDateString('es-AR', {
                            weekday: 'long', day: 'numeric', month: 'long',
                          })}
                          {idx === 0 && <Badge className="ml-2 text-[10px]" variant="outline">Actual</Badge>}
                        </p>
                      </div>
                      <div className="flex gap-2 items-center">
                        {idx < historial.length - 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompararSemanas(record, historial[idx + 1]);
                            }}
                          >
                            <ArrowUpDown className="h-3 w-3 mr-1" />
                            vs anterior
                          </Button>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    {/* Mini KPIs */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center">
                        <p className="text-lg font-bold">{d.kpis.obrasActivas}</p>
                        <p className="text-[10px] text-muted-foreground">Obras</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{d.kpis.avancePromedio}%</p>
                        <p className="text-[10px] text-muted-foreground">Avance</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{d.alertas.length}</p>
                        <p className="text-[10px] text-muted-foreground">Alertas</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-lg font-bold ${d.kpis.clientesEnRiesgo > 0 ? 'text-red-500' : ''}`}>
                          {d.kpis.clientesEnRiesgo}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Riesgo</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Comparación Dialog */}
      <Dialog open={showComparacion} onOpenChange={setShowComparacion}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5" />
              Comparación semanal
            </DialogTitle>
          </DialogHeader>
          {comparar[0] && comparar[1] && (
            <CompararSemanas a={comparar[0]} b={comparar[1]} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CompararSemanas({ a, b }: { a: BriefingRecord; b: BriefingRecord }) {
  const da = a.datos;
  const db = b.datos;

  const rows: { label: string; valA: string; valB: string; mejor: 'a' | 'b' | 'equal' }[] = [
    {
      label: 'Obras activas',
      valA: `${da.kpis.obrasActivas}`,
      valB: `${db.kpis.obrasActivas}`,
      mejor: da.kpis.obrasActivas >= db.kpis.obrasActivas ? 'a' : 'b',
    },
    {
      label: 'Obras en ruta crítica',
      valA: `${da.kpis.obrasEnRutaCritica}`,
      valB: `${db.kpis.obrasEnRutaCritica}`,
      mejor: da.kpis.obrasEnRutaCritica <= db.kpis.obrasEnRutaCritica ? 'a' : 'b',
    },
    {
      label: 'Avance promedio',
      valA: `${da.kpis.avancePromedio}%`,
      valB: `${db.kpis.avancePromedio}%`,
      mejor: da.kpis.avancePromedio >= db.kpis.avancePromedio ? 'a' : 'b',
    },
    {
      label: 'Pagos pendientes USD',
      valA: `USD ${da.kpis.pagosPendientesUSD.toLocaleString('es-AR')}`,
      valB: `USD ${db.kpis.pagosPendientesUSD.toLocaleString('es-AR')}`,
      mejor: da.kpis.pagosPendientesUSD <= db.kpis.pagosPendientesUSD ? 'a' : 'b',
    },
    {
      label: 'Proveedores pendientes',
      valA: `${da.kpis.cantProveedoresPendientes}`,
      valB: `${db.kpis.cantProveedoresPendientes}`,
      mejor: da.kpis.cantProveedoresPendientes <= db.kpis.cantProveedoresPendientes ? 'a' : 'b',
    },
    {
      label: 'Clientes en riesgo',
      valA: `${da.kpis.clientesEnRiesgo}`,
      valB: `${db.kpis.clientesEnRiesgo}`,
      mejor: da.kpis.clientesEnRiesgo <= db.kpis.clientesEnRiesgo ? 'a' : 'b',
    },
    {
      label: 'Cantidad de alertas',
      valA: `${da.alertas.length}`,
      valB: `${db.alertas.length}`,
      mejor: da.alertas.length <= db.alertas.length ? 'a' : 'b',
    },
    {
      label: 'Alertas críticas',
      valA: `${da.alertas.filter(x => x.severidad === 'critica').length}`,
      valB: `${db.alertas.filter(x => x.severidad === 'critica').length}`,
      mejor: da.alertas.filter(x => x.severidad === 'critica').length <= db.alertas.filter(x => x.severidad === 'critica').length ? 'a' : 'b',
    },
  ];

  return (
    <div className="space-y-4 mt-2">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Métrica</th>
              <th className="text-center py-2 px-4 font-medium">
                <span className="text-xs text-muted-foreground block">Semana</span>
                {da.semana}
              </th>
              <th className="text-center py-2 px-4 font-medium">
                <span className="text-xs text-muted-foreground block">Semana</span>
                {db.semana}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-2.5 pr-4 text-muted-foreground">{row.label}</td>
                <td className={`py-2.5 px-4 text-center font-medium ${
                  row.mejor === 'a' ? 'text-emerald-600 bg-emerald-50' : ''
                }`}>{row.valA}</td>
                <td className={`py-2.5 px-4 text-center font-medium ${
                  row.mejor === 'b' ? 'text-emerald-600 bg-emerald-50' : ''
                }`}>{row.valB}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resúmenes lado a lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Resumen — {da.semana}</p>
            <p className="text-sm leading-relaxed">{da.resumenEjecutivo}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Resumen — {db.semana}</p>
            <p className="text-sm leading-relaxed">{db.resumenEjecutivo}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

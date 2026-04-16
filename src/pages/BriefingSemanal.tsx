import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Zap, RefreshCw, Download, Sparkles, TrendingUp, TrendingDown,
  AlertTriangle, ArrowRight, CheckCircle, Clock, Building2,
  Users, DollarSign,
} from 'lucide-react';
import type { BriefingData } from '@/types/briefing';
import { mockObras, mockEtapas, mockTareas } from '@/data/mockObras';
import { mockGantt } from '@/data/mockGantt';
import { mockClientesScoring } from '@/data/mockClientesScoring';
import { mockProveedores } from '@/data/mockProveedores';

export default function BriefingSemanal() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const nombreUsuario = profile?.nombre || 'Tomás';

  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);
  const [showSlowMsg, setShowSlowMsg] = useState(false);

  useEffect(() => {
    const cache = localStorage.getItem('briefing_cache');
    if (cache) {
      try {
        const { data, fecha } = JSON.parse(cache);
        if (fecha === new Date().toDateString()) {
          setBriefing(data);
          setUltimaActualizacion(new Date());
          return;
        }
      } catch { /* ignore */ }
    }
    generarBriefing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoading) { setShowSlowMsg(false); return; }
    const t = setTimeout(() => setShowSlowMsg(true), 20000);
    return () => clearTimeout(t);
  }, [isLoading]);

  const generarBriefing = async () => {
    setIsLoading(true);
    setBriefing(null);

    const obrasActivas = mockObras.filter(o => o.estado === 'en_curso');
    const avancePromedio = obrasActivas.length
      ? Math.round(obrasActivas.reduce((a, o) => a + o.progreso, 0) / obrasActivas.length)
      : 0;
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
      setUltimaActualizacion(new Date());
      localStorage.setItem('briefing_cache', JSON.stringify({
        data: briefingData, fecha: new Date().toDateString(),
      }));
    } catch {
      toast({ title: 'Error', description: 'Error al generar el briefing. Intentá de nuevo.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerar = () => {
    localStorage.removeItem('briefing_cache');
    generarBriefing();
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

  const getUrgenciaStyles = (u: string) => {
    if (u === 'urgente') return 'bg-red-100 text-red-700';
    if (u === 'esta_semana') return 'bg-amber-100 text-amber-700';
    return 'bg-blue-100 text-blue-700';
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
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-2" />Exportar PDF
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
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
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
    </div>
  );
}

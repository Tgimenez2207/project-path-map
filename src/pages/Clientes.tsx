import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Users, Star, Sparkles, BarChart3, Plus, RefreshCw,
  AlertTriangle, Lightbulb, CheckCircle, XCircle,
  MessageCircle, ThumbsUp, Calendar,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { mockClientesScoring } from '@/data/mockClientesScoring';
import type { Cliente, ScoreIA, TipoCliente, EstadoCliente } from '@/types/clientes';

// ─── Helpers ───
const getDisplayName = (c: Cliente) =>
  c.tipo === 'comprador_unidad' ? `${c.nombre} ${c.apellido}` : c.razonSocial || '';

const getInitials = (c: Cliente) =>
  c.tipo === 'comprador_unidad'
    ? `${c.nombre?.[0] || ''}${c.apellido?.[0] || ''}`
    : (c.razonSocial?.[0] || '');

const getSegmentoLabel = (seg?: ScoreIA['segmento']) => ({
  premium: '★ Premium', estandar: 'Estándar', riesgo: '⚠ Riesgo', sin_datos: 'Sin datos',
}[seg || 'sin_datos']);

const getSegmentoClass = (seg?: ScoreIA['segmento']) => ({
  premium: 'border-amber-300 text-amber-700 bg-amber-50',
  estandar: 'border-blue-300 text-blue-700 bg-blue-50',
  riesgo: 'border-red-300 text-red-700 bg-red-50',
  sin_datos: 'border-gray-300 text-gray-600 bg-gray-50',
}[seg || 'sin_datos']);

const estadoLabels: Record<EstadoCliente, string> = {
  activo: 'Activo', inactivo: 'Inactivo', prospecto: 'Prospecto', en_conflicto: 'En conflicto',
};

const calcularScoreLocal = (cliente: Cliente): number => {
  if (cliente.evaluaciones.length === 0 && cliente.pagos.length === 0) return 0;
  let score = 50;
  if (cliente.pagos.length > 0) {
    const pctPuntual = cliente.pagos.filter(p => p.pagadoEnFecha).length / cliente.pagos.length;
    const demora = cliente.pagos.reduce((a, p) => a + p.diasDemora, 0) / cliente.pagos.length;
    score += (pctPuntual * 20) - (demora * 0.5);
  }
  if (cliente.evaluaciones.length > 0) {
    const avg = cliente.evaluaciones.reduce((a, e) =>
      a + (e.puntualidadPagos + e.comunicacion + e.flexibilidad + e.cumplimientoAcuerdos) / 4, 0
    ) / cliente.evaluaciones.length;
    score += (avg - 3) * 7;
  }
  const reclamos = cliente.interacciones.filter(i => i.tipo === 'reclamo' && i.tono === 'negativo').length;
  const positivos = cliente.interacciones.filter(i => i.tono === 'positivo').length;
  score -= reclamos * 5;
  score += positivos * 3;
  if (cliente.unidadesCompradas > 1) score += 10;
  return Math.min(100, Math.max(0, Math.round(score)));
};

const getSegmento = (score: number, tieneDatos: boolean): ScoreIA['segmento'] => {
  if (!tieneDatos) return 'sin_datos';
  if (score >= 75) return 'premium';
  if (score >= 50) return 'estandar';
  return 'riesgo';
};

// ─── Main Component ───
export default function Clientes() {
  const { toast } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [dbLoaded, setDbLoaded] = useState(false);

  useEffect(() => {
    const loadClientes = async () => {
      try {
        const { data: dbClientes } = await supabase.from('clientes').select('*').order('nombre');
        const { data: dbPagos } = await supabase.from('pagos_clientes').select('*');
        const { data: dbInteracciones } = await supabase.from('interacciones_clientes').select('*');
        const { data: dbEvaluaciones } = await supabase.from('evaluaciones_clientes').select('*');
        
        if (dbClientes && dbClientes.length > 0) {
          const mapped: Cliente[] = dbClientes.map((c: any) => ({
            id: c.id,
            tipo: (c.tipo_cliente_app || (c.tipo === 'persona' ? 'comprador_unidad' : 'empresa_contratante')) as TipoCliente,
            nombre: c.nombre || '',
            apellido: c.apellido || '',
            dni: c.dni || c.documento || '',
            razonSocial: c.nombre || '',
            cuit: c.cuit || c.documento || '',
            rubro: c.rubro || '',
            email: c.email || '',
            telefono: c.telefono || '',
            ciudad: c.ciudad || c.direccion || '',
            provincia: c.provincia || '',
            estado: (c.estado_cliente || 'activo') as any,
            obrasRelacionadas: [],
            unidadesCompradas: c.unidades_compradas || 0,
            montoTotalOperado: Number(c.monto_total_operado) || 0,
            moneda: (c.moneda_operado || 'USD') as 'USD' | 'ARS',
            pagos: (dbPagos || []).filter((p: any) => p.cliente_id === c.id).map((p: any) => ({
              id: p.id, fecha: p.fecha, monto: Number(p.monto), moneda: p.moneda,
              concepto: p.concepto, pagadoEnFecha: p.pagado_en_fecha, diasDemora: p.dias_demora,
              obraNombre: p.obra_nombre,
            })),
            interacciones: (dbInteracciones || []).filter((i: any) => i.cliente_id === c.id).map((i: any) => ({
              id: i.id, fecha: i.fecha, tipo: i.tipo, descripcion: i.descripcion,
              resolucion: i.resolucion, autor: i.autor, obraNombre: i.obra_nombre, tono: i.tono,
            })),
            evaluaciones: (dbEvaluaciones || []).filter((e: any) => e.cliente_id === c.id).map((e: any) => ({
              id: e.id, fecha: e.fecha, obraNombre: e.obra_nombre, autor: e.autor,
              puntualidadPagos: e.puntualidad_pagos, comunicacion: e.comunicacion,
              flexibilidad: e.flexibilidad, cumplimientoAcuerdos: e.cumplimiento_acuerdos,
              recomendaria: e.recomendaria, comentario: e.comentario,
            })),
            scoreIA: c.score_ia ? c.score_ia as ScoreIA : undefined,
            notas: c.notas || '',
            creadoEn: c.created_at?.split('T')[0] || '',
          }));
          setClientes(mapped);
          setDbLoaded(true);
        } else {
          setClientes(mockClientesScoring);
          setDbLoaded(true);
        }
      } catch {
        setClientes(mockClientesScoring);
        setDbLoaded(true);
      }
    };
    loadClientes();
  }, []);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoCliente | 'todos'>('todos');
  const [filtroEstado, setFiltroEstado] = useState<EstadoCliente | 'todos'>('todos');
  const [filtroSegmento, setFiltroSegmento] = useState<ScoreIA['segmento'] | 'todos'>('todos');
  const [ordenar, setOrdenar] = useState<'score' | 'nombre' | 'monto' | 'reciente'>('score');
  const [clienteDetalle, setClienteDetalle] = useState<Cliente | null>(null);
  const [showFormNuevo, setShowFormNuevo] = useState(false);
  const [isLoadingScore, setIsLoadingScore] = useState<string | null>(null);
  const [showComparacion, setShowComparacion] = useState(false);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [comparacionIA, setComparacionIA] = useState<string | null>(null);
  const [isLoadingComparacion, setIsLoadingComparacion] = useState(false);

  // ─── Score IA ───
  const handleGenerarScoreIA = async (cliente: Cliente) => {
    setIsLoadingScore(cliente.id);
    try {
      const scoreLocal = calcularScoreLocal(cliente);
      const nombreDisplay = getDisplayName(cliente);

      const prompt = `Generá el score predictivo de este cliente:

PERFIL:
Nombre: ${nombreDisplay}
Tipo: ${cliente.tipo === 'comprador_unidad' ? 'Comprador de unidad' : 'Empresa contratante'}
Estado: ${cliente.estado}
Ciudad: ${cliente.ciudad}, ${cliente.provincia}
Unidades compradas: ${cliente.unidadesCompradas}
Monto total operado: ${cliente.moneda} ${cliente.montoTotalOperado.toLocaleString()}
Obras relacionadas: ${cliente.obrasRelacionadas.length}
Score calculado localmente: ${scoreLocal}/100

HISTORIAL DE PAGOS (${cliente.pagos.length} registros):
${cliente.pagos.map(p =>
  `- ${p.fecha}: ${p.moneda} ${p.monto.toLocaleString()} — ${p.concepto} — ${p.pagadoEnFecha ? 'Pagado en fecha' : `DEMORADO ${p.diasDemora} días`}`
).join('\n') || 'Sin pagos registrados'}

EVALUACIONES (${cliente.evaluaciones.length}):
${cliente.evaluaciones.map(e =>
  `- ${e.fecha} (${e.obraNombre || 'sin obra'}): Pagos ${e.puntualidadPagos}/5, Com ${e.comunicacion}/5, Flex ${e.flexibilidad}/5, Cumpl ${e.cumplimientoAcuerdos}/5. Recomendaría: ${e.recomendaria ? 'Sí' : 'No'}. "${e.comentario}"`
).join('\n') || 'Sin evaluaciones'}

INTERACCIONES (${cliente.interacciones.length}):
${cliente.interacciones.map(i =>
  `- ${i.fecha}: ${i.tipo} (${i.tono}) — "${i.descripcion}"${i.resolucion ? ` → ${i.resolucion}` : ''}`
).join('\n') || 'Sin interacciones'}

NOTAS: ${cliente.notas || 'Sin notas'}

Analizá todos los datos y generá el score predictivo completo.`;

      const { data, error } = await supabase.functions.invoke('ai-scoring-clientes', {
        body: { messages: [{ role: 'user', content: prompt }] },
      });

      if (error) throw error;
      const text = data?.texto || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in response');

      const scoreIA: ScoreIA = {
        ...JSON.parse(jsonMatch[0]),
        generadoEn: new Date().toISOString(),
      };

      setClientes(prev => prev.map(c => c.id === cliente.id ? { ...c, scoreIA } : c));
      if (clienteDetalle?.id === cliente.id) {
        setClienteDetalle(prev => prev ? { ...prev, scoreIA } : null);
      }
      toast({ title: 'Score generado correctamente' });
    } catch {
      toast({ title: 'Error', description: 'Error al generar el score. Intentá de nuevo.', variant: 'destructive' });
    } finally {
      setIsLoadingScore(null);
    }
  };

  const handleGenerarTodosLosScores = async () => {
    const sinScore = clientes.filter(c => !c.scoreIA);
    for (const cliente of sinScore) {
      await handleGenerarScoreIA(cliente);
      await new Promise(r => setTimeout(r, 1200));
    }
    toast({ title: `Scores generados para ${sinScore.length} clientes` });
  };

  const handleCompararIA = async () => {
    setIsLoadingComparacion(true);
    try {
      const selected = clientes.filter(c => seleccionados.includes(c.id));
      const prompt = `Compará estos clientes y recomendá con cuál trabajar primero:\n\n${selected.map(c => {
        const s = c.scoreIA;
        return `${getDisplayName(c)} (${c.tipo === 'comprador_unidad' ? 'Comprador' : 'Empresa'})
Score: ${s?.scoreGlobal ?? 'sin score'}, Segmento: ${s?.segmento ?? 'N/A'}
Prob pago: ${s?.probabilidadPagoTiempo ?? '-'}%, Riesgo: ${s?.riesgoConflicto ?? '-'}%, Recompra: ${s?.potencialRecompra ?? '-'}%
Monto operado: ${c.moneda} ${c.montoTotalOperado.toLocaleString()}
Pagos: ${c.pagos.length} (${c.pagos.filter(p => p.pagadoEnFecha).length} en fecha)`;
      }).join('\n\n')}`;

      const { data, error } = await supabase.functions.invoke('ai-scoring-clientes', {
        body: { messages: [{ role: 'user', content: prompt }], mode: 'comparar' },
      });
      if (error) throw error;
      setComparacionIA(data?.texto || 'Sin respuesta');
    } catch {
      toast({ title: 'Error', description: 'Error al comparar.', variant: 'destructive' });
    } finally {
      setIsLoadingComparacion(false);
    }
  };

  // ─── Filtrado y orden ───
  const clientesFiltrados = useMemo(() => {
    let result = clientes
      .filter(c => filtroTipo === 'todos' || c.tipo === filtroTipo)
      .filter(c => filtroEstado === 'todos' || c.estado === filtroEstado)
      .filter(c => {
        if (filtroSegmento === 'todos') return true;
        const seg = c.scoreIA?.segmento || getSegmento(calcularScoreLocal(c), c.pagos.length > 0 || c.evaluaciones.length > 0);
        return seg === filtroSegmento;
      })
      .filter(c => {
        if (!busqueda) return true;
        const q = busqueda.toLowerCase();
        return getDisplayName(c).toLowerCase().includes(q) || c.ciudad.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
      });

    result.sort((a, b) => {
      if (ordenar === 'score') return (b.scoreIA?.scoreGlobal ?? calcularScoreLocal(b)) - (a.scoreIA?.scoreGlobal ?? calcularScoreLocal(a));
      if (ordenar === 'nombre') return getDisplayName(a).localeCompare(getDisplayName(b));
      if (ordenar === 'monto') return b.montoTotalOperado - a.montoTotalOperado;
      return new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime();
    });
    return result;
  }, [clientes, filtroTipo, filtroEstado, filtroSegmento, busqueda, ordenar]);

  // ─── KPIs ───
  const kpis = useMemo(() => {
    const premium = clientes.filter(c => (c.scoreIA?.scoreGlobal ?? calcularScoreLocal(c)) >= 75).length;
    const riesgo = clientes.filter(c => {
      const s = c.scoreIA?.scoreGlobal ?? calcularScoreLocal(c);
      return s > 0 && s < 50;
    }).length;
    const montoTotal = clientes.reduce((a, c) => a + c.montoTotalOperado, 0);
    const conPagos = clientes.filter(c => c.pagos.length > 0);
    const tasaPuntual = conPagos.length > 0
      ? Math.round(conPagos.reduce((a, c) => a + (c.pagos.filter(p => p.pagadoEnFecha).length / c.pagos.length) * 100, 0) / conPagos.length)
      : 0;
    return { premium, riesgo, montoTotal, tasaPuntual };
  }, [clientes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Clientes
          </h1>
          <p className="text-sm text-muted-foreground">
            {clientesFiltrados.length} clientes · {clientes.filter(c => c.scoreIA).length} con score IA
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {seleccionados.length >= 2 && (
            <Button variant="outline" onClick={() => { setComparacionIA(null); setShowComparacion(true); }}>
              <BarChart3 className="h-4 w-4 mr-2" /> Comparar ({seleccionados.length})
            </Button>
          )}
          <Button variant="outline" onClick={handleGenerarTodosLosScores} disabled={!!isLoadingScore}>
            <Sparkles className="h-4 w-4 mr-2" /> Scorear todos
          </Button>
          <Button onClick={() => setShowFormNuevo(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nuevo cliente
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-xl"><CardContent className="pt-4 pb-3 px-4">
          <p className="text-xs text-muted-foreground">Clientes premium</p>
          <p className="text-2xl font-bold text-emerald-600">{kpis.premium}</p>
        </CardContent></Card>
        <Card className="rounded-xl"><CardContent className="pt-4 pb-3 px-4">
          <p className="text-xs text-muted-foreground">Clientes en riesgo</p>
          <p className="text-2xl font-bold text-red-600">{kpis.riesgo}</p>
        </CardContent></Card>
        <Card className="rounded-xl"><CardContent className="pt-4 pb-3 px-4">
          <p className="text-xs text-muted-foreground">Monto total operado</p>
          <p className="text-2xl font-bold">USD {(kpis.montoTotal / 1000).toFixed(0)}k</p>
        </CardContent></Card>
        <Card className="rounded-xl"><CardContent className="pt-4 pb-3 px-4">
          <p className="text-xs text-muted-foreground">Pago puntual promedio</p>
          <p className="text-2xl font-bold text-blue-600">{kpis.tasaPuntual}%</p>
        </CardContent></Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Buscar cliente..." className="rounded-xl sm:max-w-xs" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        <div className="flex gap-2 flex-wrap">
          {(['todos', 'comprador_unidad', 'empresa_contratante'] as const).map(t => (
            <button key={t} onClick={() => setFiltroTipo(t)} className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              filtroTipo === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
            )}>
              {t === 'todos' ? 'Todos' : t === 'comprador_unidad' ? 'Compradores' : 'Empresas'}
            </button>
          ))}
        </div>
        <Select value={filtroEstado} onValueChange={v => setFiltroEstado(v as EstadoCliente | 'todos')}>
          <SelectTrigger className="w-[140px] rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Estado: Todos</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="prospecto">Prospecto</SelectItem>
            <SelectItem value="en_conflicto">En conflicto</SelectItem>
            <SelectItem value="inactivo">Inactivo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroSegmento} onValueChange={v => setFiltroSegmento(v as ScoreIA['segmento'] | 'todos')}>
          <SelectTrigger className="w-[150px] rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Segmento: Todos</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="estandar">Estándar</SelectItem>
            <SelectItem value="riesgo">Riesgo</SelectItem>
            <SelectItem value="sin_datos">Sin datos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ordenar} onValueChange={v => setOrdenar(v as 'score' | 'nombre' | 'monto' | 'reciente')}>
          <SelectTrigger className="w-[150px] rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="score">Mayor score</SelectItem>
            <SelectItem value="nombre">Nombre</SelectItem>
            <SelectItem value="monto">Mayor monto</SelectItem>
            <SelectItem value="reciente">Más reciente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clientesFiltrados.map(cliente => {
          const score = cliente.scoreIA?.scoreGlobal ?? calcularScoreLocal(cliente);
          const seg = cliente.scoreIA?.segmento || getSegmento(score, cliente.pagos.length > 0 || cliente.evaluaciones.length > 0);
          return (
            <Card key={cliente.id} className={cn(
              'cursor-pointer transition-all hover:shadow-md rounded-xl',
              cliente.estado === 'en_conflicto' && 'border-red-300',
              seg === 'premium' && 'border-amber-300',
            )} onClick={() => setClienteDetalle(cliente)}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0',
                    cliente.tipo === 'comprador_unidad' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  )}>
                    {getInitials(cliente)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm truncate">{getDisplayName(cliente)}</h3>
                      {seg === 'premium' && <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{cliente.ciudad} · {cliente.tipo === 'comprador_unidad' ? 'Comprador' : 'Empresa'}</p>
                  </div>
                  <Checkbox
                    checked={seleccionados.includes(cliente.id)}
                    onCheckedChange={checked => setSeleccionados(prev => checked ? [...prev, cliente.id] : prev.filter(id => id !== cliente.id))}
                    onClick={e => e.stopPropagation()}
                    className="mt-1"
                  />
                </div>

                {isLoadingScore === cliente.id ? (
                  <div className="mb-3 space-y-2"><Skeleton className="h-2 w-full rounded-full" /><Skeleton className="h-4 w-24" /></div>
                ) : score > 0 ? (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{cliente.scoreIA ? 'Score IA' : 'Score estimado'}</span>
                      <span className={cn('text-sm font-bold', score >= 75 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-600')}>{score}/100</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all', score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${score}%` }} />
                    </div>
                    {cliente.scoreIA && (
                      <div className="grid grid-cols-3 gap-1 mt-2">
                        <div className="text-center"><p className="text-[10px] text-muted-foreground">Pago puntual</p><p className="text-xs font-medium text-emerald-600">{cliente.scoreIA.probabilidadPagoTiempo}%</p></div>
                        <div className="text-center"><p className="text-[10px] text-muted-foreground">Riesgo</p><p className={cn('text-xs font-medium', cliente.scoreIA.riesgoConflicto > 50 ? 'text-red-600' : 'text-emerald-600')}>{cliente.scoreIA.riesgoConflicto}%</p></div>
                        <div className="text-center"><p className="text-[10px] text-muted-foreground">Recompra</p><p className="text-xs font-medium text-blue-600">{cliente.scoreIA.potencialRecompra}%</p></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-3 p-2 bg-muted/50 rounded-lg text-center"><p className="text-xs text-muted-foreground">Sin score generado</p></div>
                )}

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={cn('text-xs', getSegmentoClass(seg))}>{getSegmentoLabel(seg)}</Badge>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" disabled={isLoadingScore === cliente.id}
                    onClick={e => { e.stopPropagation(); handleGenerarScoreIA(cliente); }}>
                    <Sparkles className="h-3 w-3 mr-1" /> {isLoadingScore === cliente.id ? 'Calculando...' : 'Scorear'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sheet detalle */}
      <Sheet open={!!clienteDetalle} onOpenChange={open => !open && setClienteDetalle(null)}>
        <SheetContent className="w-full sm:max-w-[520px] flex flex-col overflow-hidden p-0">
          {clienteDetalle && (
            <ClienteDetalleSheet
              cliente={clienteDetalle}
              isLoadingScore={isLoadingScore === clienteDetalle.id}
              onGenerarScore={() => handleGenerarScoreIA(clienteDetalle)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Dialog comparación */}
      <Dialog open={showComparacion} onOpenChange={setShowComparacion}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comparación de clientes</DialogTitle>
            <DialogDescription>Comparando {seleccionados.length} clientes seleccionados</DialogDescription>
          </DialogHeader>
          <ComparacionTable clientes={clientes.filter(c => seleccionados.includes(c.id))} />
          <div className="mt-4 space-y-3">
            <Button onClick={handleCompararIA} disabled={isLoadingComparacion} className="w-full">
              <Sparkles className="h-4 w-4 mr-2" />
              {isLoadingComparacion ? 'Analizando...' : 'Que la IA recomiende con cuál trabajar primero'}
            </Button>
            {comparacionIA && (
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-sm whitespace-pre-wrap">{comparacionIA}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog nuevo cliente */}
      <NuevoClienteDialog
        open={showFormNuevo}
        onOpenChange={setShowFormNuevo}
        onCrear={c => { setClientes(prev => [c, ...prev]); setShowFormNuevo(false); toast({ title: 'Cliente creado' }); }}
      />
    </div>
  );
}

// ─── Detalle Sheet ───
function ClienteDetalleSheet({ cliente, isLoadingScore, onGenerarScore }: {
  cliente: Cliente; isLoadingScore: boolean; onGenerarScore: () => void;
}) {
  const score = cliente.scoreIA;

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="p-6 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium',
            cliente.tipo === 'comprador_unidad' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
          )}>
            {getInitials(cliente)}
          </div>
          <div>
            <SheetTitle className="text-lg">{getDisplayName(cliente)}</SheetTitle>
            <SheetDescription>
              {cliente.tipo === 'comprador_unidad' ? 'Comprador de unidad' : 'Empresa contratante'} · {estadoLabels[cliente.estado]}
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <Tabs defaultValue="resumen" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-6 shrink-0">
          <TabsTrigger value="resumen" className="text-xs">Resumen</TabsTrigger>
          <TabsTrigger value="pagos" className="text-xs">Pagos</TabsTrigger>
          <TabsTrigger value="interacciones" className="text-xs">Interacc.</TabsTrigger>
          <TabsTrigger value="evaluaciones" className="text-xs">Eval.</TabsTrigger>
          <TabsTrigger value="score" className="text-xs">Score IA</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 px-6 py-4">
          {/* Resumen */}
          <TabsContent value="resumen" className="mt-0 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-muted-foreground text-xs">Email</p><p>{cliente.email}</p></div>
              <div><p className="text-muted-foreground text-xs">Teléfono</p><p>{cliente.telefono}</p></div>
              <div><p className="text-muted-foreground text-xs">Ciudad</p><p>{cliente.ciudad}, {cliente.provincia}</p></div>
              <div><p className="text-muted-foreground text-xs">Monto operado</p><p className="font-medium">{cliente.moneda} {cliente.montoTotalOperado.toLocaleString()}</p></div>
              {cliente.tipo === 'comprador_unidad' && <div><p className="text-muted-foreground text-xs">DNI</p><p>{cliente.dni}</p></div>}
              {cliente.tipo === 'empresa_contratante' && <>
                <div><p className="text-muted-foreground text-xs">CUIT</p><p>{cliente.cuit}</p></div>
                <div><p className="text-muted-foreground text-xs">Rubro</p><p>{cliente.rubro}</p></div>
              </>}
              <div><p className="text-muted-foreground text-xs">Unidades</p><p>{cliente.unidadesCompradas}</p></div>
              <div><p className="text-muted-foreground text-xs">Obras</p><p>{cliente.obrasRelacionadas.length}</p></div>
            </div>
            {cliente.notas && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Notas</p>
                <p className="text-sm">{cliente.notas}</p>
              </div>
            )}
            {score ? (
              <div className="p-4 bg-muted/30 rounded-xl text-center">
                <p className={cn('text-3xl font-bold', score.scoreGlobal >= 75 ? 'text-emerald-600' : score.scoreGlobal >= 50 ? 'text-amber-600' : 'text-red-600')}>
                  {score.scoreGlobal}/100
                </p>
                <p className="text-xs text-muted-foreground mt-1">Score IA · {getSegmentoLabel(score.segmento)}</p>
              </div>
            ) : (
              <Button onClick={onGenerarScore} disabled={isLoadingScore} className="w-full">
                <Sparkles className="h-4 w-4 mr-2" /> Generar score predictivo
              </Button>
            )}
          </TabsContent>

          {/* Pagos */}
          <TabsContent value="pagos" className="mt-0 space-y-3">
            {cliente.pagos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sin pagos registrados</p>
            ) : cliente.pagos.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{p.concepto}</p>
                  <p className="text-xs text-muted-foreground">{p.fecha}{p.obraNombre ? ` · ${p.obraNombre}` : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{p.moneda} {p.monto.toLocaleString()}</p>
                  <Badge variant="outline" className={cn('text-[10px]', p.pagadoEnFecha ? 'text-emerald-600 border-emerald-300' : 'text-red-600 border-red-300')}>
                    {p.pagadoEnFecha ? 'En fecha' : `Demorado ${p.diasDemora}d`}
                  </Badge>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Interacciones */}
          <TabsContent value="interacciones" className="mt-0 space-y-3">
            {cliente.interacciones.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sin interacciones</p>
            ) : cliente.interacciones.map(i => {
              const iconMap: Record<string, typeof MessageCircle> = { consulta: MessageCircle, reclamo: AlertTriangle, felicitacion: ThumbsUp, reunion: Calendar, otro: MessageCircle };
              const colorMap: Record<string, string> = { consulta: 'text-blue-500', reclamo: 'text-red-500', felicitacion: 'text-emerald-500', reunion: 'text-purple-500', otro: 'text-gray-500' };
              const Icon = iconMap[i.tipo] || MessageCircle;
              return (
                <div key={i.id} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', colorMap[i.tipo] || '')} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium capitalize">{i.tipo}</p>
                        <Badge variant="outline" className={cn('text-[10px]',
                          i.tono === 'positivo' ? 'text-emerald-600' : i.tono === 'negativo' ? 'text-red-600' : 'text-gray-600'
                        )}>{i.tono}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{i.descripcion}</p>
                      {i.resolucion && <p className="text-xs text-emerald-600 mt-1">→ {i.resolucion}</p>}
                      <p className="text-[10px] text-muted-foreground mt-1">{i.fecha} · {i.autor}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* Evaluaciones */}
          <TabsContent value="evaluaciones" className="mt-0 space-y-3">
            {cliente.evaluaciones.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sin evaluaciones</p>
            ) : cliente.evaluaciones.map(e => (
              <div key={e.id} className="p-3 bg-muted/30 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">{e.obraNombre || 'General'}</p>
                  <p className="text-xs text-muted-foreground">{e.fecha}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {(['puntualidadPagos', 'comunicacion', 'flexibilidad', 'cumplimientoAcuerdos'] as const).map(k => (
                    <div key={k} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-medium">{e[k]}/5</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {e.recomendaria ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                  <span>{e.recomendaria ? 'Recomendaría' : 'No recomendaría'}</span>
                </div>
                <p className="text-xs text-muted-foreground italic">"{e.comentario}"</p>
              </div>
            ))}
          </TabsContent>

          {/* Score IA */}
          <TabsContent value="score" className="mt-0">
            {score ? (
              <div className="space-y-4">
                <div className="text-center p-6 bg-muted/30 rounded-xl">
                  <div className={cn('text-5xl font-bold mb-1', score.scoreGlobal >= 75 ? 'text-emerald-600' : score.scoreGlobal >= 50 ? 'text-amber-600' : 'text-red-600')}>
                    {score.scoreGlobal}
                  </div>
                  <p className="text-sm text-muted-foreground">Score global / 100</p>
                  <Badge className={cn('mt-2', getSegmentoClass(score.segmento))}>{getSegmentoLabel(score.segmento)}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-2xl font-bold text-emerald-700">{score.probabilidadPagoTiempo}%</p>
                    <p className="text-xs text-emerald-600 mt-1">Prob. pago en fecha</p>
                  </div>
                  <div className={cn('text-center p-3 rounded-lg border', score.riesgoConflicto > 50 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200')}>
                    <p className={cn('text-2xl font-bold', score.riesgoConflicto > 50 ? 'text-red-700' : 'text-green-700')}>{score.riesgoConflicto}%</p>
                    <p className={cn('text-xs mt-1', score.riesgoConflicto > 50 ? 'text-red-600' : 'text-green-600')}>Riesgo de conflicto</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-2xl font-bold text-blue-700">{score.potencialRecompra}%</p>
                    <p className="text-xs text-blue-600 mt-1">Potencial recompra</p>
                  </div>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Análisis IA</p>
                  <p className="text-sm leading-relaxed">{score.resumen}</p>
                </div>

                {score.alertas.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Alertas</p>
                    {score.alertas.map((a, i) => (
                      <div key={i} className="flex gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{a}</p>
                      </div>
                    ))}
                  </div>
                )}

                {score.recomendaciones.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recomendaciones</p>
                    {score.recomendaciones.map((r, i) => (
                      <div key={i} className="flex gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <Lightbulb className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-700">{r}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Generado: {new Date(score.generadoEn).toLocaleDateString('es-AR')}</p>
                  <Button variant="outline" size="sm" onClick={onGenerarScore} disabled={isLoadingScore}>
                    <RefreshCw className="h-3.5 w-3.5 mr-1" /> Regenerar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium mb-1">Sin score generado</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
                  La IA analiza el historial de pagos, evaluaciones e interacciones para predecir el comportamiento futuro.
                </p>
                <Button onClick={onGenerarScore} disabled={isLoadingScore}>
                  <Sparkles className="h-4 w-4 mr-2" /> Generar score predictivo
                </Button>
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

// ─── Comparación ───
function ComparacionTable({ clientes }: { clientes: Cliente[] }) {
  const rows = [
    { label: 'Score global', fn: (c: Cliente) => c.scoreIA ? `${c.scoreIA.scoreGlobal}/100` : '-', best: 'max' as const },
    { label: 'Segmento', fn: (c: Cliente) => getSegmentoLabel(c.scoreIA?.segmento) },
    { label: 'Prob. pago en fecha', fn: (c: Cliente) => c.scoreIA ? `${c.scoreIA.probabilidadPagoTiempo}%` : '-', best: 'max' as const },
    { label: 'Riesgo conflicto', fn: (c: Cliente) => c.scoreIA ? `${c.scoreIA.riesgoConflicto}%` : '-', best: 'min' as const },
    { label: 'Potencial recompra', fn: (c: Cliente) => c.scoreIA ? `${c.scoreIA.potencialRecompra}%` : '-', best: 'max' as const },
    { label: 'Pagos registrados', fn: (c: Cliente) => `${c.pagos.length}` },
    { label: 'Pagos en fecha', fn: (c: Cliente) => `${c.pagos.filter(p => p.pagadoEnFecha).length}/${c.pagos.length}`, best: 'max' as const },
    { label: 'Demora promedio', fn: (c: Cliente) => c.pagos.length > 0 ? `${Math.round(c.pagos.reduce((a, p) => a + p.diasDemora, 0) / c.pagos.length)} días` : '-', best: 'min' as const },
    { label: 'Monto operado', fn: (c: Cliente) => `${c.moneda} ${c.montoTotalOperado.toLocaleString()}`, best: 'max' as const },
  ];

  const getNum = (val: string) => parseFloat(val.replace(/[^0-9.-]/g, '')) || 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2 text-muted-foreground font-medium">Dimensión</th>
            {clientes.map(c => <th key={c.id} className="text-center p-2 font-medium">{getDisplayName(c)}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const vals = clientes.map(c => row.fn(c));
            let bestIdx = -1;
            if (row.best && clientes.length > 1) {
              const nums = vals.map(getNum);
              bestIdx = row.best === 'max' ? nums.indexOf(Math.max(...nums)) : nums.indexOf(Math.min(...nums));
            }
            return (
              <tr key={ri} className="border-b">
                <td className="p-2 text-muted-foreground">{row.label}</td>
                {vals.map((v, i) => (
                  <td key={i} className={cn('p-2 text-center', i === bestIdx && 'bg-emerald-50 font-medium text-emerald-700')}>{v}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Nuevo cliente ───
function NuevoClienteDialog({ open, onOpenChange, onCrear }: {
  open: boolean; onOpenChange: (v: boolean) => void; onCrear: (c: Cliente) => void;
}) {
  const [tipo, setTipo] = useState<TipoCliente>('comprador_unidad');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [cuit, setCuit] = useState('');
  const [rubro, setRubro] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [provincia, setProvincia] = useState('');
  const [notas, setNotas] = useState('');

  const handleCrear = () => {
    const c: Cliente = {
      id: crypto.randomUUID(),
      tipo,
      ...(tipo === 'comprador_unidad' ? { nombre, apellido, dni } : { razonSocial, cuit, rubro }),
      email, telefono, ciudad, provincia,
      estado: 'prospecto',
      obrasRelacionadas: [],
      unidadesCompradas: 0,
      montoTotalOperado: 0,
      moneda: 'USD',
      pagos: [], interacciones: [], evaluaciones: [],
      notas,
      creadoEn: new Date().toISOString().split('T')[0],
    };
    onCrear(c);
    setNombre(''); setApellido(''); setDni(''); setRazonSocial(''); setCuit(''); setRubro('');
    setEmail(''); setTelefono(''); setCiudad(''); setProvincia(''); setNotas('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo cliente</DialogTitle>
          <DialogDescription>Registrá un nuevo cliente en el sistema</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Label className="text-sm">Tipo:</Label>
            <div className="flex gap-2">
              {(['comprador_unidad', 'empresa_contratante'] as const).map(t => (
                <button key={t} onClick={() => setTipo(t)} className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  tipo === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 text-muted-foreground border-transparent'
                )}>
                  {t === 'comprador_unidad' ? 'Comprador' : 'Empresa'}
                </button>
              ))}
            </div>
          </div>
          {tipo === 'comprador_unidad' ? (<>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Nombre</Label><Input value={nombre} onChange={e => setNombre(e.target.value)} /></div>
              <div><Label className="text-xs">Apellido</Label><Input value={apellido} onChange={e => setApellido(e.target.value)} /></div>
            </div>
            <div><Label className="text-xs">DNI</Label><Input value={dni} onChange={e => setDni(e.target.value)} /></div>
          </>) : (<>
            <div><Label className="text-xs">Razón social</Label><Input value={razonSocial} onChange={e => setRazonSocial(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">CUIT</Label><Input value={cuit} onChange={e => setCuit(e.target.value)} /></div>
              <div><Label className="text-xs">Rubro</Label><Input value={rubro} onChange={e => setRubro(e.target.value)} /></div>
            </div>
          </>)}
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><Label className="text-xs">Teléfono</Label><Input value={telefono} onChange={e => setTelefono(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Ciudad</Label><Input value={ciudad} onChange={e => setCiudad(e.target.value)} /></div>
            <div><Label className="text-xs">Provincia</Label><Input value={provincia} onChange={e => setProvincia(e.target.value)} /></div>
          </div>
          <div><Label className="text-xs">Notas</Label><Textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2} /></div>
          <Button onClick={handleCrear} className="w-full"><Plus className="h-4 w-4 mr-2" /> Crear cliente</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

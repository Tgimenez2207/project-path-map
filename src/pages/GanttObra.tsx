import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft, Plus, Download, Sparkles, Trash2,
  ChevronRight, ChevronDown, GanttChart, ZoomIn, ZoomOut,
  CalendarDays,
} from 'lucide-react';
import { useObra } from '@/hooks/useSupabaseData';
import { mockGantt, TODAY_OFFSET, TOTAL_DAYS } from '@/data/mockGantt';
import { NodoGantt, TipoNodo, EstadoNodo } from '@/types/gantt';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import { useIsMobile } from '@/hooks/use-mobile';

const zooms = [
  { label: 'Meses', dayPx: 1.5 },
  { label: 'Semanas', dayPx: 3 },
  { label: 'Días', dayPx: 8 },
];

const getBarColor = (nodo: NodoGantt) => {
  if (nodo.estado === 'completada') return 'hsl(142 72% 29%)';
  if (nodo.critica) return 'hsl(0 84% 60%)';
  if (nodo.tipo === 'etapa') return 'hsl(var(--primary, 24 95% 53%))';
  if (nodo.tipo === 'subetapa') return 'hsl(210 60% 45%)';
  return 'hsl(var(--warning, 38 92% 50%))';
};

const estadoLabels: Record<EstadoNodo, string> = {
  pendiente: 'Pendiente',
  en_curso: 'En curso',
  completada: 'Completada',
  bloqueada: 'Bloqueada',
};

export default function GanttObra() {
  const { obraId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { data: obra, isLoading } = useObra(obraId);

  const [nodos, setNodos] = useState<NodoGantt[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!obraId) { setNodos(mockGantt); return; }
      try {
        const { data } = await supabase.from('nodos_gantt').select('*').eq('obra_id', obraId).order('orden');
        if (data && data.length > 0) {
          const mapped: NodoGantt[] = data.map((n: any) => ({
            id: n.id, obraId: n.obra_id, tipo: n.tipo as TipoNodo,
            nombre: n.nombre, inicioOffset: n.inicio, duracion: n.duracion,
            avance: n.avance, responsable: n.responsable || '',
            estado: n.estado as EstadoNodo, critica: n.critica || false,
            parentId: n.parent_id, depDe: (n.dependencias || [])[0],
            children: data.filter((c: any) => c.parent_id === n.id).map((c: any) => c.id),
          }));
          setNodos(mapped);
        } else {
          setNodos(mockGantt);
        }
      } catch {
        setNodos(mockGantt);
      }
    };
    load();
  }, [obraId]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [zoomIdx, setZoomIdx] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFormNodo, setShowFormNodo] = useState(false);
  const [editingNodo, setEditingNodo] = useState<NodoGantt | null>(null);
  const [isLoadingIA, setIsLoadingIA] = useState(false);
  const [analisisIA, setAnalisisIA] = useState<string | null>(null);

  // New nodo form state
  const [formNombre, setFormNombre] = useState('');
  const [formTipo, setFormTipo] = useState<TipoNodo>('tarea');
  const [formParent, setFormParent] = useState('');
  const [formInicio, setFormInicio] = useState(0);
  const [formDuracion, setFormDuracion] = useState(10);
  const [formResponsable, setFormResponsable] = useState('');
  const [formDepDe, setFormDepDe] = useState('');
  const [formCritica, setFormCritica] = useState(false);
  const [formNotas, setFormNotas] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const dayPx = zooms[zoomIdx].dayPx;

  const selectedNodo = useMemo(() => nodos.find(n => n.id === selectedId) || null, [nodos, selectedId]);

  // Scroll to today on mount
  useEffect(() => {
    if (scrollRef.current) {
      const todayPx = TODAY_OFFSET * dayPx;
      scrollRef.current.scrollLeft = Math.max(0, todayPx - 200);
    }
  }, [dayPx]);

  const toggleCollapse = (id: string) => {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getVisibleRows = (): NodoGantt[] => {
    const rows: NodoGantt[] = [];
    const etapas = nodos.filter(n => n.tipo === 'etapa' && !n.parentId);
    etapas.forEach(etapa => {
      rows.push(etapa);
      if (!collapsed[etapa.id]) {
        const children = nodos.filter(n => n.parentId === etapa.id);
        const subetapas = children.filter(n => n.tipo === 'subetapa');
        const tareasDirectas = children.filter(n => n.tipo === 'tarea');
        subetapas.forEach(sub => {
          rows.push(sub);
          if (!collapsed[sub.id]) {
            const subTareas = nodos.filter(n => n.parentId === sub.id);
            subTareas.forEach(t => rows.push(t));
          }
        });
        tareasDirectas.forEach(t => {
          if (!rows.find(r => r.id === t.id)) rows.push(t);
        });
      }
    });
    return rows;
  };

  const visibleRows = getVisibleRows();

  const updateNodo = (id: string, changes: Partial<NodoGantt>) => {
    setNodos(prev => prev.map(n => n.id === id ? { ...n, ...changes } : n));
    toast.success('Cronograma actualizado');
  };

  const eliminarNodo = (id: string) => {
    setNodos(prev => prev
      .filter(n => n.id !== id)
      .map(n => ({
        ...n,
        children: n.children?.filter(c => c !== id),
        depDe: n.depDe === id ? undefined : n.depDe,
      }))
    );
    setSelectedId(null);
    toast.success('Nodo eliminado');
  };

  const handleCreateNodo = () => {
    if (!formNombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    const newId = crypto.randomUUID();
    const newNodo: NodoGantt = {
      id: newId,
      obraId: obraId || 'demo',
      tipo: formTipo,
      nombre: formNombre,
      inicioOffset: formInicio,
      duracion: formDuracion,
      avance: 0,
      responsable: formResponsable,
      estado: 'pendiente',
      critica: formCritica,
      parentId: formParent || undefined,
      depDe: formDepDe || undefined,
      notas: formNotas || undefined,
    };
    setNodos(prev => {
      const updated = [...prev, newNodo];
      if (formParent) {
        return updated.map(n =>
          n.id === formParent
            ? { ...n, children: [...(n.children || []), newId] }
            : n
        );
      }
      return updated;
    });
    setShowFormNodo(false);
    resetForm();
    toast.success('Tarea agregada al cronograma');
  };

  const resetForm = () => {
    setFormNombre(''); setFormTipo('tarea'); setFormParent('');
    setFormInicio(0); setFormDuracion(10); setFormResponsable('');
    setFormDepDe(''); setFormCritica(false); setFormNotas('');
    setEditingNodo(null);
  };

  // Generate month cells for header
  const generarCeldasMes = () => {
    const meses: { label: string; width: number }[] = [];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const daysPerMonth = 30;
    for (let i = 0; i < Math.ceil(TOTAL_DAYS / daysPerMonth); i++) {
      const monthIdx = i % 12;
      const days = Math.min(daysPerMonth, TOTAL_DAYS - i * daysPerMonth);
      meses.push({ label: monthNames[monthIdx], width: days * dayPx });
    }
    return meses;
  };

  const scrollToToday = () => {
    if (scrollRef.current) {
      const todayPx = TODAY_OFFSET * dayPx;
      scrollRef.current.scrollTo({ left: Math.max(0, todayPx - 200), behavior: 'smooth' });
    }
  };

  const handleAnalisisIA = async () => {
    setIsLoadingIA(true);
    setAnalisisIA(null);
    try {
      const criticas = nodos.filter(n => n.critica);
      const atrasadas = nodos.filter(
        n => n.inicioOffset + n.duracion < TODAY_OFFSET && n.avance < 100
      );
      const avanceGeneral = Math.round(nodos.reduce((a, n) => a + n.avance, 0) / nodos.length);

      const cronogramaTexto = nodos.map(n =>
        `${n.tipo.toUpperCase()} "${n.nombre}": días ${n.inicioOffset}-${n.inicioOffset + n.duracion}, avance ${n.avance}%, resp: ${n.responsable}${n.critica ? ' [CRÍTICA]' : ''}${n.depDe ? `, depende de: ${nodos.find(x => x.id === n.depDe)?.nombre}` : ''}`
      ).join('\n');

      const message = `Analizá este cronograma de obra y detectá riesgos:

Día actual: ${TODAY_OFFSET} de ${TOTAL_DAYS} totales
Avance general: ${avanceGeneral}%

ETAPAS Y TAREAS:
${cronogramaTexto}

TAREAS CRÍTICAS: ${criticas.length}
TAREAS ATRASADAS: ${atrasadas.map(n => n.nombre).join(', ') || 'ninguna'}

Dame: 1) Evaluación del estado actual del cronograma, 2) Tareas en riesgo de generar atraso en cascada, 3) Fecha estimada de finalización real vs planificada, 4) Las 3 acciones más urgentes para proteger la fecha de entrega.`;

      const response = await supabase.functions.invoke('ai-copilot', {
        body: { messages: [{ role: 'user', content: message }] },
      });

      if (response.error) throw response.error;

      // Handle streaming response
      const reader = response.data?.getReader?.();
      if (reader) {
        const decoder = new TextDecoder();
        let text = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                text += content;
                setAnalisisIA(text);
              } catch { /* skip */ }
            }
          }
        }
      } else {
        // Fallback for non-streaming
        const text = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        setAnalisisIA(text);
      }
    } catch {
      toast.error('Error al analizar el cronograma. Intentá de nuevo.');
    } finally {
      setIsLoadingIA(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // Mobile view
  if (isMobile) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/obras/${obraId}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Cronograma</h1>
            <p className="text-sm text-muted-foreground">{obra?.nombre}</p>
          </div>
        </div>

        {nodos.filter(n => n.tipo === 'etapa').map(etapa => (
          <Card key={etapa.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{etapa.nombre}</CardTitle>
                <Badge variant={etapa.estado === 'completada' ? 'default' : 'secondary'}>{etapa.avance}%</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-muted rounded-full h-2 mb-3">
                <div className="h-2 rounded-full transition-all" style={{ width: `${etapa.avance}%`, backgroundColor: getBarColor(etapa) }} />
              </div>
              <div className="space-y-2">
                {nodos.filter(n => n.parentId === etapa.id).map(child => (
                  <div key={child.id} className="flex items-center justify-between text-sm">
                    <span className={child.tipo === 'tarea' ? 'pl-3' : ''}>{child.nombre}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${child.avance}%`, backgroundColor: getBarColor(child) }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">{child.avance}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/obras/${obraId}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <GanttChart className="h-5 w-5 text-primary" /> Cronograma
            </h1>
            <p className="text-sm text-muted-foreground">{obra?.nombre}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleAnalisisIA} disabled={isLoadingIA}>
            <Sparkles className="h-4 w-4 mr-1" />
            {isLoadingIA ? 'Analizando...' : 'Análisis IA'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-1" /> Exportar
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setShowFormNodo(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Nueva tarea
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setZoomIdx(Math.max(0, zoomIdx - 1))} disabled={zoomIdx === 0}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Badge variant="secondary">{zooms[zoomIdx].label}</Badge>
          <Button variant="outline" size="sm" onClick={() => setZoomIdx(Math.min(2, zoomIdx + 1))} disabled={zoomIdx === 2}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={scrollToToday}>
            <CalendarDays className="h-4 w-4 mr-1" /> Hoy
          </Button>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--primary))' }} /> Etapa</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(210 60% 45%)' }} /> Subetapa</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--warning, 38 92% 50%))' }} /> Tarea</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--destructive))' }} /> Ruta crítica</span>
        </div>
      </div>

      {/* Gantt Chart */}
      <Card className="overflow-hidden">
        <div className="relative">
          {/* Header row */}
          <div className="flex border-b bg-muted/50" style={{ height: ROW_H }}>
            <div className="shrink-0 flex items-center px-3 font-medium text-sm border-r bg-background" style={{ width: LEFT_COL, position: 'sticky', left: 0, zIndex: 20 }}>
              Etapa / Tarea
            </div>
            <div ref={scrollRef} className="overflow-x-auto flex-1" style={{ position: 'relative' }}>
              <div className="flex" style={{ width: TOTAL_DAYS * dayPx }}>
                {generarCeldasMes().map((mes, i) => (
                  <div key={i} className="border-r text-xs text-muted-foreground flex items-center justify-center shrink-0" style={{ width: mes.width }}>
                    {mes.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rows */}
          <div className="relative">
            {visibleRows.map((nodo) => {
              const hasChildren = nodos.some(n => n.parentId === nodo.id);
              const indent = nodo.tipo === 'etapa' ? 12 : nodo.tipo === 'subetapa' ? 28 : 44;
              const isCollapsed = collapsed[nodo.id];

              return (
                <div
                  key={nodo.id}
                  className={`flex border-b hover:bg-muted/30 cursor-pointer transition-colors ${selectedId === nodo.id ? 'bg-primary/5' : ''}`}
                  style={{ height: ROW_H }}
                  onClick={() => setSelectedId(selectedId === nodo.id ? null : nodo.id)}
                >
                  {/* Left fixed column */}
                  <div
                    className="shrink-0 flex items-center gap-1 border-r bg-background text-sm overflow-hidden"
                    style={{ width: LEFT_COL, paddingLeft: indent, position: 'sticky', left: 0, zIndex: 10 }}
                  >
                    {hasChildren ? (
                      <button
                        className="p-0.5 hover:bg-muted rounded"
                        onClick={(e) => { e.stopPropagation(); toggleCollapse(nodo.id); }}
                      >
                        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    ) : <span className="w-4" />}
                    <span className={`truncate ${nodo.tipo === 'etapa' ? 'font-semibold' : nodo.tipo === 'subetapa' ? 'font-medium' : ''}`}>
                      {nodo.nombre}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground mr-1">{nodo.avance}%</span>
                    {nodo.responsable && (
                      <span
                        className="w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center text-white shrink-0 mr-2"
                        style={{ backgroundColor: nodo.responsableColor || 'hsl(var(--primary))' }}
                      >
                        {nodo.responsable}
                      </span>
                    )}
                  </div>

                  {/* Right scrollable area - synced with header */}
                  <div className="flex-1 relative overflow-hidden">
                    <div style={{ width: TOTAL_DAYS * dayPx, position: 'relative', height: '100%' }}>
                      {/* Today line */}
                      <div
                        className="absolute top-0 bottom-0 w-px bg-destructive/60"
                        style={{ left: TODAY_OFFSET * dayPx, zIndex: 5 }}
                      />
                      {/* Bar */}
                      <div
                        className="absolute top-[10px] rounded-sm shadow-sm"
                        style={{
                          left: nodo.inicioOffset * dayPx,
                          width: Math.max(nodo.duracion * dayPx, 4),
                          height: ROW_H - 20,
                          backgroundColor: getBarColor(nodo),
                        }}
                      >
                        {/* Avance overlay */}
                        <div
                          className="h-full rounded-sm"
                          style={{
                            width: `${nodo.avance}%`,
                            backgroundColor: 'rgba(255,255,255,0.3)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* IA Analysis */}
      {(analisisIA || isLoadingIA) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Análisis de cronograma — IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingIA && !analisisIA ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : (
              <div className="prose prose-sm max-w-none text-sm">
                <ReactMarkdown>{analisisIA || ''}</ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detail Sheet */}
      <Sheet open={!!selectedNodo} onOpenChange={() => setSelectedId(null)}>
        <SheetContent className="overflow-y-auto">
          {selectedNodo && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedNodo.nombre}</SheetTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedNodo.tipo} · {selectedNodo.critica ? '🔴 Ruta crítica' : ''}
                </p>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Inicio (día)</Label>
                    <Input type="number" value={selectedNodo.inicioOffset} onChange={e => updateNodo(selectedNodo.id, { inicioOffset: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <Label>Duración (días)</Label>
                    <Input type="number" value={selectedNodo.duracion} onChange={e => updateNodo(selectedNodo.id, { duracion: parseInt(e.target.value) || 1 })} />
                  </div>
                </div>

                <div>
                  <Label>Avance ({selectedNodo.avance}%)</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <Slider
                      value={[selectedNodo.avance]}
                      max={100}
                      step={5}
                      onValueChange={([v]) => updateNodo(selectedNodo.id, { avance: v })}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-10 text-right">{selectedNodo.avance}%</span>
                  </div>
                </div>

                <div>
                  <Label>Responsable</Label>
                  <Input value={selectedNodo.responsable} onChange={e => updateNodo(selectedNodo.id, { responsable: e.target.value })} />
                </div>

                <div>
                  <Label>Depende de</Label>
                  <Select value={selectedNodo.depDe || 'none'} onValueChange={v => updateNodo(selectedNodo.id, { depDe: v === 'none' ? undefined : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin dependencia</SelectItem>
                      {nodos.filter(n => n.id !== selectedNodo.id).map(n => (
                        <SelectItem key={n.id} value={n.id}>{n.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Estado</Label>
                  <Select value={selectedNodo.estado} onValueChange={v => updateNodo(selectedNodo.id, { estado: v as EstadoNodo })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(estadoLabels).map(([k, label]) => (
                        <SelectItem key={k} value={k}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Notas</Label>
                  <Textarea
                    value={selectedNodo.notas || ''}
                    onChange={e => updateNodo(selectedNodo.id, { notas: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button variant="destructive" size="sm" onClick={() => eliminarNodo(selectedNodo.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* New Node Dialog */}
      <Dialog open={showFormNodo} onOpenChange={setShowFormNodo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva tarea</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre *</Label>
              <Input value={formNombre} onChange={e => setFormNombre(e.target.value)} />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={formTipo} onValueChange={v => setFormTipo(v as TipoNodo)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="etapa">Etapa</SelectItem>
                  <SelectItem value="subetapa">Subetapa</SelectItem>
                  <SelectItem value="tarea">Tarea</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Pertenece a</Label>
              <Select value={formParent || 'none'} onValueChange={v => setFormParent(v === 'none' ? '' : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nivel raíz</SelectItem>
                  {nodos.filter(n => n.tipo !== 'tarea').map(n => (
                    <SelectItem key={n.id} value={n.id}>{n.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Inicio (día)</Label>
                <Input type="number" value={formInicio} onChange={e => setFormInicio(parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <Label>Duración (días)</Label>
                <Input type="number" value={formDuracion} onChange={e => setFormDuracion(parseInt(e.target.value) || 1)} />
              </div>
            </div>
            <div>
              <Label>Responsable</Label>
              <Input value={formResponsable} onChange={e => setFormResponsable(e.target.value)} />
            </div>
            <div>
              <Label>Depende de</Label>
              <Select value={formDepDe || 'none'} onValueChange={v => setFormDepDe(v === 'none' ? '' : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin dependencia</SelectItem>
                  {nodos.map(n => (
                    <SelectItem key={n.id} value={n.id}>{n.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formCritica} onCheckedChange={setFormCritica} />
              <Label>Ruta crítica</Label>
            </div>
            <div>
              <Label>Notas</Label>
              <Textarea value={formNotas} onChange={e => setFormNotas(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormNodo(false)}>Cancelar</Button>
            <Button onClick={handleCreateNodo}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

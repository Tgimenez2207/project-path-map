import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  CheckSquare, Plus, Search, Filter, LayoutGrid, List, Calendar,
  Clock, AlertTriangle, Building2, ArrowRight, MessageSquare,
  Repeat, GripVertical, ChevronRight, Trash2, Edit2,
} from 'lucide-react';
import { mockMisTareas } from '@/data/mockMisTareas';
import type { TareaPersonal, EstadoTarea, PrioridadTarea, AreaTarea, Subtarea } from '@/types/tareas';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const prioridadConfig: Record<PrioridadTarea, { label: string; color: string; order: number }> = {
  urgente: { label: 'Urgente', color: 'bg-red-100 text-red-700 border-red-200', order: 0 },
  alta: { label: 'Alta', color: 'bg-orange-100 text-orange-700 border-orange-200', order: 1 },
  media: { label: 'Media', color: 'bg-amber-100 text-amber-700 border-amber-200', order: 2 },
  baja: { label: 'Baja', color: 'bg-slate-100 text-slate-600 border-slate-200', order: 3 },
};

const estadoConfig: Record<EstadoTarea, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'bg-slate-100 text-slate-700' },
  en_curso: { label: 'En curso', color: 'bg-blue-100 text-blue-700' },
  completada: { label: 'Completada', color: 'bg-emerald-100 text-emerald-700' },
  bloqueada: { label: 'Bloqueada', color: 'bg-red-100 text-red-700' },
};

const areaLabels: Record<AreaTarea, string> = {
  obra: 'Obra', cerramientos: 'Cerramientos', terminaciones: 'Terminaciones',
  instalaciones: 'Instalaciones', administracion: 'Administración',
  comercial: 'Comercial', legal: 'Legal', personal: 'Personal', otro: 'Otro',
};

const columnas: { estado: EstadoTarea; label: string }[] = [
  { estado: 'pendiente', label: 'Pendientes' },
  { estado: 'en_curso', label: 'En curso' },
  { estado: 'completada', label: 'Completadas' },
  { estado: 'bloqueada', label: 'Bloqueadas' },
];

export default function MisTareas() {
  const { user } = useAuth();
  const [tareas, setTareas] = useState<TareaPersonal[]>([]);
  const [dbMode, setDbMode] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) { setTareas(mockMisTareas); return; }
      try {
        const { data } = await supabase.from('tareas_personales').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (data && data.length > 0) {
          const mapped: TareaPersonal[] = data.map((t: any) => ({
            id: t.id, titulo: t.titulo, descripcion: t.descripcion || '',
            area: (t.area || 'otro') as AreaTarea, prioridad: (t.prioridad || 'media') as PrioridadTarea,
            estado: (t.estado || 'pendiente') as EstadoTarea, asignadoA: user.email || '',
            obraId: t.obra_id, obraNombre: t.obra_nombre,
            fechaVencimiento: t.fecha_vencimiento, fechaCreacion: t.created_at?.split('T')[0] || '',
            fechaCompletada: t.fecha_completada, tags: [],
            subtareas: (t.subtareas || []) as Subtarea[], comentarios: [],
            esDeObra: !!t.obra_id, recurrente: t.recurrente ? { frecuencia: t.frecuencia_recurrencia || 'semanal' } : undefined,
          }));
          setTareas(mapped);
          setDbMode(true);
        } else {
          setTareas(mockMisTareas);
        }
      } catch {
        setTareas(mockMisTareas);
      }
    };
    load();
  }, [user?.id]);
  const [vista, setVista] = useState<'kanban' | 'lista'>('kanban');
  const [filtroArea, setFiltroArea] = useState<AreaTarea | 'todas'>('todas');
  const [filtroPrioridad, setFiltroPrioridad] = useState<PrioridadTarea | 'todas'>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [tareaSeleccionada, setTareaSeleccionada] = useState<TareaPersonal | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogNueva, setDialogNueva] = useState(false);

  // New task form
  const [nuevaTarea, setNuevaTarea] = useState({
    titulo: '', descripcion: '', area: 'otro' as AreaTarea,
    prioridad: 'media' as PrioridadTarea, fechaVencimiento: '',
  });

  const tareasFiltradas = useMemo(() => {
    return tareas.filter(t => {
      if (filtroArea !== 'todas' && t.area !== filtroArea) return false;
      if (filtroPrioridad !== 'todas' && t.prioridad !== filtroPrioridad) return false;
      if (busqueda) {
        const q = busqueda.toLowerCase();
        return t.titulo.toLowerCase().includes(q) ||
          t.obraNombre?.toLowerCase().includes(q) ||
          t.tags.some(tag => tag.toLowerCase().includes(q));
      }
      return true;
    }).sort((a, b) => prioridadConfig[a.prioridad].order - prioridadConfig[b.prioridad].order);
  }, [tareas, filtroArea, filtroPrioridad, busqueda]);

  const stats = useMemo(() => ({
    total: tareas.length,
    pendientes: tareas.filter(t => t.estado === 'pendiente').length,
    enCurso: tareas.filter(t => t.estado === 'en_curso').length,
    completadas: tareas.filter(t => t.estado === 'completada').length,
    urgentes: tareas.filter(t => t.prioridad === 'urgente' && t.estado !== 'completada').length,
    vencenHoy: tareas.filter(t => {
      if (!t.fechaVencimiento || t.estado === 'completada') return false;
      return t.fechaVencimiento <= new Date().toISOString().split('T')[0];
    }).length,
  }), [tareas]);

  const cambiarEstado = (id: string, nuevoEstado: EstadoTarea) => {
    setTareas(prev => prev.map(t =>
      t.id === id ? {
        ...t,
        estado: nuevoEstado,
        fechaCompletada: nuevoEstado === 'completada' ? new Date().toISOString() : undefined,
      } : t
    ));
    if (tareaSeleccionada?.id === id) {
      setTareaSeleccionada(prev => prev ? { ...prev, estado: nuevoEstado } : null);
    }
    toast.success(`Tarea movida a "${estadoConfig[nuevoEstado].label}"`);
  };

  const toggleSubtarea = (tareaId: string, subtareaId: string) => {
    setTareas(prev => prev.map(t =>
      t.id === tareaId ? {
        ...t,
        subtareas: t.subtareas.map(st =>
          st.id === subtareaId ? { ...st, completada: !st.completada } : st
        ),
      } : t
    ));
    if (tareaSeleccionada?.id === tareaId) {
      setTareaSeleccionada(prev => prev ? {
        ...prev,
        subtareas: prev.subtareas.map(st =>
          st.id === subtareaId ? { ...st, completada: !st.completada } : st
        ),
      } : null);
    }
  };

  const eliminarTarea = (id: string) => {
    setTareas(prev => prev.filter(t => t.id !== id));
    setSheetOpen(false);
    toast.success('Tarea eliminada');
  };

  const crearTarea = () => {
    if (!nuevaTarea.titulo.trim()) {
      toast.error('El título es obligatorio');
      return;
    }
    const tarea: TareaPersonal = {
      id: `mt-${Date.now()}`,
      titulo: nuevaTarea.titulo,
      descripcion: nuevaTarea.descripcion || undefined,
      area: nuevaTarea.area,
      prioridad: nuevaTarea.prioridad,
      estado: 'pendiente',
      asignadoA: 'Tomás',
      fechaVencimiento: nuevaTarea.fechaVencimiento || undefined,
      fechaCreacion: new Date().toISOString().split('T')[0],
      tags: [],
      subtareas: [],
      comentarios: [],
      esDeObra: false,
    };
    setTareas(prev => [tarea, ...prev]);
    setNuevaTarea({ titulo: '', descripcion: '', area: 'otro', prioridad: 'media', fechaVencimiento: '' });
    setDialogNueva(false);
    toast.success('Tarea creada');
  };

  const abrirDetalle = (tarea: TareaPersonal) => {
    setTareaSeleccionada(tarea);
    setSheetOpen(true);
  };

  const estaVencida = (t: TareaPersonal) => {
    if (!t.fechaVencimiento || t.estado === 'completada') return false;
    return t.fechaVencimiento < new Date().toISOString().split('T')[0];
  };

  const venceHoy = (t: TareaPersonal) => {
    if (!t.fechaVencimiento || t.estado === 'completada') return false;
    return t.fechaVencimiento === new Date().toISOString().split('T')[0];
  };

  // -- Render helpers --
  const TareaCard = ({ tarea }: { tarea: TareaPersonal }) => {
    const progSubtareas = tarea.subtareas.length > 0
      ? (tarea.subtareas.filter(s => s.completada).length / tarea.subtareas.length) * 100 : -1;

    return (
      <div
        onClick={() => abrirDetalle(tarea)}
        className={`p-3 rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer ${
          estaVencida(tarea) ? 'border-red-300 bg-red-50/50' :
          venceHoy(tarea) ? 'border-amber-300 bg-amber-50/50' : 'border-border'
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-medium leading-tight flex-1">{tarea.titulo}</h4>
          <Badge variant="outline" className={`text-[10px] shrink-0 ${prioridadConfig[tarea.prioridad].color}`}>
            {prioridadConfig[tarea.prioridad].label}
          </Badge>
        </div>

        {tarea.obraNombre && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <Building2 className="h-3 w-3" />
            {tarea.obraNombre}
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-[10px]">{areaLabels[tarea.area]}</Badge>
          {tarea.fechaVencimiento && (
            <span className={`text-[10px] flex items-center gap-1 ${
              estaVencida(tarea) ? 'text-red-600 font-semibold' :
              venceHoy(tarea) ? 'text-amber-600 font-semibold' : 'text-muted-foreground'
            }`}>
              <Clock className="h-3 w-3" />
              {new Date(tarea.fechaVencimiento).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
            </span>
          )}
          {tarea.recurrente && <Repeat className="h-3 w-3 text-muted-foreground" />}
          {tarea.comentarios.length > 0 && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <MessageSquare className="h-3 w-3" />{tarea.comentarios.length}
            </span>
          )}
        </div>

        {progSubtareas >= 0 && (
          <div className="mt-2">
            <Progress value={progSubtareas} className="h-1" />
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {tarea.subtareas.filter(s => s.completada).length}/{tarea.subtareas.length} subtareas
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            Mis Tareas
          </h1>
          <p className="text-sm text-muted-foreground">
            {stats.total} tareas · {stats.urgentes > 0 && (
              <span className="text-red-600 font-medium">{stats.urgentes} urgentes</span>
            )}
            {stats.vencenHoy > 0 && (
              <span className="text-amber-600 font-medium ml-1">· {stats.vencenHoy} vencen hoy</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              size="sm" variant={vista === 'kanban' ? 'default' : 'ghost'}
              onClick={() => setVista('kanban')} className="rounded-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              size="sm" variant={vista === 'lista' ? 'default' : 'ghost'}
              onClick={() => setVista('lista')} className="rounded-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Dialog open={dialogNueva} onOpenChange={setDialogNueva}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" /> Nueva tarea
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva tarea</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Título *</Label>
                  <Input
                    value={nuevaTarea.titulo}
                    onChange={e => setNuevaTarea(p => ({ ...p, titulo: e.target.value }))}
                    placeholder="¿Qué necesitás hacer?"
                  />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Textarea
                    value={nuevaTarea.descripcion}
                    onChange={e => setNuevaTarea(p => ({ ...p, descripcion: e.target.value }))}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Área</Label>
                    <Select value={nuevaTarea.area} onValueChange={v => setNuevaTarea(p => ({ ...p, area: v as AreaTarea }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(areaLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Prioridad</Label>
                    <Select value={nuevaTarea.prioridad} onValueChange={v => setNuevaTarea(p => ({ ...p, prioridad: v as PrioridadTarea }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(prioridadConfig).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Fecha de vencimiento</Label>
                  <Input
                    type="date"
                    value={nuevaTarea.fechaVencimiento}
                    onChange={e => setNuevaTarea(p => ({ ...p, fechaVencimiento: e.target.value }))}
                  />
                </div>
                <Button onClick={crearTarea} className="w-full">Crear tarea</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats mini */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Pendientes', value: stats.pendientes, color: 'text-slate-600' },
          { label: 'En curso', value: stats.enCurso, color: 'text-blue-600' },
          { label: 'Completadas', value: stats.completadas, color: 'text-emerald-600' },
          { label: 'Urgentes', value: stats.urgentes, color: 'text-red-600' },
        ].map(s => (
          <Card key={s.label} className="rounded-xl">
            <CardContent className="p-3 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tarea..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <Select value={filtroArea} onValueChange={v => setFiltroArea(v as any)}>
          <SelectTrigger className="w-[140px] h-9">
            <Filter className="h-3 w-3 mr-1" /><SelectValue placeholder="Área" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las áreas</SelectItem>
            {Object.entries(areaLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroPrioridad} onValueChange={v => setFiltroPrioridad(v as any)}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {Object.entries(prioridadConfig).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban View */}
      {vista === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {columnas.map(col => {
            const tareasCol = tareasFiltradas.filter(t => t.estado === col.estado);
            return (
              <div key={col.estado} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      col.estado === 'pendiente' ? 'bg-slate-400' :
                      col.estado === 'en_curso' ? 'bg-blue-500' :
                      col.estado === 'completada' ? 'bg-emerald-500' : 'bg-red-500'
                    }`} />
                    {col.label}
                  </h3>
                  <Badge variant="secondary" className="text-[10px]">{tareasCol.length}</Badge>
                </div>
                <div className="space-y-2 min-h-[100px]">
                  {tareasCol.map(tarea => (
                    <TareaCard key={tarea.id} tarea={tarea} />
                  ))}
                  {tareasCol.length === 0 && (
                    <div className="text-center text-xs text-muted-foreground py-8 border border-dashed rounded-xl">
                      Sin tareas
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {vista === 'lista' && (
        <Card className="rounded-xl">
          <CardContent className="p-0">
            <div className="divide-y">
              {tareasFiltradas.map(tarea => (
                <div
                  key={tarea.id}
                  onClick={() => abrirDetalle(tarea)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={tarea.estado === 'completada'}
                    onClick={e => {
                      e.stopPropagation();
                      cambiarEstado(tarea.id, tarea.estado === 'completada' ? 'pendiente' : 'completada');
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${tarea.estado === 'completada' ? 'line-through text-muted-foreground' : ''}`}>
                      {tarea.titulo}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {tarea.obraNombre && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Building2 className="h-3 w-3" />{tarea.obraNombre}
                        </span>
                      )}
                      <Badge variant="secondary" className="text-[10px]">{areaLabels[tarea.area]}</Badge>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] shrink-0 ${prioridadConfig[tarea.prioridad].color}`}>
                    {prioridadConfig[tarea.prioridad].label}
                  </Badge>
                  {tarea.fechaVencimiento && (
                    <span className={`text-[10px] shrink-0 ${
                      estaVencida(tarea) ? 'text-red-600 font-semibold' :
                      venceHoy(tarea) ? 'text-amber-600 font-semibold' : 'text-muted-foreground'
                    }`}>
                      {new Date(tarea.fechaVencimiento).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                    </span>
                  )}
                  <Badge className={`text-[10px] ${estadoConfig[tarea.estado].color}`}>
                    {estadoConfig[tarea.estado].label}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              ))}
              {tareasFiltradas.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  No hay tareas con estos filtros
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {tareaSeleccionada && (
            <div className="space-y-6 pt-4">
              <SheetHeader>
                <div className="flex items-start justify-between gap-2">
                  <SheetTitle className="text-left text-lg leading-tight">
                    {tareaSeleccionada.titulo}
                  </SheetTitle>
                  {!tareaSeleccionada.esDeObra && (
                    <Button size="icon" variant="ghost" className="shrink-0 text-red-500 hover:text-red-700"
                      onClick={() => eliminarTarea(tareaSeleccionada.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </SheetHeader>

              {/* Meta */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={prioridadConfig[tareaSeleccionada.prioridad].color}>
                  {prioridadConfig[tareaSeleccionada.prioridad].label}
                </Badge>
                <Badge className={estadoConfig[tareaSeleccionada.estado].color}>
                  {estadoConfig[tareaSeleccionada.estado].label}
                </Badge>
                <Badge variant="secondary">{areaLabels[tareaSeleccionada.area]}</Badge>
                {tareaSeleccionada.esDeObra && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Building2 className="h-3 w-3 mr-1" />Tarea de obra
                  </Badge>
                )}
                {tareaSeleccionada.recurrente && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    <Repeat className="h-3 w-3 mr-1" />{tareaSeleccionada.recurrente.frecuencia}
                  </Badge>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Creada</p>
                  <p>{new Date(tareaSeleccionada.fechaCreacion).toLocaleDateString('es-AR')}</p>
                </div>
                {tareaSeleccionada.fechaVencimiento && (
                  <div>
                    <p className="text-muted-foreground text-xs">Vence</p>
                    <p className={estaVencida(tareaSeleccionada) ? 'text-red-600 font-semibold' : ''}>
                      {new Date(tareaSeleccionada.fechaVencimiento).toLocaleDateString('es-AR')}
                      {estaVencida(tareaSeleccionada) && ' (vencida)'}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground text-xs">Asignado a</p>
                  <p>{tareaSeleccionada.asignadoA}</p>
                </div>
                {tareaSeleccionada.obraNombre && (
                  <div>
                    <p className="text-muted-foreground text-xs">Obra</p>
                    <p>{tareaSeleccionada.obraNombre}</p>
                  </div>
                )}
              </div>

              {tareaSeleccionada.descripcion && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Descripción</p>
                  <p className="text-sm">{tareaSeleccionada.descripcion}</p>
                </div>
              )}

              {/* State change */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Cambiar estado</p>
                <div className="flex flex-wrap gap-2">
                  {columnas.map(col => (
                    <Button
                      key={col.estado}
                      size="sm"
                      variant={tareaSeleccionada.estado === col.estado ? 'default' : 'outline'}
                      onClick={() => cambiarEstado(tareaSeleccionada.id, col.estado)}
                      className="text-xs"
                    >
                      {col.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Subtareas */}
              {tareaSeleccionada.subtareas.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Subtareas ({tareaSeleccionada.subtareas.filter(s => s.completada).length}/{tareaSeleccionada.subtareas.length})
                  </p>
                  <div className="space-y-2">
                    {tareaSeleccionada.subtareas.map(st => (
                      <div key={st.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={st.completada}
                          onCheckedChange={() => toggleSubtarea(tareaSeleccionada.id, st.id)}
                        />
                        <span className={`text-sm ${st.completada ? 'line-through text-muted-foreground' : ''}`}>
                          {st.titulo}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {tareaSeleccionada.tags.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {tareaSeleccionada.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              {tareaSeleccionada.comentarios.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Comentarios</p>
                  <div className="space-y-3">
                    {tareaSeleccionada.comentarios.map(c => (
                      <div key={c.id} className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">{c.autor}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(c.fecha).toLocaleDateString('es-AR')}
                          </span>
                        </div>
                        <p className="text-sm">{c.texto}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

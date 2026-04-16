import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  FileSignature, Plus, Search, Filter, Building2, Calendar,
  Clock, CheckCircle, DollarSign, FileText,
  Copy, ChevronRight, Users, Milestone,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { TipoContrato, EstadoContrato, PlantillaContrato, HitoContractual, Parte } from '@/types/contratos';

// DB row type
interface ContratoRow {
  id: string;
  numero: string;
  tipo: string;
  titulo: string;
  estado: string;
  parte_a: any;
  parte_b: any;
  obra_id: string | null;
  obra_nombre: string | null;
  fecha_creacion: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  fecha_firma: string | null;
  monto_total: number;
  moneda: string;
  forma_pago: string;
  hitos: any;
  cuerpo: string;
  plantilla_id: string | null;
  adjuntos: string[];
  notas: string;
  creado_por: string;
  version: number;
}

interface PlantillaRow {
  id: string;
  nombre: string;
  tipo: string;
  descripcion: string;
  cuerpo: string;
  variables: string[];
}

const tipoLabels: Record<string, string> = {
  compraventa: 'Compraventa', locacion_obra: 'Locación de obra',
  subcontrato: 'Subcontrato', provision: 'Provisión',
  honorarios: 'Honorarios', alquiler: 'Alquiler', otro: 'Otro',
};

const estadoConfig: Record<string, { label: string; color: string }> = {
  borrador: { label: 'Borrador', color: 'bg-slate-100 text-slate-700' },
  revision: { label: 'En revisión', color: 'bg-amber-100 text-amber-700' },
  pendiente_firma: { label: 'Pendiente firma', color: 'bg-orange-100 text-orange-700' },
  firmado: { label: 'Firmado', color: 'bg-blue-100 text-blue-700' },
  en_ejecucion: { label: 'En ejecución', color: 'bg-emerald-100 text-emerald-700' },
  finalizado: { label: 'Finalizado', color: 'bg-slate-100 text-slate-600' },
  rescindido: { label: 'Rescindido', color: 'bg-red-100 text-red-700' },
};

const estadoKeys = ['borrador','revision','pendiente_firma','firmado','en_ejecucion','finalizado','rescindido'];

export default function Contratos() {
  const [contratos, setContratos] = useState<ContratoRow[]>([]);
  const [plantillas, setPlantillas] = useState<PlantillaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [contratoSeleccionado, setContratoSeleccionado] = useState<ContratoRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogNuevo, setDialogNuevo] = useState(false);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<PlantillaRow | null>(null);
  const [dialogPlantilla, setDialogPlantilla] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: ctosData }, { data: tplData }] = await Promise.all([
      supabase.from('contratos').select('*').order('created_at', { ascending: false }),
      supabase.from('plantillas_contrato').select('*'),
    ]);
    if (ctosData) setContratos(ctosData as unknown as ContratoRow[]);
    if (tplData) setPlantillas(tplData as unknown as PlantillaRow[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const contratosFiltrados = useMemo(() => {
    return contratos.filter(c => {
      if (filtroTipo !== 'todos' && c.tipo !== filtroTipo) return false;
      if (filtroEstado !== 'todos' && c.estado !== filtroEstado) return false;
      if (busqueda) {
        const q = busqueda.toLowerCase();
        const parteB = c.parte_b as any;
        return c.titulo.toLowerCase().includes(q) ||
          c.numero.toLowerCase().includes(q) ||
          (parteB?.nombre || '').toLowerCase().includes(q) ||
          (c.obra_nombre || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [contratos, filtroTipo, filtroEstado, busqueda]);

  const stats = useMemo(() => {
    const activos = contratos.filter(c => ['firmado', 'en_ejecucion'].includes(c.estado));
    const montoActivo = activos.reduce((a, c) => a + Number(c.monto_total), 0);
    const pendientesFirma = contratos.filter(c => c.estado === 'pendiente_firma').length;
    const hitosPendientes = contratos.flatMap(c => (c.hitos as HitoContractual[] || [])).filter(h => !h.cumplido).length;
    return { total: contratos.length, activos: activos.length, montoActivo, pendientesFirma, hitosPendientes };
  }, [contratos]);

  const cambiarEstado = async (id: string, estado: string) => {
    const updates: any = { estado };
    if (estado === 'firmado') updates.fecha_firma = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('contratos').update(updates).eq('id', id);
    if (error) { toast.error('Error al actualizar estado'); return; }
    setContratos(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    if (contratoSeleccionado?.id === id) setContratoSeleccionado(prev => prev ? { ...prev, ...updates } : null);
    toast.success(`Estado actualizado a "${estadoConfig[estado]?.label}"`);
  };

  const toggleHito = async (contratoId: string, hitoId: string) => {
    const contrato = contratos.find(c => c.id === contratoId);
    if (!contrato) return;
    const hitos = (contrato.hitos as HitoContractual[]).map(h =>
      h.id === hitoId ? { ...h, cumplido: !h.cumplido, fechaReal: !h.cumplido ? new Date().toISOString().split('T')[0] : undefined } : h
    );
    const { error } = await supabase.from('contratos').update({ hitos } as any).eq('id', contratoId);
    if (error) { toast.error('Error al actualizar hito'); return; }
    setContratos(prev => prev.map(c => c.id === contratoId ? { ...c, hitos } : c));
    if (contratoSeleccionado?.id === contratoId) setContratoSeleccionado(prev => prev ? { ...prev, hitos } : null);
  };

  const abrirDetalle = (contrato: ContratoRow) => {
    setContratoSeleccionado(contrato);
    setSheetOpen(true);
  };

  const crearContrato = async (tipo: string, cuerpo: string, plantillaId?: string) => {
    const numero = `CTO-2026-${String(contratos.length + 1).padStart(3, '0')}`;
    const nuevo = {
      numero,
      tipo: tipo as any,
      titulo: `Nuevo ${tipoLabels[tipo] || 'Contrato'}`,
      estado: 'borrador' as any,
      parte_a: { tipo: 'otro', nombre: 'NATO OBRAS SRL', cuit: '30-71234567-8' },
      parte_b: { tipo: 'cliente', nombre: '' },
      fecha_creacion: new Date().toISOString().split('T')[0],
      fecha_inicio: new Date().toISOString().split('T')[0],
      monto_total: 0,
      moneda: 'USD' as any,
      forma_pago: '',
      hitos: [] as any,
      cuerpo,
      plantilla_id: plantillaId || null,
      adjuntos: [],
      notas: '',
      creado_por: 'Tomás',
      version: 1,
    };
    const { data, error } = await supabase.from('contratos').insert(nuevo).select().single();
    if (error) { toast.error('Error al crear contrato'); return; }
    const row = data as unknown as ContratoRow;
    setContratos(prev => [row, ...prev]);
    setDialogNuevo(false);
    setDialogPlantilla(false);
    setPlantillaSeleccionada(null);
    abrirDetalle(row);
    toast.success('Contrato creado');
  };

  const hitosProgress = (c: ContratoRow) => {
    const h = c.hitos as HitoContractual[] || [];
    if (h.length === 0) return 0;
    return (h.filter(x => x.cumplido).length / h.length) * 100;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileSignature className="h-6 w-6 text-primary" />
            Contratos
          </h1>
          <p className="text-sm text-muted-foreground">
            {stats.total} contratos · {stats.activos} activos · USD {(stats.montoActivo / 1000).toFixed(0)}K en ejecución
          </p>
        </div>
        <Dialog open={dialogNuevo} onOpenChange={setDialogNuevo}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Nuevo contrato</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Elegir plantilla</DialogTitle></DialogHeader>
            <div className="space-y-3">
              {plantillas.map(p => (
                <Card key={p.id} className="cursor-pointer hover:shadow-md transition-shadow rounded-xl"
                  onClick={() => { setPlantillaSeleccionada(p); setDialogNuevo(false); setDialogPlantilla(true); }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-sm">{p.nombre}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.descripcion}</p>
                        <Badge variant="secondary" className="text-[10px] mt-2">{tipoLabels[p.tipo]}</Badge>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Separator />
              <Button variant="outline" className="w-full" onClick={() => crearContrato('otro', '')}>
                <FileText className="h-4 w-4 mr-2" /> Contrato en blanco
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Confirm template dialog */}
      <Dialog open={dialogPlantilla} onOpenChange={setDialogPlantilla}>
        <DialogContent>
          <DialogHeader><DialogTitle>Crear desde plantilla</DialogTitle></DialogHeader>
          {plantillaSeleccionada && (
            <div className="space-y-4">
              <p className="text-sm">Se creará un contrato de tipo <strong>{tipoLabels[plantillaSeleccionada.tipo]}</strong> con el modelo "{plantillaSeleccionada.nombre}".</p>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Variables a completar:</p>
                <div className="flex flex-wrap gap-1">
                  {plantillaSeleccionada.variables.map(v => (
                    <Badge key={v} variant="secondary" className="text-[10px]">{v.replace(/_/g, ' ')}</Badge>
                  ))}
                </div>
              </div>
              <Button onClick={() => crearContrato(plantillaSeleccionada.tipo, plantillaSeleccionada.cuerpo, plantillaSeleccionada.id)} className="w-full">
                Crear contrato
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Contratos activos', value: stats.activos, icon: FileSignature, color: 'text-emerald-600' },
          { label: 'Monto activo', value: `USD ${(stats.montoActivo / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-blue-600' },
          { label: 'Pendientes firma', value: stats.pendientesFirma, icon: Clock, color: 'text-orange-600' },
          { label: 'Hitos pendientes', value: stats.hitosPendientes, icon: Milestone, color: 'text-amber-600' },
        ].map(s => (
          <Card key={s.label} className="rounded-xl">
            <CardContent className="p-3 flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color} shrink-0`} />
              <div>
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar contrato..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="pl-8 h-9" />
        </div>
        <Select value={filtroTipo} onValueChange={v => setFiltroTipo(v)}>
          <SelectTrigger className="w-[150px] h-9"><Filter className="h-3 w-3 mr-1" /><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los tipos</SelectItem>
            {Object.entries(tipoLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroEstado} onValueChange={v => setFiltroEstado(v)}>
          <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            {Object.entries(estadoConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="space-y-3">
        {contratosFiltrados.map(contrato => {
          const parteB = contrato.parte_b as Parte;
          const hitos = contrato.hitos as HitoContractual[] || [];
          return (
            <Card key={contrato.id} className="rounded-xl cursor-pointer hover:shadow-md transition-shadow" onClick={() => abrirDetalle(contrato)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{contrato.numero}</span>
                      <Badge className={`text-[10px] ${estadoConfig[contrato.estado]?.color}`}>{estadoConfig[contrato.estado]?.label}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{tipoLabels[contrato.tipo]}</Badge>
                    </div>
                    <h3 className="font-medium text-sm truncate">{contrato.titulo}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{parteB?.nombre || 'Sin definir'}</span>
                      {contrato.obra_nombre && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{contrato.obra_nombre}</span>}
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(contrato.fecha_creacion).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                    </div>
                    {hitos.length > 0 && (
                      <div className="mt-2">
                        <Progress value={hitosProgress(contrato)} className="h-1.5" />
                        <p className="text-[10px] text-muted-foreground mt-0.5">{hitos.filter(h => h.cumplido).length}/{hitos.length} hitos cumplidos</p>
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm">{contrato.moneda} {Number(contrato.monto_total).toLocaleString('es-AR')}</p>
                    <p className="text-[10px] text-muted-foreground">{contrato.forma_pago}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {contratosFiltrados.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {contratos.length === 0 ? 'No hay contratos todavía. Creá el primero.' : 'No hay contratos con estos filtros'}
          </div>
        )}
      </div>

      {/* Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {contratoSeleccionado && (() => {
            const c = contratoSeleccionado;
            const parteA = c.parte_a as Parte;
            const parteB = c.parte_b as Parte;
            const hitos = c.hitos as HitoContractual[] || [];
            return (
              <div className="space-y-6 pt-4">
                <SheetHeader>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">{c.numero}</span><span>· v{c.version}</span>
                  </div>
                  <SheetTitle className="text-left text-lg leading-tight">{c.titulo}</SheetTitle>
                </SheetHeader>

                <div className="flex flex-wrap gap-2">
                  <Badge className={estadoConfig[c.estado]?.color}>{estadoConfig[c.estado]?.label}</Badge>
                  <Badge variant="secondary">{tipoLabels[c.tipo]}</Badge>
                  {c.obra_nombre && <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Building2 className="h-3 w-3 mr-1" />{c.obra_nombre}</Badge>}
                </div>

                <Tabs defaultValue="general">
                  <TabsList className="w-full">
                    <TabsTrigger value="general" className="flex-1 text-xs">General</TabsTrigger>
                    <TabsTrigger value="hitos" className="flex-1 text-xs">Hitos</TabsTrigger>
                    <TabsTrigger value="cuerpo" className="flex-1 text-xs">Texto</TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="rounded-xl"><CardContent className="p-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Parte A</p>
                        <p className="text-sm font-medium">{parteA?.nombre}</p>
                        {parteA?.cuit && <p className="text-xs text-muted-foreground">CUIT: {parteA.cuit}</p>}
                      </CardContent></Card>
                      <Card className="rounded-xl"><CardContent className="p-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Parte B</p>
                        <p className="text-sm font-medium">{parteB?.nombre || 'Sin definir'}</p>
                        {parteB?.cuit && <p className="text-xs text-muted-foreground">CUIT: {parteB.cuit}</p>}
                        {parteB?.dni && <p className="text-xs text-muted-foreground">DNI: {parteB.dni}</p>}
                      </CardContent></Card>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><p className="text-muted-foreground text-xs">Monto total</p><p className="font-semibold">{c.moneda} {Number(c.monto_total).toLocaleString('es-AR')}</p></div>
                      <div><p className="text-muted-foreground text-xs">Forma de pago</p><p>{c.forma_pago || '—'}</p></div>
                      <div><p className="text-muted-foreground text-xs">Fecha inicio</p><p>{new Date(c.fecha_inicio).toLocaleDateString('es-AR')}</p></div>
                      {c.fecha_fin && <div><p className="text-muted-foreground text-xs">Fecha fin</p><p>{new Date(c.fecha_fin).toLocaleDateString('es-AR')}</p></div>}
                      {c.fecha_firma && <div><p className="text-muted-foreground text-xs">Firmado el</p><p>{new Date(c.fecha_firma).toLocaleDateString('es-AR')}</p></div>}
                      <div><p className="text-muted-foreground text-xs">Creado por</p><p>{c.creado_por}</p></div>
                    </div>

                    {c.notas && <div><p className="text-xs text-muted-foreground mb-1">Notas</p><p className="text-sm bg-muted/50 rounded-lg p-3">{c.notas}</p></div>}

                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Cambiar estado</p>
                      <div className="flex flex-wrap gap-2">
                        {estadoKeys.map(estado => (
                          <Button key={estado} size="sm" variant={c.estado === estado ? 'default' : 'outline'}
                            onClick={() => cambiarEstado(c.id, estado)} className="text-xs">
                            {estadoConfig[estado].label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="hitos" className="space-y-4 mt-4">
                    {hitos.length > 0 ? (
                      <>
                        <Progress value={hitosProgress(c)} className="h-2" />
                        <p className="text-xs text-muted-foreground">{hitos.filter(h => h.cumplido).length} de {hitos.length} hitos cumplidos</p>
                        <div className="space-y-3">
                          {hitos.map(hito => (
                            <div key={hito.id} className={`flex items-start gap-3 p-3 rounded-xl border ${hito.cumplido ? 'bg-emerald-50/50 border-emerald-200' : 'border-border'}`}>
                              <Checkbox checked={hito.cumplido} onCheckedChange={() => toggleHito(c.id, hito.id)} className="mt-0.5" />
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${hito.cumplido ? 'line-through text-muted-foreground' : ''}`}>{hito.descripcion}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(hito.fechaEstimada).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</span>
                                  {hito.monto && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />USD {hito.monto.toLocaleString('es-AR')}</span>}
                                  {hito.fechaReal && <span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" />{new Date(hito.fechaReal).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">Este contrato no tiene hitos definidos</div>
                    )}
                  </TabsContent>

                  <TabsContent value="cuerpo" className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-muted-foreground">Texto del contrato</p>
                      <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(c.cuerpo); toast.success('Texto copiado'); }}>
                        <Copy className="h-3 w-3 mr-1" /> Copiar
                      </Button>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-4 text-sm whitespace-pre-wrap font-mono leading-relaxed max-h-[60vh] overflow-y-auto border">
                      {c.cuerpo || 'Sin contenido'}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Phone, Mail, MapPin, Plus, Search, BarChart3, Sparkles, Star, MessageSquare, FileText, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { mockProveedores } from '@/data/mockProveedores';
import type { Proveedor, RubroProveedor, EstadoProveedor, Evaluacion, Cotizacion } from '@/types/proveedores';
import { supabase } from '@/integrations/supabase/client';

const RUBRO_LABELS: Record<RubroProveedor, string> = {
  materiales: 'Materiales', subcontratista: 'Subcontratista',
  servicio_profesional: 'Servicios profesionales', equipamiento: 'Equipamiento', otro: 'Otro',
};
const RUBRO_COLORS: Record<RubroProveedor, string> = {
  materiales: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  subcontratista: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  servicio_profesional: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  equipamiento: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  otro: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};
const ESTADO_LABELS: Record<EstadoProveedor, string> = { activo: 'Activo', inactivo: 'Inactivo', en_evaluacion: 'En evaluación' };

const calcularRating = (evaluaciones: Evaluacion[]): number => {
  if (evaluaciones.length === 0) return 0;
  const total = evaluaciones.reduce((acc, e) => acc + (e.puntualidad + e.calidad + e.precio + e.comunicacion) / 4, 0);
  return Math.round((total / evaluaciones.length) * 10) / 10;
};

const renderStars = (rating: number) => {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
};

const fmt = (n: number) => n.toLocaleString('es-AR');

const emptyForm = (): Omit<Proveedor, 'id' | 'evaluaciones' | 'cotizaciones' | 'creadoEn'> => ({
  razonSocial: '', rubro: 'materiales', subrubro: '', contacto: '', telefono: '', email: '',
  ciudad: '', provincia: '', cuit: '', web: '', estado: 'en_evaluacion', notas: '',
});

export default function Proveedores() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: dbP } = await supabase.from('proveedores').select('*').order('razon_social');
        const { data: dbEvals } = await supabase.from('evaluaciones_proveedores').select('*');
        const { data: dbCots } = await supabase.from('cotizaciones_proveedores').select('*');
        
        if (dbP && dbP.length > 0) {
          const mapped: Proveedor[] = dbP.map((p: any) => {
            const rubroMap: Record<string, RubroProveedor> = { proveedor: 'materiales', contratista: 'subcontratista' };
            return {
              id: p.id,
              razonSocial: p.razon_social,
              rubro: (p.rubro as RubroProveedor) || rubroMap[p.tipo] || 'otro',
              subrubro: p.subrubro || p.rubro || '',
              contacto: p.contacto || '',
              telefono: p.telefono || '',
              email: p.email || '',
              ciudad: p.ciudad || p.direccion || '',
              provincia: p.provincia || '',
              cuit: p.cuit || '',
              web: p.web || '',
              estado: (p.activo ? 'activo' : 'inactivo') as EstadoProveedor,
              evaluaciones: (dbEvals || []).filter((e: any) => e.proveedor_id === p.id).map((e: any) => ({
                id: e.id, fecha: e.fecha, obraNombre: e.obra_nombre, autor: e.autor,
                puntualidad: e.puntualidad, calidad: e.calidad, precio: e.precio, comunicacion: e.comunicacion,
                comentario: e.comentario,
              })),
              cotizaciones: (dbCots || []).filter((c: any) => c.proveedor_id === p.id).map((c: any) => ({
                id: c.id, fecha: c.fecha, descripcion: c.descripcion,
                monto: Number(c.monto), moneda: c.moneda, ganada: c.ganada,
              })),
              notas: '',
              creadoEn: p.created_at?.split('T')[0] || '',
              enriquecidoIA: p.enriquecido_ia || false,
              resumenIA: p.resumen_ia || undefined,
            };
          });
          setProveedores(mapped);
        } else {
          setProveedores(mockProveedores);
        }
      } catch {
        setProveedores(mockProveedores);
      }
    };
    load();
  }, []);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRubro, setFiltroRubro] = useState<RubroProveedor | 'todos'>('todos');
  const [filtroEstado, setFiltroEstado] = useState<EstadoProveedor | 'todos'>('todos');
  const [ordenar, setOrdenar] = useState<'rating' | 'nombre' | 'reciente'>('rating');
  const [vistaDetalle, setVistaDetalle] = useState<Proveedor | null>(null);
  const [showFormNuevo, setShowFormNuevo] = useState(false);
  const [isLoadingIA, setIsLoadingIA] = useState<string | null>(null);
  const [showComparacion, setShowComparacion] = useState(false);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [form, setForm] = useState(emptyForm());
  // Evaluación nueva
  const [showNuevaEval, setShowNuevaEval] = useState(false);
  const [evalForm, setEvalForm] = useState({ puntualidad: 3, calidad: 3, precio: 3, comunicacion: 3, comentario: '', autor: '', obraNombre: '' });
  // Cotización nueva
  const [showNuevaCot, setShowNuevaCot] = useState(false);
  const [cotForm, setCotForm] = useState({ descripcion: '', monto: 0, moneda: 'ARS' as 'ARS' | 'USD', ganada: false });
  // IA comparison result
  const [iaComparacion, setIaComparacion] = useState('');
  const [isLoadingComparacion, setIsLoadingComparacion] = useState(false);
  // IA chat
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  const proveedoresFiltrados = useMemo(() => {
    let list = proveedores.filter(p => {
      if (filtroRubro !== 'todos' && p.rubro !== filtroRubro) return false;
      if (filtroEstado !== 'todos' && p.estado !== filtroEstado) return false;
      if (busqueda) {
        const q = busqueda.toLowerCase();
        return p.razonSocial.toLowerCase().includes(q) || p.subrubro.toLowerCase().includes(q) || p.ciudad.toLowerCase().includes(q);
      }
      return true;
    });
    if (ordenar === 'rating') list.sort((a, b) => calcularRating(b.evaluaciones) - calcularRating(a.evaluaciones));
    else if (ordenar === 'nombre') list.sort((a, b) => a.razonSocial.localeCompare(b.razonSocial));
    else list.sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
    return list;
  }, [proveedores, busqueda, filtroRubro, filtroEstado, ordenar]);

  const kpis = useMemo(() => ({
    activos: proveedores.filter(p => p.estado === 'activo').length,
    ratingPromedio: proveedores.length ? Math.round(proveedores.reduce((a, p) => a + calcularRating(p.evaluaciones), 0) / proveedores.length * 10) / 10 : 0,
    cotizacionesMes: proveedores.reduce((a, p) => a + p.cotizaciones.filter(c => c.fecha >= '2026-04-01').length, 0),
    enEvaluacion: proveedores.filter(p => p.estado === 'en_evaluacion').length,
  }), [proveedores]);

  const toggleSeleccion = (id: string) => setSeleccionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleCrear = () => {
    if (!form.razonSocial || !form.subrubro) { toast({ title: 'Completá razón social y subrubro', variant: 'destructive' }); return; }
    const nuevo: Proveedor = { ...form, id: crypto.randomUUID(), evaluaciones: [], cotizaciones: [], creadoEn: new Date().toISOString().slice(0, 10) };
    setProveedores(prev => [nuevo, ...prev]);
    setShowFormNuevo(false);
    setForm(emptyForm());
    toast({ title: 'Proveedor agregado correctamente' });
  };

  const handleAnalizarIA = async (proveedor: Proveedor) => {
    setIsLoadingIA(proveedor.id);
    try {
      const rating = calcularRating(proveedor.evaluaciones);
      const evalDetalle = proveedor.evaluaciones.map(e =>
        `- Obra: ${e.obraNombre || 'Sin especificar'} (${e.fecha})\n  Puntualidad: ${e.puntualidad}/5 | Calidad: ${e.calidad}/5 | Precio: ${e.precio}/5 | Comunicación: ${e.comunicacion}/5\n  Comentario: "${e.comentario}"`
      ).join('\n');

      const { data, error } = await supabase.functions.invoke('ai-proveedores', {
        body: {
          mode: 'analizar',
          data: {
            proveedor: {
              razonSocial: proveedor.razonSocial, rubro: proveedor.rubro, subrubro: proveedor.subrubro,
              ciudad: proveedor.ciudad, provincia: proveedor.provincia, estado: proveedor.estado,
              rating, cantEvaluaciones: proveedor.evaluaciones.length, evaluacionesDetalle: evalDetalle,
              totalCotizaciones: proveedor.cotizaciones.length, cotizacionesGanadas: proveedor.cotizaciones.filter(c => c.ganada).length,
            },
          },
        },
      });
      if (error) throw error;
      setProveedores(prev => prev.map(p => p.id === proveedor.id ? { ...p, resumenIA: data.result, enriquecidoIA: true } : p));
      if (vistaDetalle?.id === proveedor.id) setVistaDetalle(prev => prev ? { ...prev, resumenIA: data.result, enriquecidoIA: true } : null);
      toast({ title: 'Análisis IA completado' });
    } catch {
      toast({ title: 'Error al analizar con IA', variant: 'destructive' });
    } finally {
      setIsLoadingIA(null);
    }
  };

  const handleCompararIA = async () => {
    setIsLoadingComparacion(true);
    try {
      const selected = proveedores.filter(p => seleccionados.includes(p.id));
      const text = selected.map(p => `${p.razonSocial}: rating ${calcularRating(p.evaluaciones)}/5, ${p.evaluaciones.length} evaluaciones, ${p.ciudad}, rubro: ${p.subrubro}`).join('\n');
      const { data, error } = await supabase.functions.invoke('ai-proveedores', {
        body: { mode: 'comparar', data: { proveedores: text } },
      });
      if (error) throw error;
      setIaComparacion(data.result);
    } catch {
      toast({ title: 'Error en comparación IA', variant: 'destructive' });
    } finally {
      setIsLoadingComparacion(false);
    }
  };

  const handleChat = async () => {
    if (!chatMsg.trim() || !vistaDetalle) return;
    const userMsg = chatMsg;
    setChatMsg('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoadingChat(true);
    try {
      const p = vistaDetalle;
      const ctx = `Proveedor: ${p.razonSocial}\nRubro: ${p.rubro} - ${p.subrubro}\nRating: ${calcularRating(p.evaluaciones)}/5\nEvaluaciones: ${p.evaluaciones.length}\nEstado: ${p.estado}`;
      const { data, error } = await supabase.functions.invoke('ai-proveedores', {
        body: { mode: 'chat', data: { message: userMsg, context: ctx } },
      });
      if (error) throw error;
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.result }]);
    } catch {
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Error al procesar la consulta.' }]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const agregarEvaluacion = () => {
    if (!vistaDetalle || !evalForm.autor || !evalForm.comentario) { toast({ title: 'Completá autor y comentario', variant: 'destructive' }); return; }
    const nueva: Evaluacion = { id: crypto.randomUUID(), fecha: new Date().toISOString().slice(0, 10), ...evalForm };
    setProveedores(prev => prev.map(p => p.id === vistaDetalle.id ? { ...p, evaluaciones: [nueva, ...p.evaluaciones] } : p));
    setVistaDetalle(prev => prev ? { ...prev, evaluaciones: [nueva, ...prev.evaluaciones] } : null);
    setShowNuevaEval(false);
    setEvalForm({ puntualidad: 3, calidad: 3, precio: 3, comunicacion: 3, comentario: '', autor: '', obraNombre: '' });
    toast({ title: 'Evaluación registrada' });
  };

  const agregarCotizacion = () => {
    if (!vistaDetalle || !cotForm.descripcion || cotForm.monto <= 0) { toast({ title: 'Completá descripción y monto', variant: 'destructive' }); return; }
    const nueva: Cotizacion = { id: crypto.randomUUID(), fecha: new Date().toISOString().slice(0, 10), ...cotForm };
    setProveedores(prev => prev.map(p => p.id === vistaDetalle.id ? { ...p, cotizaciones: [nueva, ...p.cotizaciones] } : p));
    setVistaDetalle(prev => prev ? { ...prev, cotizaciones: [nueva, ...prev.cotizaciones] } : null);
    setShowNuevaCot(false);
    setCotForm({ descripcion: '', monto: 0, moneda: 'ARS', ganada: false });
    toast({ title: 'Cotización registrada' });
  };

  const openDetalle = (p: Proveedor) => {
    setVistaDetalle(p);
    setChatHistory([]);
    setShowNuevaEval(false);
    setShowNuevaCot(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Proveedores</h1>
          <p className="text-muted-foreground text-sm">{proveedoresFiltrados.length} proveedores · {seleccionados.length} seleccionados</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => navigate('/proveedores/directorio')}>
            <Search className="h-4 w-4 mr-2" />Buscar con IA
          </Button>
          {seleccionados.length >= 2 && (
            <Button variant="outline" onClick={() => { setShowComparacion(true); setIaComparacion(''); }}>
              <BarChart3 className="h-4 w-4 mr-2" />Comparar ({seleccionados.length})
            </Button>
          )}
          <Button onClick={() => { setForm(emptyForm()); setShowFormNuevo(true); }}><Plus className="h-4 w-4 mr-2" />Nuevo proveedor</Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre, subrubro o ciudad..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="pl-9" />
        </div>
        <Select value={filtroRubro} onValueChange={v => setFiltroRubro(v as any)}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Rubro" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los rubros</SelectItem>
            {Object.entries(RUBRO_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroEstado} onValueChange={v => setFiltroEstado(v as any)}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            {Object.entries(ESTADO_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={ordenar} onValueChange={v => setOrdenar(v as any)}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Mayor rating</SelectItem>
            <SelectItem value="nombre">Nombre A-Z</SelectItem>
            <SelectItem value="reciente">Más reciente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Activos', value: kpis.activos, icon: Building2 },
          { label: 'Rating promedio', value: `${kpis.ratingPromedio}/5`, icon: Star },
          { label: 'Cotizaciones del mes', value: kpis.cotizacionesMes, icon: FileText },
          { label: 'En evaluación', value: kpis.enEvaluacion, icon: Users },
        ].map(k => (
          <Card key={k.label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><k.icon className="h-4 w-4 text-primary" /></div>
                <div><p className="text-sm text-muted-foreground">{k.label}</p><p className="text-xl font-semibold">{k.value}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grid de cards */}
      {proveedoresFiltrados.length === 0 ? (
        <div className="text-center py-12"><Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" /><h3 className="text-lg font-medium">Sin resultados</h3></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {proveedoresFiltrados.map(p => {
            const rating = calcularRating(p.evaluaciones);
            const lastCot = p.cotizaciones[0];
            return (
              <Card key={p.id} className="hover:shadow-md transition-shadow relative">
                {isLoadingIA === p.id && <div className="absolute inset-0 z-10 bg-background/60 flex items-center justify-center rounded-lg"><Skeleton className="h-full w-full absolute inset-0 rounded-lg" /><Sparkles className="h-6 w-6 text-primary animate-pulse relative z-10" /></div>}
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="pt-1">
                      <Checkbox checked={seleccionados.includes(p.id)} onCheckedChange={() => toggleSeleccion(p.id)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate">{p.razonSocial}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RUBRO_COLORS[p.rubro]}`}>{RUBRO_LABELS[p.rubro]}</span>
                        {p.enriquecidoIA && <Badge variant="outline" className="text-xs border-green-500 text-green-600">✓ IA</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{p.subrubro}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" />{p.ciudad}, {p.provincia}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-amber-500 tracking-wider">{renderStars(rating)}</span>
                        <span className="text-sm font-medium">{rating}</span>
                        <span className="text-xs text-muted-foreground">({p.evaluaciones.length})</span>
                      </div>
                      {lastCot && <p className="text-xs text-muted-foreground mt-1">Última cotización: {lastCot.moneda} {fmt(lastCot.monto)} ({lastCot.fecha})</p>}
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant={p.estado === 'activo' ? 'default' : p.estado === 'en_evaluacion' ? 'secondary' : 'outline'}>{ESTADO_LABELS[p.estado]}</Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" onClick={() => openDetalle(p)}>Ver detalle</Button>
                        <Button size="sm" variant="outline" onClick={() => handleAnalizarIA(p)} disabled={isLoadingIA === p.id}><Sparkles className="h-3 w-3 mr-1" />Analizar con IA</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* FAB mobile */}
      {seleccionados.length >= 2 && (
        <div className="fixed bottom-6 right-6 md:hidden z-40">
          <Button size="lg" className="rounded-full shadow-lg" onClick={() => { setShowComparacion(true); setIaComparacion(''); }}>
            <BarChart3 className="h-5 w-5 mr-2" />Comparar ({seleccionados.length})
          </Button>
        </div>
      )}

      {/* Sheet detalle */}
      <Sheet open={!!vistaDetalle} onOpenChange={open => { if (!open) setVistaDetalle(null); }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {vistaDetalle && (
            <>
              <SheetHeader>
                <SheetTitle>{vistaDetalle.razonSocial}</SheetTitle>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium inline-block w-fit ${RUBRO_COLORS[vistaDetalle.rubro]}`}>{RUBRO_LABELS[vistaDetalle.rubro]} — {vistaDetalle.subrubro}</span>
              </SheetHeader>
              <Tabs defaultValue="resumen" className="mt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="resumen">Resumen</TabsTrigger>
                  <TabsTrigger value="evaluaciones">Eval.</TabsTrigger>
                  <TabsTrigger value="cotizaciones">Cotiz.</TabsTrigger>
                  <TabsTrigger value="ia">IA</TabsTrigger>
                </TabsList>

                {/* Resumen */}
                <TabsContent value="resumen" className="space-y-4 mt-4">
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{vistaDetalle.telefono}</p>
                    <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{vistaDetalle.email}</p>
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />{vistaDetalle.ciudad}, {vistaDetalle.provincia}</p>
                    {vistaDetalle.cuit && <p className="text-muted-foreground">CUIT: {vistaDetalle.cuit}</p>}
                    <p className="flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" />{calcularRating(vistaDetalle.evaluaciones)}/5 ({vistaDetalle.evaluaciones.length} evaluaciones)</p>
                  </div>
                  {vistaDetalle.notas && <div><Label className="text-xs text-muted-foreground">Notas</Label><p className="text-sm mt-1">{vistaDetalle.notas}</p></div>}
                  {vistaDetalle.resumenIA && (
                    <Card className="border-green-200 dark:border-green-800">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4 text-green-600" /><span className="text-sm font-medium">Análisis IA</span></div>
                        <p className="text-sm whitespace-pre-line">{vistaDetalle.resumenIA}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Evaluaciones */}
                <TabsContent value="evaluaciones" className="space-y-4 mt-4">
                  <Button size="sm" onClick={() => setShowNuevaEval(!showNuevaEval)}><Plus className="h-3 w-3 mr-1" />Nueva evaluación</Button>
                  {showNuevaEval && (
                    <Card><CardContent className="pt-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label className="text-xs">Autor</Label><Input value={evalForm.autor} onChange={e => setEvalForm({ ...evalForm, autor: e.target.value })} /></div>
                        <div><Label className="text-xs">Obra</Label><Input value={evalForm.obraNombre} onChange={e => setEvalForm({ ...evalForm, obraNombre: e.target.value })} /></div>
                      </div>
                      {(['puntualidad', 'calidad', 'precio', 'comunicacion'] as const).map(dim => (
                        <div key={dim} className="flex items-center gap-3">
                          <Label className="text-xs capitalize w-24">{dim}</Label>
                          <Slider value={[evalForm[dim]]} onValueChange={v => setEvalForm({ ...evalForm, [dim]: v[0] })} min={1} max={5} step={1} className="flex-1" />
                          <span className="text-sm w-6 text-center">{evalForm[dim]}</span>
                        </div>
                      ))}
                      <Textarea placeholder="Comentario..." value={evalForm.comentario} onChange={e => setEvalForm({ ...evalForm, comentario: e.target.value })} />
                      <Button size="sm" onClick={agregarEvaluacion}>Guardar evaluación</Button>
                    </CardContent></Card>
                  )}
                  {vistaDetalle.evaluaciones.map(e => (
                    <Card key={e.id}>
                      <CardContent className="pt-4 pb-3 text-sm space-y-1">
                        <div className="flex justify-between"><span className="font-medium">{e.obraNombre || 'Sin obra'}</span><span className="text-xs text-muted-foreground">{e.fecha}</span></div>
                        <p className="text-xs text-muted-foreground">por {e.autor}</p>
                        <div className="grid grid-cols-4 gap-1 text-xs mt-2">
                          <span>Punt: {e.puntualidad}/5</span><span>Cal: {e.calidad}/5</span><span>Prec: {e.precio}/5</span><span>Com: {e.comunicacion}/5</span>
                        </div>
                        <p className="text-muted-foreground italic mt-1">"{e.comentario}"</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* Cotizaciones */}
                <TabsContent value="cotizaciones" className="space-y-4 mt-4">
                  <Button size="sm" onClick={() => setShowNuevaCot(!showNuevaCot)}><Plus className="h-3 w-3 mr-1" />Registrar cotización</Button>
                  {showNuevaCot && (
                    <Card><CardContent className="pt-4 space-y-3">
                      <div><Label className="text-xs">Descripción</Label><Input value={cotForm.descripcion} onChange={e => setCotForm({ ...cotForm, descripcion: e.target.value })} /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label className="text-xs">Monto</Label><Input type="number" min={0} value={cotForm.monto} onChange={e => setCotForm({ ...cotForm, monto: Number(e.target.value) })} /></div>
                        <div>
                          <Label className="text-xs">Moneda</Label>
                          <Select value={cotForm.moneda} onValueChange={v => setCotForm({ ...cotForm, moneda: v as any })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="ARS">ARS</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center gap-2"><Checkbox checked={cotForm.ganada} onCheckedChange={v => setCotForm({ ...cotForm, ganada: !!v })} /><Label className="text-xs">Ganada</Label></div>
                      <Button size="sm" onClick={agregarCotizacion}>Guardar cotización</Button>
                    </CardContent></Card>
                  )}
                  <Table>
                    <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Descripción</TableHead><TableHead className="text-right">Monto</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {vistaDetalle.cotizaciones.map(c => (
                        <TableRow key={c.id}>
                          <TableCell className="text-xs">{c.fecha}</TableCell>
                          <TableCell className="text-xs">{c.descripcion}</TableCell>
                          <TableCell className="text-right text-xs">{c.moneda} {fmt(c.monto)}</TableCell>
                          <TableCell><Badge variant={c.ganada ? 'default' : 'secondary'} className="text-xs">{c.ganada ? 'Ganada' : 'Perdida'}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                {/* IA Chat */}
                <TabsContent value="ia" className="space-y-4 mt-4">
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {chatHistory.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Preguntale a la IA sobre este proveedor...</p>}
                    {chatHistory.map((m, i) => (
                      <div key={i} className={`text-sm p-3 rounded-lg ${m.role === 'user' ? 'bg-primary/10 ml-8' : 'bg-muted mr-8'}`}>
                        <p className="whitespace-pre-line">{m.content}</p>
                      </div>
                    ))}
                    {isLoadingChat && <Skeleton className="h-16 w-full" />}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Ej: ¿Conviene contratarlo para obra grande?" value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChat()} />
                    <Button size="icon" onClick={handleChat} disabled={isLoadingChat}><MessageSquare className="h-4 w-4" /></Button>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialog comparación */}
      <Dialog open={showComparacion} onOpenChange={setShowComparacion}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Comparando {seleccionados.length} proveedores</DialogTitle></DialogHeader>
          {(() => {
            const selected = proveedores.filter(p => seleccionados.includes(p.id));
            const ratings = selected.map(p => calcularRating(p.evaluaciones));
            const dims = ['puntualidad', 'calidad', 'precio', 'comunicacion'] as const;
            const avgDim = (p: Proveedor, d: typeof dims[number]) => p.evaluaciones.length ? Math.round(p.evaluaciones.reduce((a, e) => a + e[d], 0) / p.evaluaciones.length * 10) / 10 : 0;
            const maxVal = (vals: number[]) => Math.max(...vals);

            return (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dimensión</TableHead>
                        {selected.map(p => <TableHead key={p.id} className="text-center">{p.razonSocial}</TableHead>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Rating general</TableCell>
                        {selected.map((p, i) => (
                          <TableCell key={p.id} className={`text-center ${ratings[i] === maxVal(ratings) ? 'bg-green-50 dark:bg-green-950 font-semibold' : ''}`}>
                            {renderStars(ratings[i])} {ratings[i]}
                          </TableCell>
                        ))}
                      </TableRow>
                      {dims.map(d => {
                        const vals = selected.map(p => avgDim(p, d));
                        return (
                          <TableRow key={d}>
                            <TableCell className="font-medium capitalize">{d}</TableCell>
                            {selected.map((p, i) => (
                              <TableCell key={p.id} className={`text-center ${vals[i] === maxVal(vals) ? 'bg-green-50 dark:bg-green-950 font-semibold' : ''}`}>{vals[i]}</TableCell>
                            ))}
                          </TableRow>
                        );
                      })}
                      <TableRow>
                        <TableCell className="font-medium">N° evaluaciones</TableCell>
                        {selected.map(p => <TableCell key={p.id} className="text-center">{p.evaluaciones.length}</TableCell>)}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Última cotización</TableCell>
                        {selected.map(p => {
                          const lc = p.cotizaciones[0];
                          return <TableCell key={p.id} className="text-center text-xs">{lc ? `${lc.moneda} ${fmt(lc.monto)}` : '-'}</TableCell>;
                        })}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Ciudad</TableCell>
                        {selected.map(p => <TableCell key={p.id} className="text-center">{p.ciudad}</TableCell>)}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Estado</TableCell>
                        {selected.map(p => <TableCell key={p.id} className="text-center"><Badge variant={p.estado === 'activo' ? 'default' : 'secondary'}>{ESTADO_LABELS[p.estado]}</Badge></TableCell>)}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <Button variant="outline" onClick={handleCompararIA} disabled={isLoadingComparacion} className="w-full">
                  <Sparkles className="h-4 w-4 mr-2" />{isLoadingComparacion ? 'Analizando...' : 'Que la IA recomiende'}
                </Button>
                {isLoadingComparacion && <Skeleton className="h-24 w-full" />}
                {iaComparacion && (
                  <Card className="border-green-200 dark:border-green-800"><CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4 text-green-600" /><span className="text-sm font-medium">Recomendación IA</span></div>
                    <p className="text-sm whitespace-pre-line">{iaComparacion}</p>
                  </CardContent></Card>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Dialog nuevo proveedor */}
      <Dialog open={showFormNuevo} onOpenChange={setShowFormNuevo}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nuevo Proveedor</DialogTitle></DialogHeader>
          <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Razón Social *</Label><Input value={form.razonSocial} onChange={e => setForm({ ...form, razonSocial: e.target.value })} /></div>
              <div>
                <Label className="text-xs">Rubro *</Label>
                <Select value={form.rubro} onValueChange={v => setForm({ ...form, rubro: v as RubroProveedor })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(RUBRO_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-xs">Subrubro *</Label><Input value={form.subrubro} onChange={e => setForm({ ...form, subrubro: e.target.value })} placeholder="Ej: Hormigón elaborado" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Contacto</Label><Input value={form.contacto} onChange={e => setForm({ ...form, contacto: e.target.value })} /></div>
              <div><Label className="text-xs">Teléfono</Label><Input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label className="text-xs">CUIT</Label><Input value={form.cuit} onChange={e => setForm({ ...form, cuit: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Ciudad</Label><Input value={form.ciudad} onChange={e => setForm({ ...form, ciudad: e.target.value })} /></div>
              <div><Label className="text-xs">Provincia</Label><Input value={form.provincia} onChange={e => setForm({ ...form, provincia: e.target.value })} /></div>
            </div>
            <div><Label className="text-xs">Notas</Label><Textarea value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} /></div>
            <Button onClick={handleCrear} className="w-full">Crear Proveedor</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

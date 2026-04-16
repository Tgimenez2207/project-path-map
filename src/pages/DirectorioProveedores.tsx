import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ArrowLeft, Search, Sparkles, Star, UserPlus, ExternalLink, MapPin,
  Phone, Mail, Globe, CheckCircle, AlertCircle, Bookmark, BookmarkCheck,
  Flag, Building2, Users, Filter, X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockDirectorio, calcRating } from '@/data/mockDirectorio';
import { mockObras } from '@/data/mockObras';
import type { ProveedorDirectorio, RubroDirectorio, OrigenDirectorio, ReseñaDirectorio, ReseñaGoogle } from '@/types/directorio';
import { supabase } from '@/integrations/supabase/client';

const RUBRO_LABELS: Record<string, string> = {
  electricista: 'Electricista', plomero: 'Plomero', hormigon: 'Hormigón', carpinteria: 'Carpintería',
  pintura: 'Pintura', estructura: 'Estructura', sanitaria: 'Sanitaria', gas: 'Gas',
  albanileria: 'Albañilería', impermeabilizacion: 'Impermeabilización', paisajismo: 'Paisajismo',
  ascensores: 'Ascensores', climatizacion: 'Climatización', seguridad: 'Seguridad', otro: 'Otro',
};

const avatarConfig: Record<string, { bg: string; text: string }> = {
  electricista: { bg: '#E6F1FB', text: '#0C447C' },
  plomero: { bg: '#E1F5EE', text: '#085041' },
  hormigon: { bg: '#FAEEDA', text: '#633806' },
  carpinteria: { bg: '#EEEDFE', text: '#3C3489' },
  pintura: { bg: '#FBEAF0', text: '#72243E' },
  estructura: { bg: '#FAECE7', text: '#712B13' },
  sanitaria: { bg: '#EAF3DE', text: '#27500A' },
  albanileria: { bg: '#F1EFE8', text: '#444441' },
  gas: { bg: '#FCEBEB', text: '#791F1F' },
  climatizacion: { bg: '#E6F1FB', text: '#185FA5' },
  impermeabilizacion: { bg: '#E1F5EE', text: '#085041' },
  paisajismo: { bg: '#EAF3DE', text: '#27500A' },
  ascensores: { bg: '#EEEDFE', text: '#3C3489' },
  seguridad: { bg: '#FCEBEB', text: '#791F1F' },
  otro: { bg: '#F1EFE8', text: '#5F5E5A' },
};

const renderStars = (rating: number) => {
  const full = Math.floor(rating);
  const empty = 5 - full;
  return '★'.repeat(full) + '☆'.repeat(empty);
};

const DISP_LABELS: Record<string, { label: string; color: string }> = {
  disponible: { label: 'Disponible', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  disponible_30dias: { label: 'Disponible en 30 días', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  no_disponible: { label: 'No disponible', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
};

export default function DirectorioProveedores() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const searchRef = useRef<HTMLInputElement>(null);

  const [directorio, setDirectorio] = useState<ProveedorDirectorio[]>(mockDirectorio);
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState({ rubro: 'todos', provincia: 'todas', ratingMin: 0, disponibilidad: 'todos' });
  const [tabActiva, setTabActiva] = useState<'nato' | 'ia' | 'guardados'>('nato');
  const [detalleId, setDetalleId] = useState<string | null>(null);
  const [isLoadingIA, setIsLoadingIA] = useState(false);
  const [resultadosIA, setResultadosIA] = useState<ProveedorDirectorio[]>([]);
  const [showFormReseña, setShowFormReseña] = useState(false);
  const [reseñaTarget, setReseñaTarget] = useState<ProveedorDirectorio | null>(null);
  const [showReporteModal, setShowReporteModal] = useState(false);
  const [reseñaReportada, setReseñaReportada] = useState<ReseñaDirectorio | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [reseñaForm, setReseñaForm] = useState({ puntualidad: 3, calidad: 3, precio: 3, comunicacion: 3, comentario: '', obraId: '' });

  // Filtering
  const proveedoresMostrados = useMemo(() => {
    const base = tabActiva === 'ia'
      ? resultadosIA
      : tabActiva === 'guardados'
      ? directorio.filter(p => p.guardado)
      : directorio.filter(p => p.origen === 'nato');

    return base
      .filter(p => {
        const rating = calcRating(p.reseñas);
        // Skip text filter for IA tab — AI already searched by that term
        const matchBusqueda = tabActiva === 'ia' || !busqueda ||
          p.razonSocial.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.subrubro.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.descripcion.toLowerCase().includes(busqueda.toLowerCase());
        const matchRubro = filtros.rubro === 'todos' || p.rubro === filtros.rubro;
        const matchProv = filtros.provincia === 'todas' ||
          p.provincia === filtros.provincia ||
          p.zonasCobertura.includes(filtros.provincia);
        const matchRating = rating >= filtros.ratingMin || p.reseñas.length === 0;
        const matchDisp = filtros.disponibilidad === 'todos' ||
          p.disponibilidad === filtros.disponibilidad;
        return matchBusqueda && matchRubro && matchProv && matchRating && matchDisp;
      })
      .sort((a, b) => calcRating(b.reseñas) - calcRating(a.reseñas));
  }, [directorio, resultadosIA, tabActiva, busqueda, filtros]);

  // KPIs
  const kpis = useMemo(() => {
    const all = directorio;
    return {
      total: all.length,
      verificadosConReseñas: all.filter(p => p.verificado && p.reseñas.length > 0).length,
      disponibles: all.filter(p => p.disponibilidad === 'disponible').length,
      provincias: new Set(all.map(p => p.provincia)).size,
    };
  }, [directorio]);

  const handleBuscarIA = async () => {
    if (!busqueda.trim()) return;
    setIsLoadingIA(true);
    setResultadosIA([]);
    setTabActiva('ia');
    try {
      const { data, error } = await supabase.functions.invoke('ai-directorio', {
        body: { query: busqueda },
      });
      if (error) throw error;
      const proveedores = data?.proveedores || [];
      const resultados: ProveedorDirectorio[] = proveedores.map((p: any) => ({
        id: crypto.randomUUID(),
        razonSocial: p.razonSocial || '',
        rubro: p.rubro || 'otro',
        subrubro: p.subrubro || '',
        descripcion: p.descripcion || '',
        contacto: p.contacto || '',
        telefono: p.telefono || '',
        email: p.email || '',
        web: p.web || undefined,
        ciudad: p.ciudad || '',
        provincia: p.provincia || '',
        zonasCobertura: p.zonasCobertura || [],
        cuit: p.cuit || undefined,
        verificado: false,
        disponibilidad: p.disponibilidad || 'disponible',
        origen: 'ia_web' as OrigenDirectorio,
        reseñas: [],
        yaImportado: false,
        guardado: false,
        fuenteUrl: p.fuenteUrl || p.web || undefined,
        ratingGoogle: p.ratingGoogle || undefined,
        cantidadReseñasGoogle: p.cantidadReseñasGoogle || undefined,
        reseñasGoogle: p.reseñasGoogle || [],
      }));
      setResultadosIA(resultados);
      if (!resultados.length) toast({ title: 'No se encontraron resultados. Probá con otro término.' });
    } catch {
      toast({ title: 'Error en la búsqueda. Intentá de nuevo.', variant: 'destructive' });
    } finally {
      setIsLoadingIA(false);
    }
  };

  const handleImportar = async (p: ProveedorDirectorio) => {
    try {
      const insertData: any = {
        razon_social: p.razonSocial,
        rubro: p.rubro,
        subrubro: p.subrubro || null,
        contacto: p.contacto || null,
        telefono: p.telefono || null,
        email: p.email || null,
        ciudad: p.ciudad || null,
        provincia: p.provincia || null,
        cuit: p.cuit || '00-00000000-0',
        web: p.web || null,
        activo: true,
        tipo: 'subcontratista',
      };
      const { error } = await supabase.from('proveedores').insert(insertData);
      if (error) throw error;
      setDirectorio(prev => prev.map(d => d.id === p.id ? { ...d, yaImportado: true } : d));
      setResultadosIA(prev => prev.map(d => d.id === p.id ? { ...d, yaImportado: true } : d));
      toast({ title: `${p.razonSocial} agregado a tus proveedores` });
    } catch (e: any) {
      console.error('Error importando proveedor:', e);
      toast({ title: 'Error al importar proveedor', description: e.message, variant: 'destructive' });
    }
  };

  const handleToggleGuardado = (p: ProveedorDirectorio) => {
    const update = (list: ProveedorDirectorio[]) => list.map(d => d.id === p.id ? { ...d, guardado: !d.guardado } : d);
    setDirectorio(update);
    setResultadosIA(update);
    toast({ title: p.guardado ? 'Proveedor removido de guardados' : 'Proveedor guardado' });
  };

  const handlePublicarReseña = () => {
    if (!reseñaTarget || !reseñaForm.comentario.trim()) return;
    const nuevaReseña: ReseñaDirectorio = {
      id: crypto.randomUUID(),
      autorNombre: 'Usuario NATO OBRAS',
      autorEmpresa: 'Mi empresa',
      fecha: new Date().toISOString().slice(0, 10),
      puntualidad: reseñaForm.puntualidad,
      calidad: reseñaForm.calidad,
      precio: reseñaForm.precio,
      comunicacion: reseñaForm.comunicacion,
      comentario: reseñaForm.comentario,
      obraRealizada: reseñaForm.obraId ? mockObras.find(o => o.id === reseñaForm.obraId)?.nombre : undefined,
      reportada: false,
    };
    const update = (list: ProveedorDirectorio[]) =>
      list.map(d => d.id === reseñaTarget.id ? { ...d, reseñas: [nuevaReseña, ...d.reseñas] } : d);
    setDirectorio(update);
    setResultadosIA(update);
    setShowFormReseña(false);
    setReseñaForm({ puntualidad: 3, calidad: 3, precio: 3, comunicacion: 3, comentario: '', obraId: '' });
    toast({ title: 'Reseña publicada. ¡Gracias!' });
  };

  const handleReportar = (motivo: string) => {
    if (!reseñaReportada) return;
    const update = (list: ProveedorDirectorio[]) =>
      list.map(d => ({
        ...d,
        reseñas: d.reseñas.map(r => r.id === reseñaReportada.id ? { ...r, reportada: true } : r),
      }));
    setDirectorio(update);
    setResultadosIA(update);
    setShowReporteModal(false);
    toast({ title: 'Reseña reportada. La revisaremos en 48hs.' });
  };

  const limpiarFiltros = () => setFiltros({ rubro: 'todos', provincia: 'todas', ratingMin: 0, disponibilidad: 'todos' });

  // Build grid with inline detail panels
  const buildGrid = () => {
    const items: React.ReactNode[] = [];
    for (let i = 0; i < proveedoresMostrados.length; i++) {
      const p = proveedoresMostrados[i];
      items.push(<ProveedorCard key={p.id} p={p} isOpen={detalleId === p.id} onToggle={() => setDetalleId(detalleId === p.id ? null : p.id)} onImportar={handleImportar} onGuardar={handleToggleGuardado} onReseña={(prov) => { setReseñaTarget(prov); setShowFormReseña(true); }} />);
      // Insert detail panel after row (every 2 cards on md+, or after each on mobile — handled via col-span)
      if (detalleId === p.id) {
        items.push(<DetallePanel key={`detail-${p.id}`} p={p} onImportar={handleImportar} onReseña={(prov) => { setReseñaTarget(prov); setShowFormReseña(true); }} onReportar={(r) => { setReseñaReportada(r); setShowReporteModal(true); }} navigate={navigate} />);
      }
    }
    return items;
  };

  const filtersContent = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
      <div>
        <Label className="text-xs">Rubro</Label>
        <Select value={filtros.rubro} onValueChange={v => setFiltros(p => ({ ...p, rubro: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los rubros</SelectItem>
            {Object.entries(RUBRO_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Provincia</Label>
        <Select value={filtros.provincia} onValueChange={v => setFiltros(p => ({ ...p, provincia: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todo el país</SelectItem>
            {['CABA','Buenos Aires','Córdoba','Santa Fe','Mendoza','Tucumán','Neuquén','Salta','Jujuy'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Rating mínimo</Label>
        <Select value={String(filtros.ratingMin)} onValueChange={v => setFiltros(p => ({ ...p, ratingMin: Number(v) }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Cualquier rating</SelectItem>
            <SelectItem value="4.5">★★★★★ 4.5+</SelectItem>
            <SelectItem value="4">★★★★☆ 4.0+</SelectItem>
            <SelectItem value="3">★★★☆☆ 3.0+</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Disponibilidad</Label>
        <Select value={filtros.disponibilidad} onValueChange={v => setFiltros(p => ({ ...p, disponibilidad: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Cualquier estado</SelectItem>
            <SelectItem value="disponible">Disponible ahora</SelectItem>
            <SelectItem value="disponible_30dias">Disponible en 30 días</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button variant="ghost" size="sm" onClick={limpiarFiltros}><X className="h-4 w-4 mr-1" />Limpiar</Button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/proveedores')}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h1 className="text-2xl font-semibold">Directorio nacional de proveedores</h1>
          <p className="text-sm text-muted-foreground">Encontrá proveedores y contratistas verificados en todo el país</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input ref={searchRef} placeholder="Buscar por nombre, rubro, descripción..." value={busqueda} onChange={e => setBusqueda(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBuscarIA()} className="pl-9" />
        </div>
        <Button onClick={handleBuscarIA} disabled={isLoadingIA}>
          <Sparkles className="h-4 w-4 mr-2" />{isLoadingIA ? 'Buscando...' : 'Buscar con IA'}
        </Button>
        <Button variant="outline" className="md:hidden" onClick={() => setShowFilters(true)}>
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters — desktop */}
      <div className="hidden md:block">{filtersContent}</div>

      {/* Filters — mobile sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="right"><SheetHeader><SheetTitle>Filtros</SheetTitle></SheetHeader><div className="mt-4">{filtersContent}</div></SheetContent>
      </Sheet>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {([
          { id: 'nato' as const, label: 'Base NATO OBRAS' },
          { id: 'ia' as const, label: `Resultados IA${resultadosIA.length ? ` (${resultadosIA.length})` : ''}` },
          { id: 'guardados' as const, label: `Guardados (${directorio.filter(p => p.guardado).length})` },
        ]).map(tab => (
          <button key={tab.id} onClick={() => setTabActiva(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tabActiva === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total en directorio', value: kpis.total.toLocaleString('es-AR'), icon: Building2 },
          { label: 'Con reseñas verificadas', value: kpis.verificadosConReseñas, icon: CheckCircle },
          { label: 'Disponibles ahora', value: kpis.disponibles, icon: Users },
          { label: 'Provincias cubiertas', value: kpis.provincias, icon: MapPin },
        ].map(k => (
          <Card key={k.label}><CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><k.icon className="h-4 w-4 text-primary" /></div>
              <div><p className="text-sm text-muted-foreground">{k.label}</p><p className="text-xl font-semibold">{k.value}</p></div>
            </div>
          </CardContent></Card>
        ))}
      </div>

      {/* Results */}
      {tabActiva === 'ia' && isLoadingIA && (
        <div className="text-center py-12">
          <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3 animate-pulse" />
          <p className="font-medium">Buscando proveedores en la web...</p>
          <p className="text-sm text-muted-foreground mt-1">Esto puede tardar 15-20 segundos</p>
        </div>
      )}

      {tabActiva === 'ia' && !isLoadingIA && resultadosIA.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">Usá el buscador con IA para encontrar proveedores en todo el país</p>
          <Button variant="outline" className="mt-3" onClick={() => searchRef.current?.focus()}>Ir al buscador</Button>
        </div>
      )}

      {tabActiva === 'guardados' && proveedoresMostrados.length === 0 && !isLoadingIA && (
        <div className="text-center py-12">
          <Bookmark className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No guardaste ningún proveedor todavía</p>
        </div>
      )}

      {tabActiva === 'nato' && proveedoresMostrados.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No hay proveedores que coincidan con los filtros</p>
        </div>
      )}

      {!(tabActiva === 'ia' && (isLoadingIA || resultadosIA.length === 0)) && proveedoresMostrados.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buildGrid()}
        </div>
      )}

      {/* Review dialog */}
      <Dialog open={showFormReseña} onOpenChange={setShowFormReseña}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Dejar reseña pública</DialogTitle>
            <DialogDescription>Tu reseña quedará visible para todos los usuarios de NATO OBRAS.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {(['puntualidad','calidad','precio','comunicacion'] as const).map(dim => (
              <div key={dim}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{dim}</span>
                  <span className="font-medium">{reseñaForm[dim]}/5</span>
                </div>
                <Slider min={1} max={5} step={1} value={[reseñaForm[dim]]} onValueChange={([v]) => setReseñaForm(p => ({ ...p, [dim]: v }))} />
              </div>
            ))}
            <div>
              <Label className="text-sm">Obra donde trabajaron (opcional)</Label>
              <Select value={reseñaForm.obraId} onValueChange={v => setReseñaForm(p => ({ ...p, obraId: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar obra" /></SelectTrigger>
                <SelectContent>
                  {mockObras.map(o => <SelectItem key={o.id} value={o.id}>{o.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Comentario</Label>
              <Textarea value={reseñaForm.comentario} onChange={e => setReseñaForm(p => ({ ...p, comentario: e.target.value }))} rows={4} placeholder="Contá tu experiencia..." />
            </div>
            <p className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
              ⚠️ Al publicar esta reseña aceptás que sea visible públicamente. Las reseñas falsas o abusivas pueden ser reportadas y eliminadas.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormReseña(false)}>Cancelar</Button>
            <Button onClick={handlePublicarReseña} disabled={!reseñaForm.comentario.trim()}>Publicar reseña</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report modal */}
      <Dialog open={showReporteModal} onOpenChange={setShowReporteModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reportar reseña</DialogTitle>
            <DialogDescription>¿Por qué considerás que esta reseña es inapropiada?</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {['Información falsa', 'Contenido ofensivo', 'Conflicto de interés', 'Otro'].map(motivo => (
              <Button key={motivo} variant="outline" className="w-full justify-start" onClick={() => handleReportar(motivo)}>{motivo}</Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Card component ---
function ProveedorCard({ p, isOpen, onToggle, onImportar, onGuardar, onReseña }: {
  p: ProveedorDirectorio; isOpen: boolean;
  onToggle: () => void; onImportar: (p: ProveedorDirectorio) => void;
  onGuardar: (p: ProveedorDirectorio) => void; onReseña: (p: ProveedorDirectorio) => void;
}) {
  const rating = calcRating(p.reseñas);
  const av = avatarConfig[p.rubro] || avatarConfig.otro;
  const disp = DISP_LABELS[p.disponibilidad];

  return (
    <Card className={`cursor-pointer transition-shadow hover:shadow-md ${isOpen ? 'ring-2 ring-primary' : ''}`} onClick={onToggle}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="h-11 w-11 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: av.bg, color: av.text }}>
            {p.razonSocial.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm truncate">{p.razonSocial}</h3>
              {p.verificado && (
                <Tooltip><TooltipTrigger><CheckCircle className="h-4 w-4 text-blue-500" /></TooltipTrigger>
                  <TooltipContent>Verificado por NATO OBRAS</TooltipContent></Tooltip>
              )}
              {p.origen === 'ia_web' && (
                <Tooltip><TooltipTrigger><Badge variant="outline" className="text-[10px] py-0">🔍 Web real</Badge></TooltipTrigger>
                  <TooltipContent>Encontrado en la web con Firecrawl. Datos extraídos de sitios reales.</TooltipContent></Tooltip>
              )}
              {p.origen === 'ia_web' && p.fuenteUrl && (
                <a href={p.fuenteUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                  className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                  <ExternalLink className="h-3 w-3" />Ver fuente
                </a>
              )}
              {p.yaImportado && <Badge variant="secondary" className="text-[10px] py-0">Importado</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">{p.subrubro}</p>
            <div className="flex flex-wrap gap-2 mt-2 items-center">
              <Badge variant="outline" className="text-[10px]">{RUBRO_LABELS[p.rubro] || p.rubro}</Badge>
              <Badge className={`text-[10px] ${disp.color} border-0`}>{disp.label}</Badge>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {rating > 0 && (
                <span className="text-xs">
                  <span className="text-yellow-500">{renderStars(rating)}</span>{' '}
                  <span className="font-medium">{rating}</span>{' '}
                  <span className="text-muted-foreground">({p.reseñas.length})</span>
                </span>
              )}
              {rating === 0 && <span className="text-xs text-muted-foreground">Sin reseñas</span>}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />{p.ciudad}, {p.provincia}
              {p.zonasCobertura.length > 0 && <span className="ml-1">· +{p.zonasCobertura.length} zonas</span>}
            </div>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={e => { e.stopPropagation(); onGuardar(p); }}>
              {p.guardado ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
          <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={onToggle}>
            Ver contacto
          </Button>
          {!p.yaImportado ? (
            <Button size="sm" className="flex-1 text-xs" onClick={() => onImportar(p)}>
              <UserPlus className="h-3 w-3 mr-1" />Importar
            </Button>
          ) : (
            <Button size="sm" variant="secondary" className="flex-1 text-xs" disabled>
              Ya importado
            </Button>
          )}
          <Button size="sm" variant="outline" className="text-xs" onClick={() => onReseña(p)}>
            <Star className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Detail panel ---
function DetallePanel({ p, onImportar, onReseña, onReportar, navigate }: {
  p: ProveedorDirectorio;
  onImportar: (p: ProveedorDirectorio) => void;
  onReseña: (p: ProveedorDirectorio) => void;
  onReportar: (r: ReseñaDirectorio) => void;
  navigate: (path: string) => void;
}) {
  return (
    <div className="col-span-1 md:col-span-2 bg-muted/30 rounded-lg border p-5 space-y-5 animate-fade-in">
      {/* Contact info */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        <div><p className="text-muted-foreground text-xs">Contacto</p><p className="font-medium">{p.contacto || '—'}</p></div>
        <div><p className="text-muted-foreground text-xs">Teléfono</p>
          <p className="font-medium flex items-center gap-1"><Phone className="h-3 w-3" />{p.telefono || '—'}</p></div>
        <div><p className="text-muted-foreground text-xs">Email</p>
          <p className="font-medium flex items-center gap-1"><Mail className="h-3 w-3" />{p.email || '—'}</p></div>
        <div><p className="text-muted-foreground text-xs">CUIT</p><p className="font-medium">{p.cuit || 'No informado'}</p></div>
        <div><p className="text-muted-foreground text-xs">Zonas</p><p className="font-medium">{p.zonasCobertura.join(', ') || '—'}</p></div>
        <div><p className="text-muted-foreground text-xs">Web</p>
          {p.web ? <a href={p.web} target="_blank" rel="noopener noreferrer" className="font-medium text-primary flex items-center gap-1"><Globe className="h-3 w-3" />Ver sitio</a> : <p className="font-medium">—</p>}
        </div>
      </div>

      {/* Dimension bars */}
      {p.reseñas.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Promedio por dimensión</p>
          {(['puntualidad','calidad','precio','comunicacion'] as const).map(dim => {
            const avg = p.reseñas.reduce((a, r) => a + r[dim], 0) / p.reseñas.length;
            return (
              <div key={dim} className="flex items-center gap-2 mb-1">
                <span className="text-xs capitalize w-24">{dim}</span>
                <Progress value={avg * 20} className="flex-1 h-2" />
                <span className="text-xs font-medium w-8">{avg.toFixed(1)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Reviews */}
      {p.reseñas.length > 0 ? (
        <div>
          <h4 className="text-sm font-medium mb-2">Reseñas ({p.reseñas.length})</h4>
          <div className="space-y-3">
            {p.reseñas.slice(0, 3).map(r => (
              <div key={r.id} className="bg-background rounded-lg p-3 border">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm font-medium">{r.autorNombre}</span>
                    <span className="text-xs text-muted-foreground"> · {r.autorEmpresa}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-yellow-500">{renderStars(Math.round((r.puntualidad + r.calidad + r.precio + r.comunicacion) / 4))}</span>
                    {!r.reportada && (
                      <button className="text-[10px] text-muted-foreground hover:text-destructive" onClick={() => onReportar(r)}>
                        <Flag className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
                {r.obraRealizada && <p className="text-xs text-muted-foreground mt-1">Obra: {r.obraRealizada}</p>}
                <p className="text-sm mt-1">{r.comentario}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Sin reseñas todavía.</p>
          <p className="text-xs text-muted-foreground">¿Trabajaste con ellos? Sé el primero en dejar una reseña.</p>
        </div>
      )}

      {/* Legal disclaimer */}
      <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
        ⚠️ Las reseñas son opiniones de usuarios de NATO OBRAS y no representan la posición de la plataforma. Si considerás que una reseña es incorrecta o abusiva, podés reportarla para revisión.
      </p>

      {/* Import / actions */}
      {!p.yaImportado ? (
        <div className="bg-background border rounded-lg p-3">
          <p className="text-sm text-muted-foreground mb-2">¿Querés agregar {p.razonSocial} a tus proveedores?</p>
          <Button onClick={() => onImportar(p)}><UserPlus className="h-4 w-4 mr-2" />Importar a mis proveedores</Button>
        </div>
      ) : (
        <div className="bg-background border rounded-lg p-3">
          <p className="text-sm text-muted-foreground mb-2">Ya está en tus proveedores</p>
          <Button variant="outline" onClick={() => navigate('/proveedores')}>Ver en mis proveedores</Button>
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => onReseña(p)}><Star className="h-4 w-4 mr-2" />Dejar reseña pública</Button>
        {p.web && (
          <Button variant="ghost" size="icon" onClick={() => window.open(p.web, '_blank')}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

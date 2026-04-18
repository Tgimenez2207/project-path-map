import { useState, useMemo } from 'react';
import { Plus, Search, BookOpen, MessageCircle, Pencil, Trash2, MoreHorizontal, Eye, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGremios } from '@/contexts/GremiosContext';
import BitacoraTrabajo from '@/components/gremios/BitacoraTrabajo';
import { mockPerfilGremio } from '@/data/mockGremios';
import type { TrabajoGremio, EstadoCobro, EstadoTrabajo, EntradaBitacora } from '@/types/gremios';

const fmt = (n: number) => `$${n.toLocaleString('es-AR')}`;
const isDesktop = () => typeof window !== 'undefined' && window.innerWidth >= 1280;

function diasDesde(iso?: string): number {
  if (!iso) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
}

const FILTROS: { val: 'todos' | EstadoCobro; label: string }[] = [
  { val: 'todos', label: 'Todos' },
  { val: 'pendiente', label: 'Pendientes' },
  { val: 'vencido', label: 'Vencidos' },
  { val: 'cobrado', label: 'Cobrados' },
];

const ORDEN_OPTS = [
  { val: 'fecha_desc', label: 'Más recientes' },
  { val: 'fecha_asc', label: 'Más antiguos' },
  { val: 'monto_desc', label: 'Mayor monto' },
  { val: 'monto_asc', label: 'Menor monto' },
];

function badgeFor(t: TrabajoGremio) {
  if (t.estadoCobro === 'cobrado') return { label: 'Cobrado ✓', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  if (t.estadoCobro === 'vencido') return { label: `Vencido hace ${diasDesde(t.fechaVencimientoCobro)}d`, cls: 'bg-red-100 text-red-700 border-red-200' };
  if (t.estadoCobro === 'pendiente') return { label: 'Pendiente', cls: 'bg-amber-100 text-amber-700 border-amber-200' };
  return { label: 'Cancelado', cls: 'bg-muted text-muted-foreground' };
}

function badgeTrabajo(t: TrabajoGremio) {
  if (t.estadoTrabajo === 'finalizado') return { label: 'Finalizado', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (t.estadoTrabajo === 'en_curso') return { label: 'En curso', cls: 'bg-blue-50 text-blue-700 border-blue-200' };
  if (t.estadoTrabajo === 'cancelado') return { label: 'Cancelado', cls: 'bg-muted text-muted-foreground' };
  return { label: 'Presupuestado', cls: 'bg-muted text-muted-foreground' };
}

const initialForm = {
  descripcion: '',
  cliente: '',
  direccion: '',
  monto: '',
  cobro: 'pendiente' as 'pagado' | 'pendiente' | 'fecha',
  fechaVenc: '',
  notas: '',
};

export default function GremiosTrabajo() {
  const {
    trabajos, agregarTrabajo, actualizarTrabajo, eliminarTrabajo, agregarEntradaBitacora,
  } = useGremios();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<'todos' | EstadoCobro>('todos');
  const [orden, setOrden] = useState('fecha_desc');
  const [busqueda, setBusqueda] = useState('');
  const [detalleId, setDetalleId] = useState<string | null>(null);

  const [form, setForm] = useState(initialForm);

  const lista = useMemo(() => {
    let res = trabajos.filter((t) => filtro === 'todos' || t.estadoCobro === filtro);
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      res = res.filter(
        (t) =>
          t.descripcion.toLowerCase().includes(q) ||
          t.cliente.toLowerCase().includes(q) ||
          t.direccion.toLowerCase().includes(q),
      );
    }
    res = [...res].sort((a, b) => {
      switch (orden) {
        case 'fecha_asc': return a.fecha.localeCompare(b.fecha);
        case 'monto_desc': return b.monto - a.monto;
        case 'monto_asc': return a.monto - b.monto;
        default: return b.fecha.localeCompare(a.fecha);
      }
    });
    return res;
  }, [trabajos, filtro, orden, busqueda]);

  const totales = useMemo(() => ({
    cobrado: trabajos.filter((t) => t.estadoCobro === 'cobrado').reduce((a, t) => a + t.monto, 0),
    pendiente: trabajos.filter((t) => t.estadoCobro === 'pendiente').reduce((a, t) => a + t.monto, 0),
    vencido: trabajos.filter((t) => t.estadoCobro === 'vencido').reduce((a, t) => a + t.monto, 0),
  }), [trabajos]);

  const detalle = useMemo(() => trabajos.find((t) => t.id === detalleId) ?? null, [detalleId, trabajos]);

  const abrirEditar = (t: TrabajoGremio) => {
    setEditId(t.id);
    setForm({
      descripcion: t.descripcion,
      cliente: t.cliente,
      direccion: t.direccion,
      monto: String(t.monto),
      cobro: t.estadoCobro === 'cobrado' ? 'pagado' : t.fechaVencimientoCobro ? 'fecha' : 'pendiente',
      fechaVenc: t.fechaVencimientoCobro ?? '',
      notas: t.notas ?? '',
    });
    setShowForm(true);
  };

  const cerrarForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(initialForm);
  };

  const handleGuardar = () => {
    if (!form.descripcion || !form.cliente || !form.monto) {
      toast.error('Completá descripción, cliente y monto');
      return;
    }
    const datos = {
      descripcion: form.descripcion,
      cliente: form.cliente,
      direccion: form.direccion,
      monto: Number(form.monto),
      estadoCobro: (form.cobro === 'pagado' ? 'cobrado' : 'pendiente') as EstadoCobro,
      fechaVencimientoCobro: form.cobro === 'fecha' ? form.fechaVenc : undefined,
      notas: form.notas || undefined,
    };
    if (editId) {
      actualizarTrabajo(editId, datos);
      toast.success('Trabajo actualizado');
    } else {
      agregarTrabajo({
        id: crypto.randomUUID(),
        ...datos,
        fecha: new Date().toISOString().slice(0, 10),
        estadoTrabajo: 'finalizado',
      });
      toast.success('Trabajo registrado');
    }
    cerrarForm();
  };

  const eliminar = (id: string) => {
    if (!confirm('¿Eliminar este trabajo?')) return;
    eliminarTrabajo(id);
    setDetalleId(null);
    toast.success('Trabajo eliminado');
  };

  const cambiarEstadoCobro = (id: string, est: EstadoCobro) => {
    actualizarTrabajo(id, { estadoCobro: est });
    toast.success('Estado de cobro actualizado');
  };

  const cambiarEstadoTrabajo = (id: string, est: EstadoTrabajo) => {
    actualizarTrabajo(id, { estadoTrabajo: est });
    toast.success('Estado del trabajo actualizado');
  };

  const whatsappCobro = (t: TrabajoGremio) => {
    const msg = encodeURIComponent(
      `Hola ${t.cliente}, ¿cómo va? Te paso el detalle del trabajo "${t.descripcion}" por ${fmt(t.monto)}. Quedo atento al pago. ¡Gracias!`,
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const FormFields = (
    <div className="space-y-4 mt-4">
      <div>
        <label className="text-sm text-muted-foreground">¿Qué hiciste?</label>
        <Textarea
          value={form.descripcion}
          onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
          placeholder="Ej: instalé tablero trifásico..."
          rows={2}
        />
      </div>
      <div className="grid xl:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-muted-foreground">Cliente</label>
          <Input value={form.cliente} onChange={(e) => setForm((p) => ({ ...p, cliente: e.target.value }))} placeholder="Sr./Sra. ..." />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Dirección</label>
          <Input value={form.direccion} onChange={(e) => setForm((p) => ({ ...p, direccion: e.target.value }))} placeholder="Calle, número, barrio" />
        </div>
      </div>
      <div>
        <label className="text-sm text-muted-foreground">Monto</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input type="number" value={form.monto} onChange={(e) => setForm((p) => ({ ...p, monto: e.target.value }))} className="pl-7" placeholder="85000" />
        </div>
      </div>
      <div>
        <label className="text-sm text-muted-foreground mb-2 block">¿Te pagaron?</label>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
          {[
            { val: 'pagado', label: 'Ya me pagaron ✓' },
            { val: 'pendiente', label: 'Me pagan después' },
            { val: 'fecha', label: 'Acordamos fecha' },
          ].map((opt) => (
            <button
              key={opt.val}
              onClick={() => setForm((p) => ({ ...p, cobro: opt.val as any }))}
              className={`py-3 rounded-xl text-sm border transition-colors ${
                form.cobro === opt.val ? 'bg-foreground text-background border-foreground' : 'bg-background'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      {form.cobro === 'fecha' && (
        <div>
          <label className="text-sm text-muted-foreground">Fecha de pago acordada</label>
          <Input type="date" value={form.fechaVenc} onChange={(e) => setForm((p) => ({ ...p, fechaVenc: e.target.value }))} />
        </div>
      )}
      <div>
        <label className="text-sm text-muted-foreground">Notas (opcional)</label>
        <Textarea value={form.notas} onChange={(e) => setForm((p) => ({ ...p, notas: e.target.value }))} rows={2} />
      </div>
      <Button className="w-full" size="lg" onClick={handleGuardar}>
        {editId ? 'Guardar cambios' : 'Guardar trabajo'}
      </Button>
    </div>
  );

  const DetalleBody = detalle && (
    <div className="space-y-5 mt-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold">{detalle.descripcion}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{detalle.cliente}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{detalle.direccion}</p>
        </div>
        <p className="text-xl font-bold whitespace-nowrap">{fmt(detalle.monto)}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Estado del trabajo</label>
          <Select value={detalle.estadoTrabajo} onValueChange={(v) => cambiarEstadoTrabajo(detalle.id, v as EstadoTrabajo)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="presupuestado">Presupuestado</SelectItem>
              <SelectItem value="en_curso">En curso</SelectItem>
              <SelectItem value="finalizado">Finalizado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Estado del cobro</label>
          <Select value={detalle.estadoCobro} onValueChange={(v) => cambiarEstadoCobro(detalle.id, v as EstadoCobro)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="vencido">Vencido</SelectItem>
              <SelectItem value="cobrado">Cobrado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={() => abrirEditar(detalle)}>
          <Pencil className="h-3 w-3 mr-1" /> Editar
        </Button>
        <Button
          size="sm"
          className="text-white"
          style={{ backgroundColor: '#25D366' }}
          onClick={() => whatsappCobro(detalle)}
        >
          <MessageCircle className="h-3 w-3 mr-1" /> Recordar cobro
        </Button>
      </div>

      {detalle.notas && (
        <div className="text-sm bg-muted/40 p-3 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Notas</p>
          {detalle.notas}
        </div>
      )}

      <BitacoraTrabajo
        entradas={detalle.bitacora ?? []}
        onAgregar={(e: EntradaBitacora) => agregarEntradaBitacora(detalle.id, e)}
      />

      <Button variant="ghost" size="sm" className="w-full text-red-600 hover:text-red-700" onClick={() => eliminar(detalle.id)}>
        <Trash2 className="h-3 w-3 mr-1" /> Eliminar trabajo
      </Button>
    </div>
  );

  return (
    <div className="p-4 xl:p-0 space-y-4 xl:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl xl:text-2xl font-bold">Mis trabajos</h1>
          <p className="hidden xl:block text-sm text-muted-foreground mt-1">
            Buscá, filtrá, editá estados y registrá la bitácora
          </p>
        </div>
        <Button className="hidden xl:inline-flex" onClick={() => { setEditId(null); setForm(initialForm); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Registrar trabajo
        </Button>
      </div>

      {/* KPI bar desktop */}
      <div className="hidden xl:grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total cobrado</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{fmt(totales.cobrado)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Pendiente de cobro</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{fmt(totales.pendiente)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Vencido</p>
          <p className="text-xl font-bold text-red-600 mt-1">{fmt(totales.vencido)}</p>
        </Card>
      </div>

      {/* Toolbar: búsqueda + orden */}
      <div className="flex flex-col xl:flex-row gap-2 xl:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por cliente, dirección o trabajo..."
            className="pl-9"
          />
        </div>
        <Select value={orden} onValueChange={setOrden}>
          <SelectTrigger className="xl:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ORDEN_OPTS.map((o) => <SelectItem key={o.val} value={o.val}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Filtros pills */}
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 xl:mx-0 xl:px-0 pb-1">
        {FILTROS.map((f) => (
          <button
            key={f.val}
            onClick={() => setFiltro(f.val)}
            className={`px-3 py-1.5 rounded-full text-xs xl:text-sm whitespace-nowrap border transition-colors ${
              filtro === f.val ? 'bg-foreground text-background border-foreground' : 'bg-background text-muted-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Mobile: cards */}
      <div className="xl:hidden space-y-3">
        {lista.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No hay trabajos en esta categoría.</p>
        )}
        {lista.map((t) => {
          const b = badgeFor(t);
          const color = t.estadoCobro === 'cobrado' ? 'text-emerald-600' : t.estadoCobro === 'vencido' ? 'text-red-600' : 'text-amber-600';
          const nBitacora = t.bitacora?.length ?? 0;
          return (
            <Card key={t.id} className="p-4 space-y-2 cursor-pointer" onClick={() => setDetalleId(t.id)}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium flex-1">{t.descripcion}</p>
                <p className={`text-sm font-bold whitespace-nowrap ${color}`}>{fmt(t.monto)}</p>
              </div>
              <p className="text-xs text-muted-foreground">{t.cliente}</p>
              <p className="text-xs text-muted-foreground">{t.direccion}</p>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={`text-[10px] ${b.cls}`}>{b.label}</Badge>
                  {nBitacora > 0 && (
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <BookOpen className="h-2.5 w-2.5" /> {nBitacora}
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Desktop: table */}
      <Card className="hidden xl:block overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trabajo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Trabajo</TableHead>
              <TableHead>Cobro</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                  No hay trabajos.
                </TableCell>
              </TableRow>
            )}
            {lista.map((t) => {
              const b = badgeFor(t);
              const bt = badgeTrabajo(t);
              const color = t.estadoCobro === 'cobrado' ? 'text-emerald-600' : t.estadoCobro === 'vencido' ? 'text-red-600' : 'text-amber-600';
              const nBit = t.bitacora?.length ?? 0;
              return (
                <TableRow key={t.id} className="cursor-pointer" onClick={() => setDetalleId(t.id)}>
                  <TableCell className="font-medium max-w-xs truncate">
                    <div className="flex items-center gap-2">
                      {t.descripcion}
                      {nBit > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <BookOpen className="h-3 w-3" /> {nBit}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{t.cliente}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">{t.direccion}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(t.fecha).toLocaleDateString('es-AR')}</TableCell>
                  <TableCell className={`text-right font-bold ${color}`}>{fmt(t.monto)}</TableCell>
                  <TableCell><Badge variant="outline" className={`text-xs ${bt.cls}`}>{bt.label}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className={`text-xs ${b.cls}`}>{b.label}</Badge></TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => setDetalleId(t.id)}>
                          <Eye className="h-4 w-4 mr-2" /> Ver detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => abrirEditar(t)}>
                          <Pencil className="h-4 w-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        {t.estadoCobro !== 'cobrado' && (
                          <DropdownMenuItem onClick={() => cambiarEstadoCobro(t.id, 'cobrado')}>
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Marcar cobrado
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => whatsappCobro(t)}>
                          <MessageCircle className="h-4 w-4 mr-2" /> Recordar cobro
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => eliminar(t.id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* FAB mobile */}
      <Button
        size="icon"
        className="xl:hidden fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-30"
        onClick={() => { setEditId(null); setForm(initialForm); setShowForm(true); }}
        aria-label="Registrar trabajo"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Form Sheet (mobile) */}
      <Sheet open={showForm && !isDesktop()} onOpenChange={(o) => { if (!o) cerrarForm(); }}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto rounded-t-2xl xl:hidden">
          <SheetHeader>
            <SheetTitle>{editId ? 'Editar trabajo' : 'Registrar trabajo'}</SheetTitle>
            <SheetDescription>Anotalo rápido. Después editás si querés.</SheetDescription>
          </SheetHeader>
          {FormFields}
        </SheetContent>
      </Sheet>

      {/* Form Dialog (desktop) */}
      <Dialog open={showForm && isDesktop()} onOpenChange={(o) => { if (!o) cerrarForm(); }}>
        <DialogContent className="hidden xl:block max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar trabajo' : 'Registrar trabajo'}</DialogTitle>
            <DialogDescription>Anotalo rápido. Después editás si querés.</DialogDescription>
          </DialogHeader>
          {FormFields}
        </DialogContent>
      </Dialog>

      {/* Detalle Sheet (mobile) */}
      <Sheet open={!!detalleId && !isDesktop()} onOpenChange={(o) => { if (!o) setDetalleId(null); }}>
        <SheetContent side="bottom" className="h-[92vh] overflow-y-auto rounded-t-2xl xl:hidden">
          <SheetHeader>
            <SheetTitle>Detalle del trabajo</SheetTitle>
            <SheetDescription>Estado, bitácora y acciones</SheetDescription>
          </SheetHeader>
          {DetalleBody}
        </SheetContent>
      </Sheet>

      {/* Detalle Dialog (desktop) */}
      <Dialog open={!!detalleId && isDesktop()} onOpenChange={(o) => { if (!o) setDetalleId(null); }}>
        <DialogContent className="hidden xl:block max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del trabajo</DialogTitle>
            <DialogDescription>Estado, bitácora y acciones</DialogDescription>
          </DialogHeader>
          {DetalleBody}
        </DialogContent>
      </Dialog>
    </div>
  );
}

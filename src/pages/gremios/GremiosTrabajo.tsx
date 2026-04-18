import { useState, useMemo } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockTrabajos } from '@/data/mockGremios';
import type { TrabajoGremio, EstadoCobro, EntradaBitacora } from '@/types/gremios';
import BitacoraTrabajo from '@/components/gremios/BitacoraTrabajo';

const fmt = (n: number) => `$${n.toLocaleString('es-AR')}`;

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

function badgeFor(t: TrabajoGremio) {
  if (t.estadoCobro === 'cobrado') return { label: 'Cobrado ✓', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  if (t.estadoCobro === 'vencido') return { label: `Vencido hace ${diasDesde(t.fechaVencimientoCobro)}d`, cls: 'bg-red-100 text-red-700 border-red-200' };
  if (t.estadoCobro === 'pendiente') return { label: 'Pendiente', cls: 'bg-amber-100 text-amber-700 border-amber-200' };
  return { label: 'Cancelado', cls: 'bg-muted text-muted-foreground' };
}

export default function GremiosTrabajo() {
  const [trabajos, setTrabajos] = useState<TrabajoGremio[]>(mockTrabajos);
  const [showForm, setShowForm] = useState(false);
  const [filtro, setFiltro] = useState<'todos' | EstadoCobro>('todos');
  const [detalleId, setDetalleId] = useState<string | null>(null);
  const detalle = useMemo(() => trabajos.find((t) => t.id === detalleId) ?? null, [trabajos, detalleId]);

  const agregarEntrada = (trabajoId: string, entrada: EntradaBitacora) => {
    setTrabajos((prev) =>
      prev.map((t) => (t.id === trabajoId ? { ...t, bitacora: [...(t.bitacora ?? []), entrada] } : t)),
    );
  };

  const [form, setForm] = useState({
    descripcion: '',
    cliente: '',
    direccion: '',
    monto: '',
    cobro: 'pendiente' as 'pagado' | 'pendiente' | 'fecha',
    fechaVenc: '',
    notas: '',
  });

  const lista = useMemo(
    () =>
      [...trabajos]
        .filter((t) => filtro === 'todos' || t.estadoCobro === filtro)
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [trabajos, filtro],
  );

  const totales = useMemo(() => {
    return {
      cobrado: trabajos.filter((t) => t.estadoCobro === 'cobrado').reduce((a, t) => a + t.monto, 0),
      pendiente: trabajos.filter((t) => t.estadoCobro === 'pendiente').reduce((a, t) => a + t.monto, 0),
      vencido: trabajos.filter((t) => t.estadoCobro === 'vencido').reduce((a, t) => a + t.monto, 0),
    };
  }, [trabajos]);

  const marcarCobrado = (id: string) => {
    setTrabajos((prev) => prev.map((t) => (t.id === id ? { ...t, estadoCobro: 'cobrado' } : t)));
    toast.success('¡Listo! Trabajo marcado como cobrado');
  };

  const handleGuardar = () => {
    if (!form.descripcion || !form.cliente || !form.monto) {
      toast.error('Completá descripción, cliente y monto');
      return;
    }
    const nuevo: TrabajoGremio = {
      id: crypto.randomUUID(),
      descripcion: form.descripcion,
      cliente: form.cliente,
      direccion: form.direccion,
      fecha: new Date().toISOString().slice(0, 10),
      monto: Number(form.monto),
      estadoCobro: form.cobro === 'pagado' ? 'cobrado' : 'pendiente',
      estadoTrabajo: 'finalizado',
      fechaVencimientoCobro: form.cobro === 'fecha' ? form.fechaVenc : undefined,
      notas: form.notas || undefined,
    };
    setTrabajos((prev) => [nuevo, ...prev]);
    toast.success('Trabajo registrado');
    setShowForm(false);
    setForm({ descripcion: '', cliente: '', direccion: '', monto: '', cobro: 'pendiente', fechaVenc: '', notas: '' });
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
        Guardar trabajo
      </Button>
    </div>
  );

  return (
    <div className="p-4 xl:p-0 space-y-4 xl:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl xl:text-2xl font-bold">Mis trabajos</h1>
          <p className="hidden xl:block text-sm text-muted-foreground mt-1">
            Gestioná tus trabajos y cobros desde un solo lugar
          </p>
        </div>
        <Button className="hidden xl:inline-flex" onClick={() => setShowForm(true)}>
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
          return (
            <Card key={t.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium flex-1">{t.descripcion}</p>
                <p className={`text-sm font-bold whitespace-nowrap ${color}`}>{fmt(t.monto)}</p>
              </div>
              <p className="text-xs text-muted-foreground">{t.cliente}</p>
              <p className="text-xs text-muted-foreground">{t.direccion}</p>
              <div className="flex items-center justify-between pt-1">
                <Badge variant="outline" className={`text-[10px] ${b.cls}`}>{b.label}</Badge>
                {(t.estadoCobro === 'pendiente' || t.estadoCobro === 'vencido') && (
                  <Button size="sm" variant="ghost" onClick={() => marcarCobrado(t.id)}>
                    Marcar como cobrado ✓
                  </Button>
                )}
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
              <TableHead>Estado</TableHead>
              <TableHead className="w-32"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                  No hay trabajos en esta categoría.
                </TableCell>
              </TableRow>
            )}
            {lista.map((t) => {
              const b = badgeFor(t);
              const color = t.estadoCobro === 'cobrado' ? 'text-emerald-600' : t.estadoCobro === 'vencido' ? 'text-red-600' : 'text-amber-600';
              return (
                <TableRow key={t.id}>
                  <TableCell className="font-medium max-w-xs truncate">{t.descripcion}</TableCell>
                  <TableCell>{t.cliente}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">{t.direccion}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(t.fecha).toLocaleDateString('es-AR')}</TableCell>
                  <TableCell className={`text-right font-bold ${color}`}>{fmt(t.monto)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${b.cls}`}>{b.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {(t.estadoCobro === 'pendiente' || t.estadoCobro === 'vencido') && (
                      <Button size="sm" variant="outline" onClick={() => marcarCobrado(t.id)}>
                        Cobrar ✓
                      </Button>
                    )}
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
        onClick={() => setShowForm(true)}
        aria-label="Registrar trabajo"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Mobile Sheet */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto rounded-t-2xl xl:hidden">
          <SheetHeader>
            <SheetTitle>Registrar trabajo</SheetTitle>
            <SheetDescription>Anotalo rápido. Después editás si querés.</SheetDescription>
          </SheetHeader>
          {FormFields}
        </SheetContent>
      </Sheet>

      {/* Desktop Dialog */}
      <Dialog open={showForm && typeof window !== 'undefined' && window.innerWidth >= 1280} onOpenChange={setShowForm}>
        <DialogContent className="hidden xl:block max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar trabajo</DialogTitle>
            <DialogDescription>Anotalo rápido. Después editás si querés.</DialogDescription>
          </DialogHeader>
          {FormFields}
        </DialogContent>
      </Dialog>
    </div>
  );
}

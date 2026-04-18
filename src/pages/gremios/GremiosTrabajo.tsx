import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { mockTrabajos } from '@/data/mockGremios';
import type { TrabajoGremio, EstadoCobro } from '@/types/gremios';

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

export default function GremiosTrabajo() {
  const [trabajos, setTrabajos] = useState<TrabajoGremio[]>(mockTrabajos);
  const [showForm, setShowForm] = useState(false);
  const [filtro, setFiltro] = useState<'todos' | EstadoCobro>('todos');

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
    setForm({
      descripcion: '',
      cliente: '',
      direccion: '',
      monto: '',
      cobro: 'pendiente',
      fechaVenc: '',
      notas: '',
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Mis trabajos</h1>

      {/* Filtros pills */}
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
        {FILTROS.map((f) => (
          <button
            key={f.val}
            onClick={() => setFiltro(f.val)}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-colors ${
              filtro === f.val
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-muted-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {lista.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No hay trabajos en esta categoría.</p>
        )}
        {lista.map((t) => {
          const color =
            t.estadoCobro === 'cobrado'
              ? 'text-emerald-600'
              : t.estadoCobro === 'vencido'
                ? 'text-red-600'
                : 'text-amber-600';
          const badgeLabel =
            t.estadoCobro === 'cobrado'
              ? 'Cobrado ✓'
              : t.estadoCobro === 'vencido'
                ? `Vencido hace ${diasDesde(t.fechaVencimientoCobro)}d`
                : t.estadoCobro === 'pendiente'
                  ? 'Pendiente'
                  : 'Cancelado';
          return (
            <Card key={t.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium flex-1">{t.descripcion}</p>
                <p className={`text-sm font-bold whitespace-nowrap ${color}`}>{fmt(t.monto)}</p>
              </div>
              <p className="text-xs text-muted-foreground">{t.cliente}</p>
              <p className="text-xs text-muted-foreground">{t.direccion}</p>
              <div className="flex items-center justify-between pt-1">
                <Badge variant="outline" className="text-[10px]">
                  {badgeLabel}
                </Badge>
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

      {/* FAB */}
      <Button
        size="icon"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-30"
        onClick={() => setShowForm(true)}
        aria-label="Registrar trabajo"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Sheet nuevo trabajo */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Registrar trabajo</SheetTitle>
            <SheetDescription>Anotalo rápido. Después editás si querés.</SheetDescription>
          </SheetHeader>
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
            <div>
              <label className="text-sm text-muted-foreground">Cliente</label>
              <Input
                value={form.cliente}
                onChange={(e) => setForm((p) => ({ ...p, cliente: e.target.value }))}
                placeholder="Sr./Sra. ..."
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Dirección</label>
              <Input
                value={form.direccion}
                onChange={(e) => setForm((p) => ({ ...p, direccion: e.target.value }))}
                placeholder="Calle, número, barrio"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Monto</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={form.monto}
                  onChange={(e) => setForm((p) => ({ ...p, monto: e.target.value }))}
                  className="pl-7"
                  placeholder="85000"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">¿Te pagaron?</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { val: 'pagado', label: 'Ya me pagaron ✓' },
                  { val: 'pendiente', label: 'Me pagan después' },
                  { val: 'fecha', label: 'Acordamos fecha' },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => setForm((p) => ({ ...p, cobro: opt.val as any }))}
                    className={`py-3 rounded-xl text-sm border transition-colors ${
                      form.cobro === opt.val
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background'
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
                <Input
                  type="date"
                  value={form.fechaVenc}
                  onChange={(e) => setForm((p) => ({ ...p, fechaVenc: e.target.value }))}
                />
              </div>
            )}
            <div>
              <label className="text-sm text-muted-foreground">Notas (opcional)</label>
              <Textarea
                value={form.notas}
                onChange={(e) => setForm((p) => ({ ...p, notas: e.target.value }))}
                rows={2}
              />
            </div>
            <Button className="w-full" size="lg" onClick={handleGuardar}>
              Guardar trabajo
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

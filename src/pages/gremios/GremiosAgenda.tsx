import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockTurnos } from '@/data/mockGremios';
import type { TurnoAgenda } from '@/types/gremios';

const TIPO_COLOR: Record<TurnoAgenda['tipo'], string> = {
  trabajo: 'bg-blue-500',
  presupuesto: 'bg-amber-500',
  cobro: 'bg-emerald-500',
  otro: 'bg-gray-400',
};

const today = new Date().toISOString().slice(0, 10);

function formatDia(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function GremiosAgenda() {
  const [turnos, setTurnos] = useState<TurnoAgenda[]>(mockTurnos);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    titulo: '',
    cliente: '',
    direccion: '',
    fecha: today,
    hora: '09:00',
    tipo: 'trabajo' as TurnoAgenda['tipo'],
    duracionMinutos: 60,
    notas: '',
  });

  const turnosPorDia = useMemo(() => {
    const acc: Record<string, TurnoAgenda[]> = {};
    for (const t of turnos) {
      if (!acc[t.fecha]) acc[t.fecha] = [];
      acc[t.fecha].push(t);
    }
    for (const k of Object.keys(acc)) acc[k].sort((a, b) => a.hora.localeCompare(b.hora));
    return acc;
  }, [turnos]);

  const dias = Object.keys(turnosPorDia).sort();

  const handleGuardar = () => {
    if (!form.titulo || !form.fecha) {
      toast.error('Completá título y fecha');
      return;
    }
    const nuevo: TurnoAgenda = {
      id: crypto.randomUUID(),
      titulo: form.titulo,
      cliente: form.cliente,
      direccion: form.direccion,
      fecha: form.fecha,
      hora: form.hora,
      duracionMinutos: form.duracionMinutos,
      tipo: form.tipo,
      notas: form.notas || undefined,
    };
    setTurnos((p) => [...p, nuevo]);
    toast.success('Turno agregado');
    setShowForm(false);
    setForm({
      titulo: '',
      cliente: '',
      direccion: '',
      fecha: today,
      hora: '09:00',
      tipo: 'trabajo',
      duracionMinutos: 60,
      notas: '',
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Mi agenda</h1>

      {dias.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">No hay turnos programados.</p>
      )}

      <div className="space-y-5">
        {dias.map((dia) => (
          <div key={dia}>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-sm font-semibold capitalize">{formatDia(dia)}</h2>
              {dia === today && (
                <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                  HOY
                </span>
              )}
            </div>
            <div className="space-y-2">
              {turnosPorDia[dia].map((t) => (
                <Card key={t.id} className="p-3 flex gap-3 overflow-hidden">
                  <div className={`w-1 rounded-full ${TIPO_COLOR[t.tipo]} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold">{t.hora}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{t.tipo}</p>
                    </div>
                    <p className="text-sm font-medium truncate">{t.titulo}</p>
                    {t.cliente && <p className="text-xs text-muted-foreground truncate">{t.cliente}</p>}
                    {t.direccion && <p className="text-xs text-muted-foreground truncate">{t.direccion}</p>}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button
        size="icon"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-30"
        onClick={() => setShowForm(true)}
        aria-label="Agregar turno"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Nuevo turno</SheetTitle>
            <SheetDescription>Programá una visita, trabajo o cobro.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-muted-foreground">Título</label>
              <Input
                value={form.titulo}
                onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                placeholder="Ej: instalación tablero"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Cliente</label>
              <Input
                value={form.cliente}
                onChange={(e) => setForm((p) => ({ ...p, cliente: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Dirección</label>
              <Input
                value={form.direccion}
                onChange={(e) => setForm((p) => ({ ...p, direccion: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Fecha</label>
                <Input
                  type="date"
                  value={form.fecha}
                  onChange={(e) => setForm((p) => ({ ...p, fecha: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Hora</label>
                <Input
                  type="time"
                  value={form.hora}
                  onChange={(e) => setForm((p) => ({ ...p, hora: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Tipo</label>
                <Select
                  value={form.tipo}
                  onValueChange={(v) => setForm((p) => ({ ...p, tipo: v as TurnoAgenda['tipo'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trabajo">Trabajo</SelectItem>
                    <SelectItem value="presupuesto">Presupuesto</SelectItem>
                    <SelectItem value="cobro">Cobro</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Duración</label>
                <Select
                  value={String(form.duracionMinutos)}
                  onValueChange={(v) => setForm((p) => ({ ...p, duracionMinutos: Number(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1h 30min</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Notas</label>
              <Textarea
                value={form.notas}
                onChange={(e) => setForm((p) => ({ ...p, notas: e.target.value }))}
                rows={2}
              />
            </div>
            <Button className="w-full" size="lg" onClick={handleGuardar}>
              Agregar turno
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

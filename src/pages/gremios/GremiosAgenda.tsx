import { useState, useMemo } from 'react';
import { Plus, Clock, MapPin, User, List, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGremios } from '@/contexts/GremiosContext';
import GremiosCalendario from '@/components/gremios/GremiosCalendario';
import type { TurnoAgenda } from '@/types/gremios';

const TIPO_COLOR: Record<TurnoAgenda['tipo'], string> = {
  trabajo: 'bg-blue-500',
  presupuesto: 'bg-amber-500',
  cobro: 'bg-emerald-500',
  otro: 'bg-gray-400',
};
const TIPO_BG: Record<TurnoAgenda['tipo'], string> = {
  trabajo: 'bg-blue-500/10 text-blue-700 border-blue-200',
  presupuesto: 'bg-amber-500/10 text-amber-700 border-amber-200',
  cobro: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  otro: 'bg-muted text-muted-foreground border-muted',
};

const today = new Date().toISOString().slice(0, 10);

function formatDia(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
}

const isDesktop = () => typeof window !== 'undefined' && window.innerWidth >= 1280;

export default function GremiosAgenda() {
  const { turnos, setTurnos } = useGremios();
  const [showForm, setShowForm] = useState(false);
  const [vistaDesktop, setVistaDesktop] = useState<'calendario' | 'lista'>('calendario');
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

  const moverTurno = (id: string, nuevaFecha: string) => {
    setTurnos((prev) => prev.map((t) => (t.id === id ? { ...t, fecha: nuevaFecha } : t)));
  };

  const seleccionarDia = (fecha: string) => {
    setForm((p) => ({ ...p, fecha }));
    setShowForm(true);
  };

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

  const stats = useMemo(() => {
    const semana = new Date();
    semana.setDate(semana.getDate() + 7);
    const semanaIso = semana.toISOString().slice(0, 10);
    return {
      hoy: turnos.filter((t) => t.fecha === today).length,
      semana: turnos.filter((t) => t.fecha >= today && t.fecha <= semanaIso).length,
      total: turnos.filter((t) => t.fecha >= today).length,
    };
  }, [turnos]);

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
    setForm({ titulo: '', cliente: '', direccion: '', fecha: today, hora: '09:00', tipo: 'trabajo', duracionMinutos: 60, notas: '' });
  };

  const FormBody = (
    <div className="space-y-4 mt-4">
      <div>
        <label className="text-sm text-muted-foreground">Título</label>
        <Input value={form.titulo} onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))} placeholder="Ej: instalación tablero" />
      </div>
      <div className="grid xl:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-muted-foreground">Cliente</label>
          <Input value={form.cliente} onChange={(e) => setForm((p) => ({ ...p, cliente: e.target.value }))} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Dirección</label>
          <Input value={form.direccion} onChange={(e) => setForm((p) => ({ ...p, direccion: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <div>
          <label className="text-sm text-muted-foreground">Fecha</label>
          <Input type="date" value={form.fecha} onChange={(e) => setForm((p) => ({ ...p, fecha: e.target.value }))} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Hora</label>
          <Input type="time" value={form.hora} onChange={(e) => setForm((p) => ({ ...p, hora: e.target.value }))} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Tipo</label>
          <Select value={form.tipo} onValueChange={(v) => setForm((p) => ({ ...p, tipo: v as TurnoAgenda['tipo'] }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
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
          <Select value={String(form.duracionMinutos)} onValueChange={(v) => setForm((p) => ({ ...p, duracionMinutos: Number(v) }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
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
        <Textarea value={form.notas} onChange={(e) => setForm((p) => ({ ...p, notas: e.target.value }))} rows={2} />
      </div>
      <Button className="w-full" size="lg" onClick={handleGuardar}>
        Agregar turno
      </Button>
    </div>
  );

  return (
    <div className="p-4 xl:p-0 space-y-4 xl:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl xl:text-2xl font-bold">Mi agenda</h1>
          <p className="hidden xl:block text-sm text-muted-foreground mt-1">
            Visualizá y organizá tus turnos
          </p>
        </div>
        <div className="hidden xl:flex items-center gap-2">
          <div className="flex rounded-lg border p-0.5 bg-muted/40">
            <button
              onClick={() => setVistaDesktop('calendario')}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1.5 ${
                vistaDesktop === 'calendario' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" /> Calendario
            </button>
            <button
              onClick={() => setVistaDesktop('lista')}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1.5 ${
                vistaDesktop === 'lista' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'
              }`}
            >
              <List className="h-3.5 w-3.5" /> Lista
            </button>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar turno
          </Button>
        </div>
      </div>

      {/* Vista calendario solo desktop */}
      {vistaDesktop === 'calendario' && (
        <div className="hidden xl:block">
          <GremiosCalendario turnos={turnos} onMoverTurno={moverTurno} onSelectDay={seleccionarDia} />
        </div>
      )}

      {/* KPIs desktop */}
      <div className="hidden xl:grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Turnos hoy</p>
          <p className="text-2xl font-bold mt-1">{stats.hoy}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Próximos 7 días</p>
          <p className="text-2xl font-bold text-primary mt-1">{stats.semana}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total programados</p>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </Card>
      </div>

      {dias.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">No hay turnos programados.</p>
      )}

      {/* Vista por día — mobile + desktop con grid */}
      <div className="space-y-5 xl:space-y-8">
        {dias.map((dia) => (
          <div key={dia}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm xl:text-lg font-semibold capitalize">{formatDia(dia)}</h2>
              {dia === today && (
                <span className="text-[10px] xl:text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                  HOY
                </span>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {turnosPorDia[dia].length} turno{turnosPorDia[dia].length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Mobile: lista */}
            <div className="xl:hidden space-y-2">
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

            {/* Desktop: grid de cards más ricas */}
            <div className="hidden xl:grid grid-cols-2 2xl:grid-cols-3 gap-3">
              {turnosPorDia[dia].map((t) => (
                <Card key={t.id} className="p-4 flex gap-3 hover:shadow-md transition-shadow">
                  <div className={`w-1 rounded-full ${TIPO_COLOR[t.tipo]} flex-shrink-0`} />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm font-bold">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {t.hora}
                        <span className="text-xs text-muted-foreground font-normal">
                          · {t.duracionMinutos} min
                        </span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${TIPO_BG[t.tipo]}`}>
                        {t.tipo}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{t.titulo}</p>
                    {t.cliente && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-3 w-3" /> {t.cliente}
                      </div>
                    )}
                    {t.direccion && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {t.direccion}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FAB mobile */}
      <Button
        size="icon"
        className="xl:hidden fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-30"
        onClick={() => setShowForm(true)}
        aria-label="Agregar turno"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <Sheet open={showForm && !isDesktop()} onOpenChange={setShowForm}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto rounded-t-2xl xl:hidden">
          <SheetHeader>
            <SheetTitle>Nuevo turno</SheetTitle>
            <SheetDescription>Programá una visita, trabajo o cobro.</SheetDescription>
          </SheetHeader>
          {FormBody}
        </SheetContent>
      </Sheet>

      <Dialog open={showForm && isDesktop()} onOpenChange={setShowForm}>
        <DialogContent className="hidden xl:block max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo turno</DialogTitle>
            <DialogDescription>Programá una visita, trabajo o cobro.</DialogDescription>
          </DialogHeader>
          {FormBody}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import type { TurnoAgenda } from '@/types/gremios';

const TIPO_BG: Record<TurnoAgenda['tipo'], string> = {
  trabajo: 'bg-blue-500/15 text-blue-700 border-blue-300',
  presupuesto: 'bg-amber-500/15 text-amber-700 border-amber-300',
  cobro: 'bg-emerald-500/15 text-emerald-700 border-emerald-300',
  otro: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

const TIPO_DOT: Record<TurnoAgenda['tipo'], string> = {
  trabajo: 'bg-blue-500',
  presupuesto: 'bg-amber-500',
  cobro: 'bg-emerald-500',
  otro: 'bg-gray-400',
};

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // lunes=0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfMonthGrid(d: Date): Date {
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  return startOfWeek(first);
}

interface DraggableTurnoProps {
  turno: TurnoAgenda;
  compact?: boolean;
}

function DraggableTurno({ turno, compact }: DraggableTurnoProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: turno.id,
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing rounded-md border px-1.5 py-1 text-[11px] leading-tight ${
        TIPO_BG[turno.tipo]
      } ${isDragging ? 'opacity-50' : ''} ${compact ? 'truncate' : ''}`}
      title={`${turno.hora} · ${turno.titulo}${turno.cliente ? ` — ${turno.cliente}` : ''}`}
    >
      <div className="flex items-center gap-1 font-medium">
        <span className={`h-1.5 w-1.5 rounded-full ${TIPO_DOT[turno.tipo]}`} />
        <span>{turno.hora}</span>
        <span className="truncate">{turno.titulo}</span>
      </div>
      {!compact && turno.cliente && (
        <p className="text-[10px] text-muted-foreground truncate">{turno.cliente}</p>
      )}
    </div>
  );
}

interface DayCellProps {
  date: Date;
  turnos: TurnoAgenda[];
  outOfMonth?: boolean;
  isToday?: boolean;
  onSelect?: () => void;
  height?: string;
}

function DayCell({ date, turnos, outOfMonth, isToday, onSelect, height = 'min-h-[110px]' }: DayCellProps) {
  const id = isoDate(date);
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      onClick={onSelect}
      className={`border rounded-lg p-1.5 ${height} flex flex-col gap-1 transition-colors ${
        outOfMonth ? 'bg-muted/20' : 'bg-card'
      } ${isOver ? 'ring-2 ring-primary bg-primary/5' : ''} ${onSelect ? 'cursor-pointer hover:border-primary/50' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-semibold ${
            isToday
              ? 'h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center'
              : outOfMonth
                ? 'text-muted-foreground/60'
                : 'text-foreground'
          }`}
        >
          {date.getDate()}
        </span>
        {turnos.length > 0 && (
          <span className="text-[10px] text-muted-foreground">{turnos.length}</span>
        )}
      </div>
      <div className="space-y-1 overflow-hidden">
        {turnos.slice(0, 3).map((t) => (
          <DraggableTurno key={t.id} turno={t} compact />
        ))}
        {turnos.length > 3 && (
          <p className="text-[10px] text-muted-foreground pl-1">+{turnos.length - 3} más</p>
        )}
      </div>
    </div>
  );
}

interface Props {
  turnos: TurnoAgenda[];
  onMoverTurno: (id: string, nuevaFecha: string) => void;
  onSelectDay?: (fecha: string) => void;
}

export default function GremiosCalendario({ turnos, onMoverTurno, onSelectDay }: Props) {
  const [vista, setVista] = useState<'mes' | 'semana'>('mes');
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const turnosByDay = useMemo(() => {
    const map: Record<string, TurnoAgenda[]> = {};
    for (const t of turnos) {
      if (!map[t.fecha]) map[t.fecha] = [];
      map[t.fecha].push(t);
    }
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.hora.localeCompare(b.hora)));
    return map;
  }, [turnos]);

  const dias = useMemo(() => {
    if (vista === 'semana') {
      const start = startOfWeek(cursor);
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
      });
    }
    const start = startOfMonthGrid(cursor);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor, vista]);

  const navegar = (delta: number) => {
    const d = new Date(cursor);
    if (vista === 'semana') d.setDate(d.getDate() + delta * 7);
    else d.setMonth(d.getMonth() + delta);
    setCursor(d);
  };

  const irHoy = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setCursor(d);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const id = String(active.id);
    const nuevaFecha = String(over.id);
    const turno = turnos.find((t) => t.id === id);
    if (!turno || turno.fecha === nuevaFecha) return;
    onMoverTurno(id, nuevaFecha);
    toast.success('Turno movido');
  };

  const titulo = useMemo(() => {
    if (vista === 'semana') {
      const start = startOfWeek(cursor);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const fmt = (d: Date) => d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
      return `${fmt(start)} – ${fmt(end)} ${end.getFullYear()}`;
    }
    return cursor.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  }, [cursor, vista]);

  const todayIso = isoDate(new Date());
  const mesActual = cursor.getMonth();

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navegar(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8" onClick={irHoy}>
              Hoy
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navegar(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h2 className="text-base font-semibold capitalize ml-2">{titulo}</h2>
          </div>
          <div className="flex rounded-lg border p-0.5 bg-muted/40">
            <button
              onClick={() => setVista('semana')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                vista === 'semana' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setVista('mes')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                vista === 'mes' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'
              }`}
            >
              Mes
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Arrastrá un turno a otro día para reprogramarlo.
        </p>

        <div className="grid grid-cols-7 gap-1.5">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="text-[11px] font-semibold text-muted-foreground text-center pb-1">
              {d}
            </div>
          ))}
          {dias.map((d) => {
            const iso = isoDate(d);
            const turnosDia = turnosByDay[iso] ?? [];
            const outOfMonth = vista === 'mes' && d.getMonth() !== mesActual;
            return (
              <DayCell
                key={iso}
                date={d}
                turnos={turnosDia}
                outOfMonth={outOfMonth}
                isToday={iso === todayIso}
                onSelect={onSelectDay ? () => onSelectDay(iso) : undefined}
                height={vista === 'semana' ? 'min-h-[180px]' : 'min-h-[110px]'}
              />
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 pt-2 border-t text-[11px] text-muted-foreground">
          {(['trabajo', 'presupuesto', 'cobro', 'otro'] as const).map((k) => (
            <span key={k} className="flex items-center gap-1.5 capitalize">
              <span className={`h-2 w-2 rounded-full ${TIPO_DOT[k]}`} /> {k}
            </span>
          ))}
        </div>
      </Card>
    </DndContext>
  );
}

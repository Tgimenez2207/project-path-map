import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarWidget } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Clock } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useObras } from '@/hooks/useSupabaseData';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

type EventoForm = {
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  hora_inicio: string;
  fecha_fin: string;
  hora_fin: string;
  color: string;
  obra_id: string;
};

const emptyForm: EventoForm = {
  titulo: '', descripcion: '', fecha_inicio: '', hora_inicio: '09:00',
  fecha_fin: '', hora_fin: '10:00', color: '#3b82f6', obra_id: '',
};

export default function Calendario() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<EventoForm>(emptyForm);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: obras = [] } = useObras();

  const { data: eventos = [] } = useQuery({
    queryKey: ['eventos', format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .gte('fecha_inicio', start.toISOString())
        .lte('fecha_inicio', end.toISOString())
        .order('fecha_inicio');
      if (error) throw error;
      return data || [];
    },
  });

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const getEventsForDay = (day: Date) =>
    eventos.filter(e => isSameDay(parseISO(e.fecha_inicio), day));

  const openNew = (date?: Date) => {
    const d = date || new Date();
    setEditId(null);
    setForm({ ...emptyForm, fecha_inicio: format(d, 'yyyy-MM-dd'), fecha_fin: format(d, 'yyyy-MM-dd') });
    setDialogOpen(true);
  };

  const openEdit = (e: any) => {
    const fi = parseISO(e.fecha_inicio);
    const ff = e.fecha_fin ? parseISO(e.fecha_fin) : fi;
    setEditId(e.id);
    setForm({
      titulo: e.titulo, descripcion: e.descripcion || '',
      fecha_inicio: format(fi, 'yyyy-MM-dd'), hora_inicio: format(fi, 'HH:mm'),
      fecha_fin: format(ff, 'yyyy-MM-dd'), hora_fin: format(ff, 'HH:mm'),
      color: e.color, obra_id: e.obra_id || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.titulo || !form.fecha_inicio) {
      toast({ title: 'Completá título y fecha', variant: 'destructive' }); return;
    }
    const fecha_inicio = `${form.fecha_inicio}T${form.hora_inicio}:00`;
    const fecha_fin = form.fecha_fin ? `${form.fecha_fin}T${form.hora_fin}:00` : null;
    const payload = {
      titulo: form.titulo, descripcion: form.descripcion || null,
      fecha_inicio, fecha_fin, color: form.color,
      obra_id: form.obra_id || null, user_id: user!.id,
    };
    if (editId) {
      const { error } = await supabase.from('eventos').update(payload).eq('id', editId);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Evento actualizado' });
    } else {
      const { error } = await supabase.from('eventos').insert(payload);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Evento creado' });
    }
    queryClient.invalidateQueries({ queryKey: ['eventos'] });
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este evento?')) return;
    const { error } = await supabase.from('eventos').delete().eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Evento eliminado' });
    queryClient.invalidateQueries({ queryKey: ['eventos'] });
    setSelectedDate(null);
  };

  const selectedEvents = selectedDate ? getEventsForDay(selectedDate) : [];
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Calendario</h1>
          <p className="text-muted-foreground">Agenda y eventos</p>
        </div>
        <Button onClick={() => openNew()}><Plus className="h-4 w-4 mr-2" />Nuevo Evento</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(m => subMonths(m, 1))}><ChevronLeft className="h-5 w-5" /></Button>
              <h2 className="text-lg font-semibold capitalize">{format(currentMonth, 'MMMM yyyy', { locale: es })}</h2>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(m => addMonths(m, 1))}><ChevronRight className="h-5 w-5" /></Button>
            </div>
            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
              {weekDays.map(d => (
                <div key={d} className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
              ))}
              {days.map((day, i) => {
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedDate(day)}
                    className={`bg-background p-1 min-h-[80px] cursor-pointer transition-colors hover:bg-accent/50 ${!isCurrentMonth ? 'opacity-40' : ''} ${isSelected ? 'ring-2 ring-primary ring-inset' : ''}`}
                  >
                    <span className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${isToday ? 'bg-primary text-primary-foreground' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    <div className="space-y-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map(e => (
                        <div key={e.id} className="text-[10px] px-1 py-0.5 rounded truncate text-white" style={{ backgroundColor: e.color }}>
                          {e.titulo}
                        </div>
                      ))}
                      {dayEvents.length > 3 && <div className="text-[10px] text-muted-foreground pl-1">+{dayEvents.length - 3} más</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Day detail sidebar */}
        <Card>
          <CardContent className="pt-6">
            {selectedDate ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold capitalize">{format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}</h3>
                  <Button variant="outline" size="sm" onClick={() => openNew(selectedDate)}><Plus className="h-3 w-3 mr-1" />Agregar</Button>
                </div>
                {selectedEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin eventos para este día.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedEvents.map(e => (
                      <div key={e.id} className="p-3 rounded-lg border" style={{ borderLeftWidth: 4, borderLeftColor: e.color }}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-sm">{e.titulo}</h4>
                            {e.descripcion && <p className="text-xs text-muted-foreground mt-1">{e.descripcion}</p>}
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {format(parseISO(e.fecha_inicio), 'HH:mm')}
                              {e.fecha_fin && ` - ${format(parseISO(e.fecha_fin), 'HH:mm')}`}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(e)}><Pencil className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(e.id)}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Seleccioná un día para ver sus eventos.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? 'Editar Evento' : 'Nuevo Evento'}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div><Label>Título *</Label><Input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} /></div>
            <div><Label>Descripción</Label><Textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Fecha inicio *</Label><Input type="date" value={form.fecha_inicio} onChange={e => setForm({...form, fecha_inicio: e.target.value})} /></div>
              <div><Label>Hora inicio</Label><Input type="time" value={form.hora_inicio} onChange={e => setForm({...form, hora_inicio: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Fecha fin</Label><Input type="date" value={form.fecha_fin} onChange={e => setForm({...form, fecha_fin: e.target.value})} /></div>
              <div><Label>Hora fin</Label><Input type="time" value={form.hora_fin} onChange={e => setForm({...form, hora_fin: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-1">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setForm({...form, color: c})}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${form.color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div>
                <Label>Obra (opcional)</Label>
                <Select value={form.obra_id} onValueChange={v => setForm({...form, obra_id: v === 'none' ? '' : v})}>
                  <SelectTrigger><SelectValue placeholder="Sin obra" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin obra</SelectItem>
                    {obras.map(o => <SelectItem key={o.id} value={o.id}>{o.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSave} className="w-full">{editId ? 'Guardar Cambios' : 'Crear Evento'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { StickyNote, Plus, Search, Pin, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO } from 'date-fns';

const NOTE_COLORS = [
  { value: '#fbbf24', label: 'Amarillo' },
  { value: '#34d399', label: 'Verde' },
  { value: '#60a5fa', label: 'Azul' },
  { value: '#f87171', label: 'Rojo' },
  { value: '#a78bfa', label: 'Violeta' },
  { value: '#fb923c', label: 'Naranja' },
];

type NotaForm = {
  titulo: string;
  contenido: string;
  color: string;
  prioridad: string;
  fijada: boolean;
};

const emptyForm: NotaForm = {
  titulo: '', contenido: '', color: '#fbbf24', prioridad: 'media', fijada: false,
};

export default function Notas() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<NotaForm>(emptyForm);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: notas = [], isLoading } = useQuery({
    queryKey: ['notas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notas')
        .select('*')
        .order('fijada', { ascending: false })
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = notas.filter(n =>
    n.titulo.toLowerCase().includes(search.toLowerCase()) ||
    (n.contenido && n.contenido.toLowerCase().includes(search.toLowerCase()))
  );

  const openNew = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (n: any) => {
    setEditId(n.id);
    setForm({
      titulo: n.titulo, contenido: n.contenido || '',
      color: n.color, prioridad: n.prioridad, fijada: n.fijada,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.titulo) {
      toast({ title: 'El título es obligatorio', variant: 'destructive' }); return;
    }
    const payload = { ...form, contenido: form.contenido || null, user_id: user!.id };
    if (editId) {
      const { error } = await supabase.from('notas').update(payload).eq('id', editId);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Nota actualizada' });
    } else {
      const { error } = await supabase.from('notas').insert(payload);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Nota creada' });
    }
    queryClient.invalidateQueries({ queryKey: ['notas'] });
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta nota?')) return;
    const { error } = await supabase.from('notas').delete().eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Nota eliminada' });
    queryClient.invalidateQueries({ queryKey: ['notas'] });
  };

  const togglePin = async (n: any) => {
    await supabase.from('notas').update({ fijada: !n.fijada }).eq('id', n.id);
    queryClient.invalidateQueries({ queryKey: ['notas'] });
  };

  const prioridadBadge = (p: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      alta: { label: 'Alta', variant: 'destructive' },
      media: { label: 'Media', variant: 'secondary' },
      baja: { label: 'Baja', variant: 'default' },
    };
    return map[p] || map.media;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notas</h1>
          <p className="text-muted-foreground">Notas y recordatorios ({notas.length} total)</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Nueva Nota</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar notas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <StickyNote className="empty-state-icon" />
          <h3 className="empty-state-title">{notas.length === 0 ? 'Sin notas' : 'Sin resultados'}</h3>
          <p className="empty-state-description">{notas.length === 0 ? 'Creá tu primera nota para empezar.' : 'Probá con otro término de búsqueda.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(n => {
            const pb = prioridadBadge(n.prioridad);
            return (
              <Card key={n.id} className="group relative overflow-hidden hover:shadow-md transition-shadow" style={{ borderTopWidth: 4, borderTopColor: n.color }}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {n.fijada && <Pin className="h-3 w-3 text-muted-foreground shrink-0" />}
                      <h3 className="font-medium text-sm truncate">{n.titulo}</h3>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => togglePin(n)}>
                          <Pin className="h-4 w-4 mr-2" />{n.fijada ? 'Desfijar' : 'Fijar'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(n)}><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(n.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Eliminar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {n.contenido && (
                    <p className="text-xs text-muted-foreground line-clamp-4 mb-3">{n.contenido}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge variant={pb.variant} className="text-[10px]">{pb.label}</Badge>
                    <span className="text-[10px] text-muted-foreground">{format(parseISO(n.updated_at), 'dd/MM/yy HH:mm')}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? 'Editar Nota' : 'Nueva Nota'}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div><Label>Título *</Label><Input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} /></div>
            <div><Label>Contenido</Label><Textarea value={form.contenido} onChange={e => setForm({...form, contenido: e.target.value})} rows={5} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-1">
                  {NOTE_COLORS.map(c => (
                    <button key={c.value} onClick={() => setForm({...form, color: c.value})}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${form.color === c.value ? 'border-foreground scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c.value }} title={c.label} />
                  ))}
                </div>
              </div>
              <div>
                <Label>Prioridad</Label>
                <Select value={form.prioridad} onValueChange={v => setForm({...form, prioridad: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.fijada} onCheckedChange={v => setForm({...form, fijada: v})} />
              <Label>Fijar nota</Label>
            </div>
            <Button onClick={handleSave} className="w-full">{editId ? 'Guardar Cambios' : 'Crear Nota'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

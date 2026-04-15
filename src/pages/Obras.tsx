import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Building2, Plus, Search, MapPin, Calendar, MoreVertical, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useObras, useUnidades } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type EstadoObra = Database['public']['Enums']['estado_obra'];
type Moneda = Database['public']['Enums']['moneda'];

const estadoLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  planificacion: { label: 'Planificación', variant: 'secondary' },
  en_curso: { label: 'En curso', variant: 'default' },
  pausada: { label: 'Pausada', variant: 'outline' },
  finalizada: { label: 'Finalizada', variant: 'secondary' },
  cancelada: { label: 'Cancelada', variant: 'destructive' },
};

interface ObraForm {
  nombre: string;
  direccion: string;
  ciudad: string;
  fecha_inicio: string;
  fecha_fin_estimada: string;
  descripcion: string;
  estado: EstadoObra;
  moneda: Moneda;
  presupuesto_total: string;
}

const emptyForm: ObraForm = {
  nombre: '', direccion: '', ciudad: '', fecha_inicio: '', fecha_fin_estimada: '',
  descripcion: '', estado: 'planificacion', moneda: 'USD', presupuesto_total: '',
};

export default function Obras() {
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ObraForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const { data: obras = [], isLoading } = useObras();
  const { data: unidades = [] } = useUnidades();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const filteredObras = obras.filter((obra) => {
    const matchesSearch = obra.nombre.toLowerCase().includes(search.toLowerCase()) ||
      obra.direccion.toLowerCase().includes(search.toLowerCase());
    const matchesEstado = estadoFilter === 'todos' || obra.estado === estadoFilter;
    return matchesSearch && matchesEstado;
  });

  const getUnidadesCount = (obraId: string) => unidades.filter((u) => u.obra_id === obraId).length;

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (obra: any) => {
    setEditingId(obra.id);
    setForm({
      nombre: obra.nombre,
      direccion: obra.direccion,
      ciudad: obra.ciudad,
      fecha_inicio: obra.fecha_inicio,
      fecha_fin_estimada: obra.fecha_fin_estimada || '',
      descripcion: obra.descripcion || '',
      estado: obra.estado,
      moneda: obra.moneda,
      presupuesto_total: obra.presupuesto_total ? String(obra.presupuesto_total) : '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre || !form.direccion || !form.ciudad || !form.fecha_inicio) {
      toast({ title: 'Error', description: 'Completá los campos obligatorios.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload = {
      nombre: form.nombre,
      direccion: form.direccion,
      ciudad: form.ciudad,
      fecha_inicio: form.fecha_inicio,
      fecha_fin_estimada: form.fecha_fin_estimada || null,
      descripcion: form.descripcion || null,
      estado: form.estado,
      moneda: form.moneda,
      presupuesto_total: form.presupuesto_total ? Number(form.presupuesto_total) : null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('obras').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('obras').insert(payload));
    }

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: editingId ? 'Actualizada' : 'Creada', description: `Obra "${form.nombre}" guardada.` });
      queryClient.invalidateQueries({ queryKey: ['obras'] });
      setDialogOpen(false);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, nombre: string) => {
    const { error } = await supabase.from('obras').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Eliminada', description: `Obra "${nombre}" eliminada.` });
      queryClient.invalidateQueries({ queryKey: ['obras'] });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Obras</h1>
          <p className="text-muted-foreground">Gestión de proyectos y obras en curso</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Nueva Obra</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar obras..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={estadoFilter} onValueChange={setEstadoFilter}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="planificacion">Planificación</SelectItem>
            <SelectItem value="en_curso">En curso</SelectItem>
            <SelectItem value="pausada">Pausada</SelectItem>
            <SelectItem value="finalizada">Finalizada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredObras.length === 0 ? (
        <div className="empty-state">
          <Building2 className="empty-state-icon" />
          <h3 className="empty-state-title">No hay obras</h3>
          <p className="empty-state-description">No se encontraron obras con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredObras.map((obra) => (
            <Card key={obra.id} className="hover:shadow-md transition-shadow h-full relative group">
              <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => e.preventDefault()}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.preventDefault(); openEdit(obra); }}>
                      <Pencil className="h-4 w-4 mr-2" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={(e) => { e.preventDefault(); handleDelete(obra.id, obra.nombre); }}>
                      <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Link to={`/obras/${obra.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant={estadoLabels[obra.estado]?.variant || 'secondary'}>
                      {estadoLabels[obra.estado]?.label || obra.estado}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-3">{obra.nombre}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /><span>{obra.direccion}, {obra.ciudad}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" /><span>Inicio: {new Date(obra.fecha_inicio).toLocaleDateString('es-AR')}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avance</span>
                      <span className="font-medium">{obra.progreso}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${obra.progreso}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Unidades: </span>
                      <span className="font-medium">{getUnidadesCount(obra.id)}</span>
                    </div>
                    {obra.presupuesto_total && (
                      <div className="text-sm">
                        <span className="font-medium">{obra.moneda} {Number(obra.presupuesto_total).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Obra' : 'Nueva Obra'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Nombre del proyecto *</Label>
              <Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Torre Mirador" />
            </div>
            <div className="grid gap-2">
              <Label>Dirección *</Label>
              <Input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} placeholder="Ej: Av. del Libertador 4500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Ciudad *</Label>
                <Input value={form.ciudad} onChange={e => setForm({ ...form, ciudad: e.target.value })} placeholder="Ej: Buenos Aires" />
              </div>
              <div className="grid gap-2">
                <Label>Estado</Label>
                <Select value={form.estado} onValueChange={(v: EstadoObra) => setForm({ ...form, estado: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planificacion">Planificación</SelectItem>
                    <SelectItem value="en_curso">En curso</SelectItem>
                    <SelectItem value="pausada">Pausada</SelectItem>
                    <SelectItem value="finalizada">Finalizada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Fecha inicio *</Label>
                <Input type="date" value={form.fecha_inicio} onChange={e => setForm({ ...form, fecha_inicio: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Fecha fin estimada</Label>
                <Input type="date" value={form.fecha_fin_estimada} onChange={e => setForm({ ...form, fecha_fin_estimada: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Presupuesto</Label>
                <Input type="number" value={form.presupuesto_total} onChange={e => setForm({ ...form, presupuesto_total: e.target.value })} placeholder="0" />
              </div>
              <div className="grid gap-2">
                <Label>Moneda</Label>
                <Select value={form.moneda} onValueChange={(v: Moneda) => setForm({ ...form, moneda: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="ARS">ARS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Descripción</Label>
              <Textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción del proyecto..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</> : editingId ? 'Guardar Cambios' : 'Crear Obra'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

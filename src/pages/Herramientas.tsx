import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Wrench, Search, Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useHerramientas } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Constants } from '@/integrations/supabase/types';

const estadoHerramienta: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  disponible: { label: 'Disponible', variant: 'default' },
  en_uso: { label: 'En uso', variant: 'secondary' },
  mantenimiento: { label: 'Mantenimiento', variant: 'outline' },
  baja: { label: 'Baja', variant: 'destructive' },
};

type HerramientaForm = {
  nombre: string;
  codigo: string;
  categoria: string;
  estado: 'disponible' | 'en_uso' | 'mantenimiento' | 'baja';
  ubicacion_actual: string;
  asignado_a: string;
  fecha_compra: string;
  valor_compra: number | '';
};

const emptyForm: HerramientaForm = {
  nombre: '', codigo: '', categoria: '', estado: 'disponible',
  ubicacion_actual: '', asignado_a: '', fecha_compra: '', valor_compra: '',
};

export default function Herramientas() {
  const [search, setSearch] = useState('');
  const { data: herramientas = [], isLoading } = useHerramientas();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<HerramientaForm>(emptyForm);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const openNew = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (h: any) => {
    setEditId(h.id);
    setForm({
      nombre: h.nombre, codigo: h.codigo, categoria: h.categoria, estado: h.estado,
      ubicacion_actual: h.ubicacion_actual, asignado_a: h.asignado_a || '',
      fecha_compra: h.fecha_compra || '', valor_compra: h.valor_compra != null ? Number(h.valor_compra) : '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre || !form.codigo || !form.categoria || !form.ubicacion_actual) {
      toast({ title: 'Completá los campos obligatorios', variant: 'destructive' }); return;
    }
    const payload = {
      nombre: form.nombre, codigo: form.codigo, categoria: form.categoria,
      estado: form.estado, ubicacion_actual: form.ubicacion_actual,
      asignado_a: form.asignado_a || null,
      fecha_compra: form.fecha_compra || null,
      valor_compra: form.valor_compra !== '' ? Number(form.valor_compra) : null,
    };
    if (editId) {
      const { error } = await supabase.from('herramientas').update(payload).eq('id', editId);
      if (error) { toast({ title: 'Error al actualizar', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Herramienta actualizada' });
    } else {
      const { error } = await supabase.from('herramientas').insert(payload);
      if (error) { toast({ title: 'Error al crear', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Herramienta creada' });
    }
    queryClient.invalidateQueries({ queryKey: ['herramientas'] });
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta herramienta?')) return;
    const { error } = await supabase.from('herramientas').delete().eq('id', id);
    if (error) { toast({ title: 'Error al eliminar', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Herramienta eliminada' });
    queryClient.invalidateQueries({ queryKey: ['herramientas'] });
  };

  const filtered = herramientas.filter(h =>
    h.nombre.toLowerCase().includes(search.toLowerCase()) ||
    h.codigo.toLowerCase().includes(search.toLowerCase()) ||
    h.categoria.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Herramientas</h1>
          <p className="text-muted-foreground">Control de herramientas y equipos ({herramientas.length} total)</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Nueva Herramienta</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nombre, código o categoría..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Asignado a</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(h => (
                <TableRow key={h.id}>
                  <TableCell className="font-mono text-xs">{h.codigo}</TableCell>
                  <TableCell className="font-medium">{h.nombre}</TableCell>
                  <TableCell className="text-muted-foreground">{h.categoria}</TableCell>
                  <TableCell className="text-sm">{h.ubicacion_actual}</TableCell>
                  <TableCell className="text-sm">{h.asignado_a || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={estadoHerramienta[h.estado]?.variant || 'secondary'}>
                      {estadoHerramienta[h.estado]?.label || h.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(h)}><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(h.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Eliminar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? 'Editar Herramienta' : 'Nueva Herramienta'}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Nombre *</Label><Input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} /></div>
              <div><Label>Código *</Label><Input value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Categoría *</Label><Input value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} /></div>
              <div>
                <Label>Estado</Label>
                <Select value={form.estado} onValueChange={v => setForm({...form, estado: v as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Constants.public.Enums.estado_herramienta.map(e => (
                      <SelectItem key={e} value={e}>{estadoHerramienta[e]?.label || e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Ubicación actual *</Label><Input value={form.ubicacion_actual} onChange={e => setForm({...form, ubicacion_actual: e.target.value})} /></div>
              <div><Label>Asignado a</Label><Input value={form.asignado_a} onChange={e => setForm({...form, asignado_a: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Fecha de compra</Label><Input type="date" value={form.fecha_compra} onChange={e => setForm({...form, fecha_compra: e.target.value})} /></div>
              <div><Label>Valor de compra</Label><Input type="number" value={form.valor_compra} onChange={e => setForm({...form, valor_compra: e.target.value ? Number(e.target.value) : ''})} /></div>
            </div>
            <Button onClick={handleSave} className="w-full">{editId ? 'Guardar Cambios' : 'Crear Herramienta'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

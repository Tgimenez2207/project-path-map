import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Plus, MoreHorizontal, Pencil, Eye, ArrowRightLeft, Trash2, Loader2 } from 'lucide-react';
import { usePresupuestos, useObras, useProveedores } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type EstadoPresupuesto = Database['public']['Enums']['estado_presupuesto'];
type Moneda = Database['public']['Enums']['moneda'];

const estadoConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  borrador: { label: 'Borrador', variant: 'outline' },
  pendiente: { label: 'Pendiente', variant: 'secondary' },
  aprobado: { label: 'Aprobado', variant: 'default' },
  rechazado: { label: 'Rechazado', variant: 'destructive' },
  finalizado: { label: 'Finalizado', variant: 'secondary' },
};

const estadoTransitions: Record<string, EstadoPresupuesto[]> = {
  borrador: ['pendiente'],
  pendiente: ['aprobado', 'rechazado'],
  aprobado: ['finalizado'],
  rechazado: ['borrador'],
  finalizado: [],
};

interface PresupuestoForm {
  numero: string;
  descripcion: string;
  obra_id: string;
  proveedor_id: string;
  monto_total: string;
  moneda: Moneda;
  fecha_validez: string;
}

const emptyForm: PresupuestoForm = {
  numero: '',
  descripcion: '',
  obra_id: '',
  proveedor_id: '',
  monto_total: '',
  moneda: 'USD',
  fecha_validez: '',
};

export default function Presupuestos() {
  const [search, setSearch] = useState('');
  const { data: presupuestos = [], isLoading } = usePresupuestos();
  const { data: obras = [] } = useObras();
  const { data: proveedores = [] } = useProveedores();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialog, setViewDialog] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PresupuestoForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = presupuestos.filter(p =>
    p.numero.toLowerCase().includes(search.toLowerCase()) ||
    p.descripcion.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      numero: p.numero,
      descripcion: p.descripcion,
      obra_id: p.obra_id || '',
      proveedor_id: p.proveedor_id || '',
      monto_total: String(p.monto_total),
      moneda: p.moneda,
      fecha_validez: p.fecha_validez || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.numero || !form.descripcion || !form.monto_total) {
      toast({ title: 'Error', description: 'Completá los campos obligatorios.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload = {
      numero: form.numero,
      descripcion: form.descripcion,
      obra_id: form.obra_id || null,
      proveedor_id: form.proveedor_id || null,
      monto_total: Number(form.monto_total),
      moneda: form.moneda,
      fecha_validez: form.fecha_validez || null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('presupuestos').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('presupuestos').insert(payload));
    }

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: editingId ? 'Actualizado' : 'Creado', description: `Presupuesto ${form.numero} guardado.` });
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
      setDialogOpen(false);
    }
    setSaving(false);
  };

  const handleChangeEstado = async (id: string, nuevoEstado: EstadoPresupuesto) => {
    const { error } = await supabase.from('presupuestos').update({ estado: nuevoEstado }).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Estado actualizado', description: `Presupuesto cambiado a "${estadoConfig[nuevoEstado]?.label}".` });
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('presupuestos').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Eliminado', description: 'Presupuesto eliminado.' });
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
    }
  };

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
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Nuevo Presupuesto
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por número o descripción..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Obra</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No hay presupuestos. Creá uno nuevo para empezar.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map(p => {
                const transitions = estadoTransitions[p.estado] || [];
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.numero}</TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{p.descripcion}</TableCell>
                    <TableCell className="text-sm">{(p as any).obras?.nombre || '-'}</TableCell>
                    <TableCell className="text-sm">{(p as any).proveedores?.razon_social || '-'}</TableCell>
                    <TableCell className="text-right font-medium">{p.moneda} {Number(p.monto_total).toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{new Date(p.fecha_creacion).toLocaleDateString('es-AR')}</TableCell>
                    <TableCell>
                      <Badge variant={estadoConfig[p.estado]?.variant || 'secondary'}>
                        {estadoConfig[p.estado]?.label || p.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewDialog(p)}>
                            <Eye className="h-4 w-4 mr-2" /> Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(p)}>
                            <Pencil className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          {transitions.map(next => (
                            <DropdownMenuItem key={next} onClick={() => handleChangeEstado(p.id, next)}>
                              <ArrowRightLeft className="h-4 w-4 mr-2" /> Cambiar a {estadoConfig[next]?.label}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(p.id)}>
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
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número *</Label>
                <Input value={form.numero} onChange={e => setForm({ ...form, numero: e.target.value })} placeholder="PRES-001" />
              </div>
              <div className="space-y-2">
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
            <div className="space-y-2">
              <Label>Descripción *</Label>
              <Textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción del presupuesto..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monto Total *</Label>
                <Input type="number" value={form.monto_total} onChange={e => setForm({ ...form, monto_total: e.target.value })} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Fecha Validez</Label>
                <Input type="date" value={form.fecha_validez} onChange={e => setForm({ ...form, fecha_validez: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Obra</Label>
                <Select value={form.obra_id} onValueChange={v => setForm({ ...form, obra_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {obras.map(o => (
                      <SelectItem key={o.id} value={o.id}>{o.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Proveedor</Label>
                <Select value={form.proveedor_id} onValueChange={v => setForm({ ...form, proveedor_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {proveedores.map(pr => (
                      <SelectItem key={pr.id} value={pr.id}>{pr.razon_social}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</> : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog open={!!viewDialog} onOpenChange={() => setViewDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Presupuesto {viewDialog?.numero}</DialogTitle>
          </DialogHeader>
          {viewDialog && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado</span>
                <Badge variant={estadoConfig[viewDialog.estado]?.variant}>{estadoConfig[viewDialog.estado]?.label}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monto</span>
                <span className="font-medium">{viewDialog.moneda} {Number(viewDialog.monto_total).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Obra</span>
                <span>{(viewDialog as any).obras?.nombre || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Proveedor</span>
                <span>{(viewDialog as any).proveedores?.razon_social || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha Creación</span>
                <span>{new Date(viewDialog.fecha_creacion).toLocaleDateString('es-AR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Validez</span>
                <span>{viewDialog.fecha_validez ? new Date(viewDialog.fecha_validez).toLocaleDateString('es-AR') : '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Descripción</span>
                <p className="mt-1">{viewDialog.descripcion}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

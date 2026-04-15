import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Truck, Search, Mail, Phone, Wrench, Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useProveedores } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Constants } from '@/integrations/supabase/types';

type ProveedorForm = {
  razon_social: string;
  cuit: string;
  rubro: string;
  tipo: 'proveedor' | 'contratista';
  email: string;
  telefono: string;
  direccion: string;
  activo: boolean;
};

const emptyForm: ProveedorForm = {
  razon_social: '', cuit: '', rubro: '', tipo: 'proveedor',
  email: '', telefono: '', direccion: '', activo: true,
};

export default function Proveedores() {
  const [search, setSearch] = useState('');
  const { data: proveedores = [], isLoading } = useProveedores();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProveedorForm>(emptyForm);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const openNew = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (p: any) => {
    setEditId(p.id);
    setForm({
      razon_social: p.razon_social, cuit: p.cuit, rubro: p.rubro, tipo: p.tipo,
      email: p.email || '', telefono: p.telefono || '', direccion: p.direccion || '', activo: p.activo,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.razon_social || !form.cuit || !form.rubro) {
      toast({ title: 'Completá los campos obligatorios', variant: 'destructive' }); return;
    }
    const payload = { ...form, email: form.email || null, telefono: form.telefono || null, direccion: form.direccion || null };
    if (editId) {
      const { error } = await supabase.from('proveedores').update(payload).eq('id', editId);
      if (error) { toast({ title: 'Error al actualizar', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Proveedor actualizado' });
    } else {
      const { error } = await supabase.from('proveedores').insert(payload);
      if (error) { toast({ title: 'Error al crear', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Proveedor creado' });
    }
    queryClient.invalidateQueries({ queryKey: ['proveedores'] });
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este proveedor?')) return;
    const { error } = await supabase.from('proveedores').delete().eq('id', id);
    if (error) { toast({ title: 'Error al eliminar', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Proveedor eliminado' });
    queryClient.invalidateQueries({ queryKey: ['proveedores'] });
  };

  const filterByType = (tipo: string) =>
    proveedores.filter(p => p.tipo === tipo && (
      p.razon_social.toLowerCase().includes(search.toLowerCase()) ||
      p.rubro.toLowerCase().includes(search.toLowerCase())
    ));

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
      </div>
    );
  }

  const renderList = (items: typeof proveedores) => items.length === 0 ? (
    <div className="empty-state"><Truck className="empty-state-icon" /><h3 className="empty-state-title">Sin resultados</h3></div>
  ) : (
    <div className="space-y-3">
      {items.map(p => (
        <Card key={p.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {p.tipo === 'contratista' ? <Wrench className="h-5 w-5 text-primary" /> : <Truck className="h-5 w-5 text-primary" />}
                </div>
                <div>
                  <h3 className="font-medium">{p.razon_social}</h3>
                  <p className="text-sm text-muted-foreground">{p.rubro} • CUIT: {p.cuit}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={p.activo ? 'default' : 'secondary'}>{p.activo ? 'Activo' : 'Inactivo'}</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(p)}><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(p.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Eliminar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              {p.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{p.email}</span>}
              {p.telefono && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{p.telefono}</span>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Proveedores</h1>
          <p className="text-muted-foreground">Gestión de proveedores y contratistas ({proveedores.length} total)</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Nuevo Proveedor</Button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nombre o rubro..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      <Tabs defaultValue="proveedores">
        <TabsList>
          <TabsTrigger value="proveedores">Proveedores ({filterByType('proveedor').length})</TabsTrigger>
          <TabsTrigger value="contratistas">Contratistas ({filterByType('contratista').length})</TabsTrigger>
        </TabsList>
        <TabsContent value="proveedores" className="mt-4">{renderList(filterByType('proveedor'))}</TabsContent>
        <TabsContent value="contratistas" className="mt-4">{renderList(filterByType('contratista'))}</TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Razón Social *</Label><Input value={form.razon_social} onChange={e => setForm({...form, razon_social: e.target.value})} /></div>
              <div><Label>CUIT *</Label><Input value={form.cuit} onChange={e => setForm({...form, cuit: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Rubro *</Label><Input value={form.rubro} onChange={e => setForm({...form, rubro: e.target.value})} /></div>
              <div>
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={v => setForm({...form, tipo: v as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proveedor">Proveedor</SelectItem>
                    <SelectItem value="contratista">Contratista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div><Label>Teléfono</Label><Input value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} /></div>
            </div>
            <div><Label>Dirección</Label><Input value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} /></div>
            <div className="flex items-center gap-2">
              <Switch checked={form.activo} onCheckedChange={v => setForm({...form, activo: v})} />
              <Label>Activo</Label>
            </div>
            <Button onClick={handleSave} className="w-full">{editId ? 'Guardar Cambios' : 'Crear Proveedor'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

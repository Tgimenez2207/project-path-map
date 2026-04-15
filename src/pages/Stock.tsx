import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Package, Search, AlertTriangle, Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useStockItems } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ProductoForm = {
  nombre: string;
  codigo: string;
  categoria: string;
  unidad_medida: string;
  stock_minimo: number;
};

const emptyProducto: ProductoForm = {
  nombre: '', codigo: '', categoria: '', unidad_medida: 'unidad', stock_minimo: 0,
};

export default function Stock() {
  const [search, setSearch] = useState('');
  const { data: stockItems = [], isLoading } = useStockItems();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductoForm>(emptyProducto);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch depositos for stock item creation
  const { data: depositos = [] } = useQuery({
    queryKey: ['depositos'],
    queryFn: async () => {
      const { data } = await supabase.from('depositos').select('*');
      return data || [];
    },
  });

  const openNewProducto = () => { setEditId(null); setForm(emptyProducto); setDialogOpen(true); };
  const openEditProducto = (s: any) => {
    if (!s.productos) return;
    setEditId(s.producto_id);
    setForm({
      nombre: s.productos.nombre, codigo: s.productos.codigo,
      categoria: s.productos.categoria, unidad_medida: s.productos.unidad_medida,
      stock_minimo: Number(s.productos.stock_minimo),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre || !form.codigo || !form.categoria) {
      toast({ title: 'Completá los campos obligatorios', variant: 'destructive' }); return;
    }
    const payload = { ...form, stock_minimo: form.stock_minimo };
    if (editId) {
      const { error } = await supabase.from('productos').update(payload).eq('id', editId);
      if (error) { toast({ title: 'Error al actualizar', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Producto actualizado' });
    } else {
      const { data: newProd, error } = await supabase.from('productos').insert(payload).select().single();
      if (error) { toast({ title: 'Error al crear', description: error.message, variant: 'destructive' }); return; }
      // Auto-create stock_item in first deposito if exists
      if (depositos.length > 0 && newProd) {
        await supabase.from('stock_items').insert({ producto_id: newProd.id, deposito_id: depositos[0].id, cantidad: 0 });
      }
      toast({ title: 'Producto creado' });
    }
    queryClient.invalidateQueries({ queryKey: ['stock_items'] });
    setDialogOpen(false);
  };

  const handleDelete = async (productoId: string) => {
    if (!confirm('¿Eliminar este producto y su stock asociado?')) return;
    // Delete stock items first, then product
    await supabase.from('stock_items').delete().eq('producto_id', productoId);
    const { error } = await supabase.from('productos').delete().eq('id', productoId);
    if (error) { toast({ title: 'Error al eliminar', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Producto eliminado' });
    queryClient.invalidateQueries({ queryKey: ['stock_items'] });
  };

  const filtered = stockItems.filter(s =>
    s.productos?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    s.productos?.codigo?.toLowerCase().includes(search.toLowerCase()) ||
    s.depositos?.nombre?.toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = filtered.filter(s => s.productos && s.cantidad < s.productos.stock_minimo);

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
          <h1 className="text-2xl font-semibold">Stock</h1>
          <p className="text-muted-foreground">Control de inventario y depósitos ({stockItems.length} registros)</p>
        </div>
        <Button onClick={openNewProducto}><Plus className="h-4 w-4 mr-2" />Nuevo Producto</Button>
      </div>

      {lowStock.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-warning font-medium text-sm">
              <AlertTriangle className="h-4 w-4" />
              {lowStock.length} producto(s) con stock bajo el mínimo
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por producto, código o depósito..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Depósito</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Mínimo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => {
                const isBajo = s.productos && s.cantidad < s.productos.stock_minimo;
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.productos?.codigo}</TableCell>
                    <TableCell className="font-medium">{s.productos?.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">{s.productos?.categoria}</TableCell>
                    <TableCell>{s.depositos?.nombre}</TableCell>
                    <TableCell className="text-right font-medium">{Number(s.cantidad)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{s.productos ? Number(s.productos.stock_minimo) : '-'}</TableCell>
                    <TableCell>
                      <Badge variant={isBajo ? 'destructive' : 'secondary'}>
                        {isBajo ? 'Bajo' : 'OK'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditProducto(s)}><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(s.producto_id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Eliminar</DropdownMenuItem>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Nombre *</Label><Input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} /></div>
              <div><Label>Código *</Label><Input value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Categoría *</Label><Input value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} /></div>
              <div><Label>Unidad de medida</Label><Input value={form.unidad_medida} onChange={e => setForm({...form, unidad_medida: e.target.value})} /></div>
            </div>
            <div><Label>Stock mínimo</Label><Input type="number" value={form.stock_minimo} onChange={e => setForm({...form, stock_minimo: Number(e.target.value)})} /></div>
            <Button onClick={handleSave} className="w-full">{editId ? 'Guardar Cambios' : 'Crear Producto'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

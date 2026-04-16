import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Palette, Search, Plus, Package, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { useMateriales, useProveedores } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const categorias = ['Pisos', 'Revestimientos', 'Griferías', 'Mesadas', 'Pintura', 'Aberturas', 'Sanitarios', 'Iluminación', 'Otros'];

type MaterialForm = {
  nombre: string;
  codigo: string;
  categoria: string;
  unidad_medida: string;
  stock_minimo: number;
  foto_url: string;
  marca: string;
  modelo: string;
  precio_referencia: number;
  moneda: string;
  proveedor_id: string;
  es_terminacion: boolean;
  descripcion: string;
};

const emptyForm: MaterialForm = {
  nombre: '', codigo: '', categoria: '', unidad_medida: 'u', stock_minimo: 0,
  foto_url: '', marca: '', modelo: '', precio_referencia: 0, moneda: 'USD',
  proveedor_id: '', es_terminacion: false, descripcion: '',
};

export default function Materiales() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('todas');
  const [soloTerminaciones, setSoloTerminaciones] = useState(false);
  const { data: materiales = [], isLoading } = useMateriales(soloTerminaciones || undefined);
  const { data: proveedores = [] } = useProveedores();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<MaterialForm>(emptyForm);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const filtered = materiales.filter((m: any) => {
    const matchSearch = m.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      m.marca?.toLowerCase().includes(search.toLowerCase()) ||
      m.codigo?.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'todas' || m.categoria === catFilter;
    return matchSearch && matchCat;
  });

  const openNew = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (m: any) => {
    setEditId(m.id);
    setForm({
      nombre: m.nombre || '', codigo: m.codigo || '', categoria: m.categoria || '',
      unidad_medida: m.unidad_medida || 'u', stock_minimo: m.stock_minimo || 0,
      foto_url: m.foto_url || '', marca: m.marca || '', modelo: m.modelo || '',
      precio_referencia: m.precio_referencia || 0, moneda: m.moneda || 'USD',
      proveedor_id: m.proveedor_id || '', es_terminacion: m.es_terminacion || false,
      descripcion: m.descripcion || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      nombre: form.nombre, codigo: form.codigo, categoria: form.categoria,
      unidad_medida: form.unidad_medida, stock_minimo: form.stock_minimo,
      foto_url: form.foto_url || null, marca: form.marca || null, modelo: form.modelo || null,
      precio_referencia: form.precio_referencia || null, moneda: form.moneda,
      proveedor_id: form.proveedor_id || null, es_terminacion: form.es_terminacion,
      descripcion: form.descripcion || null,
    };
    const { error } = editId
      ? await supabase.from('productos').update(payload).eq('id', editId)
      : await supabase.from('productos').insert(payload);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: editId ? 'Material actualizado' : 'Material creado' });
    queryClient.invalidateQueries({ queryKey: ['materiales'] });
    queryClient.invalidateQueries({ queryKey: ['productos'] });
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Material eliminado' });
    queryClient.invalidateQueries({ queryKey: ['materiales'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Palette className="h-6 w-6 text-primary" /> Catálogo de Materiales
          </h1>
          <p className="text-muted-foreground">Gestión centralizada de materiales y terminaciones</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Nuevo Material</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre, marca o código..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Categoría" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Switch checked={soloTerminaciones} onCheckedChange={setSoloTerminaciones} id="term-toggle" />
          <Label htmlFor="term-toggle" className="text-sm">Solo terminaciones</Label>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Package className="empty-state-icon" />
          <h3 className="empty-state-title">Sin materiales</h3>
          <p className="text-muted-foreground">Agregá materiales al catálogo para comenzar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((m: any) => (
            <Card key={m.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-[4/3] bg-muted relative">
                {m.foto_url ? (
                  <img src={m.foto_url} alt={m.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
                {m.es_terminacion && (
                  <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">Terminación</Badge>
                )}
              </div>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold text-foreground truncate">{m.nombre}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {m.marca && <span>{m.marca}</span>}
                  {m.modelo && <span>· {m.modelo}</span>}
                </div>
                <div className="flex items-center justify-between">
                  {m.precio_referencia ? (
                    <span className="font-bold text-foreground">{m.moneda} {Number(m.precio_referencia).toLocaleString()}</span>
                  ) : (
                    <span className="text-muted-foreground text-sm">Sin precio</span>
                  )}
                  <Badge variant="outline">{m.categoria}</Badge>
                </div>
                {(m as any).proveedores?.razon_social && (
                  <p className="text-xs text-muted-foreground truncate">Prov: {(m as any).proveedores.razon_social}</p>
                )}
                <div className="flex gap-1 pt-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(m)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(m.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  <Link to="/stock" className="ml-auto">
                    <Button size="sm" variant="ghost"><ExternalLink className="h-3.5 w-3.5" /></Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar Material' : 'Nuevo Material'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Nombre *</Label>
                <Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div>
                <Label>Código *</Label>
                <Input value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Categoría</Label>
                <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Unidad medida</Label>
                <Input value={form.unidad_medida} onChange={e => setForm({ ...form, unidad_medida: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Marca</Label>
                <Input value={form.marca} onChange={e => setForm({ ...form, marca: e.target.value })} />
              </div>
              <div>
                <Label>Modelo</Label>
                <Input value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Precio ref.</Label>
                <Input type="number" value={form.precio_referencia} onChange={e => setForm({ ...form, precio_referencia: +e.target.value })} />
              </div>
              <div>
                <Label>Moneda</Label>
                <Select value={form.moneda} onValueChange={v => setForm({ ...form, moneda: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="ARS">ARS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Stock mín.</Label>
                <Input type="number" value={form.stock_minimo} onChange={e => setForm({ ...form, stock_minimo: +e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Proveedor</Label>
              <Select value={form.proveedor_id} onValueChange={v => setForm({ ...form, proveedor_id: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar proveedor" /></SelectTrigger>
                <SelectContent>
                  {proveedores.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.razon_social}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>URL de foto</Label>
              <Input value={form.foto_url} onChange={e => setForm({ ...form, foto_url: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} rows={2} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.es_terminacion} onCheckedChange={v => setForm({ ...form, es_terminacion: v })} id="es-term" />
              <Label htmlFor="es-term">Disponible como terminación para clientes</Label>
            </div>
            <Button onClick={handleSave} className="w-full">{editId ? 'Guardar cambios' : 'Crear material'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

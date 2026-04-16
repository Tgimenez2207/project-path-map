import { useState, useMemo } from 'react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Palette, Search, Plus, Package, Pencil, Trash2, ExternalLink, BarChart3, Users, X } from 'lucide-react';
import { useMateriales, useProveedores, usePreciosProductos } from '@/hooks/useSupabaseData';
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
  es_terminacion: boolean;
  descripcion: string;
};

type PrecioRow = {
  id?: string;
  proveedor_id: string;
  precio: number;
  moneda: string;
  lista: string;
  fecha_vigencia: string;
  vigente: boolean;
  notas: string;
};

const emptyForm: MaterialForm = {
  nombre: '', codigo: '', categoria: '', unidad_medida: 'u', stock_minimo: 0,
  foto_url: '', marca: '', modelo: '', es_terminacion: false, descripcion: '',
};

const emptyPrecio: PrecioRow = {
  proveedor_id: '', precio: 0, moneda: 'USD', lista: 'General',
  fecha_vigencia: new Date().toISOString().split('T')[0], vigente: true, notas: '',
};

export default function Materiales() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('todas');
  const [soloTerminaciones, setSoloTerminaciones] = useState(false);
  const { data: materiales = [], isLoading } = useMateriales(soloTerminaciones || undefined);
  const { data: proveedores = [] } = useProveedores();
  const { data: todosPrecios = [] } = usePreciosProductos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<MaterialForm>(emptyForm);
  const [precios, setPrecios] = useState<PrecioRow[]>([]);
  const [compareId, setCompareId] = useState<string | null>(null);
  const [compareData, setCompareData] = useState<any[]>([]);
  const [compareLoading, setCompareLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Group all prices by product for card display
  const preciosPorProducto = useMemo(() => {
    const map: Record<string, { min: number; max: number; moneda: string; provCount: number }> = {};
    todosPrecios.forEach((p: any) => {
      if (!map[p.producto_id]) {
        map[p.producto_id] = { min: p.precio, max: p.precio, moneda: p.moneda, provCount: 0 };
      }
      map[p.producto_id].min = Math.min(map[p.producto_id].min, p.precio);
      map[p.producto_id].max = Math.max(map[p.producto_id].max, p.precio);
    });
    // Count unique providers
    const provSets: Record<string, Set<string>> = {};
    todosPrecios.forEach((p: any) => {
      if (!provSets[p.producto_id]) provSets[p.producto_id] = new Set();
      provSets[p.producto_id].add(p.proveedor_id);
    });
    Object.keys(provSets).forEach(pid => {
      if (map[pid]) map[pid].provCount = provSets[pid].size;
    });
    return map;
  }, [todosPrecios]);

  const filtered = materiales.filter((m: any) => {
    const matchSearch = m.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      m.marca?.toLowerCase().includes(search.toLowerCase()) ||
      m.codigo?.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'todas' || m.categoria === catFilter;
    return matchSearch && matchCat;
  });

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setPrecios([{ ...emptyPrecio }]);
    setDialogOpen(true);
  };

  const openEdit = async (m: any) => {
    setEditId(m.id);
    setForm({
      nombre: m.nombre || '', codigo: m.codigo || '', categoria: m.categoria || '',
      unidad_medida: m.unidad_medida || 'u', stock_minimo: m.stock_minimo || 0,
      foto_url: m.foto_url || '', marca: m.marca || '', modelo: m.modelo || '',
      es_terminacion: m.es_terminacion || false, descripcion: m.descripcion || '',
    });
    // Load existing prices
    const { data } = await supabase
      .from('precios_producto')
      .select('*')
      .eq('producto_id', m.id)
      .order('precio');
    setPrecios(data && data.length > 0
      ? data.map(p => ({
          id: p.id, proveedor_id: p.proveedor_id, precio: p.precio,
          moneda: p.moneda, lista: p.lista, fecha_vigencia: p.fecha_vigencia,
          vigente: p.vigente, notas: p.notas || '',
        }))
      : [{ ...emptyPrecio }]
    );
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      nombre: form.nombre, codigo: form.codigo, categoria: form.categoria,
      unidad_medida: form.unidad_medida, stock_minimo: form.stock_minimo,
      foto_url: form.foto_url || null, marca: form.marca || null, modelo: form.modelo || null,
      es_terminacion: form.es_terminacion, descripcion: form.descripcion || null,
      // Keep proveedor_id as first valid provider for backward compat
      proveedor_id: precios.find(p => p.proveedor_id)?.proveedor_id || null,
      precio_referencia: precios.find(p => p.proveedor_id)?.precio || null,
      moneda: precios.find(p => p.proveedor_id)?.moneda || 'USD',
    };

    let productoId = editId;
    if (editId) {
      const { error } = await supabase.from('productos').update(payload).eq('id', editId);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    } else {
      const { data, error } = await supabase.from('productos').insert(payload).select('id').single();
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      productoId = data.id;
    }

    // Sync precios: delete old, insert new
    if (productoId) {
      await supabase.from('precios_producto').delete().eq('producto_id', productoId);
      const validPrecios = precios.filter(p => p.proveedor_id);
      if (validPrecios.length > 0) {
        const { error: pe } = await supabase.from('precios_producto').insert(
          validPrecios.map(p => ({
            producto_id: productoId!,
            proveedor_id: p.proveedor_id,
            precio: p.precio,
            moneda: p.moneda,
            lista: p.lista,
            fecha_vigencia: p.fecha_vigencia,
            vigente: p.vigente,
            notas: p.notas || null,
          }))
        );
        if (pe) { toast({ title: 'Error en precios', description: pe.message, variant: 'destructive' }); }
      }
    }

    toast({ title: editId ? 'Material actualizado' : 'Material creado' });
    queryClient.invalidateQueries({ queryKey: ['materiales'] });
    queryClient.invalidateQueries({ queryKey: ['productos'] });
    queryClient.invalidateQueries({ queryKey: ['precios_producto_all'] });
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Material eliminado' });
    queryClient.invalidateQueries({ queryKey: ['materiales'] });
    queryClient.invalidateQueries({ queryKey: ['precios_producto_all'] });
  };

  const openCompare = async (productoId: string) => {
    setCompareId(productoId);
    setCompareLoading(true);
    const { data } = await supabase
      .from('precios_producto')
      .select('*, proveedores(razon_social, rubro)')
      .eq('producto_id', productoId)
      .order('precio');
    setCompareData(data || []);
    setCompareLoading(false);
  };

  const compareMaterial = materiales.find((m: any) => m.id === compareId);
  const minComparePrice = compareData.length > 0 ? Math.min(...compareData.map((d: any) => d.precio)) : 0;

  // Precio row helpers
  const addPrecioRow = () => setPrecios([...precios, { ...emptyPrecio }]);
  const removePrecioRow = (i: number) => setPrecios(precios.filter((_, idx) => idx !== i));
  const updatePrecioRow = (i: number, field: string, value: any) => {
    const copy = [...precios];
    (copy[i] as any)[field] = value;
    setPrecios(copy);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Palette className="h-6 w-6 text-primary" /> Catálogo de Materiales
          </h1>
          <p className="text-muted-foreground">Gestión centralizada de materiales, proveedores y precios</p>
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
          {filtered.map((m: any) => {
            const pp = preciosPorProducto[m.id];
            return (
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
                    {pp ? (
                      <div>
                        <span className="font-bold text-foreground">
                          {pp.moneda} {Number(pp.min).toLocaleString()}
                          {pp.min !== pp.max && ` – ${Number(pp.max).toLocaleString()}`}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Users className="h-3 w-3" />
                          <span>{pp.provCount} proveedor{pp.provCount > 1 ? 'es' : ''}</span>
                        </div>
                      </div>
                    ) : m.precio_referencia ? (
                      <span className="font-bold text-foreground">{m.moneda} {Number(m.precio_referencia).toLocaleString()}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin precio</span>
                    )}
                    <Badge variant="outline">{m.categoria}</Badge>
                  </div>
                  <div className="flex gap-1 pt-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(m)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(m.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    {pp && pp.provCount > 0 && (
                      <Button size="sm" variant="ghost" onClick={() => openCompare(m.id)} title="Comparar precios">
                        <BarChart3 className="h-3.5 w-3.5 text-primary" />
                      </Button>
                    )}
                    <Link to="/stock" className="ml-auto">
                      <Button size="sm" variant="ghost"><ExternalLink className="h-3.5 w-3.5" /></Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <div>
              <Label>Stock mínimo</Label>
              <Input type="number" value={form.stock_minimo} onChange={e => setForm({ ...form, stock_minimo: +e.target.value })} className="w-32" />
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

            {/* Proveedores y Precios */}
            <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Proveedores y Precios</Label>
                <Button size="sm" variant="outline" onClick={addPrecioRow} className="gap-1">
                  <Plus className="h-3.5 w-3.5" /> Agregar
                </Button>
              </div>
              {precios.map((p, i) => (
                <div key={i} className="grid grid-cols-[1fr_100px_80px_1fr_100px_auto] gap-2 items-end">
                  <div>
                    <Label className="text-xs">Proveedor</Label>
                    <Select value={p.proveedor_id} onValueChange={v => updatePrecioRow(i, 'proveedor_id', v)}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {proveedores.map((pv: any) => <SelectItem key={pv.id} value={pv.id}>{pv.razon_social}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Precio</Label>
                    <Input type="number" className="h-9 text-sm" value={p.precio} onChange={e => updatePrecioRow(i, 'precio', +e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Moneda</Label>
                    <Select value={p.moneda} onValueChange={v => updatePrecioRow(i, 'moneda', v)}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="ARS">ARS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Lista</Label>
                    <Input className="h-9 text-sm" value={p.lista} onChange={e => updatePrecioRow(i, 'lista', e.target.value)} placeholder="General" />
                  </div>
                  <div>
                    <Label className="text-xs">Vigencia</Label>
                    <Input type="date" className="h-9 text-sm" value={p.fecha_vigencia} onChange={e => updatePrecioRow(i, 'fecha_vigencia', e.target.value)} />
                  </div>
                  <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => removePrecioRow(i)} disabled={precios.length === 1}>
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            <Button onClick={handleSave} className="w-full">{editId ? 'Guardar cambios' : 'Crear material'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Compare Dialog */}
      <Dialog open={!!compareId} onOpenChange={() => setCompareId(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Comparar precios — {compareMaterial?.nombre}
            </DialogTitle>
          </DialogHeader>
          {compareLoading ? (
            <Skeleton className="h-40" />
          ) : compareData.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Sin precios cargados para este material</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Lista</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead>Moneda</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead className="text-right">Dif. %</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compareData.map((row: any) => {
                  const isMin = row.precio === minComparePrice;
                  const diff = minComparePrice > 0 ? ((row.precio - minComparePrice) / minComparePrice * 100) : 0;
                  return (
                    <TableRow key={row.id} className={isMin ? 'bg-primary/5' : ''}>
                      <TableCell className="font-medium">
                        {row.proveedores?.razon_social || '—'}
                        {isMin && <Badge className="ml-2 bg-green-600 text-white text-[10px]">Mejor precio</Badge>}
                      </TableCell>
                      <TableCell>{row.lista}</TableCell>
                      <TableCell className="text-right font-bold">{Number(row.precio).toLocaleString()}</TableCell>
                      <TableCell>{row.moneda}</TableCell>
                      <TableCell>{row.fecha_vigencia}</TableCell>
                      <TableCell className="text-right">
                        {isMin ? '—' : <span className="text-destructive">+{diff.toFixed(1)}%</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.vigente ? 'default' : 'secondary'}>
                          {row.vigente ? 'Vigente' : 'No vigente'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

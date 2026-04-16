import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Package, Search, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { usePortal } from '@/contexts/PortalContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const categorias = ['Pisos', 'Revestimientos', 'Griferías', 'Mesadas', 'Pintura', 'Aberturas', 'Sanitarios', 'Iluminación', 'Otros'];

const estadoConfig: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  pendiente: { label: 'Pendiente', icon: Clock, color: 'text-warning' },
  aprobada: { label: 'Aprobada', icon: CheckCircle2, color: 'text-success' },
  rechazada: { label: 'Rechazada', icon: XCircle, color: 'text-destructive' },
};

export default function PortalTerminaciones() {
  const { cliente } = usePortal();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('todas');
  const [selectedUnidad, setSelectedUnidad] = useState<string>('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch unidades for this client via compradores
  const { data: unidades = [] } = useQuery({
    queryKey: ['portal_unidades', cliente?.id],
    queryFn: async () => {
      if (!cliente?.id) return [];
      const { data, error } = await supabase.from('compradores').select('unidad_id, unidades(id, codigo, tipologia)').eq('cliente_id', cliente.id);
      if (error) throw error;
      return (data || []).map((c: any) => c.unidades).filter(Boolean);
    },
    enabled: !!cliente?.id,
  });

  // Fetch terminaciones catalog
  const { data: materiales = [], isLoading: loadingMat } = useQuery({
    queryKey: ['portal_terminaciones'],
    queryFn: async () => {
      const { data, error } = await supabase.from('productos').select('*').eq('es_terminacion', true).order('categoria, nombre');
      if (error) throw error;
      return data;
    },
  });

  // Fetch client selections
  const { data: selecciones = [] } = useQuery({
    queryKey: ['portal_selecciones', cliente?.id],
    queryFn: async () => {
      if (!cliente?.id) return [];
      const { data, error } = await supabase.from('selecciones_terminacion').select('*, productos(nombre, foto_url, categoria, precio_referencia, moneda)').eq('cliente_id', cliente.id);
      if (error) throw error;
      return data;
    },
    enabled: !!cliente?.id,
  });

  const filtered = materiales.filter((m: any) => {
    const matchSearch = m.nombre?.toLowerCase().includes(search.toLowerCase()) || m.marca?.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'todas' || m.categoria === catFilter;
    return matchSearch && matchCat;
  });

  const handleSeleccionar = async (productoId: string, categoria: string) => {
    if (!selectedUnidad) {
      toast({ title: 'Seleccioná una unidad primero', variant: 'destructive' });
      return;
    }
    if (!cliente?.id) return;
    const { error } = await supabase.from('selecciones_terminacion').insert({
      unidad_id: selectedUnidad,
      producto_id: productoId,
      categoria,
      cliente_id: cliente.id,
      estado: 'pendiente',
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Terminación seleccionada', description: 'Queda pendiente de aprobación' });
    queryClient.invalidateQueries({ queryKey: ['portal_selecciones'] });
  };

  const isSelected = (productoId: string) => selecciones.some((s: any) => s.producto_id === productoId && s.unidad_id === selectedUnidad);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Palette className="h-6 w-6 text-primary" /> Terminaciones
        </h1>
        <p className="text-muted-foreground">Elegí las terminaciones para tu unidad</p>
      </div>

      <Tabs defaultValue="catalogo">
        <TabsList>
          <TabsTrigger value="catalogo">Catálogo</TabsTrigger>
          <TabsTrigger value="mis-selecciones">Mis Selecciones ({selecciones.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="catalogo" className="mt-4 space-y-4">
          {/* Unidad selector */}
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedUnidad} onValueChange={setSelectedUnidad}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="Seleccionar unidad" /></SelectTrigger>
              <SelectContent>
                {(unidades || []).map((u: any) => (
                  <SelectItem key={u.id} value={u.id}>{u.codigo} - {u.tipologia}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar material..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Categoría" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {loadingMat ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No hay materiales disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((m: any) => {
                const selected = isSelected(m.id);
                return (
                  <Card key={m.id} className={`overflow-hidden transition-shadow ${selected ? 'ring-2 ring-primary' : 'hover:shadow-lg'}`}>
                    <div className="aspect-[4/3] bg-muted">
                      {m.foto_url ? (
                        <img src={m.foto_url} alt={m.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <h3 className="font-semibold text-foreground">{m.nombre}</h3>
                      <div className="text-sm text-muted-foreground">
                        {m.marca && <span>{m.marca}</span>}
                        {m.modelo && <span> · {m.modelo}</span>}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{m.moneda} {Number(m.precio_referencia || 0).toLocaleString()}</span>
                        <Badge variant="outline">{m.categoria}</Badge>
                      </div>
                      <Button
                        className="w-full mt-2"
                        variant={selected ? 'secondary' : 'default'}
                        disabled={selected || !selectedUnidad}
                        onClick={() => handleSeleccionar(m.id, m.categoria)}
                      >
                        {selected ? '✓ Seleccionado' : 'Elegir'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mis-selecciones" className="mt-4">
          {selecciones.length === 0 ? (
            <div className="text-center py-12">
              <Palette className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Todavía no elegiste terminaciones</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selecciones.map((s: any) => {
                const cfg = estadoConfig[s.estado] || estadoConfig.pendiente;
                const Icon = cfg.icon;
                return (
                  <Card key={s.id}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {s.productos?.foto_url ? (
                          <img src={s.productos.foto_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full"><Package className="h-6 w-6 text-muted-foreground/30" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground">{s.productos?.nombre}</p>
                        <p className="text-sm text-muted-foreground">{s.categoria}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Icon className={`h-4 w-4 ${cfg.color}`} />
                        <span className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

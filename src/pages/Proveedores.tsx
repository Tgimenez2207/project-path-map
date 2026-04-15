import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, Search, Mail, Phone, Wrench } from 'lucide-react';
import { useProveedores } from '@/hooks/useSupabaseData';

export default function Proveedores() {
  const [search, setSearch] = useState('');
  const { data: proveedores = [], isLoading } = useProveedores();

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
              <Badge variant={p.activo ? 'default' : 'secondary'}>{p.activo ? 'Activo' : 'Inactivo'}</Badge>
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
      <div>
        <h1 className="text-2xl font-semibold">Proveedores</h1>
        <p className="text-muted-foreground">Gestión de proveedores y contratistas ({proveedores.length} total)</p>
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
    </div>
  );
}

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Search, Mail, Phone, MapPin, Building2 } from 'lucide-react';
import { useClientes } from '@/hooks/useSupabaseData';

export default function Clientes() {
  const [search, setSearch] = useState('');
  const { data: clientes = [], isLoading } = useClientes();

  const filtered = clientes.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.documento.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <p className="text-muted-foreground">Gestión de clientes y compradores ({clientes.length} total)</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nombre o documento..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Users className="empty-state-icon" />
          <h3 className="empty-state-title">No se encontraron clientes</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full gradient-rappi flex items-center justify-center text-white font-medium">
                      {c.nombre.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium">{c.nombre}</h3>
                      <p className="text-sm text-muted-foreground">{c.documento}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={c.tipo === 'empresa' ? 'default' : 'secondary'}>
                      {c.tipo === 'empresa' ? 'Empresa' : 'Persona'}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                  {c.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>}
                  {c.telefono && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.telefono}</span>}
                  {c.direccion && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.direccion}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

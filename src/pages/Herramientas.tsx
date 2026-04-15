import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wrench, Search } from 'lucide-react';
import { useHerramientas } from '@/hooks/useSupabaseData';

const estadoHerramienta: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  disponible: { label: 'Disponible', variant: 'default' },
  en_uso: { label: 'En uso', variant: 'secondary' },
  mantenimiento: { label: 'Mantenimiento', variant: 'outline' },
  baja: { label: 'Baja', variant: 'destructive' },
};

export default function Herramientas() {
  const [search, setSearch] = useState('');
  const { data: herramientas = [], isLoading } = useHerramientas();

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
      <div>
        <h1 className="text-2xl font-semibold">Herramientas</h1>
        <p className="text-muted-foreground">Control de herramientas y equipos ({herramientas.length} total)</p>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

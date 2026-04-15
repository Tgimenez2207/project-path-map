import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Search, DollarSign } from 'lucide-react';
import { usePresupuestos } from '@/hooks/useSupabaseData';

const estadoPresupuesto: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  borrador: { label: 'Borrador', variant: 'outline' },
  pendiente: { label: 'Pendiente', variant: 'secondary' },
  aprobado: { label: 'Aprobado', variant: 'default' },
  rechazado: { label: 'Rechazado', variant: 'destructive' },
  finalizado: { label: 'Finalizado', variant: 'secondary' },
};

export default function Presupuestos() {
  const [search, setSearch] = useState('');
  const { data: presupuestos = [], isLoading } = usePresupuestos();

  const filtered = presupuestos.filter(p =>
    p.numero.toLowerCase().includes(search.toLowerCase()) ||
    p.descripcion.toLowerCase().includes(search.toLowerCase())
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
        <h1 className="text-2xl font-semibold">Presupuestos</h1>
        <p className="text-muted-foreground">Gestión de presupuestos y cotizaciones ({presupuestos.length} total)</p>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.numero}</TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">{p.descripcion}</TableCell>
                  <TableCell className="text-sm">{(p as any).obras?.nombre || '-'}</TableCell>
                  <TableCell className="text-sm">{(p as any).proveedores?.razon_social || '-'}</TableCell>
                  <TableCell className="text-right font-medium">{p.moneda} {Number(p.monto_total).toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{new Date(p.fecha_creacion).toLocaleDateString('es-AR')}</TableCell>
                  <TableCell>
                    <Badge variant={estadoPresupuesto[p.estado]?.variant || 'secondary'}>
                      {estadoPresupuesto[p.estado]?.label || p.estado}
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

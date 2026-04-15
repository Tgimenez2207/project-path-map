import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Search, AlertTriangle } from 'lucide-react';
import { useStockItems } from '@/hooks/useSupabaseData';

export default function Stock() {
  const [search, setSearch] = useState('');
  const { data: stockItems = [], isLoading } = useStockItems();

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
      <div>
        <h1 className="text-2xl font-semibold">Stock</h1>
        <p className="text-muted-foreground">Control de inventario y depósitos ({stockItems.length} registros)</p>
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
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

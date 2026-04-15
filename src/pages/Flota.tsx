import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Car, Calendar, Gauge } from 'lucide-react';
import { useVehiculos } from '@/hooks/useSupabaseData';

const estadoVehiculo: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  disponible: { label: 'Disponible', variant: 'default' },
  en_uso: { label: 'En uso', variant: 'secondary' },
  mantenimiento: { label: 'Mantenimiento', variant: 'outline' },
};

export default function Flota() {
  const { data: vehiculos = [], isLoading } = useVehiculos();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold">Flota</h1>
        <p className="text-muted-foreground">Gestión de vehículos y mantenimientos ({vehiculos.length} vehículos)</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vehiculos.map(v => (
          <Card key={v.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <Badge variant={estadoVehiculo[v.estado]?.variant || 'secondary'}>
                  {estadoVehiculo[v.estado]?.label || v.estado}
                </Badge>
              </div>
              <CardTitle className="text-base mt-2">{v.marca} {v.modelo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Patente</span>
                <span className="font-mono font-medium">{v.patente}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Año</span>
                <span>{v.anio}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1"><Gauge className="h-3 w-3" />Km</span>
                <span>{v.kilometraje.toLocaleString()} km</span>
              </div>
              {v.proximo_vencimiento && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{v.tipo_vencimiento}</span>
                  <span className="text-xs">{new Date(v.proximo_vencimiento).toLocaleDateString('es-AR')}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

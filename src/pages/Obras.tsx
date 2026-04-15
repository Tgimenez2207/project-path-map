import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Plus, Search, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { useObras, useUnidades } from '@/hooks/useSupabaseData';

const estadoLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  planificacion: { label: 'Planificación', variant: 'secondary' },
  en_curso: { label: 'En curso', variant: 'default' },
  pausada: { label: 'Pausada', variant: 'outline' },
  finalizada: { label: 'Finalizada', variant: 'secondary' },
  cancelada: { label: 'Cancelada', variant: 'destructive' },
};

export default function Obras() {
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: obras = [], isLoading } = useObras();
  const { data: unidades = [] } = useUnidades();

  const filteredObras = obras.filter((obra) => {
    const matchesSearch = obra.nombre.toLowerCase().includes(search.toLowerCase()) ||
      obra.direccion.toLowerCase().includes(search.toLowerCase());
    const matchesEstado = estadoFilter === 'todos' || obra.estado === estadoFilter;
    return matchesSearch && matchesEstado;
  });

  const getUnidadesCount = (obraId: string) => unidades.filter((u) => u.obra_id === obraId).length;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Obras</h1>
          <p className="text-muted-foreground">Gestión de proyectos y obras en curso</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nueva Obra</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nueva Obra</DialogTitle>
              <DialogDescription>Complete los datos para crear una nueva obra.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre del proyecto</Label>
                <Input id="nombre" placeholder="Ej: Torre Mirador" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input id="direccion" placeholder="Ej: Av. del Libertador 4500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="ciudad">Ciudad</Label>
                  <Input id="ciudad" placeholder="Ej: Buenos Aires" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fechaInicio">Fecha de inicio</Label>
                  <Input id="fechaInicio" type="date" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea id="descripcion" placeholder="Descripción del proyecto..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={() => setIsDialogOpen(false)}>Crear Obra</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar obras..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={estadoFilter} onValueChange={setEstadoFilter}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="planificacion">Planificación</SelectItem>
            <SelectItem value="en_curso">En curso</SelectItem>
            <SelectItem value="pausada">Pausada</SelectItem>
            <SelectItem value="finalizada">Finalizada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredObras.length === 0 ? (
        <div className="empty-state">
          <Building2 className="empty-state-icon" />
          <h3 className="empty-state-title">No hay obras</h3>
          <p className="empty-state-description">No se encontraron obras con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredObras.map((obra) => (
            <Link key={obra.id} to={`/obras/${obra.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant={estadoLabels[obra.estado]?.variant || 'secondary'}>
                      {estadoLabels[obra.estado]?.label || obra.estado}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-3">{obra.nombre}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /><span>{obra.direccion}, {obra.ciudad}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" /><span>Inicio: {new Date(obra.fecha_inicio).toLocaleDateString('es-AR')}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avance</span>
                      <span className="font-medium">{obra.progreso}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${obra.progreso}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Unidades: </span>
                      <span className="font-medium">{getUnidadesCount(obra.id)}</span>
                    </div>
                    {obra.presupuesto_total && (
                      <div className="text-sm">
                        <span className="font-medium">{obra.moneda} {Number(obra.presupuesto_total).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

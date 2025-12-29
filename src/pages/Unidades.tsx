import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Building2,
  Plus,
  Search,
  Package,
  DollarSign,
  Ruler,
  Home,
} from 'lucide-react';
import { mockObras } from '@/data/mockObras';
import { mockUnidades } from '@/data/mockUnidades';
import { EstadoUnidad } from '@/types';

const estadoConfig: Record<EstadoUnidad, { label: string; color: string }> = {
  disponible: { label: 'Disponible', color: 'bg-success text-success-foreground' },
  reservada: { label: 'Reservada', color: 'bg-warning text-warning-foreground' },
  vendida: { label: 'Vendida', color: 'bg-primary text-primary-foreground' },
  bloqueada: { label: 'Bloqueada', color: 'bg-muted text-muted-foreground' },
};

export default function Unidades() {
  const { obraId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const obra = mockObras.find((o) => o.id === obraId);
  const unidades = mockUnidades.filter((u) => u.obraId === obraId);

  const filteredUnidades = unidades.filter((unidad) => {
    const matchesSearch = unidad.codigo.toLowerCase().includes(search.toLowerCase()) ||
      unidad.tipo.toLowerCase().includes(search.toLowerCase());
    const matchesEstado = estadoFilter === 'todos' || unidad.estado === estadoFilter;
    return matchesSearch && matchesEstado;
  });

  // Stats
  const stats = {
    total: unidades.length,
    disponibles: unidades.filter((u) => u.estado === 'disponible').length,
    reservadas: unidades.filter((u) => u.estado === 'reservada').length,
    vendidas: unidades.filter((u) => u.estado === 'vendida').length,
  };

  if (!obra) {
    return (
      <div className="empty-state">
        <Building2 className="empty-state-icon" />
        <h3 className="empty-state-title">Obra no encontrada</h3>
        <Button onClick={() => navigate('/obras')}>Volver a Obras</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/obras/${obraId}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">Unidades</h1>
          <p className="text-muted-foreground">{obra.nombre}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Unidad
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nueva Unidad</DialogTitle>
              <DialogDescription>
                Complete los datos para crear una nueva unidad funcional.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="codigo">Código</Label>
                  <Input id="codigo" placeholder="Ej: 4A" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="departamento">Departamento</SelectItem>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="oficina">Oficina</SelectItem>
                      <SelectItem value="casa">Casa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="piso">Piso</Label>
                  <Input id="piso" type="number" placeholder="Ej: 4" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="torre">Torre</Label>
                  <Input id="torre" placeholder="Ej: A" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ambientes">Ambientes</Label>
                  <Input id="ambientes" type="number" placeholder="Ej: 2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="superficie">Superficie (m²)</Label>
                  <Input id="superficie" type="number" placeholder="Ej: 65" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="precio">Precio (USD)</Label>
                  <Input id="precio" type="number" placeholder="Ej: 85000" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>Crear Unidad</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-success">{stats.disponibles}</p>
                <p className="text-xs text-muted-foreground">Disponibles</p>
              </div>
              <div className="h-3 w-3 rounded-full bg-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-warning">{stats.reservadas}</p>
                <p className="text-xs text-muted-foreground">Reservadas</p>
              </div>
              <div className="h-3 w-3 rounded-full bg-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary">{stats.vendidas}</p>
                <p className="text-xs text-muted-foreground">Vendidas</p>
              </div>
              <div className="h-3 w-3 rounded-full bg-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código o tipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={estadoFilter} onValueChange={setEstadoFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="disponible">Disponibles</SelectItem>
            <SelectItem value="reservada">Reservadas</SelectItem>
            <SelectItem value="vendida">Vendidas</SelectItem>
            <SelectItem value="bloqueada">Bloqueadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Units Grid */}
      {filteredUnidades.length === 0 ? (
        <div className="empty-state">
          <Home className="empty-state-icon" />
          <h3 className="empty-state-title">No hay unidades</h3>
          <p className="empty-state-description">
            {unidades.length === 0
              ? 'Esta obra aún no tiene unidades funcionales.'
              : 'No se encontraron unidades con los filtros seleccionados.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredUnidades.map((unidad) => (
            <Link key={unidad.id} to={`/obras/${obraId}/unidades/${unidad.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{unidad.codigo}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {unidad.tipo}
                        {unidad.piso !== undefined && ` • Piso ${unidad.piso}`}
                        {unidad.torre && ` • Torre ${unidad.torre}`}
                      </p>
                    </div>
                    <Badge className={estadoConfig[unidad.estado].color}>
                      {estadoConfig[unidad.estado].label}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                      <span>{unidad.superficie} m²</span>
                      {unidad.ambientes && (
                        <span className="text-muted-foreground">
                          • {unidad.ambientes} amb.
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {unidad.moneda} {unidad.precioLista.toLocaleString()}
                      </span>
                    </div>
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

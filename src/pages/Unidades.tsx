import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
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
import { ArrowLeft, Building2, Plus, Search, Package, DollarSign, Ruler, Home } from 'lucide-react';
import { useObra, useUnidades } from '@/hooks/useSupabaseData';

const estadoConfig: Record<string, { label: string; color: string }> = {
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: obra, isLoading: obraLoading } = useObra(obraId);
  const { data: unidades = [], isLoading } = useUnidades(obraId);

  const filteredUnidades = unidades.filter((u) => {
    const matchesSearch = u.codigo.toLowerCase().includes(search.toLowerCase()) || u.tipo.toLowerCase().includes(search.toLowerCase());
    const matchesEstado = estadoFilter === 'todos' || u.estado === estadoFilter;
    return matchesSearch && matchesEstado;
  });

  const stats = {
    total: unidades.length,
    disponibles: unidades.filter(u => u.estado === 'disponible').length,
    reservadas: unidades.filter(u => u.estado === 'reservada').length,
    vendidas: unidades.filter(u => u.estado === 'vendida').length,
  };

  if (obraLoading || isLoading) {
    return <div className="space-y-6 animate-fade-in"><Skeleton className="h-8 w-64" /><div className="grid gap-4 grid-cols-2 md:grid-cols-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div></div>;
  }

  if (!obra) {
    return <div className="empty-state"><Building2 className="empty-state-icon" /><h3 className="empty-state-title">Obra no encontrada</h3><Button onClick={() => navigate('/obras')}>Volver a Obras</Button></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/obras/${obraId}`)}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1"><h1 className="text-2xl font-semibold">Unidades</h1><p className="text-muted-foreground">{obra.nombre}</p></div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nueva Unidad</Button></DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle>Nueva Unidad</DialogTitle><DialogDescription>Complete los datos para crear una nueva unidad funcional.</DialogDescription></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label>Código</Label><Input placeholder="Ej: 4A" /></div>
                <div className="grid gap-2"><Label>Tipo</Label><Select><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent><SelectItem value="departamento">Departamento</SelectItem><SelectItem value="local">Local</SelectItem><SelectItem value="oficina">Oficina</SelectItem><SelectItem value="casa">Casa</SelectItem></SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label>Superficie (m²)</Label><Input type="number" placeholder="65" /></div>
                <div className="grid gap-2"><Label>Precio (USD)</Label><Input type="number" placeholder="85000" /></div>
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button><Button onClick={() => setIsDialogOpen(false)}>Crear Unidad</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card><CardContent className="pt-4 pb-4"><div className="flex items-center justify-between"><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></div><Package className="h-5 w-5 text-muted-foreground" /></div></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><div className="flex items-center justify-between"><div><p className="text-2xl font-bold text-success">{stats.disponibles}</p><p className="text-xs text-muted-foreground">Disponibles</p></div><div className="h-3 w-3 rounded-full bg-success" /></div></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><div className="flex items-center justify-between"><div><p className="text-2xl font-bold text-warning">{stats.reservadas}</p><p className="text-xs text-muted-foreground">Reservadas</p></div><div className="h-3 w-3 rounded-full bg-warning" /></div></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><div className="flex items-center justify-between"><div><p className="text-2xl font-bold text-primary">{stats.vendidas}</p><p className="text-xs text-muted-foreground">Vendidas</p></div><div className="h-3 w-3 rounded-full bg-primary" /></div></CardContent></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar por código o tipo..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
        <Select value={estadoFilter} onValueChange={setEstadoFilter}><SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Estado" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem><SelectItem value="disponible">Disponibles</SelectItem><SelectItem value="reservada">Reservadas</SelectItem><SelectItem value="vendida">Vendidas</SelectItem><SelectItem value="bloqueada">Bloqueadas</SelectItem></SelectContent></Select>
      </div>

      {filteredUnidades.length === 0 ? (
        <div className="empty-state"><Home className="empty-state-icon" /><h3 className="empty-state-title">No hay unidades</h3></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredUnidades.map((u) => (
            <Link key={u.id} to={`/obras/${obraId}/unidades/${u.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div><h3 className="text-lg font-semibold">{u.codigo}</h3><p className="text-sm text-muted-foreground capitalize">{u.tipo}{u.piso !== null && ` • Piso ${u.piso}`}{u.torre && ` • Torre ${u.torre}`}</p></div>
                    <Badge className={estadoConfig[u.estado]?.color || ''}>{estadoConfig[u.estado]?.label || u.estado}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm"><Ruler className="h-4 w-4 text-muted-foreground" /><span>{Number(u.superficie)} m²</span>{u.ambientes && <span className="text-muted-foreground">• {u.ambientes} amb.</span>}</div>
                    <div className="flex items-center gap-2 text-sm"><DollarSign className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{u.moneda} {Number(u.precio_lista).toLocaleString()}</span></div>
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

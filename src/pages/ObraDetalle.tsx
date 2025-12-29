import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  FileText,
  ListTodo,
  ScrollText,
  Settings,
  Package,
  Plus,
} from 'lucide-react';
import { mockObras, mockEtapas, mockTareas, mockBitacora } from '@/data/mockObras';
import { mockUnidades } from '@/data/mockUnidades';
import { mockContratistas } from '@/data/mockClientes';
import { EstadoObra } from '@/types';

const estadoLabels: Record<EstadoObra, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  planificacion: { label: 'Planificación', variant: 'secondary' },
  en_curso: { label: 'En curso', variant: 'default' },
  pausada: { label: 'Pausada', variant: 'outline' },
  finalizada: { label: 'Finalizada', variant: 'secondary' },
  cancelada: { label: 'Cancelada', variant: 'destructive' },
};

export default function ObraDetalle() {
  const { obraId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('etapas');

  const obra = mockObras.find((o) => o.id === obraId);
  const etapas = mockEtapas.filter((e) => e.obraId === obraId);
  const tareas = mockTareas.filter((t) => t.obraId === obraId);
  const bitacora = mockBitacora.filter((b) => b.obraId === obraId);
  const unidades = mockUnidades.filter((u) => u.obraId === obraId);

  if (!obra) {
    return (
      <div className="empty-state">
        <Building2 className="empty-state-icon" />
        <h3 className="empty-state-title">Obra no encontrada</h3>
        <Button onClick={() => navigate('/obras')}>Volver a Obras</Button>
      </div>
    );
  }

  const unidadesVendidas = unidades.filter((u) => u.estado === 'vendida').length;
  const unidadesDisponibles = unidades.filter((u) => u.estado === 'disponible').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/obras')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{obra.nombre}</h1>
            <Badge variant={estadoLabels[obra.estado].variant}>
              {estadoLabels[obra.estado].label}
            </Badge>
          </div>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <MapPin className="h-4 w-4" />
            {obra.direccion}, {obra.ciudad}
          </p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Configuración
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unidades.length}</p>
                <p className="text-sm text-muted-foreground">Unidades</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unidadesVendidas}</p>
                <p className="text-sm text-muted-foreground">Vendidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unidadesDisponibles}</p>
                <p className="text-sm text-muted-foreground">Disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{obra.progreso}%</p>
                <p className="text-sm text-muted-foreground">Avance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link to={`/obras/${obraId}/unidades`}>
          <Button>
            <Package className="h-4 w-4 mr-2" />
            Ver Unidades
          </Button>
        </Link>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Entrada Bitácora
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="etapas" className="gap-2">
            <ListTodo className="h-4 w-4" />
            Etapas y Tareas
          </TabsTrigger>
          <TabsTrigger value="bitacora" className="gap-2">
            <ScrollText className="h-4 w-4" />
            Bitácora
          </TabsTrigger>
          <TabsTrigger value="finanzas" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Finanzas
          </TabsTrigger>
          <TabsTrigger value="documentos" className="gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="contratistas" className="gap-2">
            <Users className="h-4 w-4" />
            Contratistas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="etapas" className="mt-6">
          <div className="space-y-4">
            {etapas.map((etapa) => {
              const etapaTareas = tareas.filter((t) => t.etapaId === etapa.id);
              const completadas = etapaTareas.filter((t) => t.estado === 'completada').length;
              
              return (
                <Card key={etapa.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{etapa.nombre}</CardTitle>
                      <Badge
                        variant={
                          etapa.estado === 'completada'
                            ? 'default'
                            : etapa.estado === 'en_curso'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {etapa.estado === 'completada'
                          ? 'Completada'
                          : etapa.estado === 'en_curso'
                          ? 'En curso'
                          : 'Pendiente'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {etapaTareas.length > 0 ? (
                        etapaTareas.map((tarea) => (
                          <div
                            key={tarea.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-2 w-2 rounded-full ${
                                  tarea.estado === 'completada'
                                    ? 'bg-success'
                                    : tarea.estado === 'en_curso'
                                    ? 'bg-warning'
                                    : 'bg-muted-foreground'
                                }`}
                              />
                              <span className="text-sm">{tarea.titulo}</span>
                            </div>
                            {tarea.asignadoA && (
                              <span className="text-xs text-muted-foreground">
                                {tarea.asignadoA}
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No hay tareas en esta etapa
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="bitacora" className="mt-6">
          <div className="space-y-4">
            {bitacora.length > 0 ? (
              bitacora.map((entrada) => (
                <Card key={entrada.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {entrada.autor.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{entrada.titulo}</h4>
                          <span className="text-sm text-muted-foreground">
                            {new Date(entrada.fecha).toLocaleDateString('es-AR')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {entrada.descripcion}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Por {entrada.autor}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="empty-state">
                <ScrollText className="empty-state-icon" />
                <h3 className="empty-state-title">Sin entradas</h3>
                <p className="empty-state-description">
                  No hay entradas en la bitácora todavía.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="finanzas" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Presupuesto Total</p>
                  <p className="text-2xl font-bold">
                    {obra.moneda} {obra.presupuestoTotal?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-success/10">
                  <p className="text-sm text-muted-foreground">Ingresos</p>
                  <p className="text-2xl font-bold text-success">USD 245.000</p>
                </div>
                <div className="p-4 rounded-lg bg-destructive/10">
                  <p className="text-sm text-muted-foreground">Egresos</p>
                  <p className="text-2xl font-bold text-destructive">USD 180.000</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos" className="mt-6">
          <div className="empty-state">
            <FileText className="empty-state-icon" />
            <h3 className="empty-state-title">Sin documentos</h3>
            <p className="empty-state-description">
              No hay documentos cargados para esta obra.
            </p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Subir documento
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="contratistas" className="mt-6">
          <div className="space-y-3">
            {mockContratistas.slice(0, 3).map((contratista) => (
              <Card key={contratista.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{contratista.razonSocial}</h4>
                      <p className="text-sm text-muted-foreground">{contratista.rubro}</p>
                    </div>
                    <Badge variant={contratista.activo ? 'default' : 'secondary'}>
                      {contratista.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

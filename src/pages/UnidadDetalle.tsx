import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DollarSign,
  Ruler,
  Users,
  Car,
  Package,
  FileText,
  Plus,
  Edit,
  Trash2,
  CreditCard,
} from 'lucide-react';
import { mockObras } from '@/data/mockObras';
import { mockUnidades, mockComplementos, mockCompradores, mockPlanesPago, mockCuotas } from '@/data/mockUnidades';
import { mockClientes } from '@/data/mockClientes';
import { EstadoUnidad, EstadoPago } from '@/types';

const estadoConfig: Record<EstadoUnidad, { label: string; color: string }> = {
  disponible: { label: 'Disponible', color: 'bg-success text-success-foreground' },
  reservada: { label: 'Reservada', color: 'bg-warning text-warning-foreground' },
  vendida: { label: 'Vendida', color: 'bg-primary text-primary-foreground' },
  bloqueada: { label: 'Bloqueada', color: 'bg-muted text-muted-foreground' },
};

const estadoPagoConfig: Record<EstadoPago, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pendiente: { label: 'Pendiente', variant: 'outline' },
  aprobado: { label: 'Pagado', variant: 'default' },
  rechazado: { label: 'Rechazado', variant: 'destructive' },
  vencido: { label: 'Vencido', variant: 'destructive' },
};

export default function UnidadDetalle() {
  const { obraId, unidadId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [isCompradorDialogOpen, setIsCompradorDialogOpen] = useState(false);
  const [isComplementoDialogOpen, setIsComplementoDialogOpen] = useState(false);

  const obra = mockObras.find((o) => o.id === obraId);
  const unidad = mockUnidades.find((u) => u.id === unidadId);
  const complementos = mockComplementos.filter((c) => c.unidadId === unidadId);
  const compradores = mockCompradores.filter((c) => c.unidadId === unidadId);
  const planPago = mockPlanesPago.find((p) => p.unidadId === unidadId);
  const cuotas = planPago ? mockCuotas.filter((c) => c.planPagoId === planPago.id) : [];

  if (!obra || !unidad) {
    return (
      <div className="empty-state">
        <Building2 className="empty-state-icon" />
        <h3 className="empty-state-title">Unidad no encontrada</h3>
        <Button onClick={() => navigate(`/obras/${obraId}/unidades`)}>
          Volver a Unidades
        </Button>
      </div>
    );
  }

  const getClienteNombre = (clienteId: string) => {
    const cliente = mockClientes.find((c) => c.id === clienteId);
    return cliente?.nombre || 'Cliente no encontrado';
  };

  // Calcular totales
  const totalComplementos = complementos.reduce((acc, c) => acc + c.precio, 0);
  const totalUnidad = unidad.precioLista + totalComplementos;
  const cuotasPagadas = cuotas.filter((c) => c.estado === 'aprobado');
  const totalPagado = cuotasPagadas.reduce((acc, c) => acc + (c.montoPagado || 0), 0);
  const saldoPendiente = planPago ? planPago.montoTotal - totalPagado : totalUnidad;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/obras/${obraId}/unidades`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Unidad {unidad.codigo}</h1>
            <Badge className={estadoConfig[unidad.estado].color}>
              {estadoConfig[unidad.estado].label}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {obra.nombre}
            {unidad.piso !== undefined && ` • Piso ${unidad.piso}`}
            {unidad.torre && ` • Torre ${unidad.torre}`}
          </p>
        </div>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Ruler className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unidad.superficie} m²</p>
                <p className="text-sm text-muted-foreground">Superficie</p>
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
                <p className="text-2xl font-bold">
                  {unidad.moneda} {unidad.precioLista.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Precio Lista</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{compradores.length}</p>
                <p className="text-sm text-muted-foreground">Compradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{complementos.length}</p>
                <p className="text-sm text-muted-foreground">Complementos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="info" className="gap-2">
            <Building2 className="h-4 w-4" />
            Información
          </TabsTrigger>
          <TabsTrigger value="compradores" className="gap-2">
            <Users className="h-4 w-4" />
            Compradores
          </TabsTrigger>
          <TabsTrigger value="complementos" className="gap-2">
            <Car className="h-4 w-4" />
            Complementos
          </TabsTrigger>
          <TabsTrigger value="pagos" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Plan de Pagos
          </TabsTrigger>
          <TabsTrigger value="documentos" className="gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Unidad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Código</p>
                    <p className="font-medium">{unidad.codigo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-medium capitalize">{unidad.tipo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ubicación</p>
                    <p className="font-medium">
                      {unidad.piso !== undefined ? `Piso ${unidad.piso}` : 'N/A'}
                      {unidad.torre && ` - Torre ${unidad.torre}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ambientes</p>
                    <p className="font-medium">{unidad.ambientes || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Superficie</p>
                    <p className="font-medium">{unidad.superficie} m²</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Precio Lista</p>
                    <p className="font-medium">
                      {unidad.moneda} {unidad.precioLista.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total con Complementos</p>
                    <p className="font-medium text-lg">
                      {unidad.moneda} {totalUnidad.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <Badge className={`mt-1 ${estadoConfig[unidad.estado].color}`}>
                      {estadoConfig[unidad.estado].label}
                    </Badge>
                  </div>
                </div>
              </div>
              {unidad.descripcion && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground">Descripción</p>
                  <p className="mt-1">{unidad.descripcion}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compradores Tab */}
        <TabsContent value="compradores" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Compradores</CardTitle>
              <Dialog open={isCompradorDialogOpen} onOpenChange={setIsCompradorDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Comprador
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Comprador</DialogTitle>
                    <DialogDescription>
                      Asigne un cliente como comprador de esta unidad.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cliente">Cliente</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockClientes.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id}>
                              {cliente.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="porcentaje">Porcentaje de titularidad</Label>
                      <Input
                        id="porcentaje"
                        type="number"
                        placeholder="100"
                        max={100}
                        min={1}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCompradorDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => setIsCompradorDialogOpen(false)}>
                      Agregar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {compradores.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay compradores asignados a esta unidad.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Comprador</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Porcentaje</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="w-[100px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {compradores.map((comprador) => {
                      const cliente = mockClientes.find(
                        (c) => c.id === comprador.clienteId
                      );
                      return (
                        <TableRow key={comprador.id}>
                          <TableCell className="font-medium">
                            {cliente?.nombre || 'N/A'}
                          </TableCell>
                          <TableCell>{cliente?.documento || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{comprador.porcentaje}%</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(comprador.fechaAsignacion).toLocaleDateString('es-AR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Complementos Tab */}
        <TabsContent value="complementos" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Complementos</CardTitle>
              <Dialog open={isComplementoDialogOpen} onOpenChange={setIsComplementoDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Complemento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Complemento</DialogTitle>
                    <DialogDescription>
                      Agregue una cochera o baulera a esta unidad.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="tipoComp">Tipo</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cochera">Cochera</SelectItem>
                          <SelectItem value="baulera">Baulera</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="codigoComp">Código</Label>
                      <Input id="codigoComp" placeholder="Ej: C-01" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="precioComp">Precio (USD)</Label>
                      <Input id="precioComp" type="number" placeholder="Ej: 25000" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsComplementoDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => setIsComplementoDialogOpen(false)}>
                      Agregar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {complementos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay complementos asociados a esta unidad.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {complementos.map((complemento) => (
                    <div
                      key={complemento.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          {complemento.tipo === 'cochera' ? (
                            <Car className="h-5 w-5" />
                          ) : (
                            <Package className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium capitalize">
                            {complemento.tipo} {complemento.codigo}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {complemento.moneda} {complemento.precio.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total complementos:</span>
                      <span className="font-medium">
                        USD {totalComplementos.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plan de Pagos Tab */}
        <TabsContent value="pagos" className="mt-6">
          <div className="space-y-6">
            {/* Resumen */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Monto Total</p>
                  <p className="text-2xl font-bold">
                    USD {planPago?.montoTotal.toLocaleString() || totalUnidad.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total Pagado</p>
                  <p className="text-2xl font-bold text-success">
                    USD {totalPagado.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Saldo Pendiente</p>
                  <p className="text-2xl font-bold text-warning">
                    USD {saldoPendiente.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Cuotas */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Cuotas</CardTitle>
                {!planPago && (
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Plan de Pagos
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {cuotas.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay plan de pagos para esta unidad.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cuota</TableHead>
                        <TableHead>Vencimiento</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha Pago</TableHead>
                        <TableHead className="w-[100px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cuotas.map((cuota) => (
                        <TableRow key={cuota.id}>
                          <TableCell className="font-medium">
                            #{cuota.numero}
                          </TableCell>
                          <TableCell>
                            {new Date(cuota.fechaVencimiento).toLocaleDateString('es-AR')}
                          </TableCell>
                          <TableCell>
                            {cuota.moneda} {cuota.monto.toLocaleString()}
                            {cuota.interesMora && (
                              <span className="text-xs text-destructive ml-1">
                                (+{cuota.interesMora} mora)
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={estadoPagoConfig[cuota.estado].variant}>
                              {estadoPagoConfig[cuota.estado].label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {cuota.fechaPago
                              ? new Date(cuota.fechaPago).toLocaleDateString('es-AR')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {cuota.estado !== 'aprobado' && (
                              <Button variant="outline" size="sm">
                                Registrar Pago
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documentos Tab */}
        <TabsContent value="documentos" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Documentos</CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Subir Documento
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay documentos asociados a esta unidad.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

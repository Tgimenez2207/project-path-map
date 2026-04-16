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
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
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
  Calculator,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
} from 'lucide-react';
import { useObra, useUnidad, useComplementos, useCompradores, useClientes } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { EstadoUnidad, EstadoPago, PlanPago, Cuota } from '@/types';
import { usePlanPago } from '@/hooks/usePlanPago';

const estadoConfig: Record<EstadoUnidad, { label: string; color: string }> = {
  disponible: { label: 'Disponible', color: 'bg-success text-success-foreground' },
  reservada: { label: 'Reservada', color: 'bg-warning text-warning-foreground' },
  vendida: { label: 'Vendida', color: 'bg-primary text-primary-foreground' },
  bloqueada: { label: 'Bloqueada', color: 'bg-muted text-muted-foreground' },
};

const estadoPagoConfig: Record<EstadoPago, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle2 }> = {
  pendiente: { label: 'Pendiente', variant: 'outline', icon: Clock },
  aprobado: { label: 'Pagado', variant: 'default', icon: CheckCircle2 },
  rechazado: { label: 'Rechazado', variant: 'destructive', icon: AlertCircle },
  vencido: { label: 'Vencido', variant: 'destructive', icon: AlertCircle },
};

export default function UnidadDetalle() {
  const { obraId, unidadId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('info');
  const [isCompradorDialogOpen, setIsCompradorDialogOpen] = useState(false);
  const [isComplementoDialogOpen, setIsComplementoDialogOpen] = useState(false);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isPagoDialogOpen, setIsPagoDialogOpen] = useState(false);
  const [selectedCuota, setSelectedCuota] = useState<Cuota | null>(null);

  // Plan de pago state
  const [planConfig, setPlanConfig] = useState({
    cantidadCuotas: 12,
    anticipo: 0,
    tasaInteres: 0,
    fechaInicio: new Date().toISOString().split('T')[0],
  });

  const obra = mockObras.find((o) => o.id === obraId);
  const unidad = mockUnidades.find((u) => u.id === unidadId);
  const complementos = mockComplementos.filter((c) => c.unidadId === unidadId);
  const compradores = mockCompradores.filter((c) => c.unidadId === unidadId);

  const { planPago, cuotas, crearPlan, registrarPago, calcularResumen } = usePlanPago(unidadId || '');

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

  // Calcular totales
  const totalComplementos = complementos.reduce((acc, c) => acc + c.precio, 0);
  const totalUnidad = unidad.precioLista + totalComplementos;
  const resumen = calcularResumen(totalUnidad);

  const handleCrearPlan = () => {
    crearPlan({
      montoTotal: totalUnidad - planConfig.anticipo,
      cantidadCuotas: planConfig.cantidadCuotas,
      tasaInteres: planConfig.tasaInteres,
      fechaInicio: planConfig.fechaInicio,
      anticipo: planConfig.anticipo,
    });
    setIsPlanDialogOpen(false);
    toast({
      title: "Plan de pagos creado",
      description: `Se generaron ${planConfig.cantidadCuotas} cuotas correctamente.`,
    });
  };

  const handleRegistrarPago = (montoPagado: number) => {
    if (selectedCuota) {
      registrarPago(selectedCuota.id, montoPagado);
      setIsPagoDialogOpen(false);
      setSelectedCuota(null);
      toast({
        title: "Pago registrado",
        description: `Se registró el pago de USD ${montoPagado.toLocaleString()}.`,
      });
    }
  };

  const calcularCuotaPreview = () => {
    const montoFinanciar = totalUnidad - planConfig.anticipo;
    const interesMensual = planConfig.tasaInteres / 100;
    if (interesMensual === 0) {
      return montoFinanciar / planConfig.cantidadCuotas;
    }
    // Fórmula de cuota fija con interés
    const cuota = montoFinanciar * (interesMensual * Math.pow(1 + interesMensual, planConfig.cantidadCuotas)) /
      (Math.pow(1 + interesMensual, planConfig.cantidadCuotas) - 1);
    return cuota;
  };

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
                  USD {totalUnidad.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Precio Total</p>
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
            {/* Resumen de Deuda */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Monto Total</p>
                  </div>
                  <p className="text-2xl font-bold">
                    USD {resumen.montoTotal.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-success/10 border-success/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <p className="text-sm text-muted-foreground">Pagado</p>
                  </div>
                  <p className="text-2xl font-bold text-success">
                    USD {resumen.totalPagado.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {resumen.cuotasPagadas} de {resumen.totalCuotas} cuotas
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-warning/10 border-warning/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-warning" />
                    <p className="text-sm text-muted-foreground">Saldo Pendiente</p>
                  </div>
                  <p className="text-2xl font-bold text-warning">
                    USD {resumen.saldoPendiente.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card className={resumen.cuotasVencidas > 0 ? "bg-destructive/10 border-destructive/20" : ""}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className={`h-4 w-4 ${resumen.cuotasVencidas > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                    <p className="text-sm text-muted-foreground">Cuotas Vencidas</p>
                  </div>
                  <p className={`text-2xl font-bold ${resumen.cuotasVencidas > 0 ? 'text-destructive' : ''}`}>
                    {resumen.cuotasVencidas}
                  </p>
                  {resumen.montoVencido > 0 && (
                    <p className="text-xs text-destructive mt-1">
                      USD {resumen.montoVencido.toLocaleString()} vencido
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Progreso */}
            {planPago && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progreso de pago</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(resumen.porcentajePagado)}%
                    </span>
                  </div>
                  <Progress value={resumen.porcentajePagado} className="h-3" />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>USD {resumen.totalPagado.toLocaleString()} pagado</span>
                    <span>USD {resumen.saldoPendiente.toLocaleString()} restante</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cuotas o Crear Plan */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  {planPago ? `Plan de Pagos - ${planPago.cantidadCuotas} cuotas` : 'Plan de Pagos'}
                </CardTitle>
                {!planPago ? (
                  <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Calculator className="h-4 w-4 mr-2" />
                        Crear Plan de Pagos
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Crear Plan de Pagos</DialogTitle>
                        <DialogDescription>
                          Configure las condiciones del plan de financiación.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {/* Resumen del monto */}
                        <div className="p-4 rounded-lg bg-muted">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Precio unidad:</span>
                            <span>USD {unidad.precioLista.toLocaleString()}</span>
                          </div>
                          {totalComplementos > 0 && (
                            <div className="flex justify-between text-sm mb-1">
                              <span>Complementos:</span>
                              <span>USD {totalComplementos.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-medium pt-2 border-t mt-2">
                            <span>Total:</span>
                            <span>USD {totalUnidad.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="anticipo">Anticipo (USD)</Label>
                            <Input
                              id="anticipo"
                              type="number"
                              value={planConfig.anticipo}
                              onChange={(e) => setPlanConfig({ ...planConfig, anticipo: Number(e.target.value) })}
                              placeholder="0"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="cuotas">Cantidad de cuotas</Label>
                            <Select
                              value={String(planConfig.cantidadCuotas)}
                              onValueChange={(v) => setPlanConfig({ ...planConfig, cantidadCuotas: Number(v) })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[6, 12, 18, 24, 30, 36, 48, 60].map((n) => (
                                  <SelectItem key={n} value={String(n)}>{n} cuotas</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="interes">Tasa de interés mensual (%)</Label>
                            <Input
                              id="interes"
                              type="number"
                              step="0.1"
                              value={planConfig.tasaInteres}
                              onChange={(e) => setPlanConfig({ ...planConfig, tasaInteres: Number(e.target.value) })}
                              placeholder="0"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="fechaInicio">Fecha primera cuota</Label>
                            <Input
                              id="fechaInicio"
                              type="date"
                              value={planConfig.fechaInicio}
                              onChange={(e) => setPlanConfig({ ...planConfig, fechaInicio: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Preview del cálculo */}
                        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                          <p className="text-sm font-medium mb-2">Vista previa del plan</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">A financiar:</span>
                            </div>
                            <div className="text-right font-medium">
                              USD {(totalUnidad - planConfig.anticipo).toLocaleString()}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Valor cuota:</span>
                            </div>
                            <div className="text-right font-medium">
                              USD {calcularCuotaPreview().toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total a pagar:</span>
                            </div>
                            <div className="text-right font-medium">
                              USD {(planConfig.anticipo + calcularCuotaPreview() * planConfig.cantidadCuotas).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPlanDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleCrearPlan}>
                          Crear Plan
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Plan
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {cuotas.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">No hay plan de pagos para esta unidad.</p>
                    <p className="text-sm">Cree un plan para generar las cuotas automáticamente.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Cuota</TableHead>
                        <TableHead>Vencimiento</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha Pago</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cuotas.map((cuota) => {
                        const StatusIcon = estadoPagoConfig[cuota.estado].icon;
                        return (
                          <TableRow key={cuota.id} className={cuota.estado === 'vencido' ? 'bg-destructive/5' : ''}>
                            <TableCell className="font-medium">
                              #{cuota.numero}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {new Date(cuota.fechaVencimiento).toLocaleDateString('es-AR')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                USD {cuota.monto.toLocaleString()}
                                {cuota.interesMora && cuota.interesMora > 0 && (
                                  <span className="text-xs text-destructive block">
                                    +USD {cuota.interesMora} interés mora
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={estadoPagoConfig[cuota.estado].variant} className="gap-1">
                                <StatusIcon className="h-3 w-3" />
                                {estadoPagoConfig[cuota.estado].label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {cuota.fechaPago
                                ? new Date(cuota.fechaPago).toLocaleDateString('es-AR')
                                : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {cuota.estado !== 'aprobado' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCuota(cuota);
                                    setIsPagoDialogOpen(true);
                                  }}
                                >
                                  Registrar Pago
                                </Button>
                              )}
                              {cuota.estado === 'aprobado' && (
                                <span className="text-sm text-success flex items-center justify-end gap-1">
                                  <CheckCircle2 className="h-4 w-4" />
                                  Pagado
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
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

      {/* Dialog para registrar pago */}
      <Dialog open={isPagoDialogOpen} onOpenChange={setIsPagoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>
              {selectedCuota && (
                <>Cuota #{selectedCuota.numero} - Vence: {new Date(selectedCuota.fechaVencimiento).toLocaleDateString('es-AR')}</>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedCuota && (
            <RegistrarPagoForm
              cuota={selectedCuota}
              onConfirm={handleRegistrarPago}
              onCancel={() => {
                setIsPagoDialogOpen(false);
                setSelectedCuota(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente separado para el formulario de registro de pago
function RegistrarPagoForm({
  cuota,
  onConfirm,
  onCancel,
}: {
  cuota: Cuota;
  onConfirm: (monto: number) => void;
  onCancel: () => void;
}) {
  const montoTotal = cuota.monto + (cuota.interesMora || 0);
  const [montoPagado, setMontoPagado] = useState(montoTotal);
  const [metodoPago, setMetodoPago] = useState('transferencia');

  return (
    <>
      <div className="grid gap-4 py-4">
        <div className="p-4 rounded-lg bg-muted">
          <div className="flex justify-between text-sm mb-1">
            <span>Monto cuota:</span>
            <span>USD {cuota.monto.toLocaleString()}</span>
          </div>
          {cuota.interesMora && cuota.interesMora > 0 && (
            <div className="flex justify-between text-sm mb-1 text-destructive">
              <span>Interés por mora:</span>
              <span>USD {cuota.interesMora.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-medium pt-2 border-t mt-2">
            <span>Total a pagar:</span>
            <span>USD {montoTotal.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="montoPago">Monto pagado (USD)</Label>
          <Input
            id="montoPago"
            type="number"
            value={montoPagado}
            onChange={(e) => setMontoPagado(Number(e.target.value))}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="metodoPago">Método de pago</Label>
          <Select value={metodoPago} onValueChange={setMetodoPago}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transferencia">Transferencia bancaria</SelectItem>
              <SelectItem value="efectivo">Efectivo</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
              <SelectItem value="mercadopago">Mercado Pago</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={() => onConfirm(montoPagado)}>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Confirmar Pago
        </Button>
      </DialogFooter>
    </>
  );
}

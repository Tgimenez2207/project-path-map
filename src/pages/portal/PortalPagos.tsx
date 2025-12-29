import { useState } from 'react';
import { usePortal } from '@/contexts/PortalContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Loader2,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { mockUnidades, mockCompradores, mockPlanesPago, mockCuotas } from '@/data/mockUnidades';
import { Cuota, EstadoPago } from '@/types';

const estadoPagoConfig: Record<EstadoPago, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle2 }> = {
  pendiente: { label: 'Pendiente', variant: 'outline', icon: Clock },
  aprobado: { label: 'Pagado', variant: 'default', icon: CheckCircle2 },
  rechazado: { label: 'Rechazado', variant: 'destructive', icon: XCircle },
  vencido: { label: 'Vencido', variant: 'destructive', icon: AlertCircle },
};

type PagoStatus = 'idle' | 'processing' | 'success' | 'error';

export default function PortalPagos() {
  const { cliente } = usePortal();
  const { toast } = useToast();
  const [selectedCuota, setSelectedCuota] = useState<Cuota | null>(null);
  const [isPagoDialogOpen, setIsPagoDialogOpen] = useState(false);
  const [pagoStatus, setPagoStatus] = useState<PagoStatus>('idle');
  const [cuotasState, setCuotasState] = useState<Cuota[]>(mockCuotas);

  // Obtener unidades del cliente
  const compras = mockCompradores.filter((c) => c.clienteId === cliente?.id);
  const unidadesIds = compras.map((c) => c.unidadId);
  const unidades = mockUnidades.filter((u) => unidadesIds.includes(u.id));

  // Planes y cuotas del cliente
  const planesPago = mockPlanesPago.filter((p) => unidadesIds.includes(p.unidadId || ''));
  const cuotasCliente = planesPago.flatMap((p) =>
    cuotasState.filter((c) => c.planPagoId === p.id)
  );

  // Estadísticas
  const cuotasPagadas = cuotasCliente.filter((c) => c.estado === 'aprobado');
  const cuotasVencidas = cuotasCliente.filter((c) => c.estado === 'vencido');
  const cuotasPendientes = cuotasCliente.filter((c) => c.estado === 'pendiente');

  const totalPagado = cuotasPagadas.reduce((acc, c) => acc + (c.montoPagado || 0), 0);
  const totalDeuda = planesPago.reduce((acc, p) => acc + p.montoTotal, 0);
  const montoVencido = cuotasVencidas.reduce((acc, c) => acc + c.monto + (c.interesMora || 0), 0);
  const porcentajePagado = totalDeuda > 0 ? (totalPagado / totalDeuda) * 100 : 0;

  const handlePagarClick = (cuota: Cuota) => {
    setSelectedCuota(cuota);
    setPagoStatus('idle');
    setIsPagoDialogOpen(true);
  };

  const simularPagoMercadoPago = async () => {
    if (!selectedCuota) return;

    setPagoStatus('processing');

    // Simular proceso de pago (2-3 segundos)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simular resultado aleatorio (80% éxito, 20% rechazo)
    const exito = Math.random() > 0.2;

    if (exito) {
      setPagoStatus('success');
      
      // Actualizar estado de la cuota
      setCuotasState((prev) =>
        prev.map((c) =>
          c.id === selectedCuota.id
            ? {
                ...c,
                estado: 'aprobado' as EstadoPago,
                fechaPago: new Date().toISOString().split('T')[0],
                montoPagado: c.monto + (c.interesMora || 0),
              }
            : c
        )
      );

      toast({
        title: '¡Pago exitoso!',
        description: `Se procesó el pago de USD ${(selectedCuota.monto + (selectedCuota.interesMora || 0)).toLocaleString()}`,
      });

      // Cerrar dialog después de mostrar éxito
      setTimeout(() => {
        setIsPagoDialogOpen(false);
        setSelectedCuota(null);
        setPagoStatus('idle');
      }, 2000);
    } else {
      setPagoStatus('error');
      toast({
        title: 'Pago rechazado',
        description: 'La transacción fue rechazada. Intente nuevamente.',
        variant: 'destructive',
      });
    }
  };

  const getUnidadInfo = (planPagoId: string) => {
    const plan = planesPago.find((p) => p.id === planPagoId);
    const unidad = unidades.find((u) => u.id === plan?.unidadId);
    return unidad ? `Unidad ${unidad.codigo}` : 'N/A';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold">Mis Pagos</h1>
        <p className="text-muted-foreground">
          Gestione sus cuotas y realice pagos con Mercado Pago.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">USD {totalDeuda.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Financiado</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">
                  USD {totalPagado.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Pagado</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">
                  USD {(totalDeuda - totalPagado).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Saldo Pendiente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={montoVencido > 0 ? 'border-destructive/50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${montoVencido > 0 ? 'bg-destructive/10' : 'bg-muted'}`}>
                <AlertCircle className={`h-5 w-5 ${montoVencido > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${montoVencido > 0 ? 'text-destructive' : ''}`}>
                  USD {montoVencido.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Monto Vencido</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progreso de pago total</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(porcentajePagado)}%
            </span>
          </div>
          <Progress value={porcentajePagado} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{cuotasPagadas.length} cuotas pagadas</span>
            <span>{cuotasPendientes.length + cuotasVencidas.length} cuotas pendientes</span>
          </div>
        </CardContent>
      </Card>

      {/* Cuotas Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Detalle de Cuotas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cuotasCliente.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay cuotas asociadas a su cuenta.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cuota</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cuotasCliente
                  .sort((a, b) => {
                    // Vencidas primero, luego pendientes, luego pagadas
                    const order = { vencido: 0, pendiente: 1, aprobado: 2, rechazado: 3 };
                    return order[a.estado] - order[b.estado];
                  })
                  .map((cuota) => {
                    const StatusIcon = estadoPagoConfig[cuota.estado].icon;
                    const montoTotal = cuota.monto + (cuota.interesMora || 0);

                    return (
                      <TableRow
                        key={cuota.id}
                        className={cuota.estado === 'vencido' ? 'bg-destructive/5' : ''}
                      >
                        <TableCell className="font-medium">#{cuota.numero}</TableCell>
                        <TableCell>{getUnidadInfo(cuota.planPagoId)}</TableCell>
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
                                +USD {cuota.interesMora} mora
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
                        <TableCell className="text-right">
                          {cuota.estado === 'aprobado' ? (
                            <span className="text-sm text-success flex items-center justify-end gap-1">
                              <CheckCircle2 className="h-4 w-4" />
                              Pagado
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handlePagarClick(cuota)}
                              className="bg-[#009ee3] hover:bg-[#007eb5]"
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Pagar
                            </Button>
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

      {/* Mercado Pago Dialog */}
      <Dialog open={isPagoDialogOpen} onOpenChange={setIsPagoDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <img
                src="https://http2.mlstatic.com/frontend-assets/mp-web-navigation/ui-navigation/6.6.92/mercadopago/logo__large@2x.png"
                alt="Mercado Pago"
                className="h-6"
              />
            </DialogTitle>
            <DialogDescription>
              Pago seguro con Mercado Pago
            </DialogDescription>
          </DialogHeader>

          {selectedCuota && (
            <div className="py-4">
              {pagoStatus === 'idle' && (
                <>
                  <div className="p-4 rounded-lg bg-muted mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Cuota #{selectedCuota.numero}</span>
                      <span>{getUnidadInfo(selectedCuota.planPagoId)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Vencimiento</span>
                      <span>{new Date(selectedCuota.fechaVencimiento).toLocaleDateString('es-AR')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Monto cuota</span>
                      <span>USD {selectedCuota.monto.toLocaleString()}</span>
                    </div>
                    {selectedCuota.interesMora && selectedCuota.interesMora > 0 && (
                      <div className="flex justify-between text-sm text-destructive">
                        <span>Interés mora</span>
                        <span>USD {selectedCuota.interesMora.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-3 mt-3 border-t">
                      <span>Total a pagar</span>
                      <span>USD {(selectedCuota.monto + (selectedCuota.interesMora || 0)).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <ShieldCheck className="h-4 w-4 text-success" />
                    Pago protegido por Mercado Pago
                  </div>
                </>
              )}

              {pagoStatus === 'processing' && (
                <div className="text-center py-8">
                  <Loader2 className="h-12 w-12 mx-auto mb-4 text-[#009ee3] animate-spin" />
                  <p className="font-medium">Procesando pago...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Por favor espere, no cierre esta ventana.
                  </p>
                </div>
              )}

              {pagoStatus === 'success' && (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  </div>
                  <p className="font-medium text-lg text-success">¡Pago exitoso!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Su pago ha sido procesado correctamente.
                  </p>
                </div>
              )}

              {pagoStatus === 'error' && (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                    <XCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <p className="font-medium text-lg text-destructive">Pago rechazado</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    La transacción no pudo ser procesada.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {pagoStatus === 'idle' && (
              <>
                <Button variant="outline" onClick={() => setIsPagoDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={simularPagoMercadoPago}
                  className="bg-[#009ee3] hover:bg-[#007eb5]"
                >
                  Confirmar Pago
                </Button>
              </>
            )}
            {pagoStatus === 'error' && (
              <>
                <Button variant="outline" onClick={() => setIsPagoDialogOpen(false)}>
                  Cerrar
                </Button>
                <Button
                  onClick={() => setPagoStatus('idle')}
                  className="bg-[#009ee3] hover:bg-[#007eb5]"
                >
                  Reintentar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

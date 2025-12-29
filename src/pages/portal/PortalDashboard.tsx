import { usePortal } from '@/contexts/PortalContext';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Home,
  CreditCard,
  FileText,
  Camera,
  ArrowRight,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { mockUnidades, mockCompradores, mockPlanesPago, mockCuotas } from '@/data/mockUnidades';
import { mockObras } from '@/data/mockObras';

export default function PortalDashboard() {
  const { cliente } = usePortal();

  // Obtener unidades del cliente
  const compras = mockCompradores.filter((c) => c.clienteId === cliente?.id);
  const unidadesIds = compras.map((c) => c.unidadId);
  const unidades = mockUnidades.filter((u) => unidadesIds.includes(u.id));

  // Calcular estadísticas de pagos
  const planesPago = mockPlanesPago.filter((p) => unidadesIds.includes(p.unidadId || ''));
  const todasLasCuotas = planesPago.flatMap((p) =>
    mockCuotas.filter((c) => c.planPagoId === p.id)
  );

  const cuotasPagadas = todasLasCuotas.filter((c) => c.estado === 'aprobado');
  const cuotasVencidas = todasLasCuotas.filter((c) => c.estado === 'vencido');
  const cuotasPendientes = todasLasCuotas.filter((c) => c.estado === 'pendiente');
  const proximaCuota = cuotasPendientes[0] || cuotasVencidas[0];

  const totalPagado = cuotasPagadas.reduce((acc, c) => acc + (c.montoPagado || 0), 0);
  const totalDeuda = planesPago.reduce((acc, p) => acc + p.montoTotal, 0);
  const porcentajePagado = totalDeuda > 0 ? (totalPagado / totalDeuda) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold">
          ¡Hola, {cliente?.nombre?.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground">
          Bienvenido a su portal de cliente. Aquí puede ver sus unidades, pagos y documentación.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Home className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unidades.length}</p>
                <p className="text-sm text-muted-foreground">Mis Unidades</p>
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
                <p className="text-2xl font-bold">{cuotasPagadas.length}</p>
                <p className="text-sm text-muted-foreground">Cuotas Pagadas</p>
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
                <p className="text-2xl font-bold">{cuotasPendientes.length}</p>
                <p className="text-sm text-muted-foreground">Cuotas Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cuotasVencidas.length > 0 ? 'border-destructive/50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${cuotasVencidas.length > 0 ? 'bg-destructive/10' : 'bg-muted'}`}>
                <AlertCircle className={`h-5 w-5 ${cuotasVencidas.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${cuotasVencidas.length > 0 ? 'text-destructive' : ''}`}>
                  {cuotasVencidas.length}
                </p>
                <p className="text-sm text-muted-foreground">Cuotas Vencidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress & Next Payment */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Progreso de Pagos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Total pagado</span>
                  <span className="font-medium">{Math.round(porcentajePagado)}%</span>
                </div>
                <Progress value={porcentajePagado} className="h-3" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-sm text-muted-foreground">Pagado</p>
                  <p className="text-lg font-semibold text-success">
                    USD {totalPagado.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendiente</p>
                  <p className="text-lg font-semibold">
                    USD {(totalDeuda - totalPagado).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Payment */}
        <Card className={proximaCuota?.estado === 'vencido' ? 'border-destructive/50' : ''}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Próximo Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            {proximaCuota ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Cuota #{proximaCuota.numero}</p>
                    <p className="text-sm text-muted-foreground">
                      Vence: {new Date(proximaCuota.fechaVencimiento).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  <Badge variant={proximaCuota.estado === 'vencido' ? 'destructive' : 'outline'}>
                    {proximaCuota.estado === 'vencido' ? 'Vencida' : 'Pendiente'}
                  </Badge>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Monto a pagar</p>
                  <p className="text-2xl font-bold">
                    USD {(proximaCuota.monto + (proximaCuota.interesMora || 0)).toLocaleString()}
                  </p>
                  {proximaCuota.interesMora && proximaCuota.interesMora > 0 && (
                    <p className="text-xs text-destructive mt-1">
                      Incluye USD {proximaCuota.interesMora} de interés por mora
                    </p>
                  )}
                </div>
                <Link to="/portal/pagos">
                  <Button className="w-full">
                    Pagar Ahora
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-success" />
                <p>¡Está al día con sus pagos!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* My Units */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Mis Unidades</CardTitle>
          <Link to="/portal/unidades">
            <Button variant="ghost" size="sm">
              Ver todas <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {unidades.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tiene unidades asociadas.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unidades.map((unidad) => {
                const obra = mockObras.find((o) => o.id === unidad.obraId);
                return (
                  <div
                    key={unidad.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Unidad {unidad.codigo}</p>
                        <p className="text-sm text-muted-foreground">
                          {obra?.nombre} • {unidad.superficie} m²
                        </p>
                      </div>
                    </div>
                    <Badge variant="default">
                      {unidad.estado === 'vendida' ? 'Comprada' : unidad.estado}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/portal/documentos">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-info/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="font-medium">Documentación</p>
                <p className="text-sm text-muted-foreground">
                  Ver contratos y documentos
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/portal/avance">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Camera className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="font-medium">Avance de Obra</p>
                <p className="text-sm text-muted-foreground">
                  Fotos y reportes de avance
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/portal/pagos">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="font-medium">Realizar Pago</p>
                <p className="text-sm text-muted-foreground">
                  Pagar con Mercado Pago
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

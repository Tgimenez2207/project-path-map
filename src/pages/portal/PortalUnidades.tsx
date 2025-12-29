import { usePortal } from '@/contexts/PortalContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Building2,
  MapPin,
  Ruler,
  DollarSign,
  Car,
  Package,
} from 'lucide-react';
import { mockUnidades, mockCompradores, mockComplementos, mockPlanesPago, mockCuotas } from '@/data/mockUnidades';
import { mockObras } from '@/data/mockObras';
import { EstadoUnidad } from '@/types';

const estadoConfig: Record<EstadoUnidad, { label: string; color: string }> = {
  disponible: { label: 'Disponible', color: 'bg-success text-success-foreground' },
  reservada: { label: 'Reservada', color: 'bg-warning text-warning-foreground' },
  vendida: { label: 'Comprada', color: 'bg-primary text-primary-foreground' },
  bloqueada: { label: 'Bloqueada', color: 'bg-muted text-muted-foreground' },
};

export default function PortalUnidades() {
  const { cliente } = usePortal();

  // Obtener unidades del cliente
  const compras = mockCompradores.filter((c) => c.clienteId === cliente?.id);
  const unidadesIds = compras.map((c) => c.unidadId);
  const unidades = mockUnidades.filter((u) => unidadesIds.includes(u.id));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold">Mis Unidades</h1>
        <p className="text-muted-foreground">
          Detalle de las unidades que ha adquirido.
        </p>
      </div>

      {unidades.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tiene unidades asociadas a su cuenta.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {unidades.map((unidad) => {
            const obra = mockObras.find((o) => o.id === unidad.obraId);
            const compra = compras.find((c) => c.unidadId === unidad.id);
            const complementos = mockComplementos.filter((c) => c.unidadId === unidad.id);
            const planPago = mockPlanesPago.find((p) => p.unidadId === unidad.id);
            const cuotas = planPago ? mockCuotas.filter((c) => c.planPagoId === planPago.id) : [];
            
            const cuotasPagadas = cuotas.filter((c) => c.estado === 'aprobado');
            const totalPagado = cuotasPagadas.reduce((acc, c) => acc + (c.montoPagado || 0), 0);
            const porcentajePagado = planPago ? (totalPagado / planPago.montoTotal) * 100 : 0;

            const totalComplementos = complementos.reduce((acc, c) => acc + c.precio, 0);
            const totalUnidad = unidad.precioLista + totalComplementos;

            return (
              <Card key={unidad.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Unidad {unidad.codigo}</CardTitle>
                        <p className="text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4" />
                          {obra?.nombre}
                        </p>
                      </div>
                    </div>
                    <Badge className={estadoConfig[unidad.estado].color}>
                      {estadoConfig[unidad.estado].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Info */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Información de la Unidad</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Ruler className="h-4 w-4" />
                            Superficie
                          </div>
                          <p className="font-semibold mt-1">{unidad.superficie} m²</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Building2 className="h-4 w-4" />
                            Ubicación
                          </div>
                          <p className="font-semibold mt-1">
                            {unidad.piso !== undefined ? `Piso ${unidad.piso}` : 'N/A'}
                            {unidad.torre && ` - Torre ${unidad.torre}`}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <DollarSign className="h-4 w-4" />
                            Precio
                          </div>
                          <p className="font-semibold mt-1">
                            USD {unidad.precioLista.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <div className="text-muted-foreground text-sm">Titularidad</div>
                          <p className="font-semibold mt-1">{compra?.porcentaje || 100}%</p>
                        </div>
                      </div>

                      {/* Complementos */}
                      {complementos.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3">Complementos</h4>
                          <div className="space-y-2">
                            {complementos.map((comp) => (
                              <div
                                key={comp.id}
                                className="flex items-center justify-between p-3 rounded-lg border"
                              >
                                <div className="flex items-center gap-3">
                                  {comp.tipo === 'cochera' ? (
                                    <Car className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span className="capitalize">
                                    {comp.tipo} {comp.codigo}
                                  </span>
                                </div>
                                <span className="font-medium">
                                  USD {comp.precio.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Pagos */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Estado de Pagos</h4>
                      
                      {planPago ? (
                        <>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Progreso</span>
                              <span className="font-medium">{Math.round(porcentajePagado)}%</span>
                            </div>
                            <Progress value={porcentajePagado} className="h-2" />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                              <p className="text-sm text-muted-foreground">Pagado</p>
                              <p className="text-lg font-bold text-success">
                                USD {totalPagado.toLocaleString()}
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                              <p className="text-sm text-muted-foreground">Pendiente</p>
                              <p className="text-lg font-bold text-warning">
                                USD {(planPago.montoTotal - totalPagado).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            <p>Plan de {planPago.cantidadCuotas} cuotas</p>
                            <p>{cuotasPagadas.length} cuotas pagadas de {cuotas.length}</p>
                          </div>
                        </>
                      ) : (
                        <div className="p-4 rounded-lg border text-center">
                          <p className="text-muted-foreground">
                            No hay plan de pagos configurado.
                          </p>
                          <p className="text-lg font-bold mt-2">
                            Total: USD {totalUnidad.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { EstadoUnidad } from '@/types';

const estadoConfig: Record<EstadoUnidad, { label: string; color: string }> = {
  disponible: { label: 'Disponible', color: 'bg-success text-success-foreground' },
  reservada: { label: 'Reservada', color: 'bg-warning text-warning-foreground' },
  vendida: { label: 'Comprada', color: 'bg-primary text-primary-foreground' },
  bloqueada: { label: 'Bloqueada', color: 'bg-muted text-muted-foreground' },
};

export default function PortalUnidades() {
  const { cliente } = usePortal();
  const [unidades, setUnidades] = useState<any[]>([]);
  const [compras, setCompras] = useState<any[]>([]);
  const [obras, setObras] = useState<any[]>([]);
  const [complementos, setComplementos] = useState<any[]>([]);
  const [planes, setPlanes] = useState<any[]>([]);
  const [cuotas, setCuotas] = useState<any[]>([]);

  useEffect(() => {
    if (!cliente) return;
    const fetch = async () => {
      const { data: comprasData } = await supabase.from('compradores').select('*').eq('cliente_id', cliente.id);
      if (!comprasData || comprasData.length === 0) return;
      setCompras(comprasData);
      const uIds = comprasData.map(c => c.unidad_id);

      const [unisRes, compsRes, planesRes] = await Promise.all([
        supabase.from('unidades').select('*').in('id', uIds),
        supabase.from('complementos').select('*').in('unidad_id', uIds),
        supabase.from('planes_pago').select('*').in('unidad_id', uIds),
      ]);
      setUnidades(unisRes.data || []);
      setComplementos(compsRes.data || []);
      setPlanes(planesRes.data || []);

      const obraIds = [...new Set((unisRes.data || []).map(u => u.obra_id))];
      if (obraIds.length > 0) {
        const { data: obrasData } = await supabase.from('obras').select('*').in('id', obraIds);
        setObras(obrasData || []);
      }

      if (planesRes.data && planesRes.data.length > 0) {
        const planIds = planesRes.data.map(p => p.id);
        const { data: cuotasData } = await supabase.from('cuotas').select('*').in('plan_pago_id', planIds);
        setCuotas(cuotasData || []);
      }
    };
    fetch();
  }, [cliente]);

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
            const obra = obras.find((o) => o.id === unidad.obra_id);
            const compra = compras.find((c) => c.unidad_id === unidad.id);
            const uComps = complementos.filter((c) => c.unidad_id === unidad.id);
            const planPago = planes.find((p) => p.unidad_id === unidad.id);
            const uCuotas = planPago ? cuotas.filter((c) => c.plan_pago_id === planPago.id) : [];
            
            const cuotasPagadas = uCuotas.filter((c) => c.estado === 'aprobado');
            const totalPagado = cuotasPagadas.reduce((acc, c) => acc + Number(c.monto_pagado || 0), 0);
            const porcentajePagado = planPago ? (totalPagado / Number(planPago.monto_total)) * 100 : 0;

            const totalComplementos = uComps.reduce((acc, c) => acc + Number(c.precio), 0);
            const totalUnidad = Number(unidad.precio_lista) + totalComplementos;

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
                    <Badge className={estadoConfig[unidad.estado as EstadoUnidad]?.color || ''}>
                      {estadoConfig[unidad.estado as EstadoUnidad]?.label || unidad.estado}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
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
                            {unidad.piso !== null ? `Piso ${unidad.piso}` : 'N/A'}
                            {unidad.torre && ` - Torre ${unidad.torre}`}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <DollarSign className="h-4 w-4" />
                            Precio
                          </div>
                          <p className="font-semibold mt-1">
                            USD {Number(unidad.precio_lista).toLocaleString()}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <div className="text-muted-foreground text-sm">Titularidad</div>
                          <p className="font-semibold mt-1">{compra?.porcentaje || 100}%</p>
                        </div>
                      </div>

                      {uComps.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3">Complementos</h4>
                          <div className="space-y-2">
                            {uComps.map((comp) => (
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
                                  USD {Number(comp.precio).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

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
                                USD {(Number(planPago.monto_total) - totalPagado).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            <p>Plan de {planPago.cantidad_cuotas} cuotas</p>
                            <p>{cuotasPagadas.length} cuotas pagadas de {uCuotas.length}</p>
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

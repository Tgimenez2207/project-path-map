import { useState, useCallback } from 'react';
import { PlanPago, Cuota, EstadoPago } from '@/types';
import { mockPlanesPago, mockCuotas } from '@/data/mockUnidades';

interface PlanPagoConfig {
  montoTotal: number;
  cantidadCuotas: number;
  tasaInteres: number;
  fechaInicio: string;
  anticipo?: number;
}

interface ResumenPago {
  montoTotal: number;
  totalPagado: number;
  saldoPendiente: number;
  cuotasPagadas: number;
  cuotasVencidas: number;
  cuotasPendientes: number;
  totalCuotas: number;
  montoVencido: number;
  porcentajePagado: number;
}

export function usePlanPago(unidadId: string) {
  // Buscar plan existente
  const planExistente = mockPlanesPago.find((p) => p.unidadId === unidadId);
  const cuotasExistentes = planExistente
    ? mockCuotas.filter((c) => c.planPagoId === planExistente.id)
    : [];

  const [planPago, setPlanPago] = useState<PlanPago | null>(planExistente || null);
  const [cuotas, setCuotas] = useState<Cuota[]>(cuotasExistentes);

  const crearPlan = useCallback((config: PlanPagoConfig) => {
    const nuevoPlan: PlanPago = {
      id: `plan-${Date.now()}`,
      unidadId,
      nombre: `Plan ${config.cantidadCuotas} cuotas`,
      montoTotal: config.montoTotal,
      moneda: 'USD',
      cantidadCuotas: config.cantidadCuotas,
      tasaInteres: config.tasaInteres,
      fechaInicio: config.fechaInicio,
    };

    // Calcular valor de cuota
    const interesMensual = config.tasaInteres / 100;
    let valorCuota: number;

    if (interesMensual === 0) {
      valorCuota = config.montoTotal / config.cantidadCuotas;
    } else {
      // Fórmula de cuota fija con interés compuesto
      valorCuota =
        config.montoTotal *
        (interesMensual * Math.pow(1 + interesMensual, config.cantidadCuotas)) /
        (Math.pow(1 + interesMensual, config.cantidadCuotas) - 1);
    }

    // Generar cuotas
    const nuevasCuotas: Cuota[] = [];
    const fechaBase = new Date(config.fechaInicio);
    const hoy = new Date();

    for (let i = 1; i <= config.cantidadCuotas; i++) {
      const fechaVencimiento = new Date(fechaBase);
      fechaVencimiento.setMonth(fechaBase.getMonth() + (i - 1));

      const estaVencida = fechaVencimiento < hoy;

      nuevasCuotas.push({
        id: `cuota-${Date.now()}-${i}`,
        planPagoId: nuevoPlan.id,
        numero: i,
        monto: Math.round(valorCuota * 100) / 100,
        moneda: 'USD',
        fechaVencimiento: fechaVencimiento.toISOString().split('T')[0],
        estado: estaVencida ? 'vencido' : 'pendiente',
        interesMora: estaVencida ? Math.round(valorCuota * 0.02 * 100) / 100 : 0, // 2% de mora
      });
    }

    setPlanPago(nuevoPlan);
    setCuotas(nuevasCuotas);
  }, [unidadId]);

  const registrarPago = useCallback((cuotaId: string, montoPagado: number) => {
    setCuotas((prevCuotas) =>
      prevCuotas.map((cuota) =>
        cuota.id === cuotaId
          ? {
              ...cuota,
              estado: 'aprobado' as EstadoPago,
              fechaPago: new Date().toISOString().split('T')[0],
              montoPagado,
            }
          : cuota
      )
    );
  }, []);

  const calcularResumen = useCallback((montoTotalUnidad: number): ResumenPago => {
    if (!planPago || cuotas.length === 0) {
      return {
        montoTotal: montoTotalUnidad,
        totalPagado: 0,
        saldoPendiente: montoTotalUnidad,
        cuotasPagadas: 0,
        cuotasVencidas: 0,
        cuotasPendientes: 0,
        totalCuotas: 0,
        montoVencido: 0,
        porcentajePagado: 0,
      };
    }

    const cuotasPagadas = cuotas.filter((c) => c.estado === 'aprobado');
    const cuotasVencidas = cuotas.filter((c) => c.estado === 'vencido');
    const cuotasPendientes = cuotas.filter((c) => c.estado === 'pendiente');

    const totalPagado = cuotasPagadas.reduce((acc, c) => acc + (c.montoPagado || 0), 0);
    const montoVencido = cuotasVencidas.reduce((acc, c) => acc + c.monto + (c.interesMora || 0), 0);
    const saldoPendiente = planPago.montoTotal - totalPagado;

    return {
      montoTotal: planPago.montoTotal,
      totalPagado,
      saldoPendiente,
      cuotasPagadas: cuotasPagadas.length,
      cuotasVencidas: cuotasVencidas.length,
      cuotasPendientes: cuotasPendientes.length,
      totalCuotas: cuotas.length,
      montoVencido,
      porcentajePagado: (totalPagado / planPago.montoTotal) * 100,
    };
  }, [planPago, cuotas]);

  const actualizarEstadoCuotas = useCallback(() => {
    const hoy = new Date();
    setCuotas((prevCuotas) =>
      prevCuotas.map((cuota) => {
        if (cuota.estado === 'aprobado') return cuota;
        
        const fechaVencimiento = new Date(cuota.fechaVencimiento);
        if (fechaVencimiento < hoy && cuota.estado === 'pendiente') {
          return {
            ...cuota,
            estado: 'vencido' as EstadoPago,
            interesMora: Math.round(cuota.monto * 0.02 * 100) / 100,
          };
        }
        return cuota;
      })
    );
  }, []);

  return {
    planPago,
    cuotas,
    crearPlan,
    registrarPago,
    calcularResumen,
    actualizarEstadoCuotas,
  };
}

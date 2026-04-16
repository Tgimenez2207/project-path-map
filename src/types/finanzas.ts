export type PeriodoFinanciero = 'mes' | 'trimestre' | 'anio';
export type TipoMovimientoFinanciero = 'cobro' | 'pago';

export interface MovimientoCaja {
  id: string;
  fecha: string;
  tipo: TipoMovimientoFinanciero;
  concepto: string;
  monto: number;
  moneda: 'USD' | 'ARS';
  obraId?: string;
  obraNombre?: string;
  contraparte: string;
  pagado: boolean;
  vencimiento: string;
}

export interface RentabilidadObra {
  obraId: string;
  obraNombre: string;
  ingresos: number;
  costos: number;
  utilidad: number;
  margen: number;
  moneda: 'USD' | 'ARS';
  estado: 'ok' | 'warning' | 'danger';
}

export interface FlujoCajaMes {
  mes: string;
  anio: number;
  ingresos: number;
  egresos: number;
  neto: number;
}

export interface DesgloseCosto {
  rubro: string;
  monto: number;
  porcentaje: number;
  estado: 'ok' | 'warning' | 'danger';
}

export interface ResumenFinanciero {
  facturacionTotal: number;
  facturacionAnterior: number;
  costosTotal: number;
  costosAnterior: number;
  utilidadNeta: number;
  margenNeto: number;
  flujoCajaLibre: number;
  porCobrar: number;
  porPagar: number;
  moneda: 'USD' | 'ARS';
}

export interface AnalisisIAFinanciero {
  resumen: string;
  alertas: string[];
  proyeccion: string;
  recomendaciones: string[];
  generadoEn: string;
}

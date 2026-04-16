export type SeveridadAlerta = 'critica' | 'advertencia' | 'info';
export type ModuloAlerta =
  | 'obras' | 'presupuesto' | 'cronograma' | 'documentacion'
  | 'clientes' | 'proveedores' | 'stock' | 'general';

export interface AlertaBriefing {
  id: string;
  severidad: SeveridadAlerta;
  titulo: string;
  descripcion: string;
  obraNombre?: string;
  modulo: ModuloAlerta;
  accionSugerida?: string;
}

export interface EstadoObra {
  id: string;
  nombre: string;
  progreso: number;
  progresoAnterior: number;
  alertas: string[];
  estado: 'ok' | 'warning' | 'danger';
}

export interface ItemAgenda {
  orden: number;
  accion: string;
  contexto: string;
  urgencia: 'urgente' | 'esta_semana' | 'planificar';
  modulo: ModuloAlerta;
}

export interface KPIBriefing {
  obrasActivas: number;
  obrasEnRutaCritica: number;
  avancePromedio: number;
  avanceAnterior: number;
  pagosPendientesUSD: number;
  cantProveedoresPendientes: number;
  clientesEnRiesgo: number;
}

export interface BriefingData {
  generadoEn: string;
  semana: string;
  kpis: KPIBriefing;
  alertas: AlertaBriefing[];
  obras: EstadoObra[];
  agenda: ItemAgenda[];
  resumenEjecutivo: string;
  saludoPersonalizado: string;
}

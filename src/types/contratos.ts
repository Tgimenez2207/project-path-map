export type TipoContrato =
  | 'compraventa'
  | 'locacion_obra'
  | 'subcontrato'
  | 'provision'
  | 'honorarios'
  | 'alquiler'
  | 'otro';

export type EstadoContrato =
  | 'borrador'
  | 'revision'
  | 'pendiente_firma'
  | 'firmado'
  | 'en_ejecucion'
  | 'finalizado'
  | 'rescindido';

export type ParteContrato = 'cliente' | 'contratista' | 'proveedor' | 'otro';

export interface Parte {
  tipo: ParteContrato;
  nombre: string;
  cuit?: string;
  domicilio?: string;
  representante?: string;
  dni?: string;
}

export interface HitoContractual {
  id: string;
  descripcion: string;
  fechaEstimada: string;
  fechaReal?: string;
  monto?: number;
  cumplido: boolean;
}

export interface Contrato {
  id: string;
  numero: string;
  tipo: TipoContrato;
  titulo: string;
  estado: EstadoContrato;
  parteA: Parte;
  parteB: Parte;
  obraId?: string;
  obraNombre?: string;
  fechaCreacion: string;
  fechaInicio: string;
  fechaFin?: string;
  fechaFirma?: string;
  montoTotal: number;
  moneda: 'USD' | 'ARS';
  formaPago: string;
  hitos: HitoContractual[];
  cuerpo: string;
  plantillaId?: string;
  adjuntos: string[];
  notas: string;
  creadoPor: string;
  version: number;
}

export interface PlantillaContrato {
  id: string;
  nombre: string;
  tipo: TipoContrato;
  descripcion: string;
  cuerpo: string;
  variables: string[];
}

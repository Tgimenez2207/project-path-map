export type RubroProveedor =
  | 'materiales'
  | 'subcontratista'
  | 'servicio_profesional'
  | 'equipamiento'
  | 'otro';

export type EstadoProveedor = 'activo' | 'inactivo' | 'en_evaluacion';

export interface Cotizacion {
  id: string;
  fecha: string;
  descripcion: string;
  monto: number;
  moneda: 'USD' | 'ARS';
  obraId?: string;
  ganada: boolean;
}

export interface Evaluacion {
  id: string;
  fecha: string;
  obraId?: string;
  obraNombre?: string;
  autor: string;
  puntualidad: number;
  calidad: number;
  precio: number;
  comunicacion: number;
  comentario: string;
}

export interface Proveedor {
  id: string;
  razonSocial: string;
  rubro: RubroProveedor;
  subrubro: string;
  contacto: string;
  telefono: string;
  email: string;
  ciudad: string;
  provincia: string;
  cuit?: string;
  web?: string;
  estado: EstadoProveedor;
  evaluaciones: Evaluacion[];
  cotizaciones: Cotizacion[];
  notas: string;
  creadoEn: string;
  enriquecidoIA?: boolean;
  resumenIA?: string;
}

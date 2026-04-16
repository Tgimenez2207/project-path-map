export type TipoCliente = 'comprador_unidad' | 'empresa_contratante';
export type EstadoCliente = 'activo' | 'inactivo' | 'prospecto' | 'en_conflicto';

export interface PagoRegistrado {
  id: string;
  fecha: string;
  monto: number;
  moneda: 'USD' | 'ARS';
  concepto: string;
  pagadoEnFecha: boolean;
  diasDemora: number;
  obraId?: string;
  obraNombre?: string;
}

export interface InteraccionCliente {
  id: string;
  fecha: string;
  tipo: 'consulta' | 'reclamo' | 'felicitacion' | 'reunion' | 'otro';
  descripcion: string;
  resolucion?: string;
  autor: string;
  obraId?: string;
  obraNombre?: string;
  tono: 'positivo' | 'neutro' | 'negativo';
}

export interface EvaluacionCliente {
  id: string;
  fecha: string;
  obraId?: string;
  obraNombre?: string;
  autor: string;
  puntualidadPagos: number;
  comunicacion: number;
  flexibilidad: number;
  cumplimientoAcuerdos: number;
  recomendaria: boolean;
  comentario: string;
}

export interface ScoreIA {
  scoreGlobal: number;
  probabilidadPagoTiempo: number;
  riesgoConflicto: number;
  potencialRecompra: number;
  segmento: 'premium' | 'estandar' | 'riesgo' | 'sin_datos';
  resumen: string;
  alertas: string[];
  recomendaciones: string[];
  generadoEn: string;
}

export interface Cliente {
  id: string;
  tipo: TipoCliente;
  nombre?: string;
  apellido?: string;
  dni?: string;
  razonSocial?: string;
  cuit?: string;
  rubro?: string;
  email: string;
  telefono: string;
  ciudad: string;
  provincia: string;
  estado: EstadoCliente;
  obrasRelacionadas: string[];
  unidadesCompradas: number;
  montoTotalOperado: number;
  moneda: 'USD' | 'ARS';
  pagos: PagoRegistrado[];
  interacciones: InteraccionCliente[];
  evaluaciones: EvaluacionCliente[];
  scoreIA?: ScoreIA;
  notas: string;
  creadoEn: string;
}

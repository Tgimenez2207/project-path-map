export type RubroGremio =
  | 'electricista' | 'gasista' | 'plomero' | 'albanil'
  | 'pintor' | 'carpintero' | 'yesero' | 'impermeabilizador'
  | 'climatizacion' | 'otro';

export type EstadoCobro = 'cobrado' | 'pendiente' | 'vencido' | 'cancelado';

export type EstadoTrabajo = 'en_curso' | 'finalizado' | 'presupuestado' | 'cancelado';

export interface EntradaBitacora {
  id: string;
  fecha: string; // ISO date
  hora?: string;
  texto: string;
  fotos?: string[];
  tipo?: 'avance' | 'problema' | 'material' | 'visita' | 'nota';
}

export interface TrabajoGremio {
  id: string;
  descripcion: string;
  cliente: string;
  direccion: string;
  fecha: string;
  monto: number;
  estadoCobro: EstadoCobro;
  estadoTrabajo: EstadoTrabajo;
  fechaVencimientoCobro?: string;
  notas?: string;
  fotos?: string[];
  presupuestoId?: string;
  bitacora?: EntradaBitacora[];
}

export interface PresupuestoGremio {
  id: string;
  cliente: string;
  email?: string;
  telefono?: string;
  descripcionTrabajo: string;
  montoTotal: number;
  incluyeMateriales: boolean | 'por_separado';
  condicionesPago: string;
  validezDias: number;
  fechaEmision: string;
  estado: 'borrador' | 'enviado' | 'aceptado' | 'rechazado';
  textoGenerado?: string;
}

export interface TurnoAgenda {
  id: string;
  titulo: string;
  cliente: string;
  direccion: string;
  fecha: string;
  hora: string;
  duracionMinutos: number;
  tipo: 'trabajo' | 'presupuesto' | 'cobro' | 'otro';
  notas?: string;
  trabajoId?: string;
}

export interface PerfilGremio {
  nombre: string;
  rubro: RubroGremio;
  matricula?: string;
  telefono: string;
  email: string;
  ciudad: string;
  provincia: string;
  descripcion?: string;
}

export const RUBRO_LABELS: Record<RubroGremio, string> = {
  electricista: 'Electricista matriculado',
  gasista: 'Gasista matriculado',
  plomero: 'Plomero',
  albanil: 'Albañil',
  pintor: 'Pintor',
  carpintero: 'Carpintero',
  yesero: 'Yesero',
  impermeabilizador: 'Impermeabilizador',
  climatizacion: 'Climatización',
  otro: 'Profesional independiente',
};

export function getRubroLabel(rubro: RubroGremio): string {
  return RUBRO_LABELS[rubro];
}

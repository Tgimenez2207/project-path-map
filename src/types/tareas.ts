export type PrioridadTarea = 'urgente' | 'alta' | 'media' | 'baja';
export type EstadoTarea = 'pendiente' | 'en_curso' | 'completada' | 'bloqueada';
export type AreaTarea =
  | 'obra' | 'cerramientos' | 'terminaciones' | 'instalaciones'
  | 'administracion' | 'comercial' | 'legal' | 'personal' | 'otro';

export interface TareaPersonal {
  id: string;
  titulo: string;
  descripcion?: string;
  area: AreaTarea;
  prioridad: PrioridadTarea;
  estado: EstadoTarea;
  asignadoA: string;
  obraId?: string;
  obraNombre?: string;
  etapaId?: string;
  fechaVencimiento?: string;
  fechaCreacion: string;
  fechaCompletada?: string;
  tags: string[];
  subtareas: Subtarea[];
  comentarios: ComentarioTarea[];
  esDeObra: boolean;
  recurrente?: RecurrenciaTarea;
}

export interface Subtarea {
  id: string;
  titulo: string;
  completada: boolean;
}

export interface ComentarioTarea {
  id: string;
  texto: string;
  autor: string;
  fecha: string;
}

export interface RecurrenciaTarea {
  frecuencia: 'diaria' | 'semanal' | 'mensual';
  diasSemana?: number[];
  diaMes?: number;
}

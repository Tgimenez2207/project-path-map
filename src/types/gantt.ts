export type TipoNodo = 'etapa' | 'subetapa' | 'tarea';
export type EstadoNodo = 'pendiente' | 'en_curso' | 'completada' | 'bloqueada';

export interface NodoGantt {
  id: string;
  obraId: string;
  tipo: TipoNodo;
  nombre: string;
  descripcion?: string;
  inicioOffset: number;
  duracion: number;
  avance: number;
  responsable: string;
  responsableColor?: string;
  estado: EstadoNodo;
  critica: boolean;
  depDe?: string;
  parentId?: string;
  children?: string[];
  color?: string;
  notas?: string;
}

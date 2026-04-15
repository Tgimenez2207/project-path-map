import { NodoGantt } from '@/types/gantt';

export const TODAY_OFFSET = 135;
export const TOTAL_DAYS = 260;

export const mockGantt: NodoGantt[] = [
  // Etapa 1: Demolición y excavación
  { id: 'e1', obraId: 'demo', tipo: 'etapa', nombre: 'Demolición y excavación', inicioOffset: 0, duracion: 45, avance: 100, responsable: 'JM', estado: 'completada', critica: false, children: ['se1-1', 'se1-2'] },
  { id: 'se1-1', obraId: 'demo', tipo: 'subetapa', nombre: 'Demolición', inicioOffset: 0, duracion: 20, avance: 100, responsable: 'JM', estado: 'completada', critica: false, parentId: 'e1', children: ['t1-1', 't1-2'] },
  { id: 't1-1', obraId: 'demo', tipo: 'tarea', nombre: 'Retiro de estructuras', inicioOffset: 0, duracion: 10, avance: 100, responsable: 'JM', responsableColor: '#3B82F6', estado: 'completada', critica: false, parentId: 'se1-1' },
  { id: 't1-2', obraId: 'demo', tipo: 'tarea', nombre: 'Limpieza de escombros', inicioOffset: 10, duracion: 10, avance: 100, responsable: 'LC', responsableColor: '#8B5CF6', estado: 'completada', critica: false, parentId: 'se1-1', depDe: 't1-1' },
  { id: 'se1-2', obraId: 'demo', tipo: 'subetapa', nombre: 'Excavación', inicioOffset: 20, duracion: 25, avance: 100, responsable: 'AR', estado: 'completada', critica: true, parentId: 'e1', children: ['t1-3', 't1-4'] },
  { id: 't1-3', obraId: 'demo', tipo: 'tarea', nombre: 'Excavación perimetral', inicioOffset: 20, duracion: 15, avance: 100, responsable: 'AR', responsableColor: '#EF4444', estado: 'completada', critica: true, parentId: 'se1-2' },
  { id: 't1-4', obraId: 'demo', tipo: 'tarea', nombre: 'Entibado y apuntalado', inicioOffset: 35, duracion: 10, avance: 100, responsable: 'AR', responsableColor: '#EF4444', estado: 'completada', critica: false, parentId: 'se1-2', depDe: 't1-3' },

  // Etapa 2: Estructura
  { id: 'e2', obraId: 'demo', tipo: 'etapa', nombre: 'Estructura', inicioOffset: 45, duracion: 90, avance: 72, responsable: 'MG', estado: 'en_curso', critica: true, children: ['se2-1', 'se2-2'] },
  { id: 'se2-1', obraId: 'demo', tipo: 'subetapa', nombre: 'Cimientos y bases', inicioOffset: 45, duracion: 30, avance: 100, responsable: 'MG', estado: 'completada', critica: true, parentId: 'e2', children: ['t2-1', 't2-2'] },
  { id: 't2-1', obraId: 'demo', tipo: 'tarea', nombre: 'Hormigón de limpieza', inicioOffset: 45, duracion: 5, avance: 100, responsable: 'MG', responsableColor: '#10B981', estado: 'completada', critica: true, parentId: 'se2-1', depDe: 'e1' },
  { id: 't2-2', obraId: 'demo', tipo: 'tarea', nombre: 'Armado y colado bases', inicioOffset: 50, duracion: 25, avance: 100, responsable: 'MG', responsableColor: '#10B981', estado: 'completada', critica: true, parentId: 'se2-1', depDe: 't2-1' },
  { id: 'se2-2', obraId: 'demo', tipo: 'subetapa', nombre: 'Columnas y losas', inicioOffset: 75, duracion: 60, avance: 55, responsable: 'PE', estado: 'en_curso', critica: true, parentId: 'e2', children: ['t2-3', 't2-4', 't2-5'] },
  { id: 't2-3', obraId: 'demo', tipo: 'tarea', nombre: 'Encofrado piso 1-3', inicioOffset: 75, duracion: 20, avance: 100, responsable: 'PE', responsableColor: '#F59E0B', estado: 'completada', critica: true, parentId: 'se2-2', depDe: 'se2-1' },
  { id: 't2-4', obraId: 'demo', tipo: 'tarea', nombre: 'Encofrado piso 4-7', inicioOffset: 95, duracion: 20, avance: 40, responsable: 'PE', responsableColor: '#F59E0B', estado: 'en_curso', critica: true, parentId: 'se2-2', depDe: 't2-3' },
  { id: 't2-5', obraId: 'demo', tipo: 'tarea', nombre: 'Encofrado piso 8-10', inicioOffset: 115, duracion: 20, avance: 0, responsable: 'PE', responsableColor: '#F59E0B', estado: 'pendiente', critica: true, parentId: 'se2-2', depDe: 't2-4' },

  // Etapa 3: Mampostería
  { id: 'e3', obraId: 'demo', tipo: 'etapa', nombre: 'Mampostería', inicioOffset: 105, duracion: 60, avance: 20, responsable: 'RL', estado: 'en_curso', critica: false, children: ['t3-1', 't3-2'] },
  { id: 't3-1', obraId: 'demo', tipo: 'tarea', nombre: 'Muros exteriores', inicioOffset: 105, duracion: 35, avance: 30, responsable: 'RL', responsableColor: '#EC4899', estado: 'en_curso', critica: false, parentId: 'e3', depDe: 'se2-2' },
  { id: 't3-2', obraId: 'demo', tipo: 'tarea', nombre: 'Muros interiores', inicioOffset: 130, duracion: 35, avance: 10, responsable: 'RL', responsableColor: '#EC4899', estado: 'en_curso', critica: false, parentId: 'e3', depDe: 't3-1' },

  // Etapa 4: Instalaciones
  { id: 'e4', obraId: 'demo', tipo: 'etapa', nombre: 'Instalaciones', inicioOffset: 130, duracion: 60, avance: 0, responsable: 'CF', estado: 'pendiente', critica: false, children: ['t4-1', 't4-2', 't4-3'] },
  { id: 't4-1', obraId: 'demo', tipo: 'tarea', nombre: 'Instalación eléctrica', inicioOffset: 130, duracion: 45, avance: 0, responsable: 'CF', responsableColor: '#6366F1', estado: 'pendiente', critica: false, parentId: 'e4', depDe: 'e3' },
  { id: 't4-2', obraId: 'demo', tipo: 'tarea', nombre: 'Instalación sanitaria', inicioOffset: 140, duracion: 40, avance: 0, responsable: 'BQ', responsableColor: '#14B8A6', estado: 'pendiente', critica: false, parentId: 'e4', depDe: 'e3' },
  { id: 't4-3', obraId: 'demo', tipo: 'tarea', nombre: 'Gas y ventilación', inicioOffset: 160, duracion: 30, avance: 0, responsable: 'CF', responsableColor: '#6366F1', estado: 'pendiente', critica: false, parentId: 'e4', depDe: 't4-1' },

  // Etapa 5: Terminaciones
  { id: 'e5', obraId: 'demo', tipo: 'etapa', nombre: 'Terminaciones', inicioOffset: 180, duracion: 60, avance: 0, responsable: 'VT', estado: 'pendiente', critica: true, children: ['t5-1', 't5-2'] },
  { id: 't5-1', obraId: 'demo', tipo: 'tarea', nombre: 'Revestimientos y pintura', inicioOffset: 180, duracion: 40, avance: 0, responsable: 'VT', responsableColor: '#F97316', estado: 'pendiente', critica: true, parentId: 'e5', depDe: 'e4' },
  { id: 't5-2', obraId: 'demo', tipo: 'tarea', nombre: 'Carpintería y herrería', inicioOffset: 200, duracion: 40, avance: 0, responsable: 'GS', responsableColor: '#84CC16', estado: 'pendiente', critica: true, parentId: 'e5', depDe: 't5-1' },
];

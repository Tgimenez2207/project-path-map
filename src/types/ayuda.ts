export type ModuloSistema =
  | 'obras' | 'presupuestos' | 'avance' | 'proveedores'
  | 'clientes' | 'stock' | 'gantt' | 'simulador'
  | 'noticias' | 'ia' | 'portal' | 'general';

export interface Articulo {
  id: string;
  titulo: string;
  descripcion: string;
  modulo: ModuloSistema;
  contenido: SeccionArticulo[];
  tags: string[];
  util: number;
  vistas: number;
}

export interface SeccionArticulo {
  tipo: 'parrafo' | 'lista' | 'tip' | 'advertencia' | 'paso';
  titulo?: string;
  contenido: string | string[];
}

export interface MensajeChat {
  id: string;
  rol: 'user' | 'assistant';
  texto: string;
  timestamp: Date;
}

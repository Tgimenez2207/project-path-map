export type CategoriaNoticia =
  | 'construccion'
  | 'inmobiliario'
  | 'materiales'
  | 'regulatorio'
  | 'economia'
  | 'tecnologia';

export interface Noticia {
  id: string;
  titulo: string;
  resumen: string;
  categoria: CategoriaNoticia;
  fuente: string;
  url?: string;
  fecha: string;
  relevancia: 'alta' | 'media' | 'baja';
  guardada: boolean;
  leida: boolean;
}

export interface BusquedaConfig {
  categoria: CategoriaNoticia | 'todas';
  periodo: 'hoy' | 'semana' | 'mes';
  soloGuardadas: boolean;
}

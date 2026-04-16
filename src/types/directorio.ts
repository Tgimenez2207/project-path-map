export type RubroDirectorio =
  | 'electricista' | 'plomero' | 'hormigon' | 'carpinteria'
  | 'pintura' | 'estructura' | 'sanitaria' | 'gas'
  | 'albanileria' | 'impermeabilizacion' | 'paisajismo'
  | 'ascensores' | 'climatizacion' | 'seguridad' | 'otro';

export type DisponibilidadDirectorio =
  | 'disponible' | 'disponible_30dias' | 'no_disponible';

export type OrigenDirectorio = 'nato' | 'ia_web';

export interface ReseñaDirectorio {
  id: string;
  autorNombre: string;
  autorEmpresa: string;
  fecha: string;
  puntualidad: number;
  calidad: number;
  precio: number;
  comunicacion: number;
  comentario: string;
  obraRealizada?: string;
  reportada: boolean;
}

export interface ProveedorDirectorio {
  id: string;
  razonSocial: string;
  rubro: RubroDirectorio;
  subrubro: string;
  descripcion: string;
  contacto: string;
  telefono: string;
  email: string;
  web?: string;
  ciudad: string;
  provincia: string;
  zonasCobertura: string[];
  cuit?: string;
  verificado: boolean;
  disponibilidad: DisponibilidadDirectorio;
  origen: OrigenDirectorio;
  reseñas: ReseñaDirectorio[];
  yaImportado: boolean;
  guardado: boolean;
}

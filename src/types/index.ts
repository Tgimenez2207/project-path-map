// ============================================
// SGO - Sistema de Gestión de Obras
// Tipos y definiciones TypeScript
// ============================================

// Roles del sistema
export type UserRole = 'admin' | 'operaciones' | 'finanzas' | 'ventas' | 'cliente';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  avatar?: string;
  activo: boolean;
}

// Estados comunes
export type EstadoObra = 'planificacion' | 'en_curso' | 'pausada' | 'finalizada' | 'cancelada';
export type EstadoUnidad = 'disponible' | 'reservada' | 'vendida' | 'bloqueada';
export type EstadoPresupuesto = 'borrador' | 'pendiente' | 'aprobado' | 'rechazado' | 'finalizado';
export type EstadoPago = 'pendiente' | 'aprobado' | 'rechazado' | 'vencido';
export type TipoMovimiento = 'ingreso' | 'egreso' | 'transferencia';
export type TipoComplemento = 'cochera' | 'baulera';

// Obra
export interface Obra {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  estado: EstadoObra;
  fechaInicio: string;
  fechaFinEstimada?: string;
  descripcion?: string;
  imagen?: string;
  progreso: number; // 0-100
  presupuestoTotal?: number;
  moneda: 'ARS' | 'USD';
}

// Etapas y Tareas
export interface Etapa {
  id: string;
  obraId: string;
  nombre: string;
  orden: number;
  fechaInicio?: string;
  fechaFin?: string;
  estado: 'pendiente' | 'en_curso' | 'completada';
}

export interface Tarea {
  id: string;
  etapaId: string;
  obraId: string;
  titulo: string;
  descripcion?: string;
  estado: 'pendiente' | 'en_curso' | 'completada';
  prioridad: 'baja' | 'media' | 'alta';
  asignadoA?: string;
  fechaVencimiento?: string;
}

// Bitácora
export interface EntradaBitacora {
  id: string;
  obraId: string;
  fecha: string;
  titulo: string;
  descripcion: string;
  autor: string;
  imagenes?: string[];
}

// Unidades funcionales
export interface Unidad {
  id: string;
  obraId: string;
  codigo: string; // Ej: "1A", "PB-01"
  tipo: 'departamento' | 'local' | 'oficina' | 'casa';
  piso?: number;
  torre?: string;
  superficie: number; // m2
  ambientes?: number;
  estado: EstadoUnidad;
  precioLista: number;
  moneda: 'ARS' | 'USD';
  descripcion?: string;
}

export interface Complemento {
  id: string;
  unidadId: string;
  tipo: TipoComplemento;
  codigo: string;
  precio: number;
  moneda: 'ARS' | 'USD';
}

// Compradores
export interface Comprador {
  id: string;
  unidadId: string;
  clienteId: string;
  porcentaje: number; // Porcentaje de titularidad
  fechaAsignacion: string;
}

// Clientes
export interface Cliente {
  id: string;
  tipo: 'persona' | 'empresa';
  nombre: string;
  documento: string; // DNI o CUIT
  email?: string;
  telefono?: string;
  direccion?: string;
  notas?: string;
}

// Planes de pago
export interface PlanPago {
  id: string;
  unidadId?: string;
  obraId?: string;
  nombre: string;
  montoTotal: number;
  moneda: 'ARS' | 'USD';
  cantidadCuotas: number;
  tasaInteres: number; // Porcentaje mensual
  fechaInicio: string;
}

export interface Cuota {
  id: string;
  planPagoId: string;
  numero: number;
  monto: number;
  moneda: 'ARS' | 'USD';
  fechaVencimiento: string;
  estado: EstadoPago;
  fechaPago?: string;
  montoPagado?: number;
  interesMora?: number;
}

// Proveedores y Contratistas
export interface Proveedor {
  id: string;
  tipo: 'proveedor' | 'contratista';
  razonSocial: string;
  cuit: string;
  rubro: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  activo: boolean;
}

// Presupuestos
export interface Presupuesto {
  id: string;
  obraId?: string;
  numero: string;
  proveedorId?: string;
  descripcion: string;
  montoTotal: number;
  moneda: 'ARS' | 'USD';
  estado: EstadoPresupuesto;
  fechaCreacion: string;
  fechaValidez?: string;
  items: ItemPresupuesto[];
}

export interface ItemPresupuesto {
  id: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  subtotal: number;
}

// Stock y Almacenes
export interface Deposito {
  id: string;
  nombre: string;
  ubicacion: string;
  responsable?: string;
}

export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  unidadMedida: string;
  stockMinimo: number;
}

export interface StockItem {
  id: string;
  productoId: string;
  depositoId: string;
  cantidad: number;
  ultimaActualizacion: string;
}

export interface MovimientoStock {
  id: string;
  tipo: TipoMovimiento;
  productoId: string;
  depositoOrigenId?: string;
  depositoDestinoId?: string;
  cantidad: number;
  fecha: string;
  motivo?: string;
  responsable: string;
}

// Flota
export interface Vehiculo {
  id: string;
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  tipo: 'camioneta' | 'camion' | 'auto' | 'utilitario';
  kilometraje: number;
  estado: 'disponible' | 'en_uso' | 'mantenimiento';
  proximoVencimiento?: string;
  tipoVencimiento?: string;
}

export interface Mantenimiento {
  id: string;
  vehiculoId: string;
  tipo: string;
  fecha: string;
  kilometraje: number;
  costo: number;
  descripcion?: string;
  proximoMantenimiento?: string;
}

// Herramientas
export interface Herramienta {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  estado: 'disponible' | 'en_uso' | 'mantenimiento' | 'baja';
  ubicacionActual: string;
  asignadoA?: string;
  fechaCompra?: string;
  valorCompra?: number;
}

export interface MovimientoHerramienta {
  id: string;
  herramientaId: string;
  tipo: 'asignacion' | 'devolucion' | 'traslado';
  fecha: string;
  origen: string;
  destino: string;
  responsable: string;
  observaciones?: string;
}

// Notificaciones
export interface Notificacion {
  id: string;
  tipo: 'info' | 'warning' | 'success' | 'error';
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  link?: string;
}

// Notas y Recordatorios
export interface Nota {
  id: string;
  titulo: string;
  contenido: string;
  prioridad: 'baja' | 'media' | 'alta';
  fechaCreacion: string;
  fechaRecordatorio?: string;
  completada: boolean;
}

// Cotización dólar
export interface CotizacionDolar {
  compra: number;
  venta: number;
  oficial: number;
  blue: number;
  fecha: string;
}

// Avance de obra multimedia
export interface ReporteAvance {
  id: string;
  obraId: string;
  torre?: string;
  piso?: number;
  unidadId?: string;
  titulo: string;
  descripcion?: string;
  fecha: string;
  autor: string;
  archivos: ArchivoMultimedia[];
}

export interface ArchivoMultimedia {
  id: string;
  tipo: 'imagen' | 'video' | 'documento' | 'plano';
  nombre: string;
  url: string;
  thumbnail?: string;
}

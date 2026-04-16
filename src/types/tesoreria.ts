export type MonedaT = 'ARS' | 'USD';
export type TipoCuenta = 'banco' | 'caja' | 'billetera_digital';
export type TipoMovimientoT = 'ingreso' | 'egreso' | 'transferencia' | 'ajuste';
export type CategoriaMovimiento =
  | 'obra_directa' | 'personal' | 'alquiler' | 'servicios'
  | 'honorarios' | 'impuestos' | 'seguros' | 'marketing'
  | 'compras' | 'administracion' | 'otro';
export type EstadoCheque = 'en_cartera' | 'depositado' | 'endosado' | 'rechazado' | 'vencido';
export type TipoCheque = 'propio' | 'terceros';

export interface Cuenta {
  id: string;
  nombre: string;
  tipo: TipoCuenta;
  banco?: string;
  nroCuenta?: string;
  cbu?: string;
  moneda: MonedaT;
  saldoInicial: number;
  activa: boolean;
  color: string;
}

export interface Movimiento {
  id: string;
  fecha: string;
  tipo: TipoMovimientoT;
  categoria: CategoriaMovimiento;
  descripcion: string;
  monto: number;
  moneda: MonedaT;
  cuentaId: string;
  cuentaDestinoId?: string;
  obraId?: string;
  obraNombre?: string;
  proveedorId?: string;
  clienteId?: string;
  ordenCompraId?: string;
  contratoId?: string;
  chequeId?: string;
  comprobante?: string;
  notas?: string;
  creadoPor: string;
  conciliado: boolean;
}

export interface Cheque {
  id: string;
  tipo: TipoCheque;
  numero: string;
  banco: string;
  titular: string;
  monto: number;
  moneda: MonedaT;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: EstadoCheque;
  cuentaId?: string;
  recibiDe?: string;
  fechaDeposito?: string;
  fechaEndoso?: string;
  endosadoA?: string;
  motivoRechazo?: string;
  obraId?: string;
  obraNombre?: string;
  notas?: string;
}

export interface CostoFijo {
  id: string;
  descripcion: string;
  categoria: CategoriaMovimiento;
  monto: number;
  moneda: MonedaT;
  esRecurrente: boolean;
  frecuencia?: 'mensual' | 'trimestral' | 'anual';
  proximoVencimiento?: string;
  activo: boolean;
  notas?: string;
}

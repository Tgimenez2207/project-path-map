import type { Cuenta, Movimiento, Cheque, CostoFijo } from '@/types/tesoreria';

export const mockCuentas: Cuenta[] = [
  { id: 'c1', nombre: 'Banco Galicia — Cta. Cte. ARS', tipo: 'banco', banco: 'Galicia', moneda: 'ARS', saldoInicial: 2850000, color: '#378ADD', activa: true },
  { id: 'c2', nombre: 'Banco Nación — Cta. USD', tipo: 'banco', banco: 'Nación', moneda: 'USD', saldoInicial: 48500, color: '#1D9E75', activa: true },
  { id: 'c3', nombre: 'Caja chica ARS', tipo: 'caja', moneda: 'ARS', saldoInicial: 85000, color: '#EF9F27', activa: true },
  { id: 'c4', nombre: 'Mercado Pago', tipo: 'billetera_digital', moneda: 'ARS', saldoInicial: 125000, color: '#7F77DD', activa: true },
];

export const mockMovimientos: Movimiento[] = [
  // Ingresos
  { id: 'm1', fecha: '2026-03-15', tipo: 'ingreso', categoria: 'obra_directa', descripcion: 'Cobro González María — Torre Palermo', monto: 82000, moneda: 'USD', cuentaId: 'c2', obraNombre: 'Torre Palermo', creadoPor: 'admin', conciliado: true },
  { id: 'm2', fecha: '2026-03-01', tipo: 'ingreso', categoria: 'obra_directa', descripcion: 'Cobro Inmobiliaria Palermo — Nordelta', monto: 120000, moneda: 'USD', cuentaId: 'c2', obraNombre: 'Nordelta', creadoPor: 'admin', conciliado: true },
  { id: 'm3', fecha: '2026-02-20', tipo: 'ingreso', categoria: 'obra_directa', descripcion: 'Cobro Constructora Del Sur — PH Belgrano', monto: 3200000, moneda: 'ARS', cuentaId: 'c1', obraNombre: 'PH Belgrano', creadoPor: 'admin', conciliado: true },
  { id: 'm4', fecha: '2026-02-10', tipo: 'ingreso', categoria: 'obra_directa', descripcion: 'Cobro Luciana Fernández — Residencial Norte', monto: 48000, moneda: 'USD', cuentaId: 'c2', obraNombre: 'Residencial Norte', creadoPor: 'admin', conciliado: true },
  { id: 'm5', fecha: '2026-01-15', tipo: 'ingreso', categoria: 'obra_directa', descripcion: 'Cobro Diego Ramírez — Torre Palermo', monto: 95000, moneda: 'USD', cuentaId: 'c2', obraNombre: 'Torre Palermo', creadoPor: 'admin', conciliado: true },
  { id: 'm6', fecha: '2026-02-28', tipo: 'ingreso', categoria: 'honorarios', descripcion: 'Cobro honorarios asesoría', monto: 180000, moneda: 'ARS', cuentaId: 'c1', creadoPor: 'admin', conciliado: true },
  { id: 'm7', fecha: '2026-03-05', tipo: 'ingreso', categoria: 'alquiler', descripcion: 'Cobro alquiler oficina local', monto: 95000, moneda: 'ARS', cuentaId: 'c1', creadoPor: 'admin', conciliado: true },
  // Egresos
  { id: 'm8', fecha: '2026-03-10', tipo: 'egreso', categoria: 'compras', descripcion: 'Pago Hormigones del Sur', monto: 1200000, moneda: 'ARS', cuentaId: 'c1', creadoPor: 'admin', conciliado: true },
  { id: 'm9', fecha: '2026-03-05', tipo: 'egreso', categoria: 'compras', descripcion: 'Pago Electricidad Ramos', monto: 680000, moneda: 'ARS', cuentaId: 'c1', creadoPor: 'admin', conciliado: true },
  { id: 'm10', fecha: '2026-02-20', tipo: 'egreso', categoria: 'compras', descripcion: 'Pago Carpintería Metálica SA', monto: 950000, moneda: 'ARS', cuentaId: 'c1', creadoPor: 'admin', conciliado: true },
  { id: 'm11', fecha: '2026-02-15', tipo: 'egreso', categoria: 'compras', descripcion: 'Pago Pintores Unidos', monto: 280000, moneda: 'ARS', cuentaId: 'c1', creadoPor: 'admin', conciliado: true },
  { id: 'm12', fecha: '2026-03-15', tipo: 'egreso', categoria: 'personal', descripcion: 'Sueldos quincena 1 marzo', monto: 480000, moneda: 'ARS', cuentaId: 'c1', creadoPor: 'admin', conciliado: true },
  { id: 'm13', fecha: '2026-03-31', tipo: 'egreso', categoria: 'personal', descripcion: 'Sueldos quincena 2 marzo', monto: 480000, moneda: 'ARS', cuentaId: 'c1', creadoPor: 'admin', conciliado: true },
  { id: 'm14', fecha: '2026-03-01', tipo: 'egreso', categoria: 'alquiler', descripcion: 'Alquiler oficina central', monto: 180000, moneda: 'ARS', cuentaId: 'c1', creadoPor: 'admin', conciliado: true },
  { id: 'm15', fecha: '2026-02-01', tipo: 'egreso', categoria: 'alquiler', descripcion: 'Alquiler oficina central', monto: 180000, moneda: 'ARS', cuentaId: 'c1', creadoPor: 'admin', conciliado: true },
  { id: 'm16', fecha: '2026-03-05', tipo: 'egreso', categoria: 'servicios', descripcion: 'Internet + telefonía', monto: 25000, moneda: 'ARS', cuentaId: 'c4', creadoPor: 'admin', conciliado: true },
  { id: 'm17', fecha: '2026-03-10', tipo: 'egreso', categoria: 'servicios', descripcion: 'Luz oficina', monto: 18000, moneda: 'ARS', cuentaId: 'c1', creadoPor: 'admin', conciliado: true },
  { id: 'm18', fecha: '2026-03-01', tipo: 'egreso', categoria: 'seguros', descripcion: 'Seguro responsabilidad civil', monto: 85000, moneda: 'ARS', cuentaId: 'c1', creadoPor: 'admin', conciliado: true },
  { id: 'm19', fecha: '2026-03-01', tipo: 'egreso', categoria: 'honorarios', descripcion: 'Contador externo', monto: 45000, moneda: 'ARS', cuentaId: 'c1', creadoPor: 'admin', conciliado: true },
  { id: 'm20', fecha: '2026-03-20', tipo: 'egreso', categoria: 'impuestos', descripcion: 'IIBB marzo', monto: 98000, moneda: 'ARS', cuentaId: 'c1', creadoPor: 'admin', conciliado: true },
  { id: 'm21', fecha: '2026-03-15', tipo: 'egreso', categoria: 'administracion', descripcion: 'Nafta y viáticos', monto: 35000, moneda: 'ARS', cuentaId: 'c3', creadoPor: 'admin', conciliado: true },
  { id: 'm22', fecha: '2026-03-10', tipo: 'egreso', categoria: 'administracion', descripcion: 'Insumos oficina', monto: 12000, moneda: 'ARS', cuentaId: 'c3', creadoPor: 'admin', conciliado: true },
  { id: 'm23', fecha: '2026-02-01', tipo: 'egreso', categoria: 'seguros', descripcion: 'Seguro flota', monto: 320000, moneda: 'ARS', cuentaId: 'c1', creadoPor: 'admin', conciliado: true },
  { id: 'm24', fecha: '2026-02-15', tipo: 'egreso', categoria: 'honorarios', descripcion: 'Honorarios arquitecto', monto: 3500, moneda: 'USD', cuentaId: 'c2', creadoPor: 'admin', conciliado: true },
  { id: 'm25', fecha: '2026-02-05', tipo: 'egreso', categoria: 'compras', descripcion: 'Pago proveedor acero', monto: 2100000, moneda: 'ARS', cuentaId: 'c1', creadoPor: 'admin', conciliado: true },
  // Transferencias
  { id: 'm26', fecha: '2026-03-01', tipo: 'transferencia', categoria: 'otro', descripcion: 'Transferencia a caja chica', monto: 50000, moneda: 'ARS', cuentaId: 'c1', cuentaDestinoId: 'c3', creadoPor: 'admin', conciliado: true },
  { id: 'm27', fecha: '2026-02-01', tipo: 'transferencia', categoria: 'otro', descripcion: 'Transferencia a caja chica', monto: 50000, moneda: 'ARS', cuentaId: 'c1', cuentaDestinoId: 'c3', creadoPor: 'admin', conciliado: true },
  { id: 'm28', fecha: '2026-03-15', tipo: 'transferencia', categoria: 'otro', descripcion: 'Cambio USD → ARS Galicia', monto: 10000, moneda: 'USD', cuentaId: 'c2', cuentaDestinoId: 'c1', creadoPor: 'admin', conciliado: true },
  // Recent unreconciled
  { id: 'm29', fecha: '2026-04-07', tipo: 'egreso', categoria: 'compras', descripcion: 'Pago Sanitarios Express', monto: 450000, moneda: 'ARS', cuentaId: 'c1', obraNombre: 'Torre Palermo', creadoPor: 'admin', conciliado: false },
  { id: 'm30', fecha: '2026-04-08', tipo: 'egreso', categoria: 'personal', descripcion: 'Sueldos quincena 1 abril', monto: 480000, moneda: 'ARS', cuentaId: 'c1', creadoPor: 'admin', conciliado: false },
  { id: 'm31', fecha: '2026-04-09', tipo: 'ingreso', categoria: 'obra_directa', descripcion: 'Cobro Constructora Norte — Nordelta', monto: 65000, moneda: 'USD', cuentaId: 'c2', obraNombre: 'Nordelta', creadoPor: 'admin', conciliado: false },
  { id: 'm32', fecha: '2026-04-10', tipo: 'egreso', categoria: 'servicios', descripcion: 'Gas oficina', monto: 15000, moneda: 'ARS', cuentaId: 'c1', creadoPor: 'admin', conciliado: false },
  { id: 'm33', fecha: '2026-04-11', tipo: 'egreso', categoria: 'administracion', descripcion: 'Papelería y toner', monto: 8500, moneda: 'ARS', cuentaId: 'c3', creadoPor: 'admin', conciliado: false },
  { id: 'm34', fecha: '2026-04-12', tipo: 'egreso', categoria: 'compras', descripcion: 'Pago Vidriería del Sur', monto: 780000, moneda: 'ARS', cuentaId: 'c1', obraNombre: 'PH Belgrano', creadoPor: 'admin', conciliado: false },
  { id: 'm35', fecha: '2026-04-13', tipo: 'ingreso', categoria: 'obra_directa', descripcion: 'Cobro reserva unidad 4B — Torre Palermo', monto: 25000, moneda: 'USD', cuentaId: 'c2', obraNombre: 'Torre Palermo', creadoPor: 'admin', conciliado: false },
  { id: 'm36', fecha: '2026-04-14', tipo: 'egreso', categoria: 'impuestos', descripcion: 'Anticipo ganancias', monto: 145000, moneda: 'ARS', cuentaId: 'c1', creadoPor: 'admin', conciliado: false },
  { id: 'm37', fecha: '2026-04-14', tipo: 'egreso', categoria: 'seguros', descripcion: 'Seguro ART abril', monto: 92000, moneda: 'ARS', cuentaId: 'c1', creadoPor: 'admin', conciliado: false },
  { id: 'm38', fecha: '2026-04-15', tipo: 'transferencia', categoria: 'otro', descripcion: 'Recarga caja chica', monto: 40000, moneda: 'ARS', cuentaId: 'c1', cuentaDestinoId: 'c3', creadoPor: 'admin', conciliado: false },
  { id: 'm39', fecha: '2026-04-15', tipo: 'egreso', categoria: 'honorarios', descripcion: 'Honorarios estudio jurídico', monto: 75000, moneda: 'ARS', cuentaId: 'c1', creadoPor: 'admin', conciliado: false },
  { id: 'm40', fecha: '2026-04-16', tipo: 'ingreso', categoria: 'alquiler', descripcion: 'Cobro alquiler local comercial', monto: 110000, moneda: 'ARS', cuentaId: 'c1', creadoPor: 'admin', conciliado: false },
];

export const mockCheques: Cheque[] = [
  // Propios
  { id: 'chq1', tipo: 'propio', numero: '45821', banco: 'Galicia', titular: 'Hormigones del Sur', monto: 480000, moneda: 'ARS', fechaEmision: '2026-03-20', fechaVencimiento: '2026-04-20', estado: 'en_cartera', cuentaId: 'c1' },
  { id: 'chq2', tipo: 'propio', numero: '45822', banco: 'Galicia', titular: 'Carpintería Metálica SA', monto: 320000, moneda: 'ARS', fechaEmision: '2026-03-22', fechaVencimiento: '2026-04-25', estado: 'en_cartera', cuentaId: 'c1' },
  { id: 'chq3', tipo: 'propio', numero: '45819', banco: 'Galicia', titular: 'Electricidad Ramos', monto: 180000, moneda: 'ARS', fechaEmision: '2026-03-01', fechaVencimiento: '2026-04-05', estado: 'depositado', cuentaId: 'c1', fechaDeposito: '2026-04-05' },
  { id: 'chq4', tipo: 'propio', numero: '45817', banco: 'Galicia', titular: 'Pintores Unidos', monto: 95000, moneda: 'ARS', fechaEmision: '2026-02-15', fechaVencimiento: '2026-03-01', estado: 'depositado', cuentaId: 'c1', fechaDeposito: '2026-03-01' },
  { id: 'chq5', tipo: 'propio', numero: '45820', banco: 'Galicia', titular: 'Electricidad Ramos', monto: 240000, moneda: 'ARS', fechaEmision: '2026-03-15', fechaVencimiento: '2026-04-18', estado: 'en_cartera', cuentaId: 'c1' },
  // Terceros
  { id: 'chqt1', tipo: 'terceros', numero: '78341', banco: 'Santander', titular: 'González María', monto: 650000, moneda: 'ARS', fechaEmision: '2026-03-10', fechaVencimiento: '2026-04-30', estado: 'en_cartera', recibiDe: 'González María' },
  { id: 'chqt2', tipo: 'terceros', numero: '92115', banco: 'BBVA', titular: 'Constructora Del Sur', monto: 980000, moneda: 'ARS', fechaEmision: '2026-03-20', fechaVencimiento: '2026-05-15', estado: 'en_cartera', recibiDe: 'Constructora Del Sur' },
  { id: 'chqt3', tipo: 'terceros', numero: '34782', banco: 'Galicia', titular: 'Inmobiliaria Palermo', monto: 1200000, moneda: 'ARS', fechaEmision: '2026-03-25', fechaVencimiento: '2026-05-20', estado: 'en_cartera', recibiDe: 'Inmobiliaria Palermo' },
  { id: 'chqt4', tipo: 'terceros', numero: '55190', banco: 'Nación', titular: 'Diego Ramírez', monto: 420000, moneda: 'ARS', fechaEmision: '2026-02-28', fechaVencimiento: '2026-04-10', estado: 'depositado', recibiDe: 'Diego Ramírez', fechaDeposito: '2026-04-10' },
  { id: 'chqt5', tipo: 'terceros', numero: '41208', banco: 'Galicia', titular: 'Luciana Fernández', monto: 380000, moneda: 'ARS', fechaEmision: '2026-02-20', fechaVencimiento: '2026-03-28', estado: 'endosado', recibiDe: 'Luciana Fernández', endosadoA: 'Hormigones del Sur', fechaEndoso: '2026-03-25' },
  // extras
  { id: 'chq6', tipo: 'propio', numero: '45823', banco: 'Galicia', titular: 'Sanitarios Express', monto: 150000, moneda: 'ARS', fechaEmision: '2026-04-01', fechaVencimiento: '2026-05-01', estado: 'en_cartera', cuentaId: 'c1' },
  { id: 'chqt6', tipo: 'terceros', numero: '67234', banco: 'HSBC', titular: 'Constructora Norte', monto: 550000, moneda: 'ARS', fechaEmision: '2026-04-05', fechaVencimiento: '2026-05-25', estado: 'en_cartera', recibiDe: 'Constructora Norte' },
  { id: 'chq7', tipo: 'propio', numero: '45824', banco: 'Galicia', titular: 'Vidriería del Sur', monto: 280000, moneda: 'ARS', fechaEmision: '2026-04-10', fechaVencimiento: '2026-05-10', estado: 'en_cartera', cuentaId: 'c1' },
  { id: 'chqt7', tipo: 'terceros', numero: '11987', banco: 'Macro', titular: 'Desarrollo Sur SRL', monto: 720000, moneda: 'ARS', fechaEmision: '2026-04-02', fechaVencimiento: '2026-05-30', estado: 'en_cartera', recibiDe: 'Desarrollo Sur SRL' },
  { id: 'chq8', tipo: 'propio', numero: '45816', banco: 'Galicia', titular: 'Ferretería Central', monto: 65000, moneda: 'ARS', fechaEmision: '2026-01-20', fechaVencimiento: '2026-02-20', estado: 'depositado', cuentaId: 'c1', fechaDeposito: '2026-02-20' },
];

export const mockCostosFijos: CostoFijo[] = [
  { id: 'cf1', descripcion: 'Alquiler oficina central', categoria: 'alquiler', monto: 180000, moneda: 'ARS', esRecurrente: true, frecuencia: 'mensual', proximoVencimiento: '2026-05-01', activo: true },
  { id: 'cf2', descripcion: 'Internet + telefonía', categoria: 'servicios', monto: 25000, moneda: 'ARS', esRecurrente: true, frecuencia: 'mensual', proximoVencimiento: '2026-05-05', activo: true },
  { id: 'cf3', descripcion: 'Seguro responsabilidad civil', categoria: 'seguros', monto: 85000, moneda: 'ARS', esRecurrente: true, frecuencia: 'mensual', proximoVencimiento: '2026-05-01', activo: true },
  { id: 'cf4', descripcion: 'Contador externo', categoria: 'honorarios', monto: 45000, moneda: 'ARS', esRecurrente: true, frecuencia: 'mensual', proximoVencimiento: '2026-05-01', activo: true },
  { id: 'cf5', descripcion: 'Hosting y software', categoria: 'administracion', monto: 8500, moneda: 'ARS', esRecurrente: true, frecuencia: 'mensual', proximoVencimiento: '2026-05-10', activo: true },
  { id: 'cf6', descripcion: 'Ingresos brutos (IIBB)', categoria: 'impuestos', monto: 98000, moneda: 'ARS', esRecurrente: true, frecuencia: 'mensual', proximoVencimiento: '2026-05-20', activo: true },
  { id: 'cf7', descripcion: 'Seguro flota vehicular', categoria: 'seguros', monto: 320000, moneda: 'ARS', esRecurrente: true, frecuencia: 'mensual', proximoVencimiento: '2026-05-01', activo: true },
  { id: 'cf8', descripcion: 'Sueldos personal administrativo', categoria: 'personal', monto: 960000, moneda: 'ARS', esRecurrente: true, frecuencia: 'mensual', proximoVencimiento: '2026-05-15', activo: true },
];

import type { MovimientoCaja, RentabilidadObra, FlujoCajaMes, DesgloseCosto } from '@/types/finanzas';

export const mockMovimientos: MovimientoCaja[] = [
  // Cobros realizados
  { id: 'mc-1', fecha: '2026-03-15', tipo: 'cobro', concepto: 'Cuota 3/6', monto: 82000, moneda: 'USD', obraId: 'obra-tp', obraNombre: 'Torre Palermo', contraparte: 'González María', pagado: true, vencimiento: '2026-03-15' },
  { id: 'mc-2', fecha: '2026-03-01', tipo: 'cobro', concepto: 'Anticipo obra', monto: 120000, moneda: 'USD', obraId: 'obra-cn', obraNombre: 'Complejo Nordelta', contraparte: 'Inmobiliaria Palermo', pagado: true, vencimiento: '2026-03-01' },
  { id: 'mc-3', fecha: '2026-02-20', tipo: 'cobro', concepto: 'Cuota 2/4', monto: 65000, moneda: 'USD', obraId: 'obra-pb', obraNombre: 'PH Belgrano', contraparte: 'Constructora Del Sur', pagado: true, vencimiento: '2026-02-20' },
  { id: 'mc-4', fecha: '2026-02-10', tipo: 'cobro', concepto: 'Cuota 1/3', monto: 48000, moneda: 'USD', obraId: 'obra-rn', obraNombre: 'Residencial Norte', contraparte: 'Luciana Fernández', pagado: true, vencimiento: '2026-02-10' },
  { id: 'mc-5', fecha: '2026-01-15', tipo: 'cobro', concepto: 'Cuota 2/6', monto: 95000, moneda: 'USD', obraId: 'obra-tp', obraNombre: 'Torre Palermo', contraparte: 'Diego Ramírez', pagado: true, vencimiento: '2026-01-15' },
  // Cobros pendientes
  { id: 'mc-6', fecha: '2026-04-30', tipo: 'cobro', concepto: 'Cuota 4/6', monto: 82000, moneda: 'USD', obraId: 'obra-tp', obraNombre: 'Torre Palermo', contraparte: 'González María', pagado: false, vencimiento: '2026-04-30' },
  { id: 'mc-7', fecha: '2026-05-15', tipo: 'cobro', concepto: 'Cuota 2/4', monto: 120000, moneda: 'USD', obraId: 'obra-cn', obraNombre: 'Complejo Nordelta', contraparte: 'Inmobiliaria Palermo', pagado: false, vencimiento: '2026-05-15' },
  { id: 'mc-8', fecha: '2026-05-20', tipo: 'cobro', concepto: 'Anticipo', monto: 55000, moneda: 'USD', obraId: 'obra-pb', obraNombre: 'PH Belgrano', contraparte: 'Grupo Constructor BA', pagado: false, vencimiento: '2026-05-20' },
  // Pagos realizados
  { id: 'mc-9', fecha: '2026-03-10', tipo: 'pago', concepto: 'Hormigón H30 — marzo', monto: 45000, moneda: 'USD', obraId: 'obra-tp', obraNombre: 'Torre Palermo', contraparte: 'Hormigones del Sur', pagado: true, vencimiento: '2026-03-10' },
  { id: 'mc-10', fecha: '2026-03-05', tipo: 'pago', concepto: 'Instalación eléctrica piso 5-7', monto: 28000, moneda: 'USD', obraId: 'obra-tp', obraNombre: 'Torre Palermo', contraparte: 'Electricidad Ramos', pagado: true, vencimiento: '2026-03-05' },
  { id: 'mc-11', fecha: '2026-02-20', tipo: 'pago', concepto: 'Carpintería fachada', monto: 62000, moneda: 'USD', obraId: 'obra-cn', obraNombre: 'Complejo Nordelta', contraparte: 'Carpintería Metálica SA', pagado: true, vencimiento: '2026-02-20' },
  { id: 'mc-12', fecha: '2026-02-15', tipo: 'pago', concepto: 'Pintura pisos 1-3', monto: 18000, moneda: 'USD', obraId: 'obra-pb', obraNombre: 'PH Belgrano', contraparte: 'Pintores Unidos', pagado: true, vencimiento: '2026-02-15' },
  { id: 'mc-13', fecha: '2026-02-01', tipo: 'pago', concepto: 'Instalación sanitaria', monto: 35000, moneda: 'USD', obraId: 'obra-rn', obraNombre: 'Residencial Norte', contraparte: 'Sanitaria del Norte', pagado: true, vencimiento: '2026-02-01' },
  // Pagos pendientes
  { id: 'mc-14', fecha: '2026-04-28', tipo: 'pago', concepto: 'Estructura piso 10', monto: 45000, moneda: 'USD', obraId: 'obra-tp', obraNombre: 'Torre Palermo', contraparte: 'Constructora Del Sur', pagado: false, vencimiento: '2026-04-28' },
  { id: 'mc-15', fecha: '2026-05-02', tipo: 'pago', concepto: 'Hormigón H30 — abril', monto: 38000, moneda: 'USD', obraId: 'obra-cn', obraNombre: 'Complejo Nordelta', contraparte: 'Hormigones del Sur', pagado: false, vencimiento: '2026-05-02' },
  { id: 'mc-16', fecha: '2026-05-10', tipo: 'pago', concepto: 'Tendido eléctrico piso 8-10', monto: 41000, moneda: 'USD', obraId: 'obra-tp', obraNombre: 'Torre Palermo', contraparte: 'Electricidad Ramos', pagado: false, vencimiento: '2026-05-10' },
  // Extra movimientos
  { id: 'mc-17', fecha: '2026-01-20', tipo: 'cobro', concepto: 'Refuerzo de anticipo', monto: 30000, moneda: 'USD', obraId: 'obra-cn', obraNombre: 'Complejo Nordelta', contraparte: 'Inmobiliaria Palermo', pagado: true, vencimiento: '2026-01-20' },
  { id: 'mc-18', fecha: '2026-01-05', tipo: 'pago', concepto: 'Excavación terreno', monto: 22000, moneda: 'USD', obraId: 'obra-rn', obraNombre: 'Residencial Norte', contraparte: 'Excavaciones Roca', pagado: true, vencimiento: '2026-01-05' },
  { id: 'mc-19', fecha: '2025-12-15', tipo: 'cobro', concepto: 'Reserva unidad', monto: 15000, moneda: 'USD', obraId: 'obra-pb', obraNombre: 'PH Belgrano', contraparte: 'Carlos Méndez', pagado: true, vencimiento: '2025-12-15' },
  { id: 'mc-20', fecha: '2025-11-20', tipo: 'pago', concepto: 'Ingeniería de suelos', monto: 12000, moneda: 'USD', obraId: 'obra-rn', obraNombre: 'Residencial Norte', contraparte: 'GeoTech SRL', pagado: true, vencimiento: '2025-11-20' },
];

export const mockFlujoCaja: FlujoCajaMes[] = [
  { mes: 'Nov', anio: 2025, ingresos: 180000, egresos: 112000, neto: 68000 },
  { mes: 'Dic', anio: 2025, ingresos: 245000, egresos: 133000, neto: 112000 },
  { mes: 'Ene', anio: 2026, ingresos: 155000, egresos: 111000, neto: 44000 },
  { mes: 'Feb', anio: 2026, ingresos: 148000, egresos: 117000, neto: 31000 },
  { mes: 'Mar', anio: 2026, ingresos: 122000, egresos: 140000, neto: -18000 },
  { mes: 'Abr', anio: 2026, ingresos: 98000, egresos: 140000, neto: -42000 },
];

export const mockRentabilidad: RentabilidadObra[] = [
  { obraId: 'obra-cn', obraNombre: 'Complejo Nordelta', ingresos: 420000, costos: 285000, utilidad: 135000, margen: 32.1, moneda: 'USD', estado: 'ok' },
  { obraId: 'obra-pb', obraNombre: 'PH Belgrano', ingresos: 180000, costos: 135000, utilidad: 45000, margen: 24.8, moneda: 'USD', estado: 'ok' },
  { obraId: 'obra-tp', obraNombre: 'Torre Palermo', ingresos: 380000, costos: 314000, utilidad: 66000, margen: 17.3, moneda: 'USD', estado: 'warning' },
  { obraId: 'obra-rn', obraNombre: 'Residencial Norte', ingresos: 260000, costos: 244000, utilidad: 16000, margen: 6.2, moneda: 'USD', estado: 'danger' },
];

export const mockDesgloseCostos: DesgloseCosto[] = [
  { rubro: 'Construcción', monto: 520000, porcentaje: 58.4, estado: 'ok' },
  { rubro: 'Honorarios prof.', monto: 89000, porcentaje: 10.0, estado: 'ok' },
  { rubro: 'Materiales extra', monto: 78000, porcentaje: 8.8, estado: 'warning' },
  { rubro: 'Comercialización', monto: 62000, porcentaje: 7.0, estado: 'ok' },
  { rubro: 'Imprevistos', monto: 85000, porcentaje: 9.6, estado: 'danger' },
  { rubro: 'Impuestos', monto: 56000, porcentaje: 6.3, estado: 'ok' },
];

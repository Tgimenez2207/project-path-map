import { Deposito, Producto, StockItem, MovimientoStock, Vehiculo, Mantenimiento, Herramienta } from '@/types';

export const mockDepositos: Deposito[] = [
  {
    id: 'dep-001',
    nombre: 'Depósito Central',
    ubicacion: 'Av. Industrial 1500, Buenos Aires',
    responsable: 'Pedro Sánchez',
  },
  {
    id: 'dep-002',
    nombre: 'Obrador Torre Mirador',
    ubicacion: 'Av. del Libertador 4500, Buenos Aires',
    responsable: 'Carlos Méndez',
  },
];

export const mockProductos: Producto[] = [
  { id: 'prod-001', codigo: 'CEM-001', nombre: 'Cemite Portland 50kg', categoria: 'Cementos', unidadMedida: 'bolsa', stockMinimo: 100 },
  { id: 'prod-002', codigo: 'HIE-008', nombre: 'Hierro Ø8 x 12m', categoria: 'Hierros', unidadMedida: 'barra', stockMinimo: 200 },
  { id: 'prod-003', codigo: 'HIE-010', nombre: 'Hierro Ø10 x 12m', categoria: 'Hierros', unidadMedida: 'barra', stockMinimo: 150 },
  { id: 'prod-004', codigo: 'HIE-012', nombre: 'Hierro Ø12 x 12m', categoria: 'Hierros', unidadMedida: 'barra', stockMinimo: 100 },
  { id: 'prod-005', codigo: 'LAD-001', nombre: 'Ladrillo hueco 8x18x33', categoria: 'Ladrillos', unidadMedida: 'unidad', stockMinimo: 5000 },
  { id: 'prod-006', codigo: 'LAD-002', nombre: 'Ladrillo hueco 12x18x33', categoria: 'Ladrillos', unidadMedida: 'unidad', stockMinimo: 3000 },
  { id: 'prod-007', codigo: 'ARE-001', nombre: 'Arena gruesa', categoria: 'Áridos', unidadMedida: 'm³', stockMinimo: 20 },
  { id: 'prod-008', codigo: 'PIE-001', nombre: 'Piedra partida', categoria: 'Áridos', unidadMedida: 'm³', stockMinimo: 15 },
  { id: 'prod-009', codigo: 'CAB-001', nombre: 'Cable unipolar 2.5mm²', categoria: 'Eléctricos', unidadMedida: 'metro', stockMinimo: 500 },
  { id: 'prod-010', codigo: 'TUB-001', nombre: 'Caño PP 110mm x 4m', categoria: 'Sanitarios', unidadMedida: 'unidad', stockMinimo: 50 },
];

export const mockStock: StockItem[] = [
  { id: 'stock-001', productoId: 'prod-001', depositoId: 'dep-001', cantidad: 250, ultimaActualizacion: '2024-12-28' },
  { id: 'stock-002', productoId: 'prod-001', depositoId: 'dep-002', cantidad: 80, ultimaActualizacion: '2024-12-27' },
  { id: 'stock-003', productoId: 'prod-002', depositoId: 'dep-001', cantidad: 350, ultimaActualizacion: '2024-12-26' },
  { id: 'stock-004', productoId: 'prod-002', depositoId: 'dep-002', cantidad: 120, ultimaActualizacion: '2024-12-28' },
  { id: 'stock-005', productoId: 'prod-003', depositoId: 'dep-001', cantidad: 200, ultimaActualizacion: '2024-12-25' },
  { id: 'stock-006', productoId: 'prod-004', depositoId: 'dep-001', cantidad: 85, ultimaActualizacion: '2024-12-24' }, // Bajo stock
  { id: 'stock-007', productoId: 'prod-005', depositoId: 'dep-002', cantidad: 4200, ultimaActualizacion: '2024-12-28' }, // Bajo stock
  { id: 'stock-008', productoId: 'prod-006', depositoId: 'dep-002', cantidad: 1800, ultimaActualizacion: '2024-12-27' }, // Bajo stock
  { id: 'stock-009', productoId: 'prod-007', depositoId: 'dep-002', cantidad: 35, ultimaActualizacion: '2024-12-26' },
  { id: 'stock-010', productoId: 'prod-008', depositoId: 'dep-002', cantidad: 25, ultimaActualizacion: '2024-12-25' },
];

export const mockMovimientosStock: MovimientoStock[] = [
  { id: 'mov-001', tipo: 'ingreso', productoId: 'prod-001', depositoDestinoId: 'dep-001', cantidad: 100, fecha: '2024-12-28', motivo: 'Compra a proveedor', responsable: 'Pedro Sánchez' },
  { id: 'mov-002', tipo: 'transferencia', productoId: 'prod-001', depositoOrigenId: 'dep-001', depositoDestinoId: 'dep-002', cantidad: 50, fecha: '2024-12-27', motivo: 'Reposición obra', responsable: 'Pedro Sánchez' },
  { id: 'mov-003', tipo: 'egreso', productoId: 'prod-002', depositoOrigenId: 'dep-002', cantidad: 30, fecha: '2024-12-28', motivo: 'Uso en piso 8', responsable: 'Carlos Méndez' },
];

export const mockVehiculos: Vehiculo[] = [
  {
    id: 'veh-001',
    patente: 'AB 123 CD',
    marca: 'Toyota',
    modelo: 'Hilux',
    anio: 2022,
    tipo: 'camioneta',
    kilometraje: 45000,
    estado: 'disponible',
    proximoVencimiento: '2025-01-15',
    tipoVencimiento: 'VTV',
  },
  {
    id: 'veh-002',
    patente: 'EF 456 GH',
    marca: 'Ford',
    modelo: 'Ranger',
    anio: 2021,
    tipo: 'camioneta',
    kilometraje: 62000,
    estado: 'en_uso',
    proximoVencimiento: '2025-02-28',
    tipoVencimiento: 'Seguro',
  },
  {
    id: 'veh-003',
    patente: 'IJ 789 KL',
    marca: 'Mercedes-Benz',
    modelo: 'Sprinter',
    anio: 2020,
    tipo: 'utilitario',
    kilometraje: 85000,
    estado: 'mantenimiento',
    proximoVencimiento: '2025-01-05',
    tipoVencimiento: 'Service',
  },
];

export const mockMantenimientos: Mantenimiento[] = [
  { id: 'mant-001', vehiculoId: 'veh-001', tipo: 'Service completo', fecha: '2024-11-15', kilometraje: 40000, costo: 150000, descripcion: 'Cambio de aceite, filtros y revisión general' },
  { id: 'mant-002', vehiculoId: 'veh-002', tipo: 'Cambio de neumáticos', fecha: '2024-10-20', kilometraje: 58000, costo: 480000, descripcion: 'Juego de 4 neumáticos nuevos' },
  { id: 'mant-003', vehiculoId: 'veh-003', tipo: 'Reparación frenos', fecha: '2024-12-20', kilometraje: 85000, costo: 95000, descripcion: 'Cambio de pastillas y discos delanteros' },
];

export const mockHerramientas: Herramienta[] = [
  { id: 'her-001', codigo: 'HER-001', nombre: 'Mezcladora de hormigón 150L', categoria: 'Maquinaria', estado: 'en_uso', ubicacionActual: 'Torre Mirador - Piso 8', asignadoA: 'Equipo A' },
  { id: 'her-002', codigo: 'HER-002', nombre: 'Vibrador de hormigón', categoria: 'Maquinaria', estado: 'disponible', ubicacionActual: 'Depósito Central' },
  { id: 'her-003', codigo: 'HER-003', nombre: 'Amoladora angular 230mm', categoria: 'Herramientas eléctricas', estado: 'en_uso', ubicacionActual: 'Torre Mirador - Piso 7', asignadoA: 'Carlos Méndez' },
  { id: 'her-004', codigo: 'HER-004', nombre: 'Amoladora angular 115mm', categoria: 'Herramientas eléctricas', estado: 'disponible', ubicacionActual: 'Depósito Central' },
  { id: 'her-005', codigo: 'HER-005', nombre: 'Taladro percutor', categoria: 'Herramientas eléctricas', estado: 'en_uso', ubicacionActual: 'Torre Mirador - Piso 6', asignadoA: 'Equipo B' },
  { id: 'her-006', codigo: 'HER-006', nombre: 'Sierra circular', categoria: 'Herramientas eléctricas', estado: 'mantenimiento', ubicacionActual: 'Depósito Central' },
  { id: 'her-007', codigo: 'HER-007', nombre: 'Nivel láser', categoria: 'Medición', estado: 'en_uso', ubicacionActual: 'Torre Mirador', asignadoA: 'Ing. Méndez' },
  { id: 'her-008', codigo: 'HER-008', nombre: 'Andamio móvil (set)', categoria: 'Andamios', estado: 'en_uso', ubicacionActual: 'Torre Mirador - Piso 8' },
  { id: 'her-009', codigo: 'HER-009', nombre: 'Escalera extensible 6m', categoria: 'Acceso', estado: 'disponible', ubicacionActual: 'Depósito Central' },
  { id: 'her-010', codigo: 'HER-010', nombre: 'Soldadora eléctrica', categoria: 'Maquinaria', estado: 'disponible', ubicacionActual: 'Depósito Central' },
  { id: 'her-011', codigo: 'HER-011', nombre: 'Compresor de aire 50L', categoria: 'Maquinaria', estado: 'en_uso', ubicacionActual: 'Torre Mirador', asignadoA: 'Equipo A' },
  { id: 'her-012', codigo: 'HER-012', nombre: 'Martillo demoledor', categoria: 'Maquinaria', estado: 'baja', ubicacionActual: 'Depósito Central' },
];

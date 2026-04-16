import type { CategoriaMovimiento, EstadoCheque } from '@/types/tesoreria';

export function getCategoriaLabel(cat: CategoriaMovimiento): string {
  const map: Record<CategoriaMovimiento, string> = {
    obra_directa: 'Obra directa',
    personal: 'Personal',
    alquiler: 'Alquiler',
    servicios: 'Servicios',
    honorarios: 'Honorarios',
    impuestos: 'Impuestos',
    seguros: 'Seguros',
    marketing: 'Marketing',
    compras: 'Compras',
    administracion: 'Administración',
    otro: 'Otro',
  };
  return map[cat] || cat;
}

export function getEstadoChequeLabel(e: EstadoCheque): string {
  const map: Record<EstadoCheque, string> = {
    en_cartera: 'En cartera',
    depositado: 'Depositado',
    endosado: 'Endosado',
    rechazado: 'Rechazado',
    vencido: 'Vencido',
  };
  return map[e] || e;
}

export function getEstadoChequeClass(e: EstadoCheque): string {
  const map: Record<EstadoCheque, string> = {
    en_cartera: 'bg-blue-100 text-blue-700 border-blue-200',
    depositado: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    endosado: 'bg-purple-100 text-purple-700 border-purple-200',
    rechazado: 'bg-red-100 text-red-700 border-red-200',
    vencido: 'bg-amber-100 text-amber-700 border-amber-200',
  };
  return map[e] || '';
}

export function generarDiasCalendario(mes: Date): (Date | null)[] {
  const year = mes.getFullYear();
  const month = mes.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  return days;
}

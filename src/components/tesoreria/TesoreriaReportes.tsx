import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getCategoriaLabel } from './helpers';
import type { Movimiento, CategoriaMovimiento } from '@/types/tesoreria';

interface Props { movimientos: Movimiento[] }

export function TesoreriaReportes({ movimientos }: Props) {
  const last3Months = useMemo(() => {
    const now = new Date();
    const months: { label: string; month: number; year: number }[] = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }), month: d.getMonth(), year: d.getFullYear() });
    }
    return months;
  }, []);

  const monthData = useMemo(() => {
    return last3Months.map(m => {
      const movsDelMes = movimientos.filter(mv => { const d = new Date(mv.fecha); return d.getMonth() === m.month && d.getFullYear() === m.year; });
      const ingresosARS = movsDelMes.filter(mv => mv.tipo === 'ingreso' && mv.moneda === 'ARS').reduce((a, mv) => a + mv.monto, 0);
      const egresosARS = movsDelMes.filter(mv => mv.tipo === 'egreso' && mv.moneda === 'ARS').reduce((a, mv) => a + mv.monto, 0);
      const ingresosUSD = movsDelMes.filter(mv => mv.tipo === 'ingreso' && mv.moneda === 'USD').reduce((a, mv) => a + mv.monto, 0);
      const egresosUSD = movsDelMes.filter(mv => mv.tipo === 'egreso' && mv.moneda === 'USD').reduce((a, mv) => a + mv.monto, 0);
      return { ...m, ingresosARS, egresosARS, ingresosUSD, egresosUSD, netoARS: ingresosARS - egresosARS, netoUSD: ingresosUSD - egresosUSD, totalMovs: movsDelMes.length };
    });
  }, [movimientos, last3Months]);

  return (
    <div className="space-y-6">
      <p className="font-semibold">Comparativo últimos 3 meses</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {monthData.map(m => (
          <Card key={m.label}>
            <CardContent className="p-5 space-y-3">
              <p className="font-medium capitalize">{m.label}</p>
              <p className="text-xs text-muted-foreground">{m.totalMovs} movimientos</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Ingresos ARS</span><span className="text-emerald-600 font-medium">+{m.ingresosARS.toLocaleString('es-AR')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Egresos ARS</span><span className="text-red-600 font-medium">-{m.egresosARS.toLocaleString('es-AR')}</span></div>
                <div className="flex justify-between border-t pt-2"><span className="font-medium">Neto ARS</span><span className={`font-bold ${m.netoARS >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{m.netoARS >= 0 ? '+' : ''}{m.netoARS.toLocaleString('es-AR')}</span></div>
                <div className="flex justify-between pt-2"><span className="text-muted-foreground">Ingresos USD</span><span className="text-emerald-600 font-medium">+{m.ingresosUSD.toLocaleString('es-AR')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Egresos USD</span><span className="text-red-600 font-medium">-{m.egresosUSD.toLocaleString('es-AR')}</span></div>
                <div className="flex justify-between border-t pt-2"><span className="font-medium">Neto USD</span><span className={`font-bold ${m.netoUSD >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{m.netoUSD >= 0 ? '+' : ''}{m.netoUSD.toLocaleString('es-AR')}</span></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

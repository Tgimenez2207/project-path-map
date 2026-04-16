import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Check, Sparkles, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCategoriaLabel } from './helpers';
import type { Cuenta, Movimiento, Cheque, CostoFijo } from '@/types/tesoreria';

interface Props {
  cuentas: (Cuenta & { saldo: number })[];
  movimientos: Movimiento[];
  cheques: Cheque[];
  costosFijos: CostoFijo[];
  saldoTotalARS: number;
  saldoTotalUSD: number;
  totalIngresosMes: { ars: number; usd: number };
  totalEgresosMes: { ars: number; usd: number };
  chequesProximosAVencer: Cheque[];
  analisisIA: string | null;
  isLoadingIA: boolean;
  onAnalisisIA: () => void;
  onClearAnalisis: () => void;
}

export function TesoreriaDashboard({
  cuentas, movimientos, costosFijos,
  saldoTotalARS, saldoTotalUSD,
  totalIngresosMes, totalEgresosMes,
  chequesProximosAVencer,
  analisisIA, isLoadingIA, onAnalisisIA, onClearAnalisis,
}: Props) {
  const egresosPorCategoria = useMemo(() => {
    const now = new Date();
    return Object.entries(
      movimientos
        .filter(m => m.tipo === 'egreso' && new Date(m.fecha).getMonth() === now.getMonth() && new Date(m.fecha).getFullYear() === now.getFullYear())
        .reduce((acc, m) => { acc[m.categoria] = (acc[m.categoria] || 0) + m.monto; return acc; }, {} as Record<string, number>)
    ).sort(([, a], [, b]) => b - a);
  }, [movimientos]);

  const totalEgresosMesAll = egresosPorCategoria.reduce((a, [, v]) => a + v, 0);

  return (
    <div className="space-y-6">
      {/* Cards de cuentas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cuentas.map(cuenta => (
          <Card key={cuenta.id} className="border-l-4" style={{ borderLeftColor: cuenta.color }}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground truncate">{cuenta.nombre}</p>
              <p className="text-xl font-bold mt-1">
                {cuenta.moneda} {cuenta.saldo.toLocaleString('es-AR')}
              </p>
              <p className="text-xs text-muted-foreground capitalize mt-1">{cuenta.tipo.replace('_', ' ')}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Posición consolidada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1">Posición total ARS</p>
            <p className="text-2xl font-bold">ARS {saldoTotalARS.toLocaleString('es-AR')}</p>
            <p className={`text-sm mt-1 ${totalIngresosMes.ars - totalEgresosMes.ars >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {totalIngresosMes.ars - totalEgresosMes.ars >= 0 ? '↑' : '↓'} Este mes: {Math.abs(totalIngresosMes.ars - totalEgresosMes.ars).toLocaleString('es-AR')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1">Posición total USD</p>
            <p className="text-2xl font-bold">USD {saldoTotalUSD.toLocaleString('es-AR')}</p>
            <p className={`text-sm mt-1 ${totalIngresosMes.usd - totalEgresosMes.usd >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {totalIngresosMes.usd - totalEgresosMes.usd >= 0 ? '↑' : '↓'} Este mes: USD {Math.abs(totalIngresosMes.usd - totalEgresosMes.usd).toLocaleString('es-AR')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerta cheques próximos */}
      {chequesProximosAVencer.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <p className="font-medium text-amber-800">{chequesProximosAVencer.length} cheques vencen en los próximos 15 días</p>
            </div>
            <div className="space-y-2">
              {chequesProximosAVencer.map(c => {
                const dias = Math.ceil((new Date(c.fechaVencimiento).getTime() - Date.now()) / 86400000);
                return (
                  <div key={c.id} className="flex items-center justify-between text-sm bg-white/60 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={c.tipo === 'propio' ? 'text-red-600' : 'text-emerald-600'}>
                        {c.tipo === 'propio' ? '↑ Propio' : '↓ Tercero'}
                      </Badge>
                      <span>{c.banco} Nº {c.numero} {c.recibiDe ? `— de ${c.recibiDe}` : ''}{c.tipo === 'propio' ? ` — a ${c.titular}` : ''}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{c.moneda} {c.monto.toLocaleString('es-AR')}</p>
                      <p className="text-xs text-amber-700">Vence en {dias} días</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Flujo del mes + Egresos por categoría */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="font-semibold mb-4">Flujo del mes</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center"><span className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Ingresos ARS</span><span className="font-medium">ARS {totalIngresosMes.ars.toLocaleString('es-AR')}</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-red-500" /> Egresos ARS</span><span className="font-medium">ARS {totalEgresosMes.ars.toLocaleString('es-AR')}</span></div>
              <div className="flex justify-between items-center border-t pt-2"><span className="text-sm font-medium">Neto ARS</span><span className={`font-bold ${totalIngresosMes.ars - totalEgresosMes.ars >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{totalIngresosMes.ars - totalEgresosMes.ars >= 0 ? '+' : ''}ARS {(totalIngresosMes.ars - totalEgresosMes.ars).toLocaleString('es-AR')}</span></div>
              <div className="border-t pt-3 space-y-3">
                <div className="flex justify-between items-center"><span className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Ingresos USD</span><span className="font-medium">USD {totalIngresosMes.usd.toLocaleString('es-AR')}</span></div>
                <div className="flex justify-between items-center"><span className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-red-500" /> Egresos USD</span><span className="font-medium">USD {totalEgresosMes.usd.toLocaleString('es-AR')}</span></div>
                <div className="flex justify-between items-center border-t pt-2"><span className="text-sm font-medium">Neto USD</span><span className={`font-bold ${totalIngresosMes.usd - totalEgresosMes.usd >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{totalIngresosMes.usd - totalEgresosMes.usd >= 0 ? '+' : ''}USD {(totalIngresosMes.usd - totalEgresosMes.usd).toLocaleString('es-AR')}</span></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="font-semibold mb-4">Egresos por categoría (mes)</p>
            <div className="space-y-2">
              {egresosPorCategoria.map(([cat, total]) => {
                const pct = totalEgresosMesAll > 0 ? (total / totalEgresosMesAll) * 100 : 0;
                return (
                  <div key={cat} className="flex items-center gap-2 text-sm">
                    <span className="w-24 text-xs text-muted-foreground truncate">{getCategoriaLabel(cat as any)}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} /></div>
                    <span className="text-xs w-10 text-right">{pct.toFixed(0)}%</span>
                    <span className="text-xs w-20 text-right font-medium">{total.toLocaleString('es-AR')}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Costos fijos */}
      <Card>
        <CardContent className="p-5">
          <p className="font-semibold mb-3">Compromisos fijos del mes</p>
          <div className="space-y-2">
            {costosFijos.filter(c => c.activo).map(c => (
              <div key={c.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{c.descripcion}</p>
                  {c.proximoVencimiento && <p className="text-xs text-muted-foreground">Vence: {new Date(c.proximoVencimiento).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</p>}
                </div>
                <p className="font-semibold">{c.moneda} {c.monto.toLocaleString('es-AR')}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t">
            <span className="text-sm font-medium">Total fijos ARS/mes</span>
            <span className="font-bold">ARS {costosFijos.filter(c => c.activo && c.moneda === 'ARS').reduce((a, c) => a + c.monto, 0).toLocaleString('es-AR')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Análisis IA */}
      {analisisIA && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <p className="font-medium text-blue-800">Análisis financiero — IA</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={onAnalisisIA} disabled={isLoadingIA}><RefreshCw className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={onClearAnalisis}><X className="h-4 w-4" /></Button>
              </div>
            </div>
            <p className="text-sm text-blue-900 whitespace-pre-line">{analisisIA}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

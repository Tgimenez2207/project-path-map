import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { Movimiento, CostoFijo, Cuenta } from '@/types/tesoreria';

interface Props {
  movimientos: Movimiento[];
  costosFijos: CostoFijo[];
  saldoTotalARS: number;
}

export function TesoreriaReportes({ movimientos, costosFijos, saldoTotalARS }: Props) {
  const now = new Date();

  // Estado de resultados - calculado de movimientos reales del mes
  const estadoResultados = useMemo(() => {
    const movsDelMes = movimientos.filter(m => {
      const d = new Date(m.fecha);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && m.moneda === 'ARS';
    });
    const cobrosObras = movsDelMes.filter(m => m.tipo === 'ingreso' && m.categoria === 'obra_directa').reduce((a, m) => a + m.monto, 0);
    const otrosIngresos = movsDelMes.filter(m => m.tipo === 'ingreso' && m.categoria !== 'obra_directa').reduce((a, m) => a + m.monto, 0);
    const materiales = movsDelMes.filter(m => m.tipo === 'egreso' && m.categoria === 'compras').reduce((a, m) => a + m.monto, 0);
    const honorarios = movsDelMes.filter(m => m.tipo === 'egreso' && m.categoria === 'honorarios').reduce((a, m) => a + m.monto, 0);
    const personal = movsDelMes.filter(m => m.tipo === 'egreso' && m.categoria === 'personal').reduce((a, m) => a + m.monto, 0);
    const totalIngresos = cobrosObras + otrosIngresos;
    const totalDirectos = materiales + honorarios + personal;
    const totalIndirectos = costosFijos.filter(c => c.activo && c.moneda === 'ARS').reduce((a, c) => a + c.monto, 0);
    return { cobrosObras, otrosIngresos, totalIngresos, materiales, honorarios, personal, totalDirectos, totalIndirectos, resultado: totalIngresos - totalDirectos - totalIndirectos };
  }, [movimientos, costosFijos]);

  // Flujo de caja por mes
  const flujoPorMes = useMemo(() => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const anio = now.getFullYear();
    let acumulado = saldoTotalARS;
    // Reset acumulado by subtracting current year movements
    const movsAnio = movimientos.filter(m => new Date(m.fecha).getFullYear() === anio && m.moneda === 'ARS');
    const totalNetAnio = movsAnio.reduce((a, m) => {
      if (m.tipo === 'ingreso') return a + m.monto;
      if (m.tipo === 'egreso') return a - m.monto;
      return a;
    }, 0);
    const saldoInicioAnio = saldoTotalARS - totalNetAnio;
    acumulado = saldoInicioAnio;

    return meses.slice(0, now.getMonth() + 1).map((label, i) => {
      const movsMes = movimientos.filter(m => {
        const d = new Date(m.fecha);
        return d.getMonth() === i && d.getFullYear() === anio && m.moneda === 'ARS';
      });
      const ingresos = movsMes.filter(m => m.tipo === 'ingreso').reduce((a, m) => a + m.monto, 0);
      const egresos = movsMes.filter(m => m.tipo === 'egreso').reduce((a, m) => a + m.monto, 0);
      const neto = ingresos - egresos;
      acumulado += neto;
      return { label, ingresos, egresos, neto, acumulado };
    });
  }, [movimientos, saldoTotalARS]);

  const periodoLabel = now.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Estado de resultados */}
      <div className="border rounded-xl overflow-hidden">
        <div className="bg-muted/30 px-4 py-3 border-b">
          <p className="font-semibold text-sm">Estado de Resultados</p>
          <p className="text-xs text-muted-foreground capitalize">Período: {periodoLabel}</p>
        </div>
        <table className="w-full text-sm">
          <tbody>
            <tr className="bg-emerald-50/50 border-b"><td colSpan={2} className="px-4 py-2 font-semibold text-emerald-800">INGRESOS</td></tr>
            <tr className="border-b"><td className="px-6 py-2 text-muted-foreground">Cobros por obras</td><td className="px-4 py-2 text-right font-medium">ARS {estadoResultados.cobrosObras.toLocaleString('es-AR')}</td></tr>
            <tr className="border-b"><td className="px-6 py-2 text-muted-foreground">Otros ingresos</td><td className="px-4 py-2 text-right font-medium">ARS {estadoResultados.otrosIngresos.toLocaleString('es-AR')}</td></tr>
            <tr className="border-b bg-emerald-50"><td className="px-4 py-2 font-semibold">TOTAL INGRESOS</td><td className="px-4 py-2 text-right font-semibold text-emerald-700">ARS {estadoResultados.totalIngresos.toLocaleString('es-AR')}</td></tr>

            <tr className="bg-red-50/50 border-b"><td colSpan={2} className="px-4 py-2 font-semibold text-red-800">COSTOS DIRECTOS DE OBRA</td></tr>
            <tr className="border-b"><td className="px-6 py-2 text-muted-foreground">Materiales y proveedores</td><td className="px-4 py-2 text-right font-medium">ARS {estadoResultados.materiales.toLocaleString('es-AR')}</td></tr>
            <tr className="border-b"><td className="px-6 py-2 text-muted-foreground">Personal</td><td className="px-4 py-2 text-right font-medium">ARS {estadoResultados.personal.toLocaleString('es-AR')}</td></tr>
            <tr className="border-b"><td className="px-6 py-2 text-muted-foreground">Honorarios técnicos</td><td className="px-4 py-2 text-right font-medium">ARS {estadoResultados.honorarios.toLocaleString('es-AR')}</td></tr>
            <tr className="border-b bg-red-50"><td className="px-4 py-2 font-semibold">TOTAL COSTOS DIRECTOS</td><td className="px-4 py-2 text-right font-semibold text-red-600">ARS {estadoResultados.totalDirectos.toLocaleString('es-AR')}</td></tr>

            <tr className="bg-amber-50/50 border-b"><td colSpan={2} className="px-4 py-2 font-semibold text-amber-800">COSTOS INDIRECTOS</td></tr>
            {costosFijos.filter(c => c.activo && c.moneda === 'ARS').map(c => (
              <tr key={c.id} className="border-b"><td className="px-6 py-2 text-muted-foreground">{c.descripcion}</td><td className="px-4 py-2 text-right font-medium">ARS {c.monto.toLocaleString('es-AR')}</td></tr>
            ))}
            <tr className="border-b bg-amber-50"><td className="px-4 py-2 font-semibold">TOTAL INDIRECTOS</td><td className="px-4 py-2 text-right font-semibold text-amber-700">ARS {estadoResultados.totalIndirectos.toLocaleString('es-AR')}</td></tr>

            <tr className="bg-blue-50 border-t-2">
              <td className="px-4 py-3 font-bold text-base">RESULTADO OPERATIVO</td>
              <td className={`px-4 py-3 text-right font-bold text-lg ${estadoResultados.resultado >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                ARS {estadoResultados.resultado.toLocaleString('es-AR')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Flujo de caja por mes */}
      <div className="border rounded-xl overflow-hidden">
        <div className="bg-muted/30 px-4 py-3 border-b">
          <p className="font-semibold text-sm">Flujo de caja mensual</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 text-xs text-muted-foreground font-medium">Mes</th>
                <th className="text-right p-3 text-xs text-muted-foreground font-medium">Ingresos</th>
                <th className="text-right p-3 text-xs text-muted-foreground font-medium">Egresos</th>
                <th className="text-right p-3 text-xs text-muted-foreground font-medium">Neto</th>
                <th className="text-right p-3 text-xs text-muted-foreground font-medium">Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {flujoPorMes.map((mes, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="p-3 font-medium">{mes.label}</td>
                  <td className="p-3 text-right text-emerald-600">ARS {mes.ingresos.toLocaleString('es-AR')}</td>
                  <td className="p-3 text-right text-red-500">ARS {mes.egresos.toLocaleString('es-AR')}</td>
                  <td className={`p-3 text-right font-semibold ${mes.neto >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{mes.neto >= 0 ? '+' : ''}ARS {mes.neto.toLocaleString('es-AR')}</td>
                  <td className={`p-3 text-right font-semibold ${mes.acumulado >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>ARS {mes.acumulado.toLocaleString('es-AR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Button variant="outline" onClick={() => window.print()}>
        <Download className="h-4 w-4 mr-2" /> Exportar reportes PDF
      </Button>
    </div>
  );
}

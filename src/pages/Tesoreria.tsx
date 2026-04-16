import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Printer, Landmark } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { mockCuentas, mockMovimientos, mockCheques, mockCostosFijos } from '@/data/mockTesoreria';
import { TesoreriaDashboard } from '@/components/tesoreria/TesoreriaDashboard';
import { TesoreriaMovimientos } from '@/components/tesoreria/TesoreriaMovimientos';
import { TesoreriaCheques } from '@/components/tesoreria/TesoreriaCheques';
import { TesoreriaCostos } from '@/components/tesoreria/TesoreriaCostos';
import { TesoreriaReportes } from '@/components/tesoreria/TesoreriaReportes';
import type { Movimiento, Cheque, CostoFijo } from '@/types/tesoreria';

const Tesoreria = () => {
  const [cuentas] = useState(mockCuentas);
  const [movimientos, setMovimientos] = useState<Movimiento[]>(mockMovimientos);
  const [cheques, setCheques] = useState<Cheque[]>(mockCheques);
  const [costosFijos, setCostosFijos] = useState<CostoFijo[]>(mockCostosFijos);
  const [tabActiva, setTabActiva] = useState('dashboard');
  const [isLoadingIA, setIsLoadingIA] = useState(false);
  const [analisisIA, setAnalisisIA] = useState<string | null>(null);
  const [tipoCambio, setTipoCambio] = useState('1150');

  const [filtroMovimientos, setFiltroMovimientos] = useState({ tipo: 'todos', categoria: 'todas', cuentaId: 'todas', conciliado: 'todos', busqueda: '' });

  // Saldos por cuenta
  const saldosPorCuenta = useMemo(() => {
    return cuentas.map(cuenta => {
      const saldo = movimientos.reduce((acc, m) => {
        if (m.tipo === 'transferencia') {
          if (m.cuentaId === cuenta.id) return acc - m.monto;
          if (m.cuentaDestinoId === cuenta.id) return acc + m.monto;
          return acc;
        }
        if (m.cuentaId !== cuenta.id) return acc;
        if (m.tipo === 'ingreso' || m.tipo === 'ajuste') return acc + m.monto;
        if (m.tipo === 'egreso') return acc - m.monto;
        return acc;
      }, cuenta.saldoInicial);
      return { ...cuenta, saldo };
    });
  }, [movimientos, cuentas]);

  const saldoTotalARS = saldosPorCuenta.filter(c => c.moneda === 'ARS' && c.activa).reduce((a, c) => a + c.saldo, 0);
  const saldoTotalUSD = saldosPorCuenta.filter(c => c.moneda === 'USD' && c.activa).reduce((a, c) => a + c.saldo, 0);

  const now = new Date();
  const totalIngresosMes = useMemo(() => movimientos.filter(m => m.tipo === 'ingreso' && new Date(m.fecha).getMonth() === now.getMonth() && new Date(m.fecha).getFullYear() === now.getFullYear()).reduce((a, m) => m.moneda === 'ARS' ? { ...a, ars: a.ars + m.monto } : { ...a, usd: a.usd + m.monto }, { ars: 0, usd: 0 }), [movimientos]);
  const totalEgresosMes = useMemo(() => movimientos.filter(m => m.tipo === 'egreso' && new Date(m.fecha).getMonth() === now.getMonth() && new Date(m.fecha).getFullYear() === now.getFullYear()).reduce((a, m) => m.moneda === 'ARS' ? { ...a, ars: a.ars + m.monto } : { ...a, usd: a.usd + m.monto }, { ars: 0, usd: 0 }), [movimientos]);

  const chequesProximosAVencer = useMemo(() => cheques.filter(c => {
    const dias = Math.ceil((new Date(c.fechaVencimiento).getTime() - Date.now()) / 86400000);
    return dias >= 0 && dias <= 15 && c.estado === 'en_cartera';
  }), [cheques]);

  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter(m => {
      if (filtroMovimientos.tipo !== 'todos' && m.tipo !== filtroMovimientos.tipo) return false;
      if (filtroMovimientos.categoria !== 'todas' && m.categoria !== filtroMovimientos.categoria) return false;
      if (filtroMovimientos.cuentaId !== 'todas' && m.cuentaId !== filtroMovimientos.cuentaId) return false;
      if (filtroMovimientos.conciliado !== 'todos') { if (m.conciliado !== (filtroMovimientos.conciliado === 'si')) return false; }
      if (filtroMovimientos.busqueda && !m.descripcion.toLowerCase().includes(filtroMovimientos.busqueda.toLowerCase())) return false;
      return true;
    }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [movimientos, filtroMovimientos]);

  const toggleConciliado = useCallback((id: string) => {
    setMovimientos(prev => prev.map(m => m.id === id ? { ...m, conciliado: !m.conciliado } : m));
  }, []);

  const addMovimiento = useCallback((m: Omit<Movimiento, 'id'>) => {
    // Validate same currency for transfers
    if (m.tipo === 'transferencia' && m.cuentaDestinoId) {
      const origen = cuentas.find(c => c.id === m.cuentaId);
      const destino = cuentas.find(c => c.id === m.cuentaDestinoId);
      if (origen && destino && origen.moneda !== destino.moneda) {
        toast.error('Las cuentas de transferencia deben tener la misma moneda');
        return;
      }
    }
    setMovimientos(prev => [{ ...m, id: `m${Date.now()}` } as Movimiento, ...prev]);
    toast.success('Movimiento registrado');
  }, [cuentas]);

  const depositarCheque = useCallback((id: string) => {
    setCheques(prev => prev.map(c => c.id === id ? { ...c, estado: 'depositado' as const, fechaDeposito: new Date().toISOString().split('T')[0] } : c));
    toast.success('Cheque marcado como depositado');
  }, []);

  const endosarCheque = useCallback((id: string, endosadoA: string) => {
    setCheques(prev => prev.map(c => c.id === id ? { ...c, estado: 'endosado' as const, endosadoA, fechaEndoso: new Date().toISOString().split('T')[0] } : c));
    toast.success(`Cheque endosado a ${endosadoA}`);
  }, []);

  const addCheque = useCallback((c: Omit<Cheque, 'id'>) => {
    setCheques(prev => [{ ...c, id: `chq${Date.now()}` } as Cheque, ...prev]);
    toast.success('Cheque registrado');
  }, []);

  const addCostoFijo = useCallback((c: Omit<CostoFijo, 'id'>) => {
    setCostosFijos(prev => [{ ...c, id: `cf${Date.now()}` } as CostoFijo, ...prev]);
    toast.success('Costo fijo agregado');
  }, []);

  const toggleCostoActivo = useCallback((id: string) => {
    setCostosFijos(prev => prev.map(c => c.id === id ? { ...c, activo: !c.activo } : c));
  }, []);

  const deleteCostoFijo = useCallback((id: string) => {
    setCostosFijos(prev => prev.filter(c => c.id !== id));
    toast.success('Costo fijo eliminado');
  }, []);

  const pagarCostoFijo = useCallback((costo: CostoFijo, cuentaId: string) => {
    const nuevoMov: Movimiento = {
      id: `m${Date.now()}`,
      fecha: new Date().toISOString().split('T')[0],
      tipo: 'egreso',
      categoria: costo.categoria,
      descripcion: costo.descripcion,
      monto: costo.monto,
      moneda: costo.moneda,
      cuentaId,
      creadoPor: 'Sistema',
      conciliado: false,
    };
    setMovimientos(prev => [nuevoMov, ...prev]);
    if (costo.proximoVencimiento && costo.esRecurrente) {
      const proxVenc = new Date(costo.proximoVencimiento);
      proxVenc.setMonth(proxVenc.getMonth() + 1);
      setCostosFijos(prev => prev.map(c => c.id === costo.id ? { ...c, proximoVencimiento: proxVenc.toISOString().split('T')[0] } : c));
    }
    toast.success(`Pago de "${costo.descripcion}" registrado`);
  }, []);

  const handleAnalisisIA = useCallback(async () => {
    setIsLoadingIA(true);
    setAnalisisIA(null);
    try {
      const prompt = `Analizá esta situación financiera de una constructora argentina:

POSICIÓN DE CAJA:
${saldosPorCuenta.map(c => `${c.nombre}: ${c.moneda} ${c.saldo.toLocaleString()}`).join('\n')}
Total ARS: ${saldoTotalARS.toLocaleString()}
Total USD: ${saldoTotalUSD.toLocaleString()}

FLUJO DEL MES:
Ingresos ARS: ${totalIngresosMes.ars.toLocaleString()} | Egresos ARS: ${totalEgresosMes.ars.toLocaleString()}
Ingresos USD: ${totalIngresosMes.usd.toLocaleString()} | Egresos USD: ${totalEgresosMes.usd.toLocaleString()}

CHEQUES PRÓXIMOS A VENCER:
${chequesProximosAVencer.map(c => {
  const dias = Math.ceil((new Date(c.fechaVencimiento).getTime() - Date.now()) / 86400000);
  return `- ${c.tipo === 'propio' ? 'PROPIO' : 'TERCERO'}: ${c.moneda} ${c.monto.toLocaleString()} — vence en ${dias} días`;
}).join('\n') || 'Ninguno'}

COSTOS FIJOS MENSUALES: ARS ${costosFijos.filter(c => c.activo && c.moneda === 'ARS').reduce((a, c) => a + c.monto, 0).toLocaleString()}/mes
MOVIMIENTOS SIN CONCILIAR: ${movimientos.filter(m => !m.conciliado).length}`;

      const { data, error } = await supabase.functions.invoke('ai-finanzas', {
        body: { prompt, system: 'Sos un CFO y asesor financiero para una constructora/desarrolladora inmobiliaria argentina. Analizás la situación de caja, cheques y costos fijos y das recomendaciones concretas en español rioplatense. Máximo 400 palabras. Estructurá con: 1) Salud financiera general 2) Alertas urgentes 3) Oportunidades de optimización 4) Recomendaciones próximos 30 días' },
      });
      if (error) throw error;
      setAnalisisIA(data?.text || data?.response || 'Análisis no disponible');
    } catch {
      // Fallback to local summary
      setAnalisisIA(`📊 Resumen financiero Nato Obras\n\n✅ Posición consolidada: ARS ${saldoTotalARS.toLocaleString('es-AR')} + USD ${saldoTotalUSD.toLocaleString('es-AR')}\n\n⚠️ ${chequesProximosAVencer.length} cheques próximos a vencer por ARS ${chequesProximosAVencer.reduce((a, c) => a + c.monto, 0).toLocaleString('es-AR')}\n\n💡 Recomendaciones:\n• Revisar cheques en cartera y priorizar depósitos\n• Los costos fijos mensuales representan ARS ${costosFijos.filter(c => c.activo && c.moneda === 'ARS').reduce((a, c) => a + c.monto, 0).toLocaleString('es-AR')}\n• Considerar consolidar pagos a proveedores para optimizar flujo\n• ${movimientos.filter(m => !m.conciliado).length} movimientos sin conciliar — revisar semanalmente`);
    } finally {
      setIsLoadingIA(false);
    }
  }, [saldosPorCuenta, saldoTotalARS, saldoTotalUSD, totalIngresosMes, totalEgresosMes, chequesProximosAVencer, costosFijos, movimientos]);

  const tc = parseFloat(tipoCambio) || 0;

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Tesorería</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Posición ARS: {saldoTotalARS.toLocaleString('es-AR')} · Posición USD: {saldoTotalUSD.toLocaleString('es-AR')}
            {tc > 0 && <span className="text-muted-foreground"> · Equiv. ARS {(saldoTotalARS + saldoTotalUSD * tc).toLocaleString('es-AR')}</span>}
            {chequesProximosAVencer.length > 0 && <span className="text-amber-600"> · {chequesProximosAVencer.length} cheques por vencer</span>}
          </p>
        </div>
        <div className="flex gap-2 items-center print:hidden">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>TC:</span>
            <Input className="w-20 h-8 text-xs" value={tipoCambio} onChange={e => setTipoCambio(e.target.value)} placeholder="ARS/USD" />
          </div>
          <Button variant="outline" size="sm" onClick={handleAnalisisIA} disabled={isLoadingIA}>
            <Sparkles className="h-4 w-4 mr-1" /> Análisis IA
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1" /> Exportar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tabActiva} onValueChange={setTabActiva}>
        <TabsList className="w-full sm:w-auto print:hidden">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
          <TabsTrigger value="cheques" className="relative">
            Cheques
            {chequesProximosAVencer.length > 0 && (
              <Badge className="ml-1.5 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-amber-500">{chequesProximosAVencer.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="costos">Costos fijos</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <TesoreriaDashboard
            cuentas={saldosPorCuenta} movimientos={movimientos} cheques={cheques} costosFijos={costosFijos}
            saldoTotalARS={saldoTotalARS} saldoTotalUSD={saldoTotalUSD}
            totalIngresosMes={totalIngresosMes} totalEgresosMes={totalEgresosMes}
            chequesProximosAVencer={chequesProximosAVencer}
            analisisIA={analisisIA} isLoadingIA={isLoadingIA}
            onAnalisisIA={handleAnalisisIA} onClearAnalisis={() => setAnalisisIA(null)}
          />
        </TabsContent>

        <TabsContent value="movimientos">
          <TesoreriaMovimientos
            movimientos={movimientos} cuentas={cuentas}
            filtro={filtroMovimientos} setFiltro={setFiltroMovimientos}
            movimientosFiltrados={movimientosFiltrados}
            onToggleConciliado={toggleConciliado} onAddMovimiento={addMovimiento}
          />
        </TabsContent>

        <TabsContent value="cheques">
          <TesoreriaCheques cheques={cheques} cuentas={cuentas} onDepositar={depositarCheque} onEndosar={endosarCheque} onAddCheque={addCheque} />
        </TabsContent>

        <TabsContent value="costos">
          <TesoreriaCostos costosFijos={costosFijos} cuentas={cuentas} onAdd={addCostoFijo} onToggleActivo={toggleCostoActivo} onDelete={deleteCostoFijo} onPagar={pagarCostoFijo} />
        </TabsContent>

        <TabsContent value="reportes">
          <TesoreriaReportes movimientos={movimientos} costosFijos={costosFijos} saldoTotalARS={saldoTotalARS} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tesoreria;

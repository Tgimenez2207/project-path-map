import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Printer, Landmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockCuentas, mockMovimientos, mockCheques, mockCostosFijos } from '@/data/mockTesoreria';
import { TesoreriaDashboard } from '@/components/tesoreria/TesoreriaDashboard';
import { TesoreriaMovimientos } from '@/components/tesoreria/TesoreriaMovimientos';
import { TesoreriaCheques } from '@/components/tesoreria/TesoreriaCheques';
import { TesoreriaCostos } from '@/components/tesoreria/TesoreriaCostos';
import { TesoreriaReportes } from '@/components/tesoreria/TesoreriaReportes';
import type { Movimiento, Cheque, CostoFijo } from '@/types/tesoreria';

const Tesoreria = () => {
  const { toast } = useToast();
  const [cuentas] = useState(mockCuentas);
  const [movimientos, setMovimientos] = useState<Movimiento[]>(mockMovimientos);
  const [cheques, setCheques] = useState<Cheque[]>(mockCheques);
  const [costosFijos, setCostosFijos] = useState<CostoFijo[]>(mockCostosFijos);
  const [tabActiva, setTabActiva] = useState('dashboard');
  const [isLoadingIA, setIsLoadingIA] = useState(false);
  const [analisisIA, setAnalisisIA] = useState<string | null>(null);

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
    setMovimientos(prev => [{ ...m, id: `m${Date.now()}` } as Movimiento, ...prev]);
    toast({ title: 'Movimiento registrado' });
  }, [toast]);

  const depositarCheque = useCallback((id: string) => {
    setCheques(prev => prev.map(c => c.id === id ? { ...c, estado: 'depositado' as const, fechaDeposito: new Date().toISOString().split('T')[0] } : c));
    toast({ title: 'Cheque depositado' });
  }, [toast]);

  const endosarCheque = useCallback((id: string) => {
    const dest = prompt('Endosar a:');
    if (!dest) return;
    setCheques(prev => prev.map(c => c.id === id ? { ...c, estado: 'endosado' as const, endosadoA: dest, fechaEndoso: new Date().toISOString().split('T')[0] } : c));
    toast({ title: 'Cheque endosado' });
  }, [toast]);

  const addCheque = useCallback((c: Omit<Cheque, 'id'>) => {
    setCheques(prev => [{ ...c, id: `chq${Date.now()}` } as Cheque, ...prev]);
    toast({ title: 'Cheque registrado' });
  }, [toast]);

  const addCostoFijo = useCallback((c: Omit<CostoFijo, 'id'>) => {
    setCostosFijos(prev => [{ ...c, id: `cf${Date.now()}` } as CostoFijo, ...prev]);
    toast({ title: 'Costo fijo agregado' });
  }, [toast]);

  const toggleCostoActivo = useCallback((id: string) => {
    setCostosFijos(prev => prev.map(c => c.id === id ? { ...c, activo: !c.activo } : c));
  }, []);

  const handleAnalisisIA = useCallback(async () => {
    setIsLoadingIA(true);
    setTimeout(() => {
      setAnalisisIA(`📊 Resumen financiero Nato Obras\n\n✅ Posición consolidada: ARS ${saldoTotalARS.toLocaleString('es-AR')} + USD ${saldoTotalUSD.toLocaleString('es-AR')}\n\n⚠️ ${chequesProximosAVencer.length} cheques próximos a vencer por ARS ${chequesProximosAVencer.reduce((a, c) => a + c.monto, 0).toLocaleString('es-AR')}\n\n💡 Recomendaciones:\n• Revisar cheques en cartera y priorizar depósitos\n• Los costos fijos mensuales representan ARS ${costosFijos.filter(c => c.activo && c.moneda === 'ARS').reduce((a, c) => a + c.monto, 0).toLocaleString('es-AR')}\n• Considerar consolidar pagos a proveedores para optimizar flujo`);
      setIsLoadingIA(false);
    }, 1500);
  }, [saldoTotalARS, saldoTotalUSD, chequesProximosAVencer, costosFijos]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Tesorería</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Posición ARS: {saldoTotalARS.toLocaleString('es-AR')} · Posición USD: {saldoTotalUSD.toLocaleString('es-AR')}
            {chequesProximosAVencer.length > 0 && <span className="text-amber-600"> · {chequesProximosAVencer.length} cheques por vencer</span>}
          </p>
        </div>
        <div className="flex gap-2">
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
        <TabsList className="w-full sm:w-auto">
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
          <TesoreriaCostos costosFijos={costosFijos} onAdd={addCostoFijo} onToggleActivo={toggleCostoActivo} />
        </TabsContent>

        <TabsContent value="reportes">
          <TesoreriaReportes movimientos={movimientos} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tesoreria;

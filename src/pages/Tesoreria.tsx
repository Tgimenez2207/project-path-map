import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Printer, Landmark, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { TesoreriaDashboard } from '@/components/tesoreria/TesoreriaDashboard';
import { TesoreriaMovimientos } from '@/components/tesoreria/TesoreriaMovimientos';
import { TesoreriaCheques } from '@/components/tesoreria/TesoreriaCheques';
import { TesoreriaCostos } from '@/components/tesoreria/TesoreriaCostos';
import { TesoreriaReportes } from '@/components/tesoreria/TesoreriaReportes';
import type { Movimiento, Cheque, CostoFijo, Cuenta } from '@/types/tesoreria';

// DB row mappers
const mapCuenta = (r: any): Cuenta => ({
  id: r.id, nombre: r.nombre, tipo: r.tipo, banco: r.banco, nroCuenta: r.nro_cuenta, cbu: r.cbu,
  moneda: r.moneda, saldoInicial: Number(r.saldo_inicial), activa: r.activa, color: r.color,
});

const mapMovimiento = (r: any): Movimiento => ({
  id: r.id, fecha: r.fecha, tipo: r.tipo, categoria: r.categoria, descripcion: r.descripcion,
  monto: Number(r.monto), moneda: r.moneda, cuentaId: r.cuenta_id, cuentaDestinoId: r.cuenta_destino_id,
  obraId: r.obra_id, obraNombre: r.obra_nombre, proveedorId: r.proveedor_id, clienteId: r.cliente_id,
  contratoId: r.contrato_id, chequeId: r.cheque_id, comprobante: r.comprobante, notas: r.notas,
  creadoPor: r.creado_por, conciliado: r.conciliado,
});

const mapCheque = (r: any): Cheque => ({
  id: r.id, tipo: r.tipo, numero: r.numero, banco: r.banco, titular: r.titular,
  monto: Number(r.monto), moneda: r.moneda, fechaEmision: r.fecha_emision,
  fechaVencimiento: r.fecha_vencimiento, estado: r.estado, cuentaId: r.cuenta_id,
  recibiDe: r.recibi_de, fechaDeposito: r.fecha_deposito, fechaEndoso: r.fecha_endoso,
  endosadoA: r.endosado_a, motivoRechazo: r.motivo_rechazo, obraId: r.obra_id, obraNombre: r.obra_nombre, notas: r.notas,
});

const mapCostoFijo = (r: any): CostoFijo => ({
  id: r.id, descripcion: r.descripcion, categoria: r.categoria, monto: Number(r.monto),
  moneda: r.moneda, esRecurrente: r.es_recurrente, frecuencia: r.frecuencia,
  proximoVencimiento: r.proximo_vencimiento, activo: r.activo, notas: r.notas,
});

const Tesoreria = () => {
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [costosFijos, setCostosFijos] = useState<CostoFijo[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabActiva, setTabActiva] = useState('dashboard');
  const [isLoadingIA, setIsLoadingIA] = useState(false);
  const [analisisIA, setAnalisisIA] = useState<string | null>(null);
  const [tipoCambio, setTipoCambio] = useState('1150');
  const [filtroMovimientos, setFiltroMovimientos] = useState({ tipo: 'todos', categoria: 'todas', cuentaId: 'todas', conciliado: 'todos', busqueda: '' });

  // Load all data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [cRes, mRes, chRes, cfRes] = await Promise.all([
        supabase.from('cuentas_tesoreria').select('*').order('created_at'),
        supabase.from('movimientos_tesoreria').select('*').order('fecha', { ascending: false }),
        supabase.from('cheques').select('*').order('fecha_vencimiento'),
        supabase.from('costos_fijos').select('*').order('proximo_vencimiento'),
      ]);
      if (cRes.data) setCuentas(cRes.data.map(mapCuenta));
      if (mRes.data) setMovimientos(mRes.data.map(mapMovimiento));
      if (chRes.data) setCheques(chRes.data.map(mapCheque));
      if (cfRes.data) setCostosFijos(cfRes.data.map(mapCostoFijo));
      setLoading(false);
    };
    load();
  }, []);

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

  const toggleConciliado = useCallback(async (id: string) => {
    const mov = movimientos.find(m => m.id === id);
    if (!mov) return;
    const newVal = !mov.conciliado;
    setMovimientos(prev => prev.map(m => m.id === id ? { ...m, conciliado: newVal } : m));
    const { error } = await supabase.from('movimientos_tesoreria').update({ conciliado: newVal }).eq('id', id);
    if (error) { toast.error('Error al actualizar'); setMovimientos(prev => prev.map(m => m.id === id ? { ...m, conciliado: !newVal } : m)); }
  }, [movimientos]);

  const addMovimiento = useCallback(async (m: Omit<Movimiento, 'id'>) => {
    if (m.tipo === 'transferencia' && m.cuentaDestinoId) {
      const origen = cuentas.find(c => c.id === m.cuentaId);
      const destino = cuentas.find(c => c.id === m.cuentaDestinoId);
      if (origen && destino && origen.moneda !== destino.moneda) {
        toast.error('Las cuentas de transferencia deben tener la misma moneda');
        return;
      }
    }
    const { data, error } = await supabase.from('movimientos_tesoreria').insert({
      fecha: m.fecha, tipo: m.tipo, categoria: m.categoria, descripcion: m.descripcion,
      monto: m.monto, moneda: m.moneda, cuenta_id: m.cuentaId || null,
      cuenta_destino_id: m.cuentaDestinoId || null, obra_nombre: m.obraNombre || null,
      comprobante: m.comprobante || null, notas: m.notas || null,
      creado_por: m.creadoPor, conciliado: false,
    }).select().single();
    if (error) { toast.error('Error al registrar movimiento'); return; }
    if (data) setMovimientos(prev => [mapMovimiento(data), ...prev]);
    toast.success('Movimiento registrado');
  }, [cuentas]);

  const depositarCheque = useCallback(async (id: string) => {
    const hoy = new Date().toISOString().split('T')[0];
    setC heques(prev => prev.map(c => c.id === id ? { ...c, estado: 'depositado' as const, fechaDeposito: hoy } : c));
    const { error } = await supabase.from('cheques').update({ estado: 'depositado', fecha_deposito: hoy }).eq('id', id);
    if (error) toast.error('Error al depositar cheque');
    else toast.success('Cheque marcado como depositado');
  }, []);

  const endosarCheque = useCallback(async (id: string, endosadoA: string) => {
    const hoy = new Date().toISOString().split('T')[0];
    setCheques(prev => prev.map(c => c.id === id ? { ...c, estado: 'endosado' as const, endosadoA, fechaEndoso: hoy } : c));
    const { error } = await supabase.from('cheques').update({ estado: 'endosado', endosado_a: endosadoA, fecha_endoso: hoy }).eq('id', id);
    if (error) toast.error('Error al endosar cheque');
    else toast.success(`Cheque endosado a ${endosadoA}`);
  }, []);

  const addCheque = useCallback(async (c: Omit<Cheque, 'id'>) => {
    const { data, error } = await supabase.from('cheques').insert({
      tipo: c.tipo, numero: c.numero, banco: c.banco, titular: c.titular,
      monto: c.monto, moneda: c.moneda, fecha_emision: c.fechaEmision,
      fecha_vencimiento: c.fechaVencimiento, estado: 'en_cartera',
      cuenta_id: c.cuentaId || null, recibi_de: c.recibiDe || null,
      obra_nombre: c.obraNombre || null, notas: c.notas || null,
    }).select().single();
    if (error) { toast.error('Error al registrar cheque'); return; }
    if (data) setCheques(prev => [mapCheque(data), ...prev]);
    toast.success('Cheque registrado');
  }, []);

  const addCostoFijo = useCallback(async (c: Omit<CostoFijo, 'id'>) => {
    const { data, error } = await supabase.from('costos_fijos').insert({
      descripcion: c.descripcion, categoria: c.categoria, monto: c.monto,
      moneda: c.moneda, es_recurrente: c.esRecurrente, frecuencia: c.frecuencia || null,
      proximo_vencimiento: c.proximoVencimiento || null, activo: true, notas: c.notas || null,
    }).select().single();
    if (error) { toast.error('Error al agregar costo fijo'); return; }
    if (data) setCostosFijos(prev => [mapCostoFijo(data), ...prev]);
    toast.success('Costo fijo agregado');
  }, []);

  const toggleCostoActivo = useCallback(async (id: string) => {
    const cf = costosFijos.find(c => c.id === id);
    if (!cf) return;
    const newVal = !cf.activo;
    setCostosFijos(prev => prev.map(c => c.id === id ? { ...c, activo: newVal } : c));
    await supabase.from('costos_fijos').update({ activo: newVal }).eq('id', id);
  }, [costosFijos]);

  const deleteCostoFijo = useCallback(async (id: string) => {
    setCostosFijos(prev => prev.filter(c => c.id !== id));
    const { error } = await supabase.from('costos_fijos').delete().eq('id', id);
    if (error) toast.error('Error al eliminar');
    else toast.success('Costo fijo eliminado');
  }, []);

  const pagarCostoFijo = useCallback(async (costo: CostoFijo, cuentaId: string) => {
    // Insert movimiento
    const { data, error } = await supabase.from('movimientos_tesoreria').insert({
      fecha: new Date().toISOString().split('T')[0], tipo: 'egreso', categoria: costo.categoria,
      descripcion: costo.descripcion, monto: costo.monto, moneda: costo.moneda,
      cuenta_id: cuentaId, creado_por: 'Sistema', conciliado: false,
    }).select().single();
    if (error) { toast.error('Error al registrar pago'); return; }
    if (data) setMovimientos(prev => [mapMovimiento(data), ...prev]);
    // Update next due date
    if (costo.proximoVencimiento && costo.esRecurrente) {
      const proxVenc = new Date(costo.proximoVencimiento);
      proxVenc.setMonth(proxVenc.getMonth() + 1);
      const newDate = proxVenc.toISOString().split('T')[0];
      setCostosFijos(prev => prev.map(c => c.id === costo.id ? { ...c, proximoVencimiento: newDate } : c));
      await supabase.from('costos_fijos').update({ proximo_vencimiento: newDate }).eq('id', costo.id);
    }
    toast.success(`Pago de "${costo.descripcion}" registrado`);
  }, []);

  const handleAnalisisIA = useCallback(async () => {
    setIsLoadingIA(true);
    setAnalisisIA(null);
    try {
      const { data, error } = await supabase.functions.invoke('ai-finanzas', {
        body: {
          messages: [{
            role: 'user',
            content: `Analizá esta situación financiera:\n\nPOSICIÓN:\n${saldosPorCuenta.map(c => `${c.nombre}: ${c.moneda} ${c.saldo.toLocaleString()}`).join('\n')}\nTotal ARS: ${saldoTotalARS.toLocaleString()} | USD: ${saldoTotalUSD.toLocaleString()}\n\nFLUJO MES:\nIngresos ARS: ${totalIngresosMes.ars.toLocaleString()} | Egresos: ${totalEgresosMes.ars.toLocaleString()}\nIngresos USD: ${totalIngresosMes.usd.toLocaleString()} | Egresos: ${totalEgresosMes.usd.toLocaleString()}\n\nCHEQUES POR VENCER: ${chequesProximosAVencer.length}\nCOSTOS FIJOS ARS/mes: ${costosFijos.filter(c => c.activo && c.moneda === 'ARS').reduce((a, c) => a + c.monto, 0).toLocaleString()}\nSIN CONCILIAR: ${movimientos.filter(m => !m.conciliado).length}`,
          }],
        },
      });
      if (error) throw error;
      setAnalisisIA(data?.texto || 'Análisis no disponible');
    } catch {
      setAnalisisIA(`📊 Resumen financiero\n\n✅ Posición: ARS ${saldoTotalARS.toLocaleString('es-AR')} + USD ${saldoTotalUSD.toLocaleString('es-AR')}\n⚠️ ${chequesProximosAVencer.length} cheques por vencer\n💡 ${movimientos.filter(m => !m.conciliado).length} movimientos sin conciliar`);
    } finally {
      setIsLoadingIA(false);
    }
  }, [saldosPorCuenta, saldoTotalARS, saldoTotalUSD, totalIngresosMes, totalEgresosMes, chequesProximosAVencer, costosFijos, movimientos]);

  const tc = parseFloat(tipoCambio) || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Tesorería</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Posición ARS: {saldoTotalARS.toLocaleString('es-AR')} · Posición USD: {saldoTotalUSD.toLocaleString('es-AR')}
            {tc > 0 && <span> · Equiv. ARS {(saldoTotalARS + saldoTotalUSD * tc).toLocaleString('es-AR')}</span>}
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

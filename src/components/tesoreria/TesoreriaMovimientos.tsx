import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, ArrowDown, ArrowUp, ArrowLeftRight, Search, Check } from 'lucide-react';
import { getCategoriaLabel } from './helpers';
import type { Cuenta, Movimiento, TipoMovimientoT, CategoriaMovimiento } from '@/types/tesoreria';

interface Props {
  movimientos: Movimiento[];
  cuentas: Cuenta[];
  filtro: { tipo: string; categoria: string; cuentaId: string; conciliado: string; busqueda: string };
  setFiltro: (f: any) => void;
  movimientosFiltrados: Movimiento[];
  onToggleConciliado: (id: string) => void;
  onAddMovimiento: (m: Omit<Movimiento, 'id'>) => void;
}

export function TesoreriaMovimientos({ movimientos, cuentas, filtro, setFiltro, movimientosFiltrados, onToggleConciliado, onAddMovimiento }: Props) {
  const [showNuevo, setShowNuevo] = useState(false);
  const [tipoNuevo, setTipoNuevo] = useState<TipoMovimientoT>('egreso');
  const [detalle, setDetalle] = useState<Movimiento | null>(null);

  // Form state
  const [form, setForm] = useState({ fecha: new Date().toISOString().split('T')[0], cuentaId: '', cuentaDestinoId: '', descripcion: '', categoria: 'otro' as CategoriaMovimiento, monto: '', moneda: 'ARS' as 'ARS' | 'USD', obraNombre: '', comprobante: '', notas: '' });

  const resetForm = () => setForm({ fecha: new Date().toISOString().split('T')[0], cuentaId: '', cuentaDestinoId: '', descripcion: '', categoria: 'otro', monto: '', moneda: 'ARS', obraNombre: '', comprobante: '', notas: '' });

  const guardar = () => {
    if (!form.descripcion || !form.cuentaId || !form.monto) return;
    onAddMovimiento({
      fecha: form.fecha, tipo: tipoNuevo, categoria: tipoNuevo === 'transferencia' ? 'otro' : form.categoria, descripcion: form.descripcion,
      monto: parseFloat(form.monto), moneda: form.moneda, cuentaId: form.cuentaId,
      cuentaDestinoId: tipoNuevo === 'transferencia' ? form.cuentaDestinoId : undefined,
      obraNombre: form.obraNombre || undefined, comprobante: form.comprobante || undefined, notas: form.notas || undefined,
      creadoPor: 'admin', conciliado: false,
    });
    setShowNuevo(false);
    resetForm();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button size="sm" onClick={() => { setTipoNuevo('ingreso'); setShowNuevo(true); resetForm(); }} className="bg-emerald-600 hover:bg-emerald-700"><ArrowDown className="h-4 w-4 mr-1" /> Ingreso</Button>
          <Button size="sm" onClick={() => { setTipoNuevo('egreso'); setShowNuevo(true); resetForm(); }} className="bg-red-600 hover:bg-red-700"><ArrowUp className="h-4 w-4 mr-1" /> Egreso</Button>
          <Button size="sm" variant="outline" onClick={() => { setTipoNuevo('transferencia'); setShowNuevo(true); resetForm(); }}><ArrowLeftRight className="h-4 w-4 mr-1" /> Transferencia</Button>
        </div>
        <p className="text-xs text-muted-foreground">{movimientosFiltrados.length} movimientos · {movimientos.filter(m => !m.conciliado).length} sin conciliar</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar..." value={filtro.busqueda} onChange={e => setFiltro({ ...filtro, busqueda: e.target.value })} />
        </div>
        <Select value={filtro.tipo} onValueChange={v => setFiltro({ ...filtro, tipo: v })}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ingreso">Ingresos</SelectItem>
            <SelectItem value="egreso">Egresos</SelectItem>
            <SelectItem value="transferencia">Transferencias</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtro.cuentaId} onValueChange={v => setFiltro({ ...filtro, cuentaId: v })}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las cuentas</SelectItem>
            {cuentas.map(c => <SelectItem key={c.id} value={c.id}>{c.nombre.split('—')[0].trim()}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtro.conciliado} onValueChange={v => setFiltro({ ...filtro, conciliado: v })}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Conciliación</SelectItem>
            <SelectItem value="si">Conciliados</SelectItem>
            <SelectItem value="no">Sin conciliar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30 border-b">
              <th className="text-left p-3 text-xs text-muted-foreground font-medium">Fecha</th>
              <th className="text-left p-3 text-xs text-muted-foreground font-medium">Descripción</th>
              <th className="text-left p-3 text-xs text-muted-foreground font-medium">Categoría</th>
              <th className="text-left p-3 text-xs text-muted-foreground font-medium">Cuenta</th>
              <th className="text-left p-3 text-xs text-muted-foreground font-medium">Obra</th>
              <th className="text-right p-3 text-xs text-muted-foreground font-medium">Monto</th>
              <th className="text-center p-3 text-xs text-muted-foreground font-medium">OK</th>
            </tr>
          </thead>
          <tbody>
            {movimientosFiltrados.map(m => {
              const cuenta = cuentas.find(c => c.id === m.cuentaId);
              return (
                <tr key={m.id} className="border-b last:border-0 hover:bg-muted/10 cursor-pointer transition-colors" onClick={() => setDetalle(m)}>
                  <td className="p-3 text-muted-foreground">{new Date(m.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</td>
                  <td className="p-3">
                    <p className="font-medium">{m.descripcion}</p>
                    {m.comprobante && <p className="text-xs text-muted-foreground">{m.comprobante}</p>}
                  </td>
                  <td className="p-3"><Badge variant="outline" className="text-xs">{getCategoriaLabel(m.categoria)}</Badge></td>
                  <td className="p-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: cuenta?.color }} />
                      <span className="text-xs">{cuenta?.nombre.split('—')[0].trim()}</span>
                    </span>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{m.obraNombre || '—'}</td>
                  <td className={`p-3 text-right font-semibold ${m.tipo === 'ingreso' ? 'text-emerald-600' : m.tipo === 'egreso' ? 'text-red-600' : 'text-blue-600'}`}>
                    {m.tipo === 'ingreso' ? '+' : m.tipo === 'egreso' ? '−' : '⇄'} {m.moneda} {m.monto.toLocaleString('es-AR')}
                  </td>
                  <td className="p-3 text-center">
                    <button onClick={e => { e.stopPropagation(); onToggleConciliado(m.id); }}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-colors ${m.conciliado ? 'bg-emerald-500 border-emerald-500' : 'border-muted-foreground hover:border-emerald-400'}`}>
                      {m.conciliado && <Check className="h-3 w-3 text-white" />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detalle Sheet */}
      <Sheet open={!!detalle} onOpenChange={() => setDetalle(null)}>
        <SheetContent className="overflow-y-auto">
          {detalle && (
            <>
              <SheetHeader>
                <SheetTitle>{detalle.descripcion}</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-muted-foreground">Fecha</p><p>{new Date(detalle.fecha).toLocaleDateString('es-AR')}</p></div>
                  <div><p className="text-xs text-muted-foreground">Tipo</p><Badge>{detalle.tipo}</Badge></div>
                  <div><p className="text-xs text-muted-foreground">Categoría</p><p>{getCategoriaLabel(detalle.categoria)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Monto</p><p className="font-bold">{detalle.moneda} {detalle.monto.toLocaleString('es-AR')}</p></div>
                  <div><p className="text-xs text-muted-foreground">Cuenta</p><p>{cuentas.find(c => c.id === detalle.cuentaId)?.nombre}</p></div>
                  {detalle.cuentaDestinoId && <div><p className="text-xs text-muted-foreground">Cuenta destino</p><p>{cuentas.find(c => c.id === detalle.cuentaDestinoId)?.nombre}</p></div>}
                  {detalle.obraNombre && <div><p className="text-xs text-muted-foreground">Obra</p><p>{detalle.obraNombre}</p></div>}
                  {detalle.comprobante && <div><p className="text-xs text-muted-foreground">Comprobante</p><p>{detalle.comprobante}</p></div>}
                </div>
                {detalle.notas && <div><p className="text-xs text-muted-foreground mb-1">Notas</p><p className="text-sm">{detalle.notas}</p></div>}
                <div className="flex items-center gap-2">
                  <Badge className={detalle.conciliado ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>{detalle.conciliado ? 'Conciliado' : 'Sin conciliar'}</Badge>
                  <Button size="sm" variant="outline" onClick={() => { onToggleConciliado(detalle.id); setDetalle({ ...detalle, conciliado: !detalle.conciliado }); }}>
                    {detalle.conciliado ? 'Marcar sin conciliar' : 'Marcar conciliado'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialog nuevo movimiento */}
      <Dialog open={showNuevo} onOpenChange={setShowNuevo}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo {tipoNuevo}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-1">
              {(['ingreso', 'egreso', 'transferencia'] as TipoMovimientoT[]).map(t => (
                <button key={t} className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${tipoNuevo === t ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`} onClick={() => setTipoNuevo(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">Fecha *</label><Input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} /></div>
              <div>
                <label className="text-xs text-muted-foreground">Cuenta *</label>
                <Select value={form.cuentaId} onValueChange={v => setForm({ ...form, cuentaId: v })}>
                  <SelectTrigger><SelectValue placeholder="Elegir" /></SelectTrigger>
                  <SelectContent>{cuentas.filter(c => c.activa).map(c => <SelectItem key={c.id} value={c.id}>{c.nombre.split('—')[0].trim()}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {tipoNuevo === 'transferencia' && (
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground">Cuenta destino *</label>
                  <Select value={form.cuentaDestinoId} onValueChange={v => setForm({ ...form, cuentaDestinoId: v })}>
                    <SelectTrigger><SelectValue placeholder="Elegir" /></SelectTrigger>
                    <SelectContent>{cuentas.filter(c => c.activa).map(c => <SelectItem key={c.id} value={c.id}>{c.nombre.split('—')[0].trim()}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              <div className="col-span-2"><label className="text-xs text-muted-foreground">Descripción *</label><Input value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} /></div>
              {tipoNuevo !== 'transferencia' && (
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground">Categoría</label>
                  <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v as CategoriaMovimiento })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['obra_directa','personal','alquiler','servicios','honorarios','impuestos','seguros','marketing','compras','administracion','otro'].map(c => (
                        <SelectItem key={c} value={c}>{getCategoriaLabel(c as CategoriaMovimiento)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div><label className="text-xs text-muted-foreground">Monto *</label><Input type="number" value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} /></div>
              <div>
                <label className="text-xs text-muted-foreground">Moneda</label>
                <Select value={form.moneda} onValueChange={v => setForm({ ...form, moneda: v as 'ARS' | 'USD' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="ARS">ARS</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent>
                </Select>
              </div>
              <div><label className="text-xs text-muted-foreground">Comprobante</label><Input value={form.comprobante} onChange={e => setForm({ ...form, comprobante: e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">Obra</label><Input placeholder="Nombre de obra" value={form.obraNombre} onChange={e => setForm({ ...form, obraNombre: e.target.value })} /></div>
              <div className="col-span-2"><label className="text-xs text-muted-foreground">Notas</label><Textarea rows={2} value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} /></div>
            </div>
            <Button onClick={guardar} className="w-full">Registrar {tipoNuevo}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

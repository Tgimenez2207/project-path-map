import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { getEstadoChequeLabel, getEstadoChequeClass, generarDiasCalendario } from './helpers';
import type { Cheque, TipoCheque, Cuenta } from '@/types/tesoreria';

interface Props {
  cheques: Cheque[];
  cuentas: Cuenta[];
  onDepositar: (id: string) => void;
  onEndosar: (id: string, endosadoA: string) => void;
  onAddCheque: (c: Omit<Cheque, 'id'>) => void;
}

export function TesoreriaCheques({ cheques, cuentas, onDepositar, onEndosar, onAddCheque }: Props) {
  const [filtroCheques, setFiltroCheques] = useState<'todos' | 'en_cartera' | 'por_vencer' | 'depositados' | 'rechazados'>('todos');
  const [vistaCalendario, setVistaCalendario] = useState(true);
  const [mesCalendario, setMesCalendario] = useState(new Date());
  const [showNuevo, setShowNuevo] = useState(false);
  const [tipoChequeNuevo, setTipoChequeNuevo] = useState<TipoCheque>('propio');
  const [showEndosar, setShowEndosar] = useState<string | null>(null);
  const [endosarA, setEndosarA] = useState('');

  const chequesFiltrados = useMemo(() => {
    return cheques.filter(c => {
      if (filtroCheques === 'todos') return true;
      if (filtroCheques === 'en_cartera') return c.estado === 'en_cartera';
      if (filtroCheques === 'depositados') return c.estado === 'depositado';
      if (filtroCheques === 'rechazados') return c.estado === 'rechazado';
      if (filtroCheques === 'por_vencer') {
        const dias = Math.ceil((new Date(c.fechaVencimiento).getTime() - Date.now()) / 86400000);
        return dias >= 0 && dias <= 15 && c.estado === 'en_cartera';
      }
      return true;
    });
  }, [cheques, filtroCheques]);

  const [form, setForm] = useState({ numero: '', banco: '', titular: '', recibiDe: '', monto: '', moneda: 'ARS' as 'ARS' | 'USD', fechaEmision: new Date().toISOString().split('T')[0], fechaVencimiento: '', cuentaId: '', obraNombre: '', notas: '' });

  const resetForm = () => setForm({ numero: '', banco: '', titular: '', recibiDe: '', monto: '', moneda: 'ARS', fechaEmision: new Date().toISOString().split('T')[0], fechaVencimiento: '', cuentaId: '', obraNombre: '', notas: '' });

  const guardar = () => {
    if (!form.numero || !form.banco || !form.monto || !form.fechaVencimiento) return;
    onAddCheque({
      tipo: tipoChequeNuevo, numero: form.numero, banco: form.banco, titular: form.titular,
      monto: parseFloat(form.monto), moneda: form.moneda, fechaEmision: form.fechaEmision,
      fechaVencimiento: form.fechaVencimiento, estado: 'en_cartera',
      cuentaId: tipoChequeNuevo === 'propio' ? form.cuentaId : undefined,
      recibiDe: tipoChequeNuevo === 'terceros' ? form.recibiDe : undefined,
      obraNombre: form.obraNombre || undefined, notas: form.notas || undefined,
    });
    setShowNuevo(false);
    resetForm();
  };

  const handleEndosar = () => {
    if (!showEndosar || !endosarA.trim()) return;
    onEndosar(showEndosar, endosarA.trim());
    setShowEndosar(null);
    setEndosarA('');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button variant={vistaCalendario ? 'default' : 'outline'} size="sm" onClick={() => setVistaCalendario(true)} className="hidden md:inline-flex">📅 Calendario</Button>
        <Button variant={!vistaCalendario ? 'default' : 'outline'} size="sm" onClick={() => setVistaCalendario(false)} className="hidden md:inline-flex">≡ Lista</Button>
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => { setShowNuevo(true); resetForm(); }}><Plus className="h-4 w-4 mr-1" /> Nuevo cheque</Button>
      </div>

      {/* Calendario - hidden on mobile */}
      {vistaCalendario && (
        <div className="mb-4 hidden md:block">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setMesCalendario(p => { const d = new Date(p); d.setMonth(d.getMonth() - 1); return d; })}><ChevronLeft className="h-5 w-5" /></button>
            <p className="font-medium capitalize">{mesCalendario.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</p>
            <button onClick={() => setMesCalendario(p => { const d = new Date(p); d.setMonth(d.getMonth() + 1); return d; })}><ChevronRight className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(d => <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>)}
            {generarDiasCalendario(mesCalendario).map((dia, i) => {
              const chequesDelDia = dia ? cheques.filter(c => new Date(c.fechaVencimiento).toDateString() === dia.toDateString()) : [];
              const esHoy = dia && dia.toDateString() === new Date().toDateString();
              return (
                <div key={i} className={`min-h-[60px] rounded-lg p-1.5 text-xs border ${!dia ? 'border-transparent' : chequesDelDia.length > 0 ? 'bg-background border-border' : 'bg-muted/20 border-transparent'}`}>
                  {dia && (
                    <>
                      <span className={`font-medium block mb-1 ${esHoy ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{dia.getDate()}</span>
                      {chequesDelDia.map(c => (
                        <div key={c.id} className={`px-1 py-0.5 rounded text-xs mb-0.5 truncate ${c.tipo === 'propio' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`} title={`${c.tipo === 'propio' ? '↑' : '↓'} ${c.monto.toLocaleString()}`}>
                          {c.tipo === 'propio' ? '↑' : '↓'} {(c.monto / 1000).toFixed(0)}K
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100" /> Propios (salida)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-100" /> De terceros (entrada)</span>
          </div>
        </div>
      )}

      {/* Filtros por estado */}
      <div className="flex gap-1 flex-wrap">
        {[{ key: 'todos', label: 'Todos' }, { key: 'en_cartera', label: 'En cartera' }, { key: 'por_vencer', label: 'Por vencer (15d)' }, { key: 'depositados', label: 'Depositados' }, { key: 'rechazados', label: 'Rechazados' }].map(f => (
          <button key={f.key} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filtroCheques === f.key ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-muted'}`} onClick={() => setFiltroCheques(f.key as any)}>{f.label}</button>
        ))}
      </div>

      {/* Tabla */}
      <div className="border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-muted/30 border-b">
            <th className="text-left p-3 text-xs text-muted-foreground font-medium">Tipo</th>
            <th className="text-left p-3 text-xs text-muted-foreground font-medium">Nro.</th>
            <th className="text-left p-3 text-xs text-muted-foreground font-medium">Banco</th>
            <th className="text-left p-3 text-xs text-muted-foreground font-medium">Titular / De</th>
            <th className="text-right p-3 text-xs text-muted-foreground font-medium">Monto</th>
            <th className="text-left p-3 text-xs text-muted-foreground font-medium">Vencimiento</th>
            <th className="text-left p-3 text-xs text-muted-foreground font-medium">Estado</th>
            <th className="p-3"></th>
          </tr></thead>
          <tbody>
            {chequesFiltrados.map(c => {
              const dias = Math.ceil((new Date(c.fechaVencimiento).getTime() - Date.now()) / 86400000);
              const proxAVencer = dias >= 0 && dias <= 15 && c.estado === 'en_cartera';
              return (
                <tr key={c.id} className={`border-b last:border-0 transition-colors ${proxAVencer ? 'bg-amber-50/50' : 'hover:bg-muted/10'}`}>
                  <td className="p-3"><Badge className={c.tipo === 'propio' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}>{c.tipo === 'propio' ? '↑ Propio' : '↓ Tercero'}</Badge></td>
                  <td className="p-3 font-mono text-xs">{c.numero}</td>
                  <td className="p-3 text-muted-foreground">{c.banco}</td>
                  <td className="p-3">{c.tipo === 'propio' ? c.titular : c.recibiDe || '—'}</td>
                  <td className="p-3 text-right font-semibold">{c.moneda} {c.monto.toLocaleString('es-AR')}</td>
                  <td className={`p-3 ${proxAVencer ? 'text-amber-700 font-medium' : 'text-muted-foreground'}`}>
                    {new Date(c.fechaVencimiento).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: '2-digit' })}
                    {proxAVencer && <span className="text-xs block">{dias}d restantes</span>}
                  </td>
                  <td className="p-3"><Badge className={getEstadoChequeClass(c.estado)}>{getEstadoChequeLabel(c.estado)}</Badge></td>
                  <td className="p-3">
                    {c.estado === 'en_cartera' && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => onDepositar(c.id)}>Depositar</Button>
                        {c.tipo === 'terceros' && <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setShowEndosar(c.id); setEndosarA(''); }}>Endosar</Button>}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Dialog endosar */}
      <Dialog open={!!showEndosar} onOpenChange={() => setShowEndosar(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Endosar cheque</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-xs text-muted-foreground">¿A quién se endosa?</label><Input value={endosarA} onChange={e => setEndosarA(e.target.value)} placeholder="Nombre o razón social" /></div>
            <Button className="w-full" onClick={handleEndosar} disabled={!endosarA.trim()}>Confirmar endoso</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog nuevo cheque */}
      <Dialog open={showNuevo} onOpenChange={setShowNuevo}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nuevo cheque</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(['propio', 'terceros'] as TipoCheque[]).map(t => (
                <button key={t} className={`py-3 rounded-xl border-2 text-sm font-medium transition-colors ${tipoChequeNuevo === t ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`} onClick={() => setTipoChequeNuevo(t)}>
                  {t === 'propio' ? '↑ Propio (emito)' : '↓ De tercero (recibo)'}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">Número *</label><Input value={form.numero} onChange={e => setForm({ ...form, numero: e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">Banco *</label><Input value={form.banco} onChange={e => setForm({ ...form, banco: e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">{tipoChequeNuevo === 'propio' ? 'A la orden de' : 'Librado por'}</label><Input value={form.titular} onChange={e => setForm({ ...form, titular: e.target.value })} /></div>
              {tipoChequeNuevo === 'terceros' && <div><label className="text-xs text-muted-foreground">Recibido de</label><Input value={form.recibiDe} onChange={e => setForm({ ...form, recibiDe: e.target.value })} /></div>}
              {tipoChequeNuevo === 'propio' && (
                <div><label className="text-xs text-muted-foreground">Cuenta bancaria</label>
                  <Select value={form.cuentaId} onValueChange={v => setForm({ ...form, cuentaId: v })}>
                    <SelectTrigger><SelectValue placeholder="Elegir" /></SelectTrigger>
                    <SelectContent>{cuentas.filter(c => c.tipo === 'banco').map(c => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              <div><label className="text-xs text-muted-foreground">Monto *</label><Input type="number" value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">Moneda</label>
                <Select value={form.moneda} onValueChange={v => setForm({ ...form, moneda: v as 'ARS' | 'USD' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="ARS">ARS</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent>
                </Select>
              </div>
              <div><label className="text-xs text-muted-foreground">Fecha emisión</label><Input type="date" value={form.fechaEmision} onChange={e => setForm({ ...form, fechaEmision: e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">Fecha vencimiento *</label><Input type="date" value={form.fechaVencimiento} onChange={e => setForm({ ...form, fechaVencimiento: e.target.value })} /></div>
              <div className="col-span-2"><label className="text-xs text-muted-foreground">Notas</label><Textarea rows={2} value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} /></div>
            </div>
            <Button onClick={guardar} className="w-full">Registrar cheque</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { getCategoriaLabel } from './helpers';
import type { CostoFijo, CategoriaMovimiento, Cuenta } from '@/types/tesoreria';

interface Props {
  costosFijos: CostoFijo[];
  cuentas: Cuenta[];
  onAdd: (c: Omit<CostoFijo, 'id'>) => void;
  onToggleActivo: (id: string) => void;
  onDelete: (id: string) => void;
  onPagar: (costo: CostoFijo, cuentaId: string) => void;
}

export function TesoreriaCostos({ costosFijos, cuentas, onAdd, onToggleActivo, onDelete, onPagar }: Props) {
  const [showNuevo, setShowNuevo] = useState(false);
  const [showPagar, setShowPagar] = useState<CostoFijo | null>(null);
  const [cuentaPago, setCuentaPago] = useState('c1');
  const [form, setForm] = useState({ descripcion: '', categoria: 'otro' as CategoriaMovimiento, monto: '', moneda: 'ARS' as 'ARS' | 'USD', esRecurrente: true, frecuencia: 'mensual' as 'mensual' | 'trimestral' | 'anual', proximoVencimiento: '', notas: '' });

  const guardar = () => {
    if (!form.descripcion || !form.monto) return;
    onAdd({ descripcion: form.descripcion, categoria: form.categoria, monto: parseFloat(form.monto), moneda: form.moneda, esRecurrente: form.esRecurrente, frecuencia: form.esRecurrente ? form.frecuencia : undefined, proximoVencimiento: form.proximoVencimiento || undefined, activo: true, notas: form.notas || undefined });
    setShowNuevo(false);
    setForm({ descripcion: '', categoria: 'otro', monto: '', moneda: 'ARS', esRecurrente: true, frecuencia: 'mensual', proximoVencimiento: '', notas: '' });
  };

  const totalARS = costosFijos.filter(c => c.activo && c.moneda === 'ARS').reduce((a, c) => a + c.monto, 0);
  const totalUSD = costosFijos.filter(c => c.activo && c.moneda === 'USD').reduce((a, c) => a + c.monto, 0);
  const proximo = costosFijos.filter(c => c.activo && c.proximoVencimiento).sort((a, b) => new Date(a.proximoVencimiento!).getTime() - new Date(b.proximoVencimiento!).getTime())[0];

  return (
    <div className="space-y-4">
      {/* Resumen mensual */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-muted/40 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Total fijos ARS/mes</p>
          <p className="text-xl font-semibold">ARS {totalARS.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-muted/40 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Total fijos USD/mes</p>
          <p className="text-xl font-semibold">USD {totalUSD.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-muted/40 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Próximo vencimiento</p>
          <p className="text-xl font-semibold">{proximo ? new Date(proximo.proximoVencimiento!).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) : '—'}</p>
        </div>
      </div>

      {/* Lista de costos fijos */}
      <div className="space-y-2">
        {costosFijos.map(costo => (
          <div key={costo.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${!costo.activo ? 'opacity-50' : ''}`}>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{costo.descripcion}</p>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                <Badge variant="outline" className="text-xs">{getCategoriaLabel(costo.categoria)}</Badge>
                <span className="text-xs text-muted-foreground">{costo.esRecurrente ? `Recurrente ${costo.frecuencia}` : 'Único'}</span>
                {costo.proximoVencimiento && (
                  <span className="text-xs text-muted-foreground">Próx: {new Date(costo.proximoVencimiento).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</span>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-sm">{costo.moneda} {costo.monto.toLocaleString('es-AR')}</p>
              <p className="text-xs text-muted-foreground">/ mes</p>
            </div>
            <Switch checked={costo.activo} onCheckedChange={() => onToggleActivo(costo.id)} />
            <Button size="sm" variant="outline" onClick={() => { setShowPagar(costo); setCuentaPago('c1'); }}>Pagar</Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onDelete(costo.id)}>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full" onClick={() => setShowNuevo(true)}>
        <Plus className="h-4 w-4 mr-2" /> Agregar costo fijo
      </Button>

      {/* Dialog pagar costo fijo */}
      <Dialog open={!!showPagar} onOpenChange={() => setShowPagar(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Registrar pago</DialogTitle></DialogHeader>
          {showPagar && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">{showPagar.descripcion}</p>
                <p className="text-lg font-bold mt-1">{showPagar.moneda} {showPagar.monto.toLocaleString('es-AR')}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Debitar de cuenta</label>
                <Select value={cuentaPago} onValueChange={setCuentaPago}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {cuentas.filter(c => c.activa).map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={() => { onPagar(showPagar, cuentaPago); setShowPagar(null); }}>
                Confirmar pago
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog nuevo costo fijo */}
      <Dialog open={showNuevo} onOpenChange={setShowNuevo}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nuevo costo fijo</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs text-muted-foreground">Descripción *</label><Input value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">Categoría</label>
                <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v as CategoriaMovimiento })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['personal','alquiler','servicios','honorarios','impuestos','seguros','administracion','otro'].map(c => <SelectItem key={c} value={c}>{getCategoriaLabel(c as CategoriaMovimiento)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-xs text-muted-foreground">Monto *</label><Input type="number" value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">Moneda</label>
                <Select value={form.moneda} onValueChange={v => setForm({ ...form, moneda: v as 'ARS' | 'USD' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="ARS">ARS</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent>
                </Select>
              </div>
              <div><label className="text-xs text-muted-foreground">Frecuencia</label>
                <Select value={form.frecuencia} onValueChange={v => setForm({ ...form, frecuencia: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="mensual">Mensual</SelectItem><SelectItem value="trimestral">Trimestral</SelectItem><SelectItem value="anual">Anual</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><label className="text-xs text-muted-foreground">Próximo vencimiento</label><Input type="date" value={form.proximoVencimiento} onChange={e => setForm({ ...form, proximoVencimiento: e.target.value })} /></div>
              <div className="col-span-2"><label className="text-xs text-muted-foreground">Notas</label><Textarea rows={2} value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} /></div>
            </div>
            <Button onClick={guardar} className="w-full">Guardar costo fijo</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import { getCategoriaLabel } from './helpers';
import type { CostoFijo, CategoriaMovimiento } from '@/types/tesoreria';

interface Props {
  costosFijos: CostoFijo[];
  onAdd: (c: Omit<CostoFijo, 'id'>) => void;
  onToggleActivo: (id: string) => void;
}

export function TesoreriaCostos({ costosFijos, onAdd, onToggleActivo }: Props) {
  const [showNuevo, setShowNuevo] = useState(false);
  const [form, setForm] = useState({ descripcion: '', categoria: 'otro' as CategoriaMovimiento, monto: '', moneda: 'ARS' as 'ARS' | 'USD', esRecurrente: true, frecuencia: 'mensual' as 'mensual' | 'trimestral' | 'anual', proximoVencimiento: '', notas: '' });

  const guardar = () => {
    if (!form.descripcion || !form.monto) return;
    onAdd({ descripcion: form.descripcion, categoria: form.categoria, monto: parseFloat(form.monto), moneda: form.moneda, esRecurrente: form.esRecurrente, frecuencia: form.esRecurrente ? form.frecuencia : undefined, proximoVencimiento: form.proximoVencimiento || undefined, activo: true, notas: form.notas || undefined });
    setShowNuevo(false);
  };

  const totalARS = costosFijos.filter(c => c.activo && c.moneda === 'ARS').reduce((a, c) => a + c.monto, 0);
  const totalUSD = costosFijos.filter(c => c.activo && c.moneda === 'USD').reduce((a, c) => a + c.monto, 0);
  const proximo = costosFijos.filter(c => c.activo && c.proximoVencimiento).sort((a, b) => new Date(a.proximoVencimiento!).getTime() - new Date(b.proximoVencimiento!).getTime())[0];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="font-semibold">Costos fijos recurrentes</p>
        <Button size="sm" variant="outline" onClick={() => setShowNuevo(true)}><Plus className="h-4 w-4 mr-1" /> Nuevo costo fijo</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground mb-1">Total fijos ARS/mes</p><p className="text-xl font-bold">ARS {totalARS.toLocaleString('es-AR')}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground mb-1">Total fijos USD/mes</p><p className="text-xl font-bold">USD {totalUSD.toLocaleString('es-AR')}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground mb-1">Próximo vencimiento</p><p className="text-xl font-bold">{proximo ? new Date(proximo.proximoVencimiento!).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) : '—'}</p></CardContent></Card>
      </div>

      <div className="space-y-2">
        {costosFijos.map(c => (
          <div key={c.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${!c.activo ? 'opacity-50' : ''}`}>
            <div className="flex-1">
              <p className="font-medium text-sm">{c.descripcion}</p>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="outline" className="text-xs">{getCategoriaLabel(c.categoria)}</Badge>
                {c.frecuencia && <span className="text-xs text-muted-foreground capitalize">{c.frecuencia}</span>}
                {c.proximoVencimiento && <span className="text-xs text-muted-foreground">Vence: {new Date(c.proximoVencimiento).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</span>}
              </div>
            </div>
            <p className="font-semibold text-sm">{c.moneda} {c.monto.toLocaleString('es-AR')}</p>
            <Switch checked={c.activo} onCheckedChange={() => onToggleActivo(c.id)} />
          </div>
        ))}
      </div>

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

import { useMemo, useState } from 'react';
import { Search, MessageCircle, FileText, Wrench, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useGremios } from '@/contexts/GremiosContext';

const fmt = (n: number) => `$${n.toLocaleString('es-AR')}`;
const isDesktop = () => typeof window !== 'undefined' && window.innerWidth >= 1280;

export default function GremiosClientes() {
  const { clientesAgrupados } = useGremios();
  const [busqueda, setBusqueda] = useState('');
  const [seleccion, setSeleccion] = useState<string | null>(null);

  const lista = useMemo(() => {
    if (!busqueda.trim()) return clientesAgrupados;
    const q = busqueda.toLowerCase();
    return clientesAgrupados.filter((c) => c.cliente.toLowerCase().includes(q));
  }, [busqueda, clientesAgrupados]);

  const detalle = useMemo(
    () => clientesAgrupados.find((c) => c.cliente === seleccion) ?? null,
    [seleccion, clientesAgrupados],
  );

  const resumenTotal = useMemo(
    () => ({
      cobrado: clientesAgrupados.reduce((a, c) => a + c.totalCobrado, 0),
      pendiente: clientesAgrupados.reduce((a, c) => a + c.totalPendiente, 0),
    }),
    [clientesAgrupados],
  );

  const DetalleBody = detalle && (
    <div className="space-y-5 mt-4">
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Total cobrado</p>
          <p className="text-lg font-bold text-emerald-600 mt-1">{fmt(detalle.totalCobrado)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Por cobrar</p>
          <p className="text-lg font-bold text-amber-600 mt-1">{fmt(detalle.totalPendiente)}</p>
        </Card>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <Wrench className="h-4 w-4" /> Trabajos ({detalle.trabajos.length})
        </h3>
        <div className="space-y-2">
          {detalle.trabajos.length === 0 && <p className="text-xs text-muted-foreground">Sin trabajos</p>}
          {detalle.trabajos.map((t) => (
            <div key={t.id} className="border rounded-lg p-3 flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{t.descripcion}</p>
                <p className="text-xs text-muted-foreground">{new Date(t.fecha).toLocaleDateString('es-AR')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{fmt(t.monto)}</p>
                <Badge variant="outline" className="text-[10px] mt-1 capitalize">{t.estadoCobro}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4" /> Presupuestos ({detalle.presupuestos.length})
        </h3>
        <div className="space-y-2">
          {detalle.presupuestos.length === 0 && <p className="text-xs text-muted-foreground">Sin presupuestos</p>}
          {detalle.presupuestos.map((p) => (
            <div key={p.id} className="border rounded-lg p-3 flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium line-clamp-1">{p.descripcionTrabajo}</p>
                <p className="text-xs text-muted-foreground">{new Date(p.fechaEmision).toLocaleDateString('es-AR')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{fmt(p.montoTotal)}</p>
                <Badge variant="outline" className="text-[10px] mt-1 capitalize">{p.estado}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 xl:p-0 space-y-4 xl:space-y-6">
      <div>
        <h1 className="text-xl xl:text-2xl font-bold">Mis clientes</h1>
        <p className="hidden xl:block text-sm text-muted-foreground mt-1">
          Historial agrupado por cliente con totales facturados y pendientes
        </p>
      </div>

      <div className="hidden xl:grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Clientes activos</p>
          <p className="text-xl font-bold mt-1">{clientesAgrupados.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total facturado</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{fmt(resumenTotal.cobrado)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total pendiente</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{fmt(resumenTotal.pendiente)}</p>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cliente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {lista.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8 col-span-full">No se encontraron clientes.</p>
        )}
        {lista.map((c) => (
          <Card
            key={c.cliente}
            className="p-4 cursor-pointer hover:shadow-md transition-all"
            onClick={() => setSeleccion(c.cliente)}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                {c.cliente.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{c.cliente}</p>
                <p className="text-xs text-muted-foreground">
                  {c.trabajos.length} trabajos · {c.presupuestos.length} presupuestos
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t">
              <div>
                <p className="text-[10px] text-muted-foreground">Cobrado</p>
                <p className="text-sm font-bold text-emerald-600">{fmt(c.totalCobrado)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Pendiente</p>
                <p className="text-sm font-bold text-amber-600">{fmt(c.totalPendiente)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Sheet open={!!seleccion && !isDesktop()} onOpenChange={(o) => { if (!o) setSeleccion(null); }}>
        <SheetContent side="bottom" className="h-[92vh] overflow-y-auto rounded-t-2xl xl:hidden">
          <SheetHeader>
            <SheetTitle>{detalle?.cliente}</SheetTitle>
            <SheetDescription>Historial completo del cliente</SheetDescription>
          </SheetHeader>
          {DetalleBody}
        </SheetContent>
      </Sheet>

      <Dialog open={!!seleccion && isDesktop()} onOpenChange={(o) => { if (!o) setSeleccion(null); }}>
        <DialogContent className="hidden xl:block max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detalle?.cliente}</DialogTitle>
            <DialogDescription>Historial completo del cliente</DialogDescription>
          </DialogHeader>
          {DetalleBody}
        </DialogContent>
      </Dialog>
    </div>
  );
}

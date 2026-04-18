import { useState, useMemo } from 'react';
import { Sparkles, Copy, Check, Plus, FileDown, Copy as CopyIcon, Pencil, Trash2, ArrowRightCircle, Search, MoreHorizontal, Send, ThumbsUp, ThumbsDown } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useGremios } from '@/contexts/GremiosContext';
import { mockPerfilGremio } from '@/data/mockGremios';
import { getRubroLabel, type PresupuestoGremio, type ItemPresupuesto } from '@/types/gremios';
import { supabase } from '@/integrations/supabase/client';
import { generarPresupuestoPDF } from '@/lib/gremiosPdf';

const ESTADO_COLOR: Record<PresupuestoGremio['estado'], string> = {
  borrador: 'bg-muted text-muted-foreground',
  enviado: 'bg-blue-100 text-blue-700',
  aceptado: 'bg-emerald-100 text-emerald-700',
  rechazado: 'bg-red-100 text-red-700',
};

const isDesktop = () => typeof window !== 'undefined' && window.innerWidth >= 1280;

const initialForm = {
  cliente: '',
  telefono: '',
  email: '',
  descripcionTrabajo: '',
  montoTotal: 0,
  incluyeMateriales: true as boolean | 'por_separado',
  condicionesPago: '50% adelanto, 50% al finalizar',
  validezDias: 15,
  iva: false,
  items: [] as ItemPresupuesto[],
};

export default function GremiosPresupuesto() {
  const {
    presupuestos, agregarPresupuesto, actualizarPresupuesto, eliminarPresupuesto,
    duplicarPresupuesto, convertirEnTrabajo,
  } = useGremios();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isGenerando, setIsGenerando] = useState(false);
  const [presupuestoGenerado, setPresupuestoGenerado] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | PresupuestoGremio['estado']>('todos');
  const [form, setForm] = useState(initialForm);

  const subtotalItems = useMemo(
    () => form.items.reduce((a, it) => a + it.cantidad * it.precioUnitario, 0),
    [form.items],
  );
  const totalCalculado = useMemo(() => {
    const base = form.items.length > 0 ? subtotalItems : form.montoTotal;
    return form.iva ? base * 1.21 : base;
  }, [form.items, form.iva, form.montoTotal, subtotalItems]);

  const presupuestosFiltrados = useMemo(() => {
    let res = presupuestos;
    if (filtroEstado !== 'todos') res = res.filter((p) => p.estado === filtroEstado);
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      res = res.filter(
        (p) => p.cliente.toLowerCase().includes(q) || p.descripcionTrabajo.toLowerCase().includes(q),
      );
    }
    return [...res].sort((a, b) => b.fechaEmision.localeCompare(a.fechaEmision));
  }, [presupuestos, busqueda, filtroEstado]);

  const resetForm = () => {
    setForm(initialForm);
    setPresupuestoGenerado(null);
    setEditId(null);
  };

  const cerrarForm = () => {
    setShowForm(false);
    resetForm();
  };

  const abrirEditar = (p: PresupuestoGremio) => {
    setEditId(p.id);
    setForm({
      cliente: p.cliente,
      telefono: p.telefono ?? '',
      email: p.email ?? '',
      descripcionTrabajo: p.descripcionTrabajo,
      montoTotal: p.montoTotal,
      incluyeMateriales: p.incluyeMateriales,
      condicionesPago: p.condicionesPago,
      validezDias: p.validezDias,
      iva: p.iva ?? false,
      items: p.items ?? [],
    });
    setPresupuestoGenerado(p.textoGenerado ?? null);
    setShowForm(true);
  };

  const addItem = () => {
    setForm((p) => ({
      ...p,
      items: [
        ...p.items,
        { id: crypto.randomUUID(), descripcion: '', cantidad: 1, unidad: 'u', precioUnitario: 0 },
      ],
    }));
  };

  const updateItem = (id: string, patch: Partial<ItemPresupuesto>) => {
    setForm((p) => ({ ...p, items: p.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) }));
  };

  const removeItem = (id: string) => {
    setForm((p) => ({ ...p, items: p.items.filter((it) => it.id !== id) }));
  };

  const handleGenerar = async () => {
    if (!form.cliente || !form.descripcionTrabajo || (totalCalculado <= 0 && form.items.length === 0)) {
      toast.error('Completá cliente, trabajo y monto (o ítems)');
      return;
    }
    setIsGenerando(true);
    try {
      const { data, error } = await supabase.functions.invoke('gremios-ai', {
        body: {
          mode: 'presupuesto',
          perfil: {
            nombre: mockPerfilGremio.nombre,
            rubroLabel: getRubroLabel(mockPerfilGremio.rubro),
            matricula: mockPerfilGremio.matricula,
            telefono: mockPerfilGremio.telefono,
            email: mockPerfilGremio.email,
          },
          form: { ...form, montoTotal: totalCalculado },
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setPresupuestoGenerado(data?.text || '');
    } catch (e: any) {
      toast.error(e?.message || 'Error al generar el presupuesto');
    } finally {
      setIsGenerando(false);
    }
  };

  const handleCopiar = async () => {
    if (!presupuestoGenerado) return;
    await navigator.clipboard.writeText(presupuestoGenerado);
    setCopied(true);
    toast.success('Copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const texto = encodeURIComponent(presupuestoGenerado || '');
    const numero = form.telefono?.replace(/\D/g, '');
    const url = numero ? `https://wa.me/54${numero}?text=${texto}` : `https://wa.me/?text=${texto}`;
    window.open(url, '_blank');
  };

  const handleGuardar = () => {
    const datos: Omit<PresupuestoGremio, 'id' | 'fechaEmision' | 'estado'> = {
      cliente: form.cliente,
      email: form.email || undefined,
      telefono: form.telefono || undefined,
      descripcionTrabajo: form.descripcionTrabajo,
      montoTotal: totalCalculado,
      incluyeMateriales: form.incluyeMateriales,
      condicionesPago: form.condicionesPago,
      validezDias: form.validezDias,
      textoGenerado: presupuestoGenerado ?? undefined,
      items: form.items.length > 0 ? form.items : undefined,
      iva: form.iva,
    };
    if (editId) {
      actualizarPresupuesto(editId, datos);
      toast.success('Presupuesto actualizado');
    } else {
      agregarPresupuesto({
        id: crypto.randomUUID(),
        fechaEmision: new Date().toISOString().slice(0, 10),
        estado: 'borrador',
        ...datos,
      });
      toast.success('Presupuesto guardado');
    }
    cerrarForm();
  };

  const handlePDF = (p: PresupuestoGremio) => {
    try {
      generarPresupuestoPDF(p, mockPerfilGremio);
      toast.success('PDF descargado');
    } catch (e: any) {
      toast.error('Error generando PDF');
    }
  };

  const handleConvertir = (id: string) => {
    const nid = convertirEnTrabajo(id);
    if (nid) toast.success('Trabajo creado desde el presupuesto');
  };

  const cambiarEstado = (id: string, estado: PresupuestoGremio['estado']) => {
    actualizarPresupuesto(id, { estado });
    toast.success('Estado actualizado');
  };

  const eliminar = (id: string) => {
    if (!confirm('¿Eliminar presupuesto?')) return;
    eliminarPresupuesto(id);
    toast.success('Presupuesto eliminado');
  };

  const fmt = (n: number) => `$${n.toLocaleString('es-AR')}`;

  const FormBody = (
    <div className="space-y-4 mt-4">
      <div>
        <label className="text-sm text-muted-foreground">¿Qué trabajo vas a hacer?</label>
        <Textarea
          value={form.descripcionTrabajo}
          onChange={(e) => setForm((p) => ({ ...p, descripcionTrabajo: e.target.value }))}
          rows={3}
          placeholder="Ej: instalación eléctrica completa..."
        />
      </div>
      <div className="grid xl:grid-cols-3 gap-3">
        <div>
          <label className="text-sm text-muted-foreground">Cliente</label>
          <Input value={form.cliente} onChange={(e) => setForm((p) => ({ ...p, cliente: e.target.value }))} placeholder="Nombre o empresa" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Teléfono</label>
          <Input type="tel" value={form.telefono} onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))} placeholder="11..." />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Email</label>
          <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="cliente@mail.com" />
        </div>
      </div>

      {/* Items detallados */}
      <div className="border rounded-xl p-3 bg-muted/20 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Detalle por ítem (opcional)</p>
            <p className="text-xs text-muted-foreground">Si lo dejás vacío, se usa el monto total que ingreses abajo</p>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={addItem}>
            <Plus className="h-3 w-3 mr-1" /> Ítem
          </Button>
        </div>
        {form.items.length > 0 && (
          <div className="space-y-2">
            {form.items.map((it) => (
              <div key={it.id} className="grid grid-cols-12 gap-2 items-center">
                <Input
                  className="col-span-5"
                  placeholder="Descripción"
                  value={it.descripcion}
                  onChange={(e) => updateItem(it.id, { descripcion: e.target.value })}
                />
                <Input
                  className="col-span-2"
                  type="number"
                  placeholder="Cant"
                  value={it.cantidad || ''}
                  onChange={(e) => updateItem(it.id, { cantidad: Number(e.target.value) })}
                />
                <Input
                  className="col-span-1"
                  placeholder="u"
                  value={it.unidad}
                  onChange={(e) => updateItem(it.id, { unidad: e.target.value })}
                />
                <Input
                  className="col-span-3"
                  type="number"
                  placeholder="Precio unit"
                  value={it.precioUnitario || ''}
                  onChange={(e) => updateItem(it.id, { precioUnitario: Number(e.target.value) })}
                />
                <Button size="icon" variant="ghost" className="col-span-1 h-8 w-8" onClick={() => removeItem(it.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <p className="text-right text-sm text-muted-foreground">
              Subtotal: <span className="font-semibold text-foreground">{fmt(subtotalItems)}</span>
            </p>
          </div>
        )}
      </div>

      {form.items.length === 0 && (
        <div>
          <label className="text-sm text-muted-foreground">Monto total</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              type="number"
              className="pl-7"
              value={form.montoTotal || ''}
              onChange={(e) => setForm((p) => ({ ...p, montoTotal: Number(e.target.value) }))}
              placeholder="85000"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border rounded-lg p-3 bg-card">
        <div>
          <p className="text-sm font-medium">Sumar IVA 21%</p>
          <p className="text-xs text-muted-foreground">Para emitir factura A o B</p>
        </div>
        <Switch checked={form.iva} onCheckedChange={(v) => setForm((p) => ({ ...p, iva: v }))} />
      </div>

      <div className="rounded-xl bg-foreground text-background p-4 flex items-center justify-between">
        <span className="text-sm">Total a cobrar</span>
        <span className="text-xl font-bold">{fmt(totalCalculado)}</span>
      </div>

      <div>
        <label className="text-sm text-muted-foreground mb-2 block">¿Incluye materiales?</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { val: true, label: 'Sí incluye' },
            { val: false, label: 'Solo mano' },
            { val: 'por_separado', label: 'Por separado' },
          ].map((opt) => (
            <button
              key={String(opt.val)}
              onClick={() => setForm((p) => ({ ...p, incluyeMateriales: opt.val as any }))}
              className={`py-2 rounded-xl text-xs border transition-colors ${
                form.incluyeMateriales === opt.val ? 'bg-foreground text-background border-foreground' : 'bg-background'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid xl:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-muted-foreground">Condiciones de pago</label>
          <Select value={form.condicionesPago} onValueChange={(v) => setForm((p) => ({ ...p, condicionesPago: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="50% adelanto, 50% al finalizar">50% adelanto · 50% al finalizar</SelectItem>
              <SelectItem value="Total al finalizar">Total al finalizar</SelectItem>
              <SelectItem value="30% adelanto · 70% al finalizar">30% adelanto · 70% al finalizar</SelectItem>
              <SelectItem value="En cuotas a acordar">En cuotas a acordar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Validez del presupuesto</label>
          <Select value={String(form.validezDias)} onValueChange={(v) => setForm((p) => ({ ...p, validezDias: Number(v) }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 días</SelectItem>
              <SelectItem value="15">15 días</SelectItem>
              <SelectItem value="30">30 días</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={handleGuardar} disabled={!form.cliente || !form.descripcionTrabajo || totalCalculado <= 0}>
          {editId ? 'Guardar cambios' : 'Guardar'}
        </Button>
        <Button onClick={handleGenerar} disabled={isGenerando}>
          <Sparkles className="h-4 w-4 mr-2" />
          {isGenerando ? 'Generando...' : 'Generar texto IA'}
        </Button>
      </div>
    </div>
  );

  const ResultBody = (
    <div className="space-y-4 mt-4">
      <Card className="p-4 xl:p-6 bg-muted/30 max-h-[55vh] overflow-y-auto">
        <pre className="text-sm whitespace-pre-wrap font-sans">{presupuestoGenerado}</pre>
      </Card>
      <div className="grid xl:grid-cols-4 gap-2">
        <Button variant="outline" onClick={handleCopiar}>
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
          {copied ? 'Copiado' : 'Copiar'}
        </Button>
        <Button className="text-white" style={{ backgroundColor: '#25D366' }} onClick={handleWhatsApp}>
          WhatsApp
        </Button>
        <Button variant="secondary" onClick={handleGuardar}>
          {editId ? 'Guardar cambios' : 'Guardar'}
        </Button>
        <Button variant="ghost" onClick={() => setPresupuestoGenerado(null)}>
          Volver a editar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-4 xl:p-0 space-y-4 xl:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl xl:text-2xl font-bold">Presupuestos</h1>
          <p className="hidden xl:block text-sm text-muted-foreground mt-1">
            Items, IVA, PDF, duplicar y convertir en trabajo — todo en un solo lugar
          </p>
        </div>
        <Button className="hidden xl:inline-flex" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo presupuesto
        </Button>
      </div>

      {/* Hero CTA */}
      <Card className="p-5 xl:p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold xl:text-lg">Presupuesto profesional con IA</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sumá ítems detallados, calculá IVA y bajalo en PDF con tu membrete o mandalo por WhatsApp.
            </p>
          </div>
          <Button size="lg" className="w-full xl:w-auto xl:hidden" onClick={() => { resetForm(); setShowForm(true); }}>
            <Sparkles className="h-4 w-4 mr-2" />
            Crear presupuesto
          </Button>
        </div>
      </Card>

      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente o trabajo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filtroEstado} onValueChange={(v: any) => setFiltroEstado(v)}>
          <SelectTrigger className="xl:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="borrador">Borradores</SelectItem>
            <SelectItem value="enviado">Enviados</SelectItem>
            <SelectItem value="aceptado">Aceptados</SelectItem>
            <SelectItem value="rechazado">Rechazados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista */}
      <div>
        <h2 className="text-sm xl:text-base font-semibold mb-3">
          Mis presupuestos ({presupuestosFiltrados.length})
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
          {presupuestosFiltrados.map((p) => (
            <Card key={p.id} className="p-4 hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm xl:text-base font-medium truncate">{p.cliente}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{p.descripcionTrabajo}</p>
                </div>
                <Badge className={`text-[10px] capitalize ${ESTADO_COLOR[p.estado]}`} variant="outline">
                  {p.estado}
                </Badge>
              </div>
              <div className="flex items-end justify-between mt-auto">
                <div>
                  <p className="text-lg xl:text-xl font-bold">{fmt(p.montoTotal)}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(p.fechaEmision).toLocaleDateString('es-AR')}
                    {p.items?.length ? ` · ${p.items.length} ítems` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => abrirEditar(p)}>
                    <Pencil className="h-3 w-3 mr-1" /> Editar
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handlePDF(p)}>
                    <FileDown className="h-3 w-3 mr-1" /> PDF
                  </Button>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-7 w-7">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-xs">Acciones</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => duplicarPresupuesto(p.id)}>
                      <CopyIcon className="h-4 w-4 mr-2" /> Duplicar
                    </DropdownMenuItem>
                    {p.estado !== 'aceptado' && p.estado !== 'enviado' && (
                      <DropdownMenuItem onClick={() => cambiarEstado(p.id, 'enviado')}>
                        <Send className="h-4 w-4 mr-2" /> Marcar enviado
                      </DropdownMenuItem>
                    )}
                    {p.estado === 'enviado' && (
                      <>
                        <DropdownMenuItem className="text-emerald-600 focus:text-emerald-600" onClick={() => cambiarEstado(p.id, 'aceptado')}>
                          <ThumbsUp className="h-4 w-4 mr-2" /> Marcar aceptado
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => cambiarEstado(p.id, 'rechazado')}>
                          <ThumbsDown className="h-4 w-4 mr-2" /> Marcar rechazado
                        </DropdownMenuItem>
                      </>
                    )}
                    {p.estado === 'aceptado' && (
                      <DropdownMenuItem onClick={() => handleConvertir(p.id)}>
                        <ArrowRightCircle className="h-4 w-4 mr-2" /> Convertir en trabajo
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => eliminar(p.id)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
          {presupuestosFiltrados.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full text-center py-8">
              No hay presupuestos.
            </p>
          )}
        </div>
      </div>

      {/* Mobile Sheet */}
      <Sheet open={showForm && !isDesktop()} onOpenChange={(o) => { if (!o) cerrarForm(); }}>
        <SheetContent side="bottom" className="h-[95vh] overflow-y-auto rounded-t-2xl xl:hidden">
          {!presupuestoGenerado ? (
            <>
              <SheetHeader>
                <SheetTitle>{editId ? 'Editar presupuesto' : 'Nuevo presupuesto'}</SheetTitle>
                <SheetDescription>Completá los datos. Podés guardarlo o generar el texto con IA.</SheetDescription>
              </SheetHeader>
              {FormBody}
            </>
          ) : (
            <>
              <SheetHeader>
                <SheetTitle>Presupuesto generado</SheetTitle>
                <SheetDescription>Revisalo, copialo, descargalo en PDF o compartilo.</SheetDescription>
              </SheetHeader>
              {ResultBody}
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Desktop Dialog */}
      <Dialog open={showForm && isDesktop()} onOpenChange={(o) => { if (!o) cerrarForm(); }}>
        <DialogContent className="hidden xl:flex flex-col max-w-3xl max-h-[92vh] overflow-y-auto">
          {!presupuestoGenerado ? (
            <>
              <DialogHeader>
                <DialogTitle>{editId ? 'Editar presupuesto' : 'Nuevo presupuesto'}</DialogTitle>
                <DialogDescription>Completá los datos. Podés guardarlo o generar el texto con IA.</DialogDescription>
              </DialogHeader>
              {FormBody}
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Presupuesto generado</DialogTitle>
                <DialogDescription>Revisalo, copialo, descargalo en PDF o compartilo.</DialogDescription>
              </DialogHeader>
              {ResultBody}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

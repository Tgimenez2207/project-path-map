import { useState } from 'react';
import { Sparkles, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockPresupuestos, mockPerfilGremio } from '@/data/mockGremios';
import { getRubroLabel, type PresupuestoGremio } from '@/types/gremios';
import { supabase } from '@/integrations/supabase/client';

const ESTADO_COLOR: Record<PresupuestoGremio['estado'], string> = {
  borrador: 'bg-muted text-muted-foreground',
  enviado: 'bg-blue-100 text-blue-700',
  aceptado: 'bg-emerald-100 text-emerald-700',
  rechazado: 'bg-red-100 text-red-700',
};

export default function GremiosPresupuesto() {
  const [presupuestos, setPresupuestos] = useState<PresupuestoGremio[]>(mockPresupuestos);
  const [showForm, setShowForm] = useState(false);
  const [isGenerando, setIsGenerando] = useState(false);
  const [presupuestoGenerado, setPresupuestoGenerado] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    cliente: '',
    telefono: '',
    email: '',
    descripcionTrabajo: '',
    montoTotal: 0,
    incluyeMateriales: true as boolean | 'por_separado',
    condicionesPago: '50% adelanto, 50% al finalizar',
    validezDias: 15,
  });

  const resetForm = () => {
    setForm({
      cliente: '',
      telefono: '',
      email: '',
      descripcionTrabajo: '',
      montoTotal: 0,
      incluyeMateriales: true,
      condicionesPago: '50% adelanto, 50% al finalizar',
      validezDias: 15,
    });
    setPresupuestoGenerado(null);
  };

  const handleGenerar = async () => {
    if (!form.cliente || !form.descripcionTrabajo || !form.montoTotal) {
      toast.error('Completá cliente, trabajo y monto');
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
          form,
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
    if (!presupuestoGenerado) return;
    const nuevo: PresupuestoGremio = {
      id: crypto.randomUUID(),
      cliente: form.cliente,
      email: form.email || undefined,
      telefono: form.telefono || undefined,
      descripcionTrabajo: form.descripcionTrabajo,
      montoTotal: form.montoTotal,
      incluyeMateriales: form.incluyeMateriales,
      condicionesPago: form.condicionesPago,
      validezDias: form.validezDias,
      fechaEmision: new Date().toISOString().slice(0, 10),
      estado: 'borrador',
      textoGenerado: presupuestoGenerado,
    };
    setPresupuestos((p) => [nuevo, ...p]);
    toast.success('Presupuesto guardado');
    setShowForm(false);
    resetForm();
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Presupuestos</h1>

      {/* Hero CTA */}
      <Card className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">Generador de presupuestos con IA</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Contanos qué trabajo vas a hacer y cuánto querés cobrar. Lo convertimos en un presupuesto
              profesional listo para enviar.
            </p>
          </div>
        </div>
        <Button className="w-full mt-4" onClick={() => setShowForm(true)}>
          <Sparkles className="h-4 w-4 mr-2" />
          Crear nuevo presupuesto
        </Button>
      </Card>

      {/* Lista */}
      <div>
        <h2 className="text-sm font-semibold mb-2">Mis presupuestos</h2>
        <div className="space-y-2">
          {presupuestos.map((p) => (
            <Card key={p.id} className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.cliente}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{p.descripcionTrabajo}</p>
                </div>
                <p className="text-sm font-bold whitespace-nowrap">${p.montoTotal.toLocaleString('es-AR')}</p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <Badge className={`text-[10px] ${ESTADO_COLOR[p.estado]}`} variant="outline">
                  {p.estado}
                </Badge>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(p.fechaEmision).toLocaleDateString('es-AR')}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Sheet
        open={showForm}
        onOpenChange={(o) => {
          setShowForm(o);
          if (!o) resetForm();
        }}
      >
        <SheetContent side="bottom" className="h-[95vh] overflow-y-auto rounded-t-2xl">
          {!presupuestoGenerado ? (
            <>
              <SheetHeader>
                <SheetTitle>Nuevo presupuesto</SheetTitle>
                <SheetDescription>Completá los datos y la IA redacta el texto profesional.</SheetDescription>
              </SheetHeader>
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
                <div>
                  <label className="text-sm text-muted-foreground">Cliente</label>
                  <Input
                    value={form.cliente}
                    onChange={(e) => setForm((p) => ({ ...p, cliente: e.target.value }))}
                    placeholder="Nombre o empresa"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Teléfono</label>
                    <Input
                      type="tel"
                      value={form.telefono}
                      onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))}
                      placeholder="11..."
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="cliente@mail.com"
                    />
                  </div>
                </div>
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
                          form.incluyeMateriales === opt.val
                            ? 'bg-foreground text-background border-foreground'
                            : 'bg-background'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Condiciones de pago</label>
                  <Select
                    value={form.condicionesPago}
                    onValueChange={(v) => setForm((p) => ({ ...p, condicionesPago: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50% adelanto, 50% al finalizar">
                        50% adelanto · 50% al finalizar
                      </SelectItem>
                      <SelectItem value="Total al finalizar">Total al finalizar</SelectItem>
                      <SelectItem value="30% adelanto · 70% al finalizar">
                        30% adelanto · 70% al finalizar
                      </SelectItem>
                      <SelectItem value="En cuotas a acordar">En cuotas a acordar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Validez del presupuesto</label>
                  <Select
                    value={String(form.validezDias)}
                    onValueChange={(v) => setForm((p) => ({ ...p, validezDias: Number(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 días</SelectItem>
                      <SelectItem value="15">15 días</SelectItem>
                      <SelectItem value="30">30 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" size="lg" onClick={handleGenerar} disabled={isGenerando}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGenerando ? 'Generando...' : 'Generar presupuesto con IA'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <SheetHeader>
                <SheetTitle>Presupuesto generado</SheetTitle>
                <SheetDescription>Revisalo, copialo o compartilo por WhatsApp.</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                <Card className="p-4 bg-muted/30">
                  <pre className="text-sm whitespace-pre-wrap font-sans">{presupuestoGenerado}</pre>
                </Card>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" onClick={handleCopiar}>
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? 'Copiado' : 'Copiar texto'}
                  </Button>
                  <Button
                    className="w-full text-white"
                    style={{ backgroundColor: '#25D366' }}
                    onClick={handleWhatsApp}
                  >
                    Compartir por WhatsApp
                  </Button>
                  <Button variant="secondary" className="w-full" onClick={handleGuardar}>
                    Guardar en mis presupuestos
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => setPresupuestoGenerado(null)}>
                    Volver a editar
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

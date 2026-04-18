import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useGremios } from '@/contexts/GremiosContext';
import { RUBRO_LABELS, type RubroGremio, getRubroLabel } from '@/types/gremios';

export default function GremiosPerfil() {
  const navigate = useNavigate();
  const { perfil, actualizarPerfil } = useGremios();
  const [form, setForm] = useState({ ...perfil });

  const handleGuardar = () => {
    if (!form.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (!form.telefono.trim()) {
      toast.error('El teléfono es obligatorio');
      return;
    }
    actualizarPerfil(form);
    toast.success('Perfil actualizado');
  };

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="p-4 xl:p-0 space-y-5 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 xl:hidden">
        <Button size="icon" variant="ghost" onClick={() => navigate(-1)} aria-label="Volver">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Mi perfil</h1>
      </div>

      <div className="hidden xl:block">
        <h1 className="text-2xl font-bold">Mi perfil</h1>
        <p className="text-sm text-muted-foreground">Datos que aparecen en presupuestos y mensajes a clientes.</p>
      </div>

      {/* Preview card */}
      <Card className="p-5 flex items-center gap-4 bg-muted/30">
        <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">
          {form.nombre.charAt(0) || <User className="h-6 w-6" />}
        </div>
        <div className="min-w-0">
          <p className="font-semibold truncate">{form.nombre || 'Sin nombre'}</p>
          <p className="text-sm text-muted-foreground truncate">
            {getRubroLabel(form.rubro)}
            {form.matricula && ` · Mat. ${form.matricula}`}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {[form.ciudad, form.provincia].filter(Boolean).join(', ')}
          </p>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre y apellido *</Label>
            <Input id="nombre" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rubro">Rubro *</Label>
            <Select value={form.rubro} onValueChange={(v) => set('rubro', v as RubroGremio)}>
              <SelectTrigger id="rubro"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(RUBRO_LABELS) as RubroGremio[]).map((r) => (
                  <SelectItem key={r} value={r}>{RUBRO_LABELS[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="matricula">Matrícula</Label>
            <Input
              id="matricula"
              placeholder="Ej: MAT-4821"
              value={form.matricula ?? ''}
              onChange={(e) => set('matricula', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="telefono">Teléfono *</Label>
            <Input
              id="telefono"
              placeholder="+54 11 ..."
              value={form.telefono}
              onChange={(e) => set('telefono', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ciudad">Ciudad</Label>
            <Input id="ciudad" value={form.ciudad} onChange={(e) => set('ciudad', e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="provincia">Provincia</Label>
            <Input id="provincia" value={form.provincia} onChange={(e) => set('provincia', e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="descripcion">Descripción / servicios</Label>
          <Textarea
            id="descripcion"
            rows={3}
            placeholder="Ej: Más de 10 años de experiencia en instalaciones eléctricas residenciales y comerciales."
            value={form.descripcion ?? ''}
            onChange={(e) => set('descripcion', e.target.value)}
          />
        </div>
      </Card>

      <div className="flex gap-2 sticky bottom-0 xl:static bg-background/95 backdrop-blur xl:bg-transparent py-3 xl:py-0 -mx-4 xl:mx-0 px-4 xl:px-0 border-t xl:border-0">
        <Button variant="outline" className="flex-1 xl:flex-none" onClick={() => setForm({ ...perfil })}>
          Descartar
        </Button>
        <Button className="flex-1 xl:flex-none gap-2" onClick={handleGuardar}>
          <Save className="h-4 w-4" /> Guardar cambios
        </Button>
      </div>
    </div>
  );
}

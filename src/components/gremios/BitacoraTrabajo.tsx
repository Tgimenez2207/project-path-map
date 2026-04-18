import { useState } from 'react';
import { Plus, Camera, AlertCircle, Wrench, Package, Eye, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { EntradaBitacora } from '@/types/gremios';

const TIPO_META: Record<NonNullable<EntradaBitacora['tipo']>, { label: string; icon: typeof FileText; cls: string }> = {
  avance: { label: 'Avance', icon: Wrench, cls: 'bg-blue-500/10 text-blue-700 border-blue-200' },
  problema: { label: 'Problema', icon: AlertCircle, cls: 'bg-red-500/10 text-red-700 border-red-200' },
  material: { label: 'Material', icon: Package, cls: 'bg-amber-500/10 text-amber-700 border-amber-200' },
  visita: { label: 'Visita', icon: Eye, cls: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' },
  nota: { label: 'Nota', icon: FileText, cls: 'bg-muted text-muted-foreground border-muted' },
};

interface Props {
  entradas: EntradaBitacora[];
  onAgregar: (e: EntradaBitacora) => void;
}

export default function BitacoraTrabajo({ entradas, onAgregar }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [texto, setTexto] = useState('');
  const [tipo, setTipo] = useState<NonNullable<EntradaBitacora['tipo']>>('avance');
  const [hora, setHora] = useState(new Date().toTimeString().slice(0, 5));

  const ordenadas = [...entradas].sort((a, b) => {
    const ka = `${a.fecha}T${a.hora ?? '00:00'}`;
    const kb = `${b.fecha}T${b.hora ?? '00:00'}`;
    return kb.localeCompare(ka);
  });

  const handleGuardar = () => {
    if (!texto.trim()) {
      toast.error('Escribí algo en la entrada');
      return;
    }
    onAgregar({
      id: crypto.randomUUID(),
      fecha: new Date().toISOString().slice(0, 10),
      hora,
      tipo,
      texto: texto.trim(),
    });
    toast.success('Entrada agregada a la bitácora');
    setTexto('');
    setShowForm(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Bitácora del trabajo</h3>
          <p className="text-xs text-muted-foreground">
            {entradas.length} entrada{entradas.length !== 1 ? 's' : ''}
          </p>
        </div>
        {!showForm && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Nueva entrada
          </Button>
        )}
      </div>

      {showForm && (
        <div className="rounded-xl border bg-muted/20 p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Tipo</label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as any)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPO_META).map(([k, m]) => (
                    <SelectItem key={k} value={k}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Hora</label>
              <Input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="h-9" />
            </div>
          </div>
          <Textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ej: terminé el tendido de cañería del living. Falta pasar cables."
            rows={3}
          />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.info('Próximamente: subir fotos')}>
              <Camera className="h-3.5 w-3.5 mr-1" />
              Foto
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setTexto(''); }}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleGuardar}>Guardar</Button>
          </div>
        </div>
      )}

      {ordenadas.length === 0 && !showForm && (
        <p className="text-xs text-muted-foreground text-center py-6">
          Sin entradas. Anotá avances, problemas o materiales para tener el historial.
        </p>
      )}

      <div className="space-y-2">
        {ordenadas.map((e) => {
          const meta = TIPO_META[e.tipo ?? 'nota'];
          const Icon = meta.icon;
          return (
            <div key={e.id} className="flex gap-3 p-3 rounded-lg border bg-card">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${meta.cls}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Badge variant="outline" className={`text-[10px] ${meta.cls}`}>{meta.label}</Badge>
                  <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {new Date(e.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                    {e.hora && ` · ${e.hora}`}
                  </p>
                </div>
                <p className="text-sm whitespace-pre-wrap">{e.texto}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

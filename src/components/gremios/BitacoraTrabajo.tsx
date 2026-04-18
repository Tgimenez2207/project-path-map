import { useRef, useState } from 'react';
import { Plus, BookOpen, ImageIcon, X, Camera, Wrench, AlertCircle, Package, Eye, Pencil } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { EntradaBitacora } from '@/types/gremios';
import { toast } from 'sonner';

const TIPO_META: Record<NonNullable<EntradaBitacora['tipo']>, { label: string; icon: any; cls: string }> = {
  avance: { label: 'Avance', icon: Wrench, cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  problema: { label: 'Problema', icon: AlertCircle, cls: 'bg-red-100 text-red-700 border-red-200' },
  material: { label: 'Material', icon: Package, cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  visita: { label: 'Visita', icon: Eye, cls: 'bg-purple-100 text-purple-700 border-purple-200' },
  nota: { label: 'Nota', icon: Pencil, cls: 'bg-muted text-muted-foreground' },
};

interface Props {
  entradas: EntradaBitacora[];
  onAgregar: (e: EntradaBitacora) => void;
}

export default function BitacoraTrabajo({ entradas, onAgregar }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [tipo, setTipo] = useState<NonNullable<EntradaBitacora['tipo']>>('avance');
  const [texto, setTexto] = useState('');
  const [hora, setHora] = useState(() => new Date().toTimeString().slice(0, 5));
  const [fotos, setFotos] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 4 - fotos.length);
    arr.forEach((f) => {
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} es muy grande (máx. 5 MB)`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setFotos((p) => [...p, ev.target!.result as string]);
      };
      reader.readAsDataURL(f);
    });
  };

  const guardar = () => {
    if (!texto.trim()) {
      toast.error('Escribí algo antes de guardar');
      return;
    }
    onAgregar({
      id: crypto.randomUUID(),
      fecha: new Date().toISOString().slice(0, 10),
      hora,
      texto: texto.trim(),
      tipo,
      fotos: fotos.length > 0 ? fotos : undefined,
    });
    toast.success('Entrada agregada');
    setTexto('');
    setFotos([]);
    setShowForm(false);
  };

  const ordenadas = [...entradas].sort((a, b) =>
    `${b.fecha}T${b.hora ?? '00:00'}`.localeCompare(`${a.fecha}T${a.hora ?? '00:00'}`),
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Bitácora ({entradas.length})</h3>
        </div>
        <Button size="sm" variant={showForm ? 'ghost' : 'outline'} onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancelar' : (
            <>
              <Plus className="h-3 w-3 mr-1" /> Agregar
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card className="p-3 space-y-3 bg-muted/30">
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(TIPO_META) as Array<keyof typeof TIPO_META>).map((k) => {
              const meta = TIPO_META[k];
              const Icon = meta.icon;
              const active = tipo === k;
              return (
                <button
                  key={k}
                  onClick={() => setTipo(k)}
                  className={`px-2.5 py-1 rounded-full text-xs flex items-center gap-1 border transition-colors ${
                    active ? 'bg-foreground text-background border-foreground' : 'bg-background'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {meta.label}
                </button>
              );
            })}
          </div>
          <Textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Describí qué pasó..."
            rows={3}
          />
          <div className="flex items-center gap-2">
            <Input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="w-32" />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => fileRef.current?.click()}
              disabled={fotos.length >= 4}
            >
              <Camera className="h-4 w-4 mr-1" />
              Fotos ({fotos.length}/4)
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              hidden
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
          {fotos.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {fotos.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                  <img src={src} alt="" className="object-cover w-full h-full" />
                  <button
                    onClick={() => setFotos((p) => p.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/70 text-white flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <Button size="sm" className="w-full" onClick={guardar}>
            Guardar entrada
          </Button>
        </Card>
      )}

      {ordenadas.length === 0 && !showForm && (
        <p className="text-xs text-muted-foreground text-center py-6">
          Todavía no hay entradas. Agregá la primera para llevar el registro del trabajo.
        </p>
      )}

      <div className="space-y-2">
        {ordenadas.map((e) => {
          const meta = TIPO_META[e.tipo ?? 'nota'];
          const Icon = meta.icon;
          return (
            <div key={e.id} className="border rounded-lg p-3 bg-card">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <Badge variant="outline" className={`text-[10px] gap-1 ${meta.cls}`}>
                  <Icon className="h-3 w-3" />
                  {meta.label}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(e.fecha + 'T00:00:00').toLocaleDateString('es-AR')}
                  {e.hora ? ` · ${e.hora}` : ''}
                </span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{e.texto}</p>
              {e.fotos && e.fotos.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {e.fotos.map((src, i) => (
                    <a key={i} href={src} target="_blank" rel="noreferrer" className="block aspect-square rounded-lg overflow-hidden bg-muted">
                      <img src={src} alt="" className="object-cover w-full h-full hover:scale-105 transition-transform" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

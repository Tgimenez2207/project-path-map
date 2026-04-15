import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Obra } from '@/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const contentTypes = [
  { value: 'instagram', label: '📱 Post para Instagram' },
  { value: 'linkedin', label: '💼 Post para LinkedIn' },
  { value: 'update_compradores', label: '📬 Update para compradores' },
  { value: 'ficha_tecnica', label: '📄 Ficha técnica de venta' },
];

interface MarketingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  obra: Obra;
  unidadesVendidas: number;
  totalUnidades: number;
}

export default function MarketingDialog({ open, onOpenChange, obra, unidadesVendidas, totalUnidades }: MarketingDialogProps) {
  const [selectedType, setSelectedType] = useState('instagram');
  const [additionalContext, setAdditionalContext] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setGeneratedContent('');
    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/ai-marketing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          obraContext: {
            nombre: obra.nombre,
            direccion: obra.direccion,
            ciudad: obra.ciudad,
            progreso: obra.progreso,
            estado: obra.estado,
            unidadesVendidas,
            totalUnidades,
          },
          contentType: selectedType,
          additionalContext,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || 'Error de conexión');
      }

      const data = await resp.json();
      setGeneratedContent(data.content || 'No se pudo generar contenido.');
    } catch (e) {
      console.error(e);
      toast.error('Error al conectar con la IA. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      toast.success('Contenido copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('No se pudo copiar');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generar contenido de marketing con IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Content type selector */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Tipo de contenido</Label>
            <RadioGroup value={selectedType} onValueChange={setSelectedType} className="grid grid-cols-2 gap-2">
              {contentTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={type.value} id={type.value} />
                  <Label htmlFor={type.value} className="text-sm cursor-pointer">{type.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Additional context */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Contexto adicional (opcional)</Label>
            <Textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Ej: Esta semana terminamos la losa del piso 12"
              className="input-rappi"
              rows={2}
            />
          </div>

          {/* Generate button */}
          <Button onClick={handleGenerate} disabled={isLoading} className="w-full btn-rappi gradient-rappi text-white">
            <Sparkles className="h-4 w-4 mr-2" />
            {isLoading ? 'Generando...' : 'Generar'}
          </Button>

          {/* Output */}
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}

          {generatedContent && !isLoading && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Contenido generado</Label>
              <Textarea
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                rows={8}
                className="input-rappi text-sm"
              />
            </div>
          )}
        </div>

        {generatedContent && !isLoading && (
          <DialogFooter>
            <Button variant="outline" onClick={handleCopy} className="btn-rappi gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copiado' : 'Copiar al portapapeles'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

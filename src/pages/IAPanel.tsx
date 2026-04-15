import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sparkles, AlertTriangle, Clock, Info, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { mockObras, mockEtapas, mockTareas, mockBitacora } from '@/data/mockObras';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface Alerta {
  tipo: 'danger' | 'warning' | 'info';
  titulo: string;
  descripcion: string;
}

export default function IAPanel() {
  const [alertasByObra, setAlertasByObra] = useState<Record<string, Alerta[]>>({});
  const [loadingObra, setLoadingObra] = useState<string | null>(null);

  const analizarObra = async (obraId: string) => {
    const obra = mockObras.find(o => o.id === obraId);
    if (!obra) return;

    setLoadingObra(obraId);
    try {
      const etapas = mockEtapas.filter(e => e.obraId === obraId);
      const tareas = mockTareas.filter(t => t.obraId === obraId);
      const bitacora = mockBitacora.filter(b => b.obraId === obraId);

      const resp = await fetch(`${SUPABASE_URL}/functions/v1/ai-alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          obraContext: {
            nombre: obra.nombre,
            progreso: obra.progreso,
            presupuestoTotal: obra.presupuestoTotal,
            moneda: obra.moneda,
            estado: obra.estado,
            etapas: etapas.map(e => ({ nombre: e.nombre, estado: e.estado, orden: e.orden })),
            tareas: tareas.map(t => ({ titulo: t.titulo, estado: t.estado, prioridad: t.prioridad, asignadoA: t.asignadoA })),
            bitacora: bitacora.slice(0, 5).map(b => ({ titulo: b.titulo, descripcion: b.descripcion, fecha: b.fecha })),
          },
        }),
      });

      if (!resp.ok) throw new Error('Error al analizar');
      const data = await resp.json();
      setAlertasByObra(prev => ({ ...prev, [obraId]: data.alertas || [] }));
    } catch (e) {
      console.error(e);
      toast.error('Error al conectar con la IA. Intentá de nuevo.');
    } finally {
      setLoadingObra(null);
    }
  };

  const alertaIcon = (tipo: string) => {
    switch (tipo) {
      case 'danger': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning': return <Clock className="h-4 w-4 text-warning" />;
      default: return <Info className="h-4 w-4 text-info" />;
    }
  };

  const alertaClasses = (tipo: string) => {
    switch (tipo) {
      case 'danger': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'warning': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-info/10 text-info border-info/20';
    }
  };

  const estadoLabel: Record<string, string> = {
    planificacion: 'Planificación',
    en_curso: 'En curso',
    pausada: 'Pausada',
    finalizada: 'Finalizada',
    cancelada: 'Cancelada',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-2xl gradient-rappi flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">NATO OBRAS Intelligence</h1>
            <p className="text-muted-foreground text-sm">Alertas y análisis generados por IA para todas tus obras</p>
          </div>
        </div>
      </div>

      {/* Grid de obras */}
      <div className="grid gap-4 md:grid-cols-2">
        {mockObras.map((obra) => (
          <Card key={obra.id} className="card-rappi">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{obra.nombre}</CardTitle>
                <Badge variant={obra.estado === 'en_curso' ? 'default' : 'secondary'}>
                  {estadoLabel[obra.estado] || obra.estado}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{obra.direccion}, {obra.ciudad}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Progress value={obra.progreso} className="flex-1" />
                <span className="text-sm font-medium">{obra.progreso}%</span>
              </div>

              <Button
                onClick={() => analizarObra(obra.id)}
                disabled={loadingObra === obra.id}
                variant="outline"
                className="w-full btn-rappi gap-2"
              >
                <Zap className="h-4 w-4" />
                {loadingObra === obra.id ? 'Analizando...' : alertasByObra[obra.id] ? 'Re-analizar' : 'Analizar'}
              </Button>

              {loadingObra === obra.id && (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              )}

              {alertasByObra[obra.id] && loadingObra !== obra.id && (
                <Accordion type="single" collapsible defaultValue="alertas">
                  <AccordionItem value="alertas" className="border-0">
                    <AccordionTrigger className="text-sm py-2">
                      {alertasByObra[obra.id].length} alerta(s) detectada(s)
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {alertasByObra[obra.id].length === 0 ? (
                          <p className="text-sm text-muted-foreground">✅ Sin alertas</p>
                        ) : (
                          alertasByObra[obra.id].map((alerta, i) => (
                            <div key={i} className={`flex items-start gap-2 p-2 rounded-lg border text-xs ${alertaClasses(alerta.tipo)}`}>
                              {alertaIcon(alerta.tipo)}
                              <div>
                                <p className="font-medium">{alerta.titulo}</p>
                                <p className="mt-0.5 opacity-80">{alerta.descripcion}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

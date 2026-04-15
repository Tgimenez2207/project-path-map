import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Sparkles, Send, Building2, Truck, Calculator, Megaphone,
  AlertTriangle, Clock, Info, ChevronDown, Zap, ArrowRight, Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { mockObras, mockEtapas, mockTareas, mockBitacora } from '@/data/mockObras';
import ReactMarkdown from 'react-markdown';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Alerta {
  tipo: 'danger' | 'warning' | 'info';
  titulo: string;
  descripcion: string;
}

const STORAGE_KEY = 'ia-assistant-general';

const featureCards = [
  {
    icon: Building2,
    title: 'Analizar obra',
    desc: 'Chateá con la IA sobre una obra específica: presupuesto, avance, alertas.',
    path: '/obras',
    color: 'text-primary',
  },
  {
    icon: Truck,
    title: 'Comparar proveedores',
    desc: 'Seleccioná proveedores y pedile a la IA que recomiende el mejor.',
    path: '/proveedores',
    color: 'text-emerald-500',
  },
  {
    icon: Calculator,
    title: 'Simular rinde',
    desc: 'Calculá la rentabilidad de un proyecto con análisis IA incluido.',
    path: '/simulador',
    color: 'text-amber-500',
  },
  {
    icon: Megaphone,
    title: 'Generar contenido',
    desc: 'Creá textos de marketing para tus unidades desde el detalle de obra.',
    path: '/obras',
    color: 'text-violet-500',
  },
];

const estadoLabel: Record<string, string> = {
  planificacion: 'Planificación',
  en_curso: 'En curso',
  pausada: 'Pausada',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
};

export default function IAPanel() {
  const navigate = useNavigate();

  // ─── Chat general ───
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    let assistantSoFar = '';
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/ai-copilot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          // No obraContext → general assistant mode
        }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || 'Error de conexión');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error('Error al conectar con la IA. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Alertas cross-obra ───
  const [alertasByObra, setAlertasByObra] = useState<Record<string, Alerta[]>>({});
  const [loadingObra, setLoadingObra] = useState<string | null>(null);
  const [alertasOpen, setAlertasOpen] = useState(false);

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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify({
          obraContext: {
            nombre: obra.nombre, progreso: obra.progreso,
            presupuestoTotal: obra.presupuestoTotal, moneda: obra.moneda, estado: obra.estado,
            etapas: etapas.map(e => ({ nombre: e.nombre, estado: e.estado, orden: e.orden })),
            tareas: tareas.map(t => ({ titulo: t.titulo, estado: t.estado, prioridad: t.prioridad, asignadoA: t.asignadoA })),
            bitacora: bitacora.slice(0, 5).map(b => ({ titulo: b.titulo, descripcion: b.descripcion, fecha: b.fecha })),
          },
        }),
      });
      if (!resp.ok) throw new Error('Error al analizar');
      const data = await resp.json();
      setAlertasByObra(prev => ({ ...prev, [obraId]: data.alertas || [] }));
    } catch {
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl gradient-rappi flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Asistente IA</h1>
          <p className="text-muted-foreground text-sm">Tu copilot centralizado para gestión de obras</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ─── Col izquierda: Chat ─── */}
        <Card className="card-rappi flex flex-col" style={{ minHeight: 520 }}>
          <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Chat general
            </CardTitle>
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearChat} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-1" /> Limpiar
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-3">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1" style={{ maxHeight: 380 }}>
              {messages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="h-10 w-10 mx-auto mb-3 text-primary/40" />
                  <p className="text-sm font-medium">Preguntame sobre gestión de obras, costos, proveedores…</p>
                  <p className="text-xs mt-1">Este chat no está atado a ninguna obra en particular.</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-muted/50 ml-8' : 'bg-primary/10 mr-8'}`}>
                  <p className="text-xs font-medium mb-1 text-muted-foreground">
                    {msg.role === 'user' ? 'Vos' : '🤖 Asistente IA'}
                  </p>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="bg-primary/10 mr-8 p-3 rounded-xl">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2 pt-2 border-t">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ej: ¿Cómo negociar con un contratista que subió precios?"
                disabled={isLoading}
                className="input-rappi"
              />
              <Button onClick={sendMessage} disabled={isLoading || !input.trim()} className="btn-rappi gradient-rappi text-white">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ─── Col derecha: Accesos directos ─── */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Herramientas IA</h2>
          {featureCards.map((fc) => (
            <Card
              key={fc.title}
              className="card-rappi cursor-pointer hover:border-primary/30 transition-colors group"
              onClick={() => navigate(fc.path)}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`mt-0.5 ${fc.color}`}>
                  <fc.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium flex items-center gap-1">
                    {fc.title}
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{fc.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ─── Alertas cross-obra (colapsable) ─── */}
      <Collapsible open={alertasOpen} onOpenChange={setAlertasOpen}>
        <Card className="card-rappi">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Alertas IA por obra
                </CardTitle>
                <ChevronDown className={`h-4 w-4 transition-transform ${alertasOpen ? 'rotate-180' : ''}`} />
              </div>
              <CardDescription>Analizá cada obra en busca de riesgos y desvíos</CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {mockObras.map((obra) => (
                  <Card key={obra.id} className="border">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{obra.nombre}</CardTitle>
                        <Badge variant={obra.estado === 'en_curso' ? 'default' : 'secondary'} className="text-xs">
                          {estadoLabel[obra.estado] || obra.estado}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Progress value={obra.progreso} className="flex-1" />
                        <span className="text-xs font-medium">{obra.progreso}%</span>
                      </div>

                      <Button
                        onClick={() => analizarObra(obra.id)}
                        disabled={loadingObra === obra.id}
                        variant="outline"
                        size="sm"
                        className="w-full gap-1"
                      >
                        <Zap className="h-3 w-3" />
                        {loadingObra === obra.id ? 'Analizando...' : alertasByObra[obra.id] ? 'Re-analizar' : 'Analizar'}
                      </Button>

                      {loadingObra === obra.id && (
                        <div className="space-y-2">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      )}

                      {alertasByObra[obra.id] && loadingObra !== obra.id && (
                        <div className="space-y-2">
                          {alertasByObra[obra.id].length === 0 ? (
                            <p className="text-xs text-muted-foreground">✅ Sin alertas</p>
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
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Send, Sparkles, AlertTriangle, Clock, Info, ChevronDown, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Obra, Etapa, Tarea, EntradaBitacora } from '@/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface Alerta {
  tipo: 'danger' | 'warning' | 'info';
  titulo: string;
  descripcion: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface IACopilotTabProps {
  obra: Obra;
  etapas: Etapa[];
  tareas: Tarea[];
  bitacora: EntradaBitacora[];
}

export default function IACopilotTab({ obra, etapas, tareas, bitacora }: IACopilotTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [alertasLoading, setAlertasLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [alertasOpen, setAlertasOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const obraContext = {
    nombre: obra.nombre,
    progreso: obra.progreso,
    presupuestoTotal: obra.presupuestoTotal,
    moneda: obra.moneda,
    estado: obra.estado,
    etapas: etapas.map(e => ({ nombre: e.nombre, estado: e.estado, orden: e.orden })),
    tareas: tareas.map(t => ({ titulo: t.titulo, estado: t.estado, prioridad: t.prioridad, asignadoA: t.asignadoA })),
    bitacora: bitacora.slice(0, 5).map(b => ({ titulo: b.titulo, descripcion: b.descripcion, fecha: b.fecha })),
  };

  useEffect(() => {
    fetchAlertas();
  }, [obra.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchAlertas = async () => {
    setAlertasLoading(true);
    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/ai-alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ obraContext }),
      });
      if (!resp.ok) throw new Error('Error fetching alerts');
      const data = await resp.json();
      setAlertas(data.alertas || []);
    } catch (e) {
      console.error(e);
      toast.error('Error al conectar con la IA. Intentá de nuevo.');
    } finally {
      setAlertasLoading(false);
    }
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
          obraContext,
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

  const alertaIcon = (tipo: string) => {
    switch (tipo) {
      case 'danger': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <Clock className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
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
    <div className="space-y-6">
      {/* Chat Copilot */}
      <Collapsible open={chatOpen} onOpenChange={setChatOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Copilot de Presupuesto
                </CardTitle>
                <ChevronDown className={`h-4 w-4 transition-transform ${chatOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {/* Messages */}
              <div className="max-h-[400px] overflow-y-auto space-y-3 p-2">
                {messages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary/50" />
                    <p className="text-sm">Hacé una pregunta sobre el presupuesto o avance de la obra</p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`p-3 rounded-xl text-sm whitespace-pre-wrap ${
                    msg.role === 'user' ? 'bg-muted/50 ml-8' : 'bg-primary/10 mr-8'
                  }`}>
                    <p className="text-xs font-medium mb-1 text-muted-foreground">
                      {msg.role === 'user' ? 'Vos' : '🤖 IA Copilot'}
                    </p>
                    {msg.content}
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
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ej: ¿Qué partidas están más desviadas? ¿Cuánto vamos a gastar al final?"
                  disabled={isLoading}
                  className="input-rappi"
                />
                <Button onClick={sendMessage} disabled={isLoading || !input.trim()} className="btn-rappi gradient-rappi text-white">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Alertas Inteligentes */}
      <Collapsible open={alertasOpen} onOpenChange={setAlertasOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Alertas detectadas por IA
                  {alertas.length > 0 && (
                    <Badge variant="secondary" className="ml-2">{alertas.length}</Badge>
                  )}
                </CardTitle>
                <ChevronDown className={`h-4 w-4 transition-transform ${alertasOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-3">
              {alertasLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : alertas.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  ✅ No se detectaron alertas para esta obra
                </p>
              ) : (
                alertas.map((alerta, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${alertaClasses(alerta.tipo)}`}>
                    {alertaIcon(alerta.tipo)}
                    <div>
                      <p className="font-medium text-sm">{alerta.titulo}</p>
                      <p className="text-xs mt-1 opacity-80">{alerta.descripcion}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}

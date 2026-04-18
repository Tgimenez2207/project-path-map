import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { mockPerfilGremio } from '@/data/mockGremios';
import { getRubroLabel } from '@/types/gremios';
import { supabase } from '@/integrations/supabase/client';

interface Mensaje {
  rol: 'user' | 'assistant';
  texto: string;
}

const SUGERENCIAS = [
  '💰 ¿Cuánto cobro por instalar un tablero trifásico en CABA hoy?',
  '📱 ¿Cómo le reclamo un pago a un cliente por WhatsApp?',
  '📋 ¿Qué certificaciones necesito para trabajar en obra nueva?',
  '🚀 ¿Cómo consigo más clientes como independiente?',
  '🧾 ¿Cómo facturo como monotributista paso a paso?',
  '⚠️ Un cliente no me quiere pagar. ¿Qué puedo hacer?',
];

export default function GremiosAsistente() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, isLoading]);

  const handleEnviar = async (texto: string) => {
    if (!texto.trim() || isLoading) return;
    const nuevoHistorial: Mensaje[] = [...mensajes, { rol: 'user', texto }];
    setMensajes(nuevoHistorial);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('gremios-ai', {
        body: {
          mode: 'chat',
          perfil: {
            nombre: mockPerfilGremio.nombre,
            rubroLabel: getRubroLabel(mockPerfilGremio.rubro),
            ciudad: mockPerfilGremio.ciudad,
          },
          messages: nuevoHistorial.map((m) => ({
            role: m.rol === 'user' ? 'user' : 'assistant',
            content: m.texto,
          })),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMensajes((prev) => [...prev, { rol: 'assistant', texto: data?.text || '' }]);
    } catch (e: any) {
      toast.error(e?.message || 'Error al conectar');
    } finally {
      setIsLoading(false);
    }
  };

  const ChatArea = (
    <>
      {mensajes.length === 0 ? (
        <div className="flex-1 overflow-y-auto p-4 xl:p-8 space-y-6">
          <div className="text-center py-6 xl:py-10">
            <div className="inline-flex h-14 w-14 xl:h-20 xl:w-20 rounded-2xl bg-primary text-primary-foreground items-center justify-center mb-3">
              <Sparkles className="h-7 w-7 xl:h-10 xl:w-10" />
            </div>
            <h2 className="text-lg xl:text-2xl font-semibold">
              Hola {mockPerfilGremio.nombre.split(' ')[0]} 👋
            </h2>
            <p className="text-sm xl:text-base text-muted-foreground mt-2 px-4 max-w-xl mx-auto">
              Preguntame lo que quieras sobre tu trabajo, precios, cobros, certificaciones o cómo hacer crecer tu negocio.
            </p>
          </div>
          {/* Mobile: lista */}
          <div className="xl:hidden space-y-2">
            {SUGERENCIAS.map((s, i) => (
              <button
                key={i}
                onClick={() => handleEnviar(s)}
                className="w-full text-left px-4 py-3 rounded-xl border text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
          {/* Desktop: grid */}
          <div className="hidden xl:grid grid-cols-2 gap-3 max-w-3xl mx-auto">
            {SUGERENCIAS.map((s, i) => (
              <button
                key={i}
                onClick={() => handleEnviar(s)}
                className="text-left px-4 py-4 rounded-xl border text-sm hover:bg-muted/50 hover:border-primary/40 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 xl:p-8 space-y-3 xl:space-y-4">
          <div className="max-w-3xl mx-auto space-y-3 xl:space-y-4">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.rol === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] xl:max-w-[75%] px-4 py-2 xl:py-3 rounded-2xl text-sm xl:text-base whitespace-pre-wrap ${
                    m.rol === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                  }`}
                >
                  {m.texto}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted px-4 py-3 rounded-2xl">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      )}

      <div className="border-t p-3 xl:p-4 bg-background">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleEnviar(input);
              }
            }}
            placeholder="Escribí tu pregunta..."
            className="flex-1 rounded-xl"
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={() => handleEnviar(input)}
            disabled={!input.trim() || isLoading}
            className="rounded-xl flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile: pantalla completa */}
      <div className="xl:hidden flex flex-col h-[calc(100vh-9rem)]">
        {ChatArea}
      </div>

      {/* Desktop: card centrada */}
      <div className="hidden xl:block">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Asistente IA</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tu asistente de negocio: precios, cobros, facturación y más
          </p>
        </div>
        <Card className="flex flex-col h-[calc(100vh-12rem)] overflow-hidden">
          {ChatArea}
        </Card>
      </div>
    </>
  );
}

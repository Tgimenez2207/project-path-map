import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)]">
      {mensajes.length === 0 ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="text-center py-6">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-primary text-primary-foreground items-center justify-center mb-3">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-semibold">
              Hola {mockPerfilGremio.nombre.split(' ')[0]} 👋
            </h2>
            <p className="text-sm text-muted-foreground mt-1 px-4">
              Preguntame lo que quieras sobre tu trabajo, precios, cobros, certificaciones o cómo hacer
              crecer tu negocio.
            </p>
          </div>
          <div className="space-y-2">
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
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {mensajes.map((m, i) => (
            <div key={i} className={`flex ${m.rol === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
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
                  <div
                    className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce"
                    style={{ animationDelay: '0.15s' }}
                  />
                  <div
                    className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce"
                    style={{ animationDelay: '0.3s' }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      <div className="border-t p-3 flex gap-2 bg-background">
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
  );
}

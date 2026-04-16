import { useState, useRef, useEffect } from 'react';
import {
  HelpCircle, Search, ChevronRight, Sparkles, Send,
  Lightbulb, AlertTriangle, ThumbsUp, ThumbsDown,
  BookOpen, MessageCircle, Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { articulosAyuda } from '@/data/articulosAyuda';
import type { Articulo, SeccionArticulo, MensajeChat, ModuloSistema } from '@/types/ayuda';

const moduloLabels: Record<ModuloSistema | 'todos', string> = {
  todos: 'Todos',
  obras: 'Obras',
  presupuestos: 'Presupuestos',
  avance: 'Avance',
  proveedores: 'Proveedores',
  clientes: 'Clientes',
  stock: 'Stock',
  gantt: 'Gantt',
  simulador: 'Simulador',
  noticias: 'Noticias',
  ia: 'IA',
  portal: 'Portal',
  general: 'General',
};

const moduloColors: Record<ModuloSistema, string> = {
  obras: 'bg-orange-100 text-orange-700',
  presupuestos: 'bg-blue-100 text-blue-700',
  avance: 'bg-green-100 text-green-700',
  proveedores: 'bg-purple-100 text-purple-700',
  clientes: 'bg-pink-100 text-pink-700',
  stock: 'bg-yellow-100 text-yellow-700',
  gantt: 'bg-cyan-100 text-cyan-700',
  simulador: 'bg-indigo-100 text-indigo-700',
  noticias: 'bg-rose-100 text-rose-700',
  ia: 'bg-violet-100 text-violet-700',
  portal: 'bg-teal-100 text-teal-700',
  general: 'bg-gray-100 text-gray-700',
};

const preguntasSugeridas = [
  '¿Cómo cargo el avance de una obra?',
  '¿Cómo uso el Simulador de Rinde?',
  '¿Para qué sirve la ruta crítica en el Gantt?',
  '¿Qué puede ver el comprador en el portal?',
];

export default function CentroAyuda() {
  const { toast } = useToast();
  const [busqueda, setBusqueda] = useState('');
  const [moduloFiltro, setModuloFiltro] = useState<ModuloSistema | 'todos'>('todos');
  const [articuloAbierto, setArticuloAbierto] = useState<Articulo | null>(null);
  const [articulos, setArticulos] = useState(articulosAyuda);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([
    {
      id: '0',
      rol: 'assistant',
      texto: '¡Hola! Soy el asistente de NATO OBRAS. Podés preguntarme sobre cualquier módulo del sistema — cómo cargar avances, usar el Gantt, el Simulador de Rinde, proveedores, o lo que necesites.',
      timestamp: new Date(),
    },
  ]);
  const [inputChat, setInputChat] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const articulosFiltrados = articulos
    .filter((a) => moduloFiltro === 'todos' || a.modulo === moduloFiltro)
    .filter(
      (a) =>
        !busqueda ||
        a.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        a.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        a.tags.some((t) => t.includes(busqueda.toLowerCase()))
    );

  const enviarMensaje = async (texto?: string) => {
    const msg = texto || inputChat.trim();
    if (!msg || isLoadingChat) return;

    const userMsg: MensajeChat = {
      id: crypto.randomUUID(),
      rol: 'user',
      texto: msg,
      timestamp: new Date(),
    };

    setMensajes((prev) => [...prev, userMsg]);
    setInputChat('');
    setIsLoadingChat(true);

    try {
      const historial = mensajes
        .filter((m) => m.id !== '0')
        .map((m) => ({ role: m.rol === 'user' ? 'user' : 'assistant', content: m.texto }));

      const { data, error } = await supabase.functions.invoke('ai-ayuda', {
        body: {
          messages: [...historial, { role: 'user', content: msg }],
        },
      });

      if (error) throw error;

      const assistantMsg: MensajeChat = {
        id: crypto.randomUUID(),
        rol: 'assistant',
        texto: data?.texto || 'No pude procesar tu pregunta. Intentá de nuevo.',
        timestamp: new Date(),
      };

      setMensajes((prev) => [...prev, assistantMsg]);
    } catch {
      toast({ title: 'Error', description: 'Error al conectar con el asistente. Intentá de nuevo.', variant: 'destructive' });
    } finally {
      setIsLoadingChat(false);
    }
  };

  const marcarUtil = (id: string) => {
    setArticulos((prev) => prev.map((a) => (a.id === id ? { ...a, util: a.util + 1 } : a)));
    toast({ title: '¡Gracias por tu feedback!' });
  };

  const renderSeccion = (s: SeccionArticulo, i: number) => {
    if (s.tipo === 'parrafo')
      return (
        <p key={i} className="text-muted-foreground leading-relaxed">
          {s.contenido as string}
        </p>
      );
    if (s.tipo === 'paso')
      return (
        <div key={i} className="flex gap-3 items-start">
          <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
            {i}
          </div>
          <div>
            {s.titulo && <h4 className="font-semibold text-sm">{s.titulo}</h4>}
            <p className="text-muted-foreground text-sm">{s.contenido as string}</p>
          </div>
        </div>
      );
    if (s.tipo === 'lista')
      return (
        <div key={i} className="space-y-1">
          {s.titulo && <h4 className="font-semibold text-sm">{s.titulo}</h4>}
          <ul className="space-y-1 ml-1">
            {(s.contenido as string[]).map((item, j) => (
              <li key={j} className="text-muted-foreground text-sm flex gap-2">
                <span className="text-primary">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      );
    if (s.tipo === 'tip')
      return (
        <div key={i} className="flex gap-2 bg-green-50 border border-green-200 rounded-xl p-3">
          <Lightbulb className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <p className="text-green-800 text-sm">{s.contenido as string}</p>
        </div>
      );
    if (s.tipo === 'advertencia')
      return (
        <div key={i} className="flex gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-amber-800 text-sm">{s.contenido as string}</p>
        </div>
      );
    return null;
  };

  // ---- Sub-components ----
  const DocColumn = () => (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar artículos, módulos o funciones..."
          className="pl-10 rounded-xl"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Pills de módulo */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {(Object.keys(moduloLabels) as (ModuloSistema | 'todos')[]).map((m) => (
          <button
            key={m}
            onClick={() => setModuloFiltro(m)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors',
              moduloFiltro === m
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
            )}
          >
            {moduloLabels[m]}
          </button>
        ))}
      </div>

      {/* Grid de artículos */}
      <div className="space-y-3">
        {articulosFiltrados.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-8">No se encontraron artículos.</p>
        )}
        {articulosFiltrados.map((articulo) => (
          <Card
            key={articulo.id}
            className="cursor-pointer hover:shadow-md transition-shadow rounded-xl"
            onClick={() => setArticuloAbierto(articulo)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={cn('text-xs', moduloColors[articulo.modulo])}>
                      {moduloLabels[articulo.modulo]}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm">{articulo.titulo}</h3>
                  <p className="text-muted-foreground text-xs line-clamp-1">{articulo.descripcion}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const ChatColumn = () => (
    <Card className="rounded-xl flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)]">
      {/* Header */}
      <CardHeader className="pb-3 border-b shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Asistente NATO OBRAS</h3>
            <p className="text-xs text-muted-foreground">Responde sobre el sistema · siempre disponible</p>
          </div>
        </div>
      </CardHeader>

      {/* Mensajes */}
      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-4">
          {mensajes.map((m) => (
            <div key={m.id} className={cn('flex', m.rol === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-2.5',
                  m.rol === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{m.texto}</p>
                <p className={cn('text-[10px] mt-1', m.rol === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground')}>
                  {m.timestamp.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isLoadingChat && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {/* Preguntas sugeridas */}
          {mensajes.length === 1 && (
            <div className="flex flex-wrap gap-2">
              {preguntasSugeridas.map((q) => (
                <button
                  key={q}
                  onClick={() => enviarMensaje(q)}
                  className="text-xs bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1.5 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t shrink-0">
        <div className="flex gap-2">
          <Input
            placeholder="Escribí tu pregunta..."
            className="rounded-xl flex-1"
            value={inputChat}
            onChange={(e) => setInputChat(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && enviarMensaje()}
            disabled={isLoadingChat}
          />
          <Button
            size="icon"
            className="rounded-xl shrink-0"
            onClick={() => enviarMensaje()}
            disabled={isLoadingChat || !inputChat.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Solo responde preguntas sobre NATO OBRAS
        </p>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <HelpCircle className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Centro de ayuda</h1>
          <p className="text-muted-foreground text-sm">Guías del sistema y asistente IA disponibles 24/7</p>
        </div>
      </div>

      {/* Desktop: two columns */}
      <div className="hidden md:grid md:grid-cols-5 gap-6">
        <div className="col-span-3">
          <DocColumn />
        </div>
        <div className="col-span-2">
          <ChatColumn />
        </div>
      </div>

      {/* Mobile: tabs */}
      <div className="md:hidden">
        <Tabs defaultValue="docs">
          <TabsList className="w-full">
            <TabsTrigger value="docs" className="flex-1 gap-1.5">
              <BookOpen className="h-4 w-4" />
              Documentación
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex-1 gap-1.5">
              <MessageCircle className="h-4 w-4" />
              Chat
            </TabsTrigger>
          </TabsList>
          <TabsContent value="docs">
            <DocColumn />
          </TabsContent>
          <TabsContent value="chat">
            <ChatColumn />
          </TabsContent>
        </Tabs>
      </div>

      {/* Sheet de artículo */}
      <Sheet open={!!articuloAbierto} onOpenChange={(open) => !open && setArticuloAbierto(null)}>
        <SheetContent className="w-full sm:max-w-[480px] flex flex-col overflow-hidden">
          {articuloAbierto && (
            <>
              <SheetHeader className="shrink-0">
                <Badge variant="secondary" className={cn('w-fit text-xs', moduloColors[articuloAbierto.modulo])}>
                  {moduloLabels[articuloAbierto.modulo]}
                </Badge>
                <SheetTitle>{articuloAbierto.titulo}</SheetTitle>
                <SheetDescription>{articuloAbierto.descripcion}</SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto space-y-4 py-4">
                {articuloAbierto.contenido.map((s, i) => renderSeccion(s, i))}
              </div>

              <div className="border-t pt-4 shrink-0 space-y-2">
                <p className="text-sm text-muted-foreground text-center">¿Te fue útil este artículo?</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={() => marcarUtil(articuloAbierto.id)}>
                    <ThumbsUp className="h-4 w-4" /> Sí
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
                    <ThumbsDown className="h-4 w-4" /> No
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

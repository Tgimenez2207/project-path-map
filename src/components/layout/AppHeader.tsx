import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, HelpCircle, LogOut, Check, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

type Notificacion = {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  created_at: string;
  referencia_tipo: string | null;
  referencia_id: string | null;
};

export function AppHeader() {
  const { profile, role, logout, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const { data: notificaciones = [], isLoading } = useQuery({
    queryKey: ['notificaciones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Notificacion[];
    },
    enabled: !!user,
    refetchInterval: 60000,
  });

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('notificaciones-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notificaciones' }, () => {
        queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  const unreadCount = notificaciones.filter(n => !n.leida).length;

  const markAsRead = async (id: string) => {
    await supabase.from('notificaciones').update({ leida: true }).eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
  };

  const markAllRead = async () => {
    const unread = notificaciones.filter(n => !n.leida).map(n => n.id);
    if (unread.length === 0) return;
    for (const id of unread) {
      await supabase.from('notificaciones').update({ leida: true }).eq('id', id);
    }
    queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
  };

  const deleteNotif = async (id: string) => {
    await supabase.from('notificaciones').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
  };

  const triggerCheck = async () => {
    try {
      const { error } = await supabase.functions.invoke('check-alerts');
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
      toast({ title: 'Alertas actualizadas' });
    } catch {
      toast({ title: 'Error al verificar alertas', variant: 'destructive' });
    }
  };

  const tipoIcon: Record<string, string> = {
    vehiculo_vencimiento: '🚗',
    cuota_pendiente: '💰',
    obra_planificacion: '🏗️',
    tarea_vencida: '📋',
  };

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    operaciones: 'Operaciones',
    finanzas: 'Finanzas',
    ventas: 'Ventas',
    cliente: 'Cliente',
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth', { replace: true });
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `hace ${diffMin}min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `hace ${diffH}h`;
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <header className="h-16 border-b border-border/50 bg-card flex items-center justify-between px-4 gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="hover:bg-accent rounded-xl transition-colors" />
        <Badge variant="secondary" className="text-xs">
          {roleLabels[role] || role}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-accent">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="end">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-semibold text-sm">Notificaciones</h3>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={triggerCheck} title="Verificar alertas">
                  <RefreshCw className="h-3 w-3 mr-1" />Verificar
                </Button>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
                    <Check className="h-3 w-3 mr-1" />Leer todas
                  </Button>
                )}
              </div>
            </div>
            <ScrollArea className="max-h-[400px]">
              {notificaciones.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  Sin notificaciones
                </div>
              ) : (
                notificaciones.map(n => (
                  <div
                    key={n.id}
                    className={`p-3 border-b last:border-0 hover:bg-accent/50 transition-colors cursor-pointer ${!n.leida ? 'bg-primary/5' : ''}`}
                    onClick={() => !n.leida && markAsRead(n.id)}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg mt-0.5">{tipoIcon[n.tipo] || '🔔'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm truncate ${!n.leida ? 'font-semibold' : ''}`}>{n.titulo}</p>
                          {!n.leida && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.mensaje}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{formatTime(n.created_at)}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0 opacity-50 hover:opacity-100" onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-accent">
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
        </Button>

        <div className="flex items-center gap-3 pl-3 border-l border-border/50">
          <div className="h-9 w-9 rounded-xl gradient-rappi flex items-center justify-center text-white font-semibold text-sm shadow-sm">
            {profile?.nombre?.charAt(0) || 'U'}
          </div>
          <span className="hidden md:block text-sm font-semibold text-foreground">{profile?.nombre || 'Usuario'}</span>
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-accent" onClick={handleLogout} title="Cerrar sesión">
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </header>
  );
}

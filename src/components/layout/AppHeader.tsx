import { useAuth } from '@/contexts/AuthContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, HelpCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export function AppHeader() {
  const { profile, role, logout } = useAuth();
  const navigate = useNavigate();

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

  return (
    <header className="h-16 border-b border-border/50 bg-card flex items-center justify-between px-4 gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="hover:bg-accent rounded-xl transition-colors" />
        <Badge variant="secondary" className="text-xs">
          {roleLabels[role] || role}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-accent">
          <Bell className="h-5 w-5 text-muted-foreground" />
        </Button>

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

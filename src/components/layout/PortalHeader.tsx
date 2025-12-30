import { useNavigate } from 'react-router-dom';
import { usePortal } from '@/contexts/PortalContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, LogOut, User, ChevronDown } from 'lucide-react';

export function PortalHeader() {
  const { cliente, logout } = usePortal();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/portal/login');
  };

  return (
    <header className="h-16 border-b border-border/50 bg-card flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Badge className="badge-rappi">
          PORTAL CLIENTE
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-accent">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute -top-1 -right-1 h-5 w-5 gradient-rappi text-white text-xs rounded-full flex items-center justify-center font-semibold shadow-sm">
            2
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 rounded-xl hover:bg-accent">
              <div className="h-9 w-9 rounded-xl gradient-rappi flex items-center justify-center text-white font-semibold shadow-sm">
                {cliente?.nombre?.charAt(0) || 'U'}
              </div>
              <span className="hidden md:block text-sm font-semibold text-foreground">
                {cliente?.nombre?.split(' ')[0]}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuItem className="flex items-center gap-2 rounded-lg">
              <User className="h-4 w-4" />
              Mi Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 text-destructive rounded-lg"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

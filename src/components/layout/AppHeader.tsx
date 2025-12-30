import { useAuth } from '@/contexts/AuthContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserRole } from '@/types';

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  operaciones: 'Operaciones',
  finanzas: 'Finanzas',
  ventas: 'Ventas',
  cliente: 'Cliente',
};

export function AppHeader() {
  const { user, role, switchRole } = useAuth();

  return (
    <header className="h-16 border-b border-border/50 bg-card flex items-center justify-between px-4 gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="hover:bg-accent rounded-xl transition-colors" />
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <Badge className="badge-rappi">
            MODO DEMO
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Role Selector for Demo */}
        <Select value={role} onValueChange={(value) => switchRole(value as UserRole)}>
          <SelectTrigger className="w-[160px] h-10 rounded-xl border-2 border-border focus:border-primary">
            <SelectValue placeholder="Seleccionar rol" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {Object.entries(roleLabels).map(([key, label]) => (
              <SelectItem key={key} value={key} className="rounded-lg">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-accent">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute -top-1 -right-1 h-5 w-5 gradient-rappi text-white text-xs rounded-full flex items-center justify-center font-semibold shadow-sm">
            3
          </span>
        </Button>

        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-accent">
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
        </Button>

        <div className="flex items-center gap-3 pl-3 border-l border-border/50">
          <div className="h-9 w-9 rounded-xl gradient-rappi flex items-center justify-center text-white font-semibold text-sm shadow-sm">
            {user?.nombre?.charAt(0) || 'U'}
          </div>
          <span className="hidden md:block text-sm font-semibold text-foreground">{user?.nombre}</span>
        </div>
      </div>
    </header>
  );
}

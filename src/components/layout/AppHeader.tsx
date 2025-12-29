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
    <header className="h-14 border-b bg-card flex items-center justify-between px-4 gap-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            MODO DEMO
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Role Selector for Demo */}
        <Select value={role} onValueChange={(value) => switchRole(value as UserRole)}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Seleccionar rol" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(roleLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </Button>

        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2 pl-2 border-l">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
            {user?.nombre?.charAt(0) || 'U'}
          </div>
          <span className="hidden md:block text-sm font-medium">{user?.nombre}</span>
        </div>
      </div>
    </header>
  );
}

import { NavLink, useLocation } from 'react-router-dom';
import { usePortal } from '@/contexts/PortalContext';
import {
  LayoutDashboard,
  Home,
  CreditCard,
  FileText,
  Camera,
  HardHat,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { title: 'Inicio', url: '/portal', icon: LayoutDashboard },
  { title: 'Mis Unidades', url: '/portal/unidades', icon: Home },
  { title: 'Pagos', url: '/portal/pagos', icon: CreditCard },
  { title: 'Documentos', url: '/portal/documentos', icon: FileText },
  { title: 'Avance de Obra', url: '/portal/avance', icon: Camera },
];

export function PortalSidebar() {
  const { cliente } = usePortal();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/portal') return location.pathname === '/portal';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-card border-r flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <HardHat className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Portal Cliente</h1>
            <p className="text-xs text-muted-foreground">SGO</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b bg-muted/30">
        <p className="text-sm font-medium">{cliente?.nombre}</p>
        <p className="text-xs text-muted-foreground">{cliente?.email}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.title}>
              <NavLink
                to={item.url}
                end={item.url === '/portal'}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  isActive(item.url)
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          Portal del Cliente v1.0
        </p>
      </div>
    </aside>
  );
}

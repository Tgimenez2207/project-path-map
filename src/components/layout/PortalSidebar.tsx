import { NavLink, useLocation } from 'react-router-dom';
import { usePortal } from '@/contexts/PortalContext';
import {
  LayoutDashboard,
  Home,
  CreditCard,
  FileText,
  Camera,
  HardHat,
  Palette,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { title: 'Inicio', url: '/portal', icon: LayoutDashboard },
  { title: 'Mis Unidades', url: '/portal/unidades', icon: Home },
  { title: 'Pagos', url: '/portal/pagos', icon: CreditCard },
  { title: 'Documentos', url: '/portal/documentos', icon: FileText },
  { title: 'Avance de Obra', url: '/portal/avance', icon: Camera },
  { title: 'Terminaciones', url: '/portal/terminaciones', icon: Palette },
];

export function PortalSidebar() {
  const { cliente } = usePortal();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/portal') return location.pathname === '/portal';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-card border-r border-border/50 flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl gradient-rappi flex items-center justify-center shadow-md">
            <HardHat className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-foreground">Portal Cliente</h1>
            <p className="text-xs text-muted-foreground">Nato Obras</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-border/50 bg-accent/30">
        <p className="text-sm font-semibold text-foreground">{cliente?.nombre}</p>
        <p className="text-xs text-muted-foreground">{cliente?.email}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.title}>
              <NavLink
                to={item.url}
                end={item.url === '/portal'}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
                  isActive(item.url)
                    ? 'gradient-rappi text-white font-semibold shadow-md'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5",
                  isActive(item.url) ? "text-white" : "text-muted-foreground/70"
                )} />
                <span>{item.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          Nato Obras • Portal v1.0
        </p>
      </div>
    </aside>
  );
}

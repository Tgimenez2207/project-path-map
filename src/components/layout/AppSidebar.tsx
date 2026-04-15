import { NavLink, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  Truck,
  Package,
  Wrench,
  Car,
  Calendar,
  StickyNote,
  Settings,
  HardHat,
  ExternalLink,
  Sparkles,
  Calculator,
  Newspaper,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard, module: 'dashboard' },
  { title: 'Obras', url: '/obras', icon: Building2, module: 'obras' },
  { title: 'Presupuestos', url: '/presupuestos', icon: FileText, module: 'presupuestos' },
  { title: 'Clientes', url: '/clientes', icon: Users, module: 'clientes' },
  { title: 'Proveedores', url: '/proveedores', icon: Truck, module: 'proveedores' },
  { title: 'Stock', url: '/stock', icon: Package, module: 'stock' },
  { title: 'Herramientas', url: '/herramientas', icon: Wrench, module: 'herramientas' },
  { title: 'Flota', url: '/flota', icon: Car, module: 'flota' },
  { title: 'Asistente IA', url: '/ia', icon: Sparkles, module: 'ia' },
  { title: 'Simulador de Rinde', url: '/simulador', icon: Calculator, module: 'simulador' },
  { title: 'Noticias del sector', url: '/noticias', icon: Newspaper, module: 'noticias' },
];

const extraItems = [
  { title: 'Calendario', url: '/calendario', icon: Calendar, module: 'calendario' },
  { title: 'Notas', url: '/notas', icon: StickyNote, module: 'notas' },
];

const adminItems = [
  { title: 'Usuarios', url: '/usuarios', icon: Users, module: 'usuarios' },
  { title: 'Configuración', url: '/configuracion', icon: Settings, module: 'configuracion' },
];

export function AppSidebar() {
  const { canAccess, role } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const filterByAccess = (items: typeof menuItems) =>
    items.filter((item) => canAccess(item.module));

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl gradient-rappi flex items-center justify-center shadow-md">
            <HardHat className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sidebar-foreground">Nato Obras</h1>
            <p className="text-xs text-sidebar-foreground/60">Gestión de Obras</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider px-2 mb-2">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {filterByAccess(menuItems).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200',
                        isActive(item.url) && 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                      )}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 transition-colors",
                        isActive(item.url) ? "text-primary" : "text-sidebar-foreground/50"
                      )} />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider px-2 mb-2">
            Adicionales
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {filterByAccess(extraItems).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200',
                        isActive(item.url) && 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                      )}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 transition-colors",
                        isActive(item.url) ? "text-primary" : "text-sidebar-foreground/50"
                      )} />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {role === 'admin' && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider px-2 mb-2">
              Administración
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200',
                          isActive(item.url) && 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                        )}
                      >
                        <item.icon className={cn(
                          "h-5 w-5 transition-colors",
                          isActive(item.url) ? "text-primary" : "text-sidebar-foreground/50"
                        )} />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border space-y-3">
        <Button
          asChild
          className="w-full justify-start gap-2 rounded-xl btn-rappi gradient-rappi text-white border-0 hover:opacity-90"
        >
          <Link to="/portal/login" target="_blank">
            <ExternalLink className="h-4 w-4" />
            Portal del Cliente
          </Link>
        </Button>
        <p className="text-xs text-sidebar-foreground/50 text-center">
          Nato Obras v1.0 • Prototipo Demo
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}

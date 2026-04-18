import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Wrench, FileText, Calendar, Sparkles, Users, ChevronRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getRubroLabel } from '@/types/gremios';
import { GremiosProvider, useGremios } from '@/contexts/GremiosContext';

function saludar(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

const NAV_ITEMS = [
  { path: '/portal/gremios', label: 'Inicio', icon: Home, exact: true },
  { path: '/portal/gremios/trabajos', label: 'Trabajos', icon: Wrench },
  { path: '/portal/gremios/presupuestos', label: 'Presupuestos', icon: FileText },
  { path: '/portal/gremios/clientes', label: 'Clientes', icon: Users },
  { path: '/portal/gremios/agenda', label: 'Agenda', icon: Calendar },
  { path: '/portal/gremios/asistente', label: 'Asistente IA', icon: Sparkles },
];

export default function GremiosLayout() {
  return (
    <GremiosProvider>
      <GremiosLayoutInner />
    </GremiosProvider>
  );
}

function GremiosLayoutInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { perfil } = useGremios();

  const isActive = (item: (typeof NAV_ITEMS)[number]) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  const perfilActivo = location.pathname.startsWith('/portal/gremios/perfil');

  return (
    <GremiosProvider>
    <div className="min-h-screen bg-muted/30 xl:flex">
      {/* Sidebar desktop (xl+) */}
      <aside className="hidden xl:flex flex-col w-64 shrink-0 bg-background border-r min-h-screen sticky top-0 h-screen">
        <div className="px-6 py-5 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">NATO Gremios</p>
              <p className="text-[10px] text-muted-foreground">Tu herramienta de trabajo</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
              {mockPerfilGremio.nombre.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{mockPerfilGremio.nombre}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {getRubroLabel(mockPerfilGremio.rubro)}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile container */}
      <div className="xl:hidden min-h-screen flex flex-col bg-background max-w-md mx-auto border-x">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{saludar()} 👋</p>
            <h1 className="text-base font-semibold truncate">{mockPerfilGremio.nombre}</h1>
            <p className="text-xs text-muted-foreground truncate">
              {getRubroLabel(mockPerfilGremio.rubro)} · {mockPerfilGremio.ciudad}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => navigate('/portal/gremios/asistente')}
            aria-label="Asistente IA"
          >
            <Sparkles className="h-5 w-5 text-primary" />
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto pb-24">
          <Outlet />
        </main>

        <nav
          className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-background/95 backdrop-blur border-t z-40"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs transition-colors ${
                    active ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label === 'Asistente IA' ? 'Asistente' : item.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Desktop main (xl+) */}
      <div className="hidden xl:flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{saludar()} 👋</p>
            <h1 className="text-2xl font-bold">{mockPerfilGremio.nombre.split(' ')[0]}</h1>
          </div>
          <Button onClick={() => navigate('/portal/gremios/asistente')} variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Consultá la IA
          </Button>
        </header>
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
    </GremiosProvider>
  );
}

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Wrench, FileText, Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockPerfilGremio } from '@/data/mockGremios';
import { getRubroLabel } from '@/types/gremios';

function saludar(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function GremiosLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/portal/gremios', label: 'Inicio', icon: Home, exact: true },
    { path: '/portal/gremios/trabajos', label: 'Trabajos', icon: Wrench },
    { path: '/portal/gremios/presupuestos', label: 'Presupuestos', icon: FileText },
    { path: '/portal/gremios/agenda', label: 'Agenda', icon: Calendar },
    { path: '/portal/gremios/asistente', label: 'Asistente', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background max-w-md mx-auto border-x">
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
          {navItems.map((item) => {
            const active = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs transition-colors ${
                  active ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

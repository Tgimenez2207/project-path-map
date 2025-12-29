import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { PortalLayout } from "@/components/layout/PortalLayout";
import Dashboard from "@/pages/Dashboard";
import Obras from "@/pages/Obras";
import ObraDetalle from "@/pages/ObraDetalle";
import Unidades from "@/pages/Unidades";
import UnidadDetalle from "@/pages/UnidadDetalle";
import AvanceObra from "@/pages/AvanceObra";
import Presupuestos from "@/pages/Presupuestos";
import Clientes from "@/pages/Clientes";
import Proveedores from "@/pages/Proveedores";
import Stock from "@/pages/Stock";
import Herramientas from "@/pages/Herramientas";
import Flota from "@/pages/Flota";
import Calendario from "@/pages/Calendario";
import Notas from "@/pages/Notas";
import Usuarios from "@/pages/Usuarios";
import PortalLogin from "@/pages/portal/PortalLogin";
import PortalDashboard from "@/pages/portal/PortalDashboard";
import PortalUnidades from "@/pages/portal/PortalUnidades";
import PortalPagos from "@/pages/portal/PortalPagos";
import PortalDocumentos from "@/pages/portal/PortalDocumentos";
import PortalAvance from "@/pages/portal/PortalAvance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Admin/Internal Routes */}
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="obras" element={<Obras />} />
              <Route path="obras/:obraId" element={<ObraDetalle />} />
              <Route path="obras/:obraId/unidades" element={<Unidades />} />
              <Route path="obras/:obraId/unidades/:unidadId" element={<UnidadDetalle />} />
              <Route path="obras/:obraId/avance" element={<AvanceObra />} />
              <Route path="presupuestos" element={<Presupuestos />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="proveedores" element={<Proveedores />} />
              <Route path="stock" element={<Stock />} />
              <Route path="herramientas" element={<Herramientas />} />
              <Route path="flota" element={<Flota />} />
              <Route path="calendario" element={<Calendario />} />
              <Route path="notas" element={<Notas />} />
              <Route path="usuarios" element={<Usuarios />} />
            </Route>

            {/* Portal del Cliente Routes */}
            <Route path="/portal/login" element={<PortalLogin />} />
            <Route path="/portal" element={<PortalLayout />}>
              <Route index element={<PortalDashboard />} />
              <Route path="unidades" element={<PortalUnidades />} />
              <Route path="pagos" element={<PortalPagos />} />
              <Route path="documentos" element={<PortalDocumentos />} />
              <Route path="avance" element={<PortalAvance />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

import { Outlet, Navigate } from 'react-router-dom';
import { PortalProvider, usePortal } from '@/contexts/PortalContext';
import { PortalSidebar } from './PortalSidebar';
import { PortalHeader } from './PortalHeader';

function PortalLayoutContent() {
  const { isAuthenticated } = usePortal();

  if (!isAuthenticated) {
    return <Navigate to="/portal/login" replace />;
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <PortalSidebar />
      <div className="flex-1 flex flex-col">
        <PortalHeader />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PortalLayout() {
  return (
    <PortalProvider>
      <PortalLayoutContent />
    </PortalProvider>
  );
}

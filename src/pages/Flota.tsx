import { Car } from 'lucide-react';

export default function Flota() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-semibold">Flota</h1>
      <p className="text-muted-foreground">Gestión de vehículos y mantenimientos</p>
      <div className="empty-state">
        <Car className="empty-state-icon" />
        <h3 className="empty-state-title">Próximamente</h3>
        <p className="empty-state-description">Este módulo está en desarrollo.</p>
      </div>
    </div>
  );
}

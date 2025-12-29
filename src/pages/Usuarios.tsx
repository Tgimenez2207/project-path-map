import { Users } from 'lucide-react';

export default function Usuarios() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-semibold">Usuarios</h1>
      <p className="text-muted-foreground">Gestión de usuarios y permisos</p>
      <div className="empty-state">
        <Users className="empty-state-icon" />
        <h3 className="empty-state-title">Próximamente</h3>
        <p className="empty-state-description">Este módulo está en desarrollo.</p>
      </div>
    </div>
  );
}

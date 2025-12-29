import { Calendar as CalendarIcon } from 'lucide-react';

export default function Calendario() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-semibold">Calendario</h1>
      <p className="text-muted-foreground">Agenda y eventos</p>
      <div className="empty-state">
        <CalendarIcon className="empty-state-icon" />
        <h3 className="empty-state-title">Próximamente</h3>
        <p className="empty-state-description">Este módulo está en desarrollo.</p>
      </div>
    </div>
  );
}

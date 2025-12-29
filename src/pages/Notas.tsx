import { StickyNote } from 'lucide-react';

export default function Notas() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-semibold">Notas</h1>
      <p className="text-muted-foreground">Notas y recordatorios</p>
      <div className="empty-state">
        <StickyNote className="empty-state-icon" />
        <h3 className="empty-state-title">Próximamente</h3>
        <p className="empty-state-description">Este módulo está en desarrollo.</p>
      </div>
    </div>
  );
}

import { Package } from 'lucide-react';

export default function Stock() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-semibold">Stock</h1>
      <p className="text-muted-foreground">Control de inventario y depósitos</p>
      <div className="empty-state">
        <Package className="empty-state-icon" />
        <h3 className="empty-state-title">Próximamente</h3>
        <p className="empty-state-description">Este módulo está en desarrollo.</p>
      </div>
    </div>
  );
}

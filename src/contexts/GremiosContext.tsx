import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { mockTrabajos, mockPresupuestos, mockTurnos, mockPerfilGremio } from '@/data/mockGremios';
import type { TrabajoGremio, PresupuestoGremio, TurnoAgenda, EntradaBitacora, PerfilGremio } from '@/types/gremios';

const PERFIL_STORAGE_KEY = 'gremios_perfil';

interface GremiosContextValue {
  perfil: PerfilGremio;
  actualizarPerfil: (patch: Partial<PerfilGremio>) => void;
  trabajos: TrabajoGremio[];
  setTrabajos: React.Dispatch<React.SetStateAction<TrabajoGremio[]>>;
  presupuestos: PresupuestoGremio[];
  setPresupuestos: React.Dispatch<React.SetStateAction<PresupuestoGremio[]>>;
  turnos: TurnoAgenda[];
  setTurnos: React.Dispatch<React.SetStateAction<TurnoAgenda[]>>;
  actualizarTurno: (id: string, patch: Partial<TurnoAgenda>) => void;
  eliminarTurno: (id: string) => void;
  // helpers
  agregarEntradaBitacora: (trabajoId: string, entrada: EntradaBitacora) => void;
  actualizarTrabajo: (id: string, patch: Partial<TrabajoGremio>) => void;
  eliminarTrabajo: (id: string) => void;
  agregarTrabajo: (t: TrabajoGremio) => void;
  agregarPresupuesto: (p: PresupuestoGremio) => void;
  actualizarPresupuesto: (id: string, patch: Partial<PresupuestoGremio>) => void;
  eliminarPresupuesto: (id: string) => void;
  duplicarPresupuesto: (id: string) => void;
  convertirEnTrabajo: (presupuestoId: string) => string | null;
  // derived
  clientesAgrupados: Array<{
    cliente: string;
    trabajos: TrabajoGremio[];
    presupuestos: PresupuestoGremio[];
    totalCobrado: number;
    totalPendiente: number;
  }>;
}

const Ctx = createContext<GremiosContextValue | null>(null);

export function GremiosProvider({ children }: { children: ReactNode }) {
  const [trabajos, setTrabajos] = useState<TrabajoGremio[]>(mockTrabajos);
  const [presupuestos, setPresupuestos] = useState<PresupuestoGremio[]>(mockPresupuestos);
  const [turnos, setTurnos] = useState<TurnoAgenda[]>(mockTurnos);
  const [perfil, setPerfil] = useState<PerfilGremio>(() => {
    if (typeof window === 'undefined') return mockPerfilGremio;
    try {
      const raw = localStorage.getItem(PERFIL_STORAGE_KEY);
      return raw ? { ...mockPerfilGremio, ...JSON.parse(raw) } : mockPerfilGremio;
    } catch {
      return mockPerfilGremio;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(PERFIL_STORAGE_KEY, JSON.stringify(perfil)); } catch { /* noop */ }
  }, [perfil]);

  const actualizarPerfil = (patch: Partial<PerfilGremio>) => {
    setPerfil((prev) => ({ ...prev, ...patch }));
  };

  const actualizarTurno = (id: string, patch: Partial<TurnoAgenda>) => {
    setTurnos((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const eliminarTurno = (id: string) => {
    setTurnos((prev) => prev.filter((t) => t.id !== id));
  };

  const agregarEntradaBitacora = (trabajoId: string, entrada: EntradaBitacora) => {
    setTrabajos((prev) =>
      prev.map((t) => (t.id === trabajoId ? { ...t, bitacora: [...(t.bitacora ?? []), entrada] } : t)),
    );
  };

  const actualizarTrabajo = (id: string, patch: Partial<TrabajoGremio>) => {
    setTrabajos((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const eliminarTrabajo = (id: string) => {
    setTrabajos((prev) => prev.filter((t) => t.id !== id));
  };

  const agregarTrabajo = (t: TrabajoGremio) => setTrabajos((prev) => [t, ...prev]);

  const agregarPresupuesto = (p: PresupuestoGremio) => setPresupuestos((prev) => [p, ...prev]);

  const actualizarPresupuesto = (id: string, patch: Partial<PresupuestoGremio>) => {
    setPresupuestos((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const eliminarPresupuesto = (id: string) => {
    setPresupuestos((prev) => prev.filter((p) => p.id !== id));
  };

  const duplicarPresupuesto = (id: string) => {
    setPresupuestos((prev) => {
      const orig = prev.find((p) => p.id === id);
      if (!orig) return prev;
      const copia: PresupuestoGremio = {
        ...orig,
        id: crypto.randomUUID(),
        estado: 'borrador',
        fechaEmision: new Date().toISOString().slice(0, 10),
      };
      return [copia, ...prev];
    });
  };

  const convertirEnTrabajo = (presupuestoId: string): string | null => {
    const p = presupuestos.find((x) => x.id === presupuestoId);
    if (!p) return null;
    const nuevo: TrabajoGremio = {
      id: crypto.randomUUID(),
      descripcion: p.descripcionTrabajo,
      cliente: p.cliente,
      direccion: '',
      fecha: new Date().toISOString().slice(0, 10),
      monto: p.montoTotal,
      estadoCobro: 'pendiente',
      estadoTrabajo: 'en_curso',
      presupuestoId: p.id,
    };
    agregarTrabajo(nuevo);
    actualizarPresupuesto(presupuestoId, { estado: 'aceptado' });
    return nuevo.id;
  };

  const clientesAgrupados = useMemo(() => {
    const map = new Map<string, { trabajos: TrabajoGremio[]; presupuestos: PresupuestoGremio[] }>();
    trabajos.forEach((t) => {
      const k = t.cliente.trim();
      if (!map.has(k)) map.set(k, { trabajos: [], presupuestos: [] });
      map.get(k)!.trabajos.push(t);
    });
    presupuestos.forEach((p) => {
      const k = p.cliente.trim();
      if (!map.has(k)) map.set(k, { trabajos: [], presupuestos: [] });
      map.get(k)!.presupuestos.push(p);
    });
    return Array.from(map.entries())
      .map(([cliente, v]) => ({
        cliente,
        trabajos: v.trabajos,
        presupuestos: v.presupuestos,
        totalCobrado: v.trabajos.filter((t) => t.estadoCobro === 'cobrado').reduce((a, t) => a + t.monto, 0),
        totalPendiente: v.trabajos
          .filter((t) => t.estadoCobro === 'pendiente' || t.estadoCobro === 'vencido')
          .reduce((a, t) => a + t.monto, 0),
      }))
      .sort((a, b) => b.totalCobrado + b.totalPendiente - (a.totalCobrado + a.totalPendiente));
  }, [trabajos, presupuestos]);

  const value: GremiosContextValue = {
    perfil,
    actualizarPerfil,
    trabajos,
    setTrabajos,
    presupuestos,
    setPresupuestos,
    turnos,
    setTurnos,
    actualizarTurno,
    eliminarTurno,
    agregarEntradaBitacora,
    actualizarTrabajo,
    eliminarTrabajo,
    agregarTrabajo,
    agregarPresupuesto,
    actualizarPresupuesto,
    eliminarPresupuesto,
    duplicarPresupuesto,
    convertirEnTrabajo,
    clientesAgrupados,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGremios() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useGremios fuera de GremiosProvider');
  return v;
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useObras() {
  return useQuery({
    queryKey: ['obras'],
    queryFn: async () => {
      const { data, error } = await supabase.from('obras').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useObra(id: string | undefined) {
  return useQuery({
    queryKey: ['obras', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('obras').select('*').eq('id', id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useEtapas(obraId: string | undefined) {
  return useQuery({
    queryKey: ['etapas', obraId],
    queryFn: async () => {
      const { data, error } = await supabase.from('etapas').select('*').eq('obra_id', obraId!).order('orden');
      if (error) throw error;
      return data;
    },
    enabled: !!obraId,
  });
}

export function useTareas(obraId: string | undefined) {
  return useQuery({
    queryKey: ['tareas', obraId],
    queryFn: async () => {
      const { data, error } = await supabase.from('tareas').select('*').eq('obra_id', obraId!);
      if (error) throw error;
      return data;
    },
    enabled: !!obraId,
  });
}

export function useBitacora(obraId: string | undefined) {
  return useQuery({
    queryKey: ['bitacora', obraId],
    queryFn: async () => {
      const { data, error } = await supabase.from('bitacora').select('*').eq('obra_id', obraId!).order('fecha', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!obraId,
  });
}

export function useUnidades(obraId?: string) {
  return useQuery({
    queryKey: ['unidades', obraId],
    queryFn: async () => {
      let q = supabase.from('unidades').select('*');
      if (obraId) q = q.eq('obra_id', obraId);
      const { data, error } = await q.order('codigo');
      if (error) throw error;
      return data;
    },
  });
}

export function useUnidad(id: string | undefined) {
  return useQuery({
    queryKey: ['unidades', 'detail', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('unidades').select('*').eq('id', id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useClientes() {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('clientes').select('*').order('nombre');
      if (error) throw error;
      return data;
    },
  });
}

export function useProveedores() {
  return useQuery({
    queryKey: ['proveedores'],
    queryFn: async () => {
      const { data, error } = await supabase.from('proveedores').select('*').order('razon_social');
      if (error) throw error;
      return data;
    },
  });
}

export function usePresupuestos() {
  return useQuery({
    queryKey: ['presupuestos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('presupuestos').select('*, proveedores(razon_social), obras(nombre)').order('fecha_creacion', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useProductos() {
  return useQuery({
    queryKey: ['productos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('productos').select('*').order('nombre');
      if (error) throw error;
      return data;
    },
  });
}

export function useStockItems() {
  return useQuery({
    queryKey: ['stock_items'],
    queryFn: async () => {
      const { data, error } = await supabase.from('stock_items').select('*, productos(*), depositos(*)');
      if (error) throw error;
      return data;
    },
  });
}

export function useDepositos() {
  return useQuery({
    queryKey: ['depositos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('depositos').select('*');
      if (error) throw error;
      return data;
    },
  });
}

export function useVehiculos() {
  return useQuery({
    queryKey: ['vehiculos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehiculos').select('*').order('patente');
      if (error) throw error;
      return data;
    },
  });
}

export function useMantenimientos(vehiculoId?: string) {
  return useQuery({
    queryKey: ['mantenimientos', vehiculoId],
    queryFn: async () => {
      let q = supabase.from('mantenimientos').select('*');
      if (vehiculoId) q = q.eq('vehiculo_id', vehiculoId);
      const { data, error } = await q.order('fecha', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useHerramientas() {
  return useQuery({
    queryKey: ['herramientas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('herramientas').select('*').order('codigo');
      if (error) throw error;
      return data;
    },
  });
}

export function useComplementos(unidadId?: string) {
  return useQuery({
    queryKey: ['complementos', unidadId],
    queryFn: async () => {
      let q = supabase.from('complementos').select('*');
      if (unidadId) q = q.eq('unidad_id', unidadId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useCompradores(unidadId?: string) {
  return useQuery({
    queryKey: ['compradores', unidadId],
    queryFn: async () => {
      let q = supabase.from('compradores').select('*, clientes(*)');
      if (unidadId) q = q.eq('unidad_id', unidadId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

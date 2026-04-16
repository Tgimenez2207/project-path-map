import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PortalCliente {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  documento: string;
  direccion: string | null;
}

interface PortalContextType {
  cliente: PortalCliente | null;
  isAuthenticated: boolean;
  login: (clienteId: string) => Promise<boolean>;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export function PortalProvider({ children }: { children: ReactNode }) {
  const [cliente, setCliente] = useState<PortalCliente | null>(null);

  const login = useCallback(async (clienteId: string): Promise<boolean> => {
    const { data, error } = await supabase.from('clientes').select('id, nombre, email, telefono, documento, direccion').eq('id', clienteId).single();
    if (error || !data) return false;
    setCliente(data);
    return true;
  }, []);

  const loginWithEmail = useCallback(async (email: string, _password: string): Promise<boolean> => {
    const { data, error } = await supabase.from('clientes').select('id, nombre, email, telefono, documento, direccion').eq('email', email).single();
    if (error || !data) return false;
    setCliente(data);
    return true;
  }, []);

  const logout = useCallback(() => {
    setCliente(null);
  }, []);

  return (
    <PortalContext.Provider
      value={{
        cliente,
        isAuthenticated: !!cliente,
        login,
        loginWithEmail,
        logout,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (context === undefined) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Cliente } from '@/types';
import { mockClientes } from '@/data/mockClientes';

interface PortalContextType {
  cliente: Cliente | null;
  isAuthenticated: boolean;
  login: (clienteId: string) => boolean;
  loginWithEmail: (email: string, password: string) => boolean;
  logout: () => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

// Clientes con acceso al portal (simulado)
const clientesConAcceso = [
  { clienteId: 'cliente-001', email: 'jcperez@email.com', password: 'demo123' },
  { clienteId: 'cliente-003', email: 'rsilva@email.com', password: 'demo123' },
];

export function PortalProvider({ children }: { children: ReactNode }) {
  const [cliente, setCliente] = useState<Cliente | null>(null);

  const login = useCallback((clienteId: string): boolean => {
    const foundCliente = mockClientes.find((c) => c.id === clienteId);
    if (foundCliente) {
      setCliente(foundCliente);
      return true;
    }
    return false;
  }, []);

  const loginWithEmail = useCallback((email: string, password: string): boolean => {
    const acceso = clientesConAcceso.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (acceso) {
      const foundCliente = mockClientes.find((c) => c.id === acceso.clienteId);
      if (foundCliente) {
        setCliente(foundCliente);
        return true;
      }
    }
    return false;
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

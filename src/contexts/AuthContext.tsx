import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { mockUsers } from '@/data/mockUsers';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (userId: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: string) => boolean;
  canAccess: (module: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Definición de permisos por rol
const rolePermissions: Record<UserRole, string[]> = {
  admin: ['*'], // Acceso total
  operaciones: [
    'obras.ver', 'obras.editar',
    'tareas.ver', 'tareas.editar',
    'bitacora.ver', 'bitacora.editar',
    'documentos.ver', 'documentos.editar',
    'stock.ver',
    'herramientas.ver', 'herramientas.editar',
    'flota.ver',
  ],
  finanzas: [
    'obras.ver',
    'cobros.ver', 'cobros.editar',
    'cuotas.ver', 'cuotas.editar',
    'cuentas.ver', 'cuentas.editar',
    'reportes.ver',
    'presupuestos.ver', 'presupuestos.editar',
    'proveedores.ver',
  ],
  ventas: [
    'obras.ver',
    'unidades.ver', 'unidades.editar',
    'compradores.ver', 'compradores.editar',
    'clientes.ver', 'clientes.editar',
    'reservas.ver', 'reservas.editar',
  ],
  cliente: [
    'portal.ver',
    'mis_unidades.ver',
    'mis_pagos.ver',
    'mis_documentos.ver',
    'avance_obra.ver',
  ],
};

// Definición de acceso a módulos por rol
const moduleAccess: Record<UserRole, string[]> = {
  admin: ['*'],
  operaciones: [
    'dashboard', 'obras', 'tareas', 'bitacora', 'documentos',
    'stock', 'herramientas', 'flota', 'calendario', 'notas', 'ia',
  ],
  finanzas: [
    'dashboard', 'obras', 'presupuestos', 'clientes', 'proveedores',
    'cobros', 'reportes', 'calendario', 'notas', 'ia',
  ],
  ventas: [
    'dashboard', 'obras', 'unidades', 'clientes', 'reservas',
    'calendario', 'notas', 'ia',
  ],
  cliente: ['portal'],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Por defecto, iniciar como admin para demo
    return mockUsers.find(u => u.rol === 'admin') || null;
  });

  const role = user?.rol || 'cliente';

  const login = useCallback((userId: string) => {
    const foundUser = mockUsers.find(u => u.id === userId);
    if (foundUser) {
      setUser(foundUser);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const switchRole = useCallback((newRole: UserRole) => {
    const userWithRole = mockUsers.find(u => u.rol === newRole);
    if (userWithRole) {
      setUser(userWithRole);
    }
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    const permissions = rolePermissions[role];
    if (permissions.includes('*')) return true;
    return permissions.includes(permission);
  }, [role]);

  const canAccess = useCallback((module: string): boolean => {
    const modules = moduleAccess[role];
    if (modules.includes('*')) return true;
    return modules.includes(module);
  }, [role]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
        hasPermission,
        canAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

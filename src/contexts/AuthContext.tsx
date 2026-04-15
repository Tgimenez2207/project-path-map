import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupaUser, Session } from '@supabase/supabase-js';

export type AppRole = 'admin' | 'operaciones' | 'finanzas' | 'ventas' | 'cliente';

export interface UserProfile {
  id: string;
  user_id: string;
  nombre: string;
  email: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: SupaUser | null;
  profile: UserProfile | null;
  role: AppRole;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, password: string, nombre: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  hasPermission: (permission: string) => boolean;
  canAccess: (module: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Definición de permisos por rol
const rolePermissions: Record<AppRole, string[]> = {
  admin: ['*'],
  operaciones: [
    'obras.ver', 'obras.editar', 'tareas.ver', 'tareas.editar',
    'bitacora.ver', 'bitacora.editar', 'documentos.ver', 'documentos.editar',
    'stock.ver', 'herramientas.ver', 'herramientas.editar', 'flota.ver',
  ],
  finanzas: [
    'obras.ver', 'cobros.ver', 'cobros.editar', 'cuotas.ver', 'cuotas.editar',
    'cuentas.ver', 'cuentas.editar', 'reportes.ver',
    'presupuestos.ver', 'presupuestos.editar', 'proveedores.ver',
  ],
  ventas: [
    'obras.ver', 'unidades.ver', 'unidades.editar',
    'compradores.ver', 'compradores.editar', 'clientes.ver', 'clientes.editar',
    'reservas.ver', 'reservas.editar',
  ],
  cliente: [
    'portal.ver', 'mis_unidades.ver', 'mis_pagos.ver', 'mis_documentos.ver', 'avance_obra.ver',
  ],
};

const moduleAccess: Record<AppRole, string[]> = {
  admin: ['*'],
  operaciones: ['dashboard', 'obras', 'tareas', 'bitacora', 'documentos', 'stock', 'herramientas', 'flota', 'calendario', 'notas', 'ia'],
  finanzas: ['dashboard', 'obras', 'presupuestos', 'clientes', 'proveedores', 'cobros', 'reportes', 'calendario', 'notas', 'ia'],
  ventas: ['dashboard', 'obras', 'unidades', 'clientes', 'reservas', 'calendario', 'notas', 'ia'],
  cliente: ['portal'],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupaUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<AppRole>('cliente');
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfileAndRole = useCallback(async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileData) {
        setProfile(profileData as UserProfile);
      }

      // Fetch role using the security definer function
      const { data: roleData } = await supabase
        .rpc('get_user_role', { _user_id: userId });

      if (roleData) {
        setRole(roleData as AppRole);
      } else {
        setRole('operaciones'); // default
      }
    } catch (e) {
      console.error('Error fetching profile/role:', e);
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          // Use setTimeout to avoid potential deadlock with Supabase client
          setTimeout(() => fetchProfileAndRole(newSession.user.id), 0);
        } else {
          setProfile(null);
          setRole('cliente');
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      if (existingSession?.user) {
        fetchProfileAndRole(existingSession.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfileAndRole]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signup = useCallback(async (email: string, password: string, nombre: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole('cliente');
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    const perms = rolePermissions[role];
    if (perms.includes('*')) return true;
    return perms.includes(permission);
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
        profile,
        role,
        session,
        isAuthenticated: !!session,
        isLoading,
        login,
        signup,
        logout,
        resetPassword,
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

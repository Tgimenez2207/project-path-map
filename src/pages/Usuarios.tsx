import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Users, Search, Shield, Loader2, UserCog } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const roleLabels: Record<AppRole, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  admin: { label: 'Administrador', variant: 'destructive' },
  operaciones: { label: 'Operaciones', variant: 'default' },
  finanzas: { label: 'Finanzas', variant: 'secondary' },
  ventas: { label: 'Ventas', variant: 'outline' },
  cliente: { label: 'Cliente', variant: 'secondary' },
};

const allRoles: AppRole[] = ['admin', 'operaciones', 'finanzas', 'ventas', 'cliente'];

interface UserWithRole {
  id: string;
  user_id: string;
  nombre: string;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  role: AppRole | null;
  role_id: string | null;
}

function useUsuarios() {
  const { role } = useAuth();
  return useQuery({
    queryKey: ['usuarios-admin'],
    queryFn: async () => {
      // Fetch all profiles
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (pError) throw pError;

      // Fetch all roles (admin only via RLS)
      const { data: roles, error: rError } = await supabase
        .from('user_roles')
        .select('*');
      if (rError) throw rError;

      const rolesMap = new Map(roles?.map(r => [r.user_id, { role: r.role, id: r.id }]));

      return (profiles || []).map(p => ({
        ...p,
        role: rolesMap.get(p.user_id)?.role || null,
        role_id: rolesMap.get(p.user_id)?.id || null,
      })) as UserWithRole[];
    },
    enabled: role === 'admin',
  });
}

export default function Usuarios() {
  const { role: currentRole, user } = useAuth();
  const { data: usuarios = [], isLoading } = useUsuarios();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [roleDialog, setRoleDialog] = useState<UserWithRole | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole>('operaciones');
  const [saving, setSaving] = useState(false);

  if (currentRole !== 'admin') {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-semibold">Usuarios</h1>
        <div className="empty-state">
          <Shield className="empty-state-icon" />
          <h3 className="empty-state-title">Acceso restringido</h3>
          <p className="empty-state-description">Solo los administradores pueden gestionar usuarios.</p>
        </div>
      </div>
    );
  }

  const filtered = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const openRoleDialog = (u: UserWithRole) => {
    setRoleDialog(u);
    setSelectedRole(u.role || 'operaciones');
  };

  const handleChangeRole = async () => {
    if (!roleDialog) return;
    setSaving(true);

    if (roleDialog.role_id) {
      // Update existing role
      const { error } = await supabase
        .from('user_roles')
        .update({ role: selectedRole })
        .eq('id', roleDialog.role_id);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        setSaving(false);
        return;
      }
    } else {
      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: roleDialog.user_id, role: selectedRole });
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        setSaving(false);
        return;
      }
    }

    toast({ title: 'Rol actualizado', description: `${roleDialog.nombre} ahora es "${roleLabels[selectedRole].label}".` });
    queryClient.invalidateQueries({ queryKey: ['usuarios-admin'] });
    setRoleDialog(null);
    setSaving(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Usuarios</h1>
          <p className="text-muted-foreground">Gestión de usuarios y roles ({usuarios.length} usuarios)</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nombre o email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Registrado</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No se encontraron usuarios.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map(u => {
                const isCurrentUser = u.user_id === user?.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full gradient-rappi flex items-center justify-center text-white font-medium text-sm">
                          {u.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{u.nombre}{isCurrentUser && <span className="text-xs text-muted-foreground ml-1">(vos)</span>}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email || '-'}</TableCell>
                    <TableCell>
                      {u.role ? (
                        <Badge variant={roleLabels[u.role]?.variant || 'secondary'}>
                          {roleLabels[u.role]?.label || u.role}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Sin rol</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString('es-AR')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openRoleDialog(u)}
                        title="Cambiar rol"
                      >
                        <UserCog className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Change Role Dialog */}
      <Dialog open={!!roleDialog} onOpenChange={() => setRoleDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cambiar rol de {roleDialog?.nombre}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Rol actual</Label>
              <p className="text-sm">
                {roleDialog?.role ? (
                  <Badge variant={roleLabels[roleDialog.role]?.variant}>{roleLabels[roleDialog.role]?.label}</Badge>
                ) : 'Sin rol'}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Nuevo rol</Label>
              <Select value={selectedRole} onValueChange={(v: AppRole) => setSelectedRole(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allRoles.map(r => (
                    <SelectItem key={r} value={r}>{roleLabels[r].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialog(null)}>Cancelar</Button>
            <Button onClick={handleChangeRole} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</> : 'Cambiar Rol'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

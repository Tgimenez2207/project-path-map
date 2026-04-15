import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, Calendar, Gauge, Plus, MoreHorizontal, Pencil, Trash2, Wrench } from 'lucide-react';
import { useVehiculos } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

const estadoVehiculo: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  disponible: { label: 'Disponible', variant: 'default' },
  en_uso: { label: 'En uso', variant: 'secondary' },
  mantenimiento: { label: 'Mantenimiento', variant: 'outline' },
};

const tiposVehiculo = ['camioneta', 'camion', 'auto', 'utilitario'] as const;
const estadosVehiculo = ['disponible', 'en_uso', 'mantenimiento'] as const;

type TipoVehiculo = typeof tiposVehiculo[number];
type EstadoVehiculo = typeof estadosVehiculo[number];
const emptyVehiculo: { patente: string; marca: string; modelo: string; anio: number; tipo: TipoVehiculo; estado: EstadoVehiculo; kilometraje: number; proximo_vencimiento: string; tipo_vencimiento: string } = { patente: '', marca: '', modelo: '', anio: new Date().getFullYear(), tipo: 'camioneta', estado: 'disponible', kilometraje: 0, proximo_vencimiento: '', tipo_vencimiento: '' };
const emptyMant = { fecha: '', tipo: '', kilometraje: 0, costo: 0, descripcion: '', proximo_mantenimiento: '', vehiculo_id: '' };

export default function Flota() {
  const { data: vehiculos = [], isLoading } = useVehiculos();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Vehicle dialog
  const [vOpen, setVOpen] = useState(false);
  const [vForm, setVForm] = useState(emptyVehiculo);
  const [vEditId, setVEditId] = useState<string | null>(null);

  // Maintenance dialog
  const [mOpen, setMOpen] = useState(false);
  const [mForm, setMForm] = useState(emptyMant);
  const [mEditId, setMEditId] = useState<string | null>(null);
  const [selectedVehiculo, setSelectedVehiculo] = useState<string | null>(null);

  const { data: mantenimientos = [] } = useQuery({
    queryKey: ['mantenimientos'],
    queryFn: async () => {
      const { data } = await supabase.from('mantenimientos').select('*').order('fecha', { ascending: false });
      return (data || []) as Tables<'mantenimientos'>[];
    },
  });

  // Vehicle CRUD
  const openNewV = () => { setVForm(emptyVehiculo); setVEditId(null); setVOpen(true); };
  const openEditV = (v: Tables<'vehiculos'>) => {
    setVForm({ patente: v.patente, marca: v.marca, modelo: v.modelo, anio: v.anio, tipo: v.tipo as TipoVehiculo, estado: v.estado as EstadoVehiculo, kilometraje: v.kilometraje, proximo_vencimiento: v.proximo_vencimiento || '', tipo_vencimiento: v.tipo_vencimiento || '' });
    setVEditId(v.id); setVOpen(true);
  };
  const saveV = async () => {
    const payload = { ...vForm, proximo_vencimiento: vForm.proximo_vencimiento || null, tipo_vencimiento: vForm.tipo_vencimiento || null };
    const { error } = vEditId
      ? await supabase.from('vehiculos').update(payload).eq('id', vEditId)
      : await supabase.from('vehiculos').insert(payload);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: vEditId ? 'Vehículo actualizado' : 'Vehículo creado' });
    queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
    setVOpen(false);
  };
  const deleteV = async (id: string) => {
    const { error } = await supabase.from('vehiculos').delete().eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Vehículo eliminado' });
    queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
  };

  // Maintenance CRUD
  const openNewM = (vehiculoId?: string) => {
    setMForm({ ...emptyMant, vehiculo_id: vehiculoId || '' });
    setMEditId(null); setMOpen(true);
  };
  const openEditM = (m: Tables<'mantenimientos'>) => {
    setMForm({ fecha: m.fecha, tipo: m.tipo, kilometraje: m.kilometraje, costo: m.costo, descripcion: m.descripcion || '', proximo_mantenimiento: m.proximo_mantenimiento || '', vehiculo_id: m.vehiculo_id });
    setMEditId(m.id); setMOpen(true);
  };
  const saveM = async () => {
    const payload = { ...mForm, proximo_mantenimiento: mForm.proximo_mantenimiento || null, descripcion: mForm.descripcion || null };
    const { error } = mEditId
      ? await supabase.from('mantenimientos').update(payload).eq('id', mEditId)
      : await supabase.from('mantenimientos').insert(payload);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: mEditId ? 'Mantenimiento actualizado' : 'Mantenimiento registrado' });
    queryClient.invalidateQueries({ queryKey: ['mantenimientos'] });
    setMOpen(false);
  };
  const deleteM = async (id: string) => {
    const { error } = await supabase.from('mantenimientos').delete().eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Mantenimiento eliminado' });
    queryClient.invalidateQueries({ queryKey: ['mantenimientos'] });
  };

  const getVehiculo = (id: string) => vehiculos.find(v => v.id === id);
  const filteredMant = selectedVehiculo ? mantenimientos.filter(m => m.vehiculo_id === selectedVehiculo) : mantenimientos;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Flota</h1>
          <p className="text-muted-foreground">Gestión de vehículos y mantenimientos ({vehiculos.length} vehículos)</p>
        </div>
      </div>

      <Tabs defaultValue="vehiculos">
        <TabsList>
          <TabsTrigger value="vehiculos">Vehículos</TabsTrigger>
          <TabsTrigger value="mantenimientos">Mantenimientos</TabsTrigger>
        </TabsList>

        <TabsContent value="vehiculos" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openNewV}><Plus className="h-4 w-4 mr-1" />Nuevo vehículo</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vehiculos.map(v => (
              <Card key={v.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Car className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={estadoVehiculo[v.estado]?.variant || 'secondary'}>
                        {estadoVehiculo[v.estado]?.label || v.estado}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditV(v)}><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openNewM(v.id)}><Wrench className="h-4 w-4 mr-2" />Registrar mantenimiento</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteV(v.id)}><Trash2 className="h-4 w-4 mr-2" />Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardTitle className="text-base mt-2">{v.marca} {v.modelo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Patente</span><span className="font-mono font-medium">{v.patente}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Año</span><span>{v.anio}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground flex items-center gap-1"><Gauge className="h-3 w-3" />Km</span><span>{v.kilometraje.toLocaleString()} km</span></div>
                  {v.proximo_vencimiento && (
                    <div className="flex items-center justify-between pt-2 border-t"><span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{v.tipo_vencimiento}</span><span className="text-xs">{new Date(v.proximo_vencimiento).toLocaleDateString('es-AR')}</span></div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mantenimientos" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Select value={selectedVehiculo || 'todos'} onValueChange={v => setSelectedVehiculo(v === 'todos' ? null : v)}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Filtrar por vehículo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los vehículos</SelectItem>
                {vehiculos.map(v => <SelectItem key={v.id} value={v.id}>{v.marca} {v.modelo} ({v.patente})</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => openNewM()}><Plus className="h-4 w-4 mr-1" />Nuevo mantenimiento</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Km</TableHead>
                    <TableHead className="text-right">Costo</TableHead>
                    <TableHead>Próximo</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMant.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Sin mantenimientos registrados</TableCell></TableRow>
                  )}
                  {filteredMant.map(m => {
                    const v = getVehiculo(m.vehiculo_id);
                    return (
                      <TableRow key={m.id}>
                        <TableCell>{new Date(m.fecha).toLocaleDateString('es-AR')}</TableCell>
                        <TableCell>{v ? `${v.marca} ${v.modelo}` : '—'}</TableCell>
                        <TableCell>{m.tipo}</TableCell>
                        <TableCell>{m.kilometraje.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${m.costo.toLocaleString()}</TableCell>
                        <TableCell>{m.proximo_mantenimiento ? new Date(m.proximo_mantenimiento).toLocaleDateString('es-AR') : '—'}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditM(m)}><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => deleteM(m.id)}><Trash2 className="h-4 w-4 mr-2" />Eliminar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Vehicle Dialog */}
      <Dialog open={vOpen} onOpenChange={setVOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{vEditId ? 'Editar vehículo' : 'Nuevo vehículo'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Marca</Label><Input value={vForm.marca} onChange={e => setVForm(p => ({ ...p, marca: e.target.value }))} /></div>
              <div><Label>Modelo</Label><Input value={vForm.modelo} onChange={e => setVForm(p => ({ ...p, modelo: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Patente</Label><Input value={vForm.patente} onChange={e => setVForm(p => ({ ...p, patente: e.target.value }))} /></div>
              <div><Label>Año</Label><Input type="number" value={vForm.anio} onChange={e => setVForm(p => ({ ...p, anio: Number(e.target.value) }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo</Label>
                <Select value={vForm.tipo} onValueChange={v => setVForm(p => ({ ...p, tipo: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{tiposVehiculo.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estado</Label>
                <Select value={vForm.estado} onValueChange={v => setVForm(p => ({ ...p, estado: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{estadosVehiculo.map(e => <SelectItem key={e} value={e}>{estadoVehiculo[e]?.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Kilometraje</Label><Input type="number" min={0} value={vForm.kilometraje} onChange={e => setVForm(p => ({ ...p, kilometraje: Number(e.target.value) }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Próximo vencimiento</Label><Input type="date" value={vForm.proximo_vencimiento} onChange={e => setVForm(p => ({ ...p, proximo_vencimiento: e.target.value }))} /></div>
              <div><Label>Tipo vencimiento</Label><Input value={vForm.tipo_vencimiento} onChange={e => setVForm(p => ({ ...p, tipo_vencimiento: e.target.value }))} placeholder="Ej: VTV, Seguro" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVOpen(false)}>Cancelar</Button>
            <Button onClick={saveV} disabled={!vForm.marca || !vForm.modelo || !vForm.patente}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Maintenance Dialog */}
      <Dialog open={mOpen} onOpenChange={setMOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{mEditId ? 'Editar mantenimiento' : 'Nuevo mantenimiento'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Vehículo</Label>
              <Select value={mForm.vehiculo_id} onValueChange={v => setMForm(p => ({ ...p, vehiculo_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar vehículo" /></SelectTrigger>
                <SelectContent>{vehiculos.map(v => <SelectItem key={v.id} value={v.id}>{v.marca} {v.modelo} ({v.patente})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Fecha</Label><Input type="date" value={mForm.fecha} onChange={e => setMForm(p => ({ ...p, fecha: e.target.value }))} /></div>
              <div><Label>Tipo</Label><Input value={mForm.tipo} onChange={e => setMForm(p => ({ ...p, tipo: e.target.value }))} placeholder="Ej: Service, Frenos" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Kilometraje</Label><Input type="number" min={0} value={mForm.kilometraje} onChange={e => setMForm(p => ({ ...p, kilometraje: Number(e.target.value) }))} /></div>
              <div><Label>Costo</Label><Input type="number" min={0} value={mForm.costo} onChange={e => setMForm(p => ({ ...p, costo: Number(e.target.value) }))} /></div>
            </div>
            <div><Label>Descripción</Label><Input value={mForm.descripcion} onChange={e => setMForm(p => ({ ...p, descripcion: e.target.value }))} /></div>
            <div><Label>Próximo mantenimiento</Label><Input type="date" value={mForm.proximo_mantenimiento} onChange={e => setMForm(p => ({ ...p, proximo_mantenimiento: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMOpen(false)}>Cancelar</Button>
            <Button onClick={saveM} disabled={!mForm.vehiculo_id || !mForm.fecha || !mForm.tipo}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { usePortal } from '@/contexts/PortalContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Camera,
  Calendar,
  Building2,
  Image,
  Video,
  FileText,
  List,
  Grid,
  Home,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function PortalAvance() {
  const { cliente } = usePortal();
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [vistaActiva, setVistaActiva] = useState<'timeline' | 'galeria'>('timeline');
  const [obras, setObras] = useState<any[]>([]);
  const [bitacora, setBitacora] = useState<any[]>([]);

  useEffect(() => {
    if (!cliente) return;
    const fetch = async () => {
      // Get client's units and their obras
      const { data: compras } = await supabase.from('compradores').select('unidad_id').eq('cliente_id', cliente.id);
      if (!compras || compras.length === 0) return;
      const uIds = compras.map(c => c.unidad_id);
      const { data: unis } = await supabase.from('unidades').select('obra_id').in('id', uIds);
      const obraIds = [...new Set((unis || []).map(u => u.obra_id))];
      if (obraIds.length === 0) return;

      const [obrasRes, bitacoraRes] = await Promise.all([
        supabase.from('obras').select('*').in('id', obraIds),
        supabase.from('bitacora').select('*').in('obra_id', obraIds).order('fecha', { ascending: false }),
      ]);
      setObras(obrasRes.data || []);
      setBitacora(bitacoraRes.data || []);
    };
    fetch();
  }, [cliente]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold">Avance de Obra</h1>
        <p className="text-muted-foreground">
          Siga el progreso de construcción de sus unidades.
        </p>
      </div>

      {/* Obras del cliente con progreso */}
      {obras.map((obra) => (
        <Card key={obra.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{obra.nombre}</CardTitle>
                  <p className="text-sm text-muted-foreground">{obra.direccion}</p>
                </div>
              </div>
              <Badge variant={obra.estado === 'en_curso' ? 'default' : 'secondary'}>
                {obra.estado === 'en_curso' ? 'En construcción' : obra.estado}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Avance general</span>
              <span className="text-sm font-semibold text-primary">{obra.progreso}%</span>
            </div>
            <Progress value={obra.progreso} className="h-3" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Inicio: {new Date(obra.fecha_inicio).toLocaleDateString('es-AR')}</span>
              {obra.fecha_fin_estimada && (
                <span>
                  Entrega estimada: {new Date(obra.fecha_fin_estimada).toLocaleDateString('es-AR')}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Bitácora timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Últimas actualizaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bitacora.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay actualizaciones de obra todavía.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {bitacora.map((entry, index) => (
                <div key={entry.id} className="relative pl-6 pb-6 last:pb-0">
                  {index < bitacora.length - 1 && (
                    <div className="absolute left-[9px] top-6 bottom-0 w-0.5 bg-border" />
                  )}
                  <div className="absolute left-0 top-1.5 h-[18px] w-[18px] rounded-full bg-primary flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(entry.fecha).toLocaleDateString('es-AR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {entry.autor}
                      </Badge>
                    </div>
                    <h5 className="font-medium mb-1">{entry.titulo}</h5>
                    <p className="text-sm text-muted-foreground">{entry.descripcion}</p>

                    {entry.imagenes && entry.imagenes.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-2 mt-3">
                        {entry.imagenes.map((img: string, i: number) => (
                          <div key={i} className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden border">
                            <img src={img} alt={`Imagen ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { usePortal } from '@/contexts/PortalContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Camera,
  Calendar,
  Building2,
  Image,
  PlayCircle,
} from 'lucide-react';
import { mockUnidades, mockCompradores } from '@/data/mockUnidades';
import { mockObras } from '@/data/mockObras';

// Mock avance data
const avancesMock = [
  {
    id: 'avance-001',
    fecha: '2024-12-28',
    titulo: 'Avance estructura piso 8',
    descripcion: 'Se completó el hormigonado de la losa del piso 8. El curado está en proceso.',
    tipo: 'general',
    imagenes: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400',
    ],
  },
  {
    id: 'avance-002',
    fecha: '2024-12-20',
    titulo: 'Instalaciones eléctricas pisos 1-5',
    descripcion: 'Tendido de cañerías y cableado principal completado en pisos inferiores.',
    tipo: 'instalaciones',
    imagenes: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
    ],
  },
  {
    id: 'avance-003',
    fecha: '2024-12-15',
    titulo: 'Mampostería pisos 3-4',
    descripcion: 'Cierre perimetral con ladrillos huecos completado. Se inicia revoque grueso.',
    tipo: 'mamposteria',
    imagenes: [
      'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?w=400',
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400',
    ],
  },
];

export default function PortalAvance() {
  const { cliente } = usePortal();

  // Obtener obras del cliente
  const compras = mockCompradores.filter((c) => c.clienteId === cliente?.id);
  const unidadesIds = compras.map((c) => c.unidadId);
  const unidades = mockUnidades.filter((u) => unidadesIds.includes(u.id));
  const obrasIds = [...new Set(unidades.map((u) => u.obraId))];
  const obras = mockObras.filter((o) => obrasIds.includes(o.id));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold">Avance de Obra</h1>
        <p className="text-muted-foreground">
          Siga el progreso de construcción de sus unidades.
        </p>
      </div>

      {/* Obras del cliente */}
      {obras.map((obra) => (
        <Card key={obra.id}>
          <CardHeader>
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
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Avance general</span>
                <span className="text-sm text-muted-foreground">{obra.progreso}%</span>
              </div>
              <Progress value={obra.progreso} className="h-3" />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Inicio: {new Date(obra.fechaInicio).toLocaleDateString('es-AR')}</span>
                {obra.fechaFinEstimada && (
                  <span>
                    Entrega estimada: {new Date(obra.fechaFinEstimada).toLocaleDateString('es-AR')}
                  </span>
                )}
              </div>
            </div>

            {/* Timeline de avances */}
            <div>
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Últimas actualizaciones
              </h4>
              <div className="space-y-4">
                {avancesMock.map((avance, index) => (
                  <div key={avance.id} className="relative pl-6 pb-6 last:pb-0">
                    {/* Timeline line */}
                    {index < avancesMock.length - 1 && (
                      <div className="absolute left-[9px] top-6 bottom-0 w-0.5 bg-border" />
                    )}
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-1.5 h-[18px] w-[18px] rounded-full bg-primary flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                    </div>

                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(avance.fecha).toLocaleDateString('es-AR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                      <h5 className="font-medium mb-1">{avance.titulo}</h5>
                      <p className="text-sm text-muted-foreground mb-3">
                        {avance.descripcion}
                      </p>

                      {/* Images */}
                      {avance.imagenes.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {avance.imagenes.map((img, imgIndex) => (
                            <div
                              key={imgIndex}
                              className="relative flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden group cursor-pointer"
                            >
                              <img
                                src={img}
                                alt={`${avance.titulo} - Imagen ${imgIndex + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <Image className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {obras.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay información de avance disponible.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

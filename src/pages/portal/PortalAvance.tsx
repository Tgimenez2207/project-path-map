import { useState } from 'react';
import { usePortal } from '@/contexts/PortalContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Camera,
  Calendar,
  Building2,
  Image,
  Video,
  FileText,
  Map,
  Play,
  User,
  ChevronLeft,
  ChevronRight,
  X,
  Grid,
  List,
  Download,
  ExternalLink,
  Layers,
  Home,
} from 'lucide-react';
import { mockUnidades, mockCompradores } from '@/data/mockUnidades';
import { mockObras } from '@/data/mockObras';
import { mockReportesAvance } from '@/data/mockMultimedia';
import { ArchivoMultimedia, ReporteAvance } from '@/types';

const tipoIconos = {
  imagen: Image,
  video: Video,
  documento: FileText,
  plano: Map,
};

const tipoLabels = {
  imagen: 'Imágenes',
  video: 'Videos',
  documento: 'Documentos',
  plano: 'Planos',
};

export default function PortalAvance() {
  const { cliente } = usePortal();
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [vistaActiva, setVistaActiva] = useState<'timeline' | 'galeria'>('timeline');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [archivosLightbox, setArchivosLightbox] = useState<ArchivoMultimedia[]>([]);

  // Obtener obras del cliente
  const compras = mockCompradores.filter((c) => c.clienteId === cliente?.id);
  const unidadesIds = compras.map((c) => c.unidadId);
  const unidades = mockUnidades.filter((u) => unidadesIds.includes(u.id));
  const obrasIds = [...new Set(unidades.map((u) => u.obraId))];
  const obras = mockObras.filter((o) => obrasIds.includes(o.id));

  // Obtener reportes de las obras del cliente
  const reportes = mockReportesAvance
    .filter((r) => obrasIds.includes(r.obraId))
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  // Filtrar reportes por tipo
  const reportesFiltrados = reportes.filter((r) => {
    if (filtroTipo === 'todos') return true;
    return r.archivos.some((a) => a.tipo === filtroTipo);
  });

  // Obtener todos los archivos para la galería
  const todosLosArchivos = reportes.flatMap((r) =>
    r.archivos.map((a) => ({
      ...a,
      reporteFecha: r.fecha,
      reporteTitulo: r.titulo,
    }))
  );

  const archivosFiltrados = todosLosArchivos.filter((a) => {
    if (filtroTipo === 'todos') return true;
    return a.tipo === filtroTipo;
  });

  // Stats
  const totalImagenes = todosLosArchivos.filter((a) => a.tipo === 'imagen').length;
  const totalVideos = todosLosArchivos.filter((a) => a.tipo === 'video').length;
  const totalDocumentos = todosLosArchivos.filter(
    (a) => a.tipo === 'documento' || a.tipo === 'plano'
  ).length;

  const openLightbox = (archivos: ArchivoMultimedia[], index: number) => {
    setArchivosLightbox(archivos);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setLightboxIndex((prev) => (prev > 0 ? prev - 1 : archivosLightbox.length - 1));
    } else {
      setLightboxIndex((prev) => (prev < archivosLightbox.length - 1 ? prev + 1 : 0));
    }
  };

  const getUbicacionLabel = (reporte: ReporteAvance) => {
    if (reporte.unidadId) {
      const unidad = unidades.find((u) => u.id === reporte.unidadId);
      return unidad ? `Unidad ${unidad.codigo}` : 'Unidad';
    }
    if (reporte.torre && reporte.piso !== undefined) {
      return `Torre ${reporte.torre} - Piso ${reporte.piso}`;
    }
    if (reporte.torre) {
      return `Torre ${reporte.torre}`;
    }
    if (reporte.piso !== undefined) {
      return `Piso ${reporte.piso}`;
    }
    return 'General';
  };

  const currentArchivo = archivosLightbox[lightboxIndex];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold">Avance de Obra</h1>
        <p className="text-muted-foreground">
          Siga el progreso de construcción de sus unidades con fotos, videos y documentos.
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
              <span>Inicio: {new Date(obra.fechaInicio).toLocaleDateString('es-AR')}</span>
              {obra.fechaFinEstimada && (
                <span>
                  Entrega estimada: {new Date(obra.fechaFinEstimada).toLocaleDateString('es-AR')}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Stats de multimedia */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Image className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalImagenes}</p>
                <p className="text-xs text-muted-foreground">Imágenes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Video className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalVideos}</p>
                <p className="text-xs text-muted-foreground">Videos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalDocumentos}</p>
                <p className="text-xs text-muted-foreground">Docs/Planos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y vistas */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              <SelectItem value="imagen">Imágenes</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="documento">Documentos</SelectItem>
              <SelectItem value="plano">Planos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={vistaActiva === 'timeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setVistaActiva('timeline')}
          >
            <List className="h-4 w-4 mr-2" />
            Timeline
          </Button>
          <Button
            variant={vistaActiva === 'galeria' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setVistaActiva('galeria')}
          >
            <Grid className="h-4 w-4 mr-2" />
            Galería
          </Button>
        </div>
      </div>

      {/* Vista Timeline */}
      {vistaActiva === 'timeline' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Últimas actualizaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reportesFiltrados.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay actualizaciones que coincidan con el filtro.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reportesFiltrados.map((reporte, index) => (
                  <div key={reporte.id} className="relative pl-6 pb-6 last:pb-0">
                    {/* Timeline line */}
                    {index < reportesFiltrados.length - 1 && (
                      <div className="absolute left-[9px] top-6 bottom-0 w-0.5 bg-border" />
                    )}
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-1.5 h-[18px] w-[18px] rounded-full bg-primary flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                    </div>

                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(reporte.fecha).toLocaleDateString('es-AR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <User className="h-3 w-3 mr-1" />
                          {reporte.autor}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {reporte.unidadId ? (
                            <Home className="h-3 w-3 mr-1" />
                          ) : reporte.torre ? (
                            <Building2 className="h-3 w-3 mr-1" />
                          ) : (
                            <Layers className="h-3 w-3 mr-1" />
                          )}
                          {getUbicacionLabel(reporte)}
                        </Badge>
                      </div>
                      <h5 className="font-medium mb-1">{reporte.titulo}</h5>
                      {reporte.descripcion && (
                        <p className="text-sm text-muted-foreground mb-3">{reporte.descripcion}</p>
                      )}

                      {/* Grid de archivos */}
                      {reporte.archivos.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {reporte.archivos
                            .filter((a) => filtroTipo === 'todos' || a.tipo === filtroTipo)
                            .map((archivo, archivoIndex) => {
                              const Icon = tipoIconos[archivo.tipo];
                              return (
                                <div
                                  key={archivo.id}
                                  className="relative flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden group cursor-pointer border"
                                  onClick={() =>
                                    openLightbox(
                                      reporte.archivos.filter(
                                        (a) => filtroTipo === 'todos' || a.tipo === filtroTipo
                                      ),
                                      archivoIndex
                                    )
                                  }
                                >
                                  {archivo.thumbnail ? (
                                    <img
                                      src={archivo.thumbnail}
                                      alt={archivo.nombre}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted">
                                      <Icon className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                  )}

                                  {/* Play button for videos */}
                                  {archivo.tipo === 'video' && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="h-8 w-8 rounded-full bg-black/60 flex items-center justify-center">
                                        <Play className="h-4 w-4 text-white" />
                                      </div>
                                    </div>
                                  )}

                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <Image className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Vista Galería */}
      {vistaActiva === 'galeria' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid className="h-5 w-5" />
              Galería de archivos ({archivosFiltrados.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {archivosFiltrados.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay archivos que coincidan con el filtro.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {archivosFiltrados.map((archivo, index) => {
                  const Icon = tipoIconos[archivo.tipo];
                  return (
                    <div
                      key={archivo.id}
                      className="group relative aspect-square rounded-lg overflow-hidden border cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => openLightbox(archivosFiltrados, index)}
                    >
                      {archivo.thumbnail ? (
                        <img
                          src={archivo.thumbnail}
                          alt={archivo.nombre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
                          <Icon className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-xs text-muted-foreground">
                            {archivo.tipo === 'plano' ? 'Plano' : 'Documento'}
                          </span>
                        </div>
                      )}

                      {/* Play button for videos */}
                      {archivo.tipo === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-10 w-10 rounded-full bg-black/60 flex items-center justify-center">
                            <Play className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-xs text-white truncate font-medium">
                          {archivo.nombre}
                        </p>
                        <p className="text-xs text-white/70">
                          {new Date(archivo.reporteFecha).toLocaleDateString('es-AR')}
                        </p>
                      </div>

                      {/* Badge tipo */}
                      <div className="absolute top-2 left-2">
                        <Badge
                          variant="secondary"
                          className="text-xs bg-black/60 text-white border-0"
                        >
                          {archivo.tipo === 'imagen'
                            ? 'Foto'
                            : archivo.tipo === 'video'
                            ? 'Video'
                            : archivo.tipo === 'plano'
                            ? 'Plano'
                            : 'Doc'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

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

      {/* Lightbox mejorado */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black/95">
          {currentArchivo && (
            <div className="relative">
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
                onClick={() => setLightboxOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Navigation */}
              {archivosLightbox.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 h-12 w-12"
                    onClick={() => navigateLightbox('prev')}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 h-12 w-12"
                    onClick={() => navigateLightbox('next')}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </>
              )}

              {/* Content */}
              <div className="min-h-[60vh] flex items-center justify-center p-4">
                {currentArchivo.tipo === 'imagen' ? (
                  <img
                    src={currentArchivo.url}
                    alt={currentArchivo.nombre}
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                ) : currentArchivo.tipo === 'video' ? (
                  <div className="text-center text-white">
                    <Play className="h-20 w-20 mx-auto mb-4" />
                    <p className="text-xl font-medium mb-4">{currentArchivo.nombre}</p>
                    <Button asChild variant="outline" className="text-white border-white hover:bg-white/20">
                      <a href={currentArchivo.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir video
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-white">
                    {currentArchivo.tipo === 'plano' ? (
                      <Map className="h-20 w-20 mx-auto mb-4 text-white/60" />
                    ) : (
                      <FileText className="h-20 w-20 mx-auto mb-4 text-white/60" />
                    )}
                    <p className="text-xl font-medium mb-4">{currentArchivo.nombre}</p>
                    <Button asChild variant="outline" className="text-white border-white hover:bg-white/20">
                      <a href={currentArchivo.url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{currentArchivo.nombre}</p>
                    <p className="text-white/60 text-sm">
                      {currentArchivo.tipo === 'imagen'
                        ? 'Imagen'
                        : currentArchivo.tipo === 'video'
                        ? 'Video'
                        : currentArchivo.tipo === 'plano'
                        ? 'Plano'
                        : 'Documento'}
                    </p>
                  </div>
                  {archivosLightbox.length > 1 && (
                    <div className="text-white/60 text-sm">
                      {lightboxIndex + 1} / {archivosLightbox.length}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

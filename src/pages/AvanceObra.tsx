import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Plus,
  Camera,
  Video,
  FileText,
  Map,
  Calendar,
  User,
  Building2,
  Layers,
  Home,
  Trash2,
  Eye,
  Upload,
  Image,
  Play,
  X,
} from 'lucide-react';
import { mockObras } from '@/data/mockObras';
import { mockUnidades } from '@/data/mockUnidades';
import { mockReportesAvance } from '@/data/mockMultimedia';
import { ReporteAvance, ArchivoMultimedia } from '@/types';
import { toast } from 'sonner';

const tipoIconos = {
  imagen: Image,
  video: Video,
  documento: FileText,
  plano: Map,
};

const tipoLabels = {
  imagen: 'Imagen',
  video: 'Video',
  documento: 'Documento',
  plano: 'Plano',
};

export default function AvanceObra() {
  const { obraId } = useParams();
  const navigate = useNavigate();
  const [reportes, setReportes] = useState<ReporteAvance[]>(
    mockReportesAvance.filter((r) => r.obraId === obraId)
  );
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroUbicacion, setFiltroUbicacion] = useState<string>('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxArchivo, setLightboxArchivo] = useState<ArchivoMultimedia | null>(null);

  // Form state
  const [nuevoReporte, setNuevoReporte] = useState({
    titulo: '',
    descripcion: '',
    torre: '',
    piso: '',
    unidadId: '',
    archivos: [] as ArchivoMultimedia[],
  });

  const obra = mockObras.find((o) => o.id === obraId);
  const unidadesObra = mockUnidades.filter((u) => u.obraId === obraId);
  const torres = [...new Set(unidadesObra.filter((u) => u.torre).map((u) => u.torre))];
  const pisos = [...new Set(unidadesObra.filter((u) => u.piso !== undefined).map((u) => u.piso))].sort(
    (a, b) => (a || 0) - (b || 0)
  );

  if (!obra) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground mb-4">Obra no encontrada</p>
        <Button onClick={() => navigate('/obras')}>Volver a Obras</Button>
      </div>
    );
  }

  // Filtrar reportes
  const reportesFiltrados = reportes.filter((r) => {
    if (filtroTipo !== 'todos') {
      const tieneArchivo = r.archivos.some((a) => a.tipo === filtroTipo);
      if (!tieneArchivo) return false;
    }
    if (filtroUbicacion !== 'todos') {
      if (filtroUbicacion === 'general' && (r.torre || r.piso || r.unidadId)) return false;
      if (filtroUbicacion.startsWith('torre-') && r.torre !== filtroUbicacion.replace('torre-', ''))
        return false;
      if (filtroUbicacion.startsWith('unidad-') && r.unidadId !== filtroUbicacion.replace('unidad-', ''))
        return false;
    }
    return true;
  });

  // Stats
  const totalImagenes = reportes.reduce((acc, r) => acc + r.archivos.filter((a) => a.tipo === 'imagen').length, 0);
  const totalVideos = reportes.reduce((acc, r) => acc + r.archivos.filter((a) => a.tipo === 'video').length, 0);
  const totalDocumentos = reportes.reduce(
    (acc, r) => acc + r.archivos.filter((a) => a.tipo === 'documento' || a.tipo === 'plano').length,
    0
  );

  const handleAgregarReporte = () => {
    if (!nuevoReporte.titulo) {
      toast.error('Ingrese un título para el reporte');
      return;
    }

    const nuevo: ReporteAvance = {
      id: `avance-${Date.now()}`,
      obraId: obraId!,
      titulo: nuevoReporte.titulo,
      descripcion: nuevoReporte.descripcion,
      torre: nuevoReporte.torre || undefined,
      piso: nuevoReporte.piso ? parseInt(nuevoReporte.piso) : undefined,
      unidadId: nuevoReporte.unidadId || undefined,
      fecha: new Date().toISOString().split('T')[0],
      autor: 'Usuario Actual',
      archivos: nuevoReporte.archivos,
    };

    setReportes([nuevo, ...reportes]);
    setNuevoReporte({
      titulo: '',
      descripcion: '',
      torre: '',
      piso: '',
      unidadId: '',
      archivos: [],
    });
    setDialogOpen(false);
    toast.success('Reporte de avance creado');
  };

  const handleEliminarReporte = (id: string) => {
    setReportes(reportes.filter((r) => r.id !== id));
    toast.success('Reporte eliminado');
  };

  const handleAgregarArchivoMock = (tipo: ArchivoMultimedia['tipo']) => {
    const mockUrls = {
      imagen: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
      video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      documento: '/documentos/ejemplo.pdf',
      plano: '/planos/ejemplo.pdf',
    };

    const nuevoArchivo: ArchivoMultimedia = {
      id: `archivo-${Date.now()}`,
      tipo,
      nombre: `Nuevo ${tipoLabels[tipo]} ${nuevoReporte.archivos.length + 1}`,
      url: mockUrls[tipo],
      thumbnail: tipo === 'imagen' || tipo === 'video' 
        ? 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200' 
        : undefined,
    };

    setNuevoReporte({
      ...nuevoReporte,
      archivos: [...nuevoReporte.archivos, nuevoArchivo],
    });
  };

  const handleRemoverArchivo = (archivoId: string) => {
    setNuevoReporte({
      ...nuevoReporte,
      archivos: nuevoReporte.archivos.filter((a) => a.id !== archivoId),
    });
  };

  const openLightbox = (archivo: ArchivoMultimedia) => {
    setLightboxArchivo(archivo);
    setLightboxOpen(true);
  };

  const getUbicacionLabel = (reporte: ReporteAvance) => {
    if (reporte.unidadId) {
      const unidad = unidadesObra.find((u) => u.id === reporte.unidadId);
      return unidad ? `Unidad ${unidad.codigo}` : 'Unidad específica';
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/obras/${obraId}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">Avance de Obra</h1>
            <Badge variant="outline">{obra.nombre}</Badge>
          </div>
          <p className="text-muted-foreground">
            Gestione reportes, fotos, videos y documentos del avance
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Reporte
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuevo Reporte de Avance</DialogTitle>
              <DialogDescription>
                Cargue un nuevo reporte con fotos, videos o documentos
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  placeholder="Ej: Avance hormigonado piso 8"
                  value={nuevoReporte.titulo}
                  onChange={(e) => setNuevoReporte({ ...nuevoReporte, titulo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  placeholder="Describa el avance realizado..."
                  value={nuevoReporte.descripcion}
                  onChange={(e) => setNuevoReporte({ ...nuevoReporte, descripcion: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Ubicación */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Torre</Label>
                  <Select
                    value={nuevoReporte.torre}
                    onValueChange={(v) => setNuevoReporte({ ...nuevoReporte, torre: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      {torres.map((t) => (
                        <SelectItem key={t} value={t || ''}>
                          Torre {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Piso</Label>
                  <Select
                    value={nuevoReporte.piso}
                    onValueChange={(v) => setNuevoReporte({ ...nuevoReporte, piso: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      {pisos.map((p) => (
                        <SelectItem key={p} value={String(p)}>
                          Piso {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Unidad específica</Label>
                  <Select
                    value={nuevoReporte.unidadId}
                    onValueChange={(v) => setNuevoReporte({ ...nuevoReporte, unidadId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ninguna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Ninguna</SelectItem>
                      {unidadesObra.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.codigo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Archivos */}
              <div className="space-y-3">
                <Label>Archivos adjuntos</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAgregarArchivoMock('imagen')}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Agregar Imagen
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAgregarArchivoMock('video')}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Agregar Video
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAgregarArchivoMock('documento')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Agregar Documento
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAgregarArchivoMock('plano')}
                  >
                    <Map className="h-4 w-4 mr-2" />
                    Agregar Plano
                  </Button>
                </div>

                {nuevoReporte.archivos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {nuevoReporte.archivos.map((archivo) => {
                      const Icon = tipoIconos[archivo.tipo];
                      return (
                        <div
                          key={archivo.id}
                          className="relative group border rounded-lg p-2 bg-muted/30"
                        >
                          <div className="flex flex-col items-center gap-1">
                            {archivo.thumbnail ? (
                              <img
                                src={archivo.thumbnail}
                                alt={archivo.nombre}
                                className="w-full h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-full h-16 flex items-center justify-center bg-muted rounded">
                                <Icon className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            <span className="text-xs text-center truncate w-full">
                              {archivo.nombre}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoverArchivo(archivo.id)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAgregarReporte}>Crear Reporte</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reportes.length}</p>
                <p className="text-xs text-muted-foreground">Reportes</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                <Map className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalDocumentos}</p>
                <p className="text-xs text-muted-foreground">Docs/Planos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-sm mb-2 block">Tipo de contenido</Label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue />
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
            <div className="flex-1 min-w-[200px]">
              <Label className="text-sm mb-2 block">Ubicación</Label>
              <Select value={filtroUbicacion} onValueChange={setFiltroUbicacion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las ubicaciones</SelectItem>
                  <SelectItem value="general">General (obra completa)</SelectItem>
                  {torres.map((t) => (
                    <SelectItem key={t} value={`torre-${t}`}>
                      Torre {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline de reportes */}
      <div className="space-y-4">
        {reportesFiltrados.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay reportes de avance que coincidan con los filtros.</p>
                <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primer reporte
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          reportesFiltrados.map((reporte, index) => (
            <Card key={reporte.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Camera className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{reporte.titulo}</CardTitle>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(reporte.fecha).toLocaleDateString('es-AR')}
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
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleEliminarReporte(reporte.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {reporte.descripcion && (
                  <p className="text-sm text-muted-foreground mb-4">{reporte.descripcion}</p>
                )}

                {/* Grid de archivos */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {reporte.archivos.map((archivo) => {
                    const Icon = tipoIconos[archivo.tipo];
                    return (
                      <div
                        key={archivo.id}
                        className="group relative aspect-square rounded-lg overflow-hidden border cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                        onClick={() => openLightbox(archivo)}
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
                            <span className="text-xs text-muted-foreground text-center px-2">
                              {tipoLabels[archivo.tipo]}
                            </span>
                          </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          {archivo.tipo === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="h-10 w-10 rounded-full bg-black/60 flex items-center justify-center">
                                <Play className="h-5 w-5 text-white" />
                              </div>
                            </div>
                          )}
                          <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Badge tipo */}
                        <div className="absolute top-2 left-2">
                          <Badge
                            variant="secondary"
                            className="text-xs bg-black/60 text-white border-0"
                          >
                            {tipoLabels[archivo.tipo]}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {lightboxArchivo && (
            <>
              <div className="relative">
                {lightboxArchivo.tipo === 'imagen' ? (
                  <img
                    src={lightboxArchivo.url}
                    alt={lightboxArchivo.nombre}
                    className="w-full max-h-[80vh] object-contain bg-black"
                  />
                ) : lightboxArchivo.tipo === 'video' ? (
                  <div className="aspect-video bg-black flex items-center justify-center">
                    <div className="text-center text-white">
                      <Play className="h-16 w-16 mx-auto mb-4" />
                      <p>Video: {lightboxArchivo.nombre}</p>
                      <a
                        href={lightboxArchivo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline mt-2 inline-block"
                      >
                        Abrir en nueva pestaña
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <div className="text-center">
                      {lightboxArchivo.tipo === 'plano' ? (
                        <Map className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      ) : (
                        <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      )}
                      <p className="font-medium">{lightboxArchivo.nombre}</p>
                      <a
                        href={lightboxArchivo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline mt-2 inline-block"
                      >
                        Descargar archivo
                      </a>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 bg-background">
                <p className="font-medium">{lightboxArchivo.nombre}</p>
                <p className="text-sm text-muted-foreground">
                  Tipo: {tipoLabels[lightboxArchivo.tipo]}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

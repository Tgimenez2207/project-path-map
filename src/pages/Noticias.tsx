import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Newspaper, RefreshCw, Search, Bookmark, ExternalLink, Globe, TrendingUp, AlertCircle, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import type { Noticia, CategoriaNoticia, BusquedaConfig } from '@/types/noticias';

const categorias = [
  { value: 'todas', label: 'Todas' },
  { value: 'construccion', label: 'Construcción' },
  { value: 'inmobiliario', label: 'Inmobiliario' },
  { value: 'materiales', label: 'Materiales' },
  { value: 'regulatorio', label: 'Regulatorio' },
  { value: 'economia', label: 'Economía' },
  { value: 'tecnologia', label: 'Tecnología' },
] as const;

const getCategoriaLabel = (cat: CategoriaNoticia): string => ({
  construccion: 'Construcción',
  inmobiliario: 'Inmobiliario',
  materiales: 'Materiales',
  regulatorio: 'Regulatorio',
  economia: 'Economía',
  tecnologia: 'Tecnología',
}[cat]);

const getCategoriaClass = (cat: CategoriaNoticia): string => ({
  construccion: 'border-blue-300 text-blue-700 bg-blue-50',
  inmobiliario: 'border-emerald-300 text-emerald-700 bg-emerald-50',
  materiales: 'border-amber-300 text-amber-700 bg-amber-50',
  regulatorio: 'border-purple-300 text-purple-700 bg-purple-50',
  economia: 'border-red-300 text-red-700 bg-red-50',
  tecnologia: 'border-teal-300 text-teal-700 bg-teal-50',
}[cat] || '');

export default function Noticias() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<BusquedaConfig>({
    categoria: 'todas',
    periodo: 'semana',
    soloGuardadas: false,
  });
  const [noticiaDetalle, setNoticiaDetalle] = useState<Noticia | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);
  const [busquedaManual, setBusquedaManual] = useState('');
  const [urlConfirm, setUrlConfirm] = useState<{ url: string; fuente: string } | null>(null);
  useEffect(() => {
    fetchNoticias();
  }, []);

  const fetchNoticias = async (busqueda?: string) => {
    setIsLoading(true);
    setNoticias([]);
    try {
      const { data, error } = await supabase.functions.invoke('ai-noticias', {
        body: { busqueda: busqueda || null },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const text = data.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No se pudo parsear la respuesta');

      const parsed = JSON.parse(jsonMatch[0]);
      const guardadasTitulos: string[] = JSON.parse(localStorage.getItem('noticias-guardadas-titulos') || '[]');

      const noticiasConId: Noticia[] = parsed.noticias.map((n: any) => {
        const id = crypto.randomUUID();
        return {
          ...n,
          id,
          guardada: guardadasTitulos.includes(n.titulo),
          leida: false,
        };
      });

      setNoticias(noticiasConId);
      setUltimaActualizacion(new Date());
    } catch (e: any) {
      console.error('Error fetching noticias:', e);
      toast.error('Error al cargar noticias. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const marcarLeida = (id: string) => {
    setNoticias(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
  };

  const toggleGuardada = (id: string) => {
    setNoticias(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, guardada: !n.guardada } : n);
      const guardadasTitulos = updated.filter(n => n.guardada).map(n => n.titulo);
      localStorage.setItem('noticias-guardadas-titulos', JSON.stringify(guardadasTitulos));
      return updated;
    });
    if (noticiaDetalle?.id === id) {
      setNoticiaDetalle(prev => prev ? { ...prev, guardada: !prev.guardada } : null);
    }
  };

  const noticiasFiltradas = noticias
    .filter(n => config.categoria === 'todas' || n.categoria === config.categoria)
    .filter(n => !config.soloGuardadas || n.guardada)
    .sort((a, b) => {
      const orden = { alta: 0, media: 1, baja: 2 };
      return orden[a.relevancia] - orden[b.relevancia];
    });

  const stats = {
    total: noticias.length,
    alta: noticias.filter(n => n.relevancia === 'alta').length,
    fuentes: new Set(noticias.map(n => n.fuente)).size,
    topCategoria: noticias.length > 0
      ? Object.entries(
          noticias.reduce((acc, n) => { acc[n.categoria] = (acc[n.categoria] || 0) + 1; return acc; }, {} as Record<string, number>)
        ).sort((a, b) => b[1] - a[1])[0]?.[0] as CategoriaNoticia | undefined
      : undefined,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-primary" />
            Noticias del sector
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {ultimaActualizacion
              ? `Actualizado ${ultimaActualizacion.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`
              : 'Cargando noticias recientes...'}
          </p>
        </div>
        <Button onClick={() => fetchNoticias()} disabled={isLoading} className="gap-2">
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          {isLoading ? 'Buscando...' : 'Actualizar'}
        </Button>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <Input
          placeholder="Buscar tema específico... (ej: créditos hipotecarios)"
          value={busquedaManual}
          onChange={e => setBusquedaManual(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && busquedaManual && fetchNoticias(busquedaManual)}
          className="flex-1"
        />
        <Button
          variant="outline"
          onClick={() => fetchNoticias(busquedaManual)}
          disabled={isLoading || !busquedaManual}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categorias.map(cat => (
            <button
              key={cat.value}
              onClick={() => setConfig(prev => ({ ...prev, categoria: cat.value as any }))}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap',
                config.categoria === cat.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:bg-accent'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Switch
            checked={config.soloGuardadas}
            onCheckedChange={v => setConfig(prev => ({ ...prev, soloGuardadas: v }))}
          />
          <span className="text-sm text-muted-foreground whitespace-nowrap">Solo guardadas</span>
        </div>
      </div>

      {/* KPI cards */}
      {noticias.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Newspaper className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Noticias</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.alta}</p>
                <p className="text-xs text-muted-foreground">Alta relevancia</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.fuentes}</p>
                <p className="text-xs text-muted-foreground">Fuentes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-bold text-foreground">
                  {stats.topCategoria ? getCategoriaLabel(stats.topCategoria) : '-'}
                </p>
                <p className="text-xs text-muted-foreground">Top categoría</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex justify-between pt-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* News feed */}
      {!isLoading && noticiasFiltradas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {noticiasFiltradas.map(noticia => (
            <Card
              key={noticia.id}
              className={cn(
                'cursor-pointer hover:shadow-md transition-all border',
                noticia.leida && 'opacity-80',
                noticia.relevancia === 'alta' && 'border-l-4 border-l-destructive'
              )}
              onClick={() => { setNoticiaDetalle(noticia); marcarLeida(noticia.id); }}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={getCategoriaClass(noticia.categoria)}>
                      {getCategoriaLabel(noticia.categoria)}
                    </Badge>
                    {noticia.relevancia === 'alta' && (
                      <Badge variant="destructive" className="text-[10px]">Relevante</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{noticia.fecha}</span>
                </div>
                <h3 className="font-semibold text-foreground leading-snug">{noticia.titulo}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">{noticia.resumen}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {noticia.fuente}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={e => { e.stopPropagation(); toggleGuardada(noticia.id); }}
                    >
                      {noticia.guardada
                        ? <BookmarkCheck className="h-4 w-4 text-primary" />
                        : <Bookmark className="h-4 w-4" />}
                    </Button>
                    {noticia.url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={e => { e.stopPropagation(); window.open(noticia.url, '_blank'); }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && noticias.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <Newspaper className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <h3 className="text-lg font-semibold text-foreground">Sin noticias todavía</h3>
          <p className="text-muted-foreground text-sm">
            Hacé click en "Actualizar" para buscar las últimas noticias del sector.
          </p>
          <Button onClick={() => fetchNoticias()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Buscar noticias
          </Button>
        </div>
      )}

      {/* No results after filter */}
      {!isLoading && noticias.length > 0 && noticiasFiltradas.length === 0 && (
        <div className="text-center py-12 space-y-2">
          <p className="text-muted-foreground">No hay noticias con estos filtros.</p>
          <Button variant="outline" size="sm" onClick={() => setConfig({ categoria: 'todas', periodo: 'semana', soloGuardadas: false })}>
            Limpiar filtros
          </Button>
        </div>
      )}

      {/* Detail sheet */}
      <Sheet open={!!noticiaDetalle} onOpenChange={open => !open && setNoticiaDetalle(null)}>
        <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto">
          {noticiaDetalle && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={getCategoriaClass(noticiaDetalle.categoria)}>
                    {getCategoriaLabel(noticiaDetalle.categoria)}
                  </Badge>
                  {noticiaDetalle.relevancia === 'alta' && (
                    <Badge variant="destructive">Alta relevancia</Badge>
                  )}
                </div>
                <SheetTitle className="text-left">{noticiaDetalle.titulo}</SheetTitle>
                <SheetDescription className="text-left">
                  {noticiaDetalle.fuente} · {noticiaDetalle.fecha}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {noticiaDetalle.resumen}
                </p>

                {noticiaDetalle.url && (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setUrlConfirm({ url: noticiaDetalle.url!, fuente: noticiaDetalle.fuente })}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Leer nota completa
                  </Button>
                )}

                <Button
                  variant={noticiaDetalle.guardada ? 'default' : 'outline'}
                  className="w-full gap-2"
                  onClick={() => toggleGuardada(noticiaDetalle.id)}
                >
                  {noticiaDetalle.guardada
                    ? <BookmarkCheck className="h-4 w-4" />
                    : <Bookmark className="h-4 w-4" />}
                  {noticiaDetalle.guardada ? 'Guardada' : 'Guardar noticia'}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirm external link dialog */}
      <Dialog open={!!urlConfirm} onOpenChange={open => !open && setUrlConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Abrir nota en otra pestaña</DialogTitle>
            <DialogDescription>
              Vas a ser redirigido al portal de <span className="font-semibold text-foreground">{urlConfirm?.fuente}</span> para leer la nota completa.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground break-all">
            {urlConfirm?.url}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setUrlConfirm(null)}>
              Cancelar
            </Button>
            <Button
              className="gap-2"
              onClick={() => {
                window.open(urlConfirm?.url, '_blank');
                setUrlConfirm(null);
              }}
            >
              <ExternalLink className="h-4 w-4" />
              Abrir en nueva pestaña
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

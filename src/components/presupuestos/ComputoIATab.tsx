import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useObras, useProveedores } from '@/hooks/useSupabaseData';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  Calculator, Sparkles, Building2, Layers, PaintBucket,
  ArrowRight, DollarSign, TrendingUp, AlertCircle, Lightbulb, FileDown, Loader2, Save, History, FileText
} from 'lucide-react';

interface RubroComputo {
  nombre: string;
  incidencia: number;
  costoMin?: number;
  costoMax?: number;
  costoEstimado: number;
  unidad?: string;
  observaciones?: string;
}

interface ResumenComputo {
  superficie: number;
  tipologia: string;
  ubicacion?: string;
  terminaciones?: string;
  costoM2Estimado: number;
  costoDirectoTotal: number;
  gastosGenerales: number;
  beneficio: number;
  subtotalSinIVA: number;
  iva: number;
  totalConIVA: number;
}

interface ComputoResult {
  resumen: ResumenComputo;
  rubros: RubroComputo[];
  supuestos: string[];
  recomendaciones?: string[];
}

const TIPOLOGIAS = [
  'Vivienda unifamiliar', 'Edificio residencial', 'Oficinas',
  'Comercial / Retail', 'Industrial / Galpón', 'Educativo',
  'Salud / Clínica', 'Hotel / Hotelería', 'Mixto (residencial + comercial)', 'Otro',
];

const TERMINACIONES = [
  { value: 'economica', label: 'Económica', desc: 'Materiales básicos, terminación funcional' },
  { value: 'estandar', label: 'Estándar', desc: 'Materiales de calidad media, buen acabado' },
  { value: 'premium', label: 'Premium', desc: 'Materiales de primera, terminación de alta gama' },
];

const PROVINCIAS = [
  'Buenos Aires', 'CABA', 'Córdoba', 'Santa Fe', 'Mendoza', 'Tucumán',
  'Entre Ríos', 'Salta', 'Misiones', 'Chaco', 'Corrientes', 'Santiago del Estero',
  'San Juan', 'Jujuy', 'Río Negro', 'Neuquén', 'Formosa', 'Chubut',
  'San Luis', 'Catamarca', 'La Rioja', 'La Pampa', 'Santa Cruz', 'Tierra del Fuego',
];

const fmt = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function ComputoIA() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: obras = [] } = useObras();
  const { data: proveedores = [] } = useProveedores();

  const [superficie, setSuperficie] = useState('');
  const [tipologia, setTipologia] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [terminaciones, setTerminaciones] = useState('estandar');
  const [pisos, setPisos] = useState('1');
  const [observaciones, setObservaciones] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ComputoResult | null>(null);

  // Convert to presupuesto dialog
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertForm, setConvertForm] = useState({ numero: '', obra_id: '', proveedor_id: '', descripcion: '' });
  const [converting, setConverting] = useState(false);

  // History
  const { data: historial = [] } = useQuery({
    queryKey: ['computos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('computos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const handleGenerar = async () => {
    if (!superficie || !tipologia || !ubicacion) {
      toast({ title: 'Completá superficie, tipología y ubicación', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('ai-computo', {
        body: { superficie: Number(superficie), tipologia, ubicacion, terminaciones, pisos: Number(pisos), observaciones },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);

      // Save to computos history
      if (user) {
        await supabase.from('computos').insert({
          user_id: user.id,
          superficie: Number(superficie),
          tipologia,
          ubicacion,
          terminaciones,
          pisos: Number(pisos),
          observaciones: observaciones || null,
          resultado: data as any,
        });
        queryClient.invalidateQueries({ queryKey: ['computos'] });
      }
    } catch (e: any) {
      toast({ title: 'Error al generar cómputo', description: e.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const openConvertDialog = () => {
    if (!result) return;
    const now = new Date();
    setConvertForm({
      numero: `COMP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      obra_id: '',
      proveedor_id: '',
      descripcion: `Cómputo IA: ${tipologia} ${superficie}m² - ${ubicacion} (${terminaciones})`,
    });
    setConvertOpen(true);
  };

  const handleConvert = async () => {
    if (!result || !convertForm.numero) {
      toast({ title: 'Completá el número de presupuesto', variant: 'destructive' });
      return;
    }
    setConverting(true);
    try {
      // 1. Insert presupuesto
      const { data: pres, error: presError } = await supabase.from('presupuestos').insert({
        numero: convertForm.numero,
        descripcion: convertForm.descripcion,
        obra_id: convertForm.obra_id || null,
        proveedor_id: convertForm.proveedor_id || null,
        monto_total: result.resumen.totalConIVA,
        moneda: 'USD' as any,
        origen: 'computo_ia',
        datos_computo: {
          superficie: Number(superficie),
          tipologia,
          ubicacion,
          terminaciones,
          pisos: Number(pisos),
          observaciones,
          supuestos: result.supuestos,
          recomendaciones: result.recomendaciones,
          resumen: result.resumen,
        } as any,
      }).select('id').single();

      if (presError) throw presError;

      // 2. Insert rubros
      const rubrosPayload = result.rubros.map(r => ({
        presupuesto_id: pres.id,
        nombre: r.nombre,
        incidencia: r.incidencia,
        costo_min: r.costoMin ?? null,
        costo_max: r.costoMax ?? null,
        costo_estimado: r.costoEstimado,
        unidad: r.unidad || 'gl',
        observaciones: r.observaciones || null,
      }));

      const { error: rubrosError } = await supabase.from('presupuesto_rubros').insert(rubrosPayload);
      if (rubrosError) throw rubrosError;

      toast({ title: 'Presupuesto creado', description: `${convertForm.numero} guardado con ${result.rubros.length} rubros.` });
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
      setConvertOpen(false);
    } catch (e: any) {
      toast({ title: 'Error al convertir', description: e.message, variant: 'destructive' });
    } finally {
      setConverting(false);
    }
  };

  const loadFromHistory = (computo: any) => {
    const r = computo.resultado as any;
    setSuperficie(String(computo.superficie));
    setTipologia(computo.tipologia);
    setUbicacion(computo.ubicacion);
    setTerminaciones(computo.terminaciones);
    setPisos(String(computo.pisos));
    setObservaciones(computo.observaciones || '');
    setResult(r);
  };

  const handleExportCSV = () => {
    if (!result) return;
    const headers = ['Rubro', 'Incidencia %', 'Costo Mín (USD)', 'Costo Máx (USD)', 'Costo Estimado (USD)', 'Unidad', 'Observaciones'];
    const rows = result.rubros.map(r => [
      r.nombre, r.incidencia.toFixed(1), r.costoMin?.toString() || '', r.costoMax?.toString() || '', r.costoEstimado.toString(), r.unidad || 'gl', r.observaciones || '',
    ]);
    rows.push([]);
    rows.push(['Costo Directo', '', '', '', result.resumen.costoDirectoTotal.toString(), '', '']);
    rows.push(['Gastos Generales', '', '', '', result.resumen.gastosGenerales.toString(), '', '']);
    rows.push(['Beneficio', '', '', '', result.resumen.beneficio.toString(), '', '']);
    rows.push(['Subtotal sin IVA', '', '', '', result.resumen.subtotalSinIVA.toString(), '', '']);
    rows.push(['IVA (21%)', '', '', '', result.resumen.iva.toString(), '', '']);
    rows.push(['TOTAL con IVA', '', '', '', result.resumen.totalConIVA.toString(), '', '']);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `computo_${tipologia.replace(/\s/g, '_')}_${superficie}m2.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Input form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" /> Datos del Proyecto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="superficie">Superficie cubierta (m²) *</Label>
              <Input id="superficie" type="number" placeholder="Ej: 250" value={superficie} onChange={e => setSuperficie(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tipología *</Label>
              <Select value={tipologia} onValueChange={setTipologia}>
                <SelectTrigger><SelectValue placeholder="Seleccioná..." /></SelectTrigger>
                <SelectContent>
                  {TIPOLOGIAS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ubicación *</Label>
              <Select value={ubicacion} onValueChange={setUbicacion}>
                <SelectTrigger><SelectValue placeholder="Provincia..." /></SelectTrigger>
                <SelectContent>
                  {PROVINCIAS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nivel de terminaciones</Label>
              <Select value={terminaciones} onValueChange={setTerminaciones}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TERMINACIONES.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      <div>
                        <span className="font-medium">{t.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">{t.desc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pisos">Cantidad de pisos</Label>
              <Input id="pisos" type="number" min="1" max="50" value={pisos} onChange={e => setPisos(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2 lg:col-span-1">
              <Label htmlFor="obs">Observaciones adicionales</Label>
              <Textarea id="obs" placeholder="Ej: incluye pileta, subsuelo cochera, estructura metálica..." value={observaciones} onChange={e => setObservaciones(e.target.value)} rows={2} />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button onClick={handleGenerar} disabled={isLoading} size="lg">
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {isLoading ? 'Generando cómputo...' : 'Generar Cómputo con IA'}
            </Button>
            {result && (
              <>
                <Button variant="outline" onClick={openConvertDialog}>
                  <Save className="h-4 w-4 mr-2" />Convertir en Presupuesto
                </Button>
                <Button variant="outline" onClick={handleExportCSV}>
                  <FileDown className="h-4 w-4 mr-2" />Exportar CSV
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading state */}
      {isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-4" />
            <p className="font-medium">Analizando tipología y calculando costos...</p>
            <p className="text-sm text-muted-foreground mt-1">La IA está estimando precios de mercado para cada rubro de obra.</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{fmt(result.resumen.totalConIVA)}</p>
                <p className="text-xs text-muted-foreground">Total con IVA</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{fmt(result.resumen.costoM2Estimado)}</p>
                <p className="text-xs text-muted-foreground">USD/m²</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Layers className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{result.rubros.length}</p>
                <p className="text-xs text-muted-foreground">Rubros</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <PaintBucket className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold capitalize">{result.resumen.terminaciones || terminaciones}</p>
                <p className="text-xs text-muted-foreground">Terminaciones</p>
              </CardContent>
            </Card>
          </div>

          {/* Desglose por rubros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Desglose por Rubros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rubro</TableHead>
                      <TableHead className="text-right">Incidencia</TableHead>
                      <TableHead className="text-right">Costo Mín</TableHead>
                      <TableHead className="text-right">Costo Estimado</TableHead>
                      <TableHead className="text-right">Costo Máx</TableHead>
                      <TableHead className="hidden md:table-cell">Barra</TableHead>
                      <TableHead className="hidden lg:table-cell">Obs.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.rubros.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{r.nombre}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{r.incidencia.toFixed(1)}%</Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">{r.costoMin ? fmt(r.costoMin) : '—'}</TableCell>
                        <TableCell className="text-right font-semibold">{fmt(r.costoEstimado)}</TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">{r.costoMax ? fmt(r.costoMax) : '—'}</TableCell>
                        <TableCell className="hidden md:table-cell w-32">
                          <Progress value={r.incidencia} className="h-2" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-[200px] truncate">{r.observaciones || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totales */}
              <Separator className="my-4" />
              <div className="space-y-2 max-w-md ml-auto text-sm">
                <div className="flex justify-between"><span>Costo Directo</span><span className="font-medium">{fmt(result.resumen.costoDirectoTotal)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Gastos Generales</span><span>{fmt(result.resumen.gastosGenerales)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Beneficio</span><span>{fmt(result.resumen.beneficio)}</span></div>
                <Separator />
                <div className="flex justify-between"><span>Subtotal sin IVA</span><span className="font-medium">{fmt(result.resumen.subtotalSinIVA)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>IVA (21%)</span><span>{fmt(result.resumen.iva)}</span></div>
                <Separator />
                <div className="flex justify-between text-lg font-bold"><span>TOTAL con IVA</span><span className="text-primary">{fmt(result.resumen.totalConIVA)}</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Supuestos y Recomendaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Supuestos asumidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {result.supuestos.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <ArrowRight className="h-3 w-3 mt-1 shrink-0" />{s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            {result.recomendaciones && result.recomendaciones.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" /> Recomendaciones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {result.recomendaciones.map((r, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <ArrowRight className="h-3 w-3 mt-1 shrink-0" />{r}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
            ⚠️ Esta estimación es orientativa y se basa en precios promedio de mercado. Los costos reales pueden variar según disponibilidad de materiales, mano de obra local, accesibilidad del terreno y condiciones específicas del proyecto. Se recomienda validar con presupuestos formales de contratistas.
          </p>
        </>
      )}

      {/* Historial de cómputos */}
      {historial.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5" /> Historial de Cómputos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {historial.map((c: any) => {
                const r = c.resultado as any;
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => loadFromHistory(c)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {c.tipologia} — {c.superficie}m² — {c.ubicacion}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString('es-AR')} • {c.terminaciones} • {c.pisos} piso(s)
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-sm">{fmt(r?.resumen?.totalConIVA || 0)}</p>
                      {c.presupuesto_id && (
                        <Badge variant="secondary" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />Convertido
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Convert to Presupuesto Dialog */}
      <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Convertir en Presupuesto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Número de Presupuesto *</Label>
              <Input value={convertForm.numero} onChange={e => setConvertForm({ ...convertForm, numero: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea value={convertForm.descripcion} onChange={e => setConvertForm({ ...convertForm, descripcion: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Obra (opcional)</Label>
                <Select value={convertForm.obra_id} onValueChange={v => setConvertForm({ ...convertForm, obra_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {obras.map(o => <SelectItem key={o.id} value={o.id}>{o.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Proveedor (opcional)</Label>
                <Select value={convertForm.proveedor_id} onValueChange={v => setConvertForm({ ...convertForm, proveedor_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {proveedores.map(pr => <SelectItem key={pr.id} value={pr.id}>{pr.razon_social}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {result && (
              <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between"><span>Monto total</span><span className="font-bold">{fmt(result.resumen.totalConIVA)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Rubros</span><span>{result.rubros.length} ítems</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Moneda</span><span>USD</span></div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertOpen(false)}>Cancelar</Button>
            <Button onClick={handleConvert} disabled={converting}>
              {converting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</> : 'Crear Presupuesto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

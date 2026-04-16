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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Calculator, Sparkles, Building2, MapPin, Layers, PaintBucket,
  ArrowRight, DollarSign, TrendingUp, AlertCircle, Lightbulb, FileDown, Loader2
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
  'Vivienda unifamiliar',
  'Edificio residencial',
  'Oficinas',
  'Comercial / Retail',
  'Industrial / Galpón',
  'Educativo',
  'Salud / Clínica',
  'Hotel / Hotelería',
  'Mixto (residencial + comercial)',
  'Otro',
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
  const [superficie, setSuperficie] = useState('');
  const [tipologia, setTipologia] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [terminaciones, setTerminaciones] = useState('estandar');
  const [pisos, setPisos] = useState('1');
  const [observaciones, setObservaciones] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ComputoResult | null>(null);

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
    } catch (e: any) {
      toast({ title: 'Error al generar cómputo', description: e.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
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
              <Button variant="outline" onClick={handleExportCSV}>
                <FileDown className="h-4 w-4 mr-2" />Exportar CSV
              </Button>
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
    </div>
  );
}

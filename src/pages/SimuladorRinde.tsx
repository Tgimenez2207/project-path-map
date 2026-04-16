import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, Download, Sparkles, TrendingUp, TrendingDown, AlertTriangle, DollarSign, Building2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const fmt = (n: number) => n.toLocaleString('es-AR', { maximumFractionDigits: 0 });
const fmtPct = (n: number) => n.toFixed(1);

type Escenario = 'optimista' | 'base' | 'conservador';

export default function SimuladorRinde() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [inputs, setInputs] = useState({
    nombre: '',
    tipo: 'residencial_ph',
    supTerreno: 0,
    supConstruida: 0,
    numUnidades: 0,
    cTerreno: 0,
    cConstruccionM2: 0,
    pHonorarios: 8,
    pComercializacion: 4,
    pImprevistos: 5,
    pImpuestos: 3,
    cFinanciamiento: 0,
    pvM2: 0,
    pctVendidas: 85,
    plazoMeses: 30,
  });

  const [escenario, setEscenario] = useState<Escenario>('base');
  const [isLoadingIA, setIsLoadingIA] = useState(false);
  const [analisisIA, setAnalisisIA] = useState<string | null>(null);

  const set = (key: keyof typeof inputs, value: string | number) =>
    setInputs((p) => ({ ...p, [key]: value }));

  const resultados = useMemo(() => {
    const mult = { optimista: 1, base: 0.92, conservador: 0.82 }[escenario];
    const cConst = inputs.supConstruida * inputs.cConstruccionM2;
    const baseObra = inputs.cTerreno + cConst;
    const cHonorarios = baseObra * (inputs.pHonorarios / 100);
    const cComercializacion = baseObra * (inputs.pComercializacion / 100);
    const cImprevistos = baseObra * (inputs.pImprevistos / 100);
    const cImpuestos = baseObra * (inputs.pImpuestos / 100);
    const costoTotal = baseObra + cHonorarios + cComercializacion + cImprevistos + cImpuestos + inputs.cFinanciamiento;
    const ingresosBrutos = inputs.supConstruida * inputs.pvM2 * (inputs.pctVendidas / 100) * mult;
    const utilidadNeta = ingresosBrutos - costoTotal;
    const margenSobreCostos = costoTotal > 0 ? (utilidadNeta / costoTotal) * 100 : 0;
    const costoM2 = inputs.supConstruida > 0 ? costoTotal / inputs.supConstruida : 0;
    const pvSugeridoM2 = costoM2 * 1.3;
    const supPorUnidad = inputs.numUnidades > 0 ? inputs.supConstruida / inputs.numUnidades : 0;
    const ingresoXUnidad = inputs.pvM2 * supPorUnidad;
    const puntoEquilibrio = ingresoXUnidad > 0 ? Math.ceil(costoTotal / ingresoXUnidad) : 0;
    const roiAnualizado = inputs.plazoMeses > 0 && costoTotal > 0
      ? (utilidadNeta / costoTotal) * (12 / inputs.plazoMeses) * 100 : 0;

    return {
      costoTotal, cConst, cHonorarios, cComercializacion,
      cImprevistos, cImpuestos, ingresosBrutos,
      utilidadNeta, margenSobreCostos, costoM2,
      pvSugeridoM2, puntoEquilibrio, roiAnualizado,
    };
  }, [inputs, escenario]);

  const handleAnalisisIA = async () => {
    setIsLoadingIA(true);
    setAnalisisIA(null);
    try {
      const { data, error } = await supabase.functions.invoke('ai-rinde', {
        body: { inputs, resultados, escenario },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: 'Error IA', description: data.error, variant: 'destructive' });
      } else {
        setAnalisisIA(data.analisis);
      }
    } catch (e: any) {
      toast({ title: 'Error', description: 'No se pudo conectar con la IA. Intentá de nuevo.', variant: 'destructive' });
    } finally {
      setIsLoadingIA(false);
    }
  };

  const handleExportPDF = () => window.print();

  const costBreakdown = [
    { rubro: 'Terreno', valor: inputs.cTerreno, color: 'bg-blue-500' },
    { rubro: 'Construcción', valor: resultados.cConst, color: 'bg-amber-500' },
    { rubro: 'Honorarios', valor: resultados.cHonorarios, color: 'bg-teal-500' },
    { rubro: 'Comercialización', valor: resultados.cComercializacion, color: 'bg-teal-400' },
    { rubro: 'Imprevistos', valor: resultados.cImprevistos, color: 'bg-red-400' },
    { rubro: 'Impuestos', valor: resultados.cImpuestos, color: 'bg-red-300' },
    { rubro: 'Financiamiento', valor: inputs.cFinanciamiento, color: 'bg-red-500' },
  ].filter((r) => r.valor > 0);

  const kpiColor = (val: number, thresholds: [number, number]) =>
    val >= thresholds[1] ? 'text-green-600' : val >= thresholds[0] ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calculator className="h-6 w-6 text-primary" /> Simulador de Rinde
            </h1>
            <p className="text-muted-foreground text-sm">Calculá la rentabilidad de tu proyecto inmobiliario</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}><Download className="h-4 w-4 mr-1" />Exportar PDF</Button>
          <Button onClick={handleAnalisisIA} disabled={isLoadingIA} className="gradient-rappi text-white border-0">
            <Sparkles className="h-4 w-4 mr-1" />{isLoadingIA ? 'Analizando...' : 'Analizar con IA'}
          </Button>
        </div>
      </div>

      {/* Escenario selector */}
      <div className="flex gap-2 print:hidden">
        {(['optimista', 'base', 'conservador'] as Escenario[]).map((e) => (
          <button
            key={e}
            onClick={() => setEscenario(e)}
            className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${
              escenario === e ? 'border-primary text-primary bg-accent' : 'border-muted text-muted-foreground hover:border-primary/40'
            }`}
          >
            {e} {e === 'optimista' ? '(×1.0)' : e === 'base' ? '(×0.92)' : '(×0.82)'}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT: Form */}
        <div className="lg:col-span-3 space-y-6 formulario-col print:hidden">
          {/* Card 1 — Datos del proyecto */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Datos del proyecto</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nombre del proyecto</Label>
                <Input value={inputs.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Ej: Torres del Sol" />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={inputs.tipo} onValueChange={(v) => set('tipo', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="edificio">Edificio</SelectItem>
                    <SelectItem value="residencial_ph">Residencial PH</SelectItem>
                    <SelectItem value="casa_duplex">Casa / Duplex</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="mixto">Mixto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <NumField label="Sup. terreno (m²)" value={inputs.supTerreno} onChange={(v) => set('supTerreno', v)} />
                <NumField label="Sup. construida (m²)" value={inputs.supConstruida} onChange={(v) => set('supConstruida', v)} />
                <NumField label="Nº de unidades" value={inputs.numUnidades} onChange={(v) => set('numUnidades', v)} />
                <NumField label="Plazo (meses)" value={inputs.plazoMeses} onChange={(v) => set('plazoMeses', v)} />
              </div>
            </CardContent>
          </Card>

          {/* Card 2 — Costos */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Estructura de costos</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <NumField label="Valor del terreno (USD)" value={inputs.cTerreno} onChange={(v) => set('cTerreno', v)} prefix="USD" />
              <NumField label="Costo construcción por m² (USD/m²)" value={inputs.cConstruccionM2} onChange={(v) => set('cConstruccionM2', v)} prefix="USD/m²" />
              <Separator />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Porcentajes sobre costo de obra</p>
              <PctField label="Honorarios profesionales" value={inputs.pHonorarios} onChange={(v) => set('pHonorarios', v)} />
              <PctField label="Comercialización" value={inputs.pComercializacion} onChange={(v) => set('pComercializacion', v)} />
              <PctField label="Imprevistos" value={inputs.pImprevistos} onChange={(v) => set('pImprevistos', v)} />
              <PctField label="Impuestos y sellados" value={inputs.pImpuestos} onChange={(v) => set('pImpuestos', v)} />
              <NumField label="Financiamiento / intereses (USD)" value={inputs.cFinanciamiento} onChange={(v) => set('cFinanciamiento', v)} prefix="USD" />
            </CardContent>
          </Card>

          {/* Card 3 — Venta */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Precio de venta</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <NumField label="Precio de venta por m² (USD)" value={inputs.pvM2} onChange={(v) => set('pvM2', v)} prefix="USD" />
              <PctField label="% unidades a vender" value={inputs.pctVendidas} onChange={(v) => set('pctVendidas', v)} max={100} />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Results */}
        <div className="lg:col-span-2 space-y-6 resultados-col lg:sticky lg:top-4 lg:self-start">
          {/* Print header */}
          <div className="hidden print:block mb-4">
            <h1 className="text-xl font-bold">{inputs.nombre || 'Simulador de Rinde'}</h1>
            <p className="text-sm text-muted-foreground">Escenario: {escenario} • {new Date().toLocaleDateString('es-AR')}</p>
          </div>

          <Badge variant="outline" className="capitalize">{escenario}</Badge>

          {/* Primary KPIs */}
          <div className="grid grid-cols-2 gap-3">
            <KPICard title="Utilidad neta" value={`USD ${fmt(resultados.utilidadNeta)}`} className={resultados.utilidadNeta >= 0 ? 'text-green-600' : 'text-red-600'} icon={resultados.utilidadNeta >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />} />
            <KPICard title="Margen s/ costos" value={`${fmtPct(resultados.margenSobreCostos)}%`} className={kpiColor(resultados.margenSobreCostos, [10, 20])} icon={<BarChart3 className="h-4 w-4" />} />
            <KPICard title="ROI anualizado" value={`${fmtPct(resultados.roiAnualizado)}%`} className={kpiColor(resultados.roiAnualizado, [10, 20])} icon={<TrendingUp className="h-4 w-4" />} />
            <KPICard title="Pto. equilibrio" value={`${resultados.puntoEquilibrio} uds`} className="text-amber-600" icon={<AlertTriangle className="h-4 w-4" />} />
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-2 gap-3">
            <KPICard title="Costo total" value={`USD ${fmt(resultados.costoTotal)}`} className="text-foreground" icon={<DollarSign className="h-4 w-4" />} />
            <KPICard title="Ingreso bruto" value={`USD ${fmt(resultados.ingresosBrutos)}`} className="text-foreground" icon={<DollarSign className="h-4 w-4" />} />
            <KPICard title="Costo / m²" value={`USD ${fmt(resultados.costoM2)}`} className="text-foreground" icon={<Building2 className="h-4 w-4" />} />
            <KPICard title="PV sugerido / m²" value={`USD ${fmt(resultados.pvSugeridoM2)}`} className="text-foreground" icon={<Building2 className="h-4 w-4" />} />
          </div>

          {/* Desglose table */}
          {resultados.costoTotal > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Desglose de costos</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rubro</TableHead>
                      <TableHead className="text-right">USD</TableHead>
                      <TableHead className="text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {costBreakdown.map((r) => (
                      <TableRow key={r.rubro}>
                        <TableCell className="py-1.5 text-sm">{r.rubro}</TableCell>
                        <TableCell className="py-1.5 text-sm text-right">{fmt(r.valor)}</TableCell>
                        <TableCell className="py-1.5 text-sm text-right">{fmtPct((r.valor / resultados.costoTotal) * 100)}%</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold border-t-2">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right">{fmt(resultados.costoTotal)}</TableCell>
                      <TableCell className="text-right">100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                {/* Composition bars */}
                <div className="mt-4 flex rounded-full overflow-hidden h-4">
                  {costBreakdown.map((r) => (
                    <div
                      key={r.rubro}
                      className={`${r.color} transition-all`}
                      style={{ width: `${(r.valor / resultados.costoTotal) * 100}%` }}
                      title={`${r.rubro}: ${fmtPct((r.valor / resultados.costoTotal) * 100)}%`}
                    />
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {costBreakdown.map((r) => (
                    <div key={r.rubro} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className={`w-2.5 h-2.5 rounded-full ${r.color}`} />
                      {r.rubro}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* IA Analysis */}
          {(isLoadingIA || analisisIA) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Análisis IA</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingIA ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{analisisIA}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- Sub-components ---- */

function NumField({ label, value, onChange, prefix }: { label: string; value: number; onChange: (v: number) => void; prefix?: string }) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <Input
        type="number"
        min={0}
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        placeholder={prefix || '0'}
      />
    </div>
  );
}

function PctField({ label, value, onChange, max = 50 }: { label: string; value: number; onChange: (v: number) => void; max?: number }) {
  return (
    <div className="flex items-end gap-3">
      <div className="flex-1">
        <Label className="text-sm">{label}</Label>
        <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={0} max={max} step={0.5} />
      </div>
      <div className="w-20 shrink-0">
        <Input
          type="number"
          min={0}
          max={max}
          step={0.5}
          value={value}
          onChange={(e) => onChange(Math.min(Number(e.target.value) || 0, max))}
          className="text-center"
        />
      </div>
      <span className="text-sm text-muted-foreground pb-2">%</span>
    </div>
  );
}

function KPICard({ title, value, className, icon }: { title: string; value: string; className: string; icon: React.ReactNode }) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{title}</span>
      </div>
      <p className={`text-lg font-bold ${className}`}>{value}</p>
    </Card>
  );
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Sparkles } from 'lucide-react';
import PresupuestosListTab from '@/components/presupuestos/PresupuestosListTab';
import ComputoIATab from '@/components/presupuestos/ComputoIATab';

export default function Presupuestos() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Presupuestos y Cómputo</h1>
        <p className="text-muted-foreground">Gestión de presupuestos y estimaciones con IA</p>
      </div>

      <Tabs defaultValue="presupuestos" className="w-full">
        <TabsList>
          <TabsTrigger value="presupuestos" className="gap-2">
            <FileText className="h-4 w-4" />
            Presupuestos
          </TabsTrigger>
          <TabsTrigger value="computo" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Cómputo IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="presupuestos">
          <PresupuestosListTab />
        </TabsContent>

        <TabsContent value="computo">
          <ComputoIATab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

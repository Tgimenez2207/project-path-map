import { FileText, Download, Eye, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock documents
const documentosMock = [
  {
    id: 'doc-001',
    nombre: 'Boleto de Compraventa',
    tipo: 'contrato',
    fecha: '2024-06-15',
    unidad: '1A',
  },
  {
    id: 'doc-002',
    nombre: 'Plano de Unidad',
    tipo: 'plano',
    fecha: '2024-06-15',
    unidad: '1A',
  },
  {
    id: 'doc-003',
    nombre: 'Reglamento de Copropiedad',
    tipo: 'legal',
    fecha: '2024-03-01',
    unidad: null,
  },
  {
    id: 'doc-004',
    nombre: 'Especificaciones Técnicas',
    tipo: 'tecnico',
    fecha: '2024-03-01',
    unidad: null,
  },
];

const tipoConfig: Record<string, { label: string; color: string }> = {
  contrato: { label: 'Contrato', color: 'bg-primary/10 text-primary' },
  plano: { label: 'Plano', color: 'bg-info/10 text-info' },
  legal: { label: 'Legal', color: 'bg-warning/10 text-warning' },
  tecnico: { label: 'Técnico', color: 'bg-muted text-muted-foreground' },
};

export default function PortalDocumentos() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold">Documentación</h1>
        <p className="text-muted-foreground">
          Acceda a sus contratos, planos y documentación legal.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Mis Documentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documentosMock.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{doc.nombre}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(doc.fecha).toLocaleDateString('es-AR')}
                      {doc.unidad && <span>• Unidad {doc.unidad}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={tipoConfig[doc.tipo].color}>
                    {tipoConfig[doc.tipo].label}
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { FileText, Plus, Download, Trash2, Upload, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const tipoConfig: Record<string, { label: string; className: string }> = {
  plano: { label: 'Plano', className: 'bg-info/10 text-info' },
  contrato: { label: 'Contrato', className: 'bg-primary/10 text-primary' },
  permiso: { label: 'Permiso', className: 'bg-warning/10 text-warning' },
  informe: { label: 'Informe', className: 'bg-success/10 text-success' },
  otro: { label: 'Otro', className: 'bg-muted text-muted-foreground' },
};

interface Props {
  obraId: string;
}

export default function DocumentosTab({ obraId }: Props) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('otro');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ['documentos_obra', obraId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documentos_obra')
        .select('*')
        .eq('obra_id', obraId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (doc: { id: string; archivo_url: string }) => {
      // Extract path from URL
      const urlParts = doc.archivo_url.split('/documentos/');
      if (urlParts[1]) {
        await supabase.storage.from('documentos').remove([urlParts[1]]);
      }
      const { error } = await supabase.from('documentos_obra').delete().eq('id', doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos_obra', obraId] });
      toast.success('Documento eliminado');
    },
    onError: () => toast.error('Error al eliminar documento'),
  });

  const handleUpload = async () => {
    if (!file || !nombre.trim()) {
      toast.error('Completá nombre y archivo');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${obraId}/${Date.now()}_${file.name}`;

      const { error: storageError } = await supabase.storage
        .from('documentos')
        .upload(path, file);

      if (storageError) throw storageError;

      const { data: urlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(path);

      const { error: dbError } = await supabase.from('documentos_obra').insert({
        obra_id: obraId,
        nombre: nombre.trim(),
        tipo,
        archivo_url: urlData.publicUrl,
        archivo_nombre: file.name,
        tamano: file.size,
        subido_por: 'Usuario',
      });

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ['documentos_obra', obraId] });
      toast.success('Documento subido exitosamente');
      setOpen(false);
      setNombre('');
      setTipo('otro');
      setFile(null);
    } catch (err) {
      console.error(err);
      toast.error('Error al subir documento');
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Documentos de la obra</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Subir documento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Subir documento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Nombre</Label>
                <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Plano de planta baja" />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plano">Plano</SelectItem>
                    <SelectItem value="contrato">Contrato</SelectItem>
                    <SelectItem value="permiso">Permiso</SelectItem>
                    <SelectItem value="informe">Informe</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Archivo</Label>
                <div className="mt-1">
                  <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {file ? file.name : 'Seleccionar archivo (máx. 20MB)'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.dwg,.dxf"
                    />
                  </label>
                </div>
              </div>
              <Button onClick={handleUpload} disabled={uploading} className="w-full">
                {uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Subiendo...</> : 'Subir documento'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {documentos.length === 0 ? (
        <div className="empty-state">
          <FileText className="empty-state-icon" />
          <h3 className="empty-state-title">Sin documentos</h3>
          <p className="text-sm text-muted-foreground">Subí planos, contratos o permisos relacionados a esta obra.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documentos.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{doc.nombre}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(doc.created_at).toLocaleDateString('es-AR')}
                        {doc.tamano && <span>• {formatSize(doc.tamano)}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={tipoConfig[doc.tipo]?.className || tipoConfig.otro.className}>
                      {tipoConfig[doc.tipo]?.label || 'Otro'}
                    </Badge>
                    <a href={doc.archivo_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                    </a>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate({ id: doc.id, archivo_url: doc.archivo_url })}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

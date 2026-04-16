
-- Create documentos_obra table
CREATE TABLE public.documentos_obra (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL DEFAULT 'otro',
  archivo_url TEXT NOT NULL,
  archivo_nombre TEXT NOT NULL,
  tamano BIGINT,
  subido_por TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.documentos_obra ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view documentos" ON public.documentos_obra
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert documentos" ON public.documentos_obra
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update documentos" ON public.documentos_obra
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete documentos" ON public.documentos_obra
  FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_documentos_obra_updated_at
  BEFORE UPDATE ON public.documentos_obra
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos', 'documentos', true);

-- Storage policies
CREATE POLICY "Anyone can view documentos" ON storage.objects
  FOR SELECT USING (bucket_id = 'documentos');

CREATE POLICY "Authenticated users can upload documentos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documentos');

CREATE POLICY "Authenticated users can update documentos" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'documentos');

CREATE POLICY "Authenticated users can delete documentos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'documentos');

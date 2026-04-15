
-- Notifications table for automated alerts
CREATE TABLE public.notificaciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tipo TEXT NOT NULL, -- 'vehiculo_vencimiento', 'cuota_pendiente', 'obra_planificacion', 'tarea_vencida'
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  referencia_id UUID, -- ID del recurso relacionado
  referencia_tipo TEXT, -- 'vehiculo', 'cuota', 'obra', 'tarea'
  leida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notificaciones" ON public.notificaciones
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notificaciones" ON public.notificaciones
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Service can insert notificaciones" ON public.notificaciones
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can delete own notificaciones" ON public.notificaciones
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notificaciones;

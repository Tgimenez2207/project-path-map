
DROP POLICY "Service can insert notificaciones" ON public.notificaciones;
CREATE POLICY "Admins can insert notificaciones" ON public.notificaciones
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

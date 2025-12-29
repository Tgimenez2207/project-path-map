import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { HardHat, Mail, Lock, User } from 'lucide-react';
import { PortalProvider, usePortal } from '@/contexts/PortalContext';
import { mockClientes } from '@/data/mockClientes';
import { mockCompradores } from '@/data/mockUnidades';

function PortalLoginContent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, loginWithEmail } = usePortal();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCliente, setSelectedCliente] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Obtener clientes que tienen unidades (compradores)
  const clientesConUnidades = mockClientes.filter((cliente) =>
    mockCompradores.some((c) => c.clienteId === cliente.id)
  );

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simular delay de autenticación
    await new Promise((resolve) => setTimeout(resolve, 800));

    const success = loginWithEmail(email, password);
    if (success) {
      toast({
        title: 'Bienvenido',
        description: 'Ingreso exitoso al portal.',
      });
      navigate('/portal');
    } else {
      toast({
        title: 'Error de autenticación',
        description: 'Email o contraseña incorrectos.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleDemoLogin = () => {
    if (!selectedCliente) {
      toast({
        title: 'Seleccione un cliente',
        description: 'Debe seleccionar un cliente para continuar.',
        variant: 'destructive',
      });
      return;
    }

    const success = login(selectedCliente);
    if (success) {
      toast({
        title: 'Modo Demo',
        description: 'Ingresando como cliente de demostración.',
      });
      navigate('/portal');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary mb-4">
            <HardHat className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Portal del Cliente</h1>
          <p className="text-muted-foreground mt-1">Sistema de Gestión de Obras</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>
              Acceda a su portal para ver sus unidades, pagos y documentación.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="demo" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="demo">Modo Demo</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
              </TabsList>

              <TabsContent value="demo">
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm">
                    <p className="font-medium text-primary">Modo Demostración</p>
                    <p className="text-muted-foreground mt-1">
                      Seleccione un cliente para explorar el portal.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Seleccionar Cliente</Label>
                    <Select value={selectedCliente} onValueChange={setSelectedCliente}>
                      <SelectTrigger>
                        <SelectValue placeholder="Elegir cliente..." />
                      </SelectTrigger>
                      <SelectContent>
                        {clientesConUnidades.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {cliente.nombre}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full" onClick={handleDemoLogin}>
                    Ingresar al Portal
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="email">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="su@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Credenciales de prueba:</p>
                    <p>Email: jcperez@email.com</p>
                    <p>Contraseña: demo123</p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿Problemas para ingresar?{' '}
          <a href="#" className="text-primary hover:underline">
            Contactar soporte
          </a>
        </p>
      </div>
    </div>
  );
}

export default function PortalLogin() {
  return (
    <PortalProvider>
      <PortalLoginContent />
    </PortalProvider>
  );
}

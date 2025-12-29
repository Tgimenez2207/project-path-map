import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  DollarSign,
  Users,
  Package,
  Plus,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { mockObras } from '@/data/mockObras';
import { mockUnidades } from '@/data/mockUnidades';
import { mockClientes } from '@/data/mockClientes';

export default function Dashboard() {
  const { user, role } = useAuth();

  // Mock cotización dólar
  const cotizacion = {
    oficial: 1025,
    blue: 1180,
    fecha: new Date().toLocaleDateString('es-AR'),
  };

  const stats = [
    {
      title: 'Obras Activas',
      value: mockObras.filter((o) => o.estado === 'en_curso').length,
      icon: Building2,
      change: '+1 este mes',
      color: 'text-primary',
    },
    {
      title: 'Unidades Vendidas',
      value: mockUnidades.filter((u) => u.estado === 'vendida').length,
      total: mockUnidades.length,
      icon: Package,
      change: '25% del total',
      color: 'text-success',
    },
    {
      title: 'Clientes Activos',
      value: mockClientes.length,
      icon: Users,
      change: '+2 este mes',
      color: 'text-info',
    },
    {
      title: 'Cobros Pendientes',
      value: 'USD 9.831',
      icon: DollarSign,
      change: '2 cuotas vencidas',
      color: 'text-warning',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Bienvenido, {user?.nombre?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground">
            Panel de control del Sistema de Gestión de Obras
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Card className="px-4 py-2">
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-success" />
              <div className="text-sm">
                <span className="text-muted-foreground">Dólar: </span>
                <span className="font-medium">${cotizacion.oficial}</span>
                <span className="text-muted-foreground"> / Blue: </span>
                <span className="font-medium">${cotizacion.blue}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value}
                {stat.total && (
                  <span className="text-sm font-normal text-muted-foreground">
                    /{stat.total}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <Plus className="h-5 w-5" />
              <span>Nueva Obra</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <DollarSign className="h-5 w-5" />
              <span>Registrar Pago</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <Package className="h-5 w-5" />
              <span>Nueva Unidad</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <Users className="h-5 w-5" />
              <span>Nuevo Cliente</span>
            </Button>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Alertas y Recordatorios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div>
                <p className="font-medium text-sm">Cuota vencida - Unidad 1A</p>
                <p className="text-xs text-muted-foreground">Vencimiento: 01/12/2024</p>
              </div>
              <Badge variant="destructive">Vencido</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
              <div>
                <p className="font-medium text-sm">VTV próximo a vencer</p>
                <p className="text-xs text-muted-foreground">Hilux AB 123 CD - 15/01/2025</p>
              </div>
              <Badge className="bg-warning text-warning-foreground">Próximo</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <p className="font-medium text-sm">Stock bajo: Hierro Ø12</p>
                <p className="text-xs text-muted-foreground">85 barras (mínimo: 100)</p>
              </div>
              <Button variant="ghost" size="sm">
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Obras Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Obras en Curso</CardTitle>
          <Button variant="ghost" size="sm">
            Ver todas <ArrowUpRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockObras.map((obra) => (
              <div
                key={obra.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{obra.nombre}</h3>
                    <p className="text-sm text-muted-foreground">{obra.direccion}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{obra.progreso}%</p>
                    <p className="text-xs text-muted-foreground">Avance</p>
                  </div>
                  <Badge
                    variant={obra.estado === 'en_curso' ? 'default' : 'secondary'}
                  >
                    {obra.estado === 'en_curso' ? 'En curso' : 'Planificación'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

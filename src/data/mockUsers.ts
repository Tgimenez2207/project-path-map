import { User } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'user-001',
    nombre: 'Martín Rodríguez',
    email: 'admin@sgo.com',
    rol: 'admin',
    activo: true,
  },
  {
    id: 'user-002',
    nombre: 'Laura Fernández',
    email: 'operaciones@sgo.com',
    rol: 'operaciones',
    activo: true,
  },
  {
    id: 'user-003',
    nombre: 'Carlos Gómez',
    email: 'finanzas@sgo.com',
    rol: 'finanzas',
    activo: true,
  },
  {
    id: 'user-004',
    nombre: 'Ana Martínez',
    email: 'ventas@sgo.com',
    rol: 'ventas',
    activo: true,
  },
  {
    id: 'user-005',
    nombre: 'Roberto López',
    email: 'cliente@ejemplo.com',
    rol: 'cliente',
    activo: true,
  },
];

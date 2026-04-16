import type { ProveedorDirectorio, ReseñaDirectorio } from '@/types/directorio';

export const calcRating = (reseñas: ReseñaDirectorio[]): number => {
  if (!reseñas.length) return 0;
  const sum = reseñas.reduce((a, r) =>
    a + (r.puntualidad + r.calidad + r.precio + r.comunicacion) / 4, 0);
  return Math.round((sum / reseñas.length) * 10) / 10;
};

const r = (id: string, autorNombre: string, autorEmpresa: string, fecha: string, p: number, ca: number, pr: number, co: number, comentario: string, obraRealizada?: string): ReseñaDirectorio => ({
  id, autorNombre, autorEmpresa, fecha, puntualidad: p, calidad: ca, precio: pr, comunicacion: co, comentario, obraRealizada, reportada: false,
});

export const mockDirectorio: ProveedorDirectorio[] = [
  {
    id: 'dir-001', razonSocial: 'Electro Sur SRL', rubro: 'electricista', subrubro: 'Instalaciones eléctricas industriales',
    descripcion: 'Especialistas en instalaciones eléctricas de media y baja tensión para edificios residenciales y comerciales.',
    contacto: 'Carlos Méndez', telefono: '011-4555-8901', email: 'cmendez@electrosur.com.ar', web: 'https://electrosur.com.ar',
    ciudad: 'CABA', provincia: 'CABA', zonasCobertura: ['CABA', 'Buenos Aires', 'La Plata'],
    cuit: '30-71234567-8', verificado: true, disponibilidad: 'disponible', origen: 'nato',
    reseñas: [
      r('r01', 'Martín López', 'Constructora Norte', '2025-11-15', 5, 5, 4, 5, 'Excelente trabajo en Torre Mirador. Cumplieron plazos y la calidad fue impecable.', 'Torre Mirador del Parque'),
      r('r02', 'Ana García', 'DG Desarrollos', '2025-09-20', 4, 5, 4, 4, 'Muy profesionales, presupuesto justo. Recomiendo.', 'Complejo Las Acacias'),
      r('r03', 'Roberto Díaz', 'Inmobiliaria Central', '2025-06-10', 5, 4, 3, 5, 'Buen servicio, un poco caro pero vale la pena.'),
      r('r04', 'Lucía Fernández', 'Obras del Litoral', '2025-03-01', 4, 5, 4, 4, 'Trabajo prolijo y entregado a tiempo.', 'Edificio Riviera'),
      r('r05', 'Diego Morales', 'ByD Constructora', '2024-12-15', 5, 5, 5, 5, 'Los mejores electricistas con los que trabajé.'),
    ],
    yaImportado: true, guardado: false,
  },
  {
    id: 'dir-002', razonSocial: 'Sanitarios Rosario SA', rubro: 'plomero', subrubro: 'Plomería y gas',
    descripcion: 'Instalaciones sanitarias y de gas para obras nuevas y remodelaciones. 20 años de experiencia.',
    contacto: 'Jorge Ruiz', telefono: '0341-456-7890', email: 'info@sanitariosrosario.com.ar',
    ciudad: 'Rosario', provincia: 'Santa Fe', zonasCobertura: ['Santa Fe', 'Rosario', 'Paraná'],
    cuit: '30-65432198-5', verificado: true, disponibilidad: 'disponible', origen: 'nato',
    reseñas: [
      r('r06', 'Pedro Sánchez', 'Constructora Delta', '2025-10-05', 4, 4, 5, 4, 'Muy buen precio y calidad. Terminaron antes del plazo.', 'Barrio Cerrado Los Olivos'),
      r('r07', 'María Torres', 'Proyectos Sur', '2025-07-18', 3, 4, 5, 3, 'Buenos precios, la comunicación podría mejorar.'),
      r('r08', 'Luis Peralta', 'LP Desarrollos', '2025-04-22', 4, 5, 4, 4, 'Profesionales y confiables.', 'Complejo Rivadavia'),
    ],
    yaImportado: false, guardado: true,
  },
  {
    id: 'dir-003', razonSocial: 'HormigónBA', rubro: 'hormigon', subrubro: 'Hormigón elaborado y premoldeado',
    descripcion: 'Provisión de hormigón elaborado con entrega en obra. Planta propia en zona sur GBA.',
    contacto: 'Ricardo Vega', telefono: '011-4777-3344', email: 'ventas@hormigonba.com.ar', web: 'https://hormigonba.com.ar',
    ciudad: 'Avellaneda', provincia: 'Buenos Aires', zonasCobertura: ['Buenos Aires', 'CABA', 'La Plata'],
    cuit: '30-70998877-1', verificado: true, disponibilidad: 'disponible_30dias', origen: 'nato',
    reseñas: [
      r('r09', 'Fernando Acosta', 'FA Construcciones', '2025-08-12', 5, 5, 3, 4, 'Hormigón de primera calidad. Precio un poco elevado pero consistente.', 'Torre Norte 25'),
      r('r10', 'Claudia Martín', 'CM Obras', '2025-05-30', 4, 4, 4, 5, 'Siempre puntuales con las entregas.'),
    ],
    yaImportado: false, guardado: false,
  },
  {
    id: 'dir-004', razonSocial: 'Carpintería Mendoza', rubro: 'carpinteria', subrubro: 'Carpintería de obra y muebles a medida',
    descripcion: 'Fabricación e instalación de aberturas, placards y muebles de cocina para obras nuevas.',
    contacto: 'Gustavo Ponce', telefono: '0261-555-1234', email: 'gponce@carpinteriamendoza.com',
    ciudad: 'Mendoza', provincia: 'Mendoza', zonasCobertura: ['Mendoza', 'San Juan', 'San Luis'],
    cuit: '20-33445566-7', verificado: true, disponibilidad: 'disponible', origen: 'nato',
    reseñas: [
      r('r11', 'Silvia Romero', 'Romero & Asociados', '2025-09-01', 5, 5, 4, 5, 'Trabajo artesanal de primera. Los placards quedaron espectaculares.', 'Residencias del Sol'),
      r('r12', 'Marcelo Fuentes', 'Constructora Andes', '2025-06-15', 4, 5, 4, 4, 'Excelente terminación en madera. Muy detallistas.'),
      r('r13', 'Carolina Paz', 'Inmobiliaria Cuyo', '2025-02-28', 5, 4, 5, 5, 'La mejor relación precio-calidad de la zona.'),
      r('r14', 'Andrés Molina', 'AM Desarrollos', '2024-11-10', 4, 5, 3, 4, 'Muy buena calidad, tiempos de entrega se estiraron un poco.'),
    ],
    yaImportado: true, guardado: true,
  },
  {
    id: 'dir-005', razonSocial: 'Pinturas Córdoba SRL', rubro: 'pintura', subrubro: 'Pintura interior y exterior',
    descripcion: 'Servicio integral de pintura para obras: preparación de superficies, latex, esmalte y epoxy.',
    contacto: 'Alejandra Bustos', telefono: '0351-444-5678', email: 'abustos@pinturascba.com.ar',
    ciudad: 'Córdoba', provincia: 'Córdoba', zonasCobertura: ['Córdoba', 'Villa Carlos Paz', 'Alta Gracia'],
    cuit: '30-88776655-3', verificado: true, disponibilidad: 'disponible', origen: 'nato',
    reseñas: [
      r('r15', 'Pablo Ríos', 'Ríos Construcciones', '2025-10-20', 4, 4, 5, 4, 'Buen trabajo y precios competitivos. Cumplieron el cronograma.', 'Centro Comercial Nuevo Córdoba'),
      r('r16', 'Natalia Herrera', 'NH Proyectos', '2025-07-05', 5, 5, 4, 5, 'Impecables. La terminación fue perfecta.'),
    ],
    yaImportado: false, guardado: false,
  },
  {
    id: 'dir-006', razonSocial: 'Estructuras Patagónicas SA', rubro: 'estructura', subrubro: 'Estructuras metálicas y de hormigón',
    descripcion: 'Diseño, fabricación y montaje de estructuras metálicas para galpones, naves industriales y edificios.',
    contacto: 'Héctor Navarro', telefono: '0299-448-9012', email: 'hnavarro@estructuraspatagonicas.com.ar', web: 'https://estructuraspatagonicas.com.ar',
    ciudad: 'Neuquén', provincia: 'Neuquén', zonasCobertura: ['Neuquén', 'Río Negro', 'Mendoza'],
    cuit: '30-55667788-9', verificado: true, disponibilidad: 'no_disponible', origen: 'nato',
    reseñas: [
      r('r17', 'Raúl Gutiérrez', 'RG Ingeniería', '2025-08-25', 5, 5, 3, 4, 'Trabajo de alta complejidad ejecutado sin problemas. Caro pero confiable.', 'Planta Industrial Neuquén'),
      r('r18', 'Verónica Luna', 'Luna Arquitectura', '2025-04-10', 4, 5, 4, 3, 'Buena calidad, a veces difícil contactar.'),
      r('r19', 'Javier Domínguez', 'JD Obras', '2024-10-30', 5, 5, 4, 5, 'Excelentes profesionales. Muy recomendables.'),
    ],
    yaImportado: false, guardado: false,
  },
  {
    id: 'dir-007', razonSocial: 'Gas Norte Instalaciones', rubro: 'gas', subrubro: 'Instalaciones de gas natural',
    descripcion: 'Matriculados ENARGAS. Instalaciones de gas en edificios, habilitaciones y mantenimiento.',
    contacto: 'Miguel Ángel Paz', telefono: '0381-422-3456', email: 'contacto@gasnorte.com.ar',
    ciudad: 'San Miguel de Tucumán', provincia: 'Tucumán', zonasCobertura: ['Tucumán', 'Salta', 'Jujuy'],
    cuit: '20-44556677-2', verificado: true, disponibilidad: 'disponible', origen: 'nato',
    reseñas: [
      r('r20', 'Oscar Ledesma', 'Ledesma Construcciones', '2025-09-15', 4, 4, 4, 5, 'Cumplieron con todos los requisitos de ENARGAS. Muy prolijos.', 'Edificio San Martín'),
      r('r21', 'Gabriela Arias', 'Arias & Hijos', '2025-05-20', 5, 5, 5, 4, 'Económicos y responsables.'),
    ],
    yaImportado: false, guardado: false,
  },
  {
    id: 'dir-008', razonSocial: 'Albañilería Express', rubro: 'albanileria', subrubro: 'Albañilería general y mampostería',
    descripcion: 'Cuadrillas de albañiles para obras de todos los tamaños. Levantamiento, revoque, contrapiso.',
    contacto: 'Ramón Sosa', telefono: '011-3456-7890', email: 'rsosa@albanileriaexpress.com',
    ciudad: 'CABA', provincia: 'CABA', zonasCobertura: ['CABA', 'Buenos Aires'],
    cuit: '20-22334455-6', verificado: true, disponibilidad: 'disponible', origen: 'nato',
    reseñas: [
      r('r22', 'Esteban Cruz', 'Cruz Desarrollos', '2025-11-01', 3, 3, 5, 3, 'Precio muy conveniente. Calidad aceptable para la obra.'),
      r('r23', 'Inés Vargas', 'Vargas Inmobiliaria', '2025-08-10', 4, 4, 5, 4, 'Buena relación precio-calidad. Trabajan rápido.', 'Duplex Palermo'),
      r('r24', 'Daniel Quiroga', 'DQ Obras', '2025-03-15', 3, 3, 4, 3, 'Cumplen pero hay que estar encima.'),
    ],
    yaImportado: false, guardado: false,
  },
  {
    id: 'dir-009', razonSocial: 'Clima Control SA', rubro: 'climatizacion', subrubro: 'Aire acondicionado central y split',
    descripcion: 'Instalación y mantenimiento de sistemas de climatización para edificios y oficinas.',
    contacto: 'Patricia Medina', telefono: '011-5555-4321', email: 'pmedina@climacontrol.com.ar', web: 'https://climacontrol.com.ar',
    ciudad: 'CABA', provincia: 'CABA', zonasCobertura: ['CABA', 'Buenos Aires', 'Córdoba'],
    cuit: '30-99887766-4', verificado: true, disponibilidad: 'disponible', origen: 'nato',
    reseñas: [
      r('r25', 'Tomás Bravo', 'Bravo Arquitectura', '2025-10-10', 5, 5, 3, 5, 'Sistema VRV instalado perfectamente. El equipo es muy profesional.', 'Oficinas Puerto Madero'),
      r('r26', 'Laura Giménez', 'LG Construcciones', '2025-06-25', 4, 4, 4, 4, 'Buen servicio postventa. Recomiendo.'),
      r('r27', 'Sergio Acuña', 'SA Desarrollos', '2025-01-18', 5, 5, 4, 5, 'Excelente servicio de principio a fin.'),
      r('r28', 'Marina Correa', 'MC Obras', '2024-09-05', 4, 4, 3, 4, 'Bien en general, la cotización inicial fue un poco confusa.'),
    ],
    yaImportado: false, guardado: false,
  },
  {
    id: 'dir-010', razonSocial: 'Sanitaria del Litoral', rubro: 'sanitaria', subrubro: 'Instalaciones sanitarias completas',
    descripcion: 'Plomería, desagües cloacales y pluviales. Obras nuevas y reparaciones.',
    contacto: 'Fabián Ortiz', telefono: '0342-456-0011', email: 'fortiz@sanitarialitoral.com',
    ciudad: 'Santa Fe', provincia: 'Santa Fe', zonasCobertura: ['Santa Fe', 'Paraná', 'Rosario'],
    cuit: '30-11223344-0', verificado: true, disponibilidad: 'disponible_30dias', origen: 'nato',
    reseñas: [
      r('r29', 'Adrián Campos', 'Campos Construcciones', '2025-07-12', 4, 4, 4, 3, 'Trabajo correcto, comunicación mejorable.'),
    ],
    yaImportado: false, guardado: false,
  },
  {
    id: 'dir-011', razonSocial: 'Impermeabilizaciones BA', rubro: 'impermeabilizacion', subrubro: 'Impermeabilización de terrazas y subsuelos',
    descripcion: 'Membrana líquida y en rollo. Tratamiento de humedad en cimientos y muros.',
    contacto: 'Ariel Montenegro', telefono: '011-4888-2233', email: 'amontenegro@imperba.com.ar',
    ciudad: 'CABA', provincia: 'CABA', zonasCobertura: ['CABA', 'Buenos Aires'],
    cuit: '20-55443322-1', verificado: true, disponibilidad: 'disponible', origen: 'nato',
    reseñas: [
      r('r30', 'Cristina Pellegrini', 'Pellegrini Obras', '2025-09-28', 5, 5, 4, 5, 'Resolvieron un problema de humedad que nadie podía solucionar.', 'Edificio Belgrano 200'),
      r('r31', 'Matías Rojas', 'MR Desarrollos', '2025-04-15', 4, 4, 4, 4, 'Garantía real de 10 años. Cumplieron en todo.'),
      r('r32', 'Valeria Suárez', 'VS Arquitectura', '2024-12-20', 5, 5, 5, 5, 'Increíble trabajo. Cero filtraciones desde la intervención.'),
      r('r33', 'Nicolás Paredes', 'NP Construcciones', '2024-08-01', 4, 5, 4, 4, 'Profesionales y con buena garantía.'),
      r('r34', 'Florencia Gil', 'Gil Inmobiliaria', '2024-05-10', 3, 4, 3, 4, 'Bien en general, precio algo alto.'),
      r('r35', 'Damián Herrera', 'DH Obras', '2024-02-15', 5, 5, 4, 5, 'Excelente servicio y seguimiento post-obra.'),
      r('r36', 'Carolina Luna', 'CL Proyectos', '2023-11-20', 4, 4, 4, 4, 'Muy recomendables. Prolijos y cumplidos.'),
      r('r37', 'Emilio Ramos', 'Ramos & Hijos', '2023-08-05', 5, 5, 5, 5, 'De lo mejor que encontré en CABA.'),
    ],
    yaImportado: true, guardado: true,
  },
  {
    id: 'dir-012', razonSocial: 'Paisajismo Verde SA', rubro: 'paisajismo', subrubro: 'Diseño de jardines y espacios verdes',
    descripcion: 'Diseño, ejecución y mantenimiento de espacios verdes para emprendimientos inmobiliarios.',
    contacto: 'Soledad Pereyra', telefono: '0351-555-6789', email: 'spereyra@paisajismoverde.com.ar', web: 'https://paisajismoverde.com.ar',
    ciudad: 'Córdoba', provincia: 'Córdoba', zonasCobertura: ['Córdoba', 'Buenos Aires', 'CABA'],
    cuit: '30-66778899-7', verificado: true, disponibilidad: 'disponible', origen: 'nato',
    reseñas: [],
    yaImportado: false, guardado: false,
  },
  // --- IA_WEB providers (4) ---
  {
    id: 'dir-013', razonSocial: 'ElectroTech Instalaciones', rubro: 'electricista', subrubro: 'Domótica y automatización',
    descripcion: 'Instalaciones eléctricas con domótica integrada. Sistemas de iluminación inteligente.',
    contacto: 'Facundo Rivero', telefono: '011-6789-0123', email: 'frivero@electrotech.com.ar',
    ciudad: 'Vicente López', provincia: 'Buenos Aires', zonasCobertura: ['Buenos Aires', 'CABA'],
    verificado: false, disponibilidad: 'disponible', origen: 'ia_web',
    reseñas: [
      r('r38', 'Lucas Benítez', 'LB Arquitectos', '2025-10-01', 4, 5, 3, 4, 'Buen trabajo con domótica. El precio es premium.'),
    ],
    yaImportado: false, guardado: false,
  },
  {
    id: 'dir-014', razonSocial: 'Ascensores del Centro', rubro: 'ascensores', subrubro: 'Instalación y mantenimiento de ascensores',
    descripcion: 'Instalación de ascensores y montacargas. Servicio de mantenimiento mensual.',
    contacto: 'Hernán Castillo', telefono: '0341-555-9876', email: 'hcastillo@ascensoresdelcentro.com',
    ciudad: 'Rosario', provincia: 'Santa Fe', zonasCobertura: ['Santa Fe', 'Buenos Aires'],
    verificado: false, disponibilidad: 'disponible_30dias', origen: 'ia_web',
    reseñas: [],
    yaImportado: false, guardado: false,
  },
  {
    id: 'dir-015', razonSocial: 'Seguridad Integral NOA', rubro: 'seguridad', subrubro: 'Seguridad e higiene en obra',
    descripcion: 'Servicio de seguridad e higiene laboral. Planes de evacuación y capacitación.',
    contacto: 'Liliana Chávez', telefono: '0388-444-5566', email: 'lchavez@seguridadnoa.com.ar',
    ciudad: 'San Salvador de Jujuy', provincia: 'Jujuy', zonasCobertura: ['Jujuy', 'Salta', 'Tucumán'],
    verificado: false, disponibilidad: 'disponible', origen: 'ia_web',
    reseñas: [
      r('r39', 'Hugo Mansilla', 'Mansilla Obras', '2025-08-20', 4, 4, 5, 4, 'Buenos precios para la zona. Servicio correcto.'),
      r('r40', 'Marta Villalba', 'MV Construcciones', '2025-03-10', 3, 3, 4, 3, 'Cumplen con lo básico. Nada extraordinario.'),
    ],
    yaImportado: false, guardado: false,
  },
  {
    id: 'dir-016', razonSocial: 'Pinturas Express Salta', rubro: 'pintura', subrubro: 'Pintura residencial y comercial',
    descripcion: 'Servicio rápido de pintura para departamentos, casas y locales comerciales.',
    contacto: 'Ernesto Juárez', telefono: '0387-555-7788', email: 'ejuarez@pinturasexpress.com',
    ciudad: 'Salta', provincia: 'Salta', zonasCobertura: ['Salta', 'Tucumán', 'Jujuy'],
    verificado: false, disponibilidad: 'no_disponible', origen: 'ia_web',
    reseñas: [
      r('r41', 'Alicia Cabrera', 'Cabrera Inmuebles', '2025-06-05', 3, 3, 5, 3, 'Económico pero la calidad es promedio.'),
    ],
    yaImportado: false, guardado: false,
  },
];

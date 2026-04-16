import type { Contrato, PlantillaContrato } from '@/types/contratos';

export const mockPlantillas: PlantillaContrato[] = [
  {
    id: 'tpl-compraventa',
    nombre: 'Contrato de Compraventa de Unidad',
    tipo: 'compraventa',
    descripcion: 'Para la venta de departamentos, casas o unidades en PH',
    variables: ['nombre_comprador', 'dni_comprador', 'domicilio_comprador', 'descripcion_unidad', 'precio_total', 'moneda', 'forma_pago', 'fecha_entrega', 'nombre_obra', 'direccion_obra', 'ciudad'],
    cuerpo: `CONTRATO DE COMPRAVENTA

Entre {{nombre_empresa}}, CUIT {{cuit_empresa}}, domicilio en {{domicilio_empresa}}, representada por {{representante_empresa}}, en adelante LA VENDEDORA, y {{nombre_comprador}}, DNI {{dni_comprador}}, domicilio en {{domicilio_comprador}}, en adelante EL COMPRADOR, se celebra el presente contrato:

PRIMERA — OBJETO
LA VENDEDORA vende y EL COMPRADOR compra la unidad funcional {{descripcion_unidad}}, ubicada en {{direccion_obra}}, Proyecto {{nombre_obra}}.

SEGUNDA — PRECIO
El precio total de la operación es de {{moneda}} {{precio_total}}. La forma de pago acordada es: {{forma_pago}}.

TERCERA — FECHA DE ENTREGA
LA VENDEDORA se compromete a entregar la unidad en condiciones habitables antes del {{fecha_entrega}}.

CUARTA — PENALIDADES
En caso de mora en la entrega superior a 60 días corridos, LA VENDEDORA abonará al COMPRADOR una penalidad equivalente al 0.5% mensual sobre el precio total por cada mes de retraso.

QUINTA — GARANTÍAS
LA VENDEDORA garantiza que la unidad se entregará libre de deudas, gravámenes e inhibiciones.

SEXTA — JURISDICCIÓN
Las partes se someten a la jurisdicción de los Tribunales Ordinarios de {{ciudad}}.`,
  },
  {
    id: 'tpl-locacion',
    nombre: 'Contrato de Locación de Obra',
    tipo: 'locacion_obra',
    descripcion: 'Para contratar la construcción con un cliente desarrollador',
    variables: ['nombre_comitente', 'cuit_comitente', 'descripcion_obra', 'monto_total', 'moneda', 'plazo_obra', 'forma_pago'],
    cuerpo: `CONTRATO DE LOCACIÓN DE OBRA

Entre {{nombre_comitente}}, CUIT {{cuit_comitente}}, en adelante EL COMITENTE, y {{nombre_empresa}}, CUIT {{cuit_empresa}}, en adelante LA CONSTRUCTORA, se acuerda:

PRIMERA — OBJETO
LA CONSTRUCTORA se compromete a ejecutar {{descripcion_obra}} conforme a los planos y especificaciones técnicas que forman parte del presente.

SEGUNDA — PRECIO Y FORMA DE PAGO
El precio total convenido es de {{moneda}} {{monto_total}}. {{forma_pago}}.

TERCERA — PLAZO
El plazo de ejecución es de {{plazo_obra}} días corridos desde la fecha de inicio de obra.

CUARTA — DIRECCIÓN TÉCNICA
LA CONSTRUCTORA designará un Director de Obra matriculado responsable de la ejecución.

QUINTA — MODIFICACIONES
Toda modificación al proyecto original deberá ser aprobada por escrito por ambas partes y será presupuestada por separado como adicional de obra.`,
  },
  {
    id: 'tpl-subcontrato',
    nombre: 'Subcontrato de Trabajo',
    tipo: 'subcontrato',
    descripcion: 'Para contratar mano de obra especializada por rubro',
    variables: ['nombre_subcontratista', 'cuit_subcontratista', 'rubro_trabajo', 'descripcion_trabajos', 'monto', 'moneda', 'plazo_dias', 'nombre_obra', 'forma_pago'],
    cuerpo: `CONTRATO DE SUBCONTRATO

Entre {{nombre_empresa}}, en adelante EL CONTRATISTA PRINCIPAL, y {{nombre_subcontratista}}, CUIT {{cuit_subcontratista}}, en adelante EL SUBCONTRATISTA, se conviene:

PRIMERA — OBJETO
EL SUBCONTRATISTA se compromete a ejecutar los trabajos de {{rubro_trabajo}} en la obra {{nombre_obra}}, consistentes en: {{descripcion_trabajos}}.

SEGUNDA — PRECIO
El precio convenido es de {{moneda}} {{monto}}, pagadero de la siguiente manera: {{forma_pago}}.

TERCERA — PLAZO
Los trabajos deberán completarse en {{plazo_dias}} días corridos desde el inicio efectivo.

CUARTA — OBLIGACIONES DEL SUBCONTRATISTA
El subcontratista deberá contar con seguro de accidentes de trabajo, ART vigente y cumplir con todas las normas de seguridad e higiene aplicables.

QUINTA — RECEPCIÓN
La recepción provisoria se realizará dentro de los 5 días hábiles de finalizado el trabajo. La recepción definitiva a los 30 días posteriores.`,
  },
];

const hoy = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];
const diasAtras = (n: number) => { const d = new Date(hoy); d.setDate(d.getDate() - n); return formatDate(d); };
const diasAdelante = (n: number) => { const d = new Date(hoy); d.setDate(d.getDate() + n); return formatDate(d); };

export const mockContratos: Contrato[] = [
  {
    id: 'cto-1',
    numero: 'CTO-2026-001',
    tipo: 'compraventa',
    titulo: 'Compraventa Depto 3A — Torre Palermo',
    estado: 'firmado',
    parteA: { tipo: 'otro', nombre: 'NATO OBRAS SRL', cuit: '30-71234567-8', domicilio: 'Av. Santa Fe 2100, CABA' },
    parteB: { tipo: 'cliente', nombre: 'González María', dni: '28.456.789', domicilio: 'Belgrano 450, CABA' },
    obraId: 'obra-1',
    obraNombre: 'Torre Palermo',
    fechaCreacion: diasAtras(45),
    fechaInicio: diasAtras(30),
    fechaFirma: diasAtras(30),
    montoTotal: 82000,
    moneda: 'USD',
    formaPago: 'Anticipo 30% + 24 cuotas mensuales',
    hitos: [
      { id: 'h1', descripcion: 'Anticipo 30%', fechaEstimada: diasAtras(30), fechaReal: diasAtras(28), monto: 24600, cumplido: true },
      { id: 'h2', descripcion: 'Cuota 1/24', fechaEstimada: diasAtras(1), monto: 2392, cumplido: false },
    ],
    cuerpo: 'Contrato de compraventa generado desde plantilla.',
    plantillaId: 'tpl-compraventa',
    adjuntos: [],
    notas: 'Cliente puntual, buen perfil crediticio.',
    creadoPor: 'Tomás',
    version: 1,
  },
  {
    id: 'cto-2',
    numero: 'CTO-2026-002',
    tipo: 'compraventa',
    titulo: 'Compraventa Lote 12 — Complejo Nordelta',
    estado: 'en_ejecucion',
    parteA: { tipo: 'otro', nombre: 'NATO OBRAS SRL', cuit: '30-71234567-8' },
    parteB: { tipo: 'cliente', nombre: 'Inmobiliaria Palermo SA', cuit: '30-70987654-1', representante: 'Diego Ramírez' },
    obraId: 'obra-2',
    obraNombre: 'Complejo Nordelta',
    fechaCreacion: diasAtras(90),
    fechaInicio: diasAtras(80),
    fechaFirma: diasAtras(80),
    montoTotal: 120000,
    moneda: 'USD',
    formaPago: 'Anticipo 40% + saldo contra posesión',
    hitos: [
      { id: 'h3', descripcion: 'Anticipo 40%', fechaEstimada: diasAtras(80), fechaReal: diasAtras(78), monto: 48000, cumplido: true },
      { id: 'h4', descripcion: 'Saldo contra posesión', fechaEstimada: diasAdelante(60), monto: 72000, cumplido: false },
    ],
    cuerpo: 'Contrato de compraventa para lote con mejoras.',
    plantillaId: 'tpl-compraventa',
    adjuntos: [],
    notas: '',
    creadoPor: 'Tomás',
    version: 2,
  },
  {
    id: 'cto-3',
    numero: 'CTO-2026-003',
    tipo: 'subcontrato',
    titulo: 'Subcontrato eléctrica — Torre Palermo',
    estado: 'en_ejecucion',
    parteA: { tipo: 'otro', nombre: 'NATO OBRAS SRL', cuit: '30-71234567-8' },
    parteB: { tipo: 'contratista', nombre: 'Electricidad Ramos', cuit: '20-33456789-0' },
    obraId: 'obra-1',
    obraNombre: 'Torre Palermo',
    fechaCreacion: diasAtras(60),
    fechaInicio: diasAtras(50),
    fechaFirma: diasAtras(50),
    fechaFin: diasAdelante(30),
    montoTotal: 28000,
    moneda: 'USD',
    formaPago: '3 certificaciones mensuales',
    hitos: [
      { id: 'h5', descripcion: 'Cert. 1 — pisos 1-4', fechaEstimada: diasAtras(20), fechaReal: diasAtras(18), monto: 9333, cumplido: true },
      { id: 'h6', descripcion: 'Cert. 2 — pisos 5-8', fechaEstimada: diasAdelante(10), monto: 9333, cumplido: false },
      { id: 'h7', descripcion: 'Cert. 3 — pisos 9-12', fechaEstimada: diasAdelante(40), monto: 9334, cumplido: false },
    ],
    cuerpo: 'Subcontrato para instalación eléctrica completa.',
    plantillaId: 'tpl-subcontrato',
    adjuntos: [],
    notas: 'Incluye tableros y cableado. No incluye artefactos.',
    creadoPor: 'Martín',
    version: 1,
  },
  {
    id: 'cto-4',
    numero: 'CTO-2026-004',
    tipo: 'locacion_obra',
    titulo: 'Locación de obra — PH Belgrano',
    estado: 'firmado',
    parteA: { tipo: 'cliente', nombre: 'Constructora Del Sur SA', cuit: '30-70111222-3', representante: 'Alejandro Pérez' },
    parteB: { tipo: 'otro', nombre: 'NATO OBRAS SRL', cuit: '30-71234567-8' },
    obraId: 'obra-3',
    obraNombre: 'PH Belgrano',
    fechaCreacion: diasAtras(120),
    fechaInicio: diasAtras(100),
    fechaFirma: diasAtras(100),
    fechaFin: diasAdelante(200),
    montoTotal: 180000,
    moneda: 'USD',
    formaPago: 'Certificaciones mensuales contra avance',
    hitos: [
      { id: 'h8', descripcion: 'Estructura completa', fechaEstimada: diasAtras(10), monto: 72000, cumplido: false },
      { id: 'h9', descripcion: 'Cerramientos', fechaEstimada: diasAdelante(60), monto: 54000, cumplido: false },
      { id: 'h10', descripcion: 'Terminaciones y entrega', fechaEstimada: diasAdelante(180), monto: 54000, cumplido: false },
    ],
    cuerpo: 'Contrato de locación de obra para PH en Belgrano.',
    plantillaId: 'tpl-locacion',
    adjuntos: [],
    notas: 'Estructura con 12 días de atraso.',
    creadoPor: 'Tomás',
    version: 1,
  },
  {
    id: 'cto-5',
    numero: 'CTO-2026-005',
    tipo: 'subcontrato',
    titulo: 'Subcontrato sanitaria — Residencial Norte',
    estado: 'pendiente_firma',
    parteA: { tipo: 'otro', nombre: 'NATO OBRAS SRL', cuit: '30-71234567-8' },
    parteB: { tipo: 'contratista', nombre: 'Sanitaria del Norte', cuit: '20-29876543-0' },
    obraId: 'obra-4',
    obraNombre: 'Residencial Norte',
    fechaCreacion: diasAtras(5),
    fechaInicio: diasAdelante(7),
    montoTotal: 35000,
    moneda: 'USD',
    formaPago: '50% anticipo + 50% contra finalización',
    hitos: [
      { id: 'h11', descripcion: 'Anticipo 50%', fechaEstimada: diasAdelante(7), monto: 17500, cumplido: false },
      { id: 'h12', descripcion: 'Saldo final', fechaEstimada: diasAdelante(60), monto: 17500, cumplido: false },
    ],
    cuerpo: 'Subcontrato para instalación sanitaria completa.',
    plantillaId: 'tpl-subcontrato',
    adjuntos: [],
    notas: 'Pendiente firma del subcontratista.',
    creadoPor: 'Tomás',
    version: 1,
  },
  {
    id: 'cto-6',
    numero: 'CTO-2026-006',
    tipo: 'provision',
    titulo: 'Provisión de hormigón — Torre Palermo',
    estado: 'en_ejecucion',
    parteA: { tipo: 'otro', nombre: 'NATO OBRAS SRL', cuit: '30-71234567-8' },
    parteB: { tipo: 'proveedor', nombre: 'Hormigones del Sur SRL', cuit: '30-70555666-7' },
    obraId: 'obra-1',
    obraNombre: 'Torre Palermo',
    fechaCreacion: diasAtras(70),
    fechaInicio: diasAtras(60),
    fechaFirma: diasAtras(60),
    fechaFin: diasAdelante(90),
    montoTotal: 45000,
    moneda: 'USD',
    formaPago: 'Por entrega, a 30 días',
    hitos: [
      { id: 'h13', descripcion: 'Entrega pisos 1-4', fechaEstimada: diasAtras(40), fechaReal: diasAtras(38), monto: 15000, cumplido: true },
      { id: 'h14', descripcion: 'Entrega pisos 5-8', fechaEstimada: diasAtras(5), monto: 15000, cumplido: false },
      { id: 'h15', descripcion: 'Entrega pisos 9-12', fechaEstimada: diasAdelante(30), monto: 15000, cumplido: false },
    ],
    cuerpo: 'Contrato de provisión de hormigón elaborado H30.',
    adjuntos: [],
    notas: 'Segunda entrega demorada 5 días.',
    creadoPor: 'Martín',
    version: 1,
  },
  {
    id: 'cto-7',
    numero: 'CTO-2026-007',
    tipo: 'compraventa',
    titulo: 'Compraventa Depto 5B — Residencial Norte',
    estado: 'borrador',
    parteA: { tipo: 'otro', nombre: 'NATO OBRAS SRL', cuit: '30-71234567-8' },
    parteB: { tipo: 'cliente', nombre: 'Luciana Fernández', dni: '35.678.901', domicilio: 'Av. Rivadavia 3200, CABA' },
    obraId: 'obra-4',
    obraNombre: 'Residencial Norte',
    fechaCreacion: diasAtras(2),
    fechaInicio: diasAdelante(15),
    montoTotal: 48000,
    moneda: 'USD',
    formaPago: 'A definir',
    hitos: [],
    cuerpo: 'Borrador en preparación.',
    plantillaId: 'tpl-compraventa',
    adjuntos: [],
    notas: 'Cliente interesado, falta definir forma de pago.',
    creadoPor: 'Tomás',
    version: 1,
  },
  {
    id: 'cto-8',
    numero: 'CTO-2025-018',
    tipo: 'subcontrato',
    titulo: 'Subcontrato pintura — Complejo Nordelta',
    estado: 'finalizado',
    parteA: { tipo: 'otro', nombre: 'NATO OBRAS SRL', cuit: '30-71234567-8' },
    parteB: { tipo: 'contratista', nombre: 'Pintores Unidos', cuit: '20-27654321-0' },
    obraId: 'obra-2',
    obraNombre: 'Complejo Nordelta',
    fechaCreacion: diasAtras(150),
    fechaInicio: diasAtras(140),
    fechaFirma: diasAtras(140),
    fechaFin: diasAtras(30),
    montoTotal: 18000,
    moneda: 'USD',
    formaPago: 'Contra certificación mensual',
    hitos: [
      { id: 'h16', descripcion: 'Pintura interior', fechaEstimada: diasAtras(80), fechaReal: diasAtras(75), monto: 12000, cumplido: true },
      { id: 'h17', descripcion: 'Pintura exterior', fechaEstimada: diasAtras(30), fechaReal: diasAtras(30), monto: 6000, cumplido: true },
    ],
    cuerpo: 'Subcontrato de pintura interior y exterior finalizado.',
    plantillaId: 'tpl-subcontrato',
    adjuntos: [],
    notas: 'Trabajo finalizado conforme.',
    creadoPor: 'Martín',
    version: 1,
  },
];

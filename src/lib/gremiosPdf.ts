import jsPDF from 'jspdf';
import type { PresupuestoGremio, PerfilGremio } from '@/types/gremios';
import { getRubroLabel } from '@/types/gremios';

const fmt = (n: number) => `$${n.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;

export function generarPresupuestoPDF(p: PresupuestoGremio, perfil: PerfilGremio) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const M = 18;
  let y = M;

  // Header con franja primaria
  doc.setFillColor(255, 90, 0);
  doc.rect(0, 0, W, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PRESUPUESTO', M, 9.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    `Emitido el ${new Date(p.fechaEmision).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}`,
    W - M,
    9.5,
    { align: 'right' },
  );

  // Datos del prestador
  y = 22;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(perfil.nombre, M, y);
  y += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90, 90, 90);
  doc.text(getRubroLabel(perfil.rubro), M, y);
  y += 4;
  if (perfil.matricula) {
    doc.text(`Matrícula: ${perfil.matricula}`, M, y);
    y += 4;
  }
  doc.text(`Tel: ${perfil.telefono}  ·  Email: ${perfil.email}`, M, y);
  y += 4;
  doc.text(`${perfil.ciudad}, ${perfil.provincia}`, M, y);
  y += 8;

  // Línea
  doc.setDrawColor(220, 220, 220);
  doc.line(M, y, W - M, y);
  y += 7;

  // Cliente
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Para:', M, y);
  doc.setFont('helvetica', 'normal');
  doc.text(p.cliente, M + 14, y);
  y += 5;
  if (p.telefono) {
    doc.setTextColor(90, 90, 90);
    doc.setFontSize(9);
    doc.text(`Tel: ${p.telefono}`, M + 14, y);
    y += 4;
  }
  if (p.email) {
    doc.setTextColor(90, 90, 90);
    doc.setFontSize(9);
    doc.text(p.email, M + 14, y);
    y += 4;
  }
  y += 4;

  // Descripción
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Trabajo a realizar', M, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const descLines = doc.splitTextToSize(p.descripcionTrabajo, W - 2 * M);
  doc.text(descLines, M, y);
  y += descLines.length * 5 + 4;

  // Items
  if (p.items && p.items.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Detalle', M, y);
    y += 5;

    // header
    doc.setFillColor(245, 245, 245);
    doc.rect(M, y - 4, W - 2 * M, 7, 'F');
    doc.setFontSize(9);
    doc.text('Descripción', M + 2, y);
    doc.text('Cant.', M + 110, y, { align: 'right' });
    doc.text('Unit.', M + 138, y, { align: 'right' });
    doc.text('Subtotal', W - M - 2, y, { align: 'right' });
    y += 6;

    doc.setFont('helvetica', 'normal');
    p.items.forEach((it) => {
      const descIt = doc.splitTextToSize(it.descripcion, 90);
      doc.text(descIt, M + 2, y);
      doc.text(`${it.cantidad} ${it.unidad}`, M + 110, y, { align: 'right' });
      doc.text(fmt(it.precioUnitario), M + 138, y, { align: 'right' });
      doc.text(fmt(it.cantidad * it.precioUnitario), W - M - 2, y, { align: 'right' });
      y += descIt.length * 4.5 + 2;
      if (y > 250) {
        doc.addPage();
        y = M;
      }
    });
    y += 2;
    doc.setDrawColor(220, 220, 220);
    doc.line(M, y, W - M, y);
    y += 5;
  }

  // Totales
  const subtotal = p.items?.reduce((a, it) => a + it.cantidad * it.precioUnitario, 0) ?? p.montoTotal;
  const iva = p.iva ? subtotal * 0.21 : 0;
  const total = subtotal + iva;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (p.items && p.items.length > 0) {
    doc.text('Subtotal', W - M - 50, y);
    doc.text(fmt(subtotal), W - M - 2, y, { align: 'right' });
    y += 5;
    if (p.iva) {
      doc.text('IVA 21%', W - M - 50, y);
      doc.text(fmt(iva), W - M - 2, y, { align: 'right' });
      y += 5;
    }
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setFillColor(255, 90, 0);
  doc.rect(W - M - 70, y - 4, 70, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL', W - M - 65, y + 1.5);
  doc.text(fmt(total), W - M - 3, y + 1.5, { align: 'right' });
  y += 13;

  // Condiciones
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Condiciones', M, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const matLabel =
    p.incluyeMateriales === true
      ? 'Materiales incluidos en el precio'
      : p.incluyeMateriales === false
        ? 'Solo mano de obra (no incluye materiales)'
        : 'Materiales se presupuestan por separado';
  doc.text(`• Forma de pago: ${p.condicionesPago}`, M, y);
  y += 4.5;
  doc.text(`• ${matLabel}`, M, y);
  y += 4.5;
  doc.text(`• Validez: ${p.validezDias} días corridos desde la fecha de emisión`, M, y);
  y += 8;

  // Cierre
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text('Quedo a disposición ante cualquier consulta. ¡Muchas gracias!', M, y);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`${perfil.nombre}  ·  ${perfil.telefono}`, M, 287);
  doc.text('Generado con NATO Gremios', W - M, 287, { align: 'right' });

  const fileName = `Presupuesto-${p.cliente.replace(/\s+/g, '_')}-${p.fechaEmision}.pdf`;
  doc.save(fileName);
}

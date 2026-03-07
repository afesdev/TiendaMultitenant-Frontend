import type { VentaConDetalle } from '../types'

export interface TiendaTicketInfo {
  nombre: string
  direccion?: string
  telefono?: string
}

function formatMoney(n: number): string {
  return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

/**
 * Abre una ventana con el contenido del ticket/recibo y dispara el diálogo de impresión.
 * Diseñado para impresora térmica (80mm) o impresión en papel.
 */
export function imprimirTicketVenta(venta: VentaConDetalle, tienda: TiendaTicketInfo): void {
  const cab = venta.cabecera
  const detalle = venta.detalle ?? []
  const subtotal = cab.Subtotal ?? 0
  const descuento = cab.DescuentoTotal ?? 0
  const total = cab.Total ?? 0
  const fechaStr = cab.Fecha
    ? new Date(cab.Fecha).toLocaleString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  const lineas = detalle.map(
    (d) => `
    <tr>
      <td style="padding:2px 4px;border-bottom:1px dotted #ccc;font-size:11px;">${escapeHtml(d.ProductoNombre)}${d.VarianteAtributo && d.VarianteValor ? ` (${escapeHtml(d.VarianteAtributo)}: ${escapeHtml(d.VarianteValor)})` : ''}</td>
      <td style="padding:2px 4px;border-bottom:1px dotted #ccc;text-align:center;font-size:11px;">${d.Cantidad}</td>
      <td style="padding:2px 4px;border-bottom:1px dotted #ccc;text-align:right;font-size:11px;">${formatMoney(d.PrecioUnitario)}</td>
      <td style="padding:2px 4px;border-bottom:1px dotted #ccc;text-align:right;font-size:11px;">${formatMoney(d.Importe)}</td>
    </tr>`,
  ).join('')

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ticket Venta #${cab.Id ?? ''}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      line-height: 1.35;
      color: #000;
      background: #fff;
      padding: 10px;
      max-width: 80mm;
      margin: 0 auto;
    }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .mt1 { margin-top: 6px; }
    .mt2 { margin-top: 10px; }
    .mb1 { margin-bottom: 6px; }
    .sep { border-top: 1px dashed #000; margin: 8px 0; }
    table { width: 100%; border-collapse: collapse; }
    .totales { margin-top: 8px; font-size: 12px; }
    .totales tr td:first-child { padding-right: 8px; }
    .totales .total-row { font-weight: bold; font-size: 14px; border-top: 2px solid #000; padding-top: 6px; margin-top: 4px; }
    @media print {
      body { padding: 4px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="center bold" style="font-size: 14px;">${escapeHtml(tienda.nombre)}</div>
  ${tienda.direccion ? `<div class="center mt1" style="font-size: 11px;">${escapeHtml(tienda.direccion)}</div>` : ''}
  ${tienda.telefono ? `<div class="center" style="font-size: 11px;">${escapeHtml(tienda.telefono)}</div>` : ''}
  <div class="sep"></div>
  <div class="center bold mb1">TICKET DE VENTA</div>
  <div style="font-size: 11px;">Nº <strong>${cab.Id ?? '—'}</strong> &nbsp; Fecha: ${fechaStr}</div>
  <div style="font-size: 11px;">Cliente: ${escapeHtml(cab.ClienteNombre ?? '')}</div>
  <div class="sep"></div>
  <table>
    <thead>
      <tr style="border-bottom: 1px solid #000;">
        <th style="text-align:left;padding:2px 4px;font-size:10px;">Producto</th>
        <th style="text-align:center;padding:2px 4px;font-size:10px;">Cant</th>
        <th style="text-align:right;padding:2px 4px;font-size:10px;">P.Unit</th>
        <th style="text-align:right;padding:2px 4px;font-size:10px;">Importe</th>
      </tr>
    </thead>
    <tbody>${lineas}</tbody>
  </table>
  <table class="totales">
    <tr><td>Subtotal</td><td style="text-align:right;">${formatMoney(subtotal)}</td></tr>
    ${descuento > 0 ? `<tr><td>Descuento</td><td style="text-align:right;">- ${formatMoney(descuento)}</td></tr>` : ''}
    <tr class="total-row"><td>TOTAL</td><td style="text-align:right;">${formatMoney(total)}</td></tr>
  </table>
  <div class="sep"></div>
  <div style="font-size: 11px;">Pago: ${escapeHtml(cab.MetodoPago ?? '—')}</div>
  <div style="font-size: 11px;">Estado: ${escapeHtml(cab.Estado ?? 'Pendiente')}</div>
  <div class="sep"></div>
  <div class="center mt2" style="font-size: 11px;">¡Gracias por su compra!</div>
  <div class="center no-print" style="margin-top: 12px;">
    <button type="button" onclick="window.print()" style="padding: 8px 16px; font-size: 14px; cursor: pointer;">Imprimir</button>
    <button type="button" onclick="window.close()" style="padding: 8px 16px; font-size: 14px; cursor: pointer; margin-left: 8px;">Cerrar</button>
  </div>
  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`

  const w = window.open('', '_blank', 'width=340,height=600,scrollbars=yes')
  if (w) {
    w.document.write(html)
    w.document.close()
  }
}

function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

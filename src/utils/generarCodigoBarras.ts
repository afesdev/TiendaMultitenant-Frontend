/**
 * Genera un código de barras único.
 * - EAN-13: 13 dígitos con dígito de control válido (estándar retail).
 * - Usa prefijo 770 (Colombia) + timestamp/random para unicidad.
 */
export function generarCodigoBarrasEAN13(): string {
  const base = '770' // Prefijo Colombia
  const randomPart = String(Date.now()).slice(-6) + String(Math.floor(Math.random() * 1000)).padStart(3, '0')
  const base12 = (base + randomPart).slice(0, 12)
  const checkDigit = calcularDigitoControlEAN13(base12)
  return base12 + checkDigit
}

/**
 * Calcula el dígito de control para EAN-13.
 * Suma: posiciones impares × 1, pares × 3. Check = (10 - sum % 10) % 10
 */
function calcularDigitoControlEAN13(base12: string): string {
  if (base12.length !== 12) return '0'
  let sum = 0
  for (let i = 0; i < 12; i++) {
    const d = parseInt(base12[i] ?? '0', 10)
    sum += (i % 2 === 0) ? d : d * 3
  }
  return String((10 - (sum % 10)) % 10)
}

/**
 * Genera código interno (CODE128) para producto/variante cuando no se requiere EAN-13.
 * Formato: P{productoId}V{varianteId} o P{productoId} para producto sin variante.
 */
export function generarCodigoBarrasInterno(productoId?: number, varianteId?: number): string {
  if (productoId != null && varianteId != null) {
    return `P${productoId}V${varianteId}`
  }
  if (productoId != null) {
    return `P${productoId}`
  }
  return generarCodigoBarrasEAN13()
}

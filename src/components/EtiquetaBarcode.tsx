import { forwardRef, useCallback, useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

interface EtiquetaBarcodeProps {
  codigo: string
  nombre: string
  precio?: number
  className?: string
}

/** Componente para renderizar código de barras (JsBarcode) en un canvas. Expone el canvas via ref. */
export const EtiquetaBarcode = forwardRef<HTMLCanvasElement | null, EtiquetaBarcodeProps>(
  function EtiquetaBarcode({ codigo, nombre, precio, className = '' }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const setRef = useCallback(
    (el: HTMLCanvasElement | null) => {
      (canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current = el
      if (typeof ref === 'function') ref(el)
      else if (ref) ref.current = el
    },
    [ref],
  )

  useEffect(() => {
    if (!codigo || !canvasRef.current) return
    try {
      JsBarcode(canvasRef.current, codigo, {
        format: 'CODE128',
        width: 2,
        height: 60,
        displayValue: true,
        fontSize: 12,
      })
    } catch {
      // Si el código no es válido para CODE128, intentar como texto
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, 200, 80)
        ctx.font = '12px monospace'
        ctx.fillText(codigo, 10, 40)
      }
    }
  }, [codigo])

  const fmt = (n: number) =>
    n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

  return (
    <div className={`flex flex-col items-center gap-2 p-4 ${className}`}>
      <p className="text-sm font-bold text-gray-900 truncate max-w-full text-center">{nombre}</p>
      {precio != null && precio > 0 && (
        <p className="text-lg font-bold text-gray-900">{fmt(precio)}</p>
      )}
      <canvas ref={setRef} className="max-w-full" />
    </div>
  )
})

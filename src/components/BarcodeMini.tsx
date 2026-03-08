import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

interface BarcodeMiniProps {
  codigo: string
  /** Altura del código de barras en píxeles */
  height?: number
  /** Mostrar el número debajo */
  displayValue?: boolean
  className?: string
}

/** Código de barras compacto para usar en tablas o listas. */
export function BarcodeMini({
  codigo,
  height = 36,
  displayValue = true,
  className = '',
}: BarcodeMiniProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!codigo || !canvasRef.current) return
    try {
      JsBarcode(canvasRef.current, codigo, {
        format: 'CODE128',
        width: 1.2,
        height,
        displayValue,
        fontSize: 9,
        margin: 2,
      })
    } catch {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        canvasRef.current.width = 120
        canvasRef.current.height = height + 10
        ctx.clearRect(0, 0, 120, height + 10)
        ctx.font = '9px monospace'
        ctx.fillStyle = '#333'
        ctx.fillText(codigo, 4, height / 2 + 4)
      }
    }
  }, [codigo, height, displayValue])

  return <canvas ref={canvasRef} className={`max-w-full block ${className}`} />
}

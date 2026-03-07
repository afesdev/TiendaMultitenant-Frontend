import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X } from 'lucide-react'

const SCAN_DIV_ID = 'scan-camera-reader'

interface ScanCameraModalProps {
  dm: boolean
  textPrimary: string
  textMuted: string
  onScan: (codigo: string) => void | Promise<void>
  onClose: () => void
}

export function ScanCameraModal({
  dm,
  textPrimary,
  textMuted,
  onScan,
  onClose,
}: ScanCameraModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [iniciado, setIniciado] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const onScanRef = useRef(onScan)
  onScanRef.current = onScan

  useEffect(() => {
    let montado = true
    const iniciar = async () => {
      try {
        setError(null)
        const scanner = new Html5Qrcode(SCAN_DIV_ID, { verbose: false })
        scannerRef.current = scanner
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
          },
          async (decodedText) => {
            if (!montado) return
            try {
              await scanner.stop()
            } catch {
              // ignorar si ya está detenido
            }
            if (!montado) return
            await onScanRef.current(decodedText)
          },
          () => {
            // error callback - ignorar errores de frame
          },
        )
        if (montado) setIniciado(true)
      } catch (err) {
        if (montado) {
          setError(
            err instanceof Error ? err.message : 'No se pudo acceder a la cámara',
          )
        }
      }
    }
    void iniciar()
    return () => {
      montado = false
      const scanner = scannerRef.current
      scannerRef.current = null
      if (scanner) {
        const safeCleanup = async () => {
          try {
            await scanner.stop()
          } catch {
            // "Cannot stop, scanner is not running" - ignorar
          }
          try {
            scanner.clear()
          } catch {
            // ignorar
          }
        }
        void safeCleanup()
      }
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`relative max-w-md w-full rounded-2xl border overflow-hidden ${
          dm ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <h3 className={`text-sm font-bold ${textPrimary}`}>
            Escanear con cámara
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          <div
            id={SCAN_DIV_ID}
            className="rounded-xl overflow-hidden bg-black min-h-[200px]"
          />
          {error && (
            <p className={`mt-2 text-sm ${textMuted}`}>{error}</p>
          )}
          {iniciado && !error && (
            <p className={`mt-2 text-xs ${textMuted}`}>
              Apunta el código de barras a la cámara
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

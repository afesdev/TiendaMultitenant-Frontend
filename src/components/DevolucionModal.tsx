import type { FormEvent } from 'react'
import { useState } from 'react'
import { X, Package, RotateCcw } from 'lucide-react'
import { API_BASE_URL } from '../config'
import type { VentaDetalleLinea } from '../types'

interface DevolucionModalProps {
  open: boolean
  dm: boolean
  textPrimary: string
  textSecondary: string
  textMuted: string
  btnSecondary: string
  ventaId: number
  detalle: VentaDetalleLinea[]
  token: string
  loading: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DevolucionModal({
  open,
  dm,
  textPrimary,
  textSecondary,
  textMuted,
  btnSecondary,
  ventaId,
  detalle,
  token,
  loading,
  onClose,
  onSuccess,
}: DevolucionModalProps) {
  const [cantidades, setCantidades] = useState<Record<string, number>>({})
  const [motivo, setMotivo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const key = (productoId: number, varianteId: number | null) =>
    `${productoId}-${varianteId ?? 'base'}`

  const setCantidad = (productoId: number, varianteId: number | null, value: number) => {
    const line = detalle.find(
      (d) => d.Producto_Id === productoId && (d.Variante_Id ?? null) === (varianteId ?? null),
    )
    if (!line) return
    const max = line.Cantidad
    const n = Math.max(0, Math.min(max, value))
    setCantidades((prev) => ({ ...prev, [key(productoId, varianteId)]: n }))
  }

  const getCantidad = (productoId: number, varianteId: number | null) =>
    cantidades[key(productoId, varianteId)] ?? 0

  const itemsToReturn = detalle
    .map((l) => ({
      line: l,
      cantidad: getCantidad(l.Producto_Id, l.Variante_Id ?? null),
    }))
    .filter((x) => x.cantidad > 0)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (itemsToReturn.length === 0) return
    setSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/ventas/${encodeURIComponent(ventaId)}/devolucion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: itemsToReturn.map(({ line, cantidad }) => ({
            productoId: line.Producto_Id,
            varianteId: line.Variante_Id ?? null,
            cantidad,
          })),
          motivo: motivo.trim() || undefined,
        }),
      })
      const body = (await response.json().catch(() => ({}))) as { message?: string }
      if (!response.ok) {
        throw new Error(body.message ?? 'Error al registrar devolución')
      }
      onSuccess()
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrar devolución'
      const { default: Swal } = await import('sweetalert2')
      void Swal.fire('Error', msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setCantidades({})
    setMotivo('')
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl flex flex-col max-h-[90vh] ${
          dm ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
        }`}
      >
        <div
          className={`flex-shrink-0 flex items-center justify-between gap-3 p-4 sm:p-6 border-b ${
            dm ? 'border-slate-700' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
              <RotateCcw size={24} />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${textPrimary}`}>Registrar devolución</h3>
              <p className={`text-sm ${textSecondary}`}>
                Venta #{ventaId} · Indica cantidades a devolver
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className={`p-2 rounded-xl ${btnSecondary}`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
            {detalle.map((l) => {
              const k = key(l.Producto_Id, l.Variante_Id ?? null)
              const max = l.Cantidad
              const value = cantidades[k] ?? 0
              return (
                <div
                  key={k}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    dm ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden border border-slate-700/40 flex items-center justify-center bg-slate-900/10">
                    {l.ImagenUrl ? (
                      <img src={l.ImagenUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Package size={16} className={textMuted} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${textPrimary}`}>
                      {l.ProductoNombre}
                    </p>
                    {l.VarianteAtributo && l.VarianteValor && (
                      <p className={`text-xs ${textMuted}`}>
                        {l.VarianteAtributo}: {l.VarianteValor}
                      </p>
                    )}
                    <p className={`text-xs ${textMuted}`}>Vendido: {max}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className={`text-xs font-medium ${textSecondary}`}>Devolver:</label>
                    <input
                      type="number"
                      min={0}
                      max={max}
                      value={value}
                      onChange={(e) =>
                        setCantidad(l.Producto_Id, l.Variante_Id ?? null, Number(e.target.value) || 0)
                      }
                      className={`w-16 rounded-lg border px-2 py-1.5 text-sm text-center ${
                        dm
                          ? 'border-slate-600 bg-slate-800 text-slate-100'
                          : 'border-gray-200 bg-white text-gray-900'
                      }`}
                    />
                  </div>
                </div>
              )
            })}

            <div>
              <label className={`block text-sm font-bold mb-1 ${textPrimary}`}>Motivo (opcional)</label>
              <input
                type="text"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej: Producto defectuoso"
                className={`w-full rounded-xl border px-4 py-2.5 text-sm ${
                  dm
                    ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500'
                    : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
          </div>

          <div
            className={`flex-shrink-0 flex gap-3 p-4 sm:p-6 border-t ${
              dm ? 'border-slate-700' : 'border-gray-200'
            }`}
          >
            <button
              type="button"
              onClick={handleClose}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm font-bold ${btnSecondary}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || submitting || itemsToReturn.length === 0}
              className="flex-1 rounded-xl bg-sky-500 px-4 py-3 text-sm font-bold text-white hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Registrando...' : 'Registrar devolución'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

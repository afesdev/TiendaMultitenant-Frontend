import { useEffect, useState, type FormEvent } from 'react'
import { X, CreditCard } from 'lucide-react'
import Swal from 'sweetalert2'
import { API_BASE_URL } from '../config'
import type { VentaResumen } from '../types'

interface VentaEditModalProps {
  open: boolean
  dm: boolean
  textPrimary: string
  textSecondary: string
  textMuted: string
  btnSecondary: string
  token: string
  venta: VentaResumen | null
  onClose: () => void
  onSaved: () => Promise<void> | void
}

export function VentaEditModal({
  open,
  dm,
  textPrimary,
  textSecondary,
  textMuted,
  btnSecondary,
  token,
  venta,
  onClose,
  onSaved,
}: VentaEditModalProps) {
  const [tipoVenta, setTipoVenta] = useState<'DETAL' | 'MAYORISTA' | 'APARTADO' | 'CATALOGO'>(
    'DETAL',
  )
  const [tipoEntrega, setTipoEntrega] = useState<'TIENDA' | 'DOMICILIO'>('TIENDA')
  const [metodoPago, setMetodoPago] = useState<'EFECTIVO' | 'TRANSFERENCIA' | 'MIXTO'>(
    'EFECTIVO',
  )
  const [tipoDescuento, setTipoDescuento] = useState<'FIJO' | 'PORCENTAJE'>('FIJO')
  const [descuentoInput, setDescuentoInput] = useState(0)
  const [observacion, setObservacion] = useState('')
  const [estado, setEstado] = useState<string>('Pendiente')
  const [submitting, setSubmitting] = useState(false)

  const ESTADOS_VENTA = [
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'EnProceso', label: 'En proceso' },
    { value: 'Envio', label: 'En envío' },
    { value: 'Completado', label: 'Completado' },
    { value: 'Cancelado', label: 'Cancelado' },
  ] as const

  useEffect(() => {
    if (open && venta) {
      setTipoVenta((venta.TipoVenta as any) || 'DETAL')
      setTipoEntrega((venta.TipoEntrega as any) || 'TIENDA')
      setMetodoPago((venta.MetodoPago as any) || 'EFECTIVO')
      setObservacion(venta.Observacion ?? '')
      setEstado(venta.Estado ?? 'Pendiente')
      setTipoDescuento('FIJO')
      setDescuentoInput(venta.DescuentoTotal ?? 0)
    }
  }, [open, venta])

  if (!open || !venta) return null

  const subtotal = venta.Subtotal
  const descuentoAplicado = (() => {
    if (subtotal <= 0) return 0
    if (tipoDescuento === 'PORCENTAJE') {
      const pct = Math.max(0, Math.min(descuentoInput, 100))
      return (subtotal * pct) / 100
    }
    const fijo = Math.max(0, Math.min(descuentoInput, subtotal))
    return fijo
  })()
  const total = subtotal - descuentoAplicado

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!venta) return

    setSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/ventas/${encodeURIComponent(venta.Id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tipoVenta,
          tipoEntrega,
          metodoPago,
          observacion: observacion.trim() || undefined,
          descuentoTotal: descuentoAplicado,
          estado,
        }),
      })

      const body = (await response.json().catch(() => null)) as { message?: string } | null
      if (!response.ok) {
        const msg = body?.message ?? 'Error al actualizar venta'
        throw new Error(msg)
      }

      await Swal.fire('Venta actualizada', 'La venta se actualizó correctamente.', 'success')
      await onSaved()
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar venta'
      void Swal.fire('Error', msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const cardBg = dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
  const fecha = venta.Fecha
    ? new Date(venta.Fecha).toLocaleString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4 transition-all">
      <div
        className={`w-full max-w-lg rounded-2xl border p-7 shadow-2xl ${
          cardBg
        } max-h-[85vh] flex flex-col`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-lg font-bold ${textPrimary}`}>Editar venta #{venta.Id}</h3>
            <p className={`mt-0.5 text-xs ${textSecondary}`}>
              {venta.ClienteNombre} · {fecha}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-all ${btnSecondary} hover:scale-105`}
            disabled={submitting}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
                Tipo de venta
              </label>
              <select
                value={tipoVenta}
                onChange={(e) =>
                  setTipoVenta(e.target.value as 'DETAL' | 'MAYORISTA' | 'APARTADO' | 'CATALOGO')
                }
                className={`w-full rounded-xl border px-3 py-2 text-xs ${
                  dm
                    ? 'border-slate-700 bg-slate-900 text-slate-100'
                    : 'border-gray-200 bg-white text-gray-900'
                }`}
              >
                <option value="DETAL">Detal</option>
                <option value="MAYORISTA">Mayorista</option>
                <option value="APARTADO">Apartado</option>
                <option value="CATALOGO">Por catálogo</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
                Tipo de entrega
              </label>
              <select
                value={tipoEntrega}
                onChange={(e) =>
                  setTipoEntrega(e.target.value as 'TIENDA' | 'DOMICILIO')
                }
                className={`w-full rounded-xl border px-3 py-2 text-xs ${
                  dm
                    ? 'border-slate-700 bg-slate-900 text-slate-100'
                    : 'border-gray-200 bg-white text-gray-900'
                }`}
              >
                <option value="TIENDA">Recoger en tienda</option>
                <option value="DOMICILIO">Domicilio</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
              Estado del pedido
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className={`w-full rounded-xl border px-3 py-2 text-xs ${
                dm
                  ? 'border-slate-700 bg-slate-900 text-slate-100'
                  : 'border-gray-200 bg-white text-gray-900'
              }`}
            >
              {ESTADOS_VENTA.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
              Método de pago
            </label>
            <div className="flex gap-2">
              {(['EFECTIVO', 'TRANSFERENCIA', 'MIXTO'] as const).map((mp) => (
                <button
                  key={mp}
                  type="button"
                  onClick={() => setMetodoPago(mp)}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border px-2 py-1.5 text-[11px] font-semibold ${
                    metodoPago === mp
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : dm
                      ? 'border-slate-700 text-slate-200'
                      : 'border-gray-200 text-gray-700'
                  }`}
                >
                  <CreditCard size={12} />
                  {mp}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
              Observación
            </label>
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              rows={3}
              className={`w-full rounded-xl border px-3 py-2 text-xs resize-none ${
                dm
                  ? 'border-slate-700 bg-slate-900 text-slate-100'
                  : 'border-gray-200 bg-white text-gray-900'
              }`}
              placeholder="Notas adicionales de la venta, cambios en el pago, etc."
            />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className={textMuted}>Subtotal</span>
              <span className={textPrimary}>
                {subtotal.toLocaleString('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className={textMuted}>Descuento</span>
              <div className="flex items-center gap-2">
                <select
                  value={tipoDescuento}
                  onChange={(e) =>
                    setTipoDescuento(e.target.value as 'FIJO' | 'PORCENTAJE')
                  }
                  className={`rounded-lg border px-2 py-1 text-[11px] ${
                    dm
                      ? 'border-slate-700 bg-slate-900 text-slate-100'
                      : 'border-gray-200 bg-white text-gray-900'
                  }`}
                >
                  <option value="FIJO">$ Fijo</option>
                  <option value="PORCENTAJE">% Porcentaje</option>
                </select>
                <input
                  type="number"
                  min={0}
                  max={tipoDescuento === 'PORCENTAJE' ? 100 : undefined}
                  value={descuentoInput}
                  onChange={(e) => setDescuentoInput(Number(e.target.value) || 0)}
                  className={`w-24 rounded-lg border px-2 py-1 text-right ${
                    dm
                      ? 'border-slate-700 bg-slate-900 text-slate-100'
                      : 'border-gray-200 bg-white text-gray-900'
                  }`}
                />
              </div>
            </div>
            <div className="flex justify-between border-t pt-2 mt-1">
              <span className={`font-semibold ${textPrimary}`}>Total</span>
              <span className="font-bold text-emerald-500">
                {total.toLocaleString('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
          </div>
        </form>

        <div className="px-6 py-3 border-t border-slate-800/40 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold ${btnSecondary}`}
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-emerald-500 text-xs font-semibold text-white hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}


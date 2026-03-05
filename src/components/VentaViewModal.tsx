import { useEffect, useState } from 'react'
import { User, CreditCard, Truck, FileText, Package } from 'lucide-react'
import Swal from 'sweetalert2'
import { API_BASE_URL } from '../config'
import type { VentaConDetalle } from '../types'

interface VentaDetalleViewProps {
  dm: boolean
  textPrimary: string
  textSecondary: string
  textMuted: string
  btnSecondary: string
  token: string
  ventaId: number
  onVolver: () => void
}

export function VentaDetalleView({
  dm,
  textPrimary,
  textSecondary,
  textMuted,
  btnSecondary,
  token,
  ventaId,
  onVolver,
}: VentaDetalleViewProps) {
  const [data, setData] = useState<VentaConDetalle | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchDetalle = async () => {
      if (!ventaId) return
      setLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/ventas/${encodeURIComponent(ventaId)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const body = (await response.json().catch(() => null)) as VentaConDetalle | {
          message?: string
        } | null

        if (!response.ok) {
          const msg = (body as { message?: string } | null)?.message ?? 'Error al cargar la venta'
          throw new Error(msg)
        }

        setData(body as VentaConDetalle)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al cargar la venta'
        void Swal.fire('Error', msg, 'error')
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    void fetchDetalle()
  }, [ventaId, token])

  if (!ventaId) return null

  const cab = data?.cabecera
  const detalle = data?.detalle ?? []

  const fechaFormateada = cab?.Fecha
    ? new Date(cab.Fecha).toLocaleString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  const subtotal = cab?.Subtotal ?? 0
  const descuento = cab?.DescuentoTotal ?? 0
  const total = cab?.Total ?? 0

  const cardBg = dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className={`text-xl font-bold ${textPrimary}`}>
            Detalle venta #{cab?.Id ?? ventaId}
          </h2>
          {cab && (
            <p className={`text-sm mt-0.5 ${textSecondary}`}>
              {cab.ClienteNombre} · {fechaFormateada}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onVolver}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${btnSecondary}`}
        >
          Volver al listado
        </button>
      </div>

      <div className={`rounded-2xl border shadow-sm ${cardBg}`}>
        <div className="px-5 py-4 sm:px-6 space-y-4">
          {loading && (
            <div className={`flex items-center justify-center py-10 ${textMuted}`}>
              <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              <span className="ml-3 text-xs">Cargando detalle de la venta...</span>
            </div>
          )}

          {!loading && cab && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className={`rounded-xl border px-3 py-2 ${cardBg}`}>
                  <p className={`text-[11px] font-medium ${textMuted}`}>Cliente</p>
                  <div className="mt-1 flex items-center gap-2">
                    <User size={13} className="text-emerald-500" />
                    <span className={`font-semibold ${textPrimary}`}>{cab.ClienteNombre}</span>
                  </div>
                </div>
                <div className={`rounded-xl border px-3 py-2 ${cardBg}`}>
                  <p className={`text-[11px] font-medium ${textMuted}`}>Tipo / entrega</p>
                  <p className={`mt-1 ${textSecondary}`}>{cab.TipoVenta ?? '—'}</p>
                  <p className={textMuted}>{cab.TipoEntrega ?? '—'}</p>
                </div>
                <div className={`rounded-xl border px-3 py-2 ${cardBg}`}>
                  <p className={`text-[11px] font-medium ${textMuted}`}>Pago / repartidor</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <CreditCard size={13} className="text-emerald-500" />
                    <span className={textSecondary}>{cab.MetodoPago ?? '—'}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <Truck size={13} className="text-slate-400" />
                    <span className={textMuted}>{cab.RepartidorNombre ?? 'Sin repartidor'}</span>
                  </div>
                </div>
              </div>

              {cab.Observacion && (
                <div className={`rounded-xl border px-3 py-2 text-xs flex gap-2 ${cardBg}`}>
                  <FileText size={13} className="mt-0.5 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className={`text-[11px] font-medium ${textMuted}`}>Observación</p>
                    <p className={`${textSecondary} mt-0.5 whitespace-pre-wrap`}>
                      {cab.Observacion}
                    </p>
                  </div>
                </div>
              )}

              <div className="rounded-xl border overflow-hidden">
                <table className="min-w-full text-xs">
                  <thead
                    className={
                      dm ? 'bg-slate-900 text-slate-300' : 'bg-gray-50 text-gray-600'
                    }
                  >
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Producto</th>
                      <th className="px-3 py-2 text-center font-semibold">Cantidad</th>
                      <th className="px-3 py-2 text-right font-semibold">P. unitario</th>
                      <th className="px-3 py-2 text-right font-semibold">Importe</th>
                    </tr>
                  </thead>
                  <tbody className={dm ? 'divide-y divide-slate-800' : 'divide-y divide-gray-100'}>
                    {detalle.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className={`px-3 py-4 text-center text-[11px] ${textMuted}`}
                        >
                          No hay líneas de detalle para esta venta.
                        </td>
                      </tr>
                    )}
                    {detalle.map((l) => (
                      <tr key={l.Id}>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg border border-slate-700/40 flex items-center justify-center bg-slate-900/10">
                              <Package size={13} className="text-slate-400" />
                            </div>
                            <span className={`font-medium ${textPrimary}`}>
                              {l.ProductoNombre}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center">{l.Cantidad}</td>
                        <td className="px-3 py-2 text-right">
                          {l.PrecioUnitario.toLocaleString('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold">
                          {l.Importe.toLocaleString('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            maximumFractionDigits: 0,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-xs pt-2">
                <div className={`rounded-xl border px-3 py-2 sm:w-1/2 ${cardBg}`}>
                  <p className={`text-[11px] font-medium ${textMuted}`}>Resumen de montos</p>
                  <div className="mt-1 space-y-1.5">
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
                    <div className="flex justify-between">
                      <span className={textMuted}>Descuento</span>
                      <span className={descuento > 0 ? 'text-amber-500 font-semibold' : textMuted}>
                        -{' '}
                        {descuento.toLocaleString('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-1.5 mt-0.5">
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
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

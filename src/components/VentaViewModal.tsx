import { useEffect, useState } from 'react'
import {
  User,
  CreditCard,
  Truck,
  FileText,
  Package,
  ArrowLeft,
  Calendar,
  Tag,
  ShoppingBag,
  Receipt,
  MapPin,
} from 'lucide-react'
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
          headers: { Authorization: `Bearer ${token}` },
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
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  const subtotal = cab?.Subtotal ?? 0
  const descuento = cab?.DescuentoTotal ?? 0
  const total = cab?.Total ?? 0

  const fmt = (n: number) =>
    n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

  /* ── theme tokens ── */
  const surface = dm
    ? 'bg-slate-900 border-slate-800'
    : 'bg-white border-gray-200'
  const surfaceAlt = dm ? 'bg-slate-800/60' : 'bg-gray-50'
  const divider = dm ? 'divide-slate-800' : 'divide-gray-100'
  const borderToken = dm ? 'border-slate-800' : 'border-gray-200'

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-5">

      {/* ── Back + page title ── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onVolver}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 border ${
            dm
              ? 'border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700'
              : 'border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <ArrowLeft size={14} />
          Volver
        </button>
        <div className="h-4 w-px bg-current opacity-20" />
        <p className={`text-xs ${textMuted}`}>Ventas / Detalle</p>
      </div>

      {/* ── Loading state ── */}
      {loading && (
        <div
          className={`flex flex-col items-center justify-center py-24 rounded-2xl border ${surface}`}
        >
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mb-3" />
          <p className={`text-sm ${textMuted}`}>Cargando detalle de la venta…</p>
        </div>
      )}

      {!loading && cab && (
        <>
          {/* ── Hero header ── */}
          <div
            className={`rounded-2xl border overflow-hidden ${surface}`}
          >
            {/* Gradient accent strip */}
            <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

            <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-500/10`}
                >
                  <Receipt size={24} className="text-emerald-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className={`text-lg font-bold ${textPrimary}`}>
                      Venta #{cab.Id ?? ventaId}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        dm
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Completada
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Calendar size={11} className={textMuted} />
                      <span className={`text-xs ${textSecondary}`}>{fechaFormateada}</span>
                    </div>
                    <span className={`text-xs ${textMuted}`}>·</span>
                    <div className="flex items-center gap-1">
                      <User size={11} className="text-emerald-500" />
                      <span className={`text-xs font-medium ${textSecondary}`}>
                        {cab.ClienteNombre}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total destacado */}
              <div className="flex-shrink-0 text-right">
                <p className={`text-[11px] font-medium ${textMuted} mb-0.5`}>Total de la venta</p>
                <p className="text-2xl font-bold text-emerald-500 tabular-nums">
                  {fmt(total)}
                </p>
                {descuento > 0 && (
                  <p className="text-[11px] text-amber-500 font-medium">
                    Descuento: {fmt(descuento)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Info cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Cliente */}
            <div className={`rounded-2xl border px-4 py-3.5 ${surface}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-sky-500/10 flex items-center justify-center">
                  <User size={13} className="text-sky-500" />
                </div>
                <p className={`text-[11px] font-semibold uppercase tracking-wide ${textMuted}`}>
                  Cliente
                </p>
              </div>
              <p className={`text-sm font-semibold ${textPrimary}`}>{cab.ClienteNombre}</p>
            </div>

            {/* Tipo de venta / entrega */}
            <div className={`rounded-2xl border px-4 py-3.5 ${surface}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <ShoppingBag size={13} className="text-violet-500" />
                </div>
                <p className={`text-[11px] font-semibold uppercase tracking-wide ${textMuted}`}>
                  Tipo de venta
                </p>
              </div>
              <p className={`text-sm font-semibold ${textPrimary}`}>{cab.TipoVenta ?? '—'}</p>
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={11} className={textMuted} />
                <p className={`text-xs ${textSecondary}`}>
                  Entrega: {cab.TipoEntrega ?? '—'}
                </p>
              </div>
            </div>

            {/* Pago y repartidor */}
            <div className={`rounded-2xl border px-4 py-3.5 ${surface}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CreditCard size={13} className="text-emerald-500" />
                </div>
                <p className={`text-[11px] font-semibold uppercase tracking-wide ${textMuted}`}>
                  Pago y entrega
                </p>
              </div>
              <p className={`text-sm font-semibold ${textPrimary}`}>{cab.MetodoPago ?? '—'}</p>
              <div className="flex items-center gap-1 mt-1">
                <Truck size={11} className={textMuted} />
                <p className={`text-xs ${textSecondary}`}>
                  {cab.RepartidorNombre ?? 'Sin repartidor'}
                </p>
              </div>
            </div>
          </div>

          {/* ── Observación ── */}
          {cab.Observacion && (
            <div className={`rounded-2xl border px-4 py-3.5 flex gap-3 ${surface}`}>
              <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center mt-0.5">
                <FileText size={13} className="text-amber-500" />
              </div>
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-wide ${textMuted} mb-1`}>
                  Observación
                </p>
                <p className={`text-sm whitespace-pre-wrap ${textSecondary}`}>
                  {cab.Observacion}
                </p>
              </div>
            </div>
          )}

          {/* ── Productos ── */}
          <div className={`rounded-2xl border overflow-hidden ${surface}`}>
            {/* Header tabla */}
            <div className={`px-4 py-3 border-b flex items-center gap-2 ${borderToken} ${surfaceAlt}`}>
              <Tag size={14} className="text-emerald-500" />
              <p className={`text-xs font-bold ${textPrimary}`}>Productos</p>
              <span
                className={`ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  dm ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {detalle.length} {detalle.length === 1 ? 'artículo' : 'artículos'}
              </span>
            </div>

            {detalle.length === 0 ? (
              <div className={`flex flex-col items-center gap-2 py-12 ${textMuted}`}>
                <Package size={32} className="opacity-20" />
                <p className="text-xs">No hay líneas de detalle para esta venta.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className={`${surfaceAlt} border-b ${borderToken}`}>
                      <th className={`px-4 py-2.5 text-left font-semibold ${textMuted}`}>
                        Producto
                      </th>
                      <th className={`px-4 py-2.5 text-center font-semibold ${textMuted}`}>
                        Cant.
                      </th>
                      <th className={`px-4 py-2.5 text-right font-semibold ${textMuted}`}>
                        P. Unitario
                      </th>
                      <th className={`px-4 py-2.5 text-right font-semibold ${textMuted}`}>
                        Importe
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${divider}`}>
                    {detalle.map((l, i) => (
                      <tr
                        key={l.Id}
                        className={`transition-colors ${
                          i % 2 === 0
                            ? ''
                            : dm
                              ? 'bg-slate-800/30'
                              : 'bg-gray-50/60'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {/* Imagen / placeholder */}
                            <div
                              className={`flex-shrink-0 h-12 w-12 sm:h-14 sm:w-14 rounded-xl border overflow-hidden flex items-center justify-center ${
                                dm
                                  ? 'border-slate-700 bg-slate-800'
                                  : 'border-gray-200 bg-gray-100'
                              }`}
                            >
                              {l.ImagenUrl ? (
                                <img
                                  src={l.ImagenUrl}
                                  alt={l.ProductoNombre}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package size={16} className={textMuted} />
                              )}
                            </div>

                            <div className="flex flex-col min-w-0 gap-0.5">
                              <span className={`font-semibold truncate ${textPrimary}`}>
                                {l.ProductoNombre}
                              </span>
                              {(l.CodigoInterno || l.CodigoBarras) && (
                                <span className={`font-mono text-[10px] ${textMuted}`}>
                                  {l.CodigoInterno}
                                  {l.CodigoBarras ? ` · CB: ${l.CodigoBarras}` : ''}
                                </span>
                              )}
                              {l.VarianteAtributo && l.VarianteValor && (
                                <span
                                  className="inline-flex items-center gap-1 self-start rounded-full px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                >
                                  {l.VarianteAtributo}: {l.VarianteValor}
                                  {l.VarianteCodigoSKU && (
                                    <span className="opacity-80">
                                      · SKU {l.VarianteCodigoSKU}
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                              dm
                                ? 'bg-slate-700 text-slate-200'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {l.Cantidad}
                          </span>
                        </td>

                        <td className={`px-4 py-3 text-right tabular-nums ${textSecondary}`}>
                          {fmt(l.PrecioUnitario)}
                        </td>

                        <td className={`px-4 py-3 text-right tabular-nums font-bold ${textPrimary}`}>
                          {fmt(l.Importe)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Resumen financiero ── */}
          <div className="flex justify-end">
            <div className={`rounded-2xl border w-full sm:w-80 overflow-hidden ${surface}`}>
              <div className={`px-4 py-2.5 border-b flex items-center gap-2 ${borderToken} ${surfaceAlt}`}>
                <Receipt size={14} className="text-emerald-500" />
                <p className={`text-xs font-bold ${textPrimary}`}>Resumen de montos</p>
              </div>
              <div className="px-4 py-3 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${textMuted}`}>Subtotal</span>
                  <span className={`text-sm tabular-nums font-medium ${textSecondary}`}>
                    {fmt(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`text-xs ${textMuted}`}>Descuento</span>
                  <span
                    className={`text-sm tabular-nums font-semibold ${
                      descuento > 0 ? 'text-amber-500' : textMuted
                    }`}
                  >
                    {descuento > 0 ? `- ${fmt(descuento)}` : fmt(0)}
                  </span>
                </div>

                <div
                  className={`flex justify-between items-center pt-2.5 border-t ${borderToken}`}
                >
                  <span className={`text-sm font-bold ${textPrimary}`}>Total</span>
                  <span className="text-xl font-bold text-emerald-500 tabular-nums">
                    {fmt(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

import { useEffect, useState, useCallback } from 'react'
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
  RotateCcw,
  Printer,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { API_BASE_URL } from '../config'
import type { VentaConDetalle, MovimientoInventario } from '../types'
import { DevolucionModal } from './DevolucionModal'
import { imprimirTicketVenta } from '../utils/imprimirTicket'

interface VentaDetalleViewProps {
  dm: boolean
  textPrimary: string
  textSecondary: string
  textMuted: string
  btnSecondary: string
  token: string
  ventaId: number
  onVolver: () => void
  onDevolucionRegistrada?: () => void
  /** Nombre de la tienda para el ticket */
  tiendaNombre: string
  /** Dirección (opcional) para el ticket */
  tiendaDireccion?: string
  /** Teléfono (opcional) para el ticket */
  tiendaTelefono?: string
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
  onDevolucionRegistrada,
  tiendaNombre,
  tiendaDireccion,
  tiendaTelefono,
}: VentaDetalleViewProps) {
  const [data, setData] = useState<VentaConDetalle | null>(null)
  const [devoluciones, setDevoluciones] = useState<MovimientoInventario[]>([])
  const [loading, setLoading] = useState(false)
  const [devolucionOpen, setDevolucionOpen] = useState(false)

  const fetchDetalle = useCallback(async () => {
    if (!ventaId) return
    setLoading(true)
    try {
      const [detalleRes, devolucionesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/ventas/${encodeURIComponent(ventaId)}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/ventas/${encodeURIComponent(ventaId)}/devoluciones`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const body = (await detalleRes.json().catch(() => null)) as VentaConDetalle | {
        message?: string
      } | null

      if (!detalleRes.ok) {
        const msg = (body as { message?: string } | null)?.message ?? 'Error al cargar la venta'
        throw new Error(msg)
      }
      setData(body as VentaConDetalle)

      if (devolucionesRes.ok) {
        const dev = (await devolucionesRes.json()) as MovimientoInventario[]
        setDevoluciones(Array.isArray(dev) ? dev : [])
      } else {
        setDevoluciones([])
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar la venta'
      void Swal.fire('Error', msg, 'error')
      setData(null)
      setDevoluciones([])
    } finally {
      setLoading(false)
    }
  }, [ventaId, token])

  useEffect(() => {
    void fetchDetalle()
  }, [fetchDetalle])

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
                        (cab.Estado ?? '').toUpperCase() === 'CANCELADO'
                          ? dm
                            ? 'bg-rose-500/10 text-rose-400'
                            : 'bg-rose-50 text-rose-700'
                          : dm
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          (cab.Estado ?? '').toUpperCase() === 'CANCELADO' ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                      />
                      {cab.Estado ?? 'Pendiente'}
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

              {/* Total destacado + Devolución + Imprimir */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {(cab.Estado ?? '').toUpperCase() !== 'CANCELADO' && detalle.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setDevolucionOpen(true)}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
                      dm
                        ? 'border-sky-500/50 bg-sky-500/20 text-sky-400 hover:bg-sky-500/30'
                        : 'border-sky-500 bg-sky-500/10 text-sky-600 hover:bg-sky-500/20'
                    }`}
                  >
                    <RotateCcw size={18} />
                    Devolución
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => data && imprimirTicketVenta(data, { nombre: tiendaNombre, direccion: tiendaDireccion, telefono: tiendaTelefono })}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
                    dm
                      ? 'border-slate-500 bg-slate-500/20 text-slate-300 hover:bg-slate-500/30'
                      : 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Printer size={18} />
                  Imprimir ticket
                </button>
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

            {/* Pago, estado y repartidor */}
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
                <Tag size={11} className={textMuted} />
                <p className={`text-xs ${textSecondary}`}>
                  Estado: <span className="font-semibold">{cab.Estado ?? 'Pendiente'}</span>
                </p>
              </div>
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
                      <th className={`px-4 py-2.5 text-left font-semibold ${textMuted}`}>
                        Variante
                      </th>
                      <th className={`px-4 py-2.5 text-center font-semibold ${textMuted}`}>
                        Cant.
                      </th>
                      <th className={`px-4 py-2.5 text-right font-semibold ${textMuted}`}>
                        Precio
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
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {l.VarianteAtributo && l.VarianteValor ? (
                            <div className="flex flex-col gap-0.5">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${
                                  dm
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-emerald-500/15 text-emerald-600'
                                }`}
                              >
                                {l.VarianteAtributo}: {l.VarianteValor}
                                {l.VarianteCodigoSKU && (
                                  <span className="opacity-80 font-mono">
                                    · {l.VarianteCodigoSKU}
                                  </span>
                                )}
                              </span>
                              {typeof l.VariantePrecioAdicional === 'number' &&
                                l.VariantePrecioAdicional !== 0 && (
                                  <span className={`text-[10px] ${textSecondary}`}>
                                    + {fmt(l.VariantePrecioAdicional)}
                                  </span>
                                )}
                            </div>
                          ) : (
                            <span className={textMuted}>—</span>
                          )}
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
                          <div className="flex flex-col items-end gap-0.5">
                            {(() => {
                              const adicional = l.VariantePrecioAdicional ?? 0
                              const base = l.PrecioUnitario - adicional
                              const tieneVarianteConPrecio = adicional > 0
                              return (
                                <>
                                  <span>Base (detal): {fmt(base)}</span>
                                  {tieneVarianteConPrecio && (
                                    <>
                                      <span className="text-[10px] opacity-80">
                                        + Variante: {fmt(adicional)}
                                      </span>
                                      <span className={`font-semibold ${textPrimary}`}>
                                        Total: {fmt(l.PrecioUnitario)}
                                      </span>
                                    </>
                                  )}
                                </>
                              )
                            })()}
                          </div>
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

          {/* ── Devoluciones de esta venta ── */}
          {devoluciones.length > 0 && (
            <div className={`rounded-2xl border overflow-hidden ${surface}`}>
              <div
                className={`px-4 py-3 border-b flex items-center gap-2 ${borderToken} ${surfaceAlt}`}
              >
                <RotateCcw size={16} className="text-sky-500" />
                <p className={`text-sm font-bold ${textPrimary}`}>Devoluciones de esta venta</p>
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                    dm ? 'bg-sky-500/20 text-sky-400' : 'bg-sky-500/15 text-sky-600'
                  }`}
                >
                  {devoluciones.length} registro{devoluciones.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className={surfaceAlt}>
                      <th className={`px-4 py-2.5 text-left font-semibold ${textMuted}`}>
                        Producto
                      </th>
                      <th className={`px-4 py-2.5 text-left font-semibold ${textMuted}`}>
                        Variante
                      </th>
                      <th className={`px-4 py-2.5 text-center font-semibold ${textMuted}`}>
                        Cantidad
                      </th>
                      <th className={`px-4 py-2.5 text-left font-semibold ${textMuted}`}>
                        Fecha
                      </th>
                      <th className={`px-4 py-2.5 text-left font-semibold ${textMuted}`}>
                        Motivo
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${divider}`}>
                    {devoluciones.map((d) => (
                      <tr
                        key={d.Id}
                        className={dm ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex-shrink-0 h-10 w-10 rounded-lg border overflow-hidden flex items-center justify-center ${
                                dm ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-gray-100'
                              }`}
                            >
                              {d.ImagenUrl ? (
                                <img
                                  src={d.ImagenUrl}
                                  alt={d.ProductoNombre}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package size={14} className={textMuted} />
                              )}
                            </div>
                            <div>
                              <span className={`text-sm font-semibold ${textPrimary}`}>
                                {d.ProductoNombre}
                              </span>
                              <span className={`block text-xs font-mono ${textMuted}`}>
                                {d.CodigoInterno}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {d.VarianteAtributo && d.VarianteValor ? (
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                dm ? 'bg-sky-500/20 text-sky-400' : 'bg-sky-500/15 text-sky-600'
                              }`}
                            >
                              {d.VarianteAtributo}: {d.VarianteValor}
                              {d.VarianteCodigoSKU && ` · ${d.VarianteCodigoSKU}`}
                            </span>
                          ) : (
                            <span className={textMuted}>—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center min-w-[28px] h-7 rounded-full text-xs font-bold ${
                              dm ? 'bg-sky-500/20 text-sky-400' : 'bg-sky-500/15 text-sky-600'
                            }`}
                          >
                            {d.Cantidad}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={textSecondary}>
                            {d.Fecha
                              ? new Date(d.Fecha).toLocaleString('es-CO', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${textSecondary}`}>
                            {d.Motivo || '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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

          <DevolucionModal
            open={devolucionOpen}
            dm={dm}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            textMuted={textMuted}
            btnSecondary={btnSecondary}
            ventaId={ventaId}
            detalle={detalle}
            token={token}
            loading={loading}
            onClose={() => setDevolucionOpen(false)}
            onSuccess={() => {
              void fetchDetalle()
              onDevolucionRegistrada?.()
              void Swal.fire('Devolución registrada', 'Se actualizó el stock correctamente.', 'success')
            }}
          />
        </>
      )}
    </div>
  )
}

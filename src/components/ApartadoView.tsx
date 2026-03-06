import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  CreditCard,
  FileText,
  Package,
  Tag,
  Trash2,
  User,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { API_BASE_URL } from '../config'
import type { ApartadoConDetalle, ApartadoPago } from '../types'

interface ApartadoDetalleViewProps {
  dm: boolean
  textPrimary: string
  textSecondary: string
  textMuted: string
  btnSecondary: string
  token: string
  apartadoId: number
  onVolver: () => void
}

export function ApartadoDetalleView({
  dm,
  textPrimary,
  textSecondary,
  textMuted,
  btnSecondary,
  token,
  apartadoId,
  onVolver,
}: ApartadoDetalleViewProps) {
  const [data, setData] = useState<ApartadoConDetalle | null>(null)
  const [loading, setLoading] = useState(false)
  const [submittingPago, setSubmittingPago] = useState(false)

  const [monto, setMonto] = useState(0)
  const [metodoPago, setMetodoPago] = useState<'EFECTIVO' | 'TRANSFERENCIA' | 'MIXTO'>(
    'EFECTIVO',
  )
  const [referencia, setReferencia] = useState('')
  const [notas, setNotas] = useState('')

  const fetchDetalle = async () => {
    if (!apartadoId) return
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/apartados/${encodeURIComponent(apartadoId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const body = (await response.json().catch(() => null)) as ApartadoConDetalle | {
        message?: string
      } | null
      if (!response.ok) {
        const msg = (body as { message?: string } | null)?.message ?? 'Error al cargar el apartado'
        throw new Error(msg)
      }
      setData(body as ApartadoConDetalle)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar el apartado'
      void Swal.fire('Error', msg, 'error')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchDetalle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apartadoId, token])

  const cab = data?.cabecera
  const detalle = data?.detalle ?? []
  const pagos = data?.pagos ?? []

  const fmt = (n: number) =>
    n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

  const surface = dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
  const surfaceAlt = dm ? 'bg-slate-800/60' : 'bg-gray-50'
  const divider = dm ? 'divide-slate-800' : 'divide-gray-100'
  const borderToken = dm ? 'border-slate-800' : 'border-gray-200'

  const fechaCreacion = cab?.FechaCreacion
    ? new Date(cab.FechaCreacion).toLocaleString('es-CO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  const fechaVenc = cab?.FechaVencimiento
    ? new Date(cab.FechaVencimiento).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : ''

  const totalPagos = useMemo(
    () => pagos.reduce((acc, p) => acc + (p.Monto ?? 0), 0),
    [pagos],
  )

  const handleRegistrarPago = async (e: FormEvent) => {
    e.preventDefault()
    if (!cab) return
    if (monto <= 0) return

    setSubmittingPago(true)
    try {
      const response = await fetch(
        `${API_BASE_URL}/apartados/${encodeURIComponent(cab.Id)}/pagos`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            monto,
            metodoPago,
            referencia: referencia.trim() || undefined,
            notas: notas.trim() || undefined,
          }),
        },
      )
      const body = (await response.json().catch(() => null)) as { message?: string } | null
      if (!response.ok) throw new Error(body?.message ?? 'Error al registrar pago')

      setMonto(0)
      setReferencia('')
      setNotas('')
      await fetchDetalle()
      void Swal.fire('Pago registrado', 'El abono se registró correctamente.', 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrar pago'
      void Swal.fire('Error', msg, 'error')
    } finally {
      setSubmittingPago(false)
    }
  }

  const handleEliminarPago = async (pagoId: number) => {
    if (!cab) return

    const result = await Swal.fire({
      title: '¿Eliminar pago?',
      text: 'Este abono se descontará del total abonado del apartado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    })
    if (!result.isConfirmed) return

    try {
      const response = await fetch(
        `${API_BASE_URL}/apartados/${encodeURIComponent(cab.Id)}/pagos/${encodeURIComponent(pagoId)}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      const body = (await response.json().catch(() => null)) as { message?: string } | null
      if (!response.ok) {
        throw new Error(body?.message ?? 'Error al eliminar pago')
      }
      await fetchDetalle()
      void Swal.fire('Pago eliminado', 'El abono se eliminó correctamente.', 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar pago'
      void Swal.fire('Error', msg, 'error')
    }
  }

  const renderPago = (p: ApartadoPago) => {
    const fecha = p.FechaPago
      ? new Date(p.FechaPago).toLocaleString('es-CO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—'
    return (
      <tr key={p.Id}>
        <td className={`px-4 py-3 whitespace-nowrap ${textSecondary}`}>{fecha}</td>
        <td className={`px-4 py-3 whitespace-nowrap ${textSecondary}`}>{p.MetodoPago}</td>
        <td className={`px-4 py-3 whitespace-nowrap font-mono text-right ${textPrimary}`}>
          {fmt(p.Monto)}
        </td>
        <td className={`px-4 py-3 ${textMuted}`}>
          <div className="flex flex-col">
            <span className="text-xs">{p.Referencia ?? '—'}</span>
            {p.Notas && <span className="text-[11px] opacity-80">{p.Notas}</span>}
          </div>
        </td>
        <td className="px-4 py-3 text-right">
          <button
            type="button"
            onClick={() => void handleEliminarPago(p.Id)}
            className={`inline-flex items-center justify-center rounded-lg p-1.5 text-xs ${
              dm
                ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
            }`}
            title="Eliminar pago"
          >
            <Trash2 size={14} />
          </button>
        </td>
      </tr>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Bookmark size={22} />
            </div>
            <h2 className={`text-xl font-bold ${textPrimary}`}>Apartado #{apartadoId}</h2>
          </div>
          <p className={`text-sm ${textSecondary}`}>
            {cab?.ClienteNombre ?? '—'} {fechaCreacion ? `· ${fechaCreacion}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={onVolver}
          className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${btnSecondary}`}
        >
          <ArrowLeft size={16} />
          Volver
        </button>
      </div>

      {loading && (
        <div className={`rounded-2xl border p-10 text-center ${surface} ${textMuted}`}>
          Cargando…
        </div>
      )}

      {!loading && cab && (
        <>
          {/* Cabecera */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
              <p className={`text-xs ${textSecondary}`}>
                {cab.ClienteCedula}
                {cab.ClienteCelular ? ` · ${cab.ClienteCelular}` : ''}
              </p>
            </div>

            <div className={`rounded-2xl border px-4 py-3.5 ${surface}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Calendar size={13} className="text-amber-500" />
                </div>
                <p className={`text-[11px] font-semibold uppercase tracking-wide ${textMuted}`}>
                  Vencimiento
                </p>
              </div>
              <p className={`text-sm font-semibold ${textPrimary}`}>{fechaVenc || '—'}</p>
              <p className={`text-xs ${textSecondary}`}>Estado: {cab.Estado}</p>
            </div>

            <div className={`rounded-2xl border px-4 py-3.5 ${surface}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Tag size={13} className="text-emerald-500" />
                </div>
                <p className={`text-[11px] font-semibold uppercase tracking-wide ${textMuted}`}>
                  Resumen
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className={`text-xs ${textSecondary}`}>
                  Total: <span className={`font-semibold ${textPrimary}`}>{fmt(cab.Total)}</span>
                </p>
                <p className={`text-xs ${textSecondary}`}>
                  Abonado: <span className={`font-semibold ${textPrimary}`}>{fmt(cab.Abonado)}</span>
                </p>
                <p className={`text-xs ${textSecondary}`}>
                  Saldo: <span className={`font-bold ${textPrimary}`}>{fmt(cab.Saldo)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className={`rounded-2xl border overflow-hidden ${surface}`}>
            <div className={`px-4 py-3 border-b flex items-center gap-2 ${borderToken} ${surfaceAlt}`}>
              <Package size={14} className="text-emerald-500" />
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
                <p className="text-xs">No hay detalle para este apartado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className={`${surfaceAlt} border-b ${borderToken}`}>
                      <th className={`px-4 py-2.5 text-left font-semibold ${textMuted}`}>Producto</th>
                      <th className={`px-4 py-2.5 text-center font-semibold ${textMuted}`}>Cant.</th>
                      <th className={`px-4 py-2.5 text-right font-semibold ${textMuted}`}>Precio</th>
                      <th className={`px-4 py-2.5 text-right font-semibold ${textMuted}`}>Importe</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${divider}`}>
                    {detalle.map((l, i) => (
                      <tr
                        key={l.Id}
                        className={`transition-colors ${
                          i % 2 === 0 ? '' : dm ? 'bg-slate-800/30' : 'bg-gray-50/60'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex-shrink-0 h-12 w-12 sm:h-14 sm:w-14 rounded-xl border overflow-hidden flex items-center justify-center ${
                                dm ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-gray-100'
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
                                    <span className="opacity-80 font-mono">
                                      · {l.VarianteCodigoSKU}
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
                              dm ? 'bg-slate-700 text-slate-200' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {l.Cantidad}
                          </span>
                        </td>

                        <td className={`px-4 py-3 text-right tabular-nums ${textSecondary}`}>
                          {fmt(l.PrecioVenta)}
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

          {/* Pagos */}
          <div className={`rounded-2xl border overflow-hidden ${surface}`}>
            <div className={`px-4 py-3 border-b flex items-center gap-2 ${borderToken} ${surfaceAlt}`}>
              <CreditCard size={14} className="text-emerald-500" />
              <p className={`text-xs font-bold ${textPrimary}`}>Pagos / Abonos</p>
              <span className={`ml-auto text-xs ${textSecondary}`}>Total pagos: {fmt(totalPagos)}</span>
            </div>

            <div className="p-4">
              <form onSubmit={handleRegistrarPago} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-3">
                  <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>Monto</label>
                  <input
                    type="number"
                    min={0}
                    value={monto}
                    onChange={(e) => setMonto(Number(e.target.value))}
                    className={`w-full rounded-xl border px-3 py-2 text-sm ${
                      dm ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-gray-200 bg-white text-gray-900'
                    }`}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>Método</label>
                  <select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value as any)}
                    className={`w-full rounded-xl border px-3 py-2 text-sm ${
                      dm ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-gray-200 bg-white text-gray-900'
                    }`}
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="MIXTO">Mixto</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>Referencia</label>
                  <input
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-sm ${
                      dm ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-gray-200 bg-white text-gray-900'
                    }`}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>Notas</label>
                  <input
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-sm ${
                      dm ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-gray-200 bg-white text-gray-900'
                    }`}
                  />
                </div>
                <div className="md:col-span-12 flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingPago || monto <= 0}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${
                      submittingPago || monto <= 0
                        ? 'opacity-50 cursor-not-allowed bg-emerald-600 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <CreditCard size={16} />
                    Registrar pago
                  </button>
                </div>
              </form>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className={`${surfaceAlt} border-t ${borderToken}`}>
                    <th className={`px-4 py-2.5 text-left font-semibold ${textMuted}`}>Fecha</th>
                    <th className={`px-4 py-2.5 text-left font-semibold ${textMuted}`}>Método</th>
                    <th className={`px-4 py-2.5 text-right font-semibold ${textMuted}`}>Monto</th>
                    <th className={`px-4 py-2.5 text-left font-semibold ${textMuted}`}>Detalle</th>
                    <th className={`px-4 py-2.5 text-right font-semibold ${textMuted}`}></th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${divider}`}>
                  {pagos.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={`px-4 py-10 text-center ${textMuted}`}>
                        <div className="flex flex-col items-center gap-2">
                          <FileText size={28} className="opacity-20" />
                          <p className="text-xs">Aún no hay pagos registrados.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pagos.map(renderPago)
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}


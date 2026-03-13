import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  Package,
  Tag,
  Truck,
  Box,
  Image as ImageIcon,
  Layers,
  TrendingUp,
  BarChart3,
  Receipt,
  Bookmark,
  Activity,
  Percent,
  Calendar,
  FileText,
  Eye,
  EyeOff,
  Barcode,
  Printer,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { API_BASE_URL } from '../config'
import type { ProductoConDetalle } from '../types'
import { EtiquetaBarcode } from './EtiquetaBarcode'
import { BarcodeMini } from './BarcodeMini'

interface ProductoDetalleViewProps {
  dm: boolean
  textPrimary: string
  textSecondary: string
  textMuted: string
  btnSecondary: string
  token: string
  productoId: number
  onVolver: () => void
  onEditar?: () => void
}

export function ProductoDetalleView({
  dm,
  textPrimary,
  textSecondary,
  textMuted,
  btnSecondary,
  token,
  productoId,
  onVolver,
  onEditar,
}: ProductoDetalleViewProps) {
  const [data, setData] = useState<ProductoConDetalle | null>(null)
  const [loading, setLoading] = useState(false)
  const barcodeCanvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const fetchDetalle = async () => {
      if (!productoId) return
      setLoading(true)
      try {
        const response = await fetch(
          `${API_BASE_URL}/productos/${encodeURIComponent(productoId)}/detalle`,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        const body = (await response.json().catch(() => null)) as ProductoConDetalle | {
          message?: string
        } | null

        if (!response.ok) {
          const msg =
            (body as { message?: string } | null)?.message ?? 'Error al cargar el producto'
          throw new Error(msg)
        }
        setData(body as ProductoConDetalle)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al cargar el producto'
        void Swal.fire('Error', msg, 'error')
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    void fetchDetalle()
  }, [productoId, token])

  if (!productoId) return null

  const prod = data?.producto
  const imagenes = data?.imagenes ?? []
  const variantes = data?.variantes ?? []
  const stats = data?.estadisticas
  const movimientos = data?.movimientosRecientes ?? []
  const promociones = data?.promociones ?? []
  const ultimasVentas = data?.ultimasVentas ?? []

  const fmt = (n: number) =>
    n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

  const surface = dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
  const surfaceAlt = dm ? 'bg-slate-800/60' : 'bg-gray-50'
  const divider = dm ? 'divide-slate-800' : 'divide-gray-100'

  const fechaCreacion = prod?.FechaCreacion
    ? new Date(prod.FechaCreacion).toLocaleString('es-CO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

  const fechaModificacion = prod?.FechaModificacion
    ? new Date(prod.FechaModificacion).toLocaleString('es-CO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

  const stockTotal = (prod?.StockActual ?? 0) + variantes.reduce((s, v) => s + (v.StockActual ?? 0), 0)

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
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
        <p className={`text-xs ${textMuted}`}>Productos / Detalle</p>
      </div>

      {loading && (
        <div
          className={`flex flex-col items-center justify-center py-24 rounded-2xl border ${surface}`}
        >
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mb-3" />
          <p className={`text-sm ${textMuted}`}>Cargando detalle del producto…</p>
        </div>
      )}

      {!loading && prod && (
        <>
          {/* Hero: imagen + datos principales */}
          <div className={`rounded-2xl border overflow-hidden ${surface}`}>
            <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
            <div className="p-6 flex flex-col lg:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                  {imagenes.length > 0 ? (
                    <img
                      src={imagenes.find((i) => i.EsPrincipal)?.Url ?? imagenes[0]?.Url}
                      alt={prod.Nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={64} className={dm ? 'text-slate-600' : 'text-gray-300'} />
                    </div>
                  )}
                </div>
                {imagenes.length > 1 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                    {imagenes.map((img) => (
                      <div
                        key={img.Id}
                        className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0"
                      >
                        <img
                          src={img.Url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 className={`text-xl sm:text-2xl font-bold ${textPrimary}`}>{prod.Nombre}</h1>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className={`text-sm font-mono ${textSecondary}`}>
                        {prod.CodigoInterno}
                      </span>
                      {prod.CodigoBarras && (
                        <span className={`text-xs font-mono ${textMuted}`}>
                          <Barcode size={12} className="inline mr-0.5" />
                          {prod.CodigoBarras}
                        </span>
                      )}
                      {prod.Visible ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <Eye size={12} />
                          Visible
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${dm ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
                          <EyeOff size={12} />
                          Oculto
                        </span>
                      )}
                    </div>
                  </div>
                  {onEditar && (
                    <button
                      type="button"
                      onClick={onEditar}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${btnSecondary}`}
                    >
                      Editar producto
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className={`rounded-xl border p-3 ${surfaceAlt}`}>
                    <p className={`text-xs font-bold ${textMuted}`}>Precio detal</p>
                    <p className={`text-lg font-bold ${textPrimary}`}>{fmt(prod.PrecioDetal)}</p>
                  </div>
                  <div className={`rounded-xl border p-3 ${surfaceAlt}`}>
                    <p className={`text-xs font-bold ${textMuted}`}>Precio mayor</p>
                    <p className={`text-lg font-bold ${textPrimary}`}>
                      {prod.PrecioMayor != null ? fmt(prod.PrecioMayor) : '—'}
                    </p>
                  </div>
                  <div className={`rounded-xl border p-3 ${surfaceAlt}`}>
                    <p className={`text-xs font-bold ${textMuted}`}>Costo</p>
                    <p className={`text-lg font-bold ${textPrimary}`}>{fmt(prod.Costo)}</p>
                  </div>
                  <div className={`rounded-xl border p-3 ${surfaceAlt}`}>
                    <p className={`text-xs font-bold ${textMuted}`}>Stock actual</p>
                    <p
                      className={`text-lg font-bold ${
                        prod.StockActual <= 5
                          ? 'text-red-500'
                          : prod.StockActual <= 15
                            ? 'text-amber-500'
                            : textPrimary
                      }`}
                    >
                      {prod.StockActual}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-emerald-500" />
                    <span className={`text-sm ${textSecondary}`}>
                      {prod.CategoriaNombre ?? 'Sin categoría'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-blue-500" />
                    <span className={`text-sm ${textSecondary}`}>
                      {prod.ProveedorNombre ?? 'Sin proveedor'}
                    </span>
                  </div>
                </div>

                {prod.CodigoBarras && (
                  <div className={`mt-4 pt-4 border-t ${divider}`}>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className={`rounded-xl border p-3 ${surfaceAlt} flex items-center gap-3`}>
                        <EtiquetaBarcode
                          ref={barcodeCanvasRef}
                          codigo={prod.CodigoBarras}
                          nombre={prod.Nombre}
                          precio={prod.PrecioDetal}
                          className={dm ? 'text-slate-100' : ''}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const canvas = barcodeCanvasRef.current
                          const imgData = canvas?.toDataURL?.('image/png') ?? ''
                          const ventana = window.open('', '_blank', 'width=400,height=320')
                          if (!ventana) return
                          const nombreEsc = prod.Nombre.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
                          ventana.document.write(`
                            <!DOCTYPE html>
                            <html>
                            <head><title>Etiqueta - ${nombreEsc}</title></head>
                            <body style="margin:0;padding:16px;font-family:sans-serif;text-align:center">
                              ${imgData ? `<img src="${imgData}" alt="Código de barras" style="max-width:100%" />` : `<p>${prod.CodigoBarras}</p>`}
                              <p style="font-weight:bold;margin-top:8px">${nombreEsc}</p>
                              <p style="font-size:18px;font-weight:bold">${fmt(prod.PrecioDetal)}</p>
                            </body>
                            </html>
                          `)
                          ventana.document.close()
                          ventana.focus()
                          setTimeout(() => {
                            ventana.print()
                            ventana.close()
                          }, 300)
                        }}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all active:scale-95 ${
                          dm
                            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40'
                            : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/30'
                        }`}
                      >
                        <Printer size={18} />
                        Imprimir etiqueta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div
                className={`rounded-2xl border p-4 ${surface} flex flex-col items-center justify-center`}
              >
                <BarChart3 size={28} className="text-emerald-500 mb-2" />
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.totalVendido}</p>
                <p className={`text-xs font-semibold ${textMuted}`}>Unidades vendidas</p>
              </div>
              <div
                className={`rounded-2xl border p-4 ${surface} flex flex-col items-center justify-center`}
              >
                <TrendingUp size={28} className="text-emerald-500 mb-2" />
                <p className={`text-lg font-bold ${textPrimary}`}>{fmt(stats.ingresosVentas)}</p>
                <p className={`text-xs font-semibold ${textMuted}`}>Ingresos por ventas</p>
              </div>
              <div
                className={`rounded-2xl border p-4 ${surface} flex flex-col items-center justify-center`}
              >
                <Receipt size={28} className="text-blue-500 mb-2" />
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.countVentas}</p>
                <p className={`text-xs font-semibold ${textMuted}`}>Ventas con este producto</p>
              </div>
              <div
                className={`rounded-2xl border p-4 ${surface} flex flex-col items-center justify-center`}
              >
                <Bookmark size={28} className="text-amber-500 mb-2" />
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.totalApartado}</p>
                <p className={`text-xs font-semibold ${textMuted}`}>Unidades en apartados</p>
              </div>
              <div
                className={`rounded-2xl border p-4 ${surface} flex flex-col items-center justify-center`}
              >
                <Box size={28} className="text-cyan-500 mb-2" />
                <p className={`text-2xl font-bold ${textPrimary}`}>{stockTotal}</p>
                <p className={`text-xs font-semibold ${textMuted}`}>Stock total (prod+variantes)</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Descripción */}
            <div className={`rounded-2xl border p-5 ${surface}`}>
              <h3 className={`text-sm font-bold flex items-center gap-2 mb-3 ${textPrimary}`}>
                <FileText size={18} className="text-emerald-500" />
                Descripción
              </h3>
              <p className={`text-sm whitespace-pre-wrap ${textSecondary}`}>
                {prod.Descripcion?.trim() || 'Sin descripción.'}
              </p>
            </div>

            {/* Proveedor completo */}
            {prod.ProveedorNombre && (
              <div className={`rounded-2xl border p-5 ${surface}`}>
                <h3 className={`text-sm font-bold flex items-center gap-2 mb-3 ${textPrimary}`}>
                  <Truck size={18} className="text-emerald-500" />
                  Proveedor
                </h3>
                <div className={`space-y-1 text-sm ${textSecondary}`}>
                  <p className="font-semibold">{prod.ProveedorNombre}</p>
                  {(prod as { ProveedorContacto?: string }).ProveedorContacto && (
                    <p>Contacto: {(prod as { ProveedorContacto?: string }).ProveedorContacto}</p>
                  )}
                  {(prod as { ProveedorTelefono?: string }).ProveedorTelefono && (
                    <p>Tel: {(prod as { ProveedorTelefono?: string }).ProveedorTelefono}</p>
                  )}
                  {(prod as { ProveedorEmail?: string }).ProveedorEmail && (
                    <p>Email: {(prod as { ProveedorEmail?: string }).ProveedorEmail}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Variantes */}
          {variantes.length > 0 && (
            <div className={`rounded-2xl border overflow-hidden ${surface}`}>
              <div className={`px-5 py-4 border-b ${divider}`}>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${textPrimary}`}>
                  <Layers size={18} className="text-emerald-500" />
                  Variantes ({variantes.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className={dm ? 'bg-slate-800/60 text-slate-400' : 'bg-gray-50 text-gray-500'}>
                      <th className="px-5 py-3 text-left text-xs font-bold uppercase">Atributo</th>
                      <th className="px-5 py-3 text-left text-xs font-bold uppercase">Valor</th>
                      <th className="px-5 py-3 text-right text-xs font-bold uppercase">Stock</th>
                      <th className="px-5 py-3 text-right text-xs font-bold uppercase">Precio +</th>
                      <th className="px-5 py-3 text-left text-xs font-bold uppercase">SKU</th>
                      <th className="px-5 py-3 text-left text-xs font-bold uppercase">Cód. barras</th>
                      <th className="px-5 py-3 text-left text-xs font-bold uppercase">Imágenes</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${divider}`}>
                    {variantes.map((v) => {
                      const imgs = (v as typeof v & { Imagenes?: unknown }).Imagenes as
                        | {
                            Id: number
                            Url: string
                            EsPrincipal: boolean
                            EtiquetaAngulo: string | null
                          }[]
                        | undefined
                      const count = imgs?.length ?? 0
                      const principal =
                        imgs?.find((i) => i.EsPrincipal) ?? imgs?.[0] ?? null
                      const angulos =
                        imgs && imgs.length > 0
                          ? Array.from(
                              new Set(
                                imgs
                                  .map((i) => i.EtiquetaAngulo)
                                  .filter(
                                    (x): x is string => Boolean(x && x.trim()),
                                  ),
                              ),
                            )
                          : []

                      return (
                        <tr
                          key={v.Id}
                          className={
                            dm ? 'hover:bg-slate-800/30' : 'hover:bg-gray-50'
                          }
                        >
                          <td className={`px-5 py-3 text-sm ${textPrimary}`}>
                            {v.Atributo}
                          </td>
                          <td className={`px-5 py-3 text-sm ${textPrimary}`}>
                            <div className="flex items-center gap-2">
                              {v.Atributo === 'Color' && (v as any).ColorHex && (
                                <span
                                  className="h-4 w-4 rounded-full border border-slate-300 dark:border-slate-600"
                                  style={{
                                    backgroundColor: ((v as any).ColorHex as string) ?? '#9ca3af',
                                  }}
                                  title={(v as any).ColorNombre ?? v.Valor}
                                />
                              )}
                              <span>{v.Valor}</span>
                            </div>
                          </td>
                          <td
                            className={`px-5 py-3 text-sm text-right font-mono ${textPrimary}`}
                          >
                            {v.StockActual}
                          </td>
                          <td
                            className={`px-5 py-3 text-sm text-right font-mono ${textPrimary}`}
                          >
                            {v.PrecioAdicional > 0
                              ? `+${fmt(v.PrecioAdicional)}`
                              : '—'}
                          </td>
                          <td
                            className={`px-5 py-3 text-sm font-mono ${textSecondary}`}
                          >
                            {v.CodigoSKU ?? '—'}
                          </td>
                          <td className={`px-5 py-3 ${textSecondary}`}>
                            {v.CodigoBarras ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <BarcodeMini
                                  codigo={v.CodigoBarras}
                                  height={32}
                                  className="shrink-0"
                                />
                                <span className="text-xs font-mono hidden sm:inline">
                                  {v.CodigoBarras}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nombre = `${prod.Nombre} (${v.Atributo}: ${v.Valor})`
                                    const precio =
                                      prod.PrecioDetal +
                                      (v.PrecioAdicional ?? 0)
                                    const codigoEsc = (
                                      v.CodigoBarras ?? ''
                                    )
                                      .replace(/\\/g, '\\\\')
                                      .replace(/"/g, '\\"')
                                    const nombreEsc = nombre
                                      .replace(/</g, '&lt;')
                                      .replace(/>/g, '&gt;')
                                      .replace(/"/g, '&quot;')
                                    const ventana = window.open(
                                      '',
                                      '_blank',
                                      'width=400,height=320',
                                    )
                                    if (!ventana) return
                                    ventana.document.write(`
                                      <!DOCTYPE html>
                                      <html>
                                      <head><title>Etiqueta - ${nombreEsc}</title><script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script></head>
                                      <body style="margin:0;padding:16px;font-family:sans-serif;text-align:center">
                                        <p style="font-weight:bold;margin:0 0 4px 0">${nombreEsc}</p>
                                        <p style="font-size:16px;font-weight:bold;margin:0 0 8px 0">${fmt(precio)}</p>
                                        <svg id="bc"><\/svg>
                                        <script>try{ JsBarcode("#bc","${codigoEsc}",{format:"CODE128",width:2,height:50,displayValue:true}); }catch(e){ document.getElementById("bc").textContent="${(v.CodigoBarras ?? '').replace(/"/g, '&quot;')}"; }<\/script>
                                      </body>
                                      </html>
                                    `)
                                    ventana.document.close()
                                    ventana.focus()
                                    setTimeout(() => {
                                      ventana.print()
                                      ventana.close()
                                    }, 300)
                                  }}
                                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold shrink-0 ${
                                    dm
                                      ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                      : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                                  }`}
                                  title="Imprimir etiqueta"
                                >
                                  <Printer size={12} />
                                  Imprimir
                                </button>
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-5 py-3 text-sm">
                            {count === 0 ? (
                              <span className={textSecondary}>Sin propias</span>
                            ) : (
                              <div className="flex items-center gap-2">
                                {principal && (
                                  <div className="h-9 w-9 rounded-lg overflow-hidden border border-slate-600/60 shrink-0">
                                    <img
                                      src={principal.Url}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <div className="flex flex-col">
                                  <span className={textPrimary}>
                                    {count} imagen
                                    {count > 1 ? 'es' : ''}
                                  </span>
                                  {angulos.length > 0 && (
                                    <span className={`text-[11px] ${textSecondary}`}>
                                      Ángulos:{' '}
                                      {angulos.join(', ')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Imágenes (galería completa) */}
          {imagenes.length > 1 && (
            <div className={`rounded-2xl border p-5 ${surface}`}>
              <h3 className={`text-sm font-bold flex items-center gap-2 mb-4 ${textPrimary}`}>
                <ImageIcon size={18} className="text-emerald-500" />
                Galería de imágenes ({imagenes.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {imagenes.map((img) => (
                  <div
                    key={img.Id}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 ${
                      img.EsPrincipal ? 'border-emerald-500' : dm ? 'border-slate-700' : 'border-gray-200'
                    }`}
                  >
                    <img src={img.Url} alt="" className="w-full h-full object-cover" />
                    {img.EsPrincipal && (
                      <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-bold">
                        Principal
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Promociones */}
          {promociones.length > 0 && (
            <div className={`rounded-2xl border overflow-hidden ${surface}`}>
              <div className={`px-5 py-4 border-b ${divider}`}>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${textPrimary}`}>
                  <Percent size={18} className="text-emerald-500" />
                  Promociones ({promociones.length})
                </h3>
              </div>
              <div className="divide-y divide-slate-800 dark:divide-slate-700">
                {promociones.map((pr) => (
                  <div key={pr.Id} className="px-5 py-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className={`font-semibold ${textPrimary}`}>{pr.Nombre}</p>
                      <p className={`text-xs ${textSecondary}`}>
                        {pr.TipoDescuento === 'PORCENTAJE'
                          ? `${pr.ValorDescuento}% descuento`
                          : `${fmt(pr.ValorDescuento)} descuento`}{' '}
                        · {new Date(pr.FechaInicio).toLocaleDateString('es-CO')} –{' '}
                        {new Date(pr.FechaFin).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        pr.Activo ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-500/10 text-slate-400'
                      }`}
                    >
                      {pr.Activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Últimas ventas */}
          {ultimasVentas.length > 0 && (
            <div className={`rounded-2xl border overflow-hidden ${surface}`}>
              <div className={`px-5 py-4 border-b ${divider}`}>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${textPrimary}`}>
                  <Receipt size={18} className="text-emerald-500" />
                  Últimas ventas con este producto
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className={dm ? 'bg-slate-800/60 text-slate-400' : 'bg-gray-50 text-gray-500'}>
                      <th className="px-5 py-3 text-left text-xs font-bold uppercase">Fecha</th>
                      <th className="px-5 py-3 text-left text-xs font-bold uppercase">Cliente</th>
                      <th className="px-5 py-3 text-right text-xs font-bold uppercase">Cant.</th>
                      <th className="px-5 py-3 text-right text-xs font-bold uppercase">Importe</th>
                      <th className="px-5 py-3 text-right text-xs font-bold uppercase">Total venta</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${divider}`}>
                    {ultimasVentas.map((uv) => (
                      <tr key={uv.VentaId} className={dm ? 'hover:bg-slate-800/30' : 'hover:bg-gray-50'}>
                        <td className={`px-5 py-3 text-sm ${textSecondary}`}>
                          {new Date(uv.Fecha).toLocaleString('es-CO', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className={`px-5 py-3 text-sm ${textPrimary}`}>{uv.ClienteNombre}</td>
                        <td className={`px-5 py-3 text-sm text-right font-mono ${textPrimary}`}>
                          {uv.Cantidad}
                        </td>
                        <td className={`px-5 py-3 text-sm text-right font-mono ${textPrimary}`}>
                          {fmt(uv.Importe)}
                        </td>
                        <td className={`px-5 py-3 text-sm text-right font-mono ${textSecondary}`}>
                          {fmt(uv.Total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Movimientos recientes */}
          {movimientos.length > 0 && (
            <div className={`rounded-2xl border overflow-hidden ${surface}`}>
              <div className={`px-5 py-4 border-b ${divider}`}>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${textPrimary}`}>
                  <Activity size={18} className="text-emerald-500" />
                  Movimientos de inventario recientes
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className={dm ? 'bg-slate-800/60 text-slate-400' : 'bg-gray-50 text-gray-500'}>
                      <th className="px-5 py-3 text-left text-xs font-bold uppercase">Fecha</th>
                      <th className="px-5 py-3 text-left text-xs font-bold uppercase">Tipo</th>
                      <th className="px-5 py-3 text-right text-xs font-bold uppercase">Cantidad</th>
                      <th className="px-5 py-3 text-left text-xs font-bold uppercase">Variante</th>
                      <th className="px-5 py-3 text-left text-xs font-bold uppercase">Motivo</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${divider}`}>
                    {movimientos.map((m) => (
                      <tr key={m.Id} className={dm ? 'hover:bg-slate-800/30' : 'hover:bg-gray-50'}>
                        <td className={`px-5 py-3 text-sm ${textSecondary}`}>
                          {new Date(m.Fecha).toLocaleString('es-CO', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className={`px-5 py-3 text-sm ${textPrimary}`}>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              m.TipoMovimiento === 'ENTRADA'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : 'bg-red-500/10 text-red-600'
                            }`}
                          >
                            {m.TipoMovimiento}
                          </span>
                        </td>
                        <td className={`px-5 py-3 text-sm text-right font-mono ${textPrimary}`}>
                          {m.Cantidad > 0 ? `+${m.Cantidad}` : m.Cantidad}
                        </td>
                        <td className={`px-5 py-3 text-sm ${textSecondary}`}>
                          {m.VarianteAtributo && m.VarianteValor
                            ? `${m.VarianteAtributo}: ${m.VarianteValor}`
                            : '—'}
                        </td>
                        <td className={`px-5 py-3 text-sm ${textSecondary}`}>
                          {m.Motivo ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Metadatos */}
          <div className={`rounded-2xl border p-5 ${surface}`}>
            <h3 className={`text-sm font-bold flex items-center gap-2 mb-3 ${textPrimary}`}>
              <Calendar size={18} className="text-emerald-500" />
              Información del registro
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className={`font-semibold ${textMuted}`}>Fecha de creación</p>
                <p className={textPrimary}>{fechaCreacion}</p>
              </div>
              <div>
                <p className={`font-semibold ${textMuted}`}>Última modificación</p>
                <p className={textPrimary}>{fechaModificacion}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

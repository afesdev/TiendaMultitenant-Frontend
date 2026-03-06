import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowLeft, Calendar, Percent, Tag, Package } from 'lucide-react'
import type {
  NuevaPromocionPayload,
  Producto,
  ProductoVariante,
  PromocionResumen,
} from '../types'

interface PromocionFormViewProps {
  dm: boolean
  textPrimary: string
  textSecondary: string
  textMuted: string
  btnSecondary: string
  productos: Producto[]
  variantes: ProductoVariante[]
  loading: boolean
  editando: PromocionResumen | null
  productoPreseleccionadoId?: number | null
  onBack: () => void
  onSubmit: (payload: NuevaPromocionPayload) => Promise<void> | void
}

interface ProductoPromoSel {
  productoId: number
  varianteId?: number | null
}

export function PromocionFormView({
  dm,
  textPrimary,
  textSecondary,
  textMuted,
  btnSecondary,
  productos,
  variantes,
  loading,
  editando,
  productoPreseleccionadoId,
  onBack,
  onSubmit,
}: PromocionFormViewProps) {
  const [nombre, setNombre] = useState(editando?.Nombre ?? '')
  const [descripcion, setDescripcion] = useState(editando?.Descripcion ?? '')
  const [tipoDescuento, setTipoDescuento] = useState<'PORCENTAJE' | 'FIJO'>(
    (editando?.TipoDescuento as 'PORCENTAJE' | 'FIJO') ?? 'PORCENTAJE',
  )
  const [valorDescuento, setValorDescuento] = useState(editando?.ValorDescuento ?? 0)
  const [minCantidad, setMinCantidad] = useState<number | ''>(editando?.MinCantidad ?? '')
  const [minTotal, setMinTotal] = useState<number | ''>(editando?.MinTotal ?? '')
  const [aplicaSobre, setAplicaSobre] = useState(editando?.AplicaSobre ?? 'DETAL')

  const [fechaInicio, setFechaInicio] = useState(() => {
    if (editando?.FechaInicio) return editando.FechaInicio.slice(0, 10)
    const d = new Date()
    return d.toISOString().slice(0, 10)
  })
  const [fechaFin, setFechaFin] = useState(() => {
    if (editando?.FechaFin) return editando.FechaFin.slice(0, 10)
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().slice(0, 10)
  })

  const [activo, setActivo] = useState(editando?.Activo ?? true)

  const [productoSearch, setProductoSearch] = useState('')
  const [items, setItems] = useState<ProductoPromoSel[]>([])

  const productosFiltrados = useMemo(() => {
    const q = productoSearch.toLowerCase().trim()
    if (!q) return productos
    return productos.filter(
      (p) =>
        p.Nombre.toLowerCase().includes(q) ||
        p.CodigoInterno.toLowerCase().includes(q) ||
        (p.CodigoBarras ?? '').toLowerCase().includes(q),
    )
  }, [productos, productoSearch])

  const variantesPorProducto = useMemo(() => {
    const map = new Map<number, ProductoVariante[]>()
    for (const v of variantes) {
      const list = map.get(v.Producto_Id) ?? []
      list.push(v)
      map.set(v.Producto_Id, list)
    }
    return map
  }, [variantes])

  // Si venimos desde el formulario de producto, preseleccionar ese producto una sola vez
  useEffect(() => {
    if (!editando && productoPreseleccionadoId && items.length === 0) {
      const existeProducto = productos.some((p) => p.Id === productoPreseleccionadoId)
      if (existeProducto) {
        setItems([{ productoId: productoPreseleccionadoId, varianteId: null }])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editando, productoPreseleccionadoId])

  const handleAddProducto = (productoId: number) => {
    setItems((prev) => {
      if (prev.some((i) => i.productoId === productoId && !i.varianteId)) {
        return prev
      }
      return [...prev, { productoId, varianteId: null }]
    })
  }

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleChangeVariante = (index: number, varianteId: number | null) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, varianteId } : it)),
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return
    if (valorDescuento <= 0) return
    if (!fechaInicio || !fechaFin) return
    if (items.length === 0) return

    const payload: NuevaPromocionPayload = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      tipoDescuento,
      valorDescuento,
      tipoAplicacion: 'PRODUCTO',
      minCantidad: minCantidad === '' ? null : Number(minCantidad),
      minTotal: minTotal === '' ? null : Number(minTotal),
      aplicaSobre: aplicaSobre || null,
      fechaInicio,
      fechaFin,
      activo,
      productos: items.map((it) => ({
        productoId: it.productoId,
        varianteId: it.varianteId ?? null,
      })),
    }

    await onSubmit(payload)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Percent size={22} />
            </div>
            <h2 className={`text-xl font-bold ${textPrimary}`}>
              {editando ? 'Editar promoción' : 'Nueva promoción'}
            </h2>
          </div>
          <p className={`text-sm ${textSecondary}`}>
            Configura el descuento y los productos/variantes a los que aplica.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${btnSecondary}`}
        >
          <ArrowLeft size={16} />
          Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Datos básicos */}
        <div
          className={`rounded-2xl border p-5 ${
            dm ? 'border-slate-800 bg-slate-900/40' : 'border-gray-200 bg-white'
          }`}
        >
          <p className={`text-sm font-bold ${textPrimary}`}>Datos básicos</p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>Nombre</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2 text-sm ${
                  dm
                    ? 'border-slate-700 bg-slate-900 text-slate-100'
                    : 'border-gray-200 bg-white text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>Estado</label>
              <div className="flex items-center gap-2">
                <input
                  id="promo-activo"
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-400"
                />
                <label htmlFor="promo-activo" className={`text-xs ${textSecondary}`}>
                  Activa
                </label>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>
              Descripción (opcional)
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              className={`w-full rounded-xl border px-3 py-2 text-sm resize-none ${
                dm
                  ? 'border-slate-700 bg-slate-900 text-slate-100'
                  : 'border-gray-200 bg-white text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Descuento y periodo */}
        <div
          className={`rounded-2xl border p-5 ${
            dm ? 'border-slate-800 bg-slate-900/40' : 'border-gray-200 bg-white'
          }`}
        >
          <p className={`text-sm font-bold ${textPrimary}`}>Descuento y periodo</p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>
                Tipo de descuento
              </label>
              <select
                value={tipoDescuento}
                onChange={(e) =>
                  setTipoDescuento(e.target.value as 'PORCENTAJE' | 'FIJO')
                }
                className={`w-full rounded-xl border px-3 py-2 text-sm ${
                  dm
                    ? 'border-slate-700 bg-slate-900 text-slate-100'
                    : 'border-gray-200 bg-white text-gray-900'
                }`}
              >
                <option value="PORCENTAJE">Porcentaje (%)</option>
                <option value="FIJO">Valor fijo ($)</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>
                Valor del descuento
              </label>
              <input
                type="number"
                min={0}
                value={valorDescuento}
                onChange={(e) => setValorDescuento(Number(e.target.value))}
                className={`w-full rounded-xl border px-3 py-2 text-sm ${
                  dm
                    ? 'border-slate-700 bg-slate-900 text-slate-100'
                    : 'border-gray-200 bg-white text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>
                Aplica sobre
              </label>
              <select
                value={aplicaSobre ?? 'DETAL'}
                onChange={(e) => setAplicaSobre(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2 text-sm ${
                  dm
                    ? 'border-slate-700 bg-slate-900 text-slate-100'
                    : 'border-gray-200 bg-white text-gray-900'
                }`}
              >
                <option value="DETAL">Precio detal</option>
                <option value="MAYORISTA">Precio mayorista</option>
                <option value="AMBOS">Ambos</option>
              </select>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>
                Mín. cantidad (opcional)
              </label>
              <input
                type="number"
                min={0}
                value={minCantidad === '' ? '' : minCantidad}
                onChange={(e) =>
                  setMinCantidad(e.target.value ? Number(e.target.value) : '')
                }
                className={`w-full rounded-xl border px-3 py-2 text-sm ${
                  dm
                    ? 'border-slate-700 bg-slate-900 text-slate-100'
                    : 'border-gray-200 bg-white text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>
                Mín. total carrito (opcional)
              </label>
              <input
                type="number"
                min={0}
                value={minTotal === '' ? '' : minTotal}
                onChange={(e) => setMinTotal(e.target.value ? Number(e.target.value) : '')}
                className={`w-full rounded-xl border px-3 py-2 text-sm ${
                  dm
                    ? 'border-slate-700 bg-slate-900 text-slate-100'
                    : 'border-gray-200 bg-white text-gray-900'
                }`}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>
                  Fecha inicio
                </label>
                <div className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm border-slate-700/60">
                  <Calendar size={14} className="text-emerald-500" />
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="flex-1 bg-transparent outline-none"
                  />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>
                  Fecha fin
                </label>
                <div className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm border-slate-700/60">
                  <Calendar size={14} className="text-emerald-500" />
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="flex-1 bg-transparent outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Productos / variantes */}
        <div
          className={`rounded-2xl border p-5 ${
            dm ? 'border-slate-800 bg-slate-900/40' : 'border-gray-200 bg-white'
          }`}
        >
          <p className={`text-sm font-bold ${textPrimary}`}>Productos y variantes</p>
          <div className="mt-3 grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
            <div className="lg:col-span-5">
              <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>
                Buscar producto
              </label>
              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                  dm ? 'border-slate-700 bg-slate-900/60' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <Package size={16} className="text-emerald-500" />
                <input
                  value={productoSearch}
                  onChange={(e) => setProductoSearch(e.target.value)}
                  placeholder="Nombre o código…"
                  className={`flex-1 bg-transparent outline-none text-sm ${textPrimary}`}
                />
              </div>

              <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-700/30">
                {productosFiltrados.map((p) => (
                  <button
                    key={p.Id}
                    type="button"
                    onClick={() => handleAddProducto(p.Id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-[11px] text-left transition-colors ${
                      dm
                        ? 'hover:bg-slate-800 text-slate-100'
                        : 'hover:bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="h-8 w-8 rounded-lg overflow-hidden border border-slate-700/40 flex items-center justify-center bg-slate-900/10">
                      {p.ImagenUrl ? (
                        <img
                          src={p.ImagenUrl}
                          alt={p.Nombre}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package size={16} className={textMuted} />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className={`font-semibold truncate ${textPrimary}`}>{p.Nombre}</span>
                      <span className={`font-mono text-[11px] ${textMuted}`}>
                        {p.CodigoInterno}
                      </span>
                    </div>
                  </button>
                ))}
                {productosFiltrados.length === 0 && (
                  <p className={`px-3 py-2 text-[11px] ${textMuted}`}>
                    No hay productos que coincidan con la búsqueda.
                  </p>
                )}
              </div>
            </div>

            <div className="lg:col-span-7">
              <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>
                Productos incluidos en la promoción
              </label>
              <div className="mt-1 rounded-xl border border-slate-700/40 overflow-hidden">
                <table className="min-w-full text-xs">
                  <thead
                    className={
                      dm ? 'bg-slate-900/80 text-slate-200' : 'bg-gray-50 text-gray-700'
                    }
                  >
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Producto</th>
                      <th className="px-3 py-2 text-left font-semibold">Variante</th>
                      <th className="px-3 py-2 text-right font-semibold" />
                    </tr>
                  </thead>
                  <tbody
                    className={dm ? 'divide-y divide-slate-800' : 'divide-y divide-gray-100'}
                  >
                    {items.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className={`px-3 py-4 text-center text-[11px] ${textMuted}`}
                        >
                          Agrega al menos un producto a la promoción.
                        </td>
                      </tr>
                    )}
                    {items.map((it, idx) => {
                      const p = productos.find((pp) => pp.Id === it.productoId)
                      const vars = variantesPorProducto.get(it.productoId) ?? []
                      return (
                        <tr key={`${it.productoId}-${idx}`}>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-lg overflow-hidden border border-slate-700/40 flex items-center justify-center bg-slate-900/10">
                                {p?.ImagenUrl ? (
                                  <img
                                    src={p.ImagenUrl}
                                    alt={p.Nombre}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Package size={16} className={textMuted} />
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className={`font-semibold truncate ${textPrimary}`}>
                                  {p?.Nombre ?? `#${it.productoId}`}
                                </span>
                                <span className={`text-[11px] ${textMuted}`}>
                                  {p?.CodigoInterno ?? ''}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={it.varianteId ?? ''}
                              onChange={(e) =>
                                handleChangeVariante(
                                  idx,
                                  e.target.value ? Number(e.target.value) : null,
                                )
                              }
                              className={`w-full rounded-xl border px-2 py-1 text-xs ${
                                dm
                                  ? 'border-slate-700 bg-slate-900 text-slate-100'
                                  : 'border-gray-200 bg-white text-gray-900'
                              }`}
                            >
                              <option value="">Todas las variantes</option>
                              {vars.map((v) => (
                                <option key={v.Id} value={v.Id}>
                                  {v.Atributo}: {v.Valor}{' '}
                                  {v.CodigoSKU ? `(SKU ${v.CodigoSKU})` : ''}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className={`text-[11px] ${
                                dm ? 'text-red-400' : 'text-red-600'
                              }`}
                            >
                              Quitar
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !nombre.trim() || valorDescuento <= 0 || items.length === 0}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${
              loading || !nombre.trim() || valorDescuento <= 0 || items.length === 0
                ? 'opacity-50 cursor-not-allowed bg-emerald-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Tag size={16} />
            {editando ? 'Actualizar promoción' : 'Crear promoción'}
          </button>
        </div>
      </form>
    </div>
  )
}


import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowLeft, Bookmark, Layers, Package, Plus, User } from 'lucide-react'
import type { Cliente, NuevoApartadoPayload, Producto, ProductoVariante } from '../types'

interface LineaApartadoUI {
  productoId: number
  cantidad: number
  precioVenta: number
  varianteId?: number | null
}

interface ApartadoFormViewProps {
  dm: boolean
  textPrimary: string
  textSecondary: string
  textMuted: string
  btnSecondary: string
  clientes: Cliente[]
  productos: Producto[]
  variantes: ProductoVariante[]
  loading: boolean
  onBack: () => void
  onSubmit: (payload: NuevoApartadoPayload) => Promise<void> | void
}

export function ApartadoFormView({
  dm,
  textPrimary,
  textSecondary,
  textMuted,
  btnSecondary,
  clientes,
  productos,
  variantes,
  loading,
  onBack,
  onSubmit,
}: ApartadoFormViewProps) {
  const [clienteSearch, setClienteSearch] = useState('')
  const [clienteId, setClienteId] = useState<number | null>(null)

  const [productoSearch, setProductoSearch] = useState('')
  const [productoIdSeleccionado, setProductoIdSeleccionado] = useState<number | null>(null)
  const [varianteIdSeleccionada, setVarianteIdSeleccionada] = useState<number | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [precioVenta, setPrecioVenta] = useState(0)

  const [fechaVencimiento, setFechaVencimiento] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    // yyyy-mm-dd
    return d.toISOString().slice(0, 10)
  })

  const [pagoInicialMonto, setPagoInicialMonto] = useState(0)
  const [pagoInicialMetodo, setPagoInicialMetodo] = useState<'EFECTIVO' | 'TRANSFERENCIA' | 'MIXTO'>(
    'EFECTIVO',
  )
  const [pagoInicialReferencia, setPagoInicialReferencia] = useState('')
  const [pagoInicialNotas, setPagoInicialNotas] = useState('')

  const [lineas, setLineas] = useState<LineaApartadoUI[]>([])
  const [productoPickerOpen, setProductoPickerOpen] = useState(false)

  const clientesFiltrados = useMemo(() => {
    const q = clienteSearch.toLowerCase().trim()
    if (!q) return clientes
    return clientes.filter(
      (c) =>
        c.Nombre.toLowerCase().includes(q) ||
        c.Cedula.toLowerCase().includes(q) ||
        (c.Celular ?? '').toLowerCase().includes(q),
    )
  }, [clientes, clienteSearch])

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

  const productoSeleccionado = productoIdSeleccionado
    ? productos.find((p) => p.Id === productoIdSeleccionado)
    : null

  const variantesDelProducto = useMemo(() => {
    if (!productoIdSeleccionado) return []
    return variantes.filter((v) => v.Producto_Id === productoIdSeleccionado)
  }, [variantes, productoIdSeleccionado])

  // Ajustar precio según producto + variante (como en registrar venta)
  useEffect(() => {
    if (!productoIdSeleccionado) return
    const prod = productos.find((p) => p.Id === productoIdSeleccionado)
    if (!prod) return

    const base = prod.PrecioDetal ?? 0
    const varianteSel = variantesDelProducto.find((v) => v.Id === varianteIdSeleccionada)
    const adicional = varianteSel?.PrecioAdicional ?? 0
    setPrecioVenta(base + adicional)
  }, [productoIdSeleccionado, varianteIdSeleccionada, productos, variantesDelProducto])

  const subtotal = lineas.reduce((acc, l) => acc + l.cantidad * l.precioVenta, 0)

  const fmt = (n: number) =>
    n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

  const handleAddLinea = () => {
    if (!productoIdSeleccionado) return
    if (cantidad <= 0) return
    if (precioVenta <= 0) return

    const prod = productos.find((p) => p.Id === productoIdSeleccionado)
    if (!prod) return

    setLineas((prev) => [
      ...prev,
      {
        productoId: prod.Id,
        cantidad,
        precioVenta,
        varianteId: varianteIdSeleccionada ?? null,
      },
    ])
    setProductoIdSeleccionado(null)
    setVarianteIdSeleccionada(null)
    setCantidad(1)
    setPrecioVenta(0)
    setProductoSearch('')
  }

  const handleRemoveLinea = (idx: number) => {
    setLineas((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!clienteId) return
    if (!fechaVencimiento) return
    if (lineas.length === 0) return

    const payload: NuevoApartadoPayload = {
      clienteId,
      fechaVencimiento,
      items: lineas.map((l) => ({
        productoId: l.productoId,
        cantidad: l.cantidad,
        precioVenta: l.precioVenta,
        varianteId: l.varianteId ?? null,
      })),
      pagoInicial:
        pagoInicialMonto > 0
          ? {
              monto: pagoInicialMonto,
              metodoPago: pagoInicialMetodo,
              referencia: pagoInicialReferencia.trim() || undefined,
              notas: pagoInicialNotas.trim() || undefined,
            }
          : null,
    }

    await onSubmit(payload)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Bookmark size={22} />
            </div>
            <h2 className={`text-xl font-bold ${textPrimary}`}>Crear apartado</h2>
          </div>
          <p className={`text-sm ${textSecondary}`}>
            Selecciona cliente, agrega productos y define vencimiento/abono inicial.
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
        {/* Cliente */}
        <div className={`rounded-2xl border p-5 ${dm ? 'border-slate-800 bg-slate-900/40' : 'border-gray-200 bg-white'}`}>
          <p className={`text-sm font-bold ${textPrimary}`}>Cliente</p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>Buscar</label>
              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                  dm ? 'border-slate-700 bg-slate-900/60' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <User size={16} className="text-emerald-500" />
                <input
                  value={clienteSearch}
                  onChange={(e) => setClienteSearch(e.target.value)}
                  placeholder="Nombre, cédula o celular…"
                  className={`flex-1 bg-transparent outline-none text-sm ${textPrimary}`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>Seleccionar</label>
              <select
                value={clienteId ?? ''}
                onChange={(e) => setClienteId(e.target.value ? Number(e.target.value) : null)}
                className={`w-full rounded-xl border px-3 py-2 text-sm ${
                  dm
                    ? 'border-slate-700 bg-slate-900 text-slate-100'
                    : 'border-gray-200 bg-white text-gray-900'
                }`}
              >
                <option value="">Selecciona un cliente</option>
                {clientesFiltrados.map((c) => (
                  <option key={c.Id} value={c.Id}>
                    {c.Nombre} · {c.Cedula}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Configuración */}
        <div className={`rounded-2xl border p-5 ${dm ? 'border-slate-800 bg-slate-900/40' : 'border-gray-200 bg-white'}`}>
          <p className={`text-sm font-bold ${textPrimary}`}>Configuración</p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>Fecha vencimiento</label>
              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2 text-sm ${
                  dm
                    ? 'border-slate-700 bg-slate-900 text-slate-100'
                    : 'border-gray-200 bg-white text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>Total (estimado)</label>
              <div className={`w-full rounded-xl border px-3 py-2 text-sm font-mono ${dm ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-gray-200 bg-gray-50 text-gray-900'}`}>
                {fmt(subtotal)}
              </div>
            </div>
          </div>
        </div>

        {/* Productos y variantes */}
        <div className={`rounded-2xl border p-5 ${dm ? 'border-slate-800 bg-slate-900/40' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-sm font-bold ${textPrimary}`}>Productos y variantes</p>
            <span className={`text-xs ${textMuted}`}>{lineas.length} líneas</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
            {/* Resumen producto seleccionado + botón Buscar/Cambiar (igual patrón que venta) */}
            <div className="md:col-span-2 space-y-2">
              <div
                className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 ${
                  dm ? 'border-slate-700 bg-slate-900/60' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-700/40 flex items-center justify-center bg-slate-900/20">
                    {productoSeleccionado?.ImagenUrl ? (
                      <img
                        src={productoSeleccionado.ImagenUrl}
                        alt={productoSeleccionado.Nombre}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package size={18} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span
                      className={`text-xs font-semibold ${textPrimary} truncate max-w-[150px] sm:max-w-[220px]`}
                    >
                      {productoSeleccionado?.Nombre ?? 'Sin producto seleccionado'}
                    </span>
                    {productoSeleccionado && (
                      <span className={`text-[11px] font-mono ${textMuted} truncate`}>
                        {productoSeleccionado.CodigoInterno}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setProductoSearch('')
                    setProductoPickerOpen(true)
                  }}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-[11px] font-semibold hover:bg-emerald-600 transition-colors"
                >
                  {productoSeleccionado ? 'Cambiar' : 'Buscar'}
                </button>
              </div>

              {productoSeleccionado && (
                <div
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-[11px] ${
                    dm ? 'border-slate-700 bg-slate-900/60' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className={textSecondary}>
                      Precio detal:{' '}
                      <span className="font-semibold">
                        {productoSeleccionado.PrecioDetal.toLocaleString('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </span>
                    <span className={textSecondary}>
                      Stock actual:{' '}
                      <span className="font-semibold">{productoSeleccionado.StockActual}</span>
                    </span>
                    {variantesDelProducto.length > 0 && (
                      <span className={textSecondary}>
                        Variantes disponibles:{' '}
                        <span className="font-semibold">{variantesDelProducto.length}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Variante (opcional, como en venta) */}
            <div>
              <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>
                Variante (opcional)
              </label>
              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                  dm ? 'border-slate-700 bg-slate-900/60' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <Layers size={14} className="text-emerald-500" />
                <select
                  value={varianteIdSeleccionada ?? ''}
                  onChange={(e) =>
                    setVarianteIdSeleccionada(e.target.value ? Number(e.target.value) : null)
                  }
                  className="flex-1 bg-transparent border-none text-xs focus:outline-none"
                >
                  <option value="">Sin variante</option>
                  {variantesDelProducto.map((v) => (
                    <option key={v.Id} value={v.Id}>
                      {v.Atributo}: {v.Valor} {v.CodigoSKU ? `(SKU ${v.CodigoSKU})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cantidad y precio */}
            <div className="space-y-2">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>Cant.</label>
                <input
                  type="number"
                  value={cantidad}
                  min={1}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                  className={`w-full rounded-xl border px-3 py-2 text-sm ${
                    dm
                      ? 'border-slate-700 bg-slate-900 text-slate-100'
                      : 'border-gray-200 bg-white text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>Precio</label>
                <input
                  type="number"
                  value={precioVenta}
                  min={0}
                  onChange={(e) => setPrecioVenta(Number(e.target.value))}
                  className={`w-full rounded-xl border px-3 py-2 text-sm ${
                    dm
                      ? 'border-slate-700 bg-slate-900 text-slate-100'
                      : 'border-gray-200 bg-white text-gray-900'
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={handleAddLinea}
                disabled={!productoSeleccionado || loading}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
                  !productoSeleccionado || loading
                    ? 'opacity-50 cursor-not-allowed bg-emerald-600 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Tabla líneas */}
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className={dm ? 'text-slate-400' : 'text-gray-500'}>
                  <th className="text-left py-2">Producto</th>
                  <th className="text-center py-2">Cant.</th>
                  <th className="text-right py-2">Precio</th>
                  <th className="text-right py-2">Importe</th>
                  <th className="text-right py-2"></th>
                </tr>
              </thead>
              <tbody className={dm ? 'divide-y divide-slate-800' : 'divide-y divide-gray-100'}>
                {lineas.length === 0 && (
                  <tr>
                    <td colSpan={5} className={`py-6 text-center ${textMuted}`}>
                      Agrega al menos un producto.
                    </td>
                  </tr>
                )}
                {lineas.map((l, idx) => {
                  const p = productos.find((x) => x.Id === l.productoId)
                  const v = variantes.find((vv) => vv.Id === (l.varianteId ?? undefined))
                  return (
                    <tr key={`${l.productoId}-${idx}`}>
                      <td className="py-2">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg overflow-hidden border border-slate-700/40 flex items-center justify-center bg-slate-900/10">
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
                          <div className="flex flex-col">
                            <span className={textPrimary}>{p?.Nombre ?? `#${l.productoId}`}</span>
                            <span className={`text-xs ${textMuted}`}>{p?.CodigoInterno ?? ''}</span>
                            {v && (
                              <span className="text-[11px] text-emerald-500">
                                {v.Atributo}: {v.Valor}{' '}
                                {v.CodigoSKU ? `(SKU ${v.CodigoSKU})` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className={`py-2 text-center ${textSecondary}`}>{l.cantidad}</td>
                      <td className={`py-2 text-right font-mono ${textSecondary}`}>
                        {fmt(l.precioVenta)}
                      </td>
                      <td className={`py-2 text-right font-mono font-semibold ${textPrimary}`}>
                        {fmt(l.cantidad * l.precioVenta)}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveLinea(idx)}
                          className={`text-xs ${dm ? 'text-red-400' : 'text-red-600'}`}
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

        {/* Pago inicial */}
        <div className={`rounded-2xl border p-5 ${dm ? 'border-slate-800 bg-slate-900/40' : 'border-gray-200 bg-white'}`}>
          <p className={`text-sm font-bold ${textPrimary}`}>Abono inicial (opcional)</p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>Monto</label>
              <input
                type="number"
                value={pagoInicialMonto}
                min={0}
                onChange={(e) => setPagoInicialMonto(Number(e.target.value))}
                className={`w-full rounded-xl border px-3 py-2 text-sm ${
                  dm
                    ? 'border-slate-700 bg-slate-900 text-slate-100'
                    : 'border-gray-200 bg-white text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>Método</label>
              <select
                value={pagoInicialMetodo}
                onChange={(e) =>
                  setPagoInicialMetodo(e.target.value as typeof pagoInicialMetodo)
                }
                className={`w-full rounded-xl border px-3 py-2 text-sm ${
                  dm
                    ? 'border-slate-700 bg-slate-900 text-slate-100'
                    : 'border-gray-200 bg-white text-gray-900'
                }`}
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="MIXTO">Mixto</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>Referencia</label>
              <input
                value={pagoInicialReferencia}
                onChange={(e) => setPagoInicialReferencia(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2 text-sm ${
                  dm
                    ? 'border-slate-700 bg-slate-900 text-slate-100'
                    : 'border-gray-200 bg-white text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${textMuted}`}>Notas</label>
              <input
                value={pagoInicialNotas}
                onChange={(e) => setPagoInicialNotas(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2 text-sm ${
                  dm
                    ? 'border-slate-700 bg-slate-900 text-slate-100'
                    : 'border-gray-200 bg-white text-gray-900'
                }`}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !clienteId || lineas.length === 0}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${
              loading || !clienteId || lineas.length === 0
                ? 'opacity-50 cursor-not-allowed bg-emerald-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Bookmark size={16} />
            Crear apartado
          </button>
        </div>
      </form>

      {/* Selector de producto (misma UX que registrar venta, simplificada) */}
      {productoPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-3 sm:px-6">
          <div
            className={`w-full max-w-3xl rounded-2xl border shadow-2xl ${
              dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
            } max-h-[80vh] flex flex-col`}
          >
            <div className="flex items-center justify-between px-5 py-3 sm:px-6 sm:py-4 border-b border-slate-800/40">
              <div>
                <h3 className={`text-sm sm:text-base font-semibold ${textPrimary}`}>
                  Seleccionar producto
                </h3>
                <p className={`text-[11px] mt-0.5 ${textSecondary}`}>
                  Busca y elige el producto que deseas agregar al apartado.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProductoPickerOpen(false)}
                className={`rounded-xl px-2.5 py-1 text-xs font-semibold ${btnSecondary}`}
              >
                Cerrar
              </button>
            </div>

            <div className="px-5 py-3 sm:px-6 space-y-3 flex-1 overflow-y-auto">
              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                  dm ? 'border-slate-700 bg-slate-900/60' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <Package size={16} className="text-emerald-500" />
                <input
                  type="text"
                  placeholder="Buscar producto por nombre, código o barras..."
                  value={productoSearch}
                  onChange={(e) => setProductoSearch(e.target.value)}
                  className={`flex-1 bg-transparent border-none text-xs focus:outline-none ${
                    dm
                      ? 'text-slate-100 placeholder-slate-500'
                      : 'text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              <div className="space-y-2">
                {productosFiltrados.map((p) => {
                  const isSelected = productoIdSeleccionado === p.Id
                  return (
                    <button
                      key={p.Id}
                      type="button"
                      onClick={() => {
                        setProductoIdSeleccionado(p.Id)
                        setPrecioVenta(p.PrecioDetal)
                        setProductoPickerOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2 text-[11px] text-left transition-colors ${
                        dm
                          ? isSelected
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-slate-700 bg-slate-900/40 hover:bg-slate-900/70'
                          : isSelected
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="h-12 w-12 rounded-xl overflow-hidden border border-slate-700/40 flex items-center justify-center bg-slate-900/10">
                        {p.ImagenUrl ? (
                          <img
                            src={p.ImagenUrl}
                            alt={p.Nombre}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package size={18} className="text-slate-400" />
                        )}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className={`text-xs font-semibold ${textPrimary} truncate`}>
                          {p.Nombre}
                        </span>
                        <span className={`text-[11px] font-mono ${textMuted} truncate`}>
                          {p.CodigoInterno}
                        </span>
                        <span className={`text-[11px] mt-0.5 ${textSecondary}`}>
                          {p.PrecioDetal.toLocaleString('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            maximumFractionDigits: 0,
                          })}{' '}
                          <span className="uppercase text-[10px] opacity-70">detal</span>
                        </span>
                      </div>
                    </button>
                  )
                })}
                {productosFiltrados.length === 0 && (
                  <p className={`text-[11px] ${textMuted}`}>No hay productos para esta búsqueda.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


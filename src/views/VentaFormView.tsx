import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { User, Package, Layers, CreditCard } from 'lucide-react'
import type {
  Cliente,
  NuevaVentaPayload,
  Producto,
  ProductoVariante,
  Repartidor,
} from '../types'

interface VentaLineaUI {
  productoId: number
  etiqueta: string
  cantidad: number
  precioUnitario: number
  atributoVariante?: string
  valorVariante?: string
  codigoSKUVariante?: string | null
}

interface VentaFormViewProps {
  dm: boolean
  textPrimary: string
  textSecondary: string
  textMuted: string
  btnSecondary: string
  productos: Producto[]
  variantes: ProductoVariante[]
  clientes: Cliente[]
  repartidores: Repartidor[]
  loading: boolean
  onBack: () => void
  onSubmit: (payload: NuevaVentaPayload) => Promise<void> | void
  onNuevoCliente?: () => void
}

export function VentaFormView({
  dm,
  textPrimary,
  textSecondary,
  textMuted,
  btnSecondary,
  productos,
  variantes,
  clientes,
  repartidores,
  loading,
  onBack,
  onSubmit,
  onNuevoCliente,
}: VentaFormViewProps) {
  const [clienteSearch, setClienteSearch] = useState('')
  const [clienteId, setClienteId] = useState<number | null>(null)
  const [repartidorId, setRepartidorId] = useState<number | null>(null)

  const [productoSearch, setProductoSearch] = useState('')
  const [productoIdSeleccionado, setProductoIdSeleccionado] = useState<number | null>(null)
  const [varianteIdSeleccionada, setVarianteIdSeleccionada] = useState<number | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [precioUnitario, setPrecioUnitario] = useState(0)

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

  const [lineas, setLineas] = useState<VentaLineaUI[]>([])

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

  const variantesDelProducto = useMemo(() => {
    if (!productoIdSeleccionado) return []
    return variantes.filter((v) => v.Producto_Id === productoIdSeleccionado)
  }, [variantes, productoIdSeleccionado])

  useEffect(() => {
    if (!productoIdSeleccionado) return
    const producto = productos.find((p) => p.Id === productoIdSeleccionado)
    if (!producto) return

    let base =
      tipoVenta === 'MAYORISTA' && producto.PrecioMayor != null
        ? producto.PrecioMayor
        : producto.PrecioDetal

    const varianteSeleccionada = variantesDelProducto.find(
      (v) => v.Id === varianteIdSeleccionada,
    )
    const adicional = varianteSeleccionada?.PrecioAdicional ?? 0

    setPrecioUnitario(base + adicional)
  }, [productoIdSeleccionado, varianteIdSeleccionada, tipoVenta, productos, variantesDelProducto])

  const subtotal = lineas.reduce(
    (acc, l) => acc + l.cantidad * l.precioUnitario,
    0,
  )
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

  const handleAgregarLinea = () => {
    if (!productoIdSeleccionado || cantidad <= 0 || precioUnitario < 0) return
    const producto = productos.find((p) => p.Id === productoIdSeleccionado)
    if (!producto) return

    const varianteSeleccionada = variantesDelProducto.find(
      (v) => v.Id === varianteIdSeleccionada,
    )

    const etiquetaBase = producto.Nombre
    const etiquetaVariante = varianteSeleccionada
      ? ` (${varianteSeleccionada.Atributo}: ${varianteSeleccionada.Valor})`
      : ''

    setLineas((prev) => [
      ...prev,
      {
        productoId: producto.Id,
        etiqueta: `${etiquetaBase}${etiquetaVariante}`,
        cantidad,
        precioUnitario,
        atributoVariante: varianteSeleccionada?.Atributo,
        valorVariante: varianteSeleccionada?.Valor,
        codigoSKUVariante: varianteSeleccionada?.CodigoSKU ?? null,
      },
    ])
    setCantidad(1)
    setPrecioUnitario(0)
    setVarianteIdSeleccionada(null)
  }

  const handleActualizarCantidad = (index: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) return
    setLineas((prev) =>
      prev.map((l, i) => (i === index ? { ...l, cantidad: nuevaCantidad } : l)),
    )
  }

  const handleEliminarLinea = (index: number) => {
    setLineas((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!clienteId || lineas.length === 0) return

    const payload: NuevaVentaPayload = {
      clienteId,
      repartidorId: repartidorId ?? undefined,
      tipoVenta,
      tipoEntrega,
      metodoPago,
      observacion: observacion.trim() || undefined,
      descuentoTotal: descuentoAplicado || undefined,
      items: lineas.map((l) => ({
        productoId: l.productoId,
        cantidad: l.cantidad,
        precioUnitario: l.precioUnitario,
      })),
    }

    await onSubmit(payload)
  }

  const cardBg = dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
  const productoSeleccionado = productoIdSeleccionado
    ? productos.find((p) => p.Id === productoIdSeleccionado)
    : null

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className={`text-xl font-bold ${textPrimary}`}>Registrar nueva venta</h2>
          <p className={`text-sm ${textSecondary}`}>
            Selecciona cliente, productos y configura todos los detalles de la venta.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${btnSecondary}`}
        >
          Volver al listado
        </button>
      </div>

      <div className={`rounded-2xl border shadow-sm ${cardBg}`}>
        <form
          onSubmit={handleSubmit}
          className="px-5 py-4 sm:px-6 space-y-4"
        >
          {/* Cliente y repartidor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
                Cliente
              </label>
              <div className="flex gap-2">
                <div
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 flex-1 ${
                    dm
                      ? 'border-slate-700 bg-slate-900/60'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <User size={16} className="text-emerald-500" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, cédula o celular..."
                    value={clienteSearch}
                    onChange={(e) => setClienteSearch(e.target.value)}
                    className={`flex-1 bg-transparent border-none text-xs focus:outline-none ${
                      dm
                        ? 'text-slate-100 placeholder-slate-500'
                        : 'text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>
                {onNuevoCliente && (
                  <button
                    type="button"
                    onClick={onNuevoCliente}
                    className="px-3 py-2 rounded-xl text-[11px] font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                  >
                    Nuevo
                  </button>
                )}
              </div>
              <div className="mt-2 max-h-28 overflow-y-auto rounded-xl border border-slate-700/40">
                {clientesFiltrados.map((c) => (
                  <button
                    key={c.Id}
                    type="button"
                    onClick={() => {
                      setClienteId(c.Id)
                      setClienteSearch(`${c.Nombre} (${c.Cedula})`)
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-500/10 ${
                      clienteId === c.Id
                        ? dm
                          ? 'bg-emerald-500/20 text-emerald-200'
                          : 'bg-emerald-500/10 text-emerald-700'
                        : dm
                        ? 'text-slate-100'
                        : 'text-gray-800'
                    }`}
                  >
                    {c.Nombre} – {c.Cedula}
                  </button>
                ))}
                {clientesFiltrados.length === 0 && (
                  <p className={`px-3 py-2 text-[11px] ${textMuted}`}>
                    No hay clientes que coincidan con la búsqueda.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
                  Repartidor (opcional)
                </label>
                <select
                  value={repartidorId ?? ''}
                  onChange={(e) =>
                    setRepartidorId(e.target.value ? Number(e.target.value) : null)
                  }
                  className={`w-full rounded-xl border px-3 py-2 text-xs ${
                    dm
                      ? 'border-slate-700 bg-slate-900 text-slate-100'
                      : 'border-gray-200 bg-white text-gray-900'
                  }`}
                >
                  <option value="">Sin repartidor</option>
                  {repartidores.map((r) => (
                    <option key={r.Id} value={r.Id}>
                      {r.Nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
                    Tipo de venta
                  </label>
                  <select
                    value={tipoVenta}
                    onChange={(e) =>
                      setTipoVenta(e.target.value as typeof tipoVenta)
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
                      setTipoEntrega(e.target.value as typeof tipoEntrega)
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
            </div>
          </div>

          {/* Productos, variantes y líneas */}
          <div className="space-y-3">
            <label className={`block text-xs font-semibold ${textPrimary}`}>
              Productos y variantes
            </label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <div
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                    dm
                      ? 'border-slate-700 bg-slate-900/60'
                      : 'border-gray-200 bg-gray-50'
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
                <select
                  value={productoIdSeleccionado ?? ''}
                  onChange={(e) =>
                    setProductoIdSeleccionado(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className={`mt-2 w-full rounded-xl border px-3 py-2 text-xs ${
                    dm
                      ? 'border-slate-700 bg-slate-900 text-slate-100'
                      : 'border-gray-200 bg-white text-gray-900'
                  }`}
                >
                  <option value="">Selecciona un producto</option>
                  {productosFiltrados.map((p) => (
                    <option key={p.Id} value={p.Id}>
                      {p.Nombre} – {p.CodigoInterno}
                    </option>
                  ))}
                </select>

                {productoSeleccionado && (
                  <div
                    className={`mt-3 flex items-center gap-3 rounded-xl border px-3 py-2 text-xs ${
                      dm
                        ? 'border-slate-700 bg-slate-900/60'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="h-12 w-12 rounded-xl overflow-hidden border border-slate-700/40 flex items-center justify-center bg-slate-900/20">
                      {productoSeleccionado.ImagenUrl ? (
                        <img
                          src={productoSeleccionado.ImagenUrl}
                          alt={productoSeleccionado.Nombre}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package size={18} className="text-slate-400" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-semibold ${textPrimary}`}>
                        {productoSeleccionado.Nombre}
                      </span>
                      <span className={`text-[11px] font-mono ${textMuted}`}>
                        {productoSeleccionado.CodigoInterno}
                      </span>
                      <span className={`text-[11px] mt-1 ${textSecondary}`}>
                        Precio {tipoVenta === 'MAYORISTA' ? 'mayorista' : 'detal'}:{' '}
                        <span className="font-semibold">
                          {(
                            (tipoVenta === 'MAYORISTA' &&
                              (productoSeleccionado.PrecioMayor ??
                                productoSeleccionado.PrecioDetal)) ||
                            productoSeleccionado.PrecioDetal
                          ).toLocaleString('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
                  Variante (opcional)
                </label>
                <div
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                    dm
                      ? 'border-slate-700 bg-slate-900/60'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <Layers size={14} className="text-emerald-500" />
                  <select
                    value={varianteIdSeleccionada ?? ''}
                    onChange={(e) =>
                      setVarianteIdSeleccionada(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className="flex-1 bg-transparent border-none text-xs focus:outline-none"
                  >
                    <option value="">Sin variante</option>
                    {variantesDelProducto.map((v) => (
                      <option key={v.Id} value={v.Id}>
                        {v.Atributo}: {v.Valor} (SKU {v.CodigoSKU ?? '-'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={cantidad}
                    onChange={(e) => setCantidad(Number(e.target.value) || 0)}
                    className={`w-full rounded-xl border px-3 py-2 text-xs ${
                      dm
                        ? 'border-slate-700 bg-slate-900 text-slate-100'
                        : 'border-gray-200 bg-white text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
                    Precio unitario
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={precioUnitario}
                    onChange={(e) =>
                      setPrecioUnitario(Number(e.target.value) || 0)
                    }
                    className={`w-full rounded-xl border px-3 py-2 text-xs ${
                      dm
                        ? 'border-slate-700 bg-slate-900 text-slate-100'
                        : 'border-gray-200 bg-white text-gray-900'
                    }`}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAgregarLinea}
                  className="w-full rounded-xl bg-emerald-500 text-white text-xs font-semibold py-2 mt-1 hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  Agregar a la venta
                </button>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-slate-700/40 overflow-hidden">
              <table className="min-w-full text-xs">
                <thead
                  className={
                    dm ? 'bg-slate-900/80 text-slate-200' : 'bg-gray-50 text-gray-700'
                  }
                >
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold" />
                    <th className="px-3 py-2 text-left font-semibold">Producto</th>
                    <th className="px-3 py-2 text-center font-semibold">Cant.</th>
                    <th className="px-3 py-2 text-right font-semibold">P. unitario</th>
                    <th className="px-3 py-2 text-right font-semibold">Importe</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody
                  className={dm ? 'divide-y divide-slate-800' : 'divide-y divide-gray-100'}
                >
                  {lineas.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className={`px-3 py-4 text-center text-[11px] ${textMuted}`}
                      >
                        Aún no has agregado productos a la venta.
                      </td>
                    </tr>
                  )}
                  {lineas.map((l, i) => {
                    const prod = productos.find((p) => p.Id === l.productoId)
                    return (
                      <tr key={`${l.productoId}-${i}`}>
                        <td className="px-3 py-2">
                          <div className="h-9 w-9 rounded-lg overflow-hidden border border-slate-700/40 flex items-center justify-center bg-slate-900/10">
                            {prod?.ImagenUrl ? (
                              <img
                                src={prod.ImagenUrl}
                                alt={prod.Nombre}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package size={14} className="text-slate-400" />
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col gap-0.5">
                            <span className={`text-xs font-semibold ${textPrimary}`}>
                              {l.etiqueta}
                            </span>
                            {l.atributoVariante && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px]">
                                {l.atributoVariante}: {l.valorVariante}{' '}
                                {l.codigoSKUVariante && `· SKU ${l.codigoSKUVariante}`}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="number"
                            min={1}
                            value={l.cantidad}
                            onChange={(e) =>
                              handleActualizarCantidad(i, Number(e.target.value) || 0)
                            }
                            className={`w-16 rounded-lg border px-2 py-1 text-xs text-center ${
                              dm
                                ? 'border-slate-700 bg-slate-900 text-slate-100'
                                : 'border-gray-200 bg-white text-gray-900'
                            }`}
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          {l.precioUnitario.toLocaleString('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold">
                          {(l.cantidad * l.precioUnitario).toLocaleString('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleEliminarLinea(i)}
                            className="text-[11px] text-red-500 hover:text-red-600"
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

          {/* Observación y totales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="md:col-span-2">
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
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-xs font-semibold text-white hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Registrar venta
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


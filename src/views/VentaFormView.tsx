import type { FormEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { User, Package, Layers, CreditCard, ScanBarcode, Camera } from 'lucide-react'
import Swal from 'sweetalert2'
import { API_BASE_URL } from '../config'
import { ScanCameraModal } from '../components/ScanCameraModal'
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
  varianteId?: number | null
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
  tiendaSlug: string
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
  tiendaSlug,
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
  const [productoPickerOpen, setProductoPickerOpen] = useState(false)
  const [scanInput, setScanInput] = useState('')
  const [scanCameraOpen, setScanCameraOpen] = useState(false)
  const scanInputRef = useRef<HTMLInputElement>(null)

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
    if (!productoIdSeleccionado || !tiendaSlug) return
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
    const precioBase = base + adicional

    setPrecioUnitario(precioBase)
    const calcularPrecioConOferta = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/public/promociones/calcular`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tiendaSlug,
            items: [
              {
                productoId: productoIdSeleccionado,
                varianteId: varianteIdSeleccionada ?? null,
                cantidad,
                precioBase,
              },
            ],
          }),
        })
        if (res.ok) {
          const data = (await res.json()) as Array<{ precioFinal: number }>
          const final = data[0]?.precioFinal
          if (typeof final === 'number') setPrecioUnitario(final)
        }
      } catch {
        // Mantener precioBase ya establecido
      }
    }
    void calcularPrecioConOferta()
  }, [productoIdSeleccionado, varianteIdSeleccionada, tipoVenta, cantidad, productos, variantesDelProducto, tiendaSlug])

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

  const cardBg = dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
  const productoSeleccionado = productoIdSeleccionado
    ? productos.find((p) => p.Id === productoIdSeleccionado)
    : null

  const stockDisponibleActual = useMemo(() => {
    if (!productoSeleccionado) return null

    const variantesProducto = variantes.filter((v) => v.Producto_Id === productoSeleccionado.Id)
    const varianteSeleccionada = variantesProducto.find((v) => v.Id === varianteIdSeleccionada)

    let stockBase: number | null = null
    if (varianteSeleccionada && typeof varianteSeleccionada.StockActual === 'number') {
      stockBase = varianteSeleccionada.StockActual
    } else if (typeof productoSeleccionado.StockActual === 'number') {
      stockBase = productoSeleccionado.StockActual
    }

    const yaAgregado = lineas
      .filter((l) => {
        if (l.productoId !== productoSeleccionado.Id) return false
        if (varianteSeleccionada) {
          return l.varianteId === varianteSeleccionada.Id
        }
        return !l.varianteId
      })
      .reduce((acc, l) => acc + l.cantidad, 0)

    if (stockBase == null) return null
    // Si el stock configurado es 0 y aún no se ha agregado nada,
    // no aplicamos restricción (modo “sin stock configurado”).
    if (stockBase <= 0 && yaAgregado === 0) return null

    return Math.max(0, stockBase - yaAgregado)
  }, [productoSeleccionado, variantes, varianteIdSeleccionada, lineas])

  const handleAgregarLinea = () => {
    if (!productoIdSeleccionado || cantidad <= 0 || precioUnitario < 0) return
    const producto = productos.find((p) => p.Id === productoIdSeleccionado)
    if (!producto) return

    if (stockDisponibleActual !== null && stockDisponibleActual <= 0) return
    if (stockDisponibleActual !== null && cantidad > stockDisponibleActual) return

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
        varianteId: varianteSeleccionada?.Id ?? null,
        atributoVariante: varianteSeleccionada?.Atributo,
        valorVariante: varianteSeleccionada?.Valor,
        codigoSKUVariante: varianteSeleccionada?.CodigoSKU ?? null,
      },
    ])
    setCantidad(1)
    setPrecioUnitario(0)
    setVarianteIdSeleccionada(null)
  }

  const handleActualizarCantidad = async (index: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) return
    const linea = lineas[index]
    if (!linea || !tiendaSlug) {
      setLineas((prev) =>
        prev.map((l, i) => (i === index ? { ...l, cantidad: nuevaCantidad } : l)),
      )
      return
    }
    const producto = productos.find((p) => p.Id === linea.productoId)
    if (!producto) {
      setLineas((prev) =>
        prev.map((l, i) => (i === index ? { ...l, cantidad: nuevaCantidad } : l)),
      )
      return
    }
    let precioBase =
      tipoVenta === 'MAYORISTA' && producto.PrecioMayor != null
        ? producto.PrecioMayor
        : producto.PrecioDetal
    if (linea.varianteId) {
      const vari = variantes.find((v) => v.Id === linea.varianteId)
      precioBase += vari?.PrecioAdicional ?? 0
    }
    try {
      const res = await fetch(`${API_BASE_URL}/public/promociones/calcular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tiendaSlug,
          items: [
            {
              productoId: linea.productoId,
              varianteId: linea.varianteId ?? null,
              cantidad: nuevaCantidad,
              precioBase,
            },
          ],
        }),
      })
      if (res.ok) {
        const data = (await res.json()) as Array<{ precioFinal: number }>
        const precioFinal = data[0]?.precioFinal ?? precioBase
        setLineas((prev) =>
          prev.map((l, i) =>
            i === index ? { ...l, cantidad: nuevaCantidad, precioUnitario: precioFinal } : l,
          ),
        )
        return
      }
    } catch {
      // ignorar
    }
    setLineas((prev) =>
      prev.map((l, i) => (i === index ? { ...l, cantidad: nuevaCantidad } : l)),
    )
  }

  const handleEliminarLinea = (index: number) => {
    setLineas((prev) => prev.filter((_, i) => i !== index))
  }

  const agregarPorCodigoBarras = async (codigo: string): Promise<boolean> => {
    const codigoTrim = codigo.trim()
    if (!codigoTrim) return false

    const normalizar = (c: string | number | null | undefined) => {
      const raw = String(c ?? '').trim()
      if (!raw) return ''
      // Unificar mayúsculas y quitar separadores comunes (espacios, guiones, subrayados)
      // para tolerar códigos escritos o impresos con formato distinto.
      return raw.replace(/[\s\-_]/g, '').toUpperCase()
    }

    const codigoNorm = normalizar(codigoTrim)

    // 1. Buscar primero en variantes (cada variante puede tener su propio código)
    const variante = variantes.find(
      (v) => codigoNorm && normalizar(v.CodigoBarras) === codigoNorm,
    )
    if (variante) {
      const producto = productos.find((p) => p.Id === variante.Producto_Id)
      if (!producto) return false
      let precioBase =
        tipoVenta === 'MAYORISTA' && producto.PrecioMayor != null
          ? producto.PrecioMayor
          : producto.PrecioDetal
      precioBase += variante.PrecioAdicional ?? 0
      try {
        const res = await fetch(`${API_BASE_URL}/public/promociones/calcular`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tiendaSlug,
            items: [
              {
                productoId: producto.Id,
                varianteId: variante.Id,
                cantidad: 1,
                precioBase,
              },
            ],
          }),
        })
        if (res.ok) {
          const data = (await res.json()) as Array<{ precioFinal: number }>
          const final = data[0]?.precioFinal
          if (typeof final === 'number') precioBase = final
        }
      } catch {
        // mantener precioBase
      }
      const yaEnLinea = lineas.find(
        (l) => l.productoId === producto.Id && l.varianteId === variante.Id,
      )
      if (yaEnLinea) {
        const idx = lineas.indexOf(yaEnLinea)
        setLineas((prev) =>
          prev.map((l, i) =>
            i === idx ? { ...l, cantidad: l.cantidad + 1 } : l,
          ),
        )
      } else {
        setLineas((prev) => [
          ...prev,
          {
            productoId: producto.Id,
            etiqueta: `${producto.Nombre} (${variante.Atributo}: ${variante.Valor})`,
            cantidad: 1,
            precioUnitario: precioBase,
            varianteId: variante.Id,
            atributoVariante: variante.Atributo,
            valorVariante: variante.Valor,
            codigoSKUVariante: variante.CodigoSKU ?? null,
          },
        ])
      }
      setScanInput('')
      scanInputRef.current?.focus()
      return true
    }

    // 2. Si no hay variante, buscar en productos
    const producto = productos.find(
      (p) => codigoNorm && normalizar(p.CodigoBarras) === codigoNorm,
    )
    if (!producto) {
      void Swal.fire({
        icon: 'warning',
        title: 'No encontrado',
        text: `No hay producto ni variante con código de barras "${codigoTrim}"`,
      })
      return false
    }
    let precioBase =
      tipoVenta === 'MAYORISTA' && producto.PrecioMayor != null
        ? producto.PrecioMayor
        : producto.PrecioDetal
    try {
      const res = await fetch(`${API_BASE_URL}/public/promociones/calcular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tiendaSlug,
          items: [
            { productoId: producto.Id, varianteId: null, cantidad: 1, precioBase },
          ],
        }),
      })
      if (res.ok) {
        const data = (await res.json()) as Array<{ precioFinal: number }>
        const final = data[0]?.precioFinal
        if (typeof final === 'number') precioBase = final
      }
    } catch {
      // mantener precioBase
    }
    const yaEnLinea = lineas.find(
      (l) => l.productoId === producto.Id && !l.varianteId,
    )
    if (yaEnLinea) {
      const idx = lineas.indexOf(yaEnLinea)
      setLineas((prev) =>
        prev.map((l, i) =>
          i === idx ? { ...l, cantidad: l.cantidad + 1 } : l,
        ),
      )
    } else {
      setLineas((prev) => [
        ...prev,
        {
          productoId: producto.Id,
          etiqueta: producto.Nombre,
          cantidad: 1,
          precioUnitario: precioBase,
          varianteId: null,
        },
      ])
    }
    setScanInput('')
    scanInputRef.current?.focus()
    return true
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
        varianteId: l.varianteId ?? null,
      })),
    }

    await onSubmit(payload)
  }

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

            {/* Campo de escaneo (USB o cámara) */}
            <div
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                dm
                  ? 'border-slate-700 bg-slate-900/60'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <ScanBarcode size={18} className="text-emerald-500 flex-shrink-0" />
              <input
                ref={scanInputRef}
                type="text"
                placeholder="Escanear código de barras (USB o pegar)..."
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    void agregarPorCodigoBarras(scanInput)
                  }
                }}
                autoComplete="off"
                className={`flex-1 bg-transparent border-none text-sm focus:outline-none ${
                  dm
                    ? 'text-slate-100 placeholder-slate-500'
                    : 'text-gray-900 placeholder-gray-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setScanCameraOpen((o) => !o)}
                className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                  scanCameraOpen
                    ? 'bg-emerald-500 text-white'
                    : dm
                      ? 'hover:bg-slate-700 text-slate-400'
                      : 'hover:bg-gray-200 text-gray-500'
                }`}
                title={scanCameraOpen ? 'Cerrar cámara' : 'Escanear con cámara'}
              >
                <Camera size={18} />
              </button>
            </div>

            {scanCameraOpen && (
              <ScanCameraModal
                dm={dm}
                textPrimary={textPrimary}
                textMuted={textMuted}
                onScan={async (codigo) => {
                  const agregado = await agregarPorCodigoBarras(codigo)
                  if (agregado) setScanCameraOpen(false)
                }}
                onClose={() => setScanCameraOpen(false)}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2 space-y-2">
                <div
                  className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 ${
                    dm
                      ? 'border-slate-700 bg-slate-900/60'
                      : 'border-gray-200 bg-gray-50'
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
                      dm
                        ? 'border-slate-700 bg-slate-900/60'
                        : 'border-gray-200 bg-gray-50'
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
                        Precio mayor:{' '}
                        <span className="font-semibold">
                          {productoSeleccionado.PrecioMayor != null
                            ? productoSeleccionado.PrecioMayor.toLocaleString('es-CO', {
                                style: 'currency',
                                currency: 'COP',
                                maximumFractionDigits: 0,
                              })
                            : '—'}
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
                    max={stockDisponibleActual ?? undefined}
                    value={cantidad}
                    onChange={(e) => {
                      let value = Number(e.target.value) || 0
                      if (stockDisponibleActual !== null && value > stockDisponibleActual) {
                        value = stockDisponibleActual
                      }
                      setCantidad(value)
                    }}
                    className={`w-full rounded-xl border px-3 py-2 text-xs ${
                      dm
                        ? 'border-slate-700 bg-slate-900 text-slate-100'
                        : 'border-gray-200 bg-white text-gray-900'
                    }`}
                  />
                  {stockDisponibleActual !== null && (
                    <p className={`mt-1 text-[11px] ${textMuted}`}>
                      Stock disponible para esta selección:{' '}
                      <span className="font-semibold">
                        {stockDisponibleActual}
                      </span>
                    </p>
                  )}
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

            <div className="mt-3 rounded-xl border border-slate-700/40 overflow-x-auto overscroll-x-contain">
              <table className="w-full min-w-[420px] text-xs">
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

      {productoPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-3 sm:px-6">
          <div
            className={`w-full max-w-3xl rounded-2xl border shadow-2xl ${cardBg} max-h-[80vh] flex flex-col`}
          >
            <div className="flex items-center justify-between px-5 py-3 sm:px-6 sm:py-4 border-b border-slate-800/40">
              <div>
                <h3 className={`text-sm sm:text-base font-semibold ${textPrimary}`}>
                  Seleccionar producto
                </h3>
                <p className={`text-[11px] mt-0.5 ${textSecondary}`}>
                  Busca y elige el producto que deseas agregar a la venta.
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

              <div className="space-y-2">
                {productosFiltrados.map((p) => {
                  const isSelected = productoIdSeleccionado === p.Id
                  return (
                    <button
                      key={p.Id}
                      type="button"
                      onClick={() => {
                        setProductoIdSeleccionado(p.Id)
                        setVarianteIdSeleccionada(null)
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
                          {p.PrecioMayor != null && (
                            <>
                              {' · '}
                              {p.PrecioMayor.toLocaleString('es-CO', {
                                style: 'currency',
                                currency: 'COP',
                                maximumFractionDigits: 0,
                              })}{' '}
                              <span className="uppercase text-[10px] opacity-70">
                                mayor
                              </span>
                            </>
                          )}
                        </span>
                      </div>
                    </button>
                  )
                })}

                {productosFiltrados.length === 0 && (
                  <p className={`text-[11px] ${textMuted}`}>
                    No hay productos que coincidan con la búsqueda.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { X, Package, Layers, Hash, FileText } from 'lucide-react'
import type { Producto, ProductoVariante } from '../types'
import type { CrearMovimientoPayload } from '../hooks/useMovimientos'

type TipoMov = 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'DEVOLUCION'

interface MovimientoModalProps {
  open: boolean
  dm: boolean
  textPrimary: string
  textSecondary: string
  textMuted: string
  btnSecondary: string
  productos: Producto[]
  variantes: ProductoVariante[]
  loading: boolean
  onClose: () => void
  onSubmit: (payload: CrearMovimientoPayload) => Promise<boolean>
}

export function MovimientoModal({
  open,
  dm,
  textPrimary,
  textSecondary,
  textMuted,
  btnSecondary,
  productos,
  variantes,
  loading,
  onClose,
  onSubmit,
}: MovimientoModalProps) {
  const [tipoMovimiento, setTipoMovimiento] = useState<TipoMov>('ENTRADA')
  const [productoSearch, setProductoSearch] = useState('')
  const [productoId, setProductoId] = useState<number | null>(null)
  const [varianteId, setVarianteId] = useState<number | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [motivo, setMotivo] = useState('')

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
    if (!productoId) return []
    return variantes.filter((v) => v.Producto_Id === productoId)
  }, [variantes, productoId])

  const tieneVariantes = variantesDelProducto.length > 0

  const resetForm = () => {
    setTipoMovimiento('ENTRADA')
    setProductoSearch('')
    setProductoId(null)
    setVarianteId(null)
    setCantidad(1)
    setMotivo('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!productoId) return
    const ok = await onSubmit({
      tipoMovimiento,
      productoId,
      varianteId: tieneVariantes ? varianteId : null,
      cantidad: Math.abs(cantidad) || 1,
      motivo: motivo.trim() || undefined,
    })
    if (ok) handleClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-950/40 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl my-4 sm:my-8 flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] ${
          dm
            ? 'bg-slate-900 border-slate-700 shadow-slate-950/50'
            : 'bg-white border-gray-200 shadow-gray-200/80'
        }`}
      >
        <div
          className={`flex-shrink-0 flex items-center justify-between gap-3 p-4 sm:p-6 border-b ${
            dm ? 'border-slate-700' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 flex-shrink-0">
              <Package size={20} />
            </div>
            <div className="min-w-0">
              <h3 className={`text-base sm:text-lg font-bold truncate ${textPrimary}`}>
                Nuevo movimiento
              </h3>
              <p className={`mt-0.5 sm:mt-1 text-xs sm:text-sm ${textSecondary} line-clamp-2`}>
                Registra entrada, salida, ajuste o devolución de inventario.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className={`p-2 rounded-xl transition-all flex-shrink-0 ${btnSecondary} hover:scale-105`}
          >
            <X size={20} />
          </button>
        </div>

        <form
          className="flex flex-col flex-1 min-h-0"
          onSubmit={handleSubmit}
        >
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${textPrimary}`}>
              <Hash size={16} className="text-emerald-500" />
              Tipo de movimiento
            </label>
            <select
              value={tipoMovimiento}
              onChange={(e) => setTipoMovimiento(e.target.value as TipoMov)}
              className={`w-full appearance-none rounded-xl border px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                dm
                  ? 'border-slate-700 bg-slate-800 text-slate-100'
                  : 'border-gray-200 bg-gray-50 text-gray-900'
              }`}
            >
              <option value="ENTRADA">Entrada (compra/recepción)</option>
              <option value="SALIDA">Salida (merma/donación)</option>
              <option value="AJUSTE">Ajuste (conteo físico)</option>
              <option value="DEVOLUCION">Devolución</option>
            </select>
          </div>

          <div>
            <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${textPrimary}`}>
              <Package size={16} className="text-emerald-500" />
              Producto
            </label>
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={productoSearch}
              onChange={(e) => {
                setProductoSearch(e.target.value)
                if (!e.target.value) setProductoId(null)
              }}
              className={`w-full rounded-xl border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                dm
                  ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500'
                  : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'
              }`}
            />
            <div className="mt-2 max-h-32 sm:max-h-48 overflow-y-auto rounded-xl border space-y-2 p-2">
              {productosFiltrados.slice(0, 50).map((p) => {
                const isSelected = productoId === p.Id
                return (
                  <button
                    key={p.Id}
                    type="button"
                    onClick={() => {
                      setProductoId(p.Id)
                      setProductoSearch(p.Nombre)
                      setVarianteId(null)
                    }}
                    className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
                      dm
                        ? isSelected
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-700 bg-slate-900/40 hover:bg-slate-900/70'
                        : isSelected
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="h-12 w-12 flex-shrink-0 rounded-xl overflow-hidden border border-slate-700/40 flex items-center justify-center bg-slate-900/10">
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
                        Stock: {p.StockActual}
                      </span>
                    </div>
                  </button>
                )
              })}
              {productosFiltrados.length === 0 && (
                <p className={`px-4 py-3 text-sm ${textMuted}`}>Sin resultados</p>
              )}
            </div>
          </div>

          {tieneVariantes && productoId && (
            <div>
              <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${textPrimary}`}>
                <Layers size={16} className="text-emerald-500" />
                Variante
              </label>
              <select
                value={varianteId ?? ''}
                onChange={(e) => setVarianteId(e.target.value ? Number(e.target.value) : null)}
                className={`w-full appearance-none rounded-xl border px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  dm
                    ? 'border-slate-700 bg-slate-800 text-slate-100'
                    : 'border-gray-200 bg-gray-50 text-gray-900'
                }`}
              >
                <option value="">Sin variante (producto base)</option>
                {variantesDelProducto.map((v) => (
                  <option key={v.Id} value={v.Id}>
                    {v.Atributo}: {v.Valor} · Stock: {v.StockActual}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${textPrimary}`}>
              Cantidad
            </label>
            <input
              type="number"
              min={1}
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, Number(e.target.value) || 1))}
              placeholder="1"
              className={`w-full rounded-xl border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                dm
                  ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500'
                  : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'
              }`}
            />
            {tipoMovimiento === 'AJUSTE' && (
              <p className={`mt-1 text-xs ${textMuted}`}>
                Para reducir stock usa tipo &quot;Salida&quot;.
              </p>
            )}
          </div>

          <div>
            <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${textPrimary}`}>
              <FileText size={16} className="text-emerald-500" />
              Motivo (opcional)
            </label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Compra proveedor, Conteo físico, etc."
              className={`w-full rounded-xl border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                dm
                  ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500'
                  : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>
          </div>

          <div
            className={`flex-shrink-0 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 p-4 sm:p-6 pt-4 border-t ${
              dm ? 'border-slate-700' : 'border-gray-200'
            }`}
          >
            <button
              type="button"
              onClick={handleClose}
              className={`flex-1 rounded-xl border px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-bold transition-all ${btnSecondary}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !productoId || cantidad === 0}
              className="flex-1 rounded-xl bg-emerald-500 px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-bold text-white transition-all hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registrando...' : 'Registrar movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

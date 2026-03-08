import { Layers, X, Package, Tag, Box, DollarSign, Hash, Barcode, RefreshCw } from 'lucide-react'
import type { FormEvent } from 'react'
import type { Producto, ProductoVariante } from '../types'
import { generarCodigoBarrasEAN13 } from '../utils/generarCodigoBarras'

interface VarianteModalProps {
  open: boolean
  dm: boolean
  textPrimary: string
  textSecondary: string
  textMuted: string
  btnSecondary: string
  productos: Producto[]
  varianteEditando: ProductoVariante | null
  varProductoId: number | null
  varAtributo: 'Talla' | 'Color'
  varValor: string
  varStock: number
  varPrecioAdicional: number
  varSku: string
  varCodigoBarras: string
  onClose: () => void
  onChangeProducto: (id: number | null) => void
  onChangeAtributo: (attr: 'Talla' | 'Color') => void
  onChangeValor: (value: string) => void
  onChangeStock: (value: number) => void
  onChangePrecioAdicional: (value: number) => void
  onChangeSku: (value: string) => void
  onChangeCodigoBarras: (value: string) => void
  onSubmit: (event: FormEvent) => void
}

export function VarianteModal({
  open,
  dm,
  textPrimary,
  textSecondary,
  textMuted: _textMuted,
  btnSecondary,
  productos,
  varianteEditando,
  varProductoId,
  varAtributo,
  varValor,
  varStock,
  varPrecioAdicional,
  varSku,
  varCodigoBarras,
  onClose,
  onChangeProducto,
  onChangeAtributo,
  onChangeValor,
  onChangeStock,
  onChangePrecioAdicional,
  onChangeSku,
  onChangeCodigoBarras,
  onSubmit,
}: VarianteModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-950/40 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl my-4 sm:my-0 max-h-[calc(100vh-2rem)] flex flex-col ${
          dm
            ? 'bg-slate-900 border-slate-700 shadow-slate-950/50'
            : 'bg-white border-gray-200 shadow-gray-200/80'
        }`}
      >
        <div className="flex items-start sm:items-center justify-between gap-3 p-4 sm:p-6 pb-0 flex-shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 flex-shrink-0">
              <Layers size={22} className="sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h3 className={`text-base sm:text-lg font-bold truncate ${textPrimary}`}>
                {varianteEditando ? 'Editar variante' : 'Nueva variante'}
              </h3>
              <p className={`mt-0.5 sm:mt-1 text-xs sm:text-sm ${textSecondary} line-clamp-2`}>
                {varianteEditando
                  ? 'Ajusta los detalles de la combinación seleccionada.'
                  : 'Define una nueva combinación para tus productos.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all flex-shrink-0 ${btnSecondary} hover:scale-105 active:scale-95`}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form className="flex flex-col flex-1 min-h-0 p-4 sm:p-6 pt-4 space-y-4 sm:space-y-6 overflow-y-auto" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${textPrimary}`}>
                <Package size={16} className="text-emerald-500" />
                Producto
              </label>
              <select
                value={varProductoId ?? ''}
                onChange={(e) => onChangeProducto(e.target.value ? Number(e.target.value) : null)}
                disabled={Boolean(varianteEditando)}
                className={`w-full appearance-none rounded-xl border px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  dm
                    ? 'border-slate-700 bg-slate-800 text-slate-100 disabled:opacity-50'
                    : 'border-gray-200 bg-gray-50 text-gray-900 disabled:bg-gray-100 disabled:text-gray-400'
                }`}
              >
                <option value="">Selecciona...</option>
                {productos.map((p) => (
                  <option key={p.Id} value={p.Id}>
                    {p.Nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${textPrimary}`}>
                <Tag size={16} className="text-emerald-500" />
                Atributo
              </label>
              <select
                value={varAtributo}
                onChange={(e) => onChangeAtributo(e.target.value as 'Talla' | 'Color')}
                disabled={Boolean(varianteEditando)}
                className={`w-full appearance-none rounded-xl border px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  dm
                    ? 'border-slate-700 bg-slate-800 text-slate-100 disabled:opacity-50'
                    : 'border-gray-200 bg-gray-50 text-gray-900 disabled:bg-gray-100 disabled:text-gray-400'
                }`}
              >
                <option value="Talla">Talla</option>
                <option value="Color">Color</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-bold mb-2 ${textPrimary}`}>Valor de la variante</label>
            <input
              type="text"
              value={varValor}
              onChange={(e) => onChangeValor(e.target.value)}
              className={`w-full rounded-xl border px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 min-w-0 ${
                dm
                  ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500'
                  : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'
              }`}
              placeholder="Ej. S, XL, Rojo, Azul..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${textPrimary}`}>
                <Box size={16} className="text-emerald-500" />
                Stock Actual
              </label>
              <input
                type="number"
                value={varStock}
                onChange={(e) => onChangeStock(Number(e.target.value) || 0)}
                className={`w-full rounded-xl border px-4 py-3 text-sm font-mono font-bold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  dm
                    ? 'border-slate-700 bg-slate-800 text-slate-100'
                    : 'border-gray-200 bg-gray-50 text-gray-900'
                }`}
                min={0}
              />
            </div>
            <div>
              <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${textPrimary}`}>
                <DollarSign size={16} className="text-emerald-500" />
                Precio Extra
              </label>
              <input
                type="number"
                value={varPrecioAdicional}
                onChange={(e) => onChangePrecioAdicional(Number(e.target.value) || 0)}
                className={`w-full rounded-xl border px-4 py-3 text-sm font-mono font-bold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  dm
                    ? 'border-slate-700 bg-slate-800 text-slate-100'
                    : 'border-gray-200 bg-gray-50 text-gray-900'
                }`}
                min={0}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${textPrimary}`}>
                <Hash size={16} className="text-emerald-500" />
                Código SKU (Opcional)
              </label>
              <input
                type="text"
                value={varSku}
                onChange={(e) => onChangeSku(e.target.value)}
                className={`w-full rounded-xl border px-4 py-3 text-sm font-mono transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  dm
                    ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500'
                    : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="Referencia única para esta variante"
              />
            </div>
            <div>
              <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${textPrimary}`}>
                <Barcode size={16} className="text-emerald-500" />
                Código de barras (Opcional)
              </label>
              <div className="flex gap-2 min-w-0">
                <input
                  type="text"
                  value={varCodigoBarras}
                  onChange={(e) => onChangeCodigoBarras(e.target.value)}
                  className={`flex-1 min-w-0 rounded-xl border px-4 py-3 text-sm font-mono transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                    dm
                      ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500'
                      : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="Para escanear esta variante en ventas"
                />
                <button
                  type="button"
                  onClick={() => onChangeCodigoBarras(generarCodigoBarrasEAN13())}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold shrink-0 ${dm ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40' : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/30'}`}
                  title="Generar código automático"
                >
                  <RefreshCw size={14} />
                  Generar
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className={`rounded-xl px-5 sm:px-6 py-2.5 text-sm font-bold transition-all w-full sm:w-auto ${btnSecondary} hover:bg-red-50 hover:text-red-500 hover:border-red-200`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 px-6 sm:px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all w-full sm:w-auto"
            >
              {varianteEditando ? 'Guardar cambios' : 'Crear variante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


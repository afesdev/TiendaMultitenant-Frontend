import { Layers, X, Package, Tag, Box, DollarSign, Hash } from 'lucide-react'
import type { FormEvent } from 'react'
import type { Producto, ProductoVariante } from '../types'

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
  onClose: () => void
  onChangeProducto: (id: number | null) => void
  onChangeAtributo: (attr: 'Talla' | 'Color') => void
  onChangeValor: (value: string) => void
  onChangeStock: (value: number) => void
  onChangePrecioAdicional: (value: number) => void
  onChangeSku: (value: string) => void
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
  onClose,
  onChangeProducto,
  onChangeAtributo,
  onChangeValor,
  onChangeStock,
  onChangePrecioAdicional,
  onChangeSku,
  onSubmit,
}: VarianteModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4 transition-all">
      <div
        className={`w-full max-w-lg rounded-2xl border p-8 shadow-2xl ${
          dm
            ? 'bg-slate-900 border-slate-700 shadow-slate-950/50'
            : 'bg-white border-gray-200 shadow-gray-200/80'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Layers size={24} />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${textPrimary}`}>
                {varianteEditando ? 'Editar variante' : 'Nueva variante'}
              </h3>
              <p className={`mt-1 text-sm ${textSecondary}`}>
                {varianteEditando
                  ? 'Ajusta los detalles de la combinación seleccionada.'
                  : 'Define una nueva combinación para tus productos.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all ${btnSecondary} hover:scale-105`}
          >
            <X size={20} />
          </button>
        </div>

        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
              className={`w-full rounded-xl border px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                dm
                  ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500'
                  : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'
              }`}
              placeholder="Ej. S, XL, Rojo, Azul..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
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

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${btnSecondary} hover:bg-red-50 hover:text-red-500 hover:border-red-200`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all"
            >
              {varianteEditando ? 'Guardar cambios' : 'Crear variante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


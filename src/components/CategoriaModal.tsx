import { FolderTree, X, ChevronRight } from 'lucide-react'
import type { FormEvent } from 'react'
import type { Categoria } from '../types'

interface CategoriaModalProps {
  open: boolean
  dm: boolean
  textPrimary: string
  textSecondary: string
  btnSecondary: string
  categoriaEditando: Categoria | null
  catNombre: string
  catVisible: boolean
  catPadreId: number | null
  categorias: Categoria[]
  onClose: () => void
  setCatNombre: (val: string) => void
  setCatVisible: (val: boolean) => void
  setCatPadreId: (val: number | null) => void
  onSubmit: (e: FormEvent) => void
}

export function CategoriaModal({
  open,
  dm,
  textPrimary,
  textSecondary,
  btnSecondary,
  categoriaEditando,
  catNombre,
  catVisible,
  catPadreId,
  categorias,
  onClose,
  setCatNombre,
  setCatVisible,
  setCatPadreId,
  onSubmit,
}: CategoriaModalProps) {
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
              <FolderTree size={24} />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${textPrimary}`}>
                {categoriaEditando ? 'Editar categoría' : 'Nueva categoría'}
              </h3>
              <p className={`mt-1 text-sm ${textSecondary}`}>
                Organiza tus productos definiendo una estructura clara.
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
          <div>
            <label className={`block text-sm font-bold mb-2 ${textPrimary}`}>Nombre de la categoría</label>
            <input
              type="text"
              value={catNombre}
              onChange={(e) => setCatNombre(e.target.value)}
              className={`w-full rounded-xl border px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all ${
                dm
                  ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500'
                  : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'
              }`}
              placeholder="Ej: Ropa de Invierno, Calzado Deportivo..."
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-bold mb-2 ${textPrimary}`}>
                Categoría padre
              </label>
              <div className="relative">
                <select
                  value={catPadreId ?? ''}
                  onChange={(e) =>
                    setCatPadreId(e.target.value ? Number(e.target.value) : null)
                  }
                  className={`w-full appearance-none rounded-xl border px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all ${
                    dm
                      ? 'border-slate-700 bg-slate-800 text-slate-100'
                      : 'border-gray-200 bg-gray-50 text-gray-900'
                  }`}
                >
                  <option value="">Ninguna (Nivel raíz)</option>
                  {categorias
                    .filter((c) => !categoriaEditando || c.Id !== categoriaEditando.Id)
                    .map((c) => (
                      <option key={c.Id} value={c.Id}>
                        {c.Nombre}
                      </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none opacity-50">
                   <ChevronRight size={16} className="rotate-90" />
                </div>
              </div>
            </div>

            <div className="flex items-end">
              <label className={`flex items-center gap-3 p-3.5 w-full cursor-pointer rounded-xl border transition-all ${
                dm 
                  ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-800' 
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}>
                <input
                  type="checkbox"
                  checked={catVisible}
                  onChange={(e) => setCatVisible(e.target.checked)}
                  className="h-5 w-5 rounded-md text-emerald-500 focus:ring-emerald-500 border-gray-300 transition-all cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className={`text-sm font-bold ${textPrimary}`}>Visible</span>
                  <span className={`text-xs ${textSecondary}`}>Mostrar en tienda</span>
                </div>
              </label>
            </div>
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
              {categoriaEditando ? 'Guardar cambios' : 'Crear categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

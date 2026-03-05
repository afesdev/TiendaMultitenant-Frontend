import { FolderTree, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import type { Categoria } from '../types'

interface CategoriasViewProps {
  categorias: Categoria[]
  loading: boolean
  dm: boolean
  textPrimary: string
  textSecondary: string
  textMuted: string
  tableBorder: string
  tableHead: string
  tableRow: string
  btnSecondary: string
  onNueva: () => void
  onEditar: (categoria: Categoria) => void
  onEliminar: (categoria: Categoria) => void
}

export function CategoriasView({
  categorias,
  loading,
  dm,
  textPrimary,
  textSecondary,
  textMuted,
  tableBorder,
  tableHead,
  tableRow,
  btnSecondary,
  onNueva,
  onEditar,
  onEliminar,
}: CategoriasViewProps) {
  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <FolderTree size={20} />
            </div>
            <h2 className={`text-xl font-bold ${textPrimary}`}>Categorías</h2>
          </div>
          <p className={`text-sm ${textSecondary}`}>
            Gestiona y organiza las categorías de productos de tu tienda.
          </p>
        </div>
        <button
          onClick={onNueva}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
        >
          <Plus size={18} />
          Nueva categoría
        </button>
      </div>

      <div className={`rounded-2xl border overflow-hidden shadow-sm ${dm ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-200'}`}>
        <div
          className={`border-b px-6 py-4 flex items-center justify-between ${tableBorder}`}
        >
          <div className="flex items-center gap-3">
            <p className={`text-sm font-semibold ${textPrimary}`}>Listado de categorías</p>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${dm ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
              {categorias.length} {categorias.length === 1 ? 'categoría' : 'categorías'}
            </span>
          </div>
          {loading && (
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
               <p className={`text-xs ${textMuted}`}>Cargando...</p>
             </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
            <thead>
              <tr className={`${tableHead}`}>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Slug</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Categoría Padre</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${dm ? 'divide-slate-800' : 'divide-gray-100'}`}>
              {categorias.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={5}
                    className={`px-6 py-12 text-center text-sm ${textMuted}`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <FolderTree size={40} className="opacity-20 mb-2" />
                      <p>No hay categorías registradas aún.</p>
                      <button onClick={onNueva} className="text-emerald-500 font-semibold hover:underline">
                        Crear la primera categoría
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {categorias.map((categoria) => {
                const padre = categoria.CategoriaPadre_Id 
                  ? categorias.find(c => c.Id === categoria.CategoriaPadre_Id)
                  : null;
                
                return (
                  <tr key={categoria.Id} className={`group transition-colors ${tableRow}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center mr-3 ${dm ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
                          <FolderTree size={16} />
                        </div>
                        <span className={`text-sm font-semibold ${textPrimary}`}>{categoria.Nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className={`text-xs font-mono px-2 py-1 rounded ${dm ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
                        {categoria.Slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {categoria.Visible ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
                          <Eye size={12} />
                          Visible
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                            dm ? 'bg-slate-700/40 text-slate-400' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          <EyeOff size={12} />
                          Oculta
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {padre ? (
                        <div className={`flex items-center gap-1 text-sm ${textSecondary}`}>
                          <span className="opacity-50">Padre:</span>
                          <span className="font-medium">{padre.Nombre}</span>
                        </div>
                      ) : (
                        <span className={`text-sm italic ${textMuted}`}>Principal</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEditar(categoria)}
                          title="Editar categoría"
                          className={`p-2 rounded-lg transition-all ${btnSecondary} hover:scale-110`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => onEliminar(categoria)}
                          title="Eliminar categoría"
                          className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10 transition-all hover:scale-110"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {categorias.length > 0 && (
          <div className={`px-6 py-4 border-t ${tableBorder} ${dm ? 'bg-slate-900/20' : 'bg-gray-50/50'}`}>
             <p className={`text-xs ${textMuted}`}>
               * Las categorías ocultas no se mostrarán en la tienda pública pero siguen disponibles para asignar productos.
             </p>
          </div>
        )}
      </div>
    </div>
  )
}


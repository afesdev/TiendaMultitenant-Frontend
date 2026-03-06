import { useState, useMemo } from 'react'
import {
  Package,
  Plus,
  FileSpreadsheet,
  Search,
  Filter,
  Pencil,
  Trash2,
  Tag,
  Truck,
  Eye,
  EyeOff,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
} from 'lucide-react'
import type { Producto } from '../types'

interface ProductosViewProps {
  productos: Producto[]
  loading: boolean
  dm: boolean
  textPrimary: string
  textSecondary: string
  textMuted: string
  tableBorder: string
  tableHead: string
  tableRow: string
  btnSecondary: string
  onNuevo: () => void
  onImportar: () => void
  onRecargar: () => void
  onVer: (producto: Producto) => void
  onEditar: (producto: Producto) => void
  onEliminar: (producto: Producto) => void
}

export function ProductosView({
  productos,
  loading,
  dm,
  textPrimary,
  textSecondary,
  textMuted,
  tableBorder,
  tableHead,
  tableRow,
  btnSecondary: _btnSecondary,
  onNuevo,
  onImportar,
  onRecargar,
  onVer,
  onEditar,
  onEliminar,
}: ProductosViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('Todas')
  const [filterEstado, setFilterEstado] = useState<'Todos' | 'Activos' | 'Ocultos'>('Todos')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const categoriasUnicas = useMemo(() => {
    const cats = new Set<string>()
    for (const p of productos) {
      cats.add(p.CategoriaNombre ?? 'Sin categoría')
    }
    return ['Todas', ...Array.from(cats)]
  }, [productos])

  const productosFiltrados = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim()
    return productos.filter((p) => {
      const matchesSearch =
        !lowerSearch ||
        p.Nombre.toLowerCase().includes(lowerSearch) ||
        p.CodigoInterno.toLowerCase().includes(lowerSearch) ||
        (p.CodigoBarras ?? '').toLowerCase().includes(lowerSearch)

      const catLabel = p.CategoriaNombre ?? 'Sin categoría'
      const matchesCategoria = filterCategoria === 'Todas' || catLabel === filterCategoria

      const matchesEstado =
        filterEstado === 'Todos' ||
        (filterEstado === 'Activos' && p.Visible) ||
        (filterEstado === 'Ocultos' && !p.Visible)

      return matchesSearch && matchesCategoria && matchesEstado
    })
  }, [productos, searchTerm, filterCategoria, filterEstado])

  const totalPages = Math.max(1, Math.ceil(productosFiltrados.length / pageSize))
  const currentPageSafe = Math.min(currentPage, totalPages)

  const pageItems = useMemo(() => {
    const start = (currentPageSafe - 1) * pageSize
    return productosFiltrados.slice(start, start + pageSize)
  }, [productosFiltrados, currentPageSafe])

  const handleChangePage = (page: number) => {
    const clamped = Math.min(Math.max(page, 1), totalPages)
    setCurrentPage(clamped)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Package size={24} />
            </div>
            <h2 className={`text-xl font-bold ${textPrimary}`}>Catálogo de Productos</h2>
          </div>
          <p className={`text-sm ${textSecondary}`}>
            Administra tu inventario, precios y visibilidad en la tienda.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => { onRecargar(); }}
            disabled={loading}
            className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              dm
                ? 'border-slate-600 bg-slate-800/50 text-slate-200 hover:bg-slate-700/80'
                : 'border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Recargar listado"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Recargar
          </button>
          <button
            onClick={onImportar}
            className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-5 py-2.5 text-sm font-bold text-emerald-500 hover:bg-emerald-500/10 transition-all active:scale-95"
          >
            <FileSpreadsheet size={18} />
            Importar Excel
          </button>
          <button
            onClick={onNuevo}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
          >
            <Plus size={18} />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 shadow-sm ${dm ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-200'}`}>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, código o barras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
              dm 
                ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500' 
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
            }`}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 min-w-[160px]">
            <Tag className="text-slate-400" size={16} />
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className={`flex-1 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                dm 
                  ? 'bg-slate-800 border-slate-700 text-slate-100' 
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}
            >
              {categoriasUnicas.map(cat => (
                <option key={cat ?? 'Sin'} value={cat ?? 'Todas'}>{cat ?? 'Sin categoría'}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 min-w-[140px]">
            <Filter className="text-slate-400" size={16} />
            <select
              value={filterEstado}
              onChange={(e) =>
                setFilterEstado(e.target.value as 'Todos' | 'Activos' | 'Ocultos')
              }
              className={`flex-1 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                dm 
                  ? 'bg-slate-800 border-slate-700 text-slate-100' 
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}
            >
              <option value="Todos">Todos</option>
              <option value="Activos">Activos</option>
              <option value="Ocultos">Ocultos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className={`rounded-2xl border overflow-hidden shadow-sm ${dm ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-200'}`}>
        <div
          className={`border-b px-6 py-4 flex items-center justify-between ${tableBorder}`}
        >
          <div className="flex items-center gap-3">
            <p className={`text-sm font-bold ${textPrimary}`}>Listado de productos</p>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${dm ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
              {productosFiltrados.length} items
            </span>
          </div>
          {loading && (
             <div className="flex items-center gap-2 text-emerald-500 font-medium">
               <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
               <p className="text-xs">Actualizando inventario...</p>
             </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
            <thead>
              <tr className={`${tableHead}`}>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Producto</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Clasificación</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Inventario</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Precios</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Visibilidad</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Creado</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Modificado</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${dm ? 'divide-slate-800' : 'divide-gray-100'}`}>
              {productosFiltrados.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className={`px-6 py-20 text-center ${textMuted}`}>
                    <div className="flex flex-col items-center gap-3">
                      <Package size={48} className="opacity-20" />
                      <p className="text-base font-medium">No se encontraron productos en el catálogo.</p>
                      {(searchTerm || filterCategoria !== 'Todas' || filterEstado !== 'Todos') && (
                        <button 
                          onClick={() => {setSearchTerm(''); setFilterCategoria('Todas'); setFilterEstado('Todos')}}
                          className="text-emerald-500 font-bold hover:underline text-sm"
                        >
                          Restablecer búsqueda y filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {pageItems.map((prod) => (
                <tr key={prod.Id} className={`group transition-colors ${tableRow}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-xl overflow-hidden mr-3 flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-900/5">
                        {prod.ImagenUrl ? (
                          <img
                            src={prod.ImagenUrl}
                            alt={prod.Nombre}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package
                            size={22}
                            className={dm ? 'text-slate-500' : 'text-gray-400'}
                          />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${textPrimary}`}>{prod.Nombre}</span>
                        <span className={`text-xs font-mono opacity-60 ${textSecondary}`}>
                          {prod.CodigoInterno}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <Tag size={12} className="text-emerald-500" />
                        <span className={`text-xs font-medium ${textSecondary}`}>{prod.CategoriaNombre ?? 'Sin Categoría'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Truck size={12} className="text-blue-400" />
                        <span className={`text-xs font-medium opacity-60 ${textMuted}`}>{prod.ProveedorNombre ?? 'Sin Proveedor'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`inline-flex items-center justify-center min-w-[40px] px-2.5 py-1 rounded-lg text-sm font-mono font-bold ${
                      prod.StockActual <= 5 
                        ? 'bg-red-500/10 text-red-500' 
                        : prod.StockActual <= 15 
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {prod.StockActual}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-[11px] font-mono">
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-bold">
                        {prod.TieneOferta && prod.PrecioOferta != null ? (
                          <>
                            <span className="line-through opacity-60 mr-1">
                              {prod.PrecioDetal.toLocaleString('es-CO', {
                                style: 'currency',
                                currency: 'COP',
                                maximumFractionDigits: 0,
                              })}
                            </span>
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {prod.PrecioOferta.toLocaleString('es-CO', {
                                style: 'currency',
                                currency: 'COP',
                                maximumFractionDigits: 0,
                              })}{' '}
                              <span className="text-[10px] font-semibold uppercase">oferta</span>
                            </span>
                          </>
                        ) : (
                          <>
                            {prod.PrecioDetal.toLocaleString('es-CO', {
                              style: 'currency',
                              currency: 'COP',
                              maximumFractionDigits: 0,
                            })}{' '}
                            <span className="text-[10px] font-semibold uppercase opacity-60">
                              detal
                            </span>
                          </>
                        )}
                      </span>
                      <span className={prod.PrecioMayor ? 'opacity-80' : 'opacity-40 italic'}>
                        {prod.PrecioMayor != null
                          ? prod.PrecioMayor.toLocaleString('es-CO', {
                              style: 'currency',
                              currency: 'COP',
                              maximumFractionDigits: 0,
                            })
                          : '—'}{' '}
                        <span className="text-[10px] font-semibold uppercase">
                          mayor
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {prod.Visible ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600">
                        <Eye size={12} />
                        Público
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                        dm ? 'bg-slate-700/40 text-slate-400' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <EyeOff size={12} />
                        Oculto
                      </span>
                    )}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-xs ${textSecondary}`}>
                    {prod.FechaCreacion ? (
                      <div className="flex flex-col leading-tight">
                        <span>
                          {new Date(prod.FechaCreacion).toLocaleDateString('es-CO', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                        <span className={`text-[11px] ${textMuted}`}>
                          {new Date(prod.FechaCreacion).toLocaleTimeString('es-CO', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-xs ${textSecondary}`}>
                    {prod.FechaModificacion ? (
                      <div className="flex flex-col leading-tight">
                        <span>
                          {new Date(prod.FechaModificacion).toLocaleDateString('es-CO', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                        <span className={`text-[11px] ${textMuted}`}>
                          {new Date(prod.FechaModificacion).toLocaleTimeString('es-CO', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onVer(prod)}
                        title="Ver detalle"
                        className={`p-2.5 rounded-lg transition-all ${dm ? 'hover:bg-slate-800 text-slate-400 hover:text-blue-400' : 'hover:bg-gray-100 text-gray-400 hover:text-blue-500'} hover:scale-110`}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => onEditar(prod)}
                        title="Editar producto"
                        className={`p-2.5 rounded-lg transition-all ${dm ? 'hover:bg-slate-800 text-slate-400 hover:text-emerald-400' : 'hover:bg-gray-100 text-gray-400 hover:text-emerald-500'} hover:scale-110`}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => onEliminar(prod)}
                        title="Eliminar producto"
                        className={`p-2.5 rounded-lg transition-all ${dm ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'} hover:scale-110`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {productosFiltrados.length > 0 && (
          <div
            className={`px-6 py-4 border-t ${tableBorder} ${
              dm ? 'bg-slate-900/20' : 'bg-gray-50/50'
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" />
                <p className={`text-xs ${textMuted}`}>
                  El precio mayorista y las variantes se gestionan desde los módulos específicos.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-1 text-xs font-bold">
                  <span className={textMuted}>Total catálogo:</span>
                  <span className={textPrimary}>{productos.length}</span>
                  <span className="mx-1 opacity-20">|</span>
                  <span className={textMuted}>Filtrados:</span>
                  <span className="text-emerald-500">{productosFiltrados.length}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleChangePage(currentPageSafe - 1)}
                    disabled={currentPageSafe <= 1}
                    className={`inline-flex items-center justify-center h-7 w-7 rounded-full border ${
                      currentPageSafe <= 1
                        ? 'opacity-40 cursor-not-allowed border-slate-300'
                        : dm
                        ? 'border-slate-700 hover:bg-slate-800'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className={textMuted}>
                    Página{' '}
                    <span className={textPrimary}>
                      {currentPageSafe} / {totalPages}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleChangePage(currentPageSafe + 1)}
                    disabled={currentPageSafe >= totalPages}
                    className={`inline-flex items-center justify-center h-7 w-7 rounded-full border ${
                      currentPageSafe >= totalPages
                        ? 'opacity-40 cursor-not-allowed border-slate-300'
                        : dm
                        ? 'border-slate-700 hover:bg-slate-800'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


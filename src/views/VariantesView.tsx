import { useState, useMemo } from 'react'
import {
  Layers,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronLeft,
  XCircle,
  RefreshCw,
  Printer,
} from 'lucide-react'
import type { ProductoVariante } from '../types'
import { BarcodeMini } from '../components/BarcodeMini'

interface VariantesViewProps {
  variantes: ProductoVariante[]
  loading: boolean
  dm: boolean
  textPrimary: string
  textSecondary: string
  textMuted: string
  tableBorder: string
  tableHead: string
  tableRow: string
  onNuevo: () => void
  onRecargar: () => void
  onEditar: (v: ProductoVariante) => void
  onEliminar: (v: ProductoVariante) => void
}

const PAGE_SIZE = 10

export function VariantesView({
  variantes,
  loading,
  dm,
  textPrimary,
  textSecondary,
  textMuted,
  tableBorder,
  tableHead,
  tableRow,
  onNuevo,
  onRecargar,
  onEditar,
  onEliminar,
}: VariantesViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAtributo, setFilterAtributo] = useState('Todos')
  const [currentPage, setCurrentPage] = useState(1)

  const atributosUnicos = useMemo(() => {
    const attrs = new Set(variantes.map((v) => v.Atributo))
    return ['Todos', ...Array.from(attrs)]
  }, [variantes])

  const variantesFiltradas = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim()
    return variantes.filter((v) => {
      const matchesSearch =
        !lowerSearch ||
        v.ProductoNombre.toLowerCase().includes(lowerSearch) ||
        (v.CodigoSKU ?? '').toLowerCase().includes(lowerSearch) ||
        (v.CodigoBarras ?? '').toLowerCase().includes(lowerSearch) ||
        v.CodigoInterno.toLowerCase().includes(lowerSearch) ||
        v.Valor.toLowerCase().includes(lowerSearch) ||
        v.Atributo.toLowerCase().includes(lowerSearch)
      const matchesAtributo = filterAtributo === 'Todos' || v.Atributo === filterAtributo
      return matchesSearch && matchesAtributo
    })
  }, [variantes, searchTerm, filterAtributo])

  const totalPages = Math.max(1, Math.ceil(variantesFiltradas.length / PAGE_SIZE))
  const currentPageSafe = Math.min(currentPage, totalPages)
  const pageItems = useMemo(() => {
    const start = (currentPageSafe - 1) * PAGE_SIZE
    return variantesFiltradas.slice(start, start + PAGE_SIZE)
  }, [variantesFiltradas, currentPageSafe])

  const handleChangePage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages))
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Layers size={24} />
            </div>
            <h2 className={`text-xl font-bold ${textPrimary}`}>Variantes de producto</h2>
          </div>
          <p className={`text-sm ${textSecondary}`}>
            Gestiona tallas, colores y otras combinaciones de tus productos.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onRecargar()}
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
            onClick={onNuevo}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
          >
            <Plus size={18} />
            Nueva variante
          </button>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 shadow-sm ${dm ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-200'}`}>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por producto, SKU, código de barras, valor o atributo..."
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
            <Filter className="text-slate-400" size={16} />
            <select
              value={filterAtributo}
              onChange={(e) => setFilterAtributo(e.target.value)}
              className={`flex-1 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                dm
                  ? 'bg-slate-800 border-slate-700 text-slate-100'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}
            >
              {atributosUnicos.map((attr) => (
                <option key={attr} value={attr}>{attr}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de variantes */}
      <div className={`rounded-2xl border overflow-hidden shadow-sm ${dm ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-200'}`}>
        <div
          className={`border-b px-6 py-4 flex items-center justify-between ${tableBorder}`}
        >
          <div className="flex items-center gap-3">
            <p className={`text-sm font-bold ${textPrimary}`}>Listado de variantes</p>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${dm ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
              {variantesFiltradas.length} items
            </span>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-emerald-500 font-medium">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
              <p className="text-xs">Actualizando variantes...</p>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
            <thead>
              <tr className={`${tableHead}`}>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Producto</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Atributo / Valor</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Inventario</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Precio Adicional</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">SKU / Cód. barras</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${dm ? 'divide-slate-800' : 'divide-gray-100'}`}>
              {variantesFiltradas.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className={`px-6 py-16 text-center ${textMuted}`}>
                    <div className="flex flex-col items-center gap-3">
                      <XCircle size={40} className="opacity-20" />
                      <p className="text-base font-medium">No se encontraron variantes que coincidan.</p>
                      {(searchTerm || filterAtributo !== 'Todos') && (
                        <button 
                          onClick={() => {setSearchTerm(''); setFilterAtributo('Todos')}}
                          className="text-emerald-500 font-bold hover:underline text-sm"
                        >
                          Limpiar búsqueda y filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {pageItems.map((v) => (
                <tr key={v.Id} className={`group transition-colors ${tableRow}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${textPrimary}`}>{v.ProductoNombre}</span>
                      <span className={`text-xs font-mono opacity-60 ${textSecondary}`}>{v.CodigoInterno}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                        dm ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {v.Atributo}
                      </span>
                      <ChevronRight size={14} className="opacity-30" />
                      <span className={`text-sm font-medium ${textPrimary}`}>{v.Valor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-sm font-mono font-bold ${
                      v.StockActual <= 5 
                        ? 'bg-red-500/10 text-red-500' 
                        : v.StockActual <= 20 
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {v.StockActual}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-mono font-bold ${textPrimary}`}>
                      {v.PrecioAdicional > 0 ? '+' : ''}
                      {v.PrecioAdicional.toLocaleString('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs font-mono min-w-0">
                      {v.CodigoSKU ? (
                        <span className={`${textPrimary} truncate`} title={v.CodigoSKU}>SKU: {v.CodigoSKU}</span>
                      ) : null}
                      {v.CodigoBarras ? (
                        <>
                          <BarcodeMini codigo={v.CodigoBarras} height={28} className="my-1" />
                          <span className={`${textSecondary} truncate`} title={v.CodigoBarras}><span className="opacity-75">Barras:</span> {v.CodigoBarras}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const nombre = `${v.ProductoNombre} (${v.Atributo}: ${v.Valor})`
                              const codigoEsc = (v.CodigoBarras ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"')
                              const nombreEsc = nombre.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
                              const precioTexto = v.PrecioAdicional > 0
                                ? `Precio + ${v.PrecioAdicional.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}`
                                : ''
                              const ventana = window.open('', '_blank', 'width=400,height=320')
                              if (!ventana) return
                              ventana.document.write(`
                                <!DOCTYPE html>
                                <html>
                                <head><title>Etiqueta - ${nombreEsc}</title><script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script></head>
                                <body style="margin:0;padding:16px;font-family:sans-serif;text-align:center">
                                  <p style="font-weight:bold;margin:0 0 4px 0">${nombreEsc}</p>
                                  ${precioTexto ? `<p style="font-size:14px;font-weight:bold;margin:0 0 8px 0">${precioTexto}</p>` : ''}
                                  <svg id="bc"><\/svg>
                                  <script>try{ JsBarcode("#bc","${codigoEsc}",{format:"CODE128",width:2,height:50,displayValue:true}); }catch(e){ document.getElementById("bc").textContent="${(v.CodigoBarras ?? '').replace(/"/g, '&quot;')}"; }<\/script>
                                </body>
                                </html>
                              `)
                              ventana.document.close()
                              ventana.focus()
                              setTimeout(() => { ventana.print(); ventana.close(); }, 300)
                            }}
                            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold w-fit mt-1 ${dm ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'}`}
                            title="Imprimir etiqueta"
                          >
                            <Printer size={12} />
                            Imprimir
                          </button>
                        </>
                      ) : null}
                      {!v.CodigoSKU && !v.CodigoBarras && (
                        <span className={textMuted}>—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEditar(v)}
                        title="Editar variante"
                        className={`p-2 rounded-lg transition-all ${dm ? 'hover:bg-slate-800 text-slate-400 hover:text-emerald-400' : 'hover:bg-gray-100 text-gray-400 hover:text-emerald-500'} hover:scale-110`}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => onEliminar(v)}
                        title="Eliminar variante"
                        className={`p-2 rounded-lg transition-all ${dm ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'} hover:scale-110`}
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
        
        {variantesFiltradas.length > 0 && (
          <div
            className={`px-6 py-4 border-t ${tableBorder} ${
              dm ? 'bg-slate-900/20' : 'bg-gray-50/50'
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className={`text-xs ${textMuted}`}>
                El stock mostrado es el inventario disponible para cada variante.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-1 text-xs font-bold">
                  <span className={textMuted}>Total:</span>
                  <span className={textPrimary}>{variantes.length}</span>
                  <span className="mx-1 opacity-20">|</span>
                  <span className={textMuted}>Filtrados:</span>
                  <span className="text-emerald-500">{variantesFiltradas.length}</span>
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


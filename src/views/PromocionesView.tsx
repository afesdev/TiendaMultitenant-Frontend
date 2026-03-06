import { useMemo, useState } from 'react'
import { Tag, Search, RefreshCw, ChevronLeft, ChevronRight, Plus, Eye, Trash2 } from 'lucide-react'
import type { PromocionResumen } from '../types'

interface PromocionesViewProps {
  promociones: PromocionResumen[]
  loading: boolean
  dm: boolean
  textPrimary: string
  textSecondary: string
  textMuted: string
  tableBorder: string
  tableHead: string
  tableRow: string
  btnSecondary: string
  onRecargar: () => void
  onNueva: () => void
  onEditar: (promo: PromocionResumen) => void
  onEliminar: (promo: PromocionResumen) => void
}

const PAGE_SIZE = 10

export function PromocionesView({
  promociones,
  loading,
  dm,
  textPrimary,
  textSecondary,
  textMuted,
  tableBorder,
  tableHead,
  tableRow,
  btnSecondary,
  onRecargar,
  onNueva,
  onEditar,
  onEliminar,
}: PromocionesViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActivas, setFilterActivas] = useState<'todas' | 'activas' | 'inactivas'>('todas')
  const [currentPage, setCurrentPage] = useState(1)

  const promosFiltradas = useMemo(() => {
    const q = searchTerm.toLowerCase().trim()
    return promociones.filter((p) => {
      const matchesEstado =
        filterActivas === 'todas'
          ? true
          : filterActivas === 'activas'
            ? p.Activo
            : !p.Activo
      const matchesSearch =
        !q ||
        p.Nombre.toLowerCase().includes(q) ||
        (p.Descripcion ?? '').toLowerCase().includes(q)
      return matchesEstado && matchesSearch
    })
  }, [promociones, searchTerm, filterActivas])

  const totalPages = Math.max(1, Math.ceil(promosFiltradas.length / PAGE_SIZE))
  const currentPageSafe = Math.min(currentPage, totalPages)

  const pageItems = useMemo(() => {
    const start = (currentPageSafe - 1) * PAGE_SIZE
    return promosFiltradas.slice(start, start + PAGE_SIZE)
  }, [promosFiltradas, currentPageSafe])

  const handleChangePage = (page: number) => {
    const clamped = Math.min(Math.max(page, 1), totalPages)
    setCurrentPage(clamped)
  }

  const fmt = (n: number) =>
    n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Tag size={24} />
            </div>
            <h2 className={`text-xl font-bold ${textPrimary}`}>Promociones</h2>
          </div>
          <p className={`text-sm ${textSecondary}`}>
            Define descuentos por producto y variantes para la tienda pública.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
              dm ? 'border-slate-800 bg-slate-900/40' : 'border-gray-200 bg-white'
            }`}
          >
            <Search size={16} className={textMuted} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o descripción…"
              className={`bg-transparent outline-none text-sm w-60 ${textPrimary}`}
            />
          </div>

          <select
            value={filterActivas}
            onChange={(e) =>
              setFilterActivas(e.target.value as typeof filterActivas)
            }
            className={`px-3 py-2 rounded-xl border text-sm font-medium ${
              dm
                ? 'bg-slate-800 border-slate-700 text-slate-100'
                : 'bg-gray-50 border-gray-200 text-gray-900'
            }`}
          >
            <option value="todas">Todas</option>
            <option value="activas">Activas</option>
            <option value="inactivas">Inactivas</option>
          </select>

          <button
            type="button"
            onClick={onRecargar}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${btnSecondary}`}
            title="Recargar"
          >
            <RefreshCw size={16} />
            Recargar
          </button>

          <button
            type="button"
            onClick={onNueva}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus size={16} />
            Nueva
          </button>
        </div>
      </div>

      <div
        className={`rounded-2xl border overflow-hidden shadow-sm ${
          dm ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-200'
        }`}
      >
        <div className={`border-b px-6 py-4 flex items-center justify-between ${tableBorder}`}>
          <p className={`text-sm font-bold ${textPrimary}`}>Listado de promociones</p>
          <span className={`text-xs font-bold ${textSecondary}`}>
            {promosFiltradas.length} items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
            <thead>
              <tr className={tableHead}>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Rango
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Condición
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${dm ? 'divide-slate-800' : 'divide-gray-100'}`}>
              {promosFiltradas.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className={`px-6 py-16 text-center ${textMuted}`}>
                    <div className="flex flex-col items-center gap-3">
                      <Tag size={40} className="opacity-20" />
                      <p className="text-base font-medium">No se encontraron promociones.</p>
                    </div>
                  </td>
                </tr>
              )}

              {pageItems.map((p) => {
                const tipo =
                  p.TipoDescuento === 'PORCENTAJE'
                    ? `${p.ValorDescuento}%`
                    : fmt(p.ValorDescuento)

                const desde = new Date(p.FechaInicio).toLocaleDateString('es-CO', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
                const hasta = new Date(p.FechaFin).toLocaleDateString('es-CO', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })

                return (
                  <tr key={p.Id} className={`group transition-colors ${tableRow}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`text-sm font-semibold ${textPrimary}`}>{p.Nombre}</span>
                        {p.Descripcion && (
                          <span className={`text-[11px] ${textMuted} line-clamp-1`}>
                            {p.Descripcion}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <span className={textSecondary}>
                        {p.TipoDescuento === 'PORCENTAJE' ? 'Porcentaje' : 'Valor fijo'} ·{' '}
                        <span className="font-semibold">{tipo}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <span className={textSecondary}>
                        {desde} – {hasta}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <div className="flex flex-col">
                        {p.MinCantidad != null && (
                          <span className={textSecondary}>
                            Min. cantidad: <span className="font-semibold">{p.MinCantidad}</span>
                          </span>
                        )}
                        {p.MinTotal != null && (
                          <span className={textSecondary}>
                            Min. total:{' '}
                            <span className="font-semibold">{fmt(p.MinTotal ?? 0)}</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          p.Activo
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-700/40 text-slate-300'
                        }`}
                      >
                        {p.Activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEditar(p)}
                          className={`p-1.5 rounded-lg transition-all ${
                            dm
                              ? 'hover:bg-slate-800 text-slate-400 hover:text-sky-400'
                              : 'hover:bg-gray-100 text-gray-400 hover:text-sky-500'
                          } hover:scale-110`}
                          title="Editar promoción"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEliminar(p)}
                          className={`p-1.5 rounded-lg transition-all ${
                            dm
                              ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400'
                              : 'hover:bg-red-50 text-gray-400 hover:text-red-500'
                          } hover:scale-110`}
                          title="Eliminar promoción"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {promosFiltradas.length > 0 && (
          <div
            className={`px-6 py-4 border-t ${tableBorder} ${
              dm ? 'bg-slate-900/20' : 'bg-gray-50/50'
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className={`text-xs ${textMuted}`}>
                Las promociones activas se aplican automáticamente en la tienda pública.
              </p>
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
                        ? 'border-slate-700 hover:bg-slate-80'
                        : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


import { useMemo, useState } from 'react'
import {
  Bookmark,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
  Plus,
  Eye,
  Trash2,
} from 'lucide-react'
import type { ApartadoResumen } from '../types'

interface ApartadosViewProps {
  apartados: ApartadoResumen[]
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
  onNuevoApartado: () => void
  onVer: (apartado: ApartadoResumen) => void
  onCambiarEstado: (apartado: ApartadoResumen, nuevoEstado: string) => void
  onEliminar: (apartado: ApartadoResumen) => void
}

const PAGE_SIZE = 10

export function ApartadosView({
  apartados,
  loading,
  dm,
  textPrimary,
  textSecondary,
  textMuted,
  tableBorder,
  tableHead,
  tableRow,
  btnSecondary: _btnSecondary,
  onRecargar,
  onNuevoApartado,
  onVer,
  onCambiarEstado,
  onEliminar,
}: ApartadosViewProps) {
  const ESTADOS = [
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'Completado', label: 'Completado' },
    { value: 'Vencido', label: 'Vencido' },
  ]

  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState<'todos' | 'Pendiente' | 'Completado' | 'Vencido'>(
    'todos',
  )
  const [currentPage, setCurrentPage] = useState(1)

  const apartadosFiltrados = useMemo(() => {
    const q = searchTerm.toLowerCase().trim()
    return apartados.filter((a) => {
      const matchesEstado = filterEstado === 'todos' ? true : a.Estado === filterEstado
      const matchesSearch =
        !q ||
        a.ClienteNombre.toLowerCase().includes(q) ||
        (a.ClienteCedula ?? '').toLowerCase().includes(q)
      return matchesEstado && matchesSearch
    })
  }, [apartados, searchTerm, filterEstado])

  const totalPages = Math.max(1, Math.ceil(apartadosFiltrados.length / PAGE_SIZE))
  const currentPageSafe = Math.min(currentPage, totalPages)

  const pageItems = useMemo(() => {
    const start = (currentPageSafe - 1) * PAGE_SIZE
    return apartadosFiltrados.slice(start, start + PAGE_SIZE)
  }, [apartadosFiltrados, currentPageSafe])

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
              <Bookmark size={24} />
            </div>
            <h2 className={`text-xl font-bold ${textPrimary}`}>Apartados</h2>
          </div>
          <p className={`text-sm ${textSecondary}`}>
            Gestiona apartados, abonos y vencimientos.
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
              placeholder="Buscar por cliente o cédula…"
              className={`bg-transparent outline-none text-sm w-60 ${textPrimary}`}
            />
          </div>

          <select
            value={filterEstado}
            onChange={(e) =>
              setFilterEstado(e.target.value as typeof filterEstado)
            }
            className={`px-3 py-2 rounded-xl border text-sm font-medium ${
              dm
                ? 'bg-slate-800 border-slate-700 text-slate-100'
                : 'bg-gray-50 border-gray-200 text-gray-900'
            }`}
          >
            <option value="todos">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Completado">Completado</option>
            <option value="Vencido">Vencido</option>
          </select>

          <button
            type="button"
            onClick={onRecargar}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${_btnSecondary}`}
            title="Recargar"
          >
            <RefreshCw size={16} />
            Recargar
          </button>

          <button
            type="button"
            onClick={onNuevoApartado}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus size={16} />
            Nuevo
          </button>
        </div>
      </div>

      <div
        className={`rounded-2xl border overflow-hidden shadow-sm ${
          dm ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-200'
        }`}
      >
        <div className={`border-b px-6 py-4 flex items-center justify-between ${tableBorder}`}>
          <p className={`text-sm font-bold ${textPrimary}`}>Listado de apartados</p>
          <span className={`text-xs font-bold ${textSecondary}`}>
            {apartadosFiltrados.length} items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
            <thead>
              <tr className={tableHead}>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Creación
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Vence
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">
                  Abonado
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">
                  Saldo
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
              {apartadosFiltrados.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className={`px-6 py-16 text-center ${textMuted}`}>
                    <div className="flex flex-col items-center gap-3">
                      <Bookmark size={40} className="opacity-20" />
                      <p className="text-base font-medium">No se encontraron apartados.</p>
                    </div>
                  </td>
                </tr>
              )}

              {pageItems.map((a) => {
                const fechaCreacion = a.FechaCreacion
                  ? new Date(a.FechaCreacion).toLocaleString('es-CO', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'
                const vence = a.FechaVencimiento
                  ? new Date(a.FechaVencimiento).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : '—'

                return (
                  <tr key={a.Id} className={`group transition-colors ${tableRow}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">{fechaCreacion}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-emerald-500" />
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium ${textPrimary}`}>
                            {a.ClienteNombre}
                          </span>
                          <span className={`text-[11px] ${textMuted}`}>{a.ClienteCedula}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">{vence}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-mono ${textPrimary}`}>
                      {fmt(a.Total)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-mono ${textSecondary}`}>
                      {fmt(a.Abonado)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-mono font-bold ${textPrimary}`}>
                      {fmt(a.Saldo)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={a.Estado ?? 'Pendiente'}
                        onChange={(e) => onCambiarEstado(a, e.target.value)}
                        className={`min-w-[7rem] rounded-lg border px-2 py-1 text-[11px] font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                          a.Estado === 'Completado'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : a.Estado === 'Vencido'
                              ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
                              : dm
                                ? 'bg-slate-700/50 text-slate-300 border-slate-600'
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {ESTADOS.map((e) => (
                          <option key={e.value} value={e.value}>
                            {e.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onVer(a)}
                          className={`p-1.5 rounded-lg transition-all ${
                            dm
                              ? 'hover:bg-slate-800 text-slate-400 hover:text-sky-400'
                              : 'hover:bg-gray-100 text-gray-400 hover:text-sky-500'
                          } hover:scale-110`}
                          title="Ver detalle"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEliminar(a)}
                          className={`p-1.5 rounded-lg transition-all ${
                            dm
                              ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400'
                              : 'hover:bg-red-50 text-gray-400 hover:text-red-500'
                          } hover:scale-110`}
                          title="Eliminar apartado"
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

        {apartadosFiltrados.length > 0 && (
          <div
            className={`px-6 py-4 border-t ${tableBorder} ${
              dm ? 'bg-slate-900/20' : 'bg-gray-50/50'
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className={`text-xs ${textMuted}`}>Los saldos se calculan como Total - Abonado.</p>
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
        )}
      </div>
    </div>
  )
}


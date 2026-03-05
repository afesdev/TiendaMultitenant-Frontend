import { useMemo, useState } from 'react'
import {
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  Eye,
} from 'lucide-react'
import type { VentaResumen } from '../types'

interface VentasViewProps {
  ventas: VentaResumen[]
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
  onNuevaVenta: () => void
  onVer: (venta: VentaResumen) => void
  onEditar: (venta: VentaResumen) => void
  onEliminar: (venta: VentaResumen) => void
}

type RangoFecha = 'hoy' | '7dias' | 'mes' | 'todo'

const PAGE_SIZE = 10

export function VentasView({
  ventas,
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
  onNuevaVenta,
  onVer,
  onEditar,
  onEliminar,
}: VentasViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRango, setFilterRango] = useState<RangoFecha>('hoy')
  const [currentPage, setCurrentPage] = useState(1)

  const hoy = new Date()
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())

  const ventasFiltradas = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim()

    return ventas.filter((v) => {
      const fecha = v.Fecha ? new Date(v.Fecha) : null

      let matchesRango = true
      if (fecha && !Number.isNaN(fecha.getTime())) {
        const soloFecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
        if (filterRango === 'hoy') {
          matchesRango = soloFecha.getTime() === inicioHoy.getTime()
        } else if (filterRango === '7dias') {
          const hace7 = new Date(inicioHoy)
          hace7.setDate(hace7.getDate() - 6)
          matchesRango = soloFecha >= hace7 && soloFecha <= inicioHoy
        } else if (filterRango === 'mes') {
          matchesRango =
            fecha.getFullYear() === hoy.getFullYear() &&
            fecha.getMonth() === hoy.getMonth()
        }
      }

      const matchesSearch =
        !lowerSearch ||
        v.ClienteNombre.toLowerCase().includes(lowerSearch) ||
        (v.MetodoPago ?? '').toLowerCase().includes(lowerSearch) ||
        (v.TipoVenta ?? '').toLowerCase().includes(lowerSearch)

      return matchesRango && matchesSearch
    })
  }, [ventas, searchTerm, filterRango, hoy, inicioHoy])

  const totalPages = Math.max(1, Math.ceil(ventasFiltradas.length / PAGE_SIZE))
  const currentPageSafe = Math.min(currentPage, totalPages)

  const pageItems = useMemo(() => {
    const start = (currentPageSafe - 1) * PAGE_SIZE
    return ventasFiltradas.slice(start, start + PAGE_SIZE)
  }, [ventasFiltradas, currentPageSafe])

  const handleChangePage = (page: number) => {
    const clamped = Math.min(Math.max(page, 1), totalPages)
    setCurrentPage(clamped)
  }

  const totalFiltrado = ventasFiltradas.reduce((acc, v) => acc + v.Total, 0)

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <TrendingUp size={24} />
            </div>
            <h2 className={`text-xl font-bold ${textPrimary}`}>Ventas</h2>
          </div>
          <p className={`text-sm ${textSecondary}`}>
            Revisa el historial de ventas, métodos de pago y montos.
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
            type="button"
            onClick={onNuevaVenta}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
          >
            <Plus size={18} />
            Nueva venta
          </button>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 shadow-sm ${
          dm ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por cliente, método de pago o tipo..."
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
          <div className="flex items-center gap-2 min-w-[180px]">
            <Filter className="text-slate-400" size={16} />
            <select
              value={filterRango}
              onChange={(e) => {
                setFilterRango(e.target.value as RangoFecha)
                setCurrentPage(1)
              }}
              className={`flex-1 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                dm
                  ? 'bg-slate-800 border-slate-700 text-slate-100'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}
            >
              <option value="hoy">Solo hoy</option>
              <option value="7dias">Últimos 7 días</option>
              <option value="mes">Este mes</option>
              <option value="todo">Todo el historial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de ventas */}
      <div
        className={`rounded-2xl border overflow-hidden shadow-sm ${
          dm ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-200'
        }`}
      >
        <div className={`border-b px-6 py-4 flex items-center justify-between ${tableBorder}`}>
          <div className="flex items-center gap-3">
            <p className={`text-sm font-bold ${textPrimary}`}>Listado de ventas</p>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                dm ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {ventasFiltradas.length} items
            </span>
          </div>
          {ventasFiltradas.length > 0 && (
            <div className={`text-xs font-bold ${textSecondary}`}>
              Total filtrado:{' '}
              <span className={dm ? 'text-emerald-400' : 'text-emerald-600'}>
                {totalFiltrado.toLocaleString('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
            <thead>
              <tr className={tableHead}>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Tipo / Entrega
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Pago
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Repartidor
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${dm ? 'divide-slate-800' : 'divide-gray-100'}`}>
              {ventasFiltradas.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className={`px-6 py-16 text-center ${textMuted}`}>
                    <div className="flex flex-col items-center gap-3">
                      <TrendingUp size={40} className="opacity-20" />
                      <p className="text-base font-medium">No se encontraron ventas.</p>
                    </div>
                  </td>
                </tr>
              )}

              {pageItems.map((v) => {
                const fecha = v.Fecha
                  ? new Date(v.Fecha).toLocaleString('es-CO', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'

                return (
                  <tr key={v.Id} className={`group transition-colors ${tableRow}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">{fecha}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-emerald-500" />
                        <span className={`text-sm font-medium ${textPrimary}`}>
                          {v.ClienteNombre}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <div className="flex flex-col gap-0.5">
                        <span className={textSecondary}>{v.TipoVenta ?? '—'}</span>
                        <span className={textMuted}>{v.TipoEntrega ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <div className="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CreditCard size={12} />
                        <span>{v.MetodoPago ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono font-bold">
                      <span className={textPrimary}>
                        {v.Total.toLocaleString('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <span className={textSecondary}>
                        {v.RepartidorNombre ?? 'Sin repartidor'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onVer(v)}
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
                          onClick={() => onEditar(v)}
                          className={`p-1.5 rounded-lg transition-all ${
                            dm
                              ? 'hover:bg-slate-800 text-slate-400 hover:text-emerald-400'
                              : 'hover:bg-gray-100 text-gray-400 hover:text-emerald-500'
                          } hover:scale-110`}
                          title="Editar venta"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEliminar(v)}
                          className={`p-1.5 rounded-lg transition-all ${
                            dm
                              ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400'
                              : 'hover:bg-red-50 text-gray-400 hover:text-red-500'
                          } hover:scale-110`}
                          title="Eliminar venta"
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

        {ventasFiltradas.length > 0 && (
          <div
            className={`px-6 py-4 border-t ${tableBorder} ${
              dm ? 'bg-slate-900/20' : 'bg-gray-50/50'
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className={`text-xs ${textMuted}`}>
                Los montos incluyen descuentos aplicados a cada venta.
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


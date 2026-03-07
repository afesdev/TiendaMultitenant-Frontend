import { useMemo, useState } from 'react'
import {
  RefreshCw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Package,
  Activity,
  Plus,
} from 'lucide-react'
import type { MovimientoInventario, Producto, ProductoVariante } from '../types'
import { MovimientoModal } from '../components/MovimientoModal'
import type { CrearMovimientoPayload } from '../hooks/useMovimientos'

interface MovimientosInventarioViewProps {
  movimientos: MovimientoInventario[]
  loading: boolean
  dm: boolean
  textPrimary: string
  textSecondary: string
  textMuted: string
  tableBorder: string
  tableHead: string
  tableRow: string
  btnSecondary: string
  productos: Producto[]
  variantes: ProductoVariante[]
  creando: boolean
  onRecargar: () => void
  onCrear: (payload: CrearMovimientoPayload) => Promise<boolean>
}

type RangoFecha = 'hoy' | '7dias' | 'mes' | 'todo'
type TipoMovimientoFiltro = 'TODOS' | 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'DEVOLUCION'

const PAGE_SIZE = 12

export function MovimientosInventarioView({
  movimientos,
  loading,
  dm,
  textPrimary,
  textSecondary,
  textMuted,
  tableBorder,
  tableHead,
  tableRow,
  btnSecondary,
  productos,
  variantes,
  creando,
  onRecargar,
  onCrear,
}: MovimientosInventarioViewProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRango, setFilterRango] = useState<RangoFecha>('7dias')
  const [filterTipo, setFilterTipo] = useState<TipoMovimientoFiltro>('TODOS')
  const [currentPage, setCurrentPage] = useState(1)

  const hoy = new Date()
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())

  const movimientosFiltrados = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim()

    return movimientos.filter((m) => {
      const fecha = m.Fecha ? new Date(m.Fecha) : null

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
            fecha.getFullYear() === hoy.getFullYear() && fecha.getMonth() === hoy.getMonth()
        }
      }

      const matchesTipo =
        filterTipo === 'TODOS' ||
        (m.TipoMovimiento ?? '').toUpperCase() === filterTipo.toUpperCase()

      const matchesSearch =
        !lowerSearch ||
        m.ProductoNombre.toLowerCase().includes(lowerSearch) ||
        m.CodigoInterno.toLowerCase().includes(lowerSearch) ||
        (m.CodigoBarras ?? '').toLowerCase().includes(lowerSearch) ||
        (m.Motivo ?? '').toLowerCase().includes(lowerSearch)

      return matchesRango && matchesTipo && matchesSearch
    })
  }, [movimientos, searchTerm, filterRango, filterTipo, hoy, inicioHoy])

  const totalPages = Math.max(1, Math.ceil(movimientosFiltrados.length / PAGE_SIZE))
  const currentPageSafe = Math.min(currentPage, totalPages)

  const pageItems = useMemo(() => {
    const start = (currentPageSafe - 1) * PAGE_SIZE
    return movimientosFiltrados.slice(start, start + PAGE_SIZE)
  }, [movimientosFiltrados, currentPageSafe])

  const handleChangePage = (page: number) => {
    const clamped = Math.min(Math.max(page, 1), totalPages)
    setCurrentPage(clamped)
  }

  const fmtFecha = (value: string) => {
    if (!value) return '—'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const badgeClassesByTipo: Record<TipoMovimientoFiltro, string> = {
    TODOS: '',
    ENTRADA:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
    SALIDA: 'bg-rose-500/10 text-rose-500 border border-rose-500/30',
    AJUSTE: 'bg-amber-500/10 text-amber-500 border border-amber-500/30',
    DEVOLUCION: 'bg-sky-500/10 text-sky-500 border border-sky-500/30',
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Activity size={24} />
            </div>
            <h2 className={`text-xl font-bold ${textPrimary}`}>Movimientos de inventario</h2>
          </div>
          <p className={`text-sm ${textSecondary}`}>
            Consulta el historial de entradas, salidas y ajustes de stock.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            disabled={loading}
            className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold transition-all active:scale-95 disabled:opacity-50 ${
              dm
                ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                : 'border-emerald-500 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
            }`}
          >
            <Plus size={18} />
            Nuevo movimiento
          </button>
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
        </div>
      </div>

      <MovimientoModal
        open={modalOpen}
        dm={dm}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        textMuted={textMuted}
        btnSecondary={btnSecondary}
        productos={productos}
        variantes={variantes}
        loading={creando}
        onClose={() => setModalOpen(false)}
        onSubmit={onCrear}
      />

      {/* Filtros */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 shadow-sm ${
          dm ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por producto, código o motivo..."
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

          <div className="flex items-center gap-2 min-w-[180px]">
            <Filter className="text-slate-400" size={16} />
            <select
              value={filterTipo}
              onChange={(e) => {
                setFilterTipo(e.target.value as TipoMovimientoFiltro)
                setCurrentPage(1)
              }}
              className={`flex-1 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                dm
                  ? 'bg-slate-800 border-slate-700 text-slate-100'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}
            >
              <option value="TODOS">Todos los tipos</option>
              <option value="ENTRADA">Entradas</option>
              <option value="SALIDA">Salidas</option>
              <option value="AJUSTE">Ajustes</option>
              <option value="DEVOLUCION">Devoluciones</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div
        className={`rounded-2xl border overflow-hidden shadow-sm ${
          dm ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-200'
        }`}
      >
        <div className={`border-b px-6 py-4 flex items-center justify-between ${tableBorder}`}>
          <div className="flex items-center gap-3">
            <p className={`text-sm font-bold ${textPrimary}`}>Historial de movimientos</p>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                dm ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {movimientosFiltrados.length} items
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
            <thead>
              <tr className={tableHead}>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Variante
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Motivo
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${dm ? 'divide-slate-800' : 'divide-gray-100'}`}>
              {movimientosFiltrados.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className={`px-6 py-16 text-center ${textMuted}`}>
                    <div className="flex flex-col items-center gap-3">
                      <Activity size={40} className="opacity-20" />
                      <p className="text-base font-medium">
                        No se encontraron movimientos para los filtros seleccionados.
                      </p>
                      <p className="text-sm">
                        Ajusta la búsqueda o el rango de fechas para ver otros registros.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {pageItems.map((m) => {
                const tipoUpper = (m.TipoMovimiento ?? '').toUpperCase() as TipoMovimientoFiltro
                const badgeClass =
                  badgeClassesByTipo[tipoUpper] ?? badgeClassesByTipo.ENTRADA

                return (
                  <tr key={m.Id} className={tableRow}>
                    <td className="px-6 py-3 whitespace-nowrap text-xs">
                      <span className={textSecondary}>{fmtFecha(m.Fecha)}</span>
                    </td>
                    <td className="px-6 py-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex-shrink-0 h-10 w-10 rounded-xl border overflow-hidden flex items-center justify-center ${
                            dm
                              ? 'border-slate-700 bg-slate-800'
                              : 'border-gray-200 bg-gray-100'
                          }`}
                        >
                          {m.ImagenUrl ? (
                            <img
                              src={m.ImagenUrl}
                              alt={m.ProductoNombre}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package size={16} className={textMuted} />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className={`font-semibold truncate ${textPrimary}`}>
                            {m.ProductoNombre}
                          </span>
                          <span className={`font-mono text-[10px] ${textMuted}`}>
                            {m.CodigoInterno}
                            {m.CodigoBarras ? ` · CB: ${m.CodigoBarras}` : ''}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-xs">
                      {m.VarianteAtributo && m.VarianteValor ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {m.VarianteAtributo}: {m.VarianteValor}
                          {m.VarianteCodigoSKU && (
                            <span className="opacity-80">· SKU {m.VarianteCodigoSKU}</span>
                          )}
                        </span>
                      ) : (
                        <span className={`text-[11px] italic ${textMuted}`}>Sin variante</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center text-xs">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeClass}`}>
                        {m.TipoMovimiento}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center text-xs font-bold">
                      <span
                        className={
                          m.TipoMovimiento?.toUpperCase() === 'SALIDA'
                            ? 'text-rose-500'
                            : m.TipoMovimiento?.toUpperCase() === 'ENTRADA'
                              ? 'text-emerald-500'
                              : 'text-amber-500'
                        }
                      >
                        {m.TipoMovimiento?.toUpperCase() === 'SALIDA' ? '-' : '+'}
                        {m.Cantidad}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs max-w-xs">
                      <p className={`truncate ${textSecondary}`}>{m.Motivo ?? '—'}</p>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {movimientosFiltrados.length > 0 && (
          <div className="flex items-center justify-between px-6 py-3 text-xs">
            <p className={textMuted}>
              Mostrando{' '}
              <span className="font-semibold">
                {Math.min((currentPageSafe - 1) * PAGE_SIZE + 1, movimientosFiltrados.length)}
              </span>{' '}
              -{' '}
              <span className="font-semibold">
                {Math.min(currentPageSafe * PAGE_SIZE, movimientosFiltrados.length)}
              </span>{' '}
              de <span className="font-semibold">{movimientosFiltrados.length}</span> movimientos
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleChangePage(currentPageSafe - 1)}
                disabled={currentPageSafe === 1}
                className="p-1.5 rounded-lg border border-transparent hover:border-slate-600 disabled:opacity-40 disabled:hover:border-transparent"
              >
                <ChevronLeft size={16} />
              </button>
              <span className={textSecondary}>
                Página <span className="font-semibold">{currentPageSafe}</span> de{' '}
                <span className="font-semibold">{totalPages}</span>
              </span>
              <button
                type="button"
                onClick={() => handleChangePage(currentPageSafe + 1)}
                disabled={currentPageSafe === totalPages}
                className="p-1.5 rounded-lg border border-transparent hover:border-slate-600 disabled:opacity-40 disabled:hover:border-transparent"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


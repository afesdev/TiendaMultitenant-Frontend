import { useMemo, useState } from 'react'
import { Users, Search, RefreshCw, ChevronLeft, ChevronRight, UserPlus, Pencil, Trash2 } from 'lucide-react'
import type { Cliente } from '../types'

interface ClientesViewProps {
  clientes: Cliente[]
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
  onImportar: () => void
  onNuevo: () => void
  onEditar: (c: Cliente) => void
  onEliminar: (c: Cliente) => void
}

const PAGE_SIZE = 10

export function ClientesView({
  clientes,
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
  onImportar,
  onNuevo,
  onEditar,
  onEliminar,
}: ClientesViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const clientesFiltrados = useMemo(() => {
    const q = searchTerm.toLowerCase().trim()
    if (!q) return clientes
    return clientes.filter((c) => {
      return (
        c.Nombre.toLowerCase().includes(q) ||
        c.Cedula.toLowerCase().includes(q) ||
        (c.Celular ?? '').toLowerCase().includes(q) ||
        (c.Direccion ?? '').toLowerCase().includes(q)
      )
    })
  }, [clientes, searchTerm])

  const totalPages = Math.max(1, Math.ceil(clientesFiltrados.length / PAGE_SIZE))
  const currentPageSafe = Math.min(currentPage, totalPages)

  const pageItems = useMemo(() => {
    const start = (currentPageSafe - 1) * PAGE_SIZE
    return clientesFiltrados.slice(start, start + PAGE_SIZE)
  }, [clientesFiltrados, currentPageSafe])

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
              <Users size={24} />
            </div>
            <h2 className={`text-xl font-bold ${textPrimary}`}>Clientes</h2>
          </div>
          <p className={`text-sm ${textSecondary}`}>
            Administra la base de clientes de tu tienda.
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
            onClick={onImportar}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
          >
            <Users size={18} />
            Importar desde Excel
          </button>
          <button
            type="button"
            onClick={onNuevo}
            className="flex items-center gap-2 rounded-xl border px-6 py-2.5 text-sm font-bold text-emerald-500 border-emerald-500/50 hover:bg-emerald-500/10 transition-all active:scale-95"
          >
            <UserPlus size={18} />
            Nuevo cliente
          </button>
        </div>
      </div>

      {/* Búsqueda */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 shadow-sm ${
          dm ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por cédula, nombre, celular o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
              dm
                ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500'
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
            }`}
          />
        </div>
      </div>

      {/* Tabla de clientes */}
      <div
        className={`rounded-2xl border overflow-hidden shadow-sm ${
          dm ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-200'
        }`}
      >
        <div className={`border-b px-6 py-4 flex items-center justify-between ${tableBorder}`}>
          <div className="flex items-center gap-3">
            <p className={`text-sm font-bold ${textPrimary}`}>Listado de clientes</p>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                dm ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {clientesFiltrados.length} items
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
            <thead>
              <tr className={tableHead}>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Cédula
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Celular
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Dirección
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Fecha registro
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${dm ? 'divide-slate-800' : 'divide-gray-100'}`}>
              {clientesFiltrados.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className={`px-6 py-16 text-center ${textMuted}`}>
                    <div className="flex flex-col items-center gap-3">
                      <Users size={40} className="opacity-20" />
                      <p className="text-base font-medium">No se encontraron clientes.</p>
                    </div>
                  </td>
                </tr>
              )}

              {pageItems.map((c) => {
                const fecha = c.FechaRegistro
                  ? new Date(c.FechaRegistro).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : '—'

                return (
                  <tr key={c.Id} className={`group transition-colors ${tableRow}`}>
                    <td className="px-6 py-3 whitespace-nowrap text-xs font-mono">{c.Cedula}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                      <span className={textPrimary}>{c.Nombre}</span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-xs">
                      <span className={textSecondary}>{c.Celular ?? '—'}</span>
                    </td>
                    <td className="px-6 py-3 text-xs">
                      <span className={textSecondary}>{c.Direccion ?? '—'}</span>
                    </td>
                  <td className="px-6 py-3 whitespace-nowrap text-xs">
                    <span className={textSecondary}>{fecha}</span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-right text-xs">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEditar(c)}
                        className={`p-1.5 rounded-lg transition-all ${
                          dm
                            ? 'hover:bg-slate-800 text-slate-400 hover:text-emerald-400'
                            : 'hover:bg-gray-100 text-gray-400 hover:text-emerald-500'
                        } hover:scale-110`}
                        title="Editar cliente"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEliminar(c)}
                        className={`p-1.5 rounded-lg transition-all ${
                          dm
                            ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400'
                            : 'hover:bg-red-50 text-gray-400 hover:text-red-500'
                        } hover:scale-110`}
                        title="Eliminar cliente"
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

        {clientesFiltrados.length > 0 && (
          <div
            className={`px-6 py-4 border-t ${tableBorder} ${
              dm ? 'bg-slate-900/20' : 'bg-gray-50/50'
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className={`text-xs ${textMuted}`}>
                Los datos importados se asocian a esta tienda y se pueden reutilizar en ventas.
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


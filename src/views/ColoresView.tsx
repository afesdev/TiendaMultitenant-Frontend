import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Droplets,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import type { Color } from '../types'

interface ColoresViewProps {
  colores: Color[]
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
  onEditar: (c: Color) => void
  onDesactivar: (c: Color) => void
  // Modal / formulario
  modalOpen: boolean
  editando: Color | null
  formNombre: string
  formCodigoHex: string
  formCodigoInterno: string
  formActivo: boolean
  onChangeNombre: (v: string) => void
  onChangeCodigoHex: (v: string) => void
  onChangeCodigoInterno: (v: string) => void
  onChangeActivo: (v: boolean) => void
  onCloseModal: () => void
  onSubmit: (e: FormEvent) => void
}

export function ColoresView({
  colores,
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
  onEditar,
  onDesactivar,
  modalOpen,
  editando,
  formNombre,
  formCodigoHex,
  formCodigoInterno,
  formActivo,
  onChangeNombre,
  onChangeCodigoHex,
  onChangeCodigoInterno,
  onChangeActivo,
  onCloseModal,
  onSubmit,
}: ColoresViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState<'Todos' | 'Activos' | 'Inactivos'>(
    'Todos',
  )

  const coloresFiltrados = useMemo(() => {
    const q = searchTerm.toLowerCase().trim()
    return colores.filter((c) => {
      const matchesSearch =
        !q ||
        c.Nombre.toLowerCase().includes(q) ||
        (c.CodigoInterno ?? '').toLowerCase().includes(q)
      const matchesEstado =
        filterEstado === 'Todos' ||
        (filterEstado === 'Activos' && c.Activo) ||
        (filterEstado === 'Inactivos' && !c.Activo)
      return matchesSearch && matchesEstado
    })
  }, [colores, searchTerm, filterEstado])

  const renderSwatch = (c: Color) => {
    const hex = c.CodigoHex?.trim() || '#999999'
    return (
      <div className="flex items-center gap-2">
        <span
          className="inline-flex h-6 w-6 rounded-full border border-slate-300 dark:border-slate-600 shrink-0"
          style={{ backgroundColor: hex }}
        />
        <div className="flex flex-col">
          <span className={`text-sm font-semibold ${textPrimary}`}>{c.Nombre}</span>
          <span className={`text-xs ${textSecondary}`}>
            {c.CodigoHex || 'Sin color asignado'}
          </span>
        </div>
      </div>
    )
  }

  const modalInputClass = dm
    ? 'w-full rounded-xl border px-3 py-2 text-sm bg-slate-900/60 border-slate-700 text-slate-100 placeholder-slate-500'
    : 'w-full rounded-xl border px-3 py-2 text-sm bg-white border-slate-300 text-slate-900 placeholder-slate-400'

  const modalLabelClass = dm
    ? 'block text-xs font-bold mb-1.5 text-slate-300'
    : 'block text-xs font-bold mb-1.5 text-slate-700'

  const colorPickerValue = (() => {
    const raw = (formCodigoHex ?? '').trim()
    const hex = raw.startsWith('#') ? raw : raw ? `#${raw}` : ''
    return /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : '#000000'
  })()

  return (
    <>
      <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Droplets size={22} />
              </div>
              <h2 className={`text-xl font-bold ${textPrimary}`}>Colores</h2>
            </div>
            <p className={`text-sm ${textSecondary}`}>
              Define la paleta de colores disponible para las variantes (por ejemplo, para
              asociar imágenes y mostrar chips de color coherentes).
            </p>
          </div>
          <button
            type="button"
            onClick={onNuevo}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
          >
            <Plus size={18} />
            Nuevo color
          </button>
        </div>

        <div
          className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 shadow-sm ${
            dm ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar por nombre o código interno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                dm
                  ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>

          <div className="flex items-center gap-2 min-w-[180px]">
            <Filter className="text-slate-400" size={18} />
            <select
              value={filterEstado}
              onChange={(e) =>
                setFilterEstado(e.target.value as 'Todos' | 'Activos' | 'Inactivos')
              }
              className={`flex-1 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                dm
                  ? 'bg-slate-800 border-slate-700 text-slate-100'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}
            >
              <option value="Todos">Todos los estados</option>
              <option value="Activos">Activos</option>
              <option value="Inactivos">Inactivos</option>
            </select>
          </div>
        </div>

        <div
          className={`rounded-2xl border overflow-hidden shadow-sm ${
            dm ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-200'
          }`}
        >
          <div
            className={`border-b px-6 py-4 flex items-center justify-between ${tableBorder}`}
          >
            <div className="flex items-center gap-3">
              <p className={`text-sm font-bold ${textPrimary}`}>Listado de colores</p>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  dm ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {coloresFiltrados.length}{' '}
                {coloresFiltrados.length === 1 ? 'color' : 'colores'}
              </span>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-emerald-500">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                <p className="text-xs font-medium">Cargando…</p>
              </div>
            )}
          </div>

          <div className="overflow-x-auto max-h-[520px]">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
              <thead>
                <tr className={tableHead}>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Código interno
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${dm ? 'divide-slate-800' : 'divide-gray-100'}`}
              >
                {coloresFiltrados.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={4}
                      className={`px-6 py-20 text-center ${textMuted}`}
                    >
                      <p className="text-base font-medium">
                        No se encontraron colores en el catálogo.
                      </p>
                    </td>
                  </tr>
                )}

                {coloresFiltrados.map((c) => (
                  <tr key={c.Id} className={`group transition-colors ${tableRow}`}>
                    <td className="px-6 py-4 whitespace-nowrap">{renderSwatch(c)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-mono ${textSecondary}`}>
                        {c.CodigoInterno || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {c.Activo ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600">
                          <CheckCircle size={12} />
                          Activo
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                            dm
                              ? 'bg-slate-700/40 text-slate-400'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          <XCircle size={12} />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEditar(c)}
                          title="Editar color"
                          className={`p-2.5 rounded-lg transition-all ${
                            dm
                              ? 'hover:bg-slate-800 text-slate-400 hover:text-emerald-400'
                              : 'hover:bg-gray-100 text-gray-400 hover:text-emerald-500'
                          } hover:scale-110`}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDesactivar(c)}
                          title="Desactivar color"
                          className={`p-2.5 rounded-lg transition-all ${
                            dm
                              ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400'
                              : 'hover:bg-red-50 text-gray-400 hover:text-red-500'
                          } hover:scale-110`}
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
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4"
          onClick={(e) => e.target === e.currentTarget && onCloseModal()}
        >
          <div
            className={`w-full max-w-md rounded-2xl border shadow-xl ${
              dm ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-700/60 flex items-center justify-between">
              <div>
                <p className={`text-sm font-bold ${textPrimary}`}>
                  {editando ? 'Editar color' : 'Nuevo color'}
                </p>
                <p className={`text-xs ${textSecondary}`}>
                  Define el nombre y el código de color en formato hex (por ejemplo
                  #FF0000).
                </p>
              </div>
            </div>
            <form onSubmit={onSubmit} className="px-4 py-4 space-y-4">
              <div>
                <label className={modalLabelClass}>Nombre</label>
                <input
                  type="text"
                  value={formNombre}
                  onChange={(e) => onChangeNombre(e.target.value)}
                  className={modalInputClass}
                  placeholder="Ej: Negro, Rojo intenso"
                  required
                />
              </div>
              <div>
                <label className={modalLabelClass}>Código hex (opcional)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colorPickerValue}
                    onChange={(e) => onChangeCodigoHex(e.target.value)}
                    className="h-10 w-12 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent p-1"
                    title="Seleccionar color"
                  />
                  <input
                    type="text"
                    value={formCodigoHex}
                    onChange={(e) => onChangeCodigoHex(e.target.value)}
                    className={modalInputClass}
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div>
                <label className={modalLabelClass}>Código interno (opcional)</label>
                <input
                  type="text"
                  value={formCodigoInterno}
                  onChange={(e) => onChangeCodigoInterno(e.target.value)}
                  className={modalInputClass}
                  placeholder="Ej: NEGRO_STD"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <label
                  className={`inline-flex items-center gap-2 text-xs ${
                    dm ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formActivo}
                    onChange={(e) => onChangeActivo(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-500 text-emerald-500 focus:ring-emerald-500"
                  />
                  Activo
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onCloseModal}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                      dm
                        ? 'border-slate-600 text-slate-300 hover:bg-slate-800'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}


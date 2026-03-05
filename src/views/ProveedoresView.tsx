import { useState, useMemo } from 'react'
import { 
  Truck, 
  Plus, 
  Search, 
  Filter, 
  Pencil, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle,
  AlertCircle
} from 'lucide-react'
import type { Proveedor } from '../types'

interface ProveedoresViewProps {
  proveedores: Proveedor[]
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
  onEditar: (prov: Proveedor) => void
  onEliminar: (prov: Proveedor) => void
}

export function ProveedoresView({
  proveedores,
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
  onEliminar,
}: ProveedoresViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState('Todos')

  const proveedoresFiltrados = useMemo(() => {
    return proveedores.filter(p => {
      const matchesSearch = 
        p.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.Contacto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.Telefono?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesEstado = 
        filterEstado === 'Todos' || 
        (filterEstado === 'Activos' && p.Activo) || 
        (filterEstado === 'Inactivos' && !p.Activo)
      
      return matchesSearch && matchesEstado
    })
  }, [proveedores, searchTerm, filterEstado])

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Truck size={22} />
            </div>
            <h2 className={`text-xl font-bold ${textPrimary}`}>Proveedores</h2>
          </div>
          <p className={`text-sm ${textSecondary}`}>
            Administra tus fuentes de suministro y contactos comerciales.
          </p>
        </div>
        <button
          onClick={onNuevo}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
        >
          <Plus size={18} />
          Nuevo proveedor
        </button>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 shadow-sm ${dm ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-200'}`}>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, contacto o email..."
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
            onChange={(e) => setFilterEstado(e.target.value)}
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

      {/* Tabla de proveedores */}
      <div className={`rounded-2xl border overflow-hidden shadow-sm ${dm ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-200'}`}>
        <div
          className={`border-b px-6 py-4 flex items-center justify-between ${tableBorder}`}
        >
          <div className="flex items-center gap-3">
            <p className={`text-sm font-bold ${textPrimary}`}>Listado de proveedores</p>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${dm ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
              {proveedoresFiltrados.length} {proveedoresFiltrados.length === 1 ? 'proveedor' : 'proveedores'}
            </span>
          </div>
          {loading && (
             <div className="flex items-center gap-2 text-emerald-500">
               <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
               <p className="text-xs font-medium">Actualizando...</p>
             </div>
          )}
        </div>

        <div className="overflow-x-auto max-h-[550px]">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
            <thead>
              <tr className={`${tableHead}`}>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Proveedor / Empresa</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Contacto Directo</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Información de Contacto</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${dm ? 'divide-slate-800' : 'divide-gray-100'}`}>
              {proveedoresFiltrados.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className={`px-6 py-20 text-center ${textMuted}`}>
                    <div className="flex flex-col items-center gap-3">
                      <Truck size={48} className="opacity-20" />
                      <p className="text-base font-medium">No se encontraron proveedores.</p>
                      {(searchTerm || filterEstado !== 'Todos') && (
                        <button 
                          onClick={() => {setSearchTerm(''); setFilterEstado('Todos')}}
                          className="text-emerald-500 font-bold hover:underline text-sm"
                        >
                          Ver todos los proveedores
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {proveedoresFiltrados.map((prov) => (
                <tr key={prov.Id} className={`group transition-colors ${tableRow}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center mr-3 ${dm ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
                        <Truck size={20} />
                      </div>
                      <span className={`text-sm font-bold ${textPrimary}`}>{prov.Nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User size={14} className="opacity-40" />
                      <span className={`text-sm font-medium ${textSecondary}`}>{prov.Contacto ?? 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-emerald-500" />
                        <span className={`text-xs font-medium ${textPrimary}`}>{prov.Telefono ?? '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={13} className="text-blue-400" />
                        <span className={`text-xs font-medium ${textSecondary}`}>{prov.Email ?? '-'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {prov.Activo ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600">
                        <CheckCircle size={12} />
                        Activo
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                        dm ? 'bg-slate-700/40 text-slate-400' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <XCircle size={12} />
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEditar(prov)}
                        title="Editar proveedor"
                        className={`p-2.5 rounded-lg transition-all ${dm ? 'hover:bg-slate-800 text-slate-400 hover:text-emerald-400' : 'hover:bg-gray-100 text-gray-400 hover:text-emerald-500'} hover:scale-110`}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => onEliminar(prov)}
                        title="Eliminar proveedor"
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
        
        {proveedoresFiltrados.length > 0 && (
          <div className={`px-6 py-4 border-t ${tableBorder} ${dm ? 'bg-slate-900/20' : 'bg-gray-50/50'}`}>
             <div className="flex items-center gap-2">
               <AlertCircle size={14} className="text-amber-500" />
               <p className={`text-xs ${textMuted}`}>
                 Los proveedores inactivos no aparecerán en la selección de nuevos productos, pero conservan su historial.
               </p>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}


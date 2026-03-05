import { Truck, X, User, Phone, Mail } from 'lucide-react'
import type { FormEvent } from 'react'
import type { Proveedor } from '../types'

interface ProveedorModalProps {
  open: boolean
  dm: boolean
  textPrimary: string
  textSecondary: string
  btnSecondary: string
  proveedorEditando: Proveedor | null
  provNombre: string
  provContacto: string
  provTelefono: string
  provEmail: string
  provActivo: boolean
  onClose: () => void
  setProvNombre: (val: string) => void
  setProvContacto: (val: string) => void
  setProvTelefono: (val: string) => void
  setProvEmail: (val: string) => void
  setProvActivo: (val: boolean) => void
  onSubmit: (e: FormEvent) => void
}

export function ProveedorModal({
  open,
  dm,
  textPrimary,
  textSecondary,
  btnSecondary,
  proveedorEditando,
  provNombre,
  provContacto,
  provTelefono,
  provEmail,
  provActivo,
  onClose,
  setProvNombre,
  setProvContacto,
  setProvTelefono,
  setProvEmail,
  setProvActivo,
  onSubmit,
}: ProveedorModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4 transition-all">
      <div
        className={`w-full max-w-lg rounded-2xl border p-8 shadow-2xl ${
          dm
            ? 'bg-slate-900 border-slate-700 shadow-slate-950/50'
            : 'bg-white border-gray-200 shadow-gray-200/80'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Truck size={24} />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${textPrimary}`}>
                {proveedorEditando ? 'Editar proveedor' : 'Nuevo proveedor'}
              </h3>
              <p className={`mt-1 text-sm ${textSecondary}`}>
                Registra los datos de contacto y estado del proveedor.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all ${btnSecondary} hover:scale-105`}
          >
            <X size={20} />
          </button>
        </div>

        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <label className={`block text-sm font-bold mb-2 ${textPrimary}`}>Nombre de la empresa</label>
            <input
              type="text"
              value={provNombre}
              onChange={(e) => setProvNombre(e.target.value)}
              className={`w-full rounded-xl border px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                dm
                  ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500'
                  : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'
              }`}
              placeholder="Ej. Suministros Textiles S.A.S."
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${textPrimary}`}>
                <User size={16} className="text-emerald-500" />
                Persona de contacto
              </label>
              <input
                type="text"
                value={provContacto}
                onChange={(e) => setProvContacto(e.target.value)}
                className={`w-full rounded-xl border px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  dm
                    ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500'
                    : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="Nombre del contacto"
              />
            </div>
            <div>
              <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${textPrimary}`}>
                <Phone size={16} className="text-emerald-500" />
                Teléfono
              </label>
              <input
                type="text"
                value={provTelefono}
                onChange={(e) => setProvTelefono(e.target.value)}
                className={`w-full rounded-xl border px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  dm
                    ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500'
                    : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="+57 300..."
              />
            </div>
          </div>

          <div>
            <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${textPrimary}`}>
              <Mail size={16} className="text-emerald-500" />
              Correo electrónico
            </label>
            <input
              type="email"
              value={provEmail}
              onChange={(e) => setProvEmail(e.target.value)}
              className={`w-full rounded-xl border px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                dm
                  ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500'
                  : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'
              }`}
              placeholder="ejemplo@proveedor.com"
            />
          </div>

          <div className="pt-2">
            <label className={`flex items-center gap-3 p-4 w-full cursor-pointer rounded-xl border transition-all ${
              dm 
                ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-800' 
                : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
            }`}>
              <input
                type="checkbox"
                checked={provActivo}
                onChange={(e) => setProvActivo(e.target.checked)}
                className="h-5 w-5 rounded-md text-emerald-500 focus:ring-emerald-500 border-gray-300 transition-all cursor-pointer"
              />
              <div className="flex flex-col">
                <span className={`text-sm font-bold ${textPrimary}`}>Proveedor activo</span>
                <span className={`text-xs ${textSecondary}`}>Permitir asignar este proveedor a nuevos productos</span>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${btnSecondary} hover:bg-red-50 hover:text-red-500 hover:border-red-200`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all"
            >
              {proveedorEditando ? 'Guardar cambios' : 'Crear proveedor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

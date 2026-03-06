import type { FormEvent } from 'react'
import { Bike } from 'lucide-react'
import type { Repartidor } from '../types'

interface RepartidorModalProps {
  open: boolean
  dm: boolean
  textPrimary: string
  textSecondary: string
  btnSecondary: string
  repartidorEditando: Repartidor | null
  nombre: string
  telefono: string
  documento: string
  vehiculo: string
  placa: string
  disponible: boolean
  activo: boolean
  onClose: () => void
  setNombre: (val: string) => void
  setTelefono: (val: string) => void
  setDocumento: (val: string) => void
  setVehiculo: (val: string) => void
  setPlaca: (val: string) => void
  setDisponible: (val: boolean) => void
  setActivo: (val: boolean) => void
  onSubmit: (e: FormEvent) => void
}

export function RepartidorModal({
  open,
  dm,
  textPrimary,
  textSecondary,
  btnSecondary,
  repartidorEditando,
  nombre,
  telefono,
  documento,
  vehiculo,
  placa,
  disponible,
  activo,
  onClose,
  setNombre,
  setTelefono,
  setDocumento,
  setVehiculo,
  setPlaca,
  setDisponible,
  setActivo,
  onSubmit,
}: RepartidorModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div
        className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
          dm
            ? 'bg-slate-950 border-slate-800 shadow-slate-950/50'
            : 'bg-white border-gray-200 shadow-gray-200/80'
        }`}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Bike size={20} />
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${textPrimary}`}>
                {repartidorEditando ? 'Editar repartidor' : 'Nuevo repartidor'}
              </h3>
              <p className={`mt-0.5 text-[11px] ${textSecondary}`}>
                Completa los datos de contacto y estado.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`rounded-xl px-2.5 py-1 text-xs transition-colors ${btnSecondary}`}
          >
            Cerrar
          </button>
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          <div>
            <label className={`block text-xs font-medium mb-1 ${textPrimary}`}>Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                dm
                  ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-500'
                  : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>
          <div>
            <label className={`block text-xs font-medium mb-1 ${textPrimary}`}>Teléfono</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                dm
                  ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-500'
                  : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-medium mb-1 ${textPrimary}`}>Documento</label>
              <input
                type="text"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  dm
                    ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-500'
                    : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${textPrimary}`}>
                Vehículo / placa
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={vehiculo}
                  onChange={(e) => setVehiculo(e.target.value)}
                  placeholder="Moto"
                  className={`w-1/2 rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    dm
                      ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-500'
                      : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400'
                  }`}
                />
                <input
                  type="text"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                  placeholder="ABC123"
                  className={`w-1/2 rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    dm
                      ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-500'
                      : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 pt-1">
            <label className={`flex items-center gap-2 text-xs ${textPrimary}`}>
              <input
                type="checkbox"
                checked={disponible}
                onChange={(e) => setDisponible(e.target.checked)}
                className="h-3.5 w-3.5 rounded text-emerald-500 focus:ring-emerald-500"
              />
              Disponible para envíos
            </label>
            <label className={`flex items-center gap-2 text-xs ${textPrimary}`}>
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className="h-3.5 w-3.5 rounded text-emerald-500 focus:ring-emerald-500"
              />
              Repartidor activo
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className={`rounded-xl px-3 py-1.5 text-xs transition-colors ${btnSecondary}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors"
            >
              {repartidorEditando ? 'Guardar cambios' : 'Crear repartidor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

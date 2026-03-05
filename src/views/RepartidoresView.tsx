import { Bike, Car, CheckCircle2, Clock, FileText, Phone, Trash2, Pencil, UserX, Users } from 'lucide-react'
import type { Repartidor } from '../types'

interface RepartidoresViewProps {
  repartidores: Repartidor[]
  loading: boolean
  dm: boolean
  textPrimary: string
  textSecondary: string
  textMuted: string
  cardBg: string
  cardBgHover: string
  tableBorder: string
  btnSecondary: string
  onNuevo: () => void
  onEditar: (rep: Repartidor) => void
  onEliminar: (rep: Repartidor) => void
}

export function RepartidoresView({
  repartidores,
  loading,
  dm,
  textPrimary,
  textSecondary,
  textMuted,
  cardBg,
  cardBgHover,
  tableBorder,
  btnSecondary,
  onNuevo,
  onEditar,
  onEliminar,
}: RepartidoresViewProps) {
  const total = repartidores.length
  const disponibles = repartidores.filter((r) => r.Activo && r.Disponible).length
  const ocupados = repartidores.filter((r) => r.Activo && !r.Disponible).length
  const inactivos = repartidores.filter((r) => !r.Activo).length

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className={`text-base font-semibold ${textPrimary}`}>Repartidores</h2>
          <p className={`mt-0.5 text-xs ${textSecondary}`}>
            Gestiona el equipo de entregas de tu tienda.
          </p>
        </div>
        <button
          onClick={onNuevo}
          className="flex-shrink-0 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-600 active:scale-95 transition-all"
        >
          + Nuevo repartidor
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Total',
            value: total,
            icon: <Users size={15} />,
            cls: dm
              ? 'text-slate-400 bg-slate-800/60 border-slate-700/60'
              : 'text-gray-500 bg-gray-100 border-gray-200',
          },
          {
            label: 'Disponibles',
            value: disponibles,
            icon: <CheckCircle2 size={15} />,
            cls: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
          },
          {
            label: 'Ocupados',
            value: ocupados,
            icon: <Clock size={15} />,
            cls: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
          },
          {
            label: 'Inactivos',
            value: inactivos,
            icon: <UserX size={15} />,
            cls: dm
              ? 'text-slate-500 bg-slate-800/60 border-slate-700/60'
              : 'text-gray-400 bg-gray-100 border-gray-200',
          },
        ].map(({ label, value, icon, cls }) => (
          <div
            key={label}
            className={`rounded-2xl border px-4 py-3 flex items-center gap-3 transition-colors ${cardBg}`}
          >
            <div className={`p-2 rounded-xl border flex-shrink-0 ${cls}`}>{icon}</div>
            <div>
              <p className={`text-[11px] font-medium ${textMuted}`}>{label}</p>
              <p className={`text-xl font-bold leading-tight ${textPrimary}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className={`flex items-center justify-center py-16 ${textMuted}`}>
          <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <span className="ml-3 text-sm">Cargando repartidores...</span>
        </div>
      )}

      {!loading && repartidores.length === 0 && (
        <div className={`rounded-2xl border p-12 text-center ${cardBg}`}>
          <div
            className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
              dm ? 'bg-slate-800' : 'bg-gray-100'
            }`}
          >
            <Bike size={28} className={textMuted} />
          </div>
          <p className={`text-sm font-medium ${textPrimary}`}>Sin repartidores aún</p>
          <p className={`mt-1 text-xs ${textMuted}`}>
            Agrega tu primer repartidor para empezar a gestionar las entregas.
          </p>
          <button
            onClick={onNuevo}
            className="mt-4 rounded-xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors"
          >
            + Agregar repartidor
          </button>
        </div>
      )}

      {!loading && repartidores.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {repartidores.map((rep) => {
            const isInactivo = !rep.Activo
            const isDisponible = rep.Activo && rep.Disponible

            const status = isInactivo
              ? {
                  label: 'Inactivo',
                  cls:
                    dm ? 'bg-slate-700/50 text-slate-400' : 'bg-gray-100 text-gray-500',
                  dot: 'bg-gray-400',
                }
              : isDisponible
              ? {
                  label: 'Disponible',
                  cls: 'bg-emerald-500/10 text-emerald-600',
                  dot: 'bg-emerald-500',
                }
              : {
                  label: 'Ocupado',
                  cls: 'bg-amber-500/10 text-amber-600',
                  dot: 'bg-amber-500',
                }

            const avatarClass = isInactivo
              ? dm
                ? 'bg-slate-700 text-slate-400'
                : 'bg-gray-200 text-gray-500'
              : isDisponible
              ? 'bg-emerald-500 text-white'
              : 'bg-amber-500 text-white'

            const initials = rep.Nombre.split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()

            return (
              <div
                key={rep.Id}
                className={`rounded-2xl border flex flex-col overflow-hidden transition-all hover:shadow-md ${cardBg} ${cardBgHover}`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-11 w-11 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold ${avatarClass}`}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${textPrimary}`}>
                        {rep.Nombre}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.cls}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot}`}
                        />
                        {status.label}
                      </span>
                    </div>
                  </div>

                  <div className={`mt-4 space-y-2 text-xs ${textSecondary}`}>
                    <div className="flex items-center gap-2">
                      <Phone size={12} className={`flex-shrink-0 ${textMuted}`} />
                      <span className="truncate">{rep.Telefono}</span>
                    </div>
                    {(rep.Vehiculo || rep.Placa) && (
                      <div className="flex items-center gap-2">
                        <Car size={12} className={`flex-shrink-0 ${textMuted}`} />
                        <span className="truncate">
                          {[rep.Vehiculo, rep.Placa].filter(Boolean).join(' · ')}
                        </span>
                      </div>
                    )}
                    {rep.DocumentoIdentidad && (
                      <div className="flex items-center gap-2">
                        <FileText size={12} className={`flex-shrink-0 ${textMuted}`} />
                        <span className="truncate">{rep.DocumentoIdentidad}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`mt-auto px-5 py-3 border-t flex items-center justify-end gap-2 ${tableBorder}`}
                >
                  <button
                    onClick={() => onEditar(rep)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors ${btnSecondary}`}
                  >
                    <Pencil size={11} />
                    Editar
                  </button>
                  <button
                    onClick={() => onEliminar(rep)}
                    className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-1.5 text-[11px] font-medium text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={11} />
                    Eliminar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


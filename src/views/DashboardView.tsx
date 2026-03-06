import { Package, TrendingUp, Users } from 'lucide-react'
import type { AuthTienda, AuthUser } from '../types'

interface DashboardViewProps {
  user: AuthUser
  tienda: AuthTienda
  ventasCount: number
  productosCount: number
  clientesCount: number
  loading?: boolean
  dm: boolean
  textPrimary: string
  textSecondary: string
  textMuted: string
  cardBg: string
  cardBgHover: string
}

export function DashboardView({
  user,
  tienda,
  ventasCount,
  productosCount,
  clientesCount,
  loading = false,
  dm,
  textPrimary,
  textSecondary,
  textMuted,
  cardBg,
  cardBgHover,
}: DashboardViewProps) {
  const ventasHoy = ventasCount
  const productosActivos = productosCount
  const totalClientes = clientesCount

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-500">
            Panel principal
          </p>
          <h1 className={`mt-1 text-3xl font-bold ${textPrimary}`}>
            Hola, {user.nombre.split(' ')[0] ?? user.nombre}
          </h1>
          <p className={`mt-2 text-base ${textSecondary}`}>
            Bienvenido al panel de administración de{' '}
            <span className={dm ? 'text-slate-200' : 'text-gray-800'}>
              {tienda.nombreComercial}
            </span>
            .
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <span className={`ml-3 text-sm ${textMuted}`}>Cargando resumen...</span>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                label: 'Ventas de hoy',
                value: ventasHoy > 0 ? String(ventasHoy) : '$0',
                sub: ventasHoy > 0 ? `${ventasHoy} transacciones` : 'Sin transacciones aún',
                icon: <TrendingUp size={20} />,
                color: 'emerald',
              },
              {
                label: 'Productos activos',
                value: String(productosActivos),
                sub: productosActivos > 0 ? 'En catálogo' : 'Sin inventario aún',
                icon: <Package size={20} />,
                color: 'blue',
              },
              {
                label: 'Clientes',
                value: String(totalClientes),
                sub: totalClientes > 0 ? 'Registrados' : 'Sin registros aún',
                icon: <Users size={20} />,
                color: 'violet',
              },
            ].map(({ label, value, sub, icon, color }) => (
              <div
                key={label}
                className={`rounded-2xl border p-5 flex items-start gap-4 transition-colors ${cardBg} ${cardBgHover}`}
              >
                <div
                  className={`p-3 rounded-xl flex-shrink-0 border ${
                    color === 'emerald'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                      : color === 'blue'
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                        : 'bg-violet-500/10 border-violet-500/20 text-violet-500'
                  }`}
                >
                  {icon}
                </div>
                <div>
                  <p className={`text-sm font-bold ${textSecondary}`}>{label}</p>
                  <p className={`mt-1 text-3xl font-extrabold ${textPrimary}`}>{value}</p>
                  <p className={`mt-1 text-sm ${textMuted}`}>{sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={`rounded-2xl border p-6 ${cardBg}`}>
            <h3 className={`text-base font-bold ${textPrimary}`}>Resumen general</h3>
            <p className={`mt-3 text-base leading-relaxed ${textSecondary}`}>
              Desde aquí puedes acceder a ventas, productos, clientes y repartidores usando el
              menú lateral.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

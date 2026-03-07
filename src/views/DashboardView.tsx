import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Package,
  TrendingUp,
  Users,
  Wallet,
  ShoppingBag,
  AlertTriangle,
  Tag,
  Receipt,
  CalendarDays,
} from 'lucide-react'
import type {
  AuthTienda,
  AuthUser,
  VentaResumen,
  Producto,
  ApartadoResumen,
  PromocionResumen,
} from '../types'
import type { TopProducto } from '../hooks/useTopProductos'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function getDateKey(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getLast7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
    )
  }
  return days
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']

interface DashboardViewProps {
  user: AuthUser
  tienda: AuthTienda
  ventas: VentaResumen[]
  productos: Producto[]
  clientesCount: number
  apartados: ApartadoResumen[]
  promociones: PromocionResumen[]
  topProductos: TopProducto[]
  topProductosLoading?: boolean
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
  ventas,
  productos,
  clientesCount,
  apartados,
  promociones,
  topProductos,
  topProductosLoading = false,
  loading = false,
  dm,
  textPrimary,
  textSecondary,
  textMuted,
  cardBg,
  cardBgHover,
}: DashboardViewProps) {
  const todayKey = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [])

  const now = useMemo(() => new Date(), [])
  const ventasHoy = useMemo(
    () => ventas.filter((v) => getDateKey(v.Fecha) === todayKey),
    [ventas, todayKey],
  )
  const ingresosHoy = useMemo(
    () => ventasHoy.reduce((sum, v) => sum + (v.Total ?? 0), 0),
    [ventasHoy],
  )

  const ventasMes = useMemo(() => {
    const mes = now.getMonth()
    const año = now.getFullYear()
    return ventas.filter((v) => {
      const d = new Date(v.Fecha)
      return d.getMonth() === mes && d.getFullYear() === año
    })
  }, [ventas, now])
  const ingresosMes = useMemo(
    () => ventasMes.reduce((sum, v) => sum + (v.Total ?? 0), 0),
    [ventasMes],
  )
  const ticketPromedioMes =
    ventasMes.length > 0 ? ingresosMes / ventasMes.length : 0

  const ingresosSemana = useMemo(() => {
    const last7 = getLast7Days()
    return ventas
      .filter((v) => last7.includes(getDateKey(v.Fecha)))
      .reduce((sum, v) => sum + (v.Total ?? 0), 0)
  }, [ventas])

  const ventasMesAnterior = useMemo(() => {
    const prev = new Date(now.getFullYear(), now.getMonth() - 1)
    return ventas.filter((v) => {
      const d = new Date(v.Fecha)
      return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear()
    })
  }, [ventas, now])
  const ingresosMesAnterior = ventasMesAnterior.reduce(
    (sum, v) => sum + (v.Total ?? 0),
    0,
  )
  const variacionMes =
    ingresosMesAnterior > 0
      ? ((ingresosMes - ingresosMesAnterior) / ingresosMesAnterior) * 100
      : ingresosMes > 0
        ? 100
        : 0
  const diferenciaIngresos = ingresosMes - ingresosMesAnterior

  const nombreMesActual = now.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
  const mesAnteriorDate = new Date(now.getFullYear(), now.getMonth() - 1)
  const nombreMesAnterior = mesAnteriorDate.toLocaleDateString('es-CO', {
    month: 'long',
    year: 'numeric',
  })

  const productosStockBajo = useMemo(
    () => productos.filter((p) => p.StockActual > 0 && p.StockActual <= 5).length,
    [productos],
  )
  const productosSinStock = useMemo(
    () => productos.filter((p) => p.StockActual <= 0).length,
    [productos],
  )

  const promocionesActivas = useMemo(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    return promociones.filter((p) => {
      if (!p.Activo) return false
      const inicio = new Date(p.FechaInicio)
      const fin = new Date(p.FechaFin)
      inicio.setHours(0, 0, 0, 0)
      fin.setHours(23, 59, 59, 999)
      return hoy >= inicio && hoy <= fin
    }).length
  }, [promociones])

  const apartadosPendientes = apartados.filter((a) => a.Estado === 'Pendiente').length
  const apartadosPorVencer = useMemo(() => {
    const en7Dias = new Date()
    en7Dias.setDate(en7Dias.getDate() + 7)
    return apartados.filter((a) => {
      if (a.Estado !== 'Pendiente') return false
      const venc = new Date(a.FechaVencimiento)
      return venc <= en7Dias && venc >= new Date()
    }).length
  }, [apartados])

  const chartData = useMemo(() => {
    const last7 = getLast7Days()
    const byDay = new Map<string, { total: number; count: number }>()
    for (const day of last7) {
      byDay.set(day, { total: 0, count: 0 })
    }
    for (const v of ventas) {
      const key = getDateKey(v.Fecha)
      if (byDay.has(key)) {
        const curr = byDay.get(key)!
        curr.total += v.Total ?? 0
        curr.count += 1
        byDay.set(key, curr)
      }
    }
    return last7.map((day) => {
      const { total, count } = byDay.get(day) ?? { total: 0, count: 0 }
      const d = new Date(day)
      const label = d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' })
      return { fecha: day, label, ventas: count, ingresos: total }
    })
  }, [ventas])

  const ventasPorMetodoPago = useMemo(() => {
    const map = new Map<string, number>()
    for (const v of ventasMes) {
      const metodo = v.MetodoPago || 'Sin especificar'
      map.set(metodo, (map.get(metodo) ?? 0) + (v.Total ?? 0))
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [ventasMes])

  const ultimasVentas = useMemo(
    () =>
      [...ventas]
        .sort((a, b) => new Date(b.Fecha).getTime() - new Date(a.Fecha).getTime())
        .slice(0, 5),
    [ventas],
  )

  const metrics = [
    {
      label: 'Ventas hoy',
      value: ventasHoy.length > 0 ? formatCurrency(ingresosHoy) : '0',
      sub:
        ventasHoy.length > 0
          ? `${ventasHoy.length} transacciones`
          : 'Sin transacciones aún',
      icon: <TrendingUp size={20} />,
      color: 'emerald',
    },
    {
      label: 'Ingresos del mes',
      value: formatCurrency(ingresosMes),
      sub:
        variacionMes !== 0
          ? `${variacionMes >= 0 ? '+' : ''}${variacionMes.toFixed(1)}% vs mes ant.`
          : ventasMes.length > 0
            ? 'Acumulado'
            : 'Sin ventas aún',
      icon: <Wallet size={20} />,
      color: 'blue',
    },
    {
      label: 'Ticket promedio',
      value: ticketPromedioMes > 0 ? formatCurrency(ticketPromedioMes) : '—',
      sub: ventasMes.length > 0 ? `${ventasMes.length} ventas en el mes` : 'Sin ventas aún',
      icon: <Receipt size={20} />,
      color: 'cyan',
    },
    {
      label: 'Productos activos',
      value: String(productos.length),
      sub: productos.length > 0 ? 'En catálogo' : 'Sin inventario aún',
      icon: <Package size={20} />,
      color: 'violet',
    },
    {
      label: 'Stock bajo (≤5)',
      value: String(productosStockBajo),
      sub: productosStockBajo > 0 ? 'Requieren atención' : 'Todo en orden',
      icon: <AlertTriangle size={20} />,
      color: productosStockBajo > 0 ? 'amber' : 'slate',
    },
    {
      label: 'Sin stock',
      value: String(productosSinStock),
      sub: productosSinStock > 0 ? 'Productos agotados' : 'Ninguno',
      icon: <AlertTriangle size={20} />,
      color: productosSinStock > 0 ? 'red' : 'slate',
    },
    {
      label: 'Clientes',
      value: String(clientesCount),
      sub: clientesCount > 0 ? 'Registrados' : 'Sin registros aún',
      icon: <Users size={20} />,
      color: 'indigo',
    },
    {
      label: 'Apartados pendientes',
      value: String(apartadosPendientes),
      sub: apartadosPorVencer > 0 ? `${apartadosPorVencer} por vencer` : 'Ninguno',
      icon: <ShoppingBag size={20} />,
      color: 'amber',
    },
    {
      label: 'Promociones activas',
      value: String(promocionesActivas),
      sub: promocionesActivas > 0 ? 'Vigentes' : 'Ninguna',
      icon: <Tag size={20} />,
      color: 'rose',
    },
    {
      label: 'Ingresos 7 días',
      value: formatCurrency(ingresosSemana),
      sub: 'Última semana',
      icon: <CalendarDays size={20} />,
      color: 'teal',
    },
  ]

  const tooltipStyle = {
    backgroundColor: dm ? '#1e293b' : '#fff',
    border: dm ? '1px solid #334155' : '1px solid #e5e7eb',
    borderRadius: '8px',
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-emerald-500">
            Panel principal
          </p>
          <h1 className={`mt-1 text-2xl sm:text-3xl font-bold truncate ${textPrimary}`}>
            Hola, {user.nombre.split(' ')[0] ?? user.nombre}
          </h1>
          <p className={`mt-2 text-sm sm:text-base ${textSecondary} break-words`}>
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
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {metrics.map(({ label, value, sub, icon, color }) => (
              <div
                key={label}
                className={`rounded-xl sm:rounded-2xl border p-4 sm:p-5 flex items-start gap-3 sm:gap-4 transition-colors ${cardBg} ${cardBgHover}`}
              >
                <div
                  className={`p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0 border ${
                    color === 'emerald'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                      : color === 'blue'
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                        : color === 'violet'
                          ? 'bg-violet-500/10 border-violet-500/20 text-violet-500'
                          : color === 'indigo'
                            ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
                            : color === 'amber'
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                              : color === 'red'
                                ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                : color === 'cyan'
                                  ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500'
                                  : color === 'rose'
                                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                                    : color === 'teal'
                                      ? 'bg-teal-500/10 border-teal-500/20 text-teal-500'
                                      : 'bg-slate-500/10 border-slate-500/20 text-slate-500'
                  }`}
                >
                  {icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs sm:text-sm font-bold ${textSecondary}`}>{label}</p>
                  <p className={`mt-1 text-lg sm:text-xl font-extrabold truncate ${textPrimary}`}>
                    {value}
                  </p>
                  <p className={`mt-1 text-xs ${textMuted} line-clamp-2`}>{sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={`rounded-xl sm:rounded-2xl border p-4 sm:p-6 ${cardBg}`}>
            <h3 className={`text-sm sm:text-base font-bold ${textPrimary}`}>
              Comparación mes actual vs mes anterior
            </h3>
            <p className={`mt-1 text-xs sm:text-sm ${textMuted}`}>
              Ingresos generados y diferencia
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div
                className={`rounded-lg sm:rounded-xl border p-3 sm:p-4 ${
                  dm ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
                }`}
              >
                <p className={`text-xs font-semibold uppercase ${textMuted}`}>
                  {nombreMesActual}
                </p>
                <p className={`mt-2 text-xl sm:text-2xl font-bold break-all ${textPrimary}`}>
                  {formatCurrency(ingresosMes)}
                </p>
                <p className={`mt-1 text-sm ${textSecondary}`}>
                  {ventasMes.length} ventas
                </p>
              </div>
              <div
                className={`rounded-lg sm:rounded-xl border p-3 sm:p-4 ${
                  dm ? 'bg-slate-500/5 border-slate-500/20' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <p className={`text-xs font-semibold uppercase ${textMuted}`}>
                  {nombreMesAnterior}
                </p>
                <p className={`mt-2 text-xl sm:text-2xl font-bold break-all ${textPrimary}`}>
                  {formatCurrency(ingresosMesAnterior)}
                </p>
                <p className={`mt-1 text-sm ${textSecondary}`}>
                  {ventasMesAnterior.length} ventas
                </p>
              </div>
              <div
                className={`rounded-lg sm:rounded-xl border p-3 sm:p-4 ${
                  diferenciaIngresos >= 0
                    ? dm
                      ? 'bg-emerald-500/10 border-emerald-500/20'
                      : 'bg-emerald-50 border-emerald-200'
                    : dm
                      ? 'bg-red-500/10 border-red-500/20'
                      : 'bg-red-50 border-red-200'
                }`}
              >
                <p className={`text-xs font-semibold uppercase ${textMuted}`}>
                  Diferencia
                </p>
                <p
                  className={`mt-2 text-xl sm:text-2xl font-bold break-all ${
                    diferenciaIngresos >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {diferenciaIngresos >= 0 ? '+' : ''}
                  {formatCurrency(diferenciaIngresos)}
                </p>
                <p
                  className={`mt-1 text-sm font-semibold ${
                    diferenciaIngresos >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {variacionMes >= 0 ? '+' : ''}
                  {variacionMes.toFixed(1)}% vs mes anterior
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            <div className={`rounded-xl sm:rounded-2xl border p-4 sm:p-6 min-w-0 ${cardBg}`}>
              <h3 className={`text-sm sm:text-base font-bold ${textPrimary}`}>
                Ventas últimos 7 días
              </h3>
              <p className={`mt-1 text-xs sm:text-sm ${textMuted}`}>
                Ingresos por día
              </p>
              <div className="mt-4 w-full min-h-[200px] sm:min-h-[256px]">
                <ResponsiveContainer width="100%" height={200} minWidth={0}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={dm ? '#334155' : '#e5e7eb'}
                    />
                    <XAxis
                      dataKey="label"
                      stroke={dm ? '#94a3b8' : '#6b7280'}
                      fontSize={12}
                    />
                    <YAxis
                      stroke={dm ? '#94a3b8' : '#6b7280'}
                      fontSize={12}
                      tickFormatter={(v) =>
                        v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelStyle={{ color: dm ? '#e2e8f0' : '#1f2937' }}
                      formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Ingresos']}
                      labelFormatter={(label) => `Día: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="ingresos"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#colorIngresos)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`rounded-xl sm:rounded-2xl border p-4 sm:p-6 min-w-0 ${cardBg}`}>
              <h3 className={`text-sm sm:text-base font-bold ${textPrimary}`}>
                Ventas por método de pago (este mes)
              </h3>
              <p className={`mt-1 text-xs sm:text-sm ${textMuted}`}>
                Distribución de ingresos
              </p>
              <div className="mt-4 w-full min-h-[200px] sm:min-h-[256px]">
                {ventasPorMetodoPago.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200} minWidth={0}>
                    <PieChart>
                      <Pie
                        data={ventasPorMetodoPago}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        label={({ name, percent }) =>
                          `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                      >
                        {ventasPorMetodoPago.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Ingresos']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div
                    className={`flex items-center justify-center h-64 text-sm ${textMuted}`}
                  >
                    Sin ventas este mes
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`rounded-xl sm:rounded-2xl border p-4 sm:p-6 ${cardBg}`}>
            <h3 className={`text-sm sm:text-base font-bold ${textPrimary}`}>
              Últimas ventas
            </h3>
            <p className={`mt-1 text-xs sm:text-sm ${textMuted}`}>
              Transacciones más recientes
            </p>
            <div className="mt-4 overflow-x-auto overflow-y-visible -mx-4 sm:mx-0 px-4 sm:px-0 touch-pan-x overscroll-x-contain">
              {ultimasVentas.length > 0 ? (
                <table className="w-full text-xs sm:text-sm min-w-[400px]">
                  <thead>
                    <tr className={`border-b ${dm ? 'border-slate-700' : 'border-gray-200'}`}>
                      <th className={`py-2 text-left font-semibold ${textSecondary}`}>#</th>
                      <th className={`py-2 text-left font-semibold ${textSecondary}`}>Fecha</th>
                      <th className={`py-2 text-left font-semibold ${textSecondary}`}>Cliente</th>
                      <th className={`py-2 text-right font-semibold ${textSecondary}`}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimasVentas.map((v) => (
                      <tr
                        key={v.Id}
                        className={`border-b ${dm ? 'border-slate-800/60' : 'border-gray-100'}`}
                      >
                        <td className={`py-3 ${textPrimary}`}>{v.Id}</td>
                        <td className={`py-3 ${textSecondary}`}>
                          {new Date(v.Fecha).toLocaleDateString('es-CO', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className={`py-3 ${textSecondary}`}>{v.ClienteNombre}</td>
                        <td className={`py-3 text-right font-semibold ${textPrimary}`}>
                          {formatCurrency(v.Total ?? 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className={`py-8 text-center text-sm ${textMuted}`}>
                  No hay ventas registradas
                </p>
              )}
            </div>
          </div>

          <div className={`rounded-xl sm:rounded-2xl border p-4 sm:p-6 ${cardBg}`}>
            <h3 className={`text-sm sm:text-base font-bold ${textPrimary}`}>
              Top productos más vendidos
            </h3>
            <p className={`mt-1 text-xs sm:text-sm ${textMuted}`}>
              Productos con mayor cantidad vendida (histórico)
            </p>
            <div className="mt-4 overflow-x-auto overflow-y-visible -mx-4 sm:mx-0 px-4 sm:px-0 touch-pan-x overscroll-x-contain">
              {topProductosLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                  <span className={`ml-2 text-sm ${textMuted}`}>Cargando...</span>
                </div>
              ) : topProductos.length > 0 ? (
                <table className="w-full text-xs sm:text-sm min-w-[400px]">
                  <thead>
                    <tr className={`border-b ${dm ? 'border-slate-700' : 'border-gray-200'}`}>
                      <th className={`py-2 text-left font-semibold ${textSecondary}`}>#</th>
                      <th className={`py-2 text-left font-semibold ${textSecondary}`}>Producto</th>
                      <th className={`py-2 text-left font-semibold ${textSecondary}`}>Código</th>
                      <th className={`py-2 text-right font-semibold ${textSecondary}`}>Unidades</th>
                      <th className={`py-2 text-right font-semibold ${textSecondary}`}>Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProductos.map((p, i) => (
                      <tr
                        key={p.Producto_Id}
                        className={`border-b ${dm ? 'border-slate-800/60' : 'border-gray-100'}`}
                      >
                        <td className={`py-3 font-medium ${textPrimary}`}>{i + 1}</td>
                        <td className={`py-3 ${textPrimary}`}>{p.ProductoNombre}</td>
                        <td className={`py-3 ${textSecondary}`}>{p.CodigoInterno}</td>
                        <td className={`py-3 text-right font-semibold ${textPrimary}`}>
                          {p.TotalVendido}
                        </td>
                        <td className={`py-3 text-right font-semibold ${textPrimary}`}>
                          {formatCurrency(p.Ingresos)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className={`py-8 text-center text-sm ${textMuted}`}>
                  No hay datos de ventas aún
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

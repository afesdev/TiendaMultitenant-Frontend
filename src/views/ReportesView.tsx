import { useEffect, useState } from 'react'
import { Bookmark, TrendingUp, Download, RefreshCw, AlertTriangle } from 'lucide-react'
import type {
  ReporteStockBajoRow,
  ReporteApartadosPorVencerRow,
  ReporteProductosMasVendidosRow,
} from '../hooks/useReportes'

function formatCurrency(n: number): string {
  return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

interface ReportesViewProps {
  dm: boolean
  textPrimary: string
  textSecondary: string
  textMuted: string
  tableBorder: string
  tableHead: string
  tableRow: string
  btnSecondary: string
  stockBajo: ReporteStockBajoRow[]
  apartadosPorVencer: ReporteApartadosPorVencerRow[]
  productosMasVendidos: ReporteProductosMasVendidosRow[]
  loadingStockBajo: boolean
  loadingApartados: boolean
  loadingTop: boolean
  exportingStockBajo: boolean
  exportingApartados: boolean
  exportingTop: boolean
  onCargarStockBajo: (umbral?: number) => Promise<void>
  onCargarApartados: (dias?: number) => Promise<void>
  onCargarTop: (limit?: number) => Promise<void>
  onExportStockBajo: (umbral?: number) => Promise<void>
  onExportApartados: (dias?: number) => Promise<void>
  onExportTop: (limit?: number) => Promise<void>
}

export function ReportesView({
  dm,
  textPrimary,
  textSecondary,
  textMuted,
  tableBorder,
  tableHead,
  tableRow,
  btnSecondary,
  stockBajo,
  apartadosPorVencer,
  productosMasVendidos,
  loadingStockBajo,
  loadingApartados,
  loadingTop,
  exportingStockBajo,
  exportingApartados,
  exportingTop,
  onCargarStockBajo,
  onCargarApartados,
  onCargarTop,
  onExportStockBajo,
  onExportApartados,
  onExportTop,
}: ReportesViewProps) {
  const [umbralStock, setUmbralStock] = useState(5)
  const [diasVencimiento, setDiasVencimiento] = useState(30)
  const [limitTop, setLimitTop] = useState(100)

  useEffect(() => {
    void onCargarStockBajo(umbralStock)
  }, [umbralStock, onCargarStockBajo])

  useEffect(() => {
    void onCargarApartados(diasVencimiento)
  }, [diasVencimiento, onCargarApartados])

  useEffect(() => {
    void onCargarTop(limitTop)
  }, [limitTop, onCargarTop])

  const cardBg = dm ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-200'

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h2 className={`text-xl font-bold ${textPrimary}`}>Reportes</h2>
        <p className={`text-sm ${textSecondary} mt-1`}>
          Inventario con stock bajo, apartados por vencer y productos más vendidos. Exporta a Excel cuando lo necesites.
        </p>
      </div>

      {/* Reporte: Stock bajo */}
      <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
        <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b ${tableBorder} ${dm ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${textPrimary}`}>Inventario con stock bajo</h3>
              <p className={`text-xs ${textMuted}`}>Productos con stock ≤ umbral</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <label className={`text-xs ${textSecondary}`}>Umbral:</label>
            <select
              value={umbralStock}
              onChange={(e) => setUmbralStock(Number(e.target.value))}
              className={`rounded-lg border px-2 py-1.5 text-xs ${dm ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-gray-200 bg-white text-gray-900'}`}
            >
              {[3, 5, 10, 15, 20].map((n) => (
                <option key={n} value={n}>{n} unidades</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void onCargarStockBajo(umbralStock)}
              disabled={loadingStockBajo}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold ${btnSecondary}`}
            >
              <RefreshCw size={12} className={loadingStockBajo ? 'animate-spin' : ''} />
              Actualizar
            </button>
            <button
              type="button"
              onClick={() => void onExportStockBajo(umbralStock)}
              disabled={exportingStockBajo || loadingStockBajo}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              <Download size={12} className={exportingStockBajo ? 'animate-pulse' : ''} />
              Excel
            </button>
          </div>
        </div>
        <div className="overflow-x-auto touch-pan-x overscroll-x-contain">
          {loadingStockBajo ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              <span className={`ml-2 text-sm ${textMuted}`}>Cargando...</span>
            </div>
          ) : stockBajo.length === 0 ? (
            <p className={`py-8 text-center text-sm ${textMuted}`}>No hay productos con stock bajo para el umbral seleccionado.</p>
          ) : (
            <table className="w-full text-xs sm:text-sm min-w-[500px]">
              <thead>
                <tr className={tableHead}>
                  <th className={`px-4 py-2.5 text-left font-semibold ${textMuted}`}>ID</th>
                  <th className={`px-4 py-2.5 text-left font-semibold ${textMuted}`}>Producto</th>
                  <th className={`px-4 py-2.5 text-left font-semibold ${textMuted}`}>Código</th>
                  <th className={`px-4 py-2.5 text-center font-semibold ${textMuted}`}>Stock</th>
                  <th className={`px-4 py-2.5 text-left font-semibold ${textMuted}`}>Categoría</th>
                  <th className={`px-4 py-2.5 text-left font-semibold ${textMuted}`}>Proveedor</th>
                </tr>
              </thead>
              <tbody className={tableRow}>
                {stockBajo.map((r) => (
                  <tr key={r.Id} className={`border-b ${tableBorder}`}>
                    <td className={`px-4 py-3 ${textSecondary}`}>{r.Id}</td>
                    <td className={`px-4 py-3 font-medium ${textPrimary}`}>{r.Nombre}</td>
                    <td className={`px-4 py-3 ${textSecondary}`}>{r.CodigoInterno}</td>
                    <td className={`px-4 py-3 text-center font-bold ${r.StockActual === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                      {r.StockActual ?? 0}
                    </td>
                    <td className={`px-4 py-3 ${textSecondary}`}>{r.CategoriaNombre ?? '—'}</td>
                    <td className={`px-4 py-3 ${textSecondary}`}>{r.ProveedorNombre ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Reporte: Apartados por vencer */}
      <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
        <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b ${tableBorder} ${dm ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
              <Bookmark size={18} />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${textPrimary}`}>Apartados por vencer</h3>
              <p className={`text-xs ${textMuted}`}>Pendientes que vencen en los próximos N días</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <label className={`text-xs ${textSecondary}`}>Próximos:</label>
            <select
              value={diasVencimiento}
              onChange={(e) => setDiasVencimiento(Number(e.target.value))}
              className={`rounded-lg border px-2 py-1.5 text-xs ${dm ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-gray-200 bg-white text-gray-900'}`}
            >
              {[7, 15, 30, 60, 90].map((n) => (
                <option key={n} value={n}>{n} días</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void onCargarApartados(diasVencimiento)}
              disabled={loadingApartados}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold ${btnSecondary}`}
            >
              <RefreshCw size={12} className={loadingApartados ? 'animate-spin' : ''} />
              Actualizar
            </button>
            <button
              type="button"
              onClick={() => void onExportApartados(diasVencimiento)}
              disabled={exportingApartados || loadingApartados}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              <Download size={12} className={exportingApartados ? 'animate-pulse' : ''} />
              Excel
            </button>
          </div>
        </div>
        <div className="overflow-x-auto touch-pan-x overscroll-x-contain">
          {loadingApartados ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              <span className={`ml-2 text-sm ${textMuted}`}>Cargando...</span>
            </div>
          ) : apartadosPorVencer.length === 0 ? (
            <p className={`py-8 text-center text-sm ${textMuted}`}>No hay apartados pendientes por vencer en el período seleccionado.</p>
          ) : (
            <table className="w-full text-xs sm:text-sm min-w-[500px]">
              <thead>
                <tr className={tableHead}>
                  <th className={`px-4 py-2.5 text-left font-semibold ${textMuted}`}>ID</th>
                  <th className={`px-4 py-2.5 text-left font-semibold ${textMuted}`}>Cliente</th>
                  <th className={`px-4 py-2.5 text-left font-semibold ${textMuted}`}>Vencimiento</th>
                  <th className={`px-4 py-2.5 text-right font-semibold ${textMuted}`}>Total</th>
                  <th className={`px-4 py-2.5 text-right font-semibold ${textMuted}`}>Abonado</th>
                  <th className={`px-4 py-2.5 text-right font-semibold ${textMuted}`}>Saldo</th>
                </tr>
              </thead>
              <tbody className={tableRow}>
                {apartadosPorVencer.map((r) => (
                  <tr key={r.Id} className={`border-b ${tableBorder}`}>
                    <td className={`px-4 py-3 ${textSecondary}`}>{r.Id}</td>
                    <td className={`px-4 py-3 font-medium ${textPrimary}`}>{r.ClienteNombre}</td>
                    <td className={`px-4 py-3 ${textSecondary}`}>
                      {new Date(r.FechaVencimiento).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className={`px-4 py-3 text-right ${textPrimary}`}>{formatCurrency(r.Total)}</td>
                    <td className={`px-4 py-3 text-right ${textSecondary}`}>{formatCurrency(r.Abonado)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${textPrimary}`}>{formatCurrency(r.Saldo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Reporte: Productos más vendidos */}
      <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
        <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b ${tableBorder} ${dm ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${textPrimary}`}>Productos más vendidos</h3>
              <p className={`text-xs ${textMuted}`}>Por cantidad vendida (histórico)</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <label className={`text-xs ${textSecondary}`}>Top:</label>
            <select
              value={limitTop}
              onChange={(e) => setLimitTop(Number(e.target.value))}
              className={`rounded-lg border px-2 py-1.5 text-xs ${dm ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-gray-200 bg-white text-gray-900'}`}
            >
              {[50, 100, 200, 500].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void onCargarTop(limitTop)}
              disabled={loadingTop}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold ${btnSecondary}`}
            >
              <RefreshCw size={12} className={loadingTop ? 'animate-spin' : ''} />
              Actualizar
            </button>
            <button
              type="button"
              onClick={() => void onExportTop(limitTop)}
              disabled={exportingTop || loadingTop}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              <Download size={12} className={exportingTop ? 'animate-pulse' : ''} />
              Excel
            </button>
          </div>
        </div>
        <div className="overflow-x-auto touch-pan-x overscroll-x-contain">
          {loadingTop ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              <span className={`ml-2 text-sm ${textMuted}`}>Cargando...</span>
            </div>
          ) : productosMasVendidos.length === 0 ? (
            <p className={`py-8 text-center text-sm ${textMuted}`}>No hay datos de ventas aún.</p>
          ) : (
            <table className="w-full text-xs sm:text-sm min-w-[500px]">
              <thead>
                <tr className={tableHead}>
                  <th className={`px-4 py-2.5 text-left font-semibold ${textMuted}`}>#</th>
                  <th className={`px-4 py-2.5 text-left font-semibold ${textMuted}`}>Producto</th>
                  <th className={`px-4 py-2.5 text-left font-semibold ${textMuted}`}>Código</th>
                  <th className={`px-4 py-2.5 text-right font-semibold ${textMuted}`}>Unidades</th>
                  <th className={`px-4 py-2.5 text-right font-semibold ${textMuted}`}>Ingresos</th>
                </tr>
              </thead>
              <tbody className={tableRow}>
                {productosMasVendidos.map((r, i) => (
                  <tr key={r.Producto_Id} className={`border-b ${tableBorder}`}>
                    <td className={`px-4 py-3 ${textSecondary}`}>{i + 1}</td>
                    <td className={`px-4 py-3 font-medium ${textPrimary}`}>{r.ProductoNombre}</td>
                    <td className={`px-4 py-3 ${textSecondary}`}>{r.CodigoInterno}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${textPrimary}`}>{r.TotalVendido}</td>
                    <td className={`px-4 py-3 text-right ${textPrimary}`}>{formatCurrency(r.Ingresos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

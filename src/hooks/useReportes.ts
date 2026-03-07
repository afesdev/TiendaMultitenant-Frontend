import { useCallback, useState } from 'react'
import { API_BASE_URL } from '../config'

export interface ReporteStockBajoRow {
  Id: number
  Nombre: string
  CodigoInterno: string
  CodigoBarras: string | null
  StockActual: number | null
  CategoriaNombre: string | null
  ProveedorNombre: string | null
}

export interface ReporteApartadosPorVencerRow {
  Id: number
  FechaCreacion: string
  FechaVencimiento: string
  Total: number
  Abonado: number
  Saldo: number
  Estado: string
  ClienteNombre: string
  ClienteCedula: string
  ClienteCelular: string | null
}

export interface ReporteProductosMasVendidosRow {
  Producto_Id: number
  ProductoNombre: string
  CodigoInterno: string
  TotalVendido: number
  Ingresos: number
}

export function useReportes(token: string) {
  const [stockBajo, setStockBajo] = useState<ReporteStockBajoRow[]>([])
  const [apartadosPorVencer, setApartadosPorVencer] = useState<ReporteApartadosPorVencerRow[]>([])
  const [productosMasVendidos, setProductosMasVendidos] = useState<ReporteProductosMasVendidosRow[]>([])
  const [loadingStockBajo, setLoadingStockBajo] = useState(false)
  const [loadingApartados, setLoadingApartados] = useState(false)
  const [loadingTop, setLoadingTop] = useState(false)
  const [exportingStockBajo, setExportingStockBajo] = useState(false)
  const [exportingApartados, setExportingApartados] = useState(false)
  const [exportingTop, setExportingTop] = useState(false)

  const cargarStockBajo = useCallback(
    async (umbral = 5) => {
      setLoadingStockBajo(true)
      try {
        const res = await fetch(
          `${API_BASE_URL}/reportes/stock-bajo?umbral=${umbral}`,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        if (!res.ok) throw new Error('Error al cargar reporte')
        const data = (await res.json()) as ReporteStockBajoRow[]
        setStockBajo(Array.isArray(data) ? data : [])
      } catch {
        setStockBajo([])
      } finally {
        setLoadingStockBajo(false)
      }
    },
    [token],
  )

  const cargarApartadosPorVencer = useCallback(
    async (dias = 30) => {
      setLoadingApartados(true)
      try {
        const res = await fetch(
          `${API_BASE_URL}/reportes/apartados-por-vencer?dias=${dias}`,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        if (!res.ok) throw new Error('Error al cargar reporte')
        const data = (await res.json()) as ReporteApartadosPorVencerRow[]
        setApartadosPorVencer(Array.isArray(data) ? data : [])
      } catch {
        setApartadosPorVencer([])
      } finally {
        setLoadingApartados(false)
      }
    },
    [token],
  )

  const cargarProductosMasVendidos = useCallback(
    async (limit = 100) => {
      setLoadingTop(true)
      try {
        const res = await fetch(
          `${API_BASE_URL}/reportes/productos-mas-vendidos?limit=${limit}`,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        if (!res.ok) throw new Error('Error al cargar reporte')
        const data = (await res.json()) as ReporteProductosMasVendidosRow[]
        setProductosMasVendidos(Array.isArray(data) ? data : [])
      } catch {
        setProductosMasVendidos([])
      } finally {
        setLoadingTop(false)
      }
    },
    [token],
  )

  const exportarStockBajoExcel = useCallback(
    async (umbral = 5) => {
      setExportingStockBajo(true)
      try {
        const res = await fetch(
          `${API_BASE_URL}/reportes/stock-bajo/excel?umbral=${umbral}`,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        if (!res.ok) throw new Error('Error al exportar')
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reporte_stock_bajo_${new Date().toISOString().slice(0, 10)}.xlsx`
        a.click()
        URL.revokeObjectURL(url)
      } finally {
        setExportingStockBajo(false)
      }
    },
    [token],
  )

  const exportarApartadosExcel = useCallback(
    async (dias = 30) => {
      setExportingApartados(true)
      try {
        const res = await fetch(
          `${API_BASE_URL}/reportes/apartados-por-vencer/excel?dias=${dias}`,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        if (!res.ok) throw new Error('Error al exportar')
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reporte_apartados_por_vencer_${new Date().toISOString().slice(0, 10)}.xlsx`
        a.click()
        URL.revokeObjectURL(url)
      } finally {
        setExportingApartados(false)
      }
    },
    [token],
  )

  const exportarProductosMasVendidosExcel = useCallback(
    async (limit = 100) => {
      setExportingTop(true)
      try {
        const res = await fetch(
          `${API_BASE_URL}/reportes/productos-mas-vendidos/excel?limit=${limit}`,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        if (!res.ok) throw new Error('Error al exportar')
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reporte_productos_mas_vendidos_${new Date().toISOString().slice(0, 10)}.xlsx`
        a.click()
        URL.revokeObjectURL(url)
      } finally {
        setExportingTop(false)
      }
    },
    [token],
  )

  return {
    stockBajo,
    apartadosPorVencer,
    productosMasVendidos,
    loadingStockBajo,
    loadingApartados,
    loadingTop,
    cargarStockBajo,
    cargarApartadosPorVencer,
    cargarProductosMasVendidos,
    exportarStockBajoExcel,
    exportarApartadosExcel,
    exportarProductosMasVendidosExcel,
    exportingStockBajo,
    exportingApartados,
    exportingTop,
  }
}

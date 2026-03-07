import { useCallback, useState } from 'react'
import { API_BASE_URL } from '../config'

export interface TopProducto {
  Producto_Id: number
  ProductoNombre: string
  CodigoInterno: string
  TotalVendido: number
  Ingresos: number
}

export function useTopProductos(token: string, limit = 10) {
  const [topProductos, setTopProductos] = useState<TopProducto[]>([])
  const [loading, setLoading] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `${API_BASE_URL}/dashboard/top-productos?limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      const data = (await response.json().catch(() => [])) as TopProducto[] | { message?: string }
      if (!response.ok) {
        const msg = typeof data === 'object' && data !== null && 'message' in data ? (data as { message: string }).message : 'Error al cargar top productos'
        console.error('[useTopProductos]', response.status, msg)
        setTopProductos([])
        return
      }
      const arr = (Array.isArray(data) ? data : []) as unknown as Record<string, unknown>[]
      const normalized = arr.map((row) => ({
        Producto_Id: Number(row.Producto_Id ?? row.producto_id ?? 0),
        ProductoNombre: String(row.ProductoNombre ?? row.productoNombre ?? row.productonombre ?? ''),
        CodigoInterno: String(row.CodigoInterno ?? row.codigoInterno ?? row.codigointerno ?? ''),
        TotalVendido: Number(row.TotalVendido ?? row.totalVendido ?? row.totalvendido ?? 0),
        Ingresos: Number(row.Ingresos ?? row.ingresos ?? 0),
      }))
      setTopProductos(normalized)
    } catch (err) {
      console.error('[useTopProductos]', err)
      setTopProductos([])
    } finally {
      setLoading(false)
    }
  }, [token, limit])

  return { topProductos, loading, cargar }
}

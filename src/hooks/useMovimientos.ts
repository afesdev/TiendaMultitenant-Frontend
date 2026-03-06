import { useCallback, useState } from 'react'
import Swal from 'sweetalert2'
import { API_BASE_URL } from '../config'
import type { MovimientoInventario } from '../types'

export function useMovimientos(token: string) {
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([])
  const [loading, setLoading] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/movimientos-inventario`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Error al cargar movimientos de inventario')
      const data = (await response.json()) as MovimientoInventario[]
      setMovimientos(data)
    } catch (err) {
      console.error(err)
      void Swal.fire('Error', 'No se pudieron cargar los movimientos de inventario', 'error')
    } finally {
      setLoading(false)
    }
  }, [token])

  return { movimientos, loading, cargar }
}

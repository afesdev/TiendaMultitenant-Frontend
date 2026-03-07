import { useCallback, useState } from 'react'
import Swal from 'sweetalert2'
import { API_BASE_URL } from '../config'
import type { MovimientoInventario } from '../types'

export interface CrearMovimientoPayload {
  tipoMovimiento: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'DEVOLUCION'
  productoId: number
  varianteId?: number | null
  cantidad: number
  motivo?: string
}

export function useMovimientos(token: string) {
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([])
  const [loading, setLoading] = useState(false)
  const [creando, setCreando] = useState(false)

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

  const crear = useCallback(
    async (payload: CrearMovimientoPayload): Promise<boolean> => {
      setCreando(true)
      try {
        const response = await fetch(`${API_BASE_URL}/movimientos-inventario`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tipoMovimiento: payload.tipoMovimiento,
            productoId: payload.productoId,
            varianteId: payload.varianteId ?? null,
            cantidad: payload.cantidad,
            motivo: payload.motivo || undefined,
          }),
        })
        const data = (await response.json().catch(() => ({}))) as { message?: string; code?: string; stockDisponible?: number } | undefined
        if (!response.ok) {
          const msg = data?.message ?? 'Error al registrar movimiento'
          void Swal.fire('Error', msg, 'error')
          return false
        }
        void Swal.fire('Éxito', data?.message ?? 'Movimiento registrado', 'success')
        await cargar()
        return true
      } catch (err) {
        console.error(err)
        void Swal.fire('Error', 'No se pudo registrar el movimiento', 'error')
        return false
      } finally {
        setCreando(false)
      }
    },
    [token, cargar],
  )

  return { movimientos, loading, cargar, crear, creando }
}

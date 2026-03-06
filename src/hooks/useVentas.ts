import { useCallback, useState } from 'react'
import Swal from 'sweetalert2'
import { API_BASE_URL } from '../config'
import type { NuevaVentaPayload, VentaResumen } from '../types'

export function useVentas(token: string) {
  const [ventas, setVentas] = useState<VentaResumen[]>([])
  const [loading, setLoading] = useState(false)
  const [creando, setCreando] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [detalleOpen, setDetalleOpen] = useState(false)
  const [viendo, setViendo] = useState<VentaResumen | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editando, setEditando] = useState<VentaResumen | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/ventas`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Error al cargar ventas')
      const data = (await response.json()) as VentaResumen[]
      setVentas(data)
    } catch (err) {
      console.error(err)
      void Swal.fire('Error', 'No se pudieron cargar las ventas', 'error')
    } finally {
      setLoading(false)
    }
  }, [token])

  const crear = useCallback(
    async (payload: NuevaVentaPayload) => {
      setCreando(true)
      try {
        const response = await fetch(`${API_BASE_URL}/ventas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        })
        const data = (await response.json().catch(() => ({}))) as { message?: string }
        if (!response.ok) {
          throw new Error(data.message ?? 'Error al registrar la venta')
        }
        void Swal.fire('Venta registrada', 'La venta se registró correctamente.', 'success')
        await cargar()
        setFormOpen(false)
      } catch (err) {
        console.error(err)
        void Swal.fire(
          'Error',
          err instanceof Error ? err.message : 'No se pudo registrar la venta',
          'error',
        )
      } finally {
        setCreando(false)
      }
    },
    [token, cargar],
  )

  const eliminar = useCallback(
    async (v: VentaResumen) => {
      const result = await Swal.fire({
        title: '¿Eliminar venta?',
        text: `Se eliminará la venta #${v.Id} de ${v.ClienteNombre}. Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ef4444',
      })
      if (!result.isConfirmed) return
      try {
        const response = await fetch(`${API_BASE_URL}/ventas/${encodeURIComponent(v.Id)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        const body = (await response.json().catch(() => null)) as { message?: string } | null
        if (!response.ok) {
          const msg =
            body?.message ??
            'No se pudo eliminar la venta. Verifica que no tenga dependencias adicionales.'
          throw new Error(msg)
        }
        void Swal.fire('Venta eliminada', 'La venta se eliminó correctamente.', 'success')
        await cargar()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error inesperado al eliminar venta'
        void Swal.fire('Error', msg, 'error')
      }
    },
    [token, cargar],
  )

  const abrirVer = useCallback((v: VentaResumen) => {
    setViendo(v)
    setDetalleOpen(true)
  }, [])

  const abrirEditar = useCallback((v: VentaResumen) => {
    setEditando(v)
    setEditModalOpen(true)
  }, [])

  return {
    ventas,
    loading,
    creando,
    cargar,
    crear,
    eliminar,
    formOpen,
    setFormOpen,
    detalleOpen,
    setDetalleOpen,
    viendo,
    setViendo,
    editModalOpen,
    setEditModalOpen,
    editando,
    setEditando,
    abrirVer,
    abrirEditar,
  }
}

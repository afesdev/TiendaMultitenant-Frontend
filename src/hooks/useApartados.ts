import { useCallback, useState } from 'react'
import Swal from 'sweetalert2'
import { API_BASE_URL } from '../config'
import type { ApartadoResumen, NuevoApartadoPayload } from '../types'

export function useApartados(token: string) {
  const [apartados, setApartados] = useState<ApartadoResumen[]>([])
  const [loading, setLoading] = useState(false)
  const [creando, setCreando] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [detalleOpen, setDetalleOpen] = useState(false)
  const [viendo, setViendo] = useState<ApartadoResumen | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/apartados`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Error al cargar apartados')
      const data = (await response.json()) as ApartadoResumen[]
      setApartados(data)
    } catch (err) {
      console.error(err)
      void Swal.fire('Error', 'No se pudieron cargar los apartados', 'error')
    } finally {
      setLoading(false)
    }
  }, [token])

  const crear = useCallback(
    async (payload: NuevoApartadoPayload) => {
      setCreando(true)
      try {
        const response = await fetch(`${API_BASE_URL}/apartados`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        })
        const data = (await response.json().catch(() => ({}))) as { message?: string }
        if (!response.ok) {
          throw new Error(data.message ?? 'Error al crear el apartado')
        }
        void Swal.fire('Apartado creado', 'El apartado se creó correctamente.', 'success')
        await cargar()
        setFormOpen(false)
      } catch (err) {
        console.error(err)
        void Swal.fire(
          'Error',
          err instanceof Error ? err.message : 'No se pudo crear el apartado',
          'error',
        )
      } finally {
        setCreando(false)
      }
    },
    [token, cargar],
  )

  const abrirVer = useCallback((a: ApartadoResumen) => {
    setViendo(a)
    setDetalleOpen(true)
  }, [])

  const actualizarEstado = useCallback(
    async (apartado: ApartadoResumen, nuevoEstado: string) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/apartados/${encodeURIComponent(apartado.Id)}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ estado: nuevoEstado }),
          },
        )
        const body = (await response.json().catch(() => null)) as { message?: string } | null
        if (!response.ok) throw new Error(body?.message ?? 'Error al actualizar estado')
        await cargar()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al actualizar estado'
        void Swal.fire('Error', msg, 'error')
      }
    },
    [token, cargar],
  )

  const eliminar = useCallback(
    async (a: ApartadoResumen) => {
      const result = await Swal.fire({
        title: '¿Eliminar apartado?',
        text: `Se eliminará el apartado #${a.Id} de ${a.ClienteNombre}. Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ef4444',
      })
      if (!result.isConfirmed) return
      try {
        const response = await fetch(`${API_BASE_URL}/apartados/${encodeURIComponent(a.Id)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        const body = (await response.json().catch(() => null)) as { message?: string } | null
        if (!response.ok) {
          const msg = body?.message ?? 'No se pudo eliminar el apartado.'
          throw new Error(msg)
        }
        void Swal.fire('Apartado eliminado', 'El apartado se eliminó correctamente.', 'success')
        await cargar()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error inesperado al eliminar apartado'
        void Swal.fire('Error', msg, 'error')
      }
    },
    [token, cargar],
  )

  return {
    apartados,
    loading,
    creando,
    cargar,
    crear,
    actualizarEstado,
    eliminar,
    formOpen,
    setFormOpen,
    detalleOpen,
    setDetalleOpen,
    viendo,
    setViendo,
    abrirVer,
  }
}


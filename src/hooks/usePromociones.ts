import { useCallback, useState } from 'react'
import Swal from 'sweetalert2'
import { API_BASE_URL } from '../config'
import type { NuevaPromocionPayload, PromocionResumen } from '../types'

export function usePromociones(token: string) {
  const [promociones, setPromociones] = useState<PromocionResumen[]>([])
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editando, setEditando] = useState<PromocionResumen | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/promociones`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Error al cargar promociones')
      const data = (await response.json()) as PromocionResumen[]
      setPromociones(data)
    } catch (err) {
      console.error(err)
      void Swal.fire('Error', 'No se pudieron cargar las promociones', 'error')
    } finally {
      setLoading(false)
    }
  }, [token])

  const crear = useCallback(
    async (payload: NuevaPromocionPayload) => {
      setGuardando(true)
      try {
        const url = editando
          ? `${API_BASE_URL}/promociones/${encodeURIComponent(editando.Id)}`
          : `${API_BASE_URL}/promociones`

        const method = editando ? 'PUT' : 'POST'

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        })
        const data = (await response.json().catch(() => ({}))) as { message?: string }
        if (!response.ok) {
          throw new Error(data.message ?? 'Error al guardar la promoción')
        }
        void Swal.fire(
          editando ? 'Promoción actualizada' : 'Promoción creada',
          editando
            ? 'La promoción se actualizó correctamente.'
            : 'La promoción se creó correctamente.',
          'success',
        )
        await cargar()
        setFormOpen(false)
        setEditando(null)
      } catch (err) {
        console.error(err)
        void Swal.fire(
          'Error',
          err instanceof Error ? err.message : 'No se pudo guardar la promoción',
          'error',
        )
      } finally {
        setGuardando(false)
      }
    },
    [token, cargar, editando],
  )

  const eliminar = useCallback(
    async (promo: PromocionResumen) => {
      const result = await Swal.fire({
        title: '¿Eliminar promoción?',
        text: `Se eliminará la promoción "${promo.Nombre}". Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ef4444',
      })
      if (!result.isConfirmed) return

      try {
        const response = await fetch(`${API_BASE_URL}/promociones/${encodeURIComponent(promo.Id)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        const body = (await response.json().catch(() => null)) as { message?: string } | null
        if (!response.ok) {
          const msg = body?.message ?? 'No se pudo eliminar la promoción.'
          throw new Error(msg)
        }
        void Swal.fire('Promoción eliminada', 'La promoción se eliminó correctamente.', 'success')
        await cargar()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error inesperado al eliminar promoción'
        void Swal.fire('Error', msg, 'error')
      }
    },
    [token, cargar],
  )

  const abrirNueva = useCallback(() => {
    setEditando(null)
    setFormOpen(true)
  }, [])

  const abrirEditar = useCallback((p: PromocionResumen) => {
    setEditando(p)
    setFormOpen(true)
  }, [])

  return {
    promociones,
    loading,
    guardando,
    cargar,
    crear,
    eliminar,
    formOpen,
    setFormOpen,
    editando,
    setEditando,
    abrirNueva,
    abrirEditar,
  }
}


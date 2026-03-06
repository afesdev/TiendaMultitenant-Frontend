import { useCallback, useState } from 'react'
import Swal from 'sweetalert2'
import { API_BASE_URL } from '../config'
import type { Cliente } from '../types'

export function useClientes(token: string) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Cliente | null>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/clientes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Error al cargar clientes')
      const data = (await response.json()) as Cliente[]
      setClientes(data)
    } catch (err) {
      console.error(err)
      void Swal.fire('Error', 'No se pudieron cargar los clientes', 'error')
    } finally {
      setLoading(false)
    }
  }, [token])

  const eliminar = useCallback(
    async (c: Cliente) => {
      const result = await Swal.fire({
        title: '¿Eliminar cliente?',
        text: `Se eliminará el cliente ${c.Nombre} (${c.Cedula}). Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ef4444',
      })
      if (!result.isConfirmed) return
      try {
        const response = await fetch(`${API_BASE_URL}/clientes/${encodeURIComponent(c.Id)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        const body = (await response.json().catch(() => null)) as { message?: string } | null
        if (!response.ok) {
          const msg =
            body?.message ??
            'No se pudo eliminar el cliente. Verifica que no tenga ventas asociadas.'
          throw new Error(msg)
        }
        void Swal.fire('Cliente eliminado', 'El cliente se eliminó correctamente.', 'success')
        await cargar()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al eliminar cliente'
        void Swal.fire('Error', msg, 'error')
      }
    },
    [token, cargar],
  )

  return {
    clientes,
    loading,
    cargar,
    eliminar,
    modalOpen,
    setModalOpen,
    editando,
    setEditando,
    importModalOpen,
    setImportModalOpen,
  }
}

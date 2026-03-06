import type { FormEvent } from 'react'
import { useCallback, useState } from 'react'
import Swal from 'sweetalert2'
import { API_BASE_URL } from '../config'
import type { Categoria } from '../types'

export function useCategorias(token: string) {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [nombre, setNombre] = useState('')
  const [visible, setVisible] = useState(true)
  const [padreId, setPadreId] = useState<number | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/categorias`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Error al cargar categorías')
      const data = (await response.json()) as Categoria[]
      setCategorias(data)
    } catch (err) {
      console.error(err)
      void Swal.fire('Error', 'No se pudieron cargar las categorías', 'error')
    } finally {
      setLoading(false)
    }
  }, [token])

  const guardar = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!nombre) {
        void Swal.fire('Nombre requerido', 'Debes ingresar un nombre para la categoría', 'warning')
        return
      }
      try {
        const isEdit = Boolean(editando)
        const url = isEdit
          ? `${API_BASE_URL}/categorias/${editando!.Id}`
          : `${API_BASE_URL}/categorias`
        const method = isEdit ? 'PUT' : 'POST'
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre,
            visible,
            categoriaPadreId: padreId,
          }),
        })
        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error((body as { message?: string })?.message ?? 'Error al guardar la categoría')
        }
        await cargar()
        setModalOpen(false)
        void Swal.fire(
          'Guardado',
          isEdit ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente',
          'success',
        )
      } catch (err) {
        void Swal.fire(
          'Error',
          err instanceof Error ? err.message : 'Error al guardar la categoría',
          'error',
        )
      }
    },
    [token, nombre, visible, padreId, editando, cargar],
  )

  const eliminar = useCallback(
    async (categoria: Categoria) => {
      const result = await Swal.fire({
        title: '¿Eliminar categoría?',
        text: `Se eliminará definitivamente la categoría "${categoria.Nombre}"`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#22c55e',
        cancelButtonColor: '#64748b',
      })
      if (!result.isConfirmed) return
      try {
        const response = await fetch(`${API_BASE_URL}/categorias/${categoria.Id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error((body as { message?: string })?.message ?? 'Error al eliminar la categoría')
        }
        await cargar()
        void Swal.fire('Eliminada', 'La categoría se ha eliminado correctamente', 'success')
      } catch (err) {
        void Swal.fire(
          'Error',
          err instanceof Error ? err.message : 'Error al eliminar la categoría',
          'error',
        )
      }
    },
    [token, cargar],
  )

  const abrirNueva = useCallback(() => {
    setEditando(null)
    setNombre('')
    setVisible(true)
    setPadreId(null)
    setModalOpen(true)
  }, [])

  const abrirEditar = useCallback((c: Categoria) => {
    setEditando(c)
    setNombre(c.Nombre)
    setVisible(c.Visible)
    setPadreId(c.CategoriaPadre_Id)
    setModalOpen(true)
  }, [])

  return {
    categorias,
    loading,
    modalOpen,
    setModalOpen,
    editando,
    nombre,
    setNombre,
    visible,
    setVisible,
    padreId,
    setPadreId,
    cargar,
    guardar,
    eliminar,
    abrirNueva,
    abrirEditar,
  }
}

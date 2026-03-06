import type { FormEvent } from 'react'
import { useCallback, useState } from 'react'
import Swal from 'sweetalert2'
import { API_BASE_URL } from '../config'
import type { Proveedor } from '../types'

export function useProveedores(token: string) {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Proveedor | null>(null)
  const [nombre, setNombre] = useState('')
  const [contacto, setContacto] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [activo, setActivo] = useState(true)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/proveedores`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Error al cargar proveedores')
      const data = (await response.json()) as Proveedor[]
      setProveedores(data)
    } catch (err) {
      console.error(err)
      void Swal.fire('Error', 'No se pudieron cargar los proveedores', 'error')
    } finally {
      setLoading(false)
    }
  }, [token])

  const guardar = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!nombre) {
        void Swal.fire('Nombre requerido', 'Debes ingresar un nombre para el proveedor', 'warning')
        return
      }
      try {
        const isEdit = Boolean(editando)
        const url = isEdit
          ? `${API_BASE_URL}/proveedores/${editando!.Id}`
          : `${API_BASE_URL}/proveedores`
        const method = isEdit ? 'PUT' : 'POST'
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre,
            contacto: contacto || null,
            telefono: telefono || null,
            email: email || null,
            activo,
          }),
        })
        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error((body as { message?: string })?.message ?? 'Error al guardar el proveedor')
        }
        await cargar()
        setModalOpen(false)
        void Swal.fire(
          'Guardado',
          isEdit ? 'Proveedor actualizado correctamente' : 'Proveedor creado correctamente',
          'success',
        )
      } catch (err) {
        void Swal.fire(
          'Error',
          err instanceof Error ? err.message : 'Error al guardar el proveedor',
          'error',
        )
      }
    },
    [token, nombre, contacto, telefono, email, activo, editando, cargar],
  )

  const eliminar = useCallback(
    async (prov: Proveedor) => {
      const result = await Swal.fire({
        title: '¿Eliminar proveedor?',
        text: `Se eliminará definitivamente el proveedor "${prov.Nombre}". Los productos quedarán sin proveedor asignado. Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#22c55e',
        cancelButtonColor: '#64748b',
      })
      if (!result.isConfirmed) return
      try {
        const response = await fetch(`${API_BASE_URL}/proveedores/${prov.Id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error((body as { message?: string })?.message ?? 'Error al eliminar el proveedor')
        }
        await cargar()
        void Swal.fire('Eliminado', 'El proveedor se ha eliminado correctamente', 'success')
      } catch (err) {
        void Swal.fire(
          'Error',
          err instanceof Error ? err.message : 'Error al eliminar el proveedor',
          'error',
        )
      }
    },
    [token, cargar],
  )

  const abrirNueva = useCallback(() => {
    setEditando(null)
    setNombre('')
    setContacto('')
    setTelefono('')
    setEmail('')
    setActivo(true)
    setModalOpen(true)
  }, [])

  const abrirEditar = useCallback((p: Proveedor) => {
    setEditando(p)
    setNombre(p.Nombre)
    setContacto(p.Contacto ?? '')
    setTelefono(p.Telefono ?? '')
    setEmail(p.Email ?? '')
    setActivo(p.Activo)
    setModalOpen(true)
  }, [])

  return {
    proveedores,
    loading,
    modalOpen,
    setModalOpen,
    editando,
    nombre,
    setNombre,
    contacto,
    setContacto,
    telefono,
    setTelefono,
    email,
    setEmail,
    activo,
    setActivo,
    cargar,
    guardar,
    eliminar,
    abrirNueva,
    abrirEditar,
  }
}

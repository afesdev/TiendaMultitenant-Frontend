import type { FormEvent } from 'react'
import { useCallback, useState } from 'react'
import Swal from 'sweetalert2'
import { API_BASE_URL } from '../config'
import type { Repartidor } from '../types'

export function useRepartidores(token: string) {
  const [repartidores, setRepartidores] = useState<Repartidor[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Repartidor | null>(null)
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [documento, setDocumento] = useState('')
  const [vehiculo, setVehiculo] = useState('')
  const [placa, setPlaca] = useState('')
  const [disponible, setDisponible] = useState(true)
  const [activo, setActivo] = useState(true)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/repartidores`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Error al cargar repartidores')
      const data = (await response.json()) as Repartidor[]
      setRepartidores(data)
    } catch (err) {
      console.error(err)
      void Swal.fire('Error', 'No se pudieron cargar los repartidores', 'error')
    } finally {
      setLoading(false)
    }
  }, [token])

  const guardar = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!nombre || !telefono) {
        void Swal.fire(
          'Campos obligatorios',
          'Nombre y teléfono son campos obligatorios',
          'warning',
        )
        return
      }
      try {
        const isEdit = Boolean(editando)
        const url = isEdit
          ? `${API_BASE_URL}/repartidores/${editando!.Id}`
          : `${API_BASE_URL}/repartidores`
        const method = isEdit ? 'PUT' : 'POST'
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre,
            telefono,
            documentoIdentidad: documento || null,
            vehiculo: vehiculo || null,
            placa: placa || null,
            disponible,
            activo,
          }),
        })
        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error((body as { message?: string })?.message ?? 'Error al guardar el repartidor')
        }
        await cargar()
        setModalOpen(false)
        void Swal.fire(
          'Guardado',
          isEdit ? 'Repartidor actualizado correctamente' : 'Repartidor creado correctamente',
          'success',
        )
      } catch (err) {
        void Swal.fire(
          'Error',
          err instanceof Error ? err.message : 'Error al guardar el repartidor',
          'error',
        )
      }
    },
    [token, nombre, telefono, documento, vehiculo, placa, disponible, activo, editando, cargar],
  )

  const eliminar = useCallback(
    async (rep: Repartidor) => {
      const result = await Swal.fire({
        title: '¿Eliminar repartidor?',
        text: `Se eliminará definitivamente el repartidor "${rep.Nombre}"`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#22c55e',
        cancelButtonColor: '#64748b',
      })
      if (!result.isConfirmed) return
      try {
        const response = await fetch(`${API_BASE_URL}/repartidores/${rep.Id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error((body as { message?: string })?.message ?? 'Error al eliminar el repartidor')
        }
        await cargar()
        void Swal.fire('Eliminado', 'El repartidor se ha eliminado correctamente', 'success')
      } catch (err) {
        void Swal.fire(
          'Error',
          err instanceof Error ? err.message : 'Error al eliminar el repartidor',
          'error',
        )
      }
    },
    [token, cargar],
  )

  const abrirNueva = useCallback(() => {
    setEditando(null)
    setNombre('')
    setTelefono('')
    setDocumento('')
    setVehiculo('')
    setPlaca('')
    setDisponible(true)
    setActivo(true)
    setModalOpen(true)
  }, [])

  const abrirEditar = useCallback((r: Repartidor) => {
    setEditando(r)
    setNombre(r.Nombre)
    setTelefono(r.Telefono)
    setDocumento(r.DocumentoIdentidad ?? '')
    setVehiculo(r.Vehiculo ?? '')
    setPlaca(r.Placa ?? '')
    setDisponible(r.Disponible)
    setActivo(r.Activo)
    setModalOpen(true)
  }, [])

  return {
    repartidores,
    loading,
    modalOpen,
    setModalOpen,
    editando,
    nombre,
    setNombre,
    telefono,
    setTelefono,
    documento,
    setDocumento,
    vehiculo,
    setVehiculo,
    placa,
    setPlaca,
    disponible,
    setDisponible,
    activo,
    setActivo,
    cargar,
    guardar,
    eliminar,
    abrirNueva,
    abrirEditar,
  }
}

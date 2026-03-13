import type { FormEvent } from 'react'
import { useCallback, useState } from 'react'
import Swal from 'sweetalert2'
import { API_BASE_URL } from '../config'
import type { Color } from '../types'

export function useColores(token: string) {
  const [colores, setColores] = useState<Color[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Color | null>(null)
  const [nombre, setNombre] = useState('')
  const [codigoHex, setCodigoHex] = useState('')
  const [codigoInterno, setCodigoInterno] = useState('')
  const [activo, setActivo] = useState(true)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/colores`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Error al cargar colores')
      const data = (await res.json()) as Color[]
      setColores(data)
    } catch (err) {
      console.error(err)
      void Swal.fire('Error', 'No se pudieron cargar los colores', 'error')
    } finally {
      setLoading(false)
    }
  }, [token])

  const guardar = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!nombre.trim()) {
        void Swal.fire(
          'Nombre requerido',
          'Debes ingresar un nombre para el color',
          'warning',
        )
        return
      }
      try {
        const isEdit = Boolean(editando)
        const url = isEdit
          ? `${API_BASE_URL}/colores/${encodeURIComponent(editando!.Id)}`
          : `${API_BASE_URL}/colores`
        const method = isEdit ? 'PUT' : 'POST'
        const body = {
          nombre: nombre.trim(),
          codigoHex: codigoHex.trim() || null,
          codigoInterno: codigoInterno.trim() || null,
          activo,
        }
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => null)
          throw new Error(
            (data as { message?: string } | null)?.message ??
              'Error al guardar color',
          )
        }
        await cargar()
        setModalOpen(false)
        void Swal.fire(
          'Guardado',
          isEdit ? 'Color actualizado correctamente' : 'Color creado correctamente',
          'success',
        )
      } catch (err) {
        console.error(err)
        void Swal.fire(
          'Error',
          err instanceof Error ? err.message : 'Error al guardar color',
          'error',
        )
      }
    },
    [token, nombre, codigoHex, codigoInterno, activo, editando, cargar],
  )

  const desactivar = useCallback(
    async (color: Color) => {
      const result = await Swal.fire({
        title: color.Activo ? 'Desactivar color' : 'Eliminar color',
        text: color.Activo
          ? `El color "${color.Nombre}" dejará de estar disponible para nuevas variantes.`
          : `¿Deseas marcar definitivamente como inactivo el color "${color.Nombre}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#22c55e',
        cancelButtonColor: '#64748b',
      })
      if (!result.isConfirmed) return
      try {
        const res = await fetch(
          `${API_BASE_URL}/colores/${encodeURIComponent(color.Id)}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        if (!res.ok) {
          const data = await res.json().catch(() => null)
          throw new Error(
            (data as { message?: string } | null)?.message ??
              'Error al desactivar color',
          )
        }
        await cargar()
        void Swal.fire(
          'Actualizado',
          'El color se ha marcado como inactivo.',
          'success',
        )
      } catch (err) {
        console.error(err)
        void Swal.fire(
          'Error',
          err instanceof Error ? err.message : 'Error al desactivar color',
          'error',
        )
      }
    },
    [token, cargar],
  )

  const abrirNuevo = useCallback(() => {
    setEditando(null)
    setNombre('')
    setCodigoHex('')
    setCodigoInterno('')
    setActivo(true)
    setModalOpen(true)
  }, [])

  const abrirEditar = useCallback((c: Color) => {
    setEditando(c)
    setNombre(c.Nombre)
    setCodigoHex(c.CodigoHex ?? '')
    setCodigoInterno(c.CodigoInterno ?? '')
    setActivo(c.Activo)
    setModalOpen(true)
  }, [])

  return {
    colores,
    loading,
    modalOpen,
    setModalOpen,
    editando,
    nombre,
    setNombre,
    codigoHex,
    setCodigoHex,
    codigoInterno,
    setCodigoInterno,
    activo,
    setActivo,
    cargar,
    guardar,
    desactivar,
    abrirNuevo,
    abrirEditar,
  }
}


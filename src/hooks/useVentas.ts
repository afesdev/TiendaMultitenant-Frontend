import { useCallback, useState } from 'react'
import Swal from 'sweetalert2'
import { API_BASE_URL } from '../config'
import type { NuevaVentaPayload, VentaResumen } from '../types'

export interface UseVentasOptions {
  onStockError?: (productoId: number) => void
}

export function useVentas(token: string, options?: UseVentasOptions) {
  const { onStockError } = options ?? {}
  const [ventas, setVentas] = useState<VentaResumen[]>([])
  const [loading, setLoading] = useState(false)
  const [creando, setCreando] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [detalleOpen, setDetalleOpen] = useState(false)
  const [viendo, setViendo] = useState<VentaResumen | null>(null)

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
        const data = (await response.json().catch(() => ({}))) as {
          message?: string
          code?: string
          productoId?: number
          productoNombre?: string
          varianteDesc?: string | null
          stockDisponible?: number
          cantidadSolicitada?: number
        }
        if (!response.ok) {
          if (data.code === 'STOCK_INSUFICIENTE' && data.productoId != null) {
            const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
            const desc = data.productoNombre
              ? data.varianteDesc
                ? esc(`${data.productoNombre} (${data.varianteDesc})`)
                : esc(data.productoNombre)
              : `Producto #${data.productoId}`
            const result = await Swal.fire({
              icon: 'warning',
              title: 'Stock insuficiente',
              html: `<p class="text-left">No hay suficiente stock para <strong>${desc}</strong>.</p>
                <p class="text-left mt-2 text-sm">Disponible: <strong>${data.stockDisponible ?? 0}</strong> · Solicitado: <strong>${data.cantidadSolicitada ?? 0}</strong></p>
                ${onStockError ? '<p class="text-left mt-2 text-sm text-gray-500">¿Deseas ir a editar el stock de este producto?</p>' : ''}`,
              showCancelButton: !!onStockError,
              confirmButtonText: onStockError ? 'Ir a editar stock' : 'Entendido',
              cancelButtonText: 'Cerrar',
              confirmButtonColor: '#10b981',
            })
            if (result.isConfirmed && onStockError) {
              onStockError(data.productoId)
            }
            return
          }
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
    [token, cargar, onStockError],
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

  const actualizarEstado = useCallback(
    async (venta: VentaResumen, nuevoEstado: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/ventas/${encodeURIComponent(venta.Id)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            estado: nuevoEstado,
            descuentoTotal: venta.DescuentoTotal ?? 0,
          }),
        })
        const body = (await response.json().catch(() => null)) as { message?: string } | null
        if (!response.ok) {
          throw new Error(body?.message ?? 'Error al actualizar estado')
        }
        await cargar()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al actualizar estado'
        void Swal.fire('Error', msg, 'error')
      }
    },
    [token, cargar],
  )

  const exportarExcel = useCallback(
    async (desde?: string, hasta?: string) => {
      try {
        const params = new URLSearchParams()
        if (desde) params.set('desde', desde)
        if (hasta) params.set('hasta', hasta)
        const url = `${API_BASE_URL}/ventas/export/excel${params.toString() ? `?${params}` : ''}`
        const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        if (!response.ok) throw new Error('Error al exportar')
        const blob = await response.blob()
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `ventas_${new Date().toISOString().slice(0, 10)}.xlsx`
        a.click()
        URL.revokeObjectURL(a.href)
        void Swal.fire('Éxito', 'Archivo Excel descargado', 'success')
      } catch (err) {
        void Swal.fire('Error', err instanceof Error ? err.message : 'Error al exportar', 'error')
      }
    },
    [token],
  )

  const exportarPdf = useCallback(
    async (desde?: string, hasta?: string) => {
      try {
        const params = new URLSearchParams()
        if (desde) params.set('desde', desde)
        if (hasta) params.set('hasta', hasta)
        const url = `${API_BASE_URL}/ventas/export/pdf${params.toString() ? `?${params}` : ''}`
        const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        if (!response.ok) throw new Error('Error al exportar')
        const blob = await response.blob()
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `ventas_${new Date().toISOString().slice(0, 10)}.pdf`
        a.click()
        URL.revokeObjectURL(a.href)
        void Swal.fire('Éxito', 'Archivo PDF descargado', 'success')
      } catch (err) {
        void Swal.fire('Error', err instanceof Error ? err.message : 'Error al exportar', 'error')
      }
    },
    [token],
  )

  return {
    ventas,
    loading,
    creando,
    cargar,
    crear,
    eliminar,
    actualizarEstado,
    exportarExcel,
    exportarPdf,
    formOpen,
    setFormOpen,
    detalleOpen,
    setDetalleOpen,
    viendo,
    setViendo,
    abrirVer,
  }
}

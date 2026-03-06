import type { FormEvent } from 'react'
import { useCallback, useState } from 'react'
import Swal from 'sweetalert2'
import { API_BASE_URL } from '../config'
import type { ProductoVariante } from '../types'

export function useVariantes(token: string) {
  const [variantes, setVariantes] = useState<ProductoVariante[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<ProductoVariante | null>(null)
  const [productoId, setProductoId] = useState<number | null>(null)
  const [atributo, setAtributo] = useState<'Talla' | 'Color'>('Talla')
  const [valor, setValor] = useState('')
  const [stock, setStock] = useState(0)
  const [precioAdicional, setPrecioAdicional] = useState(0)
  const [sku, setSku] = useState('')

  const cargar = useCallback(async (): Promise<ProductoVariante[] | null> => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/productos/variantes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Error al cargar variantes')
      const data = (await response.json()) as ProductoVariante[]
      setVariantes(data)
      return data
    } catch (err) {
      console.error(err)
      void Swal.fire('Error', 'No se pudieron cargar las variantes de productos', 'error')
      return null
    } finally {
      setLoading(false)
    }
  }, [token])

  const guardar = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!productoId) {
        void Swal.fire('Producto requerido', 'Debes seleccionar un producto.', 'warning')
        return
      }
      if (!valor.trim()) {
        void Swal.fire('Valor requerido', 'Debes ingresar un valor para la variante.', 'warning')
        return
      }
      try {
        const isEdit = Boolean(editando)
        const url = isEdit
          ? `${API_BASE_URL}/productos/variantes/${encodeURIComponent(editando!.Id)}`
          : `${API_BASE_URL}/productos/variantes`
        const method = isEdit ? 'PUT' : 'POST'
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productoId,
            atributo,
            valor: valor.trim(),
            stockActual: stock,
            precioAdicional,
            codigoSKU: sku || null,
          }),
        })
        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error((body as { message?: string })?.message ?? 'Error al actualizar variante')
        }
        setModalOpen(false)
        void Swal.fire(
          isEdit ? 'Variante actualizada' : 'Variante creada',
          isEdit
            ? 'Los cambios se han guardado correctamente.'
            : 'La variante se ha creado correctamente.',
          'success',
        )
        await cargar()
      } catch (err) {
        void Swal.fire(
          'Error',
          err instanceof Error ? err.message : 'Error al actualizar variante',
          'error',
        )
      }
    },
    [token, productoId, atributo, valor, stock, precioAdicional, sku, editando, cargar],
  )

  const eliminar = useCallback(
    async (v: ProductoVariante) => {
      const result = await Swal.fire({
        title: 'Eliminar variante',
        text: `¿Seguro que deseas eliminar la variante "${v.Atributo}: ${v.Valor}" del producto "${v.ProductoNombre}"? Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ef4444',
      })
      if (!result.isConfirmed) return
      try {
        const response = await fetch(
          `${API_BASE_URL}/productos/variantes/${encodeURIComponent(v.Id)}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error((body as { message?: string })?.message ?? 'Error al eliminar variante')
        }
        void Swal.fire('Variante eliminada', 'La variante se eliminó correctamente.', 'success')
        await cargar()
      } catch (err) {
        void Swal.fire(
          'Error',
          err instanceof Error ? err.message : 'Error al eliminar variante',
          'error',
        )
      }
    },
    [token, cargar],
  )

  const abrirNueva = useCallback(() => {
    setEditando(null)
    setProductoId(null)
    setAtributo('Talla')
    setValor('')
    setStock(0)
    setPrecioAdicional(0)
    setSku('')
    setModalOpen(true)
  }, [])

  const abrirEditar = useCallback((v: ProductoVariante) => {
    setEditando(v)
    setProductoId(v.Producto_Id)
    setAtributo((v.Atributo as 'Talla' | 'Color') ?? 'Talla')
    setValor(v.Valor)
    setStock(v.StockActual)
    setPrecioAdicional(v.PrecioAdicional)
    setSku(v.CodigoSKU ?? '')
    setModalOpen(true)
  }, [])

  return {
    variantes,
    loading,
    cargar,
    modalOpen,
    setModalOpen,
    editando,
    productoId,
    setProductoId,
    atributo,
    setAtributo,
    valor,
    setValor,
    stock,
    setStock,
    precioAdicional,
    setPrecioAdicional,
    sku,
    setSku,
    guardar,
    eliminar,
    abrirNueva,
    abrirEditar,
  }
}

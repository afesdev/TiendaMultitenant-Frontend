import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  Package,
  TrendingUp,
  Users,
  Bike,
  Phone,
  FileText,
  Car,
  UserX,
  CheckCircle2,
  Clock,
  Pencil,
  Trash2,
  FileSpreadsheet,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { Sidebar } from '../components/Sidebar'
import { Navbar } from '../components/Navbar'
import { VarianteModal } from '../components/VarianteModal'
import { API_BASE_URL } from '../config'
import type {
  AuthTienda,
  AuthUser,
  Categoria,
  Producto,
  ProductoImagen,
  ProductoImagenForm,
  ProductoVariante,
  ProductoVarianteForm,
  Proveedor,
  Repartidor,
  VentaResumen,
  NuevaVentaPayload,
  Cliente,
} from '../types'
import { CategoriasView } from '../views/CategoriasView'
import { ProductosView } from '../views/ProductosView'
import { VariantesView } from '../views/VariantesView'
import { ProveedoresView } from '../views/ProveedoresView'
import { ClientesView } from '../views/ClientesView'
import { ProveedorModal } from '../components/ProveedorModal'
import { CategoriaModal } from '../components/CategoriaModal'
import { ProductoFormView } from '../views/ProductoFormView'
import { VentasView } from '../views/VentasView'
import { VentaEditModal } from '../components/VentaEditModal'
import { VentaDetalleView } from '../components/VentaViewModal'
import { VentaFormView } from '../views/VentaFormView'
import { ClienteImportModal } from '../components/ClienteImportModal'
import { ClienteModal } from '../components/ClienteModal'

interface DashboardPageProps {
  token: string
  user: AuthUser
  tienda: AuthTienda
  onLogout: () => void
}

export function DashboardPage({ token, user, tienda, onLogout }: DashboardPageProps) {
  const [activePage, setActivePage] = useState(() => {
    try {
      const saved = localStorage.getItem('activePage')
      return saved || 'dashboard'
    } catch {
      return 'dashboard'
    }
  })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev
      localStorage.setItem('darkMode', String(next))
      return next
    })
  }

  useEffect(() => {
    try {
      localStorage.setItem('activePage', activePage)
    } catch {
      // ignore
    }
  }, [activePage])

  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loadingCategorias, setLoadingCategorias] = useState(false)
  const [categoriaModalOpen, setCategoriaModalOpen] = useState(false)
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null)
  const [catNombre, setCatNombre] = useState('')
  const [catVisible, setCatVisible] = useState(true)
  const [catPadreId, setCatPadreId] = useState<number | null>(null)

  const [productos, setProductos] = useState<Producto[]>([])
  const [loadingProductos, setLoadingProductos] = useState(false)
  const [productoFormOpen, setProductoFormOpen] = useState(false)
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null)
  const [prodNombre, setProdNombre] = useState('')
  const [prodCodigoInterno, setProdCodigoInterno] = useState('')
  const [prodCodigoBarras, setProdCodigoBarras] = useState('')
  const [prodCategoriaId, setProdCategoriaId] = useState<number | null>(null)
  const [prodProveedorId, setProdProveedorId] = useState<number | null>(null)
  const [prodDescripcion, setProdDescripcion] = useState('')
  const [prodCosto, setProdCosto] = useState(0)
  const [prodPrecioDetal, setProdPrecioDetal] = useState(0)
  const [prodPrecioMayor, setProdPrecioMayor] = useState<number | null>(null)
  const [prodStockActual, setProdStockActual] = useState(0)
  const [prodVisible, setProdVisible] = useState(true)
  const [prodImagenes, setProdImagenes] = useState<ProductoImagenForm[]>([])
  const [prodVariantes, setProdVariantes] = useState<ProductoVarianteForm[]>([])
  const [removedVarianteIds, setRemovedVarianteIds] = useState<number[]>([])
  const hasUserEditedSkuRef = useRef(false)

  const [productoImportModalOpen, setProductoImportModalOpen] = useState(false)
  const [productoImportText, setProductoImportText] = useState('')
  const [productoImportFile, setProductoImportFile] = useState<File | null>(null)

  const [clienteImportModalOpen, setClienteImportModalOpen] = useState(false)
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null)
  const [clienteModalOpen, setClienteModalOpen] = useState(false)

  const [repartidores, setRepartidores] = useState<Repartidor[]>([])
  const [loadingRepartidores, setLoadingRepartidores] = useState(false)
  const [repartidorModalOpen, setRepartidorModalOpen] = useState(false)
  const [repartidorEditando, setRepartidorEditando] = useState<Repartidor | null>(null)
  const [repNombre, setRepNombre] = useState('')
  const [repTelefono, setRepTelefono] = useState('')
  const [repDocumento, setRepDocumento] = useState('')
  const [repVehiculo, setRepVehiculo] = useState('')
  const [repPlaca, setRepPlaca] = useState('')
  const [repDisponible, setRepDisponible] = useState(true)
  const [repActivo, setRepActivo] = useState(true)

  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loadingProveedores, setLoadingProveedores] = useState(false)
  const [proveedorModalOpen, setProveedorModalOpen] = useState(false)
  const [proveedorEditando, setProveedorEditando] = useState<Proveedor | null>(null)
  const [provNombre, setProvNombre] = useState('')
  const [provContacto, setProvContacto] = useState('')
  const [provTelefono, setProvTelefono] = useState('')
  const [provEmail, setProvEmail] = useState('')
  const [provActivo, setProvActivo] = useState(true)

  const [variantes, setVariantes] = useState<ProductoVariante[]>([])
  const [loadingVariantes, setLoadingVariantes] = useState(false)
  const [varianteModalOpen, setVarianteModalOpen] = useState(false)
  const [varianteEditando, setVarianteEditando] = useState<ProductoVariante | null>(null)
  const [varProductoId, setVarProductoId] = useState<number | null>(null)
  const [varAtributo, setVarAtributo] = useState<'Talla' | 'Color'>('Talla')
  const [varValor, setVarValor] = useState('')
  const [varStock, setVarStock] = useState(0)
  const [varPrecioAdicional, setVarPrecioAdicional] = useState(0)
  const [varSku, setVarSku] = useState('')

  const [ventas, setVentas] = useState<VentaResumen[]>([])
  const [loadingVentas, setLoadingVentas] = useState(false)
  const [creandoVenta, setCreandoVenta] = useState(false)
  const [ventaFormOpen, setVentaFormOpen] = useState(false)
  const [ventaEditModalOpen, setVentaEditModalOpen] = useState(false)
  const [ventaEditando, setVentaEditando] = useState<VentaResumen | null>(null)
  const [ventaDetalleOpen, setVentaDetalleOpen] = useState(false)
  const [ventaViendo, setVentaViendo] = useState<VentaResumen | null>(null)

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loadingClientes, setLoadingClientes] = useState(false)

  useEffect(() => {
    if (!token) return
    if (activePage === 'categorias') {
      void cargarCategorias()
    }
    if (activePage === 'productos') {
      void cargarCategorias()
      void cargarProveedores()
      void cargarProductos()
    }
    if (activePage === 'variantes') {
      void cargarProductos()
      void cargarVariantes()
    }
    if (activePage === 'proveedores') {
      void cargarProveedores()
    }
    if (activePage === 'clientes') {
      void cargarClientes()
    }
    if (activePage === 'repartidores') {
      void cargarRepartidores()
    }
    if (activePage === 'ventas') {
      void cargarVentas()
      void cargarClientes()
      void cargarProductos()
      void cargarVariantes()
      void cargarRepartidores()
    }
  }, [token, activePage])

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen((prev) => !prev)
    } else {
      setSidebarCollapsed((prev) => !prev)
    }
  }

  const cargarCategorias = async () => {
    setLoadingCategorias(true)
    try {
      const response = await fetch(`${API_BASE_URL}/categorias`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Error al cargar categorías')
      }

      const data = (await response.json()) as Categoria[]
      setCategorias(data)
    } catch (err) {
      console.error(err)
      void Swal.fire('Error', 'No se pudieron cargar las categorías', 'error')
    } finally {
      setLoadingCategorias(false)
    }
  }

  const cargarVariantes = async (): Promise<ProductoVariante[] | null> => {
    setLoadingVariantes(true)
    try {
      const response = await fetch(`${API_BASE_URL}/productos/variantes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Error al cargar variantes')
      }

      const data = (await response.json()) as ProductoVariante[]
      setVariantes(data)
      return data
    } catch (err) {
      console.error(err)
      void Swal.fire('Error', 'No se pudieron cargar las variantes de productos', 'error')
      return null
    } finally {
      setLoadingVariantes(false)
    }
  }

  const cargarClientes = async () => {
    setLoadingClientes(true)
    try {
      const response = await fetch(`${API_BASE_URL}/clientes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Error al cargar clientes')
      }

      const data = (await response.json()) as Cliente[]
      setClientes(data)
    } catch (err) {
      console.error(err)
      void Swal.fire('Error', 'No se pudieron cargar los clientes', 'error')
    } finally {
      setLoadingClientes(false)
    }
  }

  const cargarVentas = async () => {
    setLoadingVentas(true)
    try {
      const response = await fetch(`${API_BASE_URL}/ventas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Error al cargar ventas')
      }

      const data = (await response.json()) as VentaResumen[]
      setVentas(data)
    } catch (err) {
      console.error(err)
      void Swal.fire('Error', 'No se pudieron cargar las ventas', 'error')
    } finally {
      setLoadingVentas(false)
    }
  }

  const crearVentaDesdeUI = async (payload: NuevaVentaPayload) => {
    setCreandoVenta(true)
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
      }

      if (!response.ok) {
        throw new Error(data.message ?? 'Error al registrar la venta')
      }

      await Swal.fire('Venta registrada', 'La venta se registró correctamente.', 'success')
      await cargarVentas()
      setVentaFormOpen(false)
    } catch (err) {
      console.error(err)
      void Swal.fire(
        'Error',
        err instanceof Error ? err.message : 'No se pudo registrar la venta',
        'error',
      )
    } finally {
      setCreandoVenta(false)
    }
  }

  const abrirModalNuevaVariante = () => {
    setVarianteEditando(null)
    setVarProductoId(null)
    setVarAtributo('Talla')
    setVarValor('')
    setVarStock(0)
    setVarPrecioAdicional(0)
    setVarSku('')
    setVarianteModalOpen(true)
  }

  const abrirModalEditarVariante = (v: ProductoVariante) => {
    setVarianteEditando(v)
    setVarProductoId(v.Producto_Id)
    setVarAtributo((v.Atributo as 'Talla' | 'Color') ?? 'Talla')
    setVarValor(v.Valor)
    setVarStock(v.StockActual)
    setVarPrecioAdicional(v.PrecioAdicional)
    setVarSku(v.CodigoSKU ?? '')
    setVarianteModalOpen(true)
  }

  const guardarVariante = async (event: FormEvent) => {
    event.preventDefault()
    if (!varProductoId) {
      void Swal.fire('Producto requerido', 'Debes seleccionar un producto.', 'warning')
      return
    }
    if (!varValor.trim()) {
      void Swal.fire('Valor requerido', 'Debes ingresar un valor para la variante.', 'warning')
      return
    }

    try {
      const isEdit = Boolean(varianteEditando)
      const url = isEdit
        ? `${API_BASE_URL}/productos/variantes/${encodeURIComponent(varianteEditando!.Id)}`
        : `${API_BASE_URL}/productos/variantes`
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productoId: varProductoId,
          atributo: varAtributo,
          valor: varValor,
          stockActual: varStock,
          precioAdicional: varPrecioAdicional,
          codigoSKU: varSku || null,
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        const message = body?.message ?? 'Error al actualizar variante'
        throw new Error(message)
      }

      setVarianteModalOpen(false)
      await Swal.fire(
        isEdit ? 'Variante actualizada' : 'Variante creada',
        isEdit
          ? 'Los cambios se han guardado correctamente.'
          : 'La variante se ha creado correctamente.',
        'success',
      )
      await cargarVariantes()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar variante'
      void Swal.fire('Error', message, 'error')
    }
  }

  const eliminarVariante = async (v: ProductoVariante) => {
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        const message = body?.message ?? 'Error al eliminar variante'
        throw new Error(message)
      }

      await Swal.fire('Variante eliminada', 'La variante se eliminó correctamente.', 'success')
      await cargarVariantes()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar variante'
      void Swal.fire('Error', message, 'error')
    }
  }

  const guardarCategoria = async (event: FormEvent) => {
    event.preventDefault()
    if (!catNombre) {
      void Swal.fire('Nombre requerido', 'Debes ingresar un nombre para la categoría', 'warning')
      return
    }

    try {
      const isEdit = Boolean(categoriaEditando)
      const url = isEdit
        ? `${API_BASE_URL}/categorias/${categoriaEditando!.Id}`
        : `${API_BASE_URL}/categorias`
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: catNombre,
          visible: catVisible,
          categoriaPadreId: catPadreId,
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        const message = body?.message ?? 'Error al guardar la categoría'
        throw new Error(message)
      }

      await cargarCategorias()
      setCategoriaModalOpen(false)

      await Swal.fire(
        'Guardado',
        isEdit ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente',
        'success',
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar la categoría'
      void Swal.fire('Error', message, 'error')
    }
  }

  const abrirModalNuevaCategoria = () => {
    setCategoriaEditando(null)
    setCatNombre('')
    setCatVisible(true)
    setCatPadreId(null)
    setCategoriaModalOpen(true)
  }

  const abrirModalEditarCategoria = (categoria: Categoria) => {
    setCategoriaEditando(categoria)
    setCatNombre(categoria.Nombre)
    setCatVisible(categoria.Visible)
    setCatPadreId(categoria.CategoriaPadre_Id)
    setCategoriaModalOpen(true)
  }

  const eliminarCategoria = async (categoria: Categoria) => {
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        const message = body?.message ?? 'Error al eliminar la categoría'
        throw new Error(message)
      }

      await cargarCategorias()
      await Swal.fire('Eliminada', 'La categoría se ha eliminado correctamente', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar la categoría'
      void Swal.fire('Error', message, 'error')
    }
  }

  const cargarProductos = async () => {
    setLoadingProductos(true)
    try {
      const response = await fetch(`${API_BASE_URL}/productos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Error al cargar productos')
      }

      const data = (await response.json()) as Producto[]
      setProductos(data)
    } catch (err) {
      console.error(err)
      void Swal.fire('Error', 'No se pudieron cargar los productos', 'error')
    } finally {
      setLoadingProductos(false)
    }
  }

  /** Genera un SKU sugerido desde el nombre (slug): minúsculas, sin acentos, guiones. */
  const slugForSku = (name: string) => {
    return name
      .trim()
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || ''
  }

  const handleProdNombreChange = (value: string) => {
    setProdNombre(value)
    if (!productoEditando && !hasUserEditedSkuRef.current) {
      setProdCodigoInterno(slugForSku(value))
    }
  }

  const handleProdCodigoInternoChange = (value: string) => {
    hasUserEditedSkuRef.current = true
    setProdCodigoInterno(value)
  }

  const abrirModalNuevoProducto = () => {
    hasUserEditedSkuRef.current = false
    setProductoEditando(null)
    setProdNombre('')
    setProdCodigoInterno('')
    setProdCodigoBarras('')
    setProdCategoriaId(null)
    setProdProveedorId(null)
    setProdDescripcion('')
    setProdCosto(0)
    setProdPrecioDetal(0)
    setProdPrecioMayor(null)
    setProdStockActual(0)
    setProdVisible(true)
    setProdImagenes([])
    setProdVariantes([])
    setRemovedVarianteIds([])
    setProductoFormOpen(true)
  }

  const abrirModalEditarProducto = async (prod: Producto) => {
    setProductoEditando(prod)
    setProdNombre(prod.Nombre)
    setProdCodigoInterno(prod.CodigoInterno)
    setProdCodigoBarras(prod.CodigoBarras ?? '')
    setProdCategoriaId(prod.Categoria_Id)
    setProdProveedorId(prod.Proveedor_Id)
    setProdDescripcion(prod.Descripcion ?? '')
    setProdCosto(prod.Costo)
    setProdPrecioDetal(prod.PrecioDetal)
    setProdPrecioMayor(prod.PrecioMayor)
    setProdStockActual(prod.StockActual)
    setProdVisible(prod.Visible)
    setRemovedVarianteIds([])
    setProductoFormOpen(true)
    const [variantesList, imagenesRes] = await Promise.all([
      cargarVariantes(),
      fetch(`${API_BASE_URL}/productos/${prod.Id}/imagenes`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => (r.ok ? r.json() : []) as Promise<ProductoImagen[]>),
    ])
    setProdImagenes(
      imagenesRes.map((i) => ({
        id: i.Id,
        url: i.Url,
        esPrincipal: i.EsPrincipal,
      })),
    )
    const list = variantesList
    if (list) {
      setProdVariantes(
        list
          .filter((v) => v.Producto_Id === prod.Id)
          .map((v) => ({
            id: v.Id,
            atributo: v.Atributo as 'Talla' | 'Color',
            valor: v.Valor,
            precioAdicional: v.PrecioAdicional,
            stockActual: v.StockActual,
            codigoSKU: v.CodigoSKU ?? '',
          })),
      )
    } else {
      setProdVariantes([])
    }
  }

  const addProdVariante = () => {
    setProdVariantes((prev) => [
      ...prev,
      { atributo: 'Talla', valor: '', precioAdicional: 0, stockActual: 0, codigoSKU: '' },
    ])
  }

  const removeProdVariante = (index: number) => {
    setProdVariantes((prev) => {
      const item = prev[index]
      if (item?.id != null) {
        setRemovedVarianteIds((ids) => [...ids, item.id!])
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  const updateProdVariante = (
    index: number,
    field: keyof ProductoVarianteForm,
    value: string | number,
  ) => {
    setProdVariantes((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    )
  }

  const addProdImagen = (file: File) => {
    const url = URL.createObjectURL(file)
    const isFirst = prodImagenes.length === 0
    setProdImagenes((prev) => [...prev, { url, file, esPrincipal: isFirst }])
  }

  const removeProdImagen = async (index: number) => {
    const item = prodImagenes[index]
    if (item?.id != null && productoEditando) {
      try {
        const res = await fetch(
          `${API_BASE_URL}/productos/imagenes/${item.id}`,
          { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
        )
        if (!res.ok) throw new Error()
      } catch {
        void Swal.fire('Error', 'No se pudo eliminar la imagen', 'error')
        return
      }
    }
    if (item?.url && item?.url.startsWith('blob:')) URL.revokeObjectURL(item.url)
    setProdImagenes((prev) => prev.filter((_, i) => i !== index))
  }

  const setPrincipalImagen = async (index: number) => {
    const item = prodImagenes[index]
    if (item?.id != null && productoEditando) {
      try {
        const res = await fetch(
          `${API_BASE_URL}/productos/imagenes/${item.id}/principal`,
          { method: 'PUT', headers: { Authorization: `Bearer ${token}` } },
        )
        if (!res.ok) throw new Error()
      } catch {
        void Swal.fire('Error', 'No se pudo establecer como principal', 'error')
        return
      }
    }
    setProdImagenes((prev) =>
      prev.map((img, i) => ({ ...img, esPrincipal: i === index })),
    )
  }

  const guardarProducto = async (event: FormEvent) => {
    event.preventDefault()
    if (!prodNombre || !prodCodigoInterno || !prodPrecioDetal) {
      void Swal.fire(
        'Campos obligatorios',
        'Nombre, código interno y precio detal son requeridos',
        'warning',
      )
      return
    }

    try {
      const isEdit = Boolean(productoEditando)
      const url = isEdit
        ? `${API_BASE_URL}/productos/${productoEditando!.Id}`
        : `${API_BASE_URL}/productos`
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: prodNombre,
          codigoInterno: prodCodigoInterno,
          codigoBarras: prodCodigoBarras || null,
          proveedorId: prodProveedorId,
          categoriaId: prodCategoriaId,
          descripcion: prodDescripcion || null,
          costo: prodCosto,
          precioDetal: prodPrecioDetal,
          precioMayor: prodPrecioMayor,
          stockActual: prodStockActual,
          visible: prodVisible,
        }),
      })

      const data = (await response.json()) as Producto | { message?: string }
      if (!response.ok) {
        const message = 'message' in data ? data.message : 'Error al guardar el producto'
        throw new Error(message)
      }

      const savedProduct = data as Producto
      const productId = savedProduct.Id

      const imagenesConArchivo = prodImagenes.filter((img) => img.file)
      for (let i = 0; i < imagenesConArchivo.length; i++) {
        const img = imagenesConArchivo[i]
        const base64 = await new Promise<string | null>((resolve, reject) => {
          const r = new FileReader()
          r.onload = () => resolve(typeof r.result === 'string' ? r.result : null)
          r.onerror = () => reject(r.error)
          r.readAsDataURL(img.file!)
        })
        if (!base64) continue
        const esPrincipal = img.esPrincipal ?? i === 0
        const resImg = await fetch(`${API_BASE_URL}/productos/${productId}/imagenes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ imagenBase64: base64, esPrincipal, orden: i }),
        })
        if (!resImg.ok) {
          const err = await resImg.json().catch(() => ({}))
          throw new Error((err as { message?: string }).message ?? 'Error al subir imagen')
        }
      }

      const variantesToSync = prodVariantes.filter((v) => v.valor.trim() !== '')
      for (const v of variantesToSync) {
        const payload = {
          productoId: productId,
          atributo: v.atributo,
          valor: v.valor.trim(),
          stockActual: v.stockActual,
          precioAdicional: v.precioAdicional,
          codigoSKU: v.codigoSKU.trim() || null,
        }
        if (v.id != null && isEdit) {
          const putRes = await fetch(
            `${API_BASE_URL}/productos/variantes/${encodeURIComponent(v.id)}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                valor: payload.valor,
                stockActual: payload.stockActual,
                precioAdicional: payload.precioAdicional,
                codigoSKU: payload.codigoSKU,
              }),
            },
          )
          if (!putRes.ok) {
            const bodyPut = await putRes.json().catch(() => null)
            throw new Error(bodyPut?.message ?? 'Error al actualizar variante')
          }
        } else {
          const postRes = await fetch(`${API_BASE_URL}/productos/variantes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          })
          if (!postRes.ok) {
            const bodyPost = await postRes.json().catch(() => null)
            throw new Error(bodyPost?.message ?? 'Error al crear variante')
          }
        }
      }

      for (const varianteId of removedVarianteIds) {
        const delRes = await fetch(
          `${API_BASE_URL}/productos/variantes/${encodeURIComponent(varianteId)}`,
          { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
        )
        if (!delRes.ok) {
          const bodyDel = await delRes.json().catch(() => null)
          throw new Error(bodyDel?.message ?? 'Error al eliminar variante')
        }
      }

      await cargarProductos()
      await cargarVariantes()
      setProductoFormOpen(false)
      setProdImagenes([])
      setProdVariantes([])
      setRemovedVarianteIds([])

      await Swal.fire(
        'Guardado',
        isEdit ? 'Producto actualizado correctamente' : 'Producto creado correctamente',
        'success',
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar el producto'
      void Swal.fire('Error', message, 'error')
    }
  }

  const eliminarProducto = async (prod: Producto) => {
    const result = await Swal.fire({
      title: '¿Eliminar producto?',
      text: `Se eliminará definitivamente el producto "${prod.Nombre}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#64748b',
    })

    if (!result.isConfirmed) return

    try {
      const response = await fetch(`${API_BASE_URL}/productos/${prod.Id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        const message = body?.message ?? 'Error al eliminar el producto'
        throw new Error(message)
      }

      await cargarProductos()
      await Swal.fire('Eliminado', 'El producto se ha eliminado correctamente', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar el producto'
      void Swal.fire('Error', message, 'error')
    }
  }

  const abrirModalImportarProductos = () => {
    setProductoImportText('')
    setProductoImportFile(null)
    setProductoImportModalOpen(true)
  }

  const importarProductosDesdeTexto = async (event: FormEvent) => {
    event.preventDefault()

    let rows:
      | {
          Codigo: string
          Nombre: string
          Categoria?: string
          Talla?: string
          Color?: string
          Stock?: number
          Costo?: number
          PrecioDetal?: number
          PrecioMayor?: number
          Proveedor?: string
          Visible?: string
          Descripcion?: string
        }[]
      | null = null

    // Preferimos archivo Excel si el usuario subió uno
    if (productoImportFile) {
      try {
        const XLSX = await import('xlsx')
        const buffer = await productoImportFile.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

        rows = json.map((row) => ({
          Codigo: String(row.Codigo ?? row.codigo ?? row['Código'] ?? '').trim(),
          Nombre: String(row.Nombre ?? row.nombre ?? '').trim(),
          Categoria:
            String(
              row.Categoria ??
                row.categoria ??
                row['Categoría'] ??
                row['categoria'] ??
                row['Categoria'] ??
                '',
            ).trim() || undefined,
          Talla: String(row.Talla ?? row.talla ?? '').trim() || undefined,
          Color: String(row.Color ?? row.color ?? '').trim() || undefined,
          Stock: row.Stock !== undefined && row.Stock !== '' ? Number(row.Stock) : undefined,
          Costo: row.Costo !== undefined && row.Costo !== '' ? Number(row.Costo) : undefined,
          PrecioDetal: (() => {
            const v =
              (row as any).PrecioDetal ??
              (row as any)['Precio Detal'] ??
              (row as any)['Precio detal'] ??
              (row as any)['precio detal']
            return v !== undefined && v !== '' ? Number(v) : undefined
          })(),
          PrecioMayor: (() => {
            const v =
              (row as any).PrecioMayor ??
              (row as any)['Precio Mayor'] ??
              (row as any)['Precio mayor'] ??
              (row as any)['precio mayor']
            return v !== undefined && v !== '' ? Number(v) : undefined
          })(),
          Proveedor: String(row.Proveedor ?? row.proveedor ?? '').trim() || undefined,
          Visible: String(row.Visible ?? row.visible ?? '').trim() || undefined,
          Descripcion:
            String(
              row.Descripcion ?? row.descripcion ?? (row as any)['Descripción'] ?? '',
            ).trim() || undefined,
        }))
      } catch (error) {
        console.error(error)
        void Swal.fire(
          'Error al leer archivo',
          'No se pudo leer el archivo Excel. Verifica que sea un .xlsx válido.',
          'error',
        )
        return
      }
    } else {
      // Fallback: texto pegado desde Excel
      const raw = productoImportText.trim()
      if (!raw) {
        void Swal.fire(
          'Sin datos',
          'Selecciona un archivo Excel o pega las filas copiadas desde Excel',
          'warning',
        )
        return
      }

      const lines = raw.split(/\r?\n/).map((l) => l.trim())
      if (lines.length < 2) {
        void Swal.fire('Datos insuficientes', 'Debes incluir al menos una fila de datos', 'warning')
        return
      }

      const dataLines = lines.slice(1).filter((l) => l.length > 0)
      const tempRows: {
        Codigo: string
        Nombre: string
        Categoria?: string
        Talla?: string
        Color?: string
        Stock?: number
        Costo?: number
        PrecioDetal?: number
        PrecioMayor?: number
        Proveedor?: string
        Visible?: string
        Descripcion?: string
      }[] = []

      for (const line of dataLines) {
        const parts = line.split(/\t|;|,/)
        if (parts.length < 2) continue

        const [
          codigo,
          nombre,
          categoria,
          talla,
          color,
          stock,
          costo,
          precioDetal,
          precioMayor,
          proveedor,
          visible,
          descripcion,
        ] = parts.map((p) => p.trim())

        tempRows.push({
          Codigo: codigo,
          Nombre: nombre,
          Categoria: categoria || undefined,
          Talla: talla || undefined,
          Color: color || undefined,
          Stock: stock ? Number(stock) : undefined,
          Costo: costo ? Number(costo) : undefined,
          PrecioDetal: precioDetal ? Number(precioDetal) : undefined,
          PrecioMayor: precioMayor ? Number(precioMayor) : undefined,
          Proveedor: proveedor || undefined,
          Visible: visible || undefined,
          Descripcion: descripcion || undefined,
        })
      }

      rows = tempRows
    }

    if (!rows || !rows.length) {
      void Swal.fire('Sin filas válidas', 'No se pudieron leer filas de productos', 'warning')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/productos/import-excel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rows }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        const message = body?.message ?? 'Error al importar productos'
        throw new Error(message)
      }

      const summary = (await response.json()) as {
        total: number
        exitosos: number
        conErrores: number
      }

      setProductoImportModalOpen(false)
      await Swal.fire(
        'Importación completada',
        `Total filas: ${summary.total}\nExitosos: ${summary.exitosos}\nCon errores: ${summary.conErrores}`,
        'success',
      )
      await cargarProductos()
      await cargarVariantes()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al importar productos'
      void Swal.fire('Error', message, 'error')
    }
  }

  const cargarRepartidores = async () => {
    setLoadingRepartidores(true)
    try {
      const response = await fetch(`${API_BASE_URL}/repartidores`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Error al cargar repartidores')
      }

      const data = (await response.json()) as Repartidor[]
      setRepartidores(data)
    } catch (err) {
      console.error(err)
      void Swal.fire('Error', 'No se pudieron cargar los repartidores', 'error')
    } finally {
      setLoadingRepartidores(false)
    }
  }

  // importarClientesDesdeTexto ahora vive en ClienteImportModal

  const abrirModalNuevoRepartidor = () => {
    setRepartidorEditando(null)
    setRepNombre('')
    setRepTelefono('')
    setRepDocumento('')
    setRepVehiculo('')
    setRepPlaca('')
    setRepDisponible(true)
    setRepActivo(true)
    setRepartidorModalOpen(true)
  }

  const abrirModalEditarRepartidor = (rep: Repartidor) => {
    setRepartidorEditando(rep)
    setRepNombre(rep.Nombre)
    setRepTelefono(rep.Telefono)
    setRepDocumento(rep.DocumentoIdentidad ?? '')
    setRepVehiculo(rep.Vehiculo ?? '')
    setRepPlaca(rep.Placa ?? '')
    setRepDisponible(rep.Disponible)
    setRepActivo(rep.Activo)
    setRepartidorModalOpen(true)
  }

  const guardarRepartidor = async (event: FormEvent) => {
    event.preventDefault()
    if (!repNombre || !repTelefono) {
      void Swal.fire(
        'Campos obligatorios',
        'Nombre y teléfono son campos obligatorios',
        'warning',
      )
      return
    }

    try {
      const isEdit = Boolean(repartidorEditando)
      const url = isEdit
        ? `${API_BASE_URL}/repartidores/${repartidorEditando!.Id}`
        : `${API_BASE_URL}/repartidores`
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: repNombre,
          telefono: repTelefono,
          documentoIdentidad: repDocumento || null,
          vehiculo: repVehiculo || null,
          placa: repPlaca || null,
          disponible: repDisponible,
          activo: repActivo,
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        const message = body?.message ?? 'Error al guardar el repartidor'
        throw new Error(message)
      }

      await cargarRepartidores()
      setRepartidorModalOpen(false)

      await Swal.fire(
        'Guardado',
        isEdit ? 'Repartidor actualizado correctamente' : 'Repartidor creado correctamente',
        'success',
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar el repartidor'
      void Swal.fire('Error', message, 'error')
    }
  }

  const eliminarRepartidor = async (rep: Repartidor) => {
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        const message = body?.message ?? 'Error al eliminar el repartidor'
        throw new Error(message)
      }

      await cargarRepartidores()
      await Swal.fire('Eliminado', 'El repartidor se ha eliminado correctamente', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar el repartidor'
      void Swal.fire('Error', message, 'error')
    }
  }

  const cargarProveedores = async () => {
    setLoadingProveedores(true)
    try {
      const response = await fetch(`${API_BASE_URL}/proveedores`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Error al cargar proveedores')
      }

      const data = (await response.json()) as Proveedor[]
      setProveedores(data)
    } catch (err) {
      console.error(err)
      void Swal.fire('Error', 'No se pudieron cargar los proveedores', 'error')
    } finally {
      setLoadingProveedores(false)
    }
  }

  const abrirModalNuevoProveedor = () => {
    setProveedorEditando(null)
    setProvNombre('')
    setProvContacto('')
    setProvTelefono('')
    setProvEmail('')
    setProvActivo(true)
    setProveedorModalOpen(true)
  }

  const abrirModalEditarProveedor = (prov: Proveedor) => {
    setProveedorEditando(prov)
    setProvNombre(prov.Nombre)
    setProvContacto(prov.Contacto ?? '')
    setProvTelefono(prov.Telefono ?? '')
    setProvEmail(prov.Email ?? '')
    setProvActivo(prov.Activo)
    setProveedorModalOpen(true)
  }

  const guardarProveedor = async (event: FormEvent) => {
    event.preventDefault()
    if (!provNombre) {
      void Swal.fire('Nombre requerido', 'Debes ingresar un nombre para el proveedor', 'warning')
      return
    }

    try {
      const isEdit = Boolean(proveedorEditando)
      const url = isEdit
        ? `${API_BASE_URL}/proveedores/${proveedorEditando!.Id}`
        : `${API_BASE_URL}/proveedores`
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: provNombre,
          contacto: provContacto || null,
          telefono: provTelefono || null,
          email: provEmail || null,
          activo: provActivo,
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        const message = body?.message ?? 'Error al guardar el proveedor'
        throw new Error(message)
      }

      await cargarProveedores()
      setProveedorModalOpen(false)

      await Swal.fire(
        'Guardado',
        isEdit ? 'Proveedor actualizado correctamente' : 'Proveedor creado correctamente',
        'success',
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar el proveedor'
      void Swal.fire('Error', message, 'error')
    }
  }

  const eliminarProveedor = async (prov: Proveedor) => {
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        const message = body?.message ?? 'Error al eliminar el proveedor'
        throw new Error(message)
      }

      await cargarProveedores()
      await Swal.fire('Eliminado', 'El proveedor se ha eliminado correctamente', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar el proveedor'
      void Swal.fire('Error', message, 'error')
    }
  }

  const handleLogoutClick = () => {
    onLogout()
  }

  const dm = darkMode
  const bg = dm ? 'bg-slate-950' : 'bg-gray-50'
  const cardBg = dm ? 'bg-slate-900/40 border-slate-800/60' : 'bg-white border-gray-200'
  const cardBgHover = dm ? 'hover:border-slate-700/60' : 'hover:border-gray-300'
  const textPrimary = dm ? 'text-slate-100' : 'text-gray-900'
  const textSecondary = dm ? 'text-slate-400' : 'text-gray-500'
  const textMuted = dm ? 'text-slate-600' : 'text-gray-400'
  const tableBorder = dm ? 'border-slate-800/60' : 'border-gray-200'
  const tableHead = dm ? 'bg-slate-900 text-slate-400' : 'bg-gray-50 text-gray-500'
  const tableRow = dm ? 'border-slate-800/60 hover:bg-slate-800/30' : 'border-gray-100 hover:bg-gray-50'
  const btnSecondary = dm
    ? 'border border-slate-700 text-slate-300 hover:bg-slate-800'
    : 'border border-gray-200 text-gray-600 hover:bg-gray-100'

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-200 ${bg}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onMobileClose={() => setMobileSidebarOpen(false)}
        activeKey={activePage}
        onNavigate={setActivePage}
        user={user}
        tienda={tienda}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar
          onToggleSidebar={handleToggleSidebar}
          activeKey={activePage}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
          user={user}
          tienda={tienda}
          onLogout={handleLogoutClick}
        />

        <main className="flex-1 overflow-y-auto">
          {/* Dashboard */}
          {activePage === 'dashboard' && (
            <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className={`text-sm font-bold uppercase tracking-[0.18em] text-emerald-500`}>
                    Panel principal
                  </p>
                  <h1 className={`mt-1 text-3xl font-bold ${textPrimary}`}>
                    Hola, {user.nombre.split(' ')[0] ?? user.nombre}
                  </h1>
                  <p className={`mt-2 text-base ${textSecondary}`}>
                    Bienvenido al panel de administración de{' '}
                    <span className={dm ? 'text-slate-200' : 'text-gray-800'}>
                      {tienda.nombreComercial}
                    </span>
                    .
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    label: 'Ventas de hoy',
                    value: '$0',
                    sub: 'Sin transacciones aún',
                    icon: <TrendingUp size={20} />,
                    color: 'emerald',
                  },
                  {
                    label: 'Productos activos',
                    value: '0',
                    sub: 'Sin inventario aún',
                    icon: <Package size={20} />,
                    color: 'blue',
                  },
                  {
                    label: 'Clientes',
                    value: '0',
                    sub: 'Sin registros aún',
                    icon: <Users size={20} />,
                    color: 'violet',
                  },
                ].map(({ label, value, sub, icon, color }) => (
                  <div
                    key={label}
                    className={`rounded-2xl border p-5 flex items-start gap-4 transition-colors ${cardBg} ${cardBgHover}`}
                  >
                    <div
                      className={`p-3 rounded-xl flex-shrink-0 border ${
                        color === 'emerald'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                          : color === 'blue'
                          ? 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                          : 'bg-violet-500/10 border-violet-500/20 text-violet-500'
                      }`}
                    >
                      {icon}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${textSecondary}`}>{label}</p>
                      <p className={`mt-1 text-3xl font-extrabold ${textPrimary}`}>{value}</p>
                      <p className={`mt-1 text-sm ${textMuted}`}>{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`rounded-2xl border p-6 ${cardBg}`}>
                <h3 className={`text-base font-bold ${textPrimary}`}>Resumen general</h3>
                <p className={`mt-3 text-base leading-relaxed ${textSecondary}`}>
                  Este es el layout base del dashboard. A partir de aquí conectaremos los módulos de
                  ventas, productos, clientes y repartidores usando los endpoints del backend.
                </p>
              </div>
            </div>
          )}

          {/* Categorías */}
          {activePage === 'categorias' && (
            <CategoriasView
              categorias={categorias}
              loading={loadingCategorias}
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              tableBorder={tableBorder}
              tableHead={tableHead}
              tableRow={tableRow}
              btnSecondary={btnSecondary}
              onNueva={abrirModalNuevaCategoria}
              onEditar={abrirModalEditarCategoria}
              onEliminar={eliminarCategoria}
            />
          )}

          {/* Productos */}
          {activePage === 'productos' && !productoFormOpen && (
            <ProductosView
              productos={productos}
              loading={loadingProductos}
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              tableBorder={tableBorder}
              tableHead={tableHead}
              tableRow={tableRow}
              btnSecondary={btnSecondary}
              onNuevo={abrirModalNuevoProducto}
              onImportar={abrirModalImportarProductos}
              onRecargar={() => void cargarProductos()}
              onEditar={abrirModalEditarProducto}
              onEliminar={eliminarProducto}
            />
          )}

          {activePage === 'productos' && productoFormOpen && (
            <ProductoFormView
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              btnSecondary={btnSecondary}
              productoEditando={productoEditando}
              categorias={categorias}
              proveedores={proveedores}
              prodNombre={prodNombre}
              prodCodigoInterno={prodCodigoInterno}
              prodCodigoBarras={prodCodigoBarras}
              prodCategoriaId={prodCategoriaId}
              prodProveedorId={prodProveedorId}
              prodDescripcion={prodDescripcion}
              prodCosto={prodCosto}
              prodPrecioDetal={prodPrecioDetal}
              prodPrecioMayor={prodPrecioMayor}
              prodStockActual={prodStockActual}
              prodVisible={prodVisible}
            prodImagenes={prodImagenes}
            onAddImagen={addProdImagen}
            onRemoveImagen={removeProdImagen}
            onSetPrincipalImagen={setPrincipalImagen}
              prodVariantes={prodVariantes}
              onAddVariante={addProdVariante}
              onRemoveVariante={removeProdVariante}
              onUpdateVariante={updateProdVariante}
              onBack={() => setProductoFormOpen(false)}
              setProdNombre={handleProdNombreChange}
              setProdCodigoInterno={handleProdCodigoInternoChange}
              setProdCodigoBarras={setProdCodigoBarras}
              setProdCategoriaId={setProdCategoriaId}
              setProdProveedorId={setProdProveedorId}
              setProdDescripcion={setProdDescripcion}
              setProdCosto={setProdCosto}
              setProdPrecioDetal={setProdPrecioDetal}
              setProdPrecioMayor={setProdPrecioMayor}
              setProdStockActual={setProdStockActual}
              setProdVisible={setProdVisible}
              onSubmit={guardarProducto}
            />
          )}

          {/* Variantes */}
          {activePage === 'variantes' && (
            <VariantesView
              variantes={variantes}
              loading={loadingVariantes}
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              tableBorder={tableBorder}
              tableHead={tableHead}
              tableRow={tableRow}
              onNuevo={abrirModalNuevaVariante}
              onRecargar={() => void cargarVariantes()}
              onEditar={abrirModalEditarVariante}
              onEliminar={eliminarVariante}
            />
          )}

          {/* Ventas - listado */}
          {activePage === 'ventas' && !ventaFormOpen && !ventaDetalleOpen && (
            <VentasView
              ventas={ventas}
              loading={loadingVentas}
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              tableBorder={tableBorder}
              tableHead={tableHead}
              tableRow={tableRow}
              btnSecondary={btnSecondary}
              onRecargar={() => void cargarVentas()}
              onNuevaVenta={() => setVentaFormOpen(true)}
              onVer={(v) => {
                setVentaViendo(v)
                setVentaDetalleOpen(true)
              }}
              onEditar={(v) => {
                setVentaEditando(v)
                setVentaEditModalOpen(true)
              }}
              onEliminar={async (v) => {
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
                  const response = await fetch(
                    `${API_BASE_URL}/ventas/${encodeURIComponent(v.Id)}`,
                    {
                      method: 'DELETE',
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    },
                  )
                  const body = (await response.json().catch(() => null)) as
                    | { message?: string }
                    | null
                  if (!response.ok) {
                    const msg =
                      body?.message ??
                      'No se pudo eliminar la venta. Verifica que no tenga dependencias adicionales.'
                    throw new Error(msg)
                  }

                  await Swal.fire(
                    'Venta eliminada',
                    'La venta se eliminó correctamente.',
                    'success',
                  )
                  await cargarVentas()
                } catch (err) {
                  const msg =
                    err instanceof Error ? err.message : 'Error inesperado al eliminar venta'
                  void Swal.fire('Error', msg, 'error')
                }
              }}
            />
          )}

          {/* Ventas - formulario nueva venta */}
          {activePage === 'ventas' && ventaFormOpen && (
            <VentaFormView
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              btnSecondary={btnSecondary}
              productos={productos}
              variantes={variantes}
              clientes={clientes}
              repartidores={repartidores}
              loading={creandoVenta || loadingClientes || loadingProductos || loadingVariantes}
              onBack={() => setVentaFormOpen(false)}
              onSubmit={crearVentaDesdeUI}
              onNuevoCliente={() => {
                setActivePage('clientes')
                setClienteEditando(null)
                setClienteModalOpen(true)
              }}
            />
          )}

          {/* Ventas - detalle de venta */}
          {activePage === 'ventas' && ventaDetalleOpen && ventaViendo && (
            <VentaDetalleView
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              btnSecondary={btnSecondary}
              token={token}
              ventaId={ventaViendo.Id}
              onVolver={() => setVentaDetalleOpen(false)}
            />
          )}

          {/* Repartidores */}
          {activePage === 'repartidores' && (
            <div className="p-6 max-w-7xl mx-auto w-full space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className={`text-base font-semibold ${textPrimary}`}>Repartidores</h2>
                  <p className={`mt-0.5 text-xs ${textSecondary}`}>
                    Gestiona el equipo de entregas de tu tienda.
                  </p>
                </div>
                <button
                  onClick={abrirModalNuevoRepartidor}
                  className="flex-shrink-0 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-600 active:scale-95 transition-all"
                >
                  + Nuevo repartidor
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    label: 'Total',
                    value: repartidores.length,
                    icon: <Users size={15} />,
                    cls: dm
                      ? 'text-slate-400 bg-slate-800/60 border-slate-700/60'
                      : 'text-gray-500 bg-gray-100 border-gray-200',
                  },
                  {
                    label: 'Disponibles',
                    value: repartidores.filter((r) => r.Activo && r.Disponible).length,
                    icon: <CheckCircle2 size={15} />,
                    cls: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
                  },
                  {
                    label: 'Ocupados',
                    value: repartidores.filter((r) => r.Activo && !r.Disponible).length,
                    icon: <Clock size={15} />,
                    cls: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
                  },
                  {
                    label: 'Inactivos',
                    value: repartidores.filter((r) => !r.Activo).length,
                    icon: <UserX size={15} />,
                    cls: dm
                      ? 'text-slate-500 bg-slate-800/60 border-slate-700/60'
                      : 'text-gray-400 bg-gray-100 border-gray-200',
                  },
                ].map(({ label, value, icon, cls }) => (
                  <div
                    key={label}
                    className={`rounded-2xl border px-4 py-3 flex items-center gap-3 transition-colors ${cardBg}`}
                  >
                    <div className={`p-2 rounded-xl border flex-shrink-0 ${cls}`}>{icon}</div>
                    <div>
                      <p className={`text-[11px] font-medium ${textMuted}`}>{label}</p>
                      <p className={`text-xl font-bold leading-tight ${textPrimary}`}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {loadingRepartidores && (
                <div className={`flex items-center justify-center py-16 ${textMuted}`}>
                  <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                  <span className="ml-3 text-sm">Cargando repartidores...</span>
                </div>
              )}

              {!loadingRepartidores && repartidores.length === 0 && (
                <div className={`rounded-2xl border p-12 text-center ${cardBg}`}>
                  <div
                    className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                      dm ? 'bg-slate-800' : 'bg-gray-100'
                    }`}
                  >
                    <Bike size={28} className={textMuted} />
                  </div>
                  <p className={`text-sm font-medium ${textPrimary}`}>Sin repartidores aún</p>
                  <p className={`mt-1 text-xs ${textMuted}`}>
                    Agrega tu primer repartidor para empezar a gestionar las entregas.
                  </p>
                  <button
                    onClick={abrirModalNuevoRepartidor}
                    className="mt-4 rounded-xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors"
                  >
                    + Agregar repartidor
                  </button>
                </div>
              )}

              {!loadingRepartidores && repartidores.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {repartidores.map((rep) => {
                    const isInactivo = !rep.Activo
                    const isDisponible = rep.Activo && rep.Disponible

                    const status = isInactivo
                      ? {
                          label: 'Inactivo',
                          cls:
                            dm
                              ? 'bg-slate-700/50 text-slate-400'
                              : 'bg-gray-100 text-gray-500',
                          dot: 'bg-gray-400',
                        }
                      : isDisponible
                      ? {
                          label: 'Disponible',
                          cls: 'bg-emerald-500/10 text-emerald-600',
                          dot: 'bg-emerald-500',
                        }
                      : {
                          label: 'Ocupado',
                          cls: 'bg-amber-500/10 text-amber-600',
                          dot: 'bg-amber-500',
                        }

                    const avatarClass = isInactivo
                      ? dm
                        ? 'bg-slate-700 text-slate-400'
                        : 'bg-gray-200 text-gray-500'
                      : isDisponible
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-500 text-white'

                    const initials = rep.Nombre.split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()

                    return (
                      <div
                        key={rep.Id}
                        className={`rounded-2xl border flex flex-col overflow-hidden transition-all hover:shadow-md ${cardBg} ${cardBgHover}`}
                      >
                        <div className="p-5">
                          <div className="flex items-start gap-3">
                            <div
                              className={`h-11 w-11 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold ${avatarClass}`}
                            >
                              {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold truncate ${textPrimary}`}>
                                {rep.Nombre}
                              </p>
                              <span
                                className={`inline-flex items-center gap-1 mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.cls}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot}`}
                                />
                                {status.label}
                              </span>
                            </div>
                          </div>

                          <div className={`mt-4 space-y-2 text-xs ${textSecondary}`}>
                            <div className="flex items-center gap-2">
                              <Phone size={12} className={`flex-shrink-0 ${textMuted}`} />
                              <span className="truncate">{rep.Telefono}</span>
                            </div>
                            {(rep.Vehiculo || rep.Placa) && (
                              <div className="flex items-center gap-2">
                                <Car size={12} className={`flex-shrink-0 ${textMuted}`} />
                                <span className="truncate">
                                  {[rep.Vehiculo, rep.Placa].filter(Boolean).join(' · ')}
                                </span>
                              </div>
                            )}
                            {rep.DocumentoIdentidad && (
                              <div className="flex items-center gap-2">
                                <FileText size={12} className={`flex-shrink-0 ${textMuted}`} />
                                <span className="truncate">{rep.DocumentoIdentidad}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div
                          className={`mt-auto px-5 py-3 border-t flex items-center justify-end gap-2 ${tableBorder}`}
                        >
                          <button
                            onClick={() => abrirModalEditarRepartidor(rep)}
                            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors ${btnSecondary}`}
                          >
                            <Pencil size={11} />
                            Editar
                          </button>
                          <button
                            onClick={() => eliminarRepartidor(rep)}
                            className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-1.5 text-[11px] font-medium text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={11} />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Proveedores */}
          {activePage === 'proveedores' && (
            <ProveedoresView
              proveedores={proveedores}
              loading={loadingProveedores}
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              tableBorder={tableBorder}
              tableHead={tableHead}
              tableRow={tableRow}
              btnSecondary={btnSecondary}
              onNuevo={abrirModalNuevoProveedor}
              onEditar={abrirModalEditarProveedor}
              onEliminar={eliminarProveedor}
            />
          )}

          {/* Clientes */}
          {activePage === 'clientes' && (
            <ClientesView
              clientes={clientes}
              loading={loadingClientes}
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              tableBorder={tableBorder}
              tableHead={tableHead}
              tableRow={tableRow}
              btnSecondary={btnSecondary}
              onRecargar={() => void cargarClientes()}
              onImportar={() => setClienteImportModalOpen(true)}
              onNuevo={() => {
                setClienteEditando(null)
                setClienteModalOpen(true)
              }}
              onEditar={(c) => {
                setClienteEditando(c)
                setClienteModalOpen(true)
              }}
              onEliminar={async (c) => {
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
                  const response = await fetch(
                    `${API_BASE_URL}/clientes/${encodeURIComponent(c.Id)}`,
                    {
                      method: 'DELETE',
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    },
                  )
                  const body = (await response.json().catch(() => null)) as
                    | { message?: string }
                    | null
                  if (!response.ok) {
                    const msg =
                      body?.message ??
                      'No se pudo eliminar el cliente. Verifica que no tenga ventas asociadas.'
                    throw new Error(msg)
                  }

                  await Swal.fire(
                    'Cliente eliminado',
                    'El cliente se eliminó correctamente.',
                    'success',
                  )
                  await cargarClientes()
                } catch (err) {
                  const msg = err instanceof Error ? err.message : 'Error al eliminar cliente'
                  void Swal.fire('Error', msg, 'error')
                }
              }}
            />
          )}

          {/* Placeholder para otras páginas */}
          {![
            'dashboard',
            'categorias',
            'productos',
            'variantes',
            'proveedores',
            'clientes',
            'repartidores',
            'ventas',
          ].includes(activePage) && (
            <div className="p-6 max-w-5xl mx-auto w-full">
              <div className={`rounded-2xl border p-10 text-center ${cardBg}`}>
                <p className={`text-sm ${textMuted}`}>
                  Módulo{' '}
                  <span className={`font-medium capitalize ${textSecondary}`}>{activePage}</span>{' '}
                  en construcción.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      <CategoriaModal
        open={categoriaModalOpen}
        dm={dm}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        btnSecondary={btnSecondary}
        categoriaEditando={categoriaEditando}
        catNombre={catNombre}
        catVisible={catVisible}
        catPadreId={catPadreId}
        categorias={categorias}
        onClose={() => setCategoriaModalOpen(false)}
        setCatNombre={setCatNombre}
        setCatVisible={setCatVisible}
        setCatPadreId={setCatPadreId}
        onSubmit={guardarCategoria}
      />

      {repartidorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              dm
                ? 'bg-slate-950 border-slate-800 shadow-slate-950/50'
                : 'bg-white border-gray-200 shadow-gray-200/80'
            }`}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className={`text-sm font-semibold ${textPrimary}`}>
                  {repartidorEditando ? 'Editar repartidor' : 'Nuevo repartidor'}
                </h3>
                <p className={`mt-0.5 text-[11px] ${textSecondary}`}>
                  Completa los datos de contacto y estado.
                </p>
              </div>
              <button
                onClick={() => setRepartidorModalOpen(false)}
                className={`rounded-xl px-2.5 py-1 text-xs transition-colors ${btnSecondary}`}
              >
                Cerrar
              </button>
            </div>

            <form className="space-y-3" onSubmit={guardarRepartidor}>
              <div>
                <label className={`block text-xs font-medium mb-1 ${textPrimary}`}>Nombre</label>
                <input
                  type="text"
                  value={repNombre}
                  onChange={(e) => setRepNombre(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    dm
                      ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-500'
                      : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${textPrimary}`}>Teléfono</label>
                <input
                  type="text"
                  value={repTelefono}
                  onChange={(e) => setRepTelefono(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    dm
                      ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-500'
                      : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${textPrimary}`}>
                    Documento
                  </label>
                  <input
                    type="text"
                    value={repDocumento}
                    onChange={(e) => setRepDocumento(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      dm
                        ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-500'
                        : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${textPrimary}`}>
                    Vehículo / placa
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={repVehiculo}
                      onChange={(e) => setRepVehiculo(e.target.value)}
                      placeholder="Moto"
                      className={`w-1/2 rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                        dm
                          ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-500'
                          : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400'
                      }`}
                    />
                    <input
                      type="text"
                      value={repPlaca}
                      onChange={(e) => setRepPlaca(e.target.value)}
                      placeholder="ABC123"
                      className={`w-1/2 rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                        dm
                          ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-500'
                          : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <label className={`flex items-center gap-2 text-xs ${textPrimary}`}>
                  <input
                    type="checkbox"
                    checked={repDisponible}
                    onChange={(e) => setRepDisponible(e.target.checked)}
                    className="h-3.5 w-3.5 rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  Disponible para envíos
                </label>
                <label className={`flex items-center gap-2 text-xs ${textPrimary}`}>
                  <input
                    type="checkbox"
                    checked={repActivo}
                    onChange={(e) => setRepActivo(e.target.checked)}
                    className="h-3.5 w-3.5 rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  Repartidor activo
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setRepartidorModalOpen(false)}
                  className={`rounded-xl px-3 py-1.5 text-xs transition-colors ${btnSecondary}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors"
                >
                  {repartidorEditando ? 'Guardar cambios' : 'Crear repartidor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <VentaEditModal
        open={ventaEditModalOpen}
        dm={dm}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        textMuted={textMuted}
        btnSecondary={btnSecondary}
        token={token}
        venta={ventaEditando}
        onClose={() => setVentaEditModalOpen(false)}
        onSaved={cargarVentas}
      />

      <ProveedorModal
        open={proveedorModalOpen}
        dm={dm}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        btnSecondary={btnSecondary}
        proveedorEditando={proveedorEditando}
        provNombre={provNombre}
        provContacto={provContacto}
        provTelefono={provTelefono}
        provEmail={provEmail}
        provActivo={provActivo}
        onClose={() => setProveedorModalOpen(false)}
        setProvNombre={setProvNombre}
        setProvContacto={setProvContacto}
        setProvTelefono={setProvTelefono}
        setProvEmail={setProvEmail}
        setProvActivo={setProvActivo}
        onSubmit={guardarProveedor}
      />

      <VarianteModal
        open={varianteModalOpen}
        dm={dm}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        textMuted={textMuted}
        btnSecondary={btnSecondary}
        productos={productos}
        varianteEditando={varianteEditando}
        varProductoId={varProductoId}
        varAtributo={varAtributo}
        varValor={varValor}
        varStock={varStock}
        varPrecioAdicional={varPrecioAdicional}
        varSku={varSku}
        onClose={() => setVarianteModalOpen(false)}
        onChangeProducto={(id) => setVarProductoId(id)}
        onChangeAtributo={(attr) => setVarAtributo(attr)}
        onChangeValor={(value) => setVarValor(value)}
        onChangeStock={(value) => setVarStock(value)}
        onChangePrecioAdicional={(value) => setVarPrecioAdicional(value)}
        onChangeSku={(value) => setVarSku(value)}
        onSubmit={guardarVariante}
      />

      {productoImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div
            className={`w-full max-w-2xl rounded-2xl border p-6 shadow-2xl ${
              dm
                ? 'bg-slate-950 border-slate-800 shadow-slate-950/50'
                : 'bg-white border-gray-200 shadow-gray-200/80'
            }`}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className={`text-sm font-semibold ${textPrimary}`}>
                  Importar productos desde Excel
                </h3>
                <p className={`mt-0.5 text-[11px] ${textSecondary}`}>
                  Puedes subir un archivo Excel (.xlsx) o copiar las filas (incluyendo encabezado) y
                  pegarlas abajo. El orden de columnas debe ser:
                </p>
                <p className={`mt-1 text-[11px] font-mono ${textMuted}`}>
                  Código, Nombre, Categoría, Talla, Color, Stock, Costo, Precio Detal, Precio
                  Mayor, Proveedor, Visible, Descripción
                </p>
              </div>
              <button
                onClick={() => setProductoImportModalOpen(false)}
                className={`rounded-xl px-3 py-1 text-xs transition-colors ${btnSecondary}`}
              >
                Cerrar
              </button>
            </div>

            <form className="space-y-3" onSubmit={importarProductosDesdeTexto}>
              <div className="flex flex-col gap-2 text-xs">
                <label className={textPrimary}>Archivo Excel (.xlsx)</label>
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null
                    setProductoImportFile(file)
                  }}
                  className="block w-full text-xs text-gray-900 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-emerald-600"
                />
                <p className={textMuted}>
                  Si no seleccionas archivo, se usará el texto pegado en el área de abajo.
                </p>
              </div>

              <textarea
                value={productoImportText}
                onChange={(e) => setProductoImportText(e.target.value)}
                rows={10}
                className={`w-full rounded-lg border px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  dm
                    ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-500'
                    : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400'
                }`}
                placeholder="Pega aquí los datos copiados desde Excel..."
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProductoImportModalOpen(false)}
                  className={`rounded-xl px-3 py-1.5 text-xs transition-colors ${btnSecondary}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors"
                >
                  <FileSpreadsheet size={13} />
                  Importar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ClienteImportModal
        open={clienteImportModalOpen}
        dm={dm}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        textMuted={textMuted}
        btnSecondary={btnSecondary}
        token={token}
        onClose={() => setClienteImportModalOpen(false)}
        onImported={cargarClientes}
      />

      <ClienteModal
        open={clienteModalOpen}
        dm={dm}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        btnSecondary={btnSecondary}
        token={token}
        clienteEditando={clienteEditando}
        onClose={() => setClienteModalOpen(false)}
        onSaved={cargarClientes}
      />
    </div>
  )
}


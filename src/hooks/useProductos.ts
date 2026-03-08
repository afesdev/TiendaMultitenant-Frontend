import type { FormEvent } from 'react'
import { useCallback, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import { API_BASE_URL } from '../config'
import type {
  Producto,
  ProductoImagen,
  ProductoImagenForm,
  ProductoVariante,
  ProductoVarianteForm,
  NuevaPromocionPayload,
} from '../types'
import { generarCodigoBarrasEAN13 } from '../utils/generarCodigoBarras'

type ProductosHookOptions = {
  onVariantesReload?: () => Promise<unknown>
}

export function useProductos(token: string, options: ProductosHookOptions = {}) {
  const { onVariantesReload } = options
  const hasUserEditedSkuRef = useRef(false)

  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [detalleOpen, setDetalleOpen] = useState(false)
  const [viendo, setViendo] = useState<Producto | null>(null)
  const [editando, setEditando] = useState<Producto | null>(null)
  const [nombre, setNombre] = useState('')
  const [codigoInterno, setCodigoInterno] = useState('')
  const [codigoBarras, setCodigoBarras] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | null>(null)
  const [proveedorId, setProveedorId] = useState<number | null>(null)
  const [descripcion, setDescripcion] = useState('')
  const [costo, setCosto] = useState(0)
  const [precioDetal, setPrecioDetal] = useState(0)
  const [precioMayor, setPrecioMayor] = useState<number | null>(null)
  const [stockActual, setStockActual] = useState(0)
  const [visible, setVisible] = useState(true)
  const [imagenes, setImagenes] = useState<ProductoImagenForm[]>([])
  const [variantes, setVariantes] = useState<ProductoVarianteForm[]>([])
  const [removedVarianteIds, setRemovedVarianteIds] = useState<number[]>([])

  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [importFile, setImportFile] = useState<File | null>(null)

  // Datos para crear una promoción en línea junto con el producto
  const [promoInlineActiva, setPromoInlineActiva] = useState(false)
  const [promoNombre, setPromoNombre] = useState('')
  const [promoDescripcion, setPromoDescripcion] = useState('')
  const [promoTipoDescuento, setPromoTipoDescuento] = useState<'PORCENTAJE' | 'FIJO'>('PORCENTAJE')
  const [promoValorDescuento, setPromoValorDescuento] = useState(0)
  const [promoMinCantidad, setPromoMinCantidad] = useState<number | null>(null)
  const [promoMinTotal, setPromoMinTotal] = useState<number | null>(null)
  const [promoAplicaSobre, setPromoAplicaSobre] = useState<string | null>('DETAL')
  const [promoFechaInicio, setPromoFechaInicio] = useState(() => {
    const d = new Date()
    return d.toISOString().slice(0, 10)
  })
  const [promoFechaFin, setPromoFechaFin] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().slice(0, 10)
  })
  const [promoActiva, setPromoActiva] = useState(true)

  const slugForSku = useCallback((name: string) => {
    return name
      .trim()
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || ''
  }, [])

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/productos`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Error al cargar productos')
      const data = (await response.json()) as Producto[]
      setProductos(data)
    } catch (err) {
      console.error(err)
      void Swal.fire('Error', 'No se pudieron cargar los productos', 'error')
    } finally {
      setLoading(false)
    }
  }, [token])

  const handleNombreChange = useCallback(
    (value: string) => {
      setNombre(value)
      if (!editando && !hasUserEditedSkuRef.current) {
        setCodigoInterno(slugForSku(value))
      }
    },
    [editando, slugForSku],
  )

  const handleCodigoInternoChange = useCallback((value: string) => {
    hasUserEditedSkuRef.current = true
    setCodigoInterno(value)
  }, [])

  const abrirVer = useCallback((prod: Producto) => {
    setViendo(prod)
    setDetalleOpen(true)
  }, [])

  const abrirNuevo = useCallback(() => {
    hasUserEditedSkuRef.current = false
    setEditando(null)
    setNombre('')
    setCodigoInterno('')
    setCodigoBarras('')
    setCategoriaId(null)
    setProveedorId(null)
    setDescripcion('')
    setCosto(0)
    setPrecioDetal(0)
    setPrecioMayor(null)
    setStockActual(0)
    setVisible(true)
    setImagenes([])
    setVariantes([])
    setRemovedVarianteIds([])
    setFormOpen(true)
  }, [])

  const abrirEditar = useCallback(
    async (prod: Producto) => {
      setEditando(prod)
      setNombre(prod.Nombre)
      setCodigoInterno(prod.CodigoInterno)
      setCodigoBarras(prod.CodigoBarras ?? '')
      setCategoriaId(prod.Categoria_Id)
      setProveedorId(prod.Proveedor_Id)
      setDescripcion(prod.Descripcion ?? '')
      setCosto(prod.Costo)
      setPrecioDetal(prod.PrecioDetal)
      setPrecioMayor(prod.PrecioMayor)
      setStockActual(prod.StockActual)
      setVisible(prod.Visible)
      setRemovedVarianteIds([])
      setFormOpen(true)

      const [variantesRes, imagenesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/productos/variantes`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => (r.ok ? r.json() : []) as Promise<ProductoVariante[]>),
        fetch(`${API_BASE_URL}/productos/${prod.Id}/imagenes`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => (r.ok ? r.json() : []) as Promise<ProductoImagen[]>),
      ])
      setImagenes(
        imagenesRes.map((i) => ({
          id: i.Id,
          url: i.Url,
          esPrincipal: i.EsPrincipal,
        })),
      )
      setVariantes(
        variantesRes
          .filter((v) => v.Producto_Id === prod.Id)
          .map((v) => ({
            id: v.Id,
            atributo: v.Atributo as 'Talla' | 'Color',
            valor: v.Valor,
            precioAdicional: v.PrecioAdicional,
            stockActual: v.StockActual,
            codigoSKU: v.CodigoSKU ?? '',
            codigoBarras: v.CodigoBarras ?? '',
          })),
      )
    },
    [token],
  )

  const addVariante = useCallback(() => {
    setVariantes((prev) => [
      ...prev,
      { atributo: 'Talla', valor: '', precioAdicional: 0, stockActual: 0, codigoSKU: '', codigoBarras: '' },
    ])
  }, [])

  const removeVariante = useCallback((index: number) => {
    setVariantes((prev) => {
      const item = prev[index]
      if (item?.id != null) {
        setRemovedVarianteIds((ids) => [...ids, item.id!])
      }
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const updateVariante = useCallback(
    (index: number, field: keyof ProductoVarianteForm, value: string | number) => {
      setVariantes((prev) =>
        prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
      )
    },
    [],
  )

  const addImagen = useCallback((file: File) => {
    const url = URL.createObjectURL(file)
    setImagenes((prev) => {
      const isFirst = prev.length === 0
      return [...prev, { url, file, esPrincipal: isFirst }]
    })
  }, [])

  const removeImagen = useCallback(
    async (index: number) => {
      const item = imagenes[index]
      if (item?.id != null && editando) {
        try {
          const res = await fetch(`${API_BASE_URL}/productos/imagenes/${item.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!res.ok) throw new Error()
        } catch {
          void Swal.fire('Error', 'No se pudo eliminar la imagen', 'error')
          return
        }
      }
      if (item?.url?.startsWith('blob:')) URL.revokeObjectURL(item.url)
      setImagenes((prev) => prev.filter((_, i) => i !== index))
    },
    [token, editando, imagenes],
  )

  const setPrincipalImagen = useCallback(
    async (index: number) => {
      const item = imagenes[index]
      if (item?.id != null && editando) {
        try {
          const res = await fetch(`${API_BASE_URL}/productos/imagenes/${item.id}/principal`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!res.ok) throw new Error()
        } catch {
          void Swal.fire('Error', 'No se pudo establecer como principal', 'error')
          return
        }
      }
      setImagenes((prev) =>
        prev.map((img, i) => ({ ...img, esPrincipal: i === index })),
      )
    },
    [token, editando, imagenes],
  )

  const guardar = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!nombre || !codigoInterno || !precioDetal) {
        void Swal.fire(
          'Campos obligatorios',
          'Nombre, código interno y precio detal son requeridos',
          'warning',
        )
        return
      }
      try {
        const isEdit = Boolean(editando)
        const url = isEdit
          ? `${API_BASE_URL}/productos/${editando!.Id}`
          : `${API_BASE_URL}/productos`
        const method = isEdit ? 'PUT' : 'POST'
        const codigoBarrasProducto = codigoBarras.trim() || generarCodigoBarrasEAN13()
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre,
            codigoInterno,
            codigoBarras: codigoBarrasProducto || null,
            proveedorId,
            categoriaId,
            descripcion: descripcion || null,
            costo,
            precioDetal,
            precioMayor,
            stockActual,
            visible,
          }),
        })
        const data = (await response.json()) as Producto | { message?: string }
        if (!response.ok) {
          const message = 'message' in data ? data.message : 'Error al guardar el producto'
          throw new Error(message)
        }
        const savedProduct = data as Producto
        const productId = savedProduct.Id

        const imagenesConArchivo = imagenes.filter((img) => img.file)
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

        const variantesToSync = variantes.filter((v) => v.valor.trim() !== '')
        for (const v of variantesToSync) {
          const codigoBarrasFinal = v.codigoBarras?.trim() || generarCodigoBarrasEAN13()
          const payload = {
            productoId: productId,
            atributo: v.atributo,
            valor: v.valor.trim(),
            stockActual: v.stockActual,
            precioAdicional: v.precioAdicional,
            codigoSKU: v.codigoSKU.trim() || null,
            codigoBarras: codigoBarrasFinal || null,
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
                  codigoBarras: payload.codigoBarras,
                }),
              },
            )
            if (!putRes.ok) {
              const bodyPut = await putRes.json().catch(() => null)
              throw new Error((bodyPut as { message?: string })?.message ?? 'Error al actualizar variante')
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
              throw new Error((bodyPost as { message?: string })?.message ?? 'Error al crear variante')
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
            throw new Error((bodyDel as { message?: string })?.message ?? 'Error al eliminar variante')
          }
        }

        // Si se ha configurado una promoción en línea y los datos son válidos, crearla ahora
        if (promoInlineActiva && promoValorDescuento > 0) {
          const payloadPromo: NuevaPromocionPayload = {
            nombre: promoNombre.trim() || `Promo ${savedProduct.Nombre}`.slice(0, 200),
            descripcion: promoDescripcion.trim() || undefined,
            tipoDescuento: promoTipoDescuento,
            valorDescuento: promoValorDescuento,
            tipoAplicacion: 'PRODUCTO',
            minCantidad: promoMinCantidad ?? null,
            minTotal: promoMinTotal ?? null,
            aplicaSobre: promoAplicaSobre || null,
            fechaInicio: promoFechaInicio,
            fechaFin: promoFechaFin,
            activo: promoActiva,
            productos: [
              {
                productoId: productId,
                varianteId: null,
              },
            ],
          }

          try {
            const resPromo = await fetch(`${API_BASE_URL}/promociones`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(payloadPromo),
            })
            const bodyPromo = (await resPromo.json().catch(() => null)) as
              | { message?: string }
              | null
            if (!resPromo.ok) {
              const msg = bodyPromo?.message ?? 'Error al crear la promoción'
              throw new Error(msg)
            }
          } catch (err) {
            // No revertimos el producto; solo informamos que la promo falló
            void Swal.fire(
              'Producto guardado con advertencia',
              err instanceof Error
                ? `El producto se guardó, pero la promoción no pudo crearse: ${err.message}`
                : 'El producto se guardó, pero la promoción no pudo crearse.',
              'warning',
            )
          }
        }

        await cargar()
        await onVariantesReload?.()
        setFormOpen(false)
        setImagenes([])
        setVariantes([])
        setRemovedVarianteIds([])
        // No reiniciamos todos los campos de promo para permitir reutilizarlos en siguientes productos
        void Swal.fire(
          'Guardado',
          isEdit ? 'Producto actualizado correctamente' : 'Producto creado correctamente',
          'success',
        )
      } catch (err) {
        void Swal.fire(
          'Error',
          err instanceof Error ? err.message : 'Error al guardar el producto',
          'error',
        )
      }
    },
    [
      token,
      nombre,
      codigoInterno,
      codigoBarras,
      categoriaId,
      proveedorId,
      descripcion,
      costo,
      precioDetal,
      precioMayor,
      stockActual,
      visible,
      editando,
      imagenes,
      variantes,
      removedVarianteIds,
      cargar,
      onVariantesReload,
    ],
  )

  const eliminar = useCallback(
    async (prod: Producto) => {
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
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error((body as { message?: string })?.message ?? 'Error al eliminar el producto')
        }
        await cargar()
        void Swal.fire('Eliminado', 'El producto se ha eliminado correctamente', 'success')
      } catch (err) {
        void Swal.fire(
          'Error',
          err instanceof Error ? err.message : 'Error al eliminar el producto',
          'error',
        )
      }
    },
    [token, cargar],
  )

  const abrirImportModal = useCallback(() => {
    setImportText('')
    setImportFile(null)
    setImportModalOpen(true)
  }, [])

  const importarDesdeExcel = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      type Row = {
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
      }
      let rows: Row[] | null = null

      if (importFile) {
        try {
          const XLSX = await import('xlsx')
          const buffer = await importFile.arrayBuffer()
          const workbook = XLSX.read(buffer, { type: 'array' })
          const sheet = workbook.Sheets[workbook.SheetNames[0]]
          const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
          rows = json.map((row) => ({
            Codigo: String(row.Codigo ?? row.codigo ?? row['Código'] ?? '').trim(),
            Nombre: String(row.Nombre ?? row.nombre ?? '').trim(),
            Categoria: String(
              row.Categoria ?? row.categoria ?? row['Categoría'] ?? row['categoria'] ?? '',
            ).trim() || undefined,
            Talla: String(row.Talla ?? row.talla ?? '').trim() || undefined,
            Color: String(row.Color ?? row.color ?? '').trim() || undefined,
            Stock: row.Stock !== undefined && row.Stock !== '' ? Number(row.Stock) : undefined,
            Costo: row.Costo !== undefined && row.Costo !== '' ? Number(row.Costo) : undefined,
            PrecioDetal: (() => {
              const v =
                (row as Record<string, unknown>).PrecioDetal ??
                (row as Record<string, unknown>)['Precio Detal'] ??
                (row as Record<string, unknown>)['precio detal']
              return v !== undefined && v !== '' ? Number(v) : undefined
            })(),
            PrecioMayor: (() => {
              const v =
                (row as Record<string, unknown>).PrecioMayor ??
                (row as Record<string, unknown>)['Precio Mayor'] ??
                (row as Record<string, unknown>)['precio mayor']
              return v !== undefined && v !== '' ? Number(v) : undefined
            })(),
            Proveedor: String(row.Proveedor ?? row.proveedor ?? '').trim() || undefined,
            Visible: String(row.Visible ?? row.visible ?? '').trim() || undefined,
            Descripcion: String(
              row.Descripcion ?? row.descripcion ?? (row as Record<string, unknown>)['Descripción'] ?? '',
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
        const raw = importText.trim()
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
        rows = dataLines.map((line) => {
          const parts = line.split(/\t|;|,/).map((p) => p.trim())
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
          ] = parts
          return {
            Codigo: codigo ?? '',
            Nombre: nombre ?? '',
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
          }
        })
      }

      if (!rows?.length) {
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
          throw new Error((body as { message?: string })?.message ?? 'Error al importar productos')
        }
        const summary = (await response.json()) as {
          total: number
          exitosos: number
          conErrores: number
        }
        setImportModalOpen(false)
        void Swal.fire(
          'Importación completada',
          `Total filas: ${summary.total}\nExitosos: ${summary.exitosos}\nCon errores: ${summary.conErrores}`,
          'success',
        )
        await cargar()
        await onVariantesReload?.()
      } catch (err) {
        void Swal.fire(
          'Error',
          err instanceof Error ? err.message : 'Error al importar productos',
          'error',
        )
      }
    },
    [token, importFile, importText, cargar, onVariantesReload],
  )

  return {
    productos,
    loading,
    cargar,
    formOpen,
    setFormOpen,
    editando,
    nombre,
    setNombre: handleNombreChange,
    codigoInterno,
    setCodigoInterno: handleCodigoInternoChange,
    codigoBarras,
    setCodigoBarras,
    categoriaId,
    setCategoriaId,
    proveedorId,
    setProveedorId,
    descripcion,
    setDescripcion,
    costo,
    setCosto,
    precioDetal,
    setPrecioDetal,
    precioMayor,
    setPrecioMayor,
    stockActual,
    setStockActual,
    visible,
    setVisible,
    imagenes,
    addImagen,
    removeImagen,
    setPrincipalImagen,
    variantes,
    addVariante,
    removeVariante,
    updateVariante,
    guardar,
    eliminar,
    abrirNuevo,
    abrirEditar,
    abrirVer,
    detalleOpen,
    setDetalleOpen,
    viendo,
    importModalOpen,
    setImportModalOpen,
    importText,
    setImportText,
    importFile,
    setImportFile,
    abrirImportModal,
    importarDesdeExcel,
    // Promoción en línea ligada al producto
    promoInlineActiva,
    setPromoInlineActiva,
    promoNombre,
    setPromoNombre,
    promoDescripcion,
    setPromoDescripcion,
    promoTipoDescuento,
    setPromoTipoDescuento,
    promoValorDescuento,
    setPromoValorDescuento,
    promoMinCantidad,
    setPromoMinCantidad,
    promoMinTotal,
    setPromoMinTotal,
    promoAplicaSobre,
    setPromoAplicaSobre,
    promoFechaInicio,
    setPromoFechaInicio,
    promoFechaFin,
    setPromoFechaFin,
    promoActiva,
    setPromoActiva,
  }
}

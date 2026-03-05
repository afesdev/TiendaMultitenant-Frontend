import { useState, useRef, useEffect } from 'react'
import JsBarcode from 'jsbarcode'
import {
  ArrowLeft,
  Save,
  Tag,
  DollarSign,
  Box,
  FileText,
  Image as ImageIcon,
  Layers,
  Plus,
  Trash2,
  Star,
  Download,
  Barcode,
} from 'lucide-react'
import type { FormEvent } from 'react'
import type { Categoria, Producto, ProductoImagenForm, ProductoVarianteForm, Proveedor } from '../types'

const cardClass = (dm: boolean) =>
  dm
    ? 'bg-slate-900/50 border border-slate-700/80 shadow-xl shadow-slate-950/30'
    : 'bg-white border border-slate-200/80 shadow-lg shadow-slate-200/20'

const inputClass = (dm: boolean) =>
  `w-full rounded-xl border px-4 py-3 text-sm sm:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 min-h-[2.75rem] sm:min-h-0 ${
    dm ? 'bg-slate-800/80 border-slate-600 text-slate-100 placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
  }`

const labelClass = (textPrimary: string) =>
  `block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 ${textPrimary}`

const SECTIONS = [
  { id: 'general', label: 'General', icon: FileText },
  { id: 'precios', label: 'Precios', icon: DollarSign },
  { id: 'imagenes', label: 'Imágenes', icon: ImageIcon },
  { id: 'variantes', label: 'Variantes', icon: Layers },
  { id: 'clasificacion', label: 'Clasificación', icon: Tag },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

interface ProductoFormViewProps {
  dm: boolean
  textPrimary: string
  textSecondary: string
  textMuted: string
  btnSecondary: string
  productoEditando: Producto | null
  categorias: Categoria[]
  proveedores: Proveedor[]
  prodNombre: string
  prodCodigoInterno: string
  prodCodigoBarras: string
  prodCategoriaId: number | null
  prodProveedorId: number | null
  prodDescripcion: string
  prodCosto: number
  prodPrecioDetal: number
  prodPrecioMayor: number | null
  prodStockActual: number
  prodVisible: boolean
  prodImagenes: ProductoImagenForm[]
  onAddImagen: (file: File) => void
  onRemoveImagen: (index: number) => void
  onSetPrincipalImagen: (index: number) => void
  onBack: () => void
  setProdNombre: (v: string) => void
  setProdCodigoInterno: (v: string) => void
  setProdCodigoBarras: (v: string) => void
  setProdCategoriaId: (v: number | null) => void
  setProdProveedorId: (v: number | null) => void
  setProdDescripcion: (v: string) => void
  setProdCosto: (v: number) => void
  setProdPrecioDetal: (v: number) => void
  setProdPrecioMayor: (v: number | null) => void
  setProdStockActual: (v: number) => void
  setProdVisible: (v: boolean) => void
  prodVariantes: ProductoVarianteForm[]
  onAddVariante: () => void
  onRemoveVariante: (index: number) => void
  onUpdateVariante: (index: number, field: keyof ProductoVarianteForm, value: string | number) => void
  onSubmit: (e: FormEvent) => void
}

export function ProductoFormView({
  dm,
  textPrimary,
  textSecondary,
  textMuted: _textMuted,
  btnSecondary: _btnSecondary,
  productoEditando,
  categorias,
  proveedores,
  prodNombre,
  prodCodigoInterno,
  prodCodigoBarras,
  prodCategoriaId,
  prodProveedorId,
  prodDescripcion,
  prodCosto,
  prodPrecioDetal,
  prodPrecioMayor,
  prodStockActual,
  prodVisible,
  prodImagenes,
  onAddImagen,
  onRemoveImagen,
  onSetPrincipalImagen,
  onBack,
  setProdNombre,
  setProdCodigoInterno,
  setProdCodigoBarras,
  setProdCategoriaId,
  setProdProveedorId,
  setProdDescripcion,
  setProdCosto,
  setProdPrecioDetal,
  setProdPrecioMayor,
  setProdStockActual,
  setProdVisible,
  prodVariantes,
  onAddVariante,
  onRemoveVariante,
  onUpdateVariante,
  onSubmit,
}: ProductoFormViewProps) {
  const [activeSection, setActiveSection] = useState<SectionId>('general')
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null)
  const [barcodeError, setBarcodeError] = useState<string | null>(null)

  useEffect(() => {
    const code = prodCodigoBarras.trim()
    if (!code) {
      setBarcodeError(null)
      return
    }
    // Si estamos en Clasificación el canvas ya está en el DOM; si no, esperar al siguiente frame cuando se cambie de pestaña
    const canvas = barcodeCanvasRef.current
    if (!canvas) return
    setBarcodeError(null)
    try {
      const format = /^\d{12,13}$/.test(code) ? 'EAN13' : 'CODE128'
      JsBarcode(canvas, code, {
        format,
        width: 2,
        height: 60,
        displayValue: true,
        fontSize: 14,
        margin: 8,
        lineColor: dm ? '#e2e8f0' : '#0f172a',
        background: dm ? '#1e293b' : '#ffffff',
      })
    } catch {
      setBarcodeError('Código no válido para este formato. Prueba CODE128 (cualquier texto) o EAN-13 (12-13 dígitos).')
    }
  }, [prodCodigoBarras, dm, activeSection])

  const descargarCodigoBarras = () => {
    const code = prodCodigoBarras.trim()
    if (!code) return
    try {
      // Generar la imagen en un canvas temporal para no depender del canvas visible (más fiable para la descarga)
      const canvas = document.createElement('canvas')
      JsBarcode(canvas, code, {
        format: /^\d{12,13}$/.test(code) ? 'EAN13' : 'CODE128',
        width: 2,
        height: 60,
        displayValue: true,
        fontSize: 14,
        margin: 8,
        lineColor: '#0f172a',
        background: '#ffffff',
      })
      const dataUrl = canvas.toDataURL('image/png')
      const nombre = (prodNombre || 'producto').replace(/[^a-z0-9_-]/gi, '_').slice(0, 40)
      const fileName = `codigo-barras-${nombre}-${code}.png`
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = fileName
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      setBarcodeError('No se pudo generar la imagen.')
    }
  }

  return (
    <div className="min-h-0 w-full max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Barra superior: título + acciones */}
      <header
        className={`sticky top-0 z-10 ${
          dm ? 'bg-slate-900/95 border-b border-slate-700/80' : 'bg-white border-b border-slate-200'
        }`}
      >
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                onClick={onBack}
                className={`p-2.5 rounded-xl shrink-0 touch-manipulation transition-colors ${
                  dm ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                }`}
                title="Volver al catálogo"
                type="button"
              >
                <ArrowLeft size={22} />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className={`text-lg sm:text-xl font-bold truncate ${textPrimary}`}>
                  {productoEditando ? 'Editar producto' : 'Nuevo producto'}
                </h1>
                <p className={`mt-0.5 text-sm truncate ${textSecondary}`}>
                  {productoEditando ? productoEditando.Nombre : 'Completa la información por secciones.'}
                </p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={onBack}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors touch-manipulation ${
                  dm ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                Cancelar
              </button>
              <button
                form="producto-form"
                type="submit"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600 active:scale-[0.98] transition-all touch-manipulation shadow-sm"
              >
                <Save size={18} aria-hidden />
                <span className="whitespace-nowrap">{productoEditando ? 'Guardar' : 'Publicar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs de secciones: integrados como navegación secundaria */}
        <nav
          className={`overflow-x-auto ${
            dm ? 'bg-slate-800/50 border-t border-slate-700/60' : 'bg-slate-50/80 border-t border-slate-200'
          }`}
          aria-label="Secciones del formulario"
        >
          <div className="flex gap-0.5 min-w-max px-4 sm:px-6 lg:px-8 py-1.5">
            {SECTIONS.map(({ id, label, icon: Icon }) => {
              const isActive = activeSection === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveSection(id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap touch-manipulation ${
                    isActive
                      ? dm
                        ? 'bg-slate-700 text-emerald-400'
                        : 'bg-white text-emerald-600 shadow-sm border border-slate-200'
                      : dm
                        ? 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                        : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                  }`}
                >
                  <Icon size={17} className="shrink-0 opacity-80" />
                  {label}
                </button>
              )
            })}
          </div>
        </nav>
      </header>

      <form id="producto-form" onSubmit={onSubmit} className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className={cardClass(dm) + ' rounded-2xl p-5 sm:p-6 lg:p-8 shadow-lg'}>

          {/* Sección: General */}
          {activeSection === 'general' && (
            <section className="space-y-6">
              <h2 className={`text-lg font-bold flex items-center gap-2 ${textPrimary}`}>
                <FileText size={20} className="text-emerald-500 shrink-0" />
                Información general
              </h2>
              <div className="space-y-5">
                <div>
                  <label className={labelClass(textPrimary)}>Nombre del producto</label>
                  <input
                    type="text"
                    value={prodNombre}
                    onChange={(e) => setProdNombre(e.target.value)}
                    className={inputClass(dm)}
                    placeholder="Ej. Zapatillas Running Pro 2024"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass(textPrimary)}>Descripción</label>
                  <textarea
                    value={prodDescripcion}
                    onChange={(e) => setProdDescripcion(e.target.value)}
                    rows={10}
                    className={`${inputClass(dm)} resize-y min-h-[14rem] sm:min-h-[18rem]`}
                    placeholder="Características principales, materiales, cuidados..."
                  />
                </div>
              </div>
            </section>
          )}

          {/* Sección: Precios */}
          {activeSection === 'precios' && (
            <section className="space-y-6">
              <h2 className={`text-lg font-bold flex items-center gap-2 ${textPrimary}`}>
                <DollarSign size={20} className="text-emerald-500 shrink-0" />
                Precios e inventario
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <div>
                  <label className={labelClass(textPrimary)}>Precio venta</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                    <input type="number" value={prodPrecioDetal} onChange={(e) => setProdPrecioDetal(Number(e.target.value) || 0)} className={`${inputClass(dm)} pl-8`} min={0} required />
                  </div>
                </div>
                <div>
                  <label className={labelClass(textPrimary)}>Precio mayor</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                    <input type="number" value={prodPrecioMayor ?? ''} onChange={(e) => setProdPrecioMayor(e.target.value === '' ? null : Number(e.target.value) || 0)} className={`${inputClass(dm)} pl-8`} min={0} />
                  </div>
                </div>
                <div>
                  <label className={labelClass(textPrimary)}>Costo</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                    <input type="number" value={prodCosto} onChange={(e) => setProdCosto(Number(e.target.value) || 0)} className={`${inputClass(dm)} pl-8`} min={0} />
                  </div>
                </div>
                <div>
                  <label className={labelClass(textPrimary)}>Stock inicial</label>
                  <div className="relative">
                    <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="number" value={prodStockActual} onChange={(e) => setProdStockActual(Number(e.target.value) || 0)} className={`${inputClass(dm)} pl-10`} min={0} />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Sección: Imágenes */}
          {activeSection === 'imagenes' && (
            <section className="space-y-6">
              <h2 className={`text-lg font-bold flex items-center gap-2 ${textPrimary}`}>
                <ImageIcon size={20} className="text-emerald-500 shrink-0" />
                Imágenes del producto
              </h2>
              <p className={`text-sm ${textSecondary}`}>
                La primera o la marcada como principal se usará en el catálogo. Puedes subir varias.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {prodImagenes.map((img, index) => (
                  <div
                    key={index}
                    className={`relative group rounded-xl overflow-hidden border-2 ${
                      img.esPrincipal ? 'border-emerald-500 ring-2 ring-emerald-500/30' : dm ? 'border-slate-700' : 'border-slate-200'
                    }`}
                  >
                    <div className="aspect-square bg-slate-100 dark:bg-slate-800/50">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </div>
                    {img.esPrincipal && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-xs font-bold flex items-center gap-1">
                        <Star size={12} fill="currentColor" /> Principal
                      </span>
                    )}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!img.esPrincipal && (
                        <button
                          type="button"
                          onClick={() => onSetPrincipalImagen(index)}
                          className="p-2 rounded-lg bg-white/90 text-slate-800 hover:bg-white transition-colors"
                          title="Establecer como principal"
                        >
                          <Star size={18} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onRemoveImagen(index)}
                        className="p-2 rounded-lg bg-red-500/90 text-white hover:bg-red-500 transition-colors"
                        title="Quitar imagen"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                <label className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors min-h-[120px] bg-slate-50 dark:bg-slate-800/30 border-slate-300 dark:border-slate-600 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10">
                  <Plus size={28} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-500">Agregar</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) onAddImagen(file)
                      e.target.value = ''
                    }}
                  />
                </label>
              </div>
            </section>
          )}

          {/* Sección: Variantes */}
          {activeSection === 'variantes' && (
            <section className="space-y-6">
              <h2 className={`text-lg font-bold flex items-center gap-2 ${textPrimary}`}>
                <Layers size={20} className="text-emerald-500 shrink-0" />
                Variantes (talla, color)
              </h2>
              <p className={`text-sm ${textSecondary}`}>Opcional. Agrega tallas, colores u otras variaciones.</p>
              <div className="space-y-4">
                {prodVariantes.map((v, index) => (
                  <div key={index} className={`rounded-xl border p-4 sm:p-5 ${dm ? 'border-slate-700 bg-slate-800/40' : 'border-slate-200 bg-slate-50/80'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap md:items-end gap-3 sm:gap-4">
                      <div className="w-full md:w-24">
                        <label className={labelClass(textPrimary)}>Atributo</label>
                        <select value={v.atributo} onChange={(e) => onUpdateVariante(index, 'atributo', e.target.value as 'Talla' | 'Color')} className={inputClass(dm)}>
                          <option value="Talla">Talla</option>
                          <option value="Color">Color</option>
                        </select>
                      </div>
                      <div className="w-full md:flex-1 md:min-w-[120px]">
                        <label className={labelClass(textPrimary)}>Valor</label>
                        <input type="text" value={v.valor} onChange={(e) => onUpdateVariante(index, 'valor', e.target.value)} placeholder="S, M, Rojo..." className={inputClass(dm)} />
                      </div>
                      <div className="w-full md:w-20">
                        <label className={labelClass(textPrimary)}>Stock</label>
                        <input type="number" value={v.stockActual} onChange={(e) => onUpdateVariante(index, 'stockActual', Number(e.target.value) || 0)} min={0} className={`${inputClass(dm)} font-mono`} />
                      </div>
                      <div className="w-full md:w-24">
                        <label className={labelClass(textPrimary)}>Precio +</label>
                        <input type="number" value={v.precioAdicional} onChange={(e) => onUpdateVariante(index, 'precioAdicional', Number(e.target.value) || 0)} min={0} className={`${inputClass(dm)} font-mono`} />
                      </div>
                      <div className="w-full md:w-28">
                        <label className={labelClass(textPrimary)}>SKU</label>
                        <input type="text" value={v.codigoSKU} onChange={(e) => onUpdateVariante(index, 'codigoSKU', e.target.value)} placeholder="Opcional" className={`${inputClass(dm)} font-mono text-sm`} />
                      </div>
                      <button type="button" onClick={() => onRemoveVariante(index)} className={`self-end md:self-auto p-2.5 rounded-xl transition-colors ${dm ? 'text-slate-400 hover:bg-slate-700 hover:text-red-400' : 'text-slate-500 hover:bg-red-50 hover:text-red-600'}`} title="Quitar variante">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={onAddVariante} className={`flex items-center justify-center gap-2 w-full min-h-[3rem] py-3 rounded-xl border-2 border-dashed ${dm ? 'border-slate-600 text-slate-400 hover:border-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10' : 'border-slate-300 text-slate-500 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'}`}>
                  <Plus size={20} /> <span className="text-sm font-bold">Agregar variante</span>
                </button>
              </div>
            </section>
          )}

          {/* Sección: Clasificación */}
          {activeSection === 'clasificacion' && (
            <section className="space-y-6">
              <h2 className={`text-lg font-bold flex items-center gap-2 ${textPrimary}`}>
                <Tag size={20} className="text-emerald-500 shrink-0" />
                Clasificación, códigos y visibilidad
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass(textPrimary)}>Categoría</label>
                  <select value={prodCategoriaId ?? ''} onChange={(e) => setProdCategoriaId(e.target.value ? Number(e.target.value) : null)} className={inputClass(dm)}>
                    <option value="">Sin categoría</option>
                    {categorias.map((c) => (<option key={c.Id} value={c.Id}>{c.Nombre}</option>))}
                  </select>
                </div>
                <div>
                  <label className={labelClass(textPrimary)}>Proveedor</label>
                  <select value={prodProveedorId ?? ''} onChange={(e) => setProdProveedorId(e.target.value ? Number(e.target.value) : null)} className={inputClass(dm)}>
                    <option value="">Sin proveedor</option>
                    {proveedores.filter((p) => p.Activo).map((p) => (<option key={p.Id} value={p.Id}>{p.Nombre}</option>))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass(textPrimary)}>SKU / Referencia</label>
                  <input type="text" value={prodCodigoInterno} onChange={(e) => setProdCodigoInterno(e.target.value)} className={`${inputClass(dm)} font-mono`} placeholder="REF-001" required />
                </div>
                <div className="space-y-3">
                  <div>
                    <label className={labelClass(textPrimary)}>Código de barras</label>
                    <input type="text" value={prodCodigoBarras} onChange={(e) => setProdCodigoBarras(e.target.value)} className={`${inputClass(dm)} font-mono`} placeholder="770... o cualquier texto (CODE128)" />
                  </div>
                  {prodCodigoBarras.trim() && (
                    <div className={`rounded-xl border p-3 sm:p-4 ${dm ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <p className={`text-xs font-semibold mb-2 flex items-center gap-1.5 ${textSecondary}`}>
                        <Barcode size={14} className={dm ? 'text-emerald-400' : 'text-emerald-600'} />
                        Previsualización
                      </p>
                      {barcodeError ? (
                        <p className={`text-sm ${dm ? 'text-amber-400' : 'text-amber-600'}`}>{barcodeError}</p>
                      ) : (
                        <div className="flex flex-wrap items-center gap-3">
                          <canvas ref={barcodeCanvasRef} className="max-w-full h-auto min-h-[44px]" aria-label="Previsualización del código de barras" />
                          <button
                            type="button"
                            onClick={descargarCodigoBarras}
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors shrink-0"
                          >
                            <Download size={14} />
                            Descargar PNG
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className={labelClass(textPrimary)}>Visibilidad</label>
                <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${dm ? 'border-slate-700 bg-slate-800/40 hover:bg-slate-800/60' : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100'}`}>
                  <input type="checkbox" checked={prodVisible} onChange={(e) => setProdVisible(e.target.checked)} className="h-5 w-5 rounded-md text-emerald-500 focus:ring-2 focus:ring-emerald-500/50 border-slate-300 cursor-pointer" />
                  <div>
                    <span className={`block text-sm font-bold ${textPrimary}`}>Producto visible</span>
                    <span className={`block text-xs mt-0.5 ${textSecondary}`}>Aparece en el catálogo</span>
                  </div>
                </label>
              </div>
            </section>
          )}
        </div>
      </form>
    </div>
  )
}

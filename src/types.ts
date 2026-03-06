export interface LoginResponse {
  token: string
  user: {
    id: number
    nombre: string
    email: string
    rolNombre: string
  }
  tienda: {
    id: string
    nombreComercial: string
    slug: string
  }
}

export type AuthUser = LoginResponse['user']
export type AuthTienda = LoginResponse['tienda']

export interface Categoria {
  Id: number
  Nombre: string
  Slug: string
  CategoriaPadre_Id: number | null
  Visible: boolean
}

export interface Producto {
  Id: number
  Nombre: string
  CodigoInterno: string
  CodigoBarras: string | null
  Costo: number
  PrecioDetal: number
  PrecioMayor: number | null
  StockActual: number
  Visible: boolean
  Categoria_Id: number | null
  CategoriaNombre: string | null
  Proveedor_Id: number | null
  ProveedorNombre: string | null
  Descripcion?: string | null
  ImagenUrl?: string | null
  FechaCreacion?: string | null
  FechaModificacion?: string | null
}

export interface ProductoImagen {
  Id: number
  Url: string
  EsPrincipal: boolean
  Orden: number
}

/** Imagen en el formulario: id+url si ya está en BD; file+url si es nueva (preview). */
export interface ProductoImagenForm {
  id?: number
  url: string
  file?: File
  esPrincipal?: boolean
}

export interface Repartidor {
  Id: number
  Nombre: string
  Telefono: string
  DocumentoIdentidad: string | null
  Vehiculo: string | null
  Placa: string | null
  Disponible: boolean
  Activo: boolean
  FechaRegistro: string
}

export interface Cliente {
  Id: number
  Cedula: string
  Nombre: string
  Email: string | null
  Celular: string | null
  Direccion: string | null
  Ciudad: string | null
  FechaRegistro: string
}

export interface Proveedor {
  Id: number
  Nombre: string
  Contacto: string | null
  Telefono: string | null
  Email: string | null
  Activo: boolean
}

export interface ProductoVariante {
  Id: number
  Producto_Id: number
  ProductoNombre: string
  CodigoInterno: string
  Atributo: string
  Valor: string
  PrecioAdicional: number
  StockActual: number
  CodigoSKU: string | null
}

/** Variante en el formulario de producto (crear/editar). id solo si ya existe en BD. */
export interface ProductoVarianteForm {
  id?: number
  atributo: 'Talla' | 'Color'
  valor: string
  precioAdicional: number
  stockActual: number
  codigoSKU: string
}

export interface VentaResumen {
  Id: number
  Fecha: string
  TipoVenta: string | null
  TipoEntrega: string | null
  MetodoPago: string | null
  Subtotal: number
  DescuentoTotal: number
  Total: number
  Observacion: string | null
  ClienteId: number
  ClienteNombre: string
  RepartidorId: number | null
  RepartidorNombre: string | null
}

export interface VentaDetalleLinea {
  Id: number
  Producto_Id: number
  ProductoNombre: string
  CodigoInterno: string
  CodigoBarras: string | null
  ImagenUrl: string | null
  Variante_Id: number | null
  VarianteAtributo: string | null
  VarianteValor: string | null
  VarianteCodigoSKU: string | null
  Cantidad: number
  PrecioUnitario: number
  Importe: number
}

export interface MovimientoInventario {
  Id: number
  Fecha: string
  TipoMovimiento: string
  Cantidad: number
  Motivo: string | null
  Producto_Id: number
  ProductoNombre: string
  CodigoInterno: string
  CodigoBarras: string | null
  ImagenUrl: string | null
  Variante_Id: number | null
  VarianteAtributo: string | null
  VarianteValor: string | null
  VarianteCodigoSKU: string | null
}

export interface TiendaConfigTheme {
  primaryColor: string
  sidebarBg: string
  navbarBg: string
}

export interface TiendaConfigSocial {
  facebook?: string
  instagram?: string
  whatsapp?: string
  tiktok?: string
}

export interface TiendaConfig {
  theme: TiendaConfigTheme
  social: TiendaConfigSocial
}

export interface TiendaPanel {
  id: string
  nombreComercial: string
  slug: string
  emailContacto: string
  configuracion: TiendaConfig | null
  activo: boolean
  fechaCreacion: string
}


export interface VentaConDetalle {
  cabecera: VentaResumen
  detalle: VentaDetalleLinea[]
}

export interface NuevaVentaItem {
  productoId: number
  cantidad: number
  precioUnitario: number
  varianteId?: number | null
}

export interface NuevaVentaPayload {
  clienteId: number
  repartidorId?: number | null
  tipoVenta?: string
  tipoEntrega?: string
  metodoPago?: string
  observacion?: string
   descuentoTotal?: number
  items: NuevaVentaItem[]
}



import { useEffect, useState, useCallback } from 'react'
import { Sidebar } from '../components/Sidebar'
import { Navbar } from '../components/Navbar'
import { VarianteModal } from '../components/VarianteModal'
import { CategoriaModal } from '../components/CategoriaModal'
import { ProveedorModal } from '../components/ProveedorModal'
import { RepartidorModal } from '../components/RepartidorModal'
import { VentaDetalleView } from '../components/VentaViewModal'
import { ApartadoDetalleView } from '../components/ApartadoView'
import { ClienteImportModal } from '../components/ClienteImportModal'
import { ClienteModal } from '../components/ClienteModal'
import { ProductoImportModal } from '../components/ProductoImportModal'
import { ProductoDetalleView } from '../components/ProductoDetalleView'
import { DashboardView } from '../views/DashboardView'
import { CategoriasView } from '../views/CategoriasView'
import { ProductosView } from '../views/ProductosView'
import { ProductoFormView } from '../views/ProductoFormView'
import { VariantesView } from '../views/VariantesView'
import { ProveedoresView } from '../views/ProveedoresView'
import { RepartidoresView } from '../views/RepartidoresView'
import { ClientesView } from '../views/ClientesView'
import { VentasView } from '../views/VentasView'
import { VentaFormView } from '../views/VentaFormView'
import { ApartadosView } from '../views/ApartadosView'
import { ApartadoFormView } from '../views/ApartadoFormView'
import { PromocionesView } from '../views/PromocionesView'
import { PromocionFormView } from '../views/PromocionFormView'
import { MovimientosInventarioView } from '../views/MovimientosInventarioView'
import { TiendaView } from '../views/TiendaView'
import { ReportesView } from '../views/ReportesView'
import type { AuthTienda, AuthUser } from '../types'
import {
  useTiendaConfig,
  useCategorias,
  useMovimientos,
  useProveedores,
  useRepartidores,
  useClientes,
  useVariantes,
  useVentas,
  useProductos,
  useApartados,
  usePromociones,
  useTopProductos,
  useReportes,
} from '../hooks'
import { API_BASE_URL } from '../config'
import { imprimirTicketVenta } from '../utils/imprimirTicket'
import type { VentaConDetalle } from '../types'

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebarCollapsed') === 'true'
    } catch {
      return false
    }
  })
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  const [promoProductoInicialId, setPromoProductoInicialId] = useState<number | null>(null)

  const { tiendaConfig, setTiendaConfig } = useTiendaConfig(token)
  const categorias = useCategorias(token)
  const movimientos = useMovimientos(token)
  const proveedores = useProveedores(token)
  const repartidores = useRepartidores(token)
  const clientes = useClientes(token)
  const variantes = useVariantes(token)
  const ventas = useVentas(token, {
    onStockError: (productoId) => {
      setActivePage('productos')
      const p = productos.productos.find((x) => x.Id === productoId)
      if (p) void productos.abrirEditar(p)
    },
  })
  const productos = useProductos(token, { onVariantesReload: variantes.cargar })
  const apartados = useApartados(token)
  const promociones = usePromociones(token)
  const topProductos = useTopProductos(token, 10)
  const reportes = useReportes(token)

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

  useEffect(() => {
    try {
      localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed))
    } catch {
      // ignore
    }
  }, [sidebarCollapsed])

  useEffect(() => {
    if (!token) return
    if (activePage === 'categorias') void categorias.cargar()
    if (activePage === 'productos') {
      void categorias.cargar()
      void proveedores.cargar()
      void productos.cargar()
    }
    if (activePage === 'variantes') {
      void productos.cargar()
      void variantes.cargar()
    }
    if (activePage === 'proveedores') void proveedores.cargar()
    if (activePage === 'clientes') void clientes.cargar()
    if (activePage === 'repartidores') void repartidores.cargar()
    if (activePage === 'ventas') {
      void ventas.cargar()
      void clientes.cargar()
      void productos.cargar()
      void variantes.cargar()
      void repartidores.cargar()
    }
    if (activePage === 'apartados') {
      void apartados.cargar()
      void clientes.cargar()
      void productos.cargar()
      void variantes.cargar()
    }
    if (activePage === 'promociones') {
      void promociones.cargar()
      void productos.cargar()
      void variantes.cargar()
    }
    if (activePage === 'movimientos') {
      void movimientos.cargar()
      void productos.cargar()
      void variantes.cargar()
    }
    if (activePage === 'dashboard') {
      void ventas.cargar()
      void productos.cargar()
      void clientes.cargar()
      void apartados.cargar()
      void promociones.cargar()
      void topProductos.cargar()
    }
  }, [token, activePage])

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen((prev) => !prev)
    } else {
      setSidebarCollapsed((prev) => !prev)
    }
  }

  const handleLogoutClick = () => onLogout()

  const handleImprimirTicket = useCallback(
    async (ventaId: number) => {
      try {
        const res = await fetch(`${API_BASE_URL}/ventas/${encodeURIComponent(ventaId)}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Error al cargar la venta')
        const data = (await res.json()) as VentaConDetalle
        imprimirTicketVenta(data, {
          nombre: tienda.nombreComercial,
          direccion: tiendaConfig?.direccion,
          telefono: tiendaConfig?.telefono,
        })
      } catch (err) {
        console.error(err)
        const { default: Swal } = await import('sweetalert2')
        void Swal.fire('Error', 'No se pudo cargar el detalle para imprimir el ticket.', 'error')
      }
    },
    [token, tienda.nombreComercial, tiendaConfig?.direccion, tiendaConfig?.telefono],
  )

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

  const sidebarBgColor = tiendaConfig?.theme?.sidebarBg
  const navbarBgColor = tiendaConfig?.theme?.navbarBg
  const primaryColor = tiendaConfig?.theme?.primaryColor

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
        darkMode={darkMode}
        sidebarBgColor={sidebarBgColor}
        primaryColor={primaryColor}
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
          navbarBgColor={navbarBgColor}
        />

        <main className="flex-1 overflow-y-auto">
          {/* Dashboard */}
          {activePage === 'dashboard' && (
            <DashboardView
              user={user}
              tienda={tienda}
              ventas={ventas.ventas}
              productos={productos.productos}
              clientesCount={clientes.clientes.length}
              apartados={apartados.apartados}
              promociones={promociones.promociones}
              topProductos={topProductos.topProductos}
              topProductosLoading={topProductos.loading}
              loading={
                ventas.loading ||
                productos.loading ||
                clientes.loading ||
                apartados.loading ||
                promociones.loading
              }
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              cardBg={cardBg}
              cardBgHover={cardBgHover}
              onNavigateToProductos={() => setActivePage('productos')}
              onNavigateToApartados={() => setActivePage('apartados')}
            />
          )}

          {/* Categorías */}
          {activePage === 'categorias' && (
            <CategoriasView
              categorias={categorias.categorias}
              loading={categorias.loading}
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              tableBorder={tableBorder}
              tableHead={tableHead}
              tableRow={tableRow}
              btnSecondary={btnSecondary}
              onNueva={categorias.abrirNueva}
              onEditar={categorias.abrirEditar}
              onEliminar={categorias.eliminar}
            />
          )}

          {/* Productos - listado */}
          {activePage === 'productos' && !productos.formOpen && !productos.detalleOpen && (
            <ProductosView
              productos={productos.productos}
              loading={productos.loading}
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              tableBorder={tableBorder}
              tableHead={tableHead}
              tableRow={tableRow}
              btnSecondary={btnSecondary}
              onNuevo={productos.abrirNuevo}
              onImportar={productos.abrirImportModal}
              onRecargar={() => void productos.cargar()}
              onVer={productos.abrirVer}
              onEditar={productos.abrirEditar}
              onEliminar={productos.eliminar}
            />
          )}

          {/* Productos - detalle */}
          {activePage === 'productos' && productos.detalleOpen && productos.viendo && (
            <ProductoDetalleView
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              btnSecondary={btnSecondary}
              token={token}
              productoId={productos.viendo.Id}
              onVolver={() => productos.setDetalleOpen(false)}
              onEditar={() => {
                productos.setDetalleOpen(false)
                void productos.abrirEditar(productos.viendo!)
              }}
            />
          )}

          {activePage === 'productos' && productos.formOpen && (
            <ProductoFormView
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              btnSecondary={btnSecondary}
              productoEditando={productos.editando}
              categorias={categorias.categorias}
              proveedores={proveedores.proveedores}
              prodNombre={productos.nombre}
              prodCodigoInterno={productos.codigoInterno}
              prodCodigoBarras={productos.codigoBarras}
              prodCategoriaId={productos.categoriaId}
              prodProveedorId={productos.proveedorId}
              prodDescripcion={productos.descripcion}
              prodCosto={productos.costo}
              prodPrecioDetal={productos.precioDetal}
              prodPrecioMayor={productos.precioMayor}
              prodStockActual={productos.stockActual}
              prodVisible={productos.visible}
              prodImagenes={productos.imagenes}
              onAddImagen={productos.addImagen}
              onRemoveImagen={productos.removeImagen}
              onSetPrincipalImagen={productos.setPrincipalImagen}
              prodVariantes={productos.variantes}
              onAddVariante={productos.addVariante}
              onRemoveVariante={productos.removeVariante}
              onUpdateVariante={productos.updateVariante}
              onBack={() => productos.setFormOpen(false)}
              setProdNombre={productos.setNombre}
              setProdCodigoInterno={productos.setCodigoInterno}
              setProdCodigoBarras={productos.setCodigoBarras}
              setProdCategoriaId={productos.setCategoriaId}
              setProdProveedorId={productos.setProveedorId}
              setProdDescripcion={productos.setDescripcion}
              setProdCosto={productos.setCosto}
              setProdPrecioDetal={productos.setPrecioDetal}
              setProdPrecioMayor={productos.setPrecioMayor}
              setProdStockActual={productos.setStockActual}
              setProdVisible={productos.setVisible}
              onSubmit={productos.guardar}
              {
                ...({
                  onCrearPromocionForProducto: () => {
                    // Activar bloque de promoción en línea sin cambiar de página
                    productos.setPromoInlineActiva(true)
                    if (!productos.promoNombre) {
                      productos.setPromoNombre(`Promo ${productos.nombre || ''}`.trim())
                    }
                  },
                  promoInlineActiva: productos.promoInlineActiva,
                  setPromoInlineActiva: productos.setPromoInlineActiva,
                  promoNombre: productos.promoNombre,
                  setPromoNombre: productos.setPromoNombre,
                  promoDescripcion: productos.promoDescripcion,
                  setPromoDescripcion: productos.setPromoDescripcion,
                  promoTipoDescuento: productos.promoTipoDescuento,
                  setPromoTipoDescuento: productos.setPromoTipoDescuento,
                  promoValorDescuento: productos.promoValorDescuento,
                  setPromoValorDescuento: productos.setPromoValorDescuento,
                  promoMinCantidad: productos.promoMinCantidad,
                  setPromoMinCantidad: productos.setPromoMinCantidad,
                  promoMinTotal: productos.promoMinTotal,
                  setPromoMinTotal: productos.setPromoMinTotal,
                  promoAplicaSobre: productos.promoAplicaSobre,
                  setPromoAplicaSobre: productos.setPromoAplicaSobre,
                  promoFechaInicio: productos.promoFechaInicio,
                  setPromoFechaInicio: productos.setPromoFechaInicio,
                  promoFechaFin: productos.promoFechaFin,
                  setPromoFechaFin: productos.setPromoFechaFin,
                  promoActiva: productos.promoActiva,
                  setPromoActiva: productos.setPromoActiva,
                } as any)
              }
            />
          )}

          {/* Variantes */}
          {activePage === 'variantes' && (
            <VariantesView
              variantes={variantes.variantes}
              loading={variantes.loading}
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              tableBorder={tableBorder}
              tableHead={tableHead}
              tableRow={tableRow}
              onNuevo={variantes.abrirNueva}
              onRecargar={() => void variantes.cargar()}
              onEditar={variantes.abrirEditar}
              onEliminar={variantes.eliminar}
            />
          )}

          {/* Ventas - listado */}
          {activePage === 'ventas' && !ventas.formOpen && !ventas.detalleOpen && (
            <VentasView
              ventas={ventas.ventas}
              loading={ventas.loading}
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              tableBorder={tableBorder}
              tableHead={tableHead}
              tableRow={tableRow}
              btnSecondary={btnSecondary}
              onRecargar={() => void ventas.cargar()}
              onNuevaVenta={() => ventas.setFormOpen(true)}
              onVer={ventas.abrirVer}
              onCambiarEstado={ventas.actualizarEstado}
              onEliminar={ventas.eliminar}
              onExportarExcel={ventas.exportarExcel}
              onExportarPdf={ventas.exportarPdf}
              onImprimirTicket={handleImprimirTicket}
            />
          )}

          {/* Ventas - formulario nueva venta */}
          {activePage === 'ventas' && ventas.formOpen && (
            <VentaFormView
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              btnSecondary={btnSecondary}
              productos={productos.productos}
              variantes={variantes.variantes}
              clientes={clientes.clientes}
              repartidores={repartidores.repartidores}
              tiendaSlug={tienda.slug}
              loading={
                ventas.creando ||
                clientes.loading ||
                productos.loading ||
                variantes.loading
              }
              onBack={() => ventas.setFormOpen(false)}
              onSubmit={ventas.crear}
              onNuevoCliente={() => {
                setActivePage('clientes')
                clientes.setEditando(null)
                clientes.setModalOpen(true)
              }}
            />
          )}

          {/* Ventas - detalle de venta */}
          {activePage === 'ventas' && ventas.detalleOpen && ventas.viendo && (
            <VentaDetalleView
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              btnSecondary={btnSecondary}
              token={token}
              ventaId={ventas.viendo.Id}
              onVolver={() => ventas.setDetalleOpen(false)}
              onDevolucionRegistrada={() => void ventas.cargar()}
              tiendaNombre={tienda.nombreComercial}
              tiendaDireccion={tiendaConfig?.direccion}
              tiendaTelefono={tiendaConfig?.telefono}
            />
          )}

          {/* Apartados */}
          {activePage === 'apartados' && !apartados.formOpen && !apartados.detalleOpen && (
            <ApartadosView
              apartados={apartados.apartados}
              loading={apartados.loading}
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              tableBorder={tableBorder}
              tableHead={tableHead}
              tableRow={tableRow}
              btnSecondary={btnSecondary}
              onRecargar={() => void apartados.cargar()}
              onNuevoApartado={() => apartados.setFormOpen(true)}
              onVer={apartados.abrirVer}
              onCambiarEstado={apartados.actualizarEstado}
              onEliminar={apartados.eliminar}
            />
          )}

          {activePage === 'apartados' && apartados.formOpen && (
            <ApartadoFormView
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              btnSecondary={btnSecondary}
              clientes={clientes.clientes}
              productos={productos.productos}
              variantes={variantes.variantes}
              loading={
                apartados.creando ||
                clientes.loading ||
                productos.loading ||
                variantes.loading
              }
              onBack={() => apartados.setFormOpen(false)}
              onSubmit={apartados.crear}
            />
          )}

          {activePage === 'apartados' && apartados.detalleOpen && apartados.viendo && (
            <ApartadoDetalleView
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              btnSecondary={btnSecondary}
              token={token}
              apartadoId={apartados.viendo.Id}
              onVolver={() => apartados.setDetalleOpen(false)}
            />
          )}

          {/* Promociones */}
          {activePage === 'promociones' && !promociones.formOpen && (
            <PromocionesView
              promociones={promociones.promociones}
              loading={promociones.loading}
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              tableBorder={tableBorder}
              tableHead={tableHead}
              tableRow={tableRow}
              btnSecondary={btnSecondary}
              onRecargar={() => void promociones.cargar()}
              onNueva={() => {
                setPromoProductoInicialId(null)
                promociones.abrirNueva()
              }}
              onEditar={(p) => {
                setPromoProductoInicialId(null)
                promociones.abrirEditar(p)
              }}
              onEliminar={promociones.eliminar}
            />
          )}

          {activePage === 'promociones' && promociones.formOpen && (
            <PromocionFormView
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              btnSecondary={btnSecondary}
              productos={productos.productos}
              variantes={variantes.variantes}
              loading={promociones.guardando || productos.loading || variantes.loading}
              editando={promociones.editando}
              productoPreseleccionadoId={promoProductoInicialId}
              onBack={() => promociones.setFormOpen(false)}
              onSubmit={promociones.crear}
            />
          )}

          {/* Movimientos de inventario */}
          {activePage === 'movimientos' && (
            <MovimientosInventarioView
              movimientos={movimientos.movimientos}
              loading={movimientos.loading}
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              tableBorder={tableBorder}
              tableHead={tableHead}
              tableRow={tableRow}
              btnSecondary={btnSecondary}
              productos={productos.productos}
              variantes={variantes.variantes}
              creando={movimientos.creando}
              onRecargar={() => void movimientos.cargar()}
              onCrear={movimientos.crear}
            />
          )}

          {/* Reportes */}
          {activePage === 'reportes' && (
            <ReportesView
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              tableBorder={tableBorder}
              tableHead={tableHead}
              tableRow={tableRow}
              btnSecondary={btnSecondary}
              stockBajo={reportes.stockBajo}
              apartadosPorVencer={reportes.apartadosPorVencer}
              productosMasVendidos={reportes.productosMasVendidos}
              loadingStockBajo={reportes.loadingStockBajo}
              loadingApartados={reportes.loadingApartados}
              loadingTop={reportes.loadingTop}
              exportingStockBajo={reportes.exportingStockBajo}
              exportingApartados={reportes.exportingApartados}
              exportingTop={reportes.exportingTop}
              onCargarStockBajo={reportes.cargarStockBajo}
              onCargarApartados={reportes.cargarApartadosPorVencer}
              onCargarTop={reportes.cargarProductosMasVendidos}
              onExportStockBajo={reportes.exportarStockBajoExcel}
              onExportApartados={reportes.exportarApartadosExcel}
              onExportTop={reportes.exportarProductosMasVendidosExcel}
            />
          )}

          {/* Configuración de la tienda */}
          {activePage === 'tienda' && (
            <TiendaView
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              btnSecondary={btnSecondary}
              token={token}
              onConfigUpdated={setTiendaConfig}
            />
          )}

          {/* Repartidores */}
          {activePage === 'repartidores' && (
            <RepartidoresView
              repartidores={repartidores.repartidores}
              loading={repartidores.loading}
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              cardBg={cardBg}
              cardBgHover={cardBgHover}
              tableBorder={tableBorder}
              btnSecondary={btnSecondary}
              onNuevo={repartidores.abrirNueva}
              onEditar={repartidores.abrirEditar}
              onEliminar={repartidores.eliminar}
            />
          )}

          {/* Proveedores */}
          {activePage === 'proveedores' && (
            <ProveedoresView
              proveedores={proveedores.proveedores}
              loading={proveedores.loading}
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              tableBorder={tableBorder}
              tableHead={tableHead}
              tableRow={tableRow}
              btnSecondary={btnSecondary}
              onNuevo={proveedores.abrirNueva}
              onEditar={proveedores.abrirEditar}
              onEliminar={proveedores.eliminar}
            />
          )}

          {/* Clientes */}
          {activePage === 'clientes' && (
            <ClientesView
              clientes={clientes.clientes}
              loading={clientes.loading}
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              tableBorder={tableBorder}
              tableHead={tableHead}
              tableRow={tableRow}
              btnSecondary={btnSecondary}
              onRecargar={() => void clientes.cargar()}
              onImportar={() => clientes.setImportModalOpen(true)}
              onNuevo={() => {
                clientes.setEditando(null)
                clientes.setModalOpen(true)
              }}
              onEditar={(c) => {
                clientes.setEditando(c)
                clientes.setModalOpen(true)
              }}
              onEliminar={clientes.eliminar}
            />
          )}
        </main>
      </div>

      <CategoriaModal
        open={categorias.modalOpen}
        dm={dm}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        btnSecondary={btnSecondary}
        categoriaEditando={categorias.editando}
        catNombre={categorias.nombre}
        catVisible={categorias.visible}
        catPadreId={categorias.padreId}
        categorias={categorias.categorias}
        onClose={() => categorias.setModalOpen(false)}
        setCatNombre={categorias.setNombre}
        setCatVisible={categorias.setVisible}
        setCatPadreId={categorias.setPadreId}
        onSubmit={categorias.guardar}
      />

      <RepartidorModal
        open={repartidores.modalOpen}
        dm={dm}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        btnSecondary={btnSecondary}
        repartidorEditando={repartidores.editando}
        nombre={repartidores.nombre}
        telefono={repartidores.telefono}
        documento={repartidores.documento}
        vehiculo={repartidores.vehiculo}
        placa={repartidores.placa}
        disponible={repartidores.disponible}
        activo={repartidores.activo}
        onClose={() => repartidores.setModalOpen(false)}
        setNombre={repartidores.setNombre}
        setTelefono={repartidores.setTelefono}
        setDocumento={repartidores.setDocumento}
        setVehiculo={repartidores.setVehiculo}
        setPlaca={repartidores.setPlaca}
        setDisponible={repartidores.setDisponible}
        setActivo={repartidores.setActivo}
        onSubmit={repartidores.guardar}
      />

      <ProveedorModal
        open={proveedores.modalOpen}
        dm={dm}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        btnSecondary={btnSecondary}
        proveedorEditando={proveedores.editando}
        provNombre={proveedores.nombre}
        provContacto={proveedores.contacto}
        provTelefono={proveedores.telefono}
        provEmail={proveedores.email}
        provActivo={proveedores.activo}
        onClose={() => proveedores.setModalOpen(false)}
        setProvNombre={proveedores.setNombre}
        setProvContacto={proveedores.setContacto}
        setProvTelefono={proveedores.setTelefono}
        setProvEmail={proveedores.setEmail}
        setProvActivo={proveedores.setActivo}
        onSubmit={proveedores.guardar}
      />

      <VarianteModal
        open={variantes.modalOpen}
        dm={dm}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        textMuted={textMuted}
        btnSecondary={btnSecondary}
        productos={productos.productos}
        varianteEditando={variantes.editando}
        varProductoId={variantes.productoId}
        varAtributo={variantes.atributo}
        varValor={variantes.valor}
        varStock={variantes.stock}
        varPrecioAdicional={variantes.precioAdicional}
        varSku={variantes.sku}
        varCodigoBarras={variantes.codigoBarras}
        onClose={() => variantes.setModalOpen(false)}
        onChangeProducto={variantes.setProductoId}
        onChangeAtributo={variantes.setAtributo}
        onChangeValor={variantes.setValor}
        onChangeStock={variantes.setStock}
        onChangePrecioAdicional={variantes.setPrecioAdicional}
        onChangeSku={variantes.setSku}
        onChangeCodigoBarras={variantes.setCodigoBarras}
        onSubmit={variantes.guardar}
      />

      <ProductoImportModal
        open={productos.importModalOpen}
        dm={dm}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        textMuted={textMuted}
        btnSecondary={btnSecondary}
        importText={productos.importText}
        setImportText={productos.setImportText}
        importFile={productos.importFile}
        setImportFile={productos.setImportFile}
        onClose={() => productos.setImportModalOpen(false)}
        onSubmit={productos.importarDesdeExcel}
      />

      <ClienteImportModal
        open={clientes.importModalOpen}
        dm={dm}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        textMuted={textMuted}
        btnSecondary={btnSecondary}
        token={token}
        onClose={() => clientes.setImportModalOpen(false)}
        onImported={clientes.cargar}
      />

      <ClienteModal
        open={clientes.modalOpen}
        dm={dm}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        btnSecondary={btnSecondary}
        token={token}
        clienteEditando={clientes.editando}
        onClose={() => clientes.setModalOpen(false)}
        onSaved={clientes.cargar}
      />
    </div>
  )
}


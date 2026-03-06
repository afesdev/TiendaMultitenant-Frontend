import { useEffect, useState } from 'react'
import { Sidebar } from '../components/Sidebar'
import { Navbar } from '../components/Navbar'
import { VarianteModal } from '../components/VarianteModal'
import { CategoriaModal } from '../components/CategoriaModal'
import { ProveedorModal } from '../components/ProveedorModal'
import { RepartidorModal } from '../components/RepartidorModal'
import { VentaEditModal } from '../components/VentaEditModal'
import { VentaDetalleView } from '../components/VentaViewModal'
import { ClienteImportModal } from '../components/ClienteImportModal'
import { ClienteModal } from '../components/ClienteModal'
import { ProductoImportModal } from '../components/ProductoImportModal'
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
import { MovimientosInventarioView } from '../views/MovimientosInventarioView'
import { TiendaView } from '../views/TiendaView'
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
} from '../hooks'

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

  const { tiendaConfig, setTiendaConfig } = useTiendaConfig(token)
  const categorias = useCategorias(token)
  const movimientos = useMovimientos(token)
  const proveedores = useProveedores(token)
  const repartidores = useRepartidores(token)
  const clientes = useClientes(token)
  const variantes = useVariantes(token)
  const ventas = useVentas(token)
  const productos = useProductos(token, { onVariantesReload: variantes.cargar })

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
    if (activePage === 'movimientos') void movimientos.cargar()
    if (activePage === 'dashboard') {
      void ventas.cargar()
      void productos.cargar()
      void clientes.cargar()
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
              ventasCount={ventas.ventas.length}
              productosCount={productos.productos.length}
              clientesCount={clientes.clientes.length}
              loading={ventas.loading || productos.loading || clientes.loading}
              dm={dm}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              cardBg={cardBg}
              cardBgHover={cardBgHover}
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

          {/* Productos */}
          {activePage === 'productos' && !productos.formOpen && (
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
              onEditar={productos.abrirEditar}
              onEliminar={productos.eliminar}
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
              onEditar={ventas.abrirEditar}
              onEliminar={ventas.eliminar}
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
              onRecargar={() => void movimientos.cargar()}
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

          {/* Placeholder para otras páginas */}
          {/* Vista por defecto para páginas no implementadas eliminada (antes: "Módulo en construcción") */}
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

      <VentaEditModal
        open={ventas.editModalOpen}
        dm={dm}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        textMuted={textMuted}
        btnSecondary={btnSecondary}
        token={token}
        venta={ventas.editando}
        onClose={() => ventas.setEditModalOpen(false)}
        onSaved={ventas.cargar}
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
        onClose={() => variantes.setModalOpen(false)}
        onChangeProducto={variantes.setProductoId}
        onChangeAtributo={variantes.setAtributo}
        onChangeValor={variantes.setValor}
        onChangeStock={variantes.setStock}
        onChangePrecioAdicional={variantes.setPrecioAdicional}
        onChangeSku={variantes.setSku}
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


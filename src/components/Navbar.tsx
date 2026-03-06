import { Bell, LogOut, Menu, Moon, Sun } from 'lucide-react'

const PAGE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  categorias: 'Categorías',
  productos: 'Productos',
  variantes: 'Variantes',
  proveedores: 'Proveedores',
  clientes: 'Clientes',
  ventas: 'Ventas',
  repartidores: 'Repartidores',
  tienda: 'Tienda',
  roles: 'Usuarios y roles',
}

export interface NavbarProps {
  onToggleSidebar: () => void
  activeKey: string
  darkMode: boolean
  onToggleDarkMode: () => void
  user: { nombre: string; rolNombre: string }
  tienda: { nombreComercial: string; slug: string }
  onLogout: () => void
  navbarBgColor?: string
}

export function Navbar({
  onToggleSidebar,
  activeKey,
  darkMode,
  onToggleDarkMode,
  user,
  tienda,
  onLogout,
  navbarBgColor,
}: NavbarProps) {
  const avatar = user.nombre.charAt(0).toUpperCase()
  const pageLabel = PAGE_LABELS[activeKey] ?? 'Panel'

  const dm = darkMode

  return (
    <header
      className={[
        'flex-shrink-0 h-16 flex items-center gap-3 px-4 z-30 border-b transition-colors duration-200',
        dm
          ? 'bg-slate-900/90 backdrop-blur-md border-slate-800/60'
          : 'bg-white border-gray-200',
      ].join(' ')}
      style={navbarBgColor ? { backgroundColor: navbarBgColor } : undefined}
    >
      {/* ── Mobile sidebar toggle (hidden on desktop) ───────────────── */}
      <button
        onClick={onToggleSidebar}
        className={[
          'md:hidden p-2 rounded-xl transition-colors flex-shrink-0',
          dm
            ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100',
        ].join(' ')}
        title="Abrir menú"
      >
        <Menu size={20} />
      </button>

      {/* ── Page title ─────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <h1
          className={[
            'text-base font-bold leading-tight truncate',
            dm ? 'text-slate-100' : 'text-gray-900',
          ].join(' ')}
        >
          {pageLabel}
        </h1>
        <p
          className={[
            'text-xs truncate leading-tight mt-0.5',
            dm ? 'text-slate-500' : 'text-gray-400',
          ].join(' ')}
        >
          {tienda.nombreComercial} · {tienda.slug}
        </p>
      </div>

      {/* ── Right actions ──────────────────────────────────────────── */}
      <div className="flex items-center gap-1 flex-shrink-0">

        {/* Dark mode toggle */}
        <button
          onClick={onToggleDarkMode}
          title={dm ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className={[
            'p-2 rounded-xl transition-colors',
            dm
              ? 'text-slate-400 hover:text-yellow-400 hover:bg-slate-800'
              : 'text-gray-400 hover:text-amber-500 hover:bg-gray-100',
          ].join(' ')}
        >
          {dm ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button
          title="Notificaciones"
          className={[
            'relative p-2 rounded-xl transition-colors',
            dm
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100',
          ].join(' ')}
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-emerald-400 ring-1 ring-white" />
        </button>

        {/* Divider */}
        <div
          className={[
            'h-6 w-px mx-1',
            dm ? 'bg-slate-800' : 'bg-gray-200',
          ].join(' ')}
        />

        {/* User info */}
        <div className="hidden sm:flex flex-col items-end leading-tight mr-1.5">
          <span
            className={[
              'text-sm font-bold',
              dm ? 'text-slate-200' : 'text-gray-800',
            ].join(' ')}
          >
            {user.nombre}
          </span>
          <span className={dm ? 'text-xs text-slate-500' : 'text-xs text-gray-400'}>
            {user.rolNombre}
          </span>
        </div>

        {/* Avatar */}
        <div className="h-9 w-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-base font-bold text-emerald-500 flex-shrink-0 cursor-default select-none">
          {avatar}
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          title="Cerrar sesión"
          className={[
            'ml-1 p-2 rounded-xl transition-colors',
            dm
              ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
              : 'text-gray-400 hover:text-red-500 hover:bg-red-50',
          ].join(' ')}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}

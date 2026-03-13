import {
  LayoutDashboard,
  Package,
  Users,
  TrendingUp,
  Store,
  ChevronLeft,
  ChevronRight,
  X,
  Bike,
  FolderTree,
  Truck,
  Layers,
  Activity,
  Bookmark,
  Percent,
  BarChart3,
  Droplets,
} from 'lucide-react'

type LucideIcon = React.ComponentType<{ size?: number; className?: string }>

type NavItem = { key: string; label: string; Icon: LucideIcon }
type NavSection = { label: string; items: NavItem[] }

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'General',
    items: [
      { key: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
      { key: 'reportes', label: 'Reportes', Icon: BarChart3 },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { key: 'categorias', label: 'Categorías', Icon: FolderTree },
      { key: 'productos', label: 'Productos', Icon: Package },
      { key: 'variantes', label: 'Variantes', Icon: Layers },
      { key: 'proveedores', label: 'Proveedores', Icon: Truck },
      { key: 'colores', label: 'Colores', Icon: Droplets },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      { key: 'ventas', label: 'Ventas', Icon: TrendingUp },
      { key: 'apartados', label: 'Apartados', Icon: Bookmark },
      { key: 'promociones', label: 'Promociones', Icon: Percent },
      { key: 'movimientos', label: 'Movimientos', Icon: Activity },
      { key: 'clientes', label: 'Clientes', Icon: Users },
      { key: 'repartidores', label: 'Repartidores', Icon: Bike },
    ],
  },
  {
    label: 'Configuración',
    items: [{ key: 'tienda', label: 'Tienda', Icon: Store }],
  },
]

function isHexDark(color: string): boolean {
  const hex = color.startsWith('#') ? color.slice(1) : color
  if (hex.length !== 6) return true
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  // Perceived luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance < 0.5
}

function hexToRgba(color: string, alpha: number): string {
  const hex = color.startsWith('#') ? color.slice(1) : color
  if (hex.length !== 6) return color
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapse: () => void
  onMobileClose: () => void
  activeKey: string
  onNavigate: (key: string) => void
  user: { nombre: string; email: string; rolNombre: string }
  tienda: { id: string; nombreComercial: string; slug: string }
  darkMode: boolean
  sidebarBgColor?: string
  primaryColor?: string
}

export function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onMobileClose,
  activeKey,
  onNavigate,
  user,
  tienda,
  darkMode,
  sidebarBgColor,
  primaryColor,
}: SidebarProps) {
  const avatar = user.nombre.charAt(0).toUpperCase()

  const effectiveSidebarBg = sidebarBgColor ?? (darkMode ? '#020617' : '#ffffff')
  const sidebarIsDark = isHexDark(effectiveSidebarBg)

  const navInactiveClasses = sidebarIsDark
    ? 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-50'
    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'

  const brandTextClass = sidebarIsDark ? 'text-slate-100' : 'text-gray-900'
  const sectionLabelClass = sidebarIsDark ? 'text-slate-500' : 'text-gray-500'
  const borderDividerClass = sidebarIsDark ? 'border-slate-700/70' : 'border-gray-200/90'

  return (
    <>
      {/* ── Mobile backdrop ─────────────────────────────────────────── */}
      <div
        className={[
          'fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-sm',
          'transition-opacity duration-300 md:hidden',
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={onMobileClose}
      />

      {/* ── Sidebar panel ───────────────────────────────────────────── */}
      <aside
        className={[
          /* layout */
          'fixed inset-y-0 left-0 z-50 flex flex-col flex-shrink-0',
          /* desktop: reintegrate to flow */
          'md:relative md:inset-auto md:z-auto',
          /* look: borde según contraste del fondo */
          'border-r transition-all duration-300 ease-in-out',
          borderDividerClass,
          /* mobile slide */
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          /* width: always 72 on mobile; 16/64 on desktop */
          collapsed ? 'w-72 md:w-16' : 'w-72 md:w-64',
        ].join(' ')}
        style={sidebarBgColor ? { backgroundColor: sidebarBgColor } : undefined}
      >
        {/* ── Brand header ──────────────────────────────────────────── */}
        <div
          className={[
            'flex h-16 items-center border-b flex-shrink-0',
            borderDividerClass,
            'transition-all duration-300',
            collapsed ? 'px-4 md:justify-center md:px-0' : 'px-4 gap-3',
          ].join(' ')}
        >
          {/* Logo mark */}
          <div className="h-8 w-8 flex-shrink-0 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <span className="text-white font-bold text-sm leading-none">T</span>
          </div>

          {/* Brand text — hidden when collapsed on desktop */}
          <div
            className={[
              'flex-1 min-w-0 overflow-hidden transition-all duration-300',
              collapsed ? 'md:w-0 md:opacity-0 md:invisible md:absolute' : '',
            ].join(' ')}
          >
            <p
              className={[
                'text-xs uppercase tracking-[0.2em] font-bold leading-none mb-1',
                sidebarIsDark ? 'text-emerald-400' : 'text-emerald-600',
              ].join(' ')}
            >
              Multitenant
            </p>
            <p className={`text-base font-bold truncate leading-tight ${brandTextClass}`}>
              {tienda.nombreComercial}
            </p>
          </div>

          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className={[
              'md:hidden ml-auto p-1.5 rounded-lg transition-colors',
              sidebarIsDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100',
            ].join(' ')}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Navigation ────────────────────────────────────────────── */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto">
          {NAV_SECTIONS.map((section, si) => (
            <div key={section.label} className={si > 0 ? 'mt-2' : ''}>
              {/* Section label */}
              {collapsed ? (
                si > 0 && (
                  <div className={['my-2 mx-1 border-t', borderDividerClass].join(' ')} />
                )
              ) : (
                <p
                  className={[
                    'px-3 py-2 text-xs font-bold uppercase tracking-widest',
                    sectionLabelClass,
                  ].join(' ')}
                >
                  {section.label}
                </p>
              )}

              {/* Nav items */}
              <div className="space-y-0.5">
                {section.items.map(({ key, label, Icon }) => {
                  const isActive = activeKey === key
                  const primary = primaryColor || '#10b981'
                  const activeStyle = isActive
                    ? {
                        backgroundColor: hexToRgba(primary, 0.16),
                        color: primary,
                      }
                    : undefined

                  return (
                    <button
                      key={key}
                      onClick={() => {
                        onNavigate(key)
                        onMobileClose()
                      }}
                      title={collapsed ? label : undefined}
                      className={[
                        'w-full flex items-center rounded-xl',
                        'transition-colors duration-150 relative group',
                        collapsed
                          ? 'md:justify-center md:py-2.5 md:px-0 p-3 gap-3'
                          : 'p-3 gap-3',
                        isActive ? 'font-semibold' : navInactiveClasses,
                      ].join(' ')}
                      style={activeStyle}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                          style={{ backgroundColor: primary }}
                        />
                      )}

                      <Icon size={18} className="flex-shrink-0" />

                      <span
                        className={[
                          'text-base font-medium truncate flex-1 text-left transition-all duration-300',
                          collapsed ? 'md:hidden' : '',
                        ].join(' ')}
                      >
                        {label}
                      </span>

                      {isActive && !collapsed && (
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0 hidden md:block"
                          style={{ backgroundColor: primary }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── User footer ───────────────────────────────────────────── */}
        <div
          className={[
            'flex-shrink-0 border-t p-3',
            borderDividerClass,
            collapsed ? 'md:flex md:justify-center' : '',
          ].join(' ')}
        >
          {/* Collapsed: icon only (desktop) */}
          <div
            title={user.nombre}
            className={[
              'h-10 w-10 rounded-full border',
              'items-center justify-center text-base font-bold cursor-default',
              sidebarIsDark
                ? 'bg-slate-800 border-slate-700 text-slate-300'
                : 'bg-gray-100 border-gray-300 text-gray-700',
              collapsed ? 'hidden md:flex' : 'hidden',
            ].join(' ')}
          >
            {avatar}
          </div>

          {/* Expanded: full user card */}
          <div
            className={[
              'flex items-center gap-3 min-w-0',
              collapsed ? 'md:hidden' : '',
            ].join(' ')}
          >
            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-base font-bold text-emerald-400">
              {avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={[
                  'text-sm font-bold truncate',
                  sidebarIsDark ? 'text-slate-200' : 'text-gray-800',
                ].join(' ')}
              >
                {user.nombre}
              </p>
              <p
                className={[
                  'text-xs truncate',
                  sidebarIsDark ? 'text-slate-500' : 'text-gray-500',
                ].join(' ')}
              >
                {user.rolNombre}
              </p>
            </div>
          </div>
        </div>

        {/* ── Collapse toggle (desktop only) ────────────────────────── */}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expandir' : 'Contraer'}
          className={[
            'hidden md:flex absolute -right-3.5 top-[4.5rem]',
            'h-7 w-7 items-center justify-center rounded-full border shadow-lg transition-colors',
            sidebarIsDark
              ? 'bg-slate-800 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              : 'bg-gray-100 border-gray-300 text-gray-500 hover:text-gray-800 hover:bg-gray-200',
          ].join(' ')}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </aside>
    </>
  )
}

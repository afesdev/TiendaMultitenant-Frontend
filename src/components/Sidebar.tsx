import {
  LayoutDashboard,
  Package,
  Users,
  TrendingUp,
  Store,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Bike,
  FolderTree,
  Truck,
  Layers,
} from 'lucide-react'

type LucideIcon = React.ComponentType<{ size?: number; className?: string }>

type NavItem = { key: string; label: string; Icon: LucideIcon }
type NavSection = { label: string; items: NavItem[] }

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'General',
    items: [
      { key: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
      { key: 'categorias', label: 'Categorías', Icon: FolderTree },
      { key: 'productos', label: 'Productos', Icon: Package },
      { key: 'variantes', label: 'Variantes', Icon: Layers },
      { key: 'proveedores', label: 'Proveedores', Icon: Truck },
      { key: 'clientes', label: 'Clientes', Icon: Users },
      { key: 'ventas', label: 'Ventas', Icon: TrendingUp },
      { key: 'repartidores', label: 'Repartidores', Icon: Bike },
    ],
  },
  {
    label: 'Configuración',
    items: [
      { key: 'tienda', label: 'Tienda', Icon: Store },
      { key: 'roles', label: 'Usuarios y roles', Icon: ShieldCheck },
    ],
  },
]

export interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapse: () => void
  onMobileClose: () => void
  activeKey: string
  onNavigate: (key: string) => void
  user: { nombre: string; email: string; rolNombre: string }
  tienda: { id: string; nombreComercial: string; slug: string }
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
}: SidebarProps) {
  const avatar = user.nombre.charAt(0).toUpperCase()

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
          /* look */
          'bg-slate-900 border-r border-slate-800/60',
          'transition-all duration-300 ease-in-out',
          /* mobile slide */
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          /* width: always 72 on mobile; 16/64 on desktop */
          collapsed ? 'w-72 md:w-16' : 'w-72 md:w-64',
        ].join(' ')}
      >
        {/* ── Brand header ──────────────────────────────────────────── */}
        <div
          className={[
            'flex h-16 items-center border-b border-slate-800/60 flex-shrink-0',
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
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400 font-bold leading-none mb-1">
              Multitenant
            </p>
            <p className="text-base font-bold text-slate-100 truncate leading-tight">
              {tienda.nombreComercial}
            </p>
          </div>

          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="md:hidden ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Navigation ────────────────────────────────────────────── */}
        <nav className="flex-1 py-3 px-2">
          {NAV_SECTIONS.map((section, si) => (
            <div key={section.label} className={si > 0 ? 'mt-2' : ''}>
              {/* Section label */}
              {collapsed ? (
                si > 0 && (
                  <div className="my-2 mx-1 border-t border-slate-800/60" />
                )
              ) : (
                <p className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                  {section.label}
                </p>
              )}

              {/* Nav items */}
              <div className="space-y-0.5">
                {section.items.map(({ key, label, Icon }) => {
                  const isActive = activeKey === key
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
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200',
                      ].join(' ')}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-emerald-400" />
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
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 hidden md:block" />
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
            'flex-shrink-0 border-t border-slate-800/60 p-3',
            collapsed ? 'md:flex md:justify-center' : '',
          ].join(' ')}
        >
          {/* Collapsed: icon only (desktop) */}
          <div
            title={user.nombre}
            className={[
              'h-10 w-10 rounded-full bg-slate-800 border border-slate-700',
              'items-center justify-center text-base font-bold text-slate-300 cursor-default',
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
              <p className="text-sm font-bold text-slate-200 truncate">{user.nombre}</p>
              <p className="text-xs text-slate-500 truncate">{user.rolNombre}</p>
            </div>
          </div>
        </div>

        {/* ── Collapse toggle (desktop only) ────────────────────────── */}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expandir' : 'Contraer'}
          className={[
            'hidden md:flex absolute -right-3.5 top-[4.5rem]',
            'h-7 w-7 items-center justify-center rounded-full',
            'bg-slate-800 border border-slate-700/80 shadow-lg',
            'text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors',
          ].join(' ')}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </aside>
    </>
  )
}

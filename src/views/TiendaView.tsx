import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Building2, Globe2, Mail, Save, RefreshCw, MapPin, Phone, Clock } from 'lucide-react'
import { API_BASE_URL } from '../config'
import type { TiendaConfig, TiendaPanel } from '../types'

interface TiendaViewProps {
  dm: boolean
  textPrimary: string
  textSecondary: string
  textMuted: string
  btnSecondary: string
  token: string
  onConfigUpdated?: (config: TiendaConfig) => void
}

export function TiendaView({
  dm,
  textPrimary,
  textSecondary,
  textMuted,
  token,
  onConfigUpdated,
}: TiendaViewProps) {
  const [data, setData] = useState<TiendaPanel | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [nombreComercial, setNombreComercial] = useState('')
  const [slug, setSlug] = useState('')
  const [emailContacto, setEmailContacto] = useState('')
  const [direccion, setDireccion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [horarios, setHorarios] = useState('')
  const [themePrimary, setThemePrimary] = useState('#10b981')
  const [themeSidebarBg, setThemeSidebarBg] = useState('#020617')
  const [themeNavbarBg, setThemeNavbarBg] = useState('#ffffff')
  const [facebook, setFacebook] = useState('')
  const [instagram, setInstagram] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [tiktok, setTiktok] = useState('')

  const cargarTienda = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/tienda`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const body = (await response.json().catch(() => null)) as
        | TiendaPanel
        | { message?: string }
        | null

      if (!response.ok || !body || (body as any).id === undefined) {
        const msg =
          (body as { message?: string } | null)?.message ??
          'No se pudieron cargar los datos de la tienda'
        throw new Error(msg)
      }

      const tienda = body as TiendaPanel
      setData(tienda)
      setNombreComercial(tienda.nombreComercial)
      setSlug(tienda.slug)
      setEmailContacto(tienda.emailContacto)
      const cfg = tienda.configuracion as TiendaConfig | null
      if (cfg?.theme) {
        setThemePrimary(cfg.theme.primaryColor ?? '#10b981')
        setThemeSidebarBg(cfg.theme.sidebarBg ?? '#020617')
        setThemeNavbarBg(cfg.theme.navbarBg ?? '#ffffff')
      }
      if (cfg?.social) {
        setFacebook(cfg.social.facebook ?? '')
        setInstagram(cfg.social.instagram ?? '')
        setWhatsapp(cfg.social.whatsapp ?? '')
        setTiktok(cfg.social.tiktok ?? '')
      }
      setDireccion(cfg?.direccion ?? '')
      setTelefono(cfg?.telefono ?? '')
      setHorarios(cfg?.horarios ?? '')
    } catch (err) {
      console.error(err)
      // Es mejor mostrar un alert en Dashboard; aquí dejamos el error en consola
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void cargarTienda()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!nombreComercial.trim() || !slug.trim() || !emailContacto.trim()) return

    setSaving(true)
    try {
      const configuracion: TiendaConfig = {
        theme: {
          primaryColor: themePrimary,
          sidebarBg: themeSidebarBg,
          navbarBg: themeNavbarBg,
        },
        social: {
          facebook: facebook || undefined,
          instagram: instagram || undefined,
          whatsapp: whatsapp || undefined,
          tiktok: tiktok || undefined,
        },
        direccion: direccion.trim() || undefined,
        telefono: telefono.trim() || undefined,
        horarios: horarios.trim() || undefined,
      }

      const response = await fetch(`${API_BASE_URL}/tienda`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombreComercial: nombreComercial.trim(),
          slug: slug.trim(),
          emailContacto: emailContacto.trim(),
          configuracion,
        }),
      })

      const body = (await response.json().catch(() => null)) as { message?: string } | null

      if (!response.ok) {
        const msg =
          body?.message ??
          'No se pudo actualizar la tienda. Verifica que el slug no esté en uso por otra tienda.'
        throw new Error(msg)
      }

      await cargarTienda()
      if (onConfigUpdated) {
        onConfigUpdated(configuracion)
      }
      // Podríamos mostrar un toast desde Dashboard; aquí solo recargamos datos
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Building2 size={22} />
            </div>
            <h2 className={`text-xl font-bold ${textPrimary}`}>Configuración de la tienda</h2>
          </div>
          <p className={`text-sm ${textSecondary}`}>
            Edita los datos de tu tienda: nombre, slug, contacto, dirección, teléfono y horarios para la tienda pública.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void cargarTienda()}
          disabled={loading}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            dm
              ? 'border-slate-600 bg-slate-900/60 text-slate-200 hover:bg-slate-800/80'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Recargar
        </button>
      </div>

      <div
        className={`rounded-2xl border shadow-sm ${
          dm ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-200'
        }`}
      >
        <form
          onSubmit={handleSubmit}
          className="px-5 py-4 sm:px-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={`block text-xs font-semibold ${textPrimary}`}>
                Nombre comercial
              </label>
              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                  dm
                    ? 'border-slate-700 bg-slate-950/60'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <Building2 size={16} className="text-emerald-500" />
                <input
                  type="text"
                  value={nombreComercial}
                  onChange={(e) => setNombreComercial(e.target.value)}
                  className={`flex-1 bg-transparent border-none text-xs focus:outline-none ${
                    dm ? 'text-slate-100' : 'text-gray-900'
                  }`}
                  placeholder="Ej: Mi Boutique Online"
                />
              </div>
              <p className={`text-[11px] ${textMuted}`}>
                Este nombre se mostrará en el panel y en el frontend público.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className={`block text-xs font-semibold ${textPrimary}`}>Slug público</label>
              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                  dm
                    ? 'border-slate-700 bg-slate-950/60'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <Globe2 size={16} className="text-emerald-500" />
                <span
                  className={`text-[11px] ${
                    dm ? 'text-slate-400' : 'text-gray-500'
                  } hidden sm:inline`}
                >
                  https://tu-dominio.com/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={`flex-1 bg-transparent border-none text-xs focus:outline-none ${
                    dm ? 'text-slate-100' : 'text-gray-900'
                  }`}
                  placeholder="mi-tienda"
                />
              </div>
              <p className={`text-[11px] ${textMuted}`}>
                Identificador único de la tienda en URLs. Solo minúsculas, números y guiones.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className={`block text-xs font-semibold ${textPrimary}`}>
                Correo de contacto
              </label>
              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                  dm
                    ? 'border-slate-700 bg-slate-950/60'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <Mail size={16} className="text-emerald-500" />
                <input
                  type="email"
                  value={emailContacto}
                  onChange={(e) => setEmailContacto(e.target.value)}
                  className={`flex-1 bg-transparent border-none text-xs focus:outline-none ${
                    dm ? 'text-slate-100' : 'text-gray-900'
                  }`}
                  placeholder="contacto@mi-tienda.com"
                />
              </div>
              <p className={`text-[11px] ${textMuted}`}>
                Se usará para notificaciones y contacto con clientes.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className={`block text-xs font-semibold ${textPrimary}`}>
                Dirección
              </label>
              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                  dm
                    ? 'border-slate-700 bg-slate-950/60'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <MapPin size={16} className="text-emerald-500 flex-shrink-0" />
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className={`flex-1 bg-transparent border-none text-xs focus:outline-none ${
                    dm ? 'text-slate-100' : 'text-gray-900'
                  }`}
                  placeholder="Ej: Cra 10 #20-30, Local 5"
                />
              </div>
              <p className={`text-[11px] ${textMuted}`}>
                Dirección física para mostrar en la tienda pública.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className={`block text-xs font-semibold ${textPrimary}`}>
                Teléfono
              </label>
              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                  dm
                    ? 'border-slate-700 bg-slate-950/60'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <Phone size={16} className="text-emerald-500 flex-shrink-0" />
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className={`flex-1 bg-transparent border-none text-xs focus:outline-none ${
                    dm ? 'text-slate-100' : 'text-gray-900'
                  }`}
                  placeholder="Ej: 300 123 4567"
                />
              </div>
              <p className={`text-[11px] ${textMuted}`}>
                Teléfono de contacto para la tienda pública.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className={`block text-xs font-semibold ${textPrimary}`}>
                Horarios de atención
              </label>
              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                  dm
                    ? 'border-slate-700 bg-slate-950/60'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <Clock size={16} className="text-emerald-500 flex-shrink-0" />
                <input
                  type="text"
                  value={horarios}
                  onChange={(e) => setHorarios(e.target.value)}
                  className={`flex-1 bg-transparent border-none text-xs focus:outline-none ${
                    dm ? 'text-slate-100' : 'text-gray-900'
                  }`}
                  placeholder="Ej: Lun-Vie 8:00-18:00, Sáb 9:00-13:00"
                />
              </div>
              <p className={`text-[11px] ${textMuted}`}>
                Horarios que se mostrarán en la tienda pública.
              </p>
            </div>

            {data && (
              <div className="space-y-1.5 text-xs">
                <p className={textMuted}>Información del sistema</p>
                <p className={textSecondary}>
                  ID tienda:{' '}
                  <span className="font-mono text-[11px] break-all">{data.id}</span>
                </p>
                <p className={textSecondary}>
                  Creada el:{' '}
                  <span className="font-semibold">
                    {new Date(data.fechaCreacion).toLocaleString('es-CO', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </p>
                <p className={textSecondary}>
                  Estado:{' '}
                  <span className={data.activo ? 'text-emerald-500 font-semibold' : 'text-red-500'}>
                    {data.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Configuración avanzada: colores y redes */}
          <div className="mt-4 border-t border-slate-800/40 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className={`text-xs font-semibold ${textPrimary}`}>Colores de la plataforma</p>
              <p className={`text-[11px] ${textMuted}`}>
                Define la paleta principal usada en el panel y, más adelante, en la tienda pública.
              </p>

              <div className="space-y-1.5">
                <label className={`block text-[11px] font-medium ${textSecondary}`}>
                  Color primario (botones, acentos)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themePrimary}
                    onChange={(e) => setThemePrimary(e.target.value)}
                    className="h-9 w-9 rounded-lg border border-slate-700 bg-transparent"
                  />
                  <input
                    type="text"
                    value={themePrimary}
                    onChange={(e) => setThemePrimary(e.target.value)}
                    className={`flex-1 rounded-xl border px-3 py-1.5 text-xs font-mono ${
                      dm
                        ? 'border-slate-700 bg-slate-950/60 text-slate-100'
                        : 'border-gray-200 bg-gray-50 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`block text-[11px] font-medium ${textSecondary}`}>
                  Fondo del sidebar
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeSidebarBg}
                    onChange={(e) => setThemeSidebarBg(e.target.value)}
                    className="h-9 w-9 rounded-lg border border-slate-700 bg-transparent"
                  />
                  <input
                    type="text"
                    value={themeSidebarBg}
                    onChange={(e) => setThemeSidebarBg(e.target.value)}
                    className={`flex-1 rounded-xl border px-3 py-1.5 text-xs font-mono ${
                      dm
                        ? 'border-slate-700 bg-slate-950/60 text-slate-100'
                        : 'border-gray-200 bg-gray-50 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`block text-[11px] font-medium ${textSecondary}`}>
                  Fondo del navbar
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeNavbarBg}
                    onChange={(e) => setThemeNavbarBg(e.target.value)}
                    className="h-9 w-9 rounded-lg border border-slate-700 bg-transparent"
                  />
                  <input
                    type="text"
                    value={themeNavbarBg}
                    onChange={(e) => setThemeNavbarBg(e.target.value)}
                    className={`flex-1 rounded-xl border px-3 py-1.5 text-xs font-mono ${
                      dm
                        ? 'border-slate-700 bg-slate-950/60 text-slate-100'
                        : 'border-gray-200 bg-gray-50 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end md:items-start md:justify-start">
              <button
                type="button"
                onClick={() => {
                  setThemePrimary('#10b981')
                  setThemeSidebarBg('#020617')
                  setThemeNavbarBg('#ffffff')
                }}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold border ${
                  dm
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Restablecer colores por defecto
              </button>
            </div>

            <div className="space-y-2">
              <p className={`text-xs font-semibold ${textPrimary}`}>Redes sociales</p>
              <p className={`text-[11px] ${textMuted}`}>
                Enlaces que se podrán usar en la tienda pública (footer, página de contacto, etc.).
              </p>

              <div className="space-y-1.5">
                <label className={`block text-[11px] font-medium ${textSecondary}`}>
                  Facebook
                </label>
                <input
                  type="url"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/tu-pagina"
                  className={`w-full rounded-xl border px-3 py-1.5 text-xs ${
                    dm
                      ? 'border-slate-700 bg-slate-950/60 text-slate-100'
                      : 'border-gray-200 bg-gray-50 text-gray-900'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`block text-[11px] font-medium ${textSecondary}`}>
                  Instagram
                </label>
                <input
                  type="url"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/tu-cuenta"
                  className={`w-full rounded-xl border px-3 py-1.5 text-xs ${
                    dm
                      ? 'border-slate-700 bg-slate-950/60 text-slate-100'
                      : 'border-gray-200 bg-gray-50 text-gray-900'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`block text-[11px] font-medium ${textSecondary}`}>
                  WhatsApp
                </label>
                <input
                  type="url"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="https://wa.me/3001234567"
                  className={`w-full rounded-xl border px-3 py-1.5 text-xs ${
                    dm
                      ? 'border-slate-700 bg-slate-950/60 text-slate-100'
                      : 'border-gray-200 bg-gray-50 text-gray-900'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`block text-[11px] font-medium ${textSecondary}`}>
                  TikTok
                </label>
                <input
                  type="url"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  placeholder="https://www.tiktok.com/@tu-cuenta"
                  className={`w-full rounded-xl border px-3 py-1.5 text-xs ${
                    dm
                      ? 'border-slate-700 bg-slate-950/60 text-slate-100'
                      : 'border-gray-200 bg-gray-50 text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={saving || loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-xs font-semibold text-white hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={14} />
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


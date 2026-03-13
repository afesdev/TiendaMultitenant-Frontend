import { useEffect, useState, type FormEvent } from 'react'
import type { LoginResponse } from '../types'
import { API_BASE_URL } from '../config'

interface LoginPageProps {
  onAuthSuccess: (data: LoginResponse) => void
}

type TiendaListItem = {
  Id: number
  NombreComercial: string
  Slug: string
  Activo?: boolean
}

const LOGIN_EMAIL_KEY = 'login_email'
const LOGIN_TIENDA_SLUG_KEY = 'login_tienda_slug'

export function LoginPage({ onAuthSuccess }: LoginPageProps) {
  const [email, setEmail] = useState(() => localStorage.getItem(LOGIN_EMAIL_KEY) ?? '')
  const [password, setPassword] = useState('')
  const [tiendaSlug, setTiendaSlug] = useState(() => localStorage.getItem(LOGIN_TIENDA_SLUG_KEY) ?? '')
  const [tiendas, setTiendas] = useState<TiendaListItem[]>([])
  const [loadingTiendas, setLoadingTiendas] = useState(true)
  const [tiendasError, setTiendasError] = useState<string | null>(null)
  const [loadingLogin, setLoadingLogin] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadTiendas() {
      setLoadingTiendas(true)
      setTiendasError(null)
      try {
        const response = await fetch(`${API_BASE_URL}/tiendas`)
        if (!response.ok) {
          throw new Error('No se pudieron cargar las tiendas')
        }
        const data = (await response.json()) as TiendaListItem[]
        if (cancelled) return
        setTiendas(Array.isArray(data) ? data : [])
      } catch (err) {
        if (cancelled) return
        setTiendasError(err instanceof Error ? err.message : 'Error al cargar tiendas')
        setTiendas([])
      } finally {
        if (cancelled) return
        setLoadingTiendas(false)
      }
    }

    loadTiendas()
    return () => {
      cancelled = true
    }
  }, [])

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
    setLoginError(null)

    if (!email || !password || !tiendaSlug) {
      setLoginError('Debes llenar todos los campos')
      return
    }

    setLoadingLogin(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, tiendaSlug }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        const message = body?.message ?? 'Error al iniciar sesión'
        throw new Error(message)
      }

      const data = (await response.json()) as LoginResponse
      localStorage.setItem(LOGIN_EMAIL_KEY, email)
      localStorage.setItem(LOGIN_TIENDA_SLUG_KEY, tiendaSlug)
      onAuthSuccess(data)
      setPassword('')
    } catch (err) {
      if (err instanceof Error) {
        setLoginError(err.message)
      } else {
        setLoginError('Error desconocido')
      }
    } finally {
      setLoadingLogin(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl shadow-emerald-500/10 p-8 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-400">Tienda Multitenant</p>
          <h1 className="text-2xl font-semibold text-slate-50">Iniciar sesión</h1>
          <p className="text-sm text-slate-400">
            Ingresa a tu panel usando el correo y la tienda.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-slate-200">Tienda</label>
            <select
              value={tiendaSlug}
              onChange={(e) => setTiendaSlug(e.target.value)}
              disabled={loadingTiendas}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="" disabled>
                {loadingTiendas ? 'Cargando tiendas...' : 'Selecciona una tienda'}
              </option>
              {tiendas.map((t) => (
                <option key={t.Id} value={t.Slug}>
                  {t.NombreComercial} ({t.Slug})
                </option>
              ))}
            </select>
            {tiendasError && (
              <p className="mt-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                {tiendasError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {loginError && (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={loadingLogin}
            className="mt-2 w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingLogin ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}


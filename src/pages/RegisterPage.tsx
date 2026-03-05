import { useState, type FormEvent } from 'react'
import { API_BASE_URL } from '../config'

export function RegisterPage() {
  const [regNombre, setRegNombre] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regTiendaSlug, setRegTiendaSlug] = useState('')
  const [regRolNombre, setRegRolNombre] = useState('')
  const [loadingRegister, setLoadingRegister] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault()
    setRegisterError(null)

    if (!regNombre || !regEmail || !regPassword || !regTiendaSlug || !regRolNombre) {
      setRegisterError('Debes llenar todos los campos obligatorios, incluido el rol')
      return
    }

    setLoadingRegister(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tiendaSlug: regTiendaSlug,
          nombre: regNombre,
          email: regEmail,
          password: regPassword,
          rolNombre: regRolNombre,
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        const message = body?.message ?? 'Error al registrarse'
        throw new Error(message)
      }

      setRegPassword('')
      setRegisterError('Usuario creado correctamente. Ahora puedes iniciar sesión.')
    } catch (err) {
      if (err instanceof Error) {
        setRegisterError(err.message)
      } else {
        setRegisterError('Error desconocido')
      }
    } finally {
      setLoadingRegister(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl shadow-emerald-500/10 p-8 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-400">Tienda Multitenant</p>
          <h1 className="text-2xl font-semibold text-slate-50">Crear cuenta</h1>
          <p className="text-sm text-slate-400">
            Registra un usuario para una tienda existente.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-slate-200">Slug de la tienda</label>
            <input
              type="text"
              value={regTiendaSlug}
              onChange={(e) => setRegTiendaSlug(e.target.value)}
              placeholder="ej: mi-tienda"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200">Nombre completo</label>
            <input
              type="text"
              value={regNombre}
              onChange={(e) => setRegNombre(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200">Correo electrónico</label>
            <input
              type="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200">Contraseña</label>
            <input
              type="password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200">Rol</label>
            <select
              value={regRolNombre}
              onChange={(e) => setRegRolNombre(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Selecciona un rol</option>
              <option value="Administrador">Administrador</option>
              <option value="Vendedor">Vendedor</option>
              <option value="Bodeguero">Bodeguero</option>
            </select>
          </div>

          {registerError && (
            <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {registerError}
            </p>
          )}

          <button
            type="submit"
            disabled={loadingRegister}
            className="mt-2 w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingRegister ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          ¿Ya tienes una cuenta?{' '}
          <a
            href="/"
            className="font-medium text-emerald-400 hover:text-emerald-300 underline-offset-4 hover:underline"
          >
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  )
}


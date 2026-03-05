import { useEffect, useState, type FormEvent } from 'react'
import { User, Phone, Mail, MapPin, X, Building } from 'lucide-react'
import Swal from 'sweetalert2'
import { API_BASE_URL } from '../config'
import type { Cliente } from '../types'

interface ClienteModalProps {
  open: boolean
  dm: boolean
  textPrimary: string
  textSecondary: string
  btnSecondary: string
  token: string
  clienteEditando: Cliente | null
  onClose: () => void
  onSaved: () => Promise<void> | void
}

export function ClienteModal({
  open,
  dm,
  textPrimary,
  textSecondary,
  btnSecondary,
  token,
  onClose,
  clienteEditando,
  onSaved,
}: ClienteModalProps) {
  const [cedula, setCedula] = useState('')
  const [nombre, setNombre] = useState('')
  const [celular, setCelular] = useState('')
  const [email, setEmail] = useState('')
  const [direccion, setDireccion] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open && clienteEditando) {
      setCedula(clienteEditando.Cedula)
      setNombre(clienteEditando.Nombre)
      setCelular(clienteEditando.Celular ?? '')
      setEmail(clienteEditando.Email ?? '')
      setDireccion(clienteEditando.Direccion ?? '')
      setCiudad(clienteEditando.Ciudad ?? '')
    }
    if (open && !clienteEditando) {
      setCedula('')
      setNombre('')
      setCelular('')
      setEmail('')
      setDireccion('')
      setCiudad('')
    }
  }, [open, clienteEditando])

  if (!open) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!cedula.trim() || !nombre.trim()) {
      void Swal.fire('Campos obligatorios', 'Cédula y nombre son obligatorios.', 'warning')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(
        `${API_BASE_URL}/clientes${clienteEditando ? `/${clienteEditando.Id}` : ''}`,
        {
          method: clienteEditando ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
          body: JSON.stringify({
            cedula: cedula.trim(),
            nombre: nombre.trim(),
            celular: celular.trim() || undefined,
            email: email.trim() || undefined,
            direccion: direccion.trim() || undefined,
            ciudad: ciudad.trim() || undefined,
          }),
        },
      )

      const body = (await response.json().catch(() => null)) as { message?: string } | null

      if (!response.ok) {
        const message =
          body?.message ?? (response.status === 409 ? 'Cliente ya existe' : 'Error al crear cliente')
        throw new Error(message)
      }

      await Swal.fire(
        clienteEditando ? 'Cliente actualizado' : 'Cliente creado',
        clienteEditando
          ? 'El cliente se actualizó correctamente.'
          : 'El cliente se registró correctamente.',
        'success',
      )
      await onSaved()
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear cliente'
      void Swal.fire('Error', message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4 transition-all">
      <div
        className={`w-full max-w-lg rounded-2xl border p-7 shadow-2xl ${
          dm
            ? 'bg-slate-900 border-slate-700 shadow-slate-950/50'
            : 'bg-white border-gray-200 shadow-gray-200/80'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <User size={22} />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${textPrimary}`}>
                {clienteEditando ? 'Editar cliente' : 'Nuevo cliente'}
              </h3>
              <p className={`mt-1 text-sm ${textSecondary}`}>
                {clienteEditando
                  ? 'Actualiza los datos del cliente.'
                  : 'Registra los datos básicos del cliente para usarlo en ventas.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all ${btnSecondary} hover:scale-105`}
            type="button"
            disabled={submitting}
          >
            <X size={20} />
          </button>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-bold mb-1.5 ${textPrimary}`}>Cédula</label>
              <input
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  dm
                    ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500'
                    : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="Número de identificación"
                autoFocus
              />
            </div>
            <div>
              <label className={`block text-sm font-bold mb-1.5 ${textPrimary}`}>Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  dm
                    ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500'
                    : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="Nombre completo"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`flex items-center gap-2 text-sm font-bold mb-1.5 ${textPrimary}`}>
                <Phone size={16} className="text-emerald-500" />
                Celular
              </label>
              <input
                type="text"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  dm
                    ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500'
                    : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="Ej. 3001234567"
              />
            </div>
            <div>
              <label className={`flex items-center gap-2 text-sm font-bold mb-1.5 ${textPrimary}`}>
                <Mail size={16} className="text-emerald-500" />
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  dm
                    ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500'
                    : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="cliente@correo.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`flex items-center gap-2 text-sm font-bold mb-1.5 ${textPrimary}`}>
                <MapPin size={16} className="text-emerald-500" />
                Dirección
              </label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  dm
                    ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500'
                    : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="Calle 123 #45-67"
              />
            </div>
            <div>
              <label className={`flex items-center gap-2 text-sm font-bold mb-1.5 ${textPrimary}`}>
                <Building size={16} className="text-emerald-500" />
                Ciudad
              </label>
              <input
                type="text"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  dm
                    ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500'
                    : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="Ciudad"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className={`rounded-xl px-3 py-1.5 text-xs transition-colors ${btnSecondary}`}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              Guardar cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


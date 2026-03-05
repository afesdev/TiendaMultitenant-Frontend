import { useState, type FormEvent } from 'react'
import Swal from 'sweetalert2'
import { FileSpreadsheet } from 'lucide-react'
import { API_BASE_URL } from '../config'

interface ClienteImportModalProps {
  open: boolean
  dm: boolean
  textPrimary: string
  textSecondary: string
  textMuted: string
  btnSecondary: string
  token: string
  onClose: () => void
  onImported: () => Promise<void> | void
}

export function ClienteImportModal({
  open,
  dm,
  textPrimary,
  textSecondary,
  textMuted,
  btnSecondary,
  token,
  onClose,
  onImported,
}: ClienteImportModalProps) {
  const [clienteImportText, setClienteImportText] = useState('')
  const [clienteImportFile, setClienteImportFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    let rows:
      | {
          Cedula?: string
          Nombre?: string
          Celular?: string | null
          Direccion?: string | null
          FechaRegistro?: string | null
        }[]
      | null = null

    // Si hay archivo Excel, lo procesamos primero
    if (clienteImportFile) {
      try {
        const XLSX = await import('xlsx')
        const buffer = await clienteImportFile.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

        rows = json.map((row) => {
          const anyRow = row as any
          return {
            Cedula: String(
              anyRow.Cedula ?? anyRow.cedula ?? anyRow['Cédula'] ?? anyRow['cédula'] ?? '',
            )
              .trim()
              || undefined,
            Nombre: String(anyRow.Nombre ?? anyRow.nombre ?? '').trim() || undefined,
            Celular:
              String(anyRow.Celular ?? anyRow.celular ?? '')
                .trim()
                .replace(/\s+/g, '') || null,
            Direccion:
              String(anyRow.Direccion ?? anyRow.direccion ?? anyRow['Dirección'] ?? '').trim() ||
              null,
            FechaRegistro:
              String(
                anyRow['Fecha Registro'] ??
                  anyRow.FechaRegistro ??
                  anyRow.fechaRegistro ??
                  '',
              ).trim() || null,
          }
        })
      } catch (error) {
        console.error(error)
        void Swal.fire(
          'Error al leer archivo',
          'No se pudo leer el archivo Excel de clientes. Verifica que sea un .xlsx válido.',
          'error',
        )
        return
      }
    } else {
      // Fallback: texto pegado desde Excel
      let tmpRows: {
        Cedula?: string
        Nombre?: string
        Celular?: string | null
        Direccion?: string | null
        FechaRegistro?: string | null
      }[] = []

      try {
        if (!clienteImportText.trim()) {
          void Swal.fire(
            'Sin datos',
            'Selecciona un archivo Excel o pega las filas copiadas desde Excel',
            'warning',
          )
          return
        }

        const lines = clienteImportText
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l.length > 0)

        if (lines.length <= 1) {
          void Swal.fire(
            'Sin filas válidas',
            'No se detectaron filas de clientes (incluye el encabezado y al menos una fila).',
            'warning',
          )
          return
        }

        const dataLines = lines.slice(1)

        for (const line of dataLines) {
          const parts = line.split('\t')
          if (parts.length < 2) continue
          const [cedula, nombre, celular, direccion, fechaRegistro] = parts.map((p) => p.trim())
          if (!cedula || !nombre) continue

          tmpRows.push({
            Cedula: cedula,
            Nombre: nombre,
            Celular: celular || null,
            Direccion: direccion || null,
            FechaRegistro: fechaRegistro || null,
          })
        }
      } catch (error) {
        console.error(error)
        void Swal.fire(
          'Error',
          'No se pudieron interpretar los datos pegados. Asegúrate de copiar desde Excel respetando el orden de columnas.',
          'error',
        )
        return
      }

      rows = tmpRows
    }

    if (!rows || !rows.length) {
      void Swal.fire('Sin filas válidas', 'No se pudieron leer filas de clientes', 'warning')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/clientes/import-excel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rows }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        const message = body?.message ?? 'Error al importar clientes'
        throw new Error(message)
      }

      const summary = (await response.json()) as {
        total: number
        exitosos: number
        conErrores: number
      }

      await Swal.fire(
        'Importación completada',
        `Total filas: ${summary.total}\nExitosos: ${summary.exitosos}\nCon errores: ${summary.conErrores}`,
        'success',
      )
      await onImported()
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al importar clientes'
      void Swal.fire('Error', message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div
        className={`w-full max-w-2xl rounded-2xl border p-6 shadow-2xl ${
          dm
            ? 'bg-slate-950 border-slate-800 shadow-slate-950/50'
            : 'bg-white border-gray-200 shadow-gray-200/80'
        }`}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className={`text-sm font-semibold ${textPrimary}`}>
              Importar clientes desde Excel
            </h3>
            <p className={`mt-0.5 text-[11px] ${textSecondary}`}>
              Puedes subir un archivo Excel (.xlsx) o copiar las filas (incluyendo encabezado) y
              pegarlas abajo. El orden de columnas debe ser:
            </p>
            <p className={`mt-1 text-[11px] font-mono ${textMuted}`}>
              Cédula, Nombre, Celular, Dirección, Fecha Registro
            </p>
          </div>
          <button
            onClick={onClose}
            className={`rounded-xl px-3 py-1 text-xs transition-colors ${btnSecondary}`}
          >
            Cerrar
          </button>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 text-xs">
            <label className={textPrimary}>Archivo Excel (.xlsx)</label>
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null
                setClienteImportFile(file)
              }}
              className="block w-full text-xs text-gray-900 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-emerald-600"
            />
            <p className={textMuted}>
              Si no seleccionas archivo, se usará el texto pegado en el área de abajo.
            </p>
          </div>

          <textarea
            value={clienteImportText}
            onChange={(e) => setClienteImportText(e.target.value)}
            rows={10}
            className={`w-full rounded-lg border px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
              dm
                ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-500'
                : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400'
            }`}
            placeholder="Pega aquí las filas copiadas desde Excel..."
          />

          <div className="flex justify-end gap-2 pt-2">
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
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              <FileSpreadsheet size={13} />
              Importar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


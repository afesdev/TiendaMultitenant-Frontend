import type { FormEvent } from 'react'
import { FileSpreadsheet } from 'lucide-react'

interface ProductoImportModalProps {
  open: boolean
  dm: boolean
  textPrimary: string
  textSecondary: string
  textMuted: string
  btnSecondary: string
  importText: string
  setImportText: (v: string) => void
  importFile: File | null
  setImportFile: (f: File | null) => void
  onClose: () => void
  onSubmit: (e: FormEvent) => void
}

export function ProductoImportModal({
  open,
  dm,
  textPrimary,
  textSecondary,
  textMuted,
  btnSecondary,
  importText,
  setImportText,
  setImportFile,
  onClose,
  onSubmit,
}: ProductoImportModalProps) {
  if (!open) return null

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
              Importar productos desde Excel
            </h3>
            <p className={`mt-0.5 text-[11px] ${textSecondary}`}>
              Puedes subir un archivo Excel (.xlsx) o copiar las filas (incluyendo encabezado) y
              pegarlas abajo. El orden de columnas debe ser:
            </p>
            <p className={`mt-1 text-[11px] font-mono ${textMuted}`}>
              Código, Nombre, Categoría, Talla, Color, Stock, Costo, Precio Detal, Precio Mayor,
              Proveedor, Visible, Descripción
            </p>
          </div>
          <button
            onClick={onClose}
            className={`rounded-xl px-3 py-1 text-xs transition-colors ${btnSecondary}`}
          >
            Cerrar
          </button>
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="flex flex-col gap-2 text-xs">
            <label className={textPrimary}>Archivo Excel (.xlsx)</label>
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              className="block w-full text-xs text-gray-900 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-emerald-600"
            />
            <p className={textMuted}>
              Si no seleccionas archivo, se usará el texto pegado en el área de abajo.
            </p>
          </div>

          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={10}
            className={`w-full rounded-lg border px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
              dm
                ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-500'
                : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400'
            }`}
            placeholder="Pega aquí los datos copiados desde Excel..."
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`rounded-xl px-3 py-1.5 text-xs transition-colors ${btnSecondary}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors"
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

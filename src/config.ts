// URL base de la API.
// En desarrollo sin .env: usa proxy /api (vite reenvía a localhost:3001)
// Con VITE_API_BASE_URL en .env o en producción: usa esa URL
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? '/api' : 'http://localhost:3001')


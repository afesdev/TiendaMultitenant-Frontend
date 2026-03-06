import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../config'
import type { TiendaConfig, TiendaPanel } from '../types'

export function useTiendaConfig(token: string) {
  const [tiendaConfig, setTiendaConfig] = useState<TiendaConfig | null>(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/tienda`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const body = (await response.json().catch(() => null)) as
          | TiendaPanel
          | { message?: string }
          | null
        if (!response.ok || !body || (body as { id?: string }).id == null) return
        setTiendaConfig((body as TiendaPanel).configuracion)
      } catch (err) {
        console.error(err)
      }
    }
    void cargar()
  }, [token])

  return { tiendaConfig, setTiendaConfig }
}

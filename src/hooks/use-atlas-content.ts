import { useEffect, useState } from 'react'
import { loadAtlasContent } from '../lib/content-loader'
import type { AtlasContent } from '../types/content'

type AtlasContentState = {
  data: AtlasContent | null
  loading: boolean
  error: string | null
}

export const useAtlasContent = (): AtlasContentState => {
  const [state, setState] = useState<AtlasContentState>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let alive = true

    loadAtlasContent()
      .then((data) => {
        if (!alive) {
          return
        }

        setState({
          data,
          loading: false,
          error: null,
        })
      })
      .catch((error: unknown) => {
        if (!alive) {
          return
        }

        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load content.',
        })
      })

    return () => {
      alive = false
    }
  }, [])

  return state
}

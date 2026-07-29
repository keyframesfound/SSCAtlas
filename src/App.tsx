import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { useAtlasContent } from './hooks/use-atlas-content'
import { useLenisScroll } from './hooks/use-lenis-scroll'
import { CinematicOverlay } from './components/CinematicOverlay'
import { DebugExplorer } from './components/DebugExplorer'
import { LoadingPage } from './components/LoadingPage'
import { isDebugMode } from './lib/debug'
import { AtlasScene } from './scene/AtlasScene'

const SCROLL_HEIGHT_VH = 1400
const AUTOPLAY_DURATION_MS = 42000

function App() {
  const debugMode = isDebugMode()
  const scrollProgress = useLenisScroll()
  const { data, loading, error } = useAtlasContent()
  const { progress: assetProgress } = useProgress()
  const [sceneReady, setSceneReady] = useState(false)
  const [displayMode, setDisplayMode] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const stageContainerRef = useRef<HTMLDivElement | null>(null)
  const [autoplayProgress, setAutoplayProgress] = useState(0)
  const progress = displayMode ? autoplayProgress : scrollProgress
  const showLoadingPage = loading || !data || !sceneReady

  useEffect(() => {
    if (!displayMode) return

    let frameId = 0
    let startedAt = 0

    const tick = (timestamp: number) => {
      if (!startedAt) {
        startedAt = timestamp
      }

      const elapsed = timestamp - startedAt
      const normalized = (elapsed % AUTOPLAY_DURATION_MS) / AUTOPLAY_DURATION_MS
      setAutoplayProgress(normalized)
      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [displayMode])

  useEffect(() => {
    if (displayMode) {
      setAutoplayProgress(0)
    }
  }, [displayMode])

  useEffect(() => {
    const syncFullscreen = () => {
      setFullscreen(document.fullscreenElement === stageContainerRef.current)
    }

    const syncViewportHeight = () => {
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight
      document.documentElement.style.setProperty('--app-height', `${viewportHeight}px`)
    }

    syncFullscreen()
    syncViewportHeight()

    document.addEventListener('fullscreenchange', syncFullscreen)
    window.addEventListener('resize', syncViewportHeight)
    window.visualViewport?.addEventListener('resize', syncViewportHeight)

    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreen)
      window.removeEventListener('resize', syncViewportHeight)
      window.visualViewport?.removeEventListener('resize', syncViewportHeight)
    }
  }, [])

  const toggleFullscreen = async () => {
    const target = stageContainerRef.current

    if (!target) return

    if (document.fullscreenElement === target) {
      await document.exitFullscreen?.()
      return
    }

    await target.requestFullscreen?.()
  }

  if (error) {
    return (
      <main className="error-shell">
        <h1>SSC Atlas</h1>
        <p>{error}</p>
      </main>
    )
  }

  return (
    <main className="atlas-shell">
      {data ? (
        debugMode ? (
          <DebugExplorer content={data} onSceneReady={setSceneReady} />
        ) : (
          <>
            <div ref={stageContainerRef} className="atlas-stage">
              <AtlasScene content={data} progress={progress} onSceneReady={setSceneReady} />
              <CinematicOverlay
                content={data}
                progress={progress}
                loading={showLoadingPage}
                displayMode={displayMode}
                fullscreen={fullscreen}
                onToggleDisplayMode={() => setDisplayMode((value) => !value)}
                onToggleFullscreen={toggleFullscreen}
              />
            </div>

            <div className="scroll-track" style={{ height: `${SCROLL_HEIGHT_VH}vh` }} aria-hidden="true" />
          </>
        )
      ) : (
        <div className="loading-shell" />
      )}

      <LoadingPage visible={showLoadingPage} progress={assetProgress} />
    </main>
  )
}

export default App

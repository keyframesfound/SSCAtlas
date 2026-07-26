import { useState } from 'react'
import { useProgress } from '@react-three/drei'
import { useAtlasContent } from './hooks/use-atlas-content'
import { useLenisScroll } from './hooks/use-lenis-scroll'
import { CinematicOverlay } from './components/CinematicOverlay'
import { DebugExplorer } from './components/DebugExplorer'
import { LoadingPage } from './components/LoadingPage'
import { isDebugMode } from './lib/debug'
import { AtlasScene } from './scene/AtlasScene'

const SCROLL_HEIGHT_VH = 1400

function App() {
  const debugMode = isDebugMode()
  const progress = useLenisScroll()
  const { data, loading, error } = useAtlasContent()
  const { progress: assetProgress } = useProgress()
  const [sceneReady, setSceneReady] = useState(false)
  const showLoadingPage = loading || !data || !sceneReady

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
            <div className="atlas-stage">
              <AtlasScene content={data} progress={progress} onSceneReady={setSceneReady} />
              <CinematicOverlay content={data} progress={progress} loading={showLoadingPage} />
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

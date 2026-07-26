import { useAtlasContent } from './hooks/use-atlas-content'
import { useLenisScroll } from './hooks/use-lenis-scroll'
import { CinematicOverlay } from './components/CinematicOverlay'
import { AtlasScene } from './scene/AtlasScene'

const SCROLL_HEIGHT_VH = 1400

function App() {
  const progress = useLenisScroll()
  const { data, loading, error } = useAtlasContent()

  if (error) {
    return (
      <main className="error-shell">
        <h1>SSC Atlas</h1>
        <p>{error}</p>
      </main>
    )
  }

  if (!data) {
    return <main className="loading-shell" />
  }

  return (
    <main className="atlas-shell">
      <div className="atlas-stage">
        <AtlasScene content={data} progress={progress} />
        <CinematicOverlay content={data} progress={progress} loading={loading} />
      </div>

      <div className="scroll-track" style={{ height: `${SCROLL_HEIGHT_VH}vh` }} aria-hidden="true" />
    </main>
  )
}

export default App

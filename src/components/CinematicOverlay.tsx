import { useMemo } from 'react'
import { chapterAtProgress } from '../lib/timeline'
import { smoothstep } from '../lib/math'
import type { AtlasContent } from '../types/content'

type CinematicOverlayProps = {
  content: AtlasContent
  progress: number
  loading: boolean
  displayMode: boolean
  fullscreen: boolean
  onToggleDisplayMode: () => void
  onToggleFullscreen: () => void
}

export const CinematicOverlay = ({
  content,
  progress,
  loading,
  displayMode,
  fullscreen,
  onToggleDisplayMode,
  onToggleFullscreen,
}: CinematicOverlayProps) => {
  const chapter = useMemo(
    () => chapterAtProgress(content.timeline.chapters, progress),
    [content.timeline.chapters, progress],
  )

  const openingVisible = progress < 0.08 && !displayMode
  const finalVisible = chapter.kind === 'finale' && !displayMode

  return (
    <>
      <div className={`overlay-loading ${loading ? 'visible' : ''}`}>
        <p>Loading SSC Atlas</p>
      </div>

      <div className="overlay-controls" aria-label="Overlay controls">
        <button type="button" onClick={onToggleFullscreen}>
          {fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
        <button type="button" onClick={onToggleDisplayMode}>
          {displayMode ? 'Exit Display Mode' : 'Display Mode'}
        </button>
      </div>

      <div className="overlay-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>

      <div className={`overlay-scroll ${openingVisible ? 'visible' : ''}`}>
        <p>{content.timeline.openingPrompt}</p>
      </div>

      <aside className={`overlay-chapter ${finalVisible ? 'hidden' : ''}`}>
        <p className="eyebrow">{chapter.headline}</p>
        <h1>{chapter.title}</h1>
        <p className="description">{chapter.description}</p>
      </aside>

      <section className={`overlay-finale ${finalVisible ? 'visible' : ''}`}>
        <h2>{content.statistics.finalTitle}</h2>
        <p>{content.statistics.finalSubtitle}</p>
        <a
          href="https://www.ssc.edu.hk/links/ssctrail/chi/docent.html"
          target="_blank"
          rel="noreferrer"
          className="overlay-finale-link"
        >
          Arrange a Campus Visit
        </a>
      </section>

      <div className="overlay-vignette" style={{ opacity: 0.22 + smoothstep(0.3, 1, progress) * 0.2 }} />
    </>
  )
}

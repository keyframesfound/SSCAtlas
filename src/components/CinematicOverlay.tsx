import { useMemo, useState } from 'react'
import { chapterAtProgress } from '../lib/timeline'
import { smoothstep } from '../lib/math'
import type { AtlasContent } from '../types/content'

type CinematicOverlayProps = {
  content: AtlasContent
  progress: number
  loading: boolean
}

export const CinematicOverlay = ({ content, progress, loading }: CinematicOverlayProps) => {
  const [expanded, setExpanded] = useState(false)
  const chapter = useMemo(
    () => chapterAtProgress(content.timeline.chapters, progress),
    [content.timeline.chapters, progress],
  )

  const openingVisible = progress < 0.08
  const finalVisible = chapter.kind === 'finale'

  return (
    <>
      <div className={`overlay-loading ${loading ? 'visible' : ''}`}>
        <p>Loading SSC Atlas</p>
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

        {(chapter.kind === 'chapter' || chapter.kind === 'reveal') && (
          <button
            type="button"
            className="details-toggle"
            onClick={() => setExpanded((state) => !state)}
            aria-expanded={expanded}
          >
            {expanded ? 'Hide Architectural Notes' : 'Show Architectural Notes'}
          </button>
        )}

        <div className={`details-panel ${expanded ? 'expanded' : ''}`}>
          <p>
            Chapter pacing is driven by a single scroll timeline and references one master campus
            model. Replace the content JSON and model asset to update the story without changing
            source code.
          </p>
        </div>
      </aside>

      <section className={`overlay-reveal ${chapter.kind === 'reveal' ? 'visible' : ''}`}>
        <h2>{content.statistics.campusAcreage}</h2>
        <h3>{content.statistics.tagline}</h3>
        <p>{content.statistics.subline}</p>
      </section>

      <section className={`overlay-finale ${finalVisible ? 'visible' : ''}`}>
        <p className="crest-mark">SSC</p>
        <h2>{content.statistics.finalTitle}</h2>
        <p>{content.statistics.finalSubtitle}</p>
        <button type="button">Arrange a Campus Visit</button>
      </section>

      <div className="overlay-vignette" style={{ opacity: 0.22 + smoothstep(0.3, 1, progress) * 0.2 }} />
    </>
  )
}

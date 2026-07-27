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
  const profileMap = useMemo(
    () => new Map(content.heritageProfiles.map((profile) => [profile.id, profile])),
    [content.heritageProfiles],
  )
  const focusedProfiles = useMemo(() => {
    const ids = chapter.focusBuildingIds ?? []
    return ids
      .map((id) => profileMap.get(id))
      .filter((profile): profile is NonNullable<typeof profile> => Boolean(profile))
  }, [chapter.focusBuildingIds, profileMap])

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
            className={`details-toggle ${expanded ? 'active' : ''}`}
            onClick={() => setExpanded((state) => !state)}
            aria-expanded={expanded}
          >
            <span className="details-toggle-icon" aria-hidden="true">
              <span className="book-icon">📖</span>
              <span className="bulb-icon">💡</span>
            </span>
            {expanded ? 'Close Architectural Notes' : 'Open Architectural Notes'}
          </button>
        )}

        <div className={`details-panel ${expanded ? 'expanded' : ''}`} role="dialog" aria-modal="true" aria-label="Architectural notes">
          <button
            type="button"
            className="details-panel-backdrop"
            onClick={() => setExpanded(false)}
            aria-label="Close architectural notes"
          />

          <div className="details-panel-sheet">
            <div className="details-panel-header">
              <div className="details-panel-heading">
                <p className="eyebrow">Architectural notes</p>
                <h2>Important context for this chapter</h2>
              </div>
              <button type="button" className="details-close" onClick={() => setExpanded(false)}>
                Close
              </button>
            </div>

            <div className="details-panel-body">
              <div className="notes-intro">
                <div className="notes-badge" aria-hidden="true">
                  <span>📖</span>
                  <span>💡</span>
                </div>
                <p>
                  These notes are treated like a cherished reference book—quietly important,
                  beautifully framed, and worth pausing for.
                </p>
              </div>

              {focusedProfiles.length > 0 ? (
                <div className="heritage-notes">
                  {focusedProfiles.map((profile) => (
                    <article key={profile.id} className="heritage-note">
                      <h4>{profile.name}</h4>
                      <p className="meta">
                        {profile.year} - {profile.grade}
                      </p>
                      <p>{profile.narrative}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="notes-empty">
                  Chapter pacing is driven by a single scroll timeline and references one master campus
                  model. Replace content JSON and model assets to update the narrative.
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>

      <section className={`overlay-finale ${finalVisible ? 'visible' : ''}`}>
        <p className="crest-mark">SSC</p>
        <h2>{content.statistics.finalTitle}</h2>
        <p>{content.statistics.finalSubtitle}</p>
        <div className="heritage-register">
          {content.heritageProfiles.map((profile) => (
            <p key={`register-${profile.id}`}>{profile.name}</p>
          ))}
        </div>
        <button type="button">Arrange a Campus Visit</button>
      </section>

      <div className="overlay-vignette" style={{ opacity: 0.22 + smoothstep(0.3, 1, progress) * 0.2 }} />
    </>
  )
}

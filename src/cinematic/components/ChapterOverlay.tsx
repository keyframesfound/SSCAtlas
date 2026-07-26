import { useMemo, useState } from "react";
import type { CampusStatistics, SceneChapter } from "../types";

interface ChapterOverlayProps {
  scene: SceneChapter;
  sceneIndex: number;
  sceneCount: number;
  statistics: CampusStatistics;
  progress: number;
}

export function ChapterOverlay({
  scene,
  sceneIndex,
  sceneCount,
  statistics,
  progress,
}: ChapterOverlayProps) {
  const [expanded, setExpanded] = useState(false);

  const sceneProgress = useMemo(() => {
    const total = scene.progressEnd - scene.progressStart || 1;
    return Math.min(1, Math.max(0, (progress - scene.progressStart) / total));
  }, [progress, scene.progressEnd, scene.progressStart]);

  const showFinalCta = progress > 0.93;

  return (
    <>
      <div className="scroll-hint" aria-hidden={progress > 0.04}>
        Scroll to Begin
      </div>

      <aside className="chapter-overlay" style={{ opacity: showFinalCta ? 0.15 : 1 }}>
        <div className="chapter-meta">
          <span>{scene.label}</span>
          <span>
            {sceneIndex + 1}/{sceneCount}
          </span>
        </div>
        <h1>{scene.title}</h1>
        <p className="chapter-intro">{scene.intro}</p>
        <p className="chapter-description">{scene.description}</p>

        <button
          type="button"
          className="details-toggle"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Hide details" : "View details"}
        </button>

        {expanded && (
          <ul className="chapter-details">
            {scene.detailBullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        )}

        <div className="chapter-timeline">
          <div style={{ transform: `scaleX(${sceneProgress})` }} />
        </div>
      </aside>

      <div className="boundary-caption" aria-hidden={!(progress > 0.08 && progress < 0.2)}>
        <h2>{statistics.acres} Acres</h2>
        <p>{statistics.statement}</p>
        <p>{statistics.heritageLine}</p>
      </div>

      <div className={`final-cta ${showFinalCta ? "is-visible" : ""}`}>
        <img src={statistics.crest} alt="St. Stephen's College crest" />
        <h2>{statistics.ctaTitle}</h2>
        <p>{statistics.ctaSubtitle}</p>
        <a href={statistics.ctaHref}>{statistics.ctaLabel}</a>
      </div>

      <div className="progress-rail" aria-hidden="true">
        <div style={{ transform: `scaleY(${progress})` }} />
      </div>
    </>
  );
}

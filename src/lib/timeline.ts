import type { CameraKeyframe, CameraPathMap, TimelineChapter } from '../types/content'
import { clamp01, inverseLerp } from './math'

export const chapterAtProgress = (
  chapters: TimelineChapter[],
  progress: number,
): TimelineChapter => {
  const p = clamp01(progress)
  const found = chapters.find((chapter) => p >= chapter.start && p <= chapter.end)

  if (!found) {
    return chapters[chapters.length - 1]
  }

  return found
}

export const chapterProgress = (chapter: TimelineChapter, progress: number): number => {
  return inverseLerp(chapter.start, chapter.end, progress)
}

export const sampleCameraPath = (
  cameraPaths: CameraPathMap,
  pathId: string,
  localProgress: number,
): CameraKeyframe => {
  const path = cameraPaths[pathId]

  if (!path || path.length === 0) {
    return {
      t: 0,
      position: [0, 120, 220],
      lookAt: [0, 0, 0],
      fov: 40,
    }
  }

  const p = clamp01(localProgress)

  if (path.length === 1 || p <= path[0].t) {
    return path[0]
  }

  const last = path[path.length - 1]
  if (p >= last.t) {
    return last
  }

  for (let index = 0; index < path.length - 1; index += 1) {
    const from = path[index]
    const to = path[index + 1]

    if (p >= from.t && p <= to.t) {
      const t = inverseLerp(from.t, to.t, p)

      return {
        t: p,
        position: [
          from.position[0] + (to.position[0] - from.position[0]) * t,
          from.position[1] + (to.position[1] - from.position[1]) * t,
          from.position[2] + (to.position[2] - from.position[2]) * t,
        ],
        lookAt: [
          from.lookAt[0] + (to.lookAt[0] - from.lookAt[0]) * t,
          from.lookAt[1] + (to.lookAt[1] - from.lookAt[1]) * t,
          from.lookAt[2] + (to.lookAt[2] - from.lookAt[2]) * t,
        ],
        fov: from.fov + (to.fov - from.fov) * t,
      }
    }
  }

  return last
}

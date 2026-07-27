import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, PerspectiveCamera, Vector3 } from 'three'
import { chapterAtProgress, chapterProgress, sampleCameraPath } from '../lib/timeline'
import type { AtlasContent } from '../types/content'

type CameraDirectorProps = {
  content: AtlasContent
  progress: number
}

const tempPosition = new Vector3()
const tempLookAt = new Vector3()

export const CameraDirector = ({ content, progress }: CameraDirectorProps) => {
  const { camera } = useThree()

  useFrame(() => {
    const chapter = chapterAtProgress(content.timeline.chapters, progress)
    const local = chapterProgress(chapter, progress)
    const sample = sampleCameraPath(content.cameraPaths, chapter.cameraPathId, local)

    tempPosition.set(...sample.position)
    tempLookAt.set(...sample.lookAt)

    camera.position.copy(tempPosition)
    camera.up.set(0, 1, 0)
    camera.lookAt(tempLookAt)

    if (camera instanceof PerspectiveCamera) {
      camera.fov = sample.fov
      camera.updateProjectionMatrix()
    }
  })

  return null
}

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

    camera.position.lerp(tempPosition, 0.08)
    camera.lookAt(tempLookAt)

    if (camera instanceof PerspectiveCamera) {
      camera.fov = MathUtils.lerp(camera.fov, sample.fov, 0.08)
      camera.updateProjectionMatrix()
    }
  })

  return null
}

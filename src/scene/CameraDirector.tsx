import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, PerspectiveCamera, Quaternion, Vector3 } from 'three'
import { chapterAtProgress, chapterProgress, sampleCameraPath } from '../lib/timeline'
import type { AtlasContent } from '../types/content'

type CameraDirectorProps = {
  content: AtlasContent
  progress: number
}

const tempPosition = new Vector3()
const tempLookAt = new Vector3()
const tempQuaternion = new Quaternion()
const targetQuaternion = new Quaternion()

export const CameraDirector = ({ content, progress }: CameraDirectorProps) => {
  const { camera } = useThree()

  useFrame((_, delta) => {
    const chapter = chapterAtProgress(content.timeline.chapters, progress)
    const local = chapterProgress(chapter, progress)
    const sample = sampleCameraPath(content.cameraPaths, chapter.cameraPathId, local)

    tempPosition.set(...sample.position)
    tempLookAt.set(...sample.lookAt)

    camera.position.lerp(tempPosition, 1 - Math.exp(-delta * 2.8))

    tempQuaternion.copy(camera.quaternion)
    camera.lookAt(tempLookAt)
    targetQuaternion.copy(camera.quaternion)
    camera.quaternion.copy(tempQuaternion)
    camera.quaternion.slerp(targetQuaternion, 1 - Math.exp(-delta * 3.2))

    if (camera instanceof PerspectiveCamera) {
      camera.fov = MathUtils.lerp(camera.fov, sample.fov, 1 - Math.exp(-delta * 3))
      camera.updateProjectionMatrix()
    }
  })

  return null
}

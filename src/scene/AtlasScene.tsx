import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OpeningContours } from './OpeningContours'
import { CampusModel } from './CampusModel'
import { CampusBoundary } from './CampusBoundary'
import { CameraDirector } from './CameraDirector'
import type { AtlasContent } from '../types/content'

type AtlasSceneProps = {
  content: AtlasContent
  progress: number
  onSceneReady: (ready: boolean) => void
}

export const AtlasScene = ({ content, progress, onSceneReady }: AtlasSceneProps) => {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 340, 580], fov: 34, near: 0.1, far: 2200 }}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
      }}
    >
      <Suspense fallback={null}>
        <CameraDirector content={content} progress={progress} />

        <OpeningContours progress={progress} />

        <group>
          <CampusModel
            stats={content.statistics}
            buildings={content.buildings}
            onModelReady={() => onSceneReady(true)}
          />
          <CampusBoundary points={content.statistics.boundaryPoints} progress={progress} />
        </group>
      </Suspense>
    </Canvas>
  )
}

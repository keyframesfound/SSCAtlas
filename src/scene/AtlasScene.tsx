import { Suspense } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'
import { OpeningContours } from './OpeningContours'
import { CampusModel } from './CampusModel'
import { CampusBoundary } from './CampusBoundary'
import { CameraDirector } from './CameraDirector'
import type { AtlasContent } from '../types/content'
import { smoothstep } from '../lib/math'

type AtlasSceneProps = {
  content: AtlasContent
  progress: number
  onSceneReady: (ready: boolean) => void
}

const Atmosphere = () => {
  return <color attach="background" args={['#f5f7fb']} />
}

export const AtlasScene = ({ content, progress, onSceneReady }: AtlasSceneProps) => {
  const sparklesOpacity = 0.05 + smoothstep(0.2, 0.9, progress) * 0.05

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 340, 580], fov: 34, near: 0.1, far: 2200 }}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.7,
      }}
    >
      <Suspense fallback={null}>
        <Atmosphere />
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

        <Float speed={0.6} rotationIntensity={0.08} floatIntensity={0.18}>
          <Sparkles
            count={80}
            scale={[240, 80, 240]}
            size={0.6}
            speed={0.1}
            opacity={sparklesOpacity}
            color="#ffffff"
          />
        </Float>
      </Suspense>
    </Canvas>
  )
}

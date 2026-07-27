import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, Float, Sky, Sparkles } from '@react-three/drei'
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

const Atmosphere = ({ progress }: { progress: number }) => {
  const sunsetMix = smoothstep(0.12, 0.95, progress)

  return (
    <>
      <Sky
        distance={1000}
        sunPosition={[8 + sunsetMix * 18, 6, -24]}
        inclination={0.5}
        azimuth={0.2}
        rayleigh={0.8}
        turbidity={8}
        mieCoefficient={0.012}
      />

      <ambientLight intensity={0.18} color="#8fa0bb" />
      <directionalLight
        castShadow
        intensity={1.45}
        color="#f9d7a8"
        position={[120, 130, 40]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={600}
      />

      <Environment preset="sunset" background={false} />
    </>
  )
}

export const AtlasScene = ({ content, progress, onSceneReady }: AtlasSceneProps) => {
  const sparklesOpacity = 0.08 + smoothstep(0.2, 0.9, progress) * 0.12

  return (
    <Canvas
      dpr={[1, 2]}
      shadows
      camera={{ position: [0, 340, 580], fov: 34, near: 0.1, far: 2200 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <Suspense fallback={null}>
        <Atmosphere progress={progress} />
        <CameraDirector content={content} progress={progress} />

        <group>
          <CampusModel
            stats={content.statistics}
            buildings={content.buildings}
            onModelReady={() => onSceneReady(true)}
          />
          <CampusBoundary points={content.statistics.boundaryPoints} progress={progress} />
        </group>

        <ContactShadows
          position={[0, -0.02, 0]}
          opacity={0.35}
          scale={220}
          blur={2.2}
          far={220}
          resolution={1024}
        />

        <Float speed={0.6} rotationIntensity={0.08} floatIntensity={0.18}>
          <Sparkles
            count={140}
            scale={[240, 80, 240]}
            size={0.85}
            speed={0.1}
            opacity={sparklesOpacity}
            color="#e9eef8"
          />
        </Float>
      </Suspense>
    </Canvas>
  )
}

import { Suspense } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, Float, Sparkles } from '@react-three/drei'
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

// Studio / Google-Maps-style lighting: flat, neutral, even illumination.
// No single dominant sun direction — multiple soft lights cancel out harsh shadows
// so building forms read clearly from every angle instead of being lit dramatically.
const Atmosphere = () => {
  return (
    <>
      {/* Soft, near-white sky dome instead of a dramatic sunset sky */}
      <color attach="background" args={['#eef1f5']} />

      {/* Primary overhead light — soft shadows, neutral white, moderate intensity */}
      <directionalLight
        castShadow
        intensity={0.9}
        color="#ffffff"
        position={[80, 160, 60]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={600}
        shadow-bias={-0.0004}
      />

      {/* Secondary fill from the opposite side — keeps shadow sides of buildings readable, not black */}
      <directionalLight intensity={0.3} color="#f4f6fa" position={[-90, 120, -40]} />

      {/* Fill from the front, low intensity — evens out remaining contrast */}
      <directionalLight intensity={0.3} color="#ffffff" position={[0, 60, 140]} />

      {/* High ambient — this is the biggest lever for the "flat map" look */}
      <ambientLight intensity={0.5} color="#ffffff" />

      {/* Neutral studio HDRI for reflections — no colored sky bounce, just clean highlights */}
      <Environment preset="studio" background={false} />
    </>
  )
}

export const AtlasScene = ({ content, progress, onSceneReady }: AtlasSceneProps) => {
  const sparklesOpacity = 0.05 + smoothstep(0.2, 0.9, progress) * 0.05

  return (
    <Canvas
      dpr={[1, 2]}
      shadows
      camera={{ position: [0, 340, 580], fov: 34, near: 0.1, far: 2200 }}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
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

        {/* Tight, crisp contact shadows — reads as clean ground-contact AO, not a soft glow */}
        <ContactShadows
          position={[0, -0.02, 0]}
          opacity={0.4}
          scale={220}
          blur={1.2}
          far={220}
          resolution={1024}
        />

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

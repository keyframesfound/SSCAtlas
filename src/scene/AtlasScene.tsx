import { Suspense } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, Float, Sky, Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
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

const Atmosphere = ({ progress }: { progress: number }) => {
  const sunsetMix = smoothstep(0.12, 0.95, progress)

  return (
    <>
      <Sky
        distance={1000}
        sunPosition={[8 + sunsetMix * 18, 3, -24]}
        inclination={0.5}
        azimuth={0.2}
        rayleigh={1.4}
        turbidity={9}
        mieCoefficient={0.015}
        mieDirectionalG={0.85}
      />

      {/* Atmospheric haze — desaturates distant geometry, sells depth */}
      <fog attach="fog" args={['#e8935f', 200, 1400]} />

      {/* Warm key light, low angle for dramatic sunset shadows */}
      <directionalLight
        castShadow
        intensity={1.6}
        color="#ff9d5c"
        position={[120, 60, -40]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={600}
        shadow-bias={-0.0005}
      />

      {/* Cool fill/rim light — keeps shadows from reading flat/grey */}
      <directionalLight intensity={0.35} color="#4a6fa5" position={[-80, 40, 100]} />

      <ambientLight intensity={0.12} color="#3d4a6b" />

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
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
    >
      <Suspense fallback={null}>
        <Atmosphere progress={progress} />
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

        <EffectComposer>
          <Bloom intensity={0.4} luminanceThreshold={0.6} luminanceSmoothing={0.9} />
          <Vignette eskil={false} offset={0.15} darkness={0.6} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}

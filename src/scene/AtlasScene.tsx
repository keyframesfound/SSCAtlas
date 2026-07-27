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

// Linear interpolation helper for lighting values
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

// Linear interpolation between two hex color strings
const lerpColor = (colorA: string, colorB: string, t: number): string => {
  const c1 = new THREE.Color(colorA)
  const c2 = new THREE.Color(colorB)
  return c1.lerp(c2, t).getStyle()
}

const Atmosphere = ({ progress }: { progress: number }) => {
  // reveal: 0 during intro, 1 once the camera has settled on the campus.
  // Drives the transition from "golden hour reveal" to "midday architectural" lighting.
  const reveal = smoothstep(0.15, 0.55, progress)
  const sunsetMix = smoothstep(0.12, 0.95, progress)

  // --- Golden hour reveal mode (progress ~0) ---
  const revealSunY = 3
  const revealKeyColor = '#ff9d5c'
  const revealKeyIntensity = 1.6
  const revealFillColor = '#4a6fa5'
  const revealFillIntensity = 0.35
  const revealAmbientColor = '#3d4a6b'
  const revealAmbientIntensity = 0.12

  // --- Midday architectural mode (progress ~1) ---
  const archSunY = 25
  const archKeyColor = '#fff1de'
  const archKeyIntensity = 1.4
  const archFillColor = '#c9d6e8'
  const archFillIntensity = 0.5
  const archAmbientColor = '#dfe6f0'
  const archAmbientIntensity = 0.25

  // Interpolated values driving the actual lights
  const sunY = lerp(revealSunY, archSunY, reveal)
  const keyColor = lerpColor(revealKeyColor, archKeyColor, reveal)
  const keyIntensity = lerp(revealKeyIntensity, archKeyIntensity, reveal)
  const fillColor = lerpColor(revealFillColor, archFillColor, reveal)
  const fillIntensity = lerp(revealFillIntensity, archFillIntensity, reveal)
  const ambientColor = lerpColor(revealAmbientColor, archAmbientColor, reveal)
  const ambientIntensity = lerp(revealAmbientIntensity, archAmbientIntensity, reveal)

  // Environment preset swaps once we're mostly settled into architectural mode
  const envPreset = reveal > 0.5 ? 'city' : 'sunset'

  return (
    <>
      <Sky
        distance={1000}
        sunPosition={[8 + sunsetMix * 18, sunY, -24]}
        inclination={0.5}
        azimuth={0.2}
        rayleigh={lerp(1.4, 0.9, reveal)}
        turbidity={lerp(9, 6, reveal)}
        mieCoefficient={lerp(0.015, 0.008, reveal)}
        mieDirectionalG={0.85}
      />

      {/* Atmospheric haze — fades out as we move into architectural mode so distant buildings stay legible */}
      <fog attach="fog" args={['#e8935f', lerp(200, 400, reveal), lerp(1400, 2000, reveal)]} />

      {/* Key light — warm gold during reveal, neutral-warm white for architecture */}
      <directionalLight
        castShadow
        intensity={keyIntensity}
        color={keyColor}
        position={[lerp(120, 100, reveal), lerp(60, 140, reveal), lerp(-40, -60, reveal)]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={600}
        shadow-bias={-0.0005}
      />

      {/* Fill/rim light — cool blue reveal, soft sky-blue fill for architecture (keeps shadow sides readable) */}
      <directionalLight
        intensity={fillIntensity}
        color={fillColor}
        position={[lerp(-80, -100, reveal), lerp(40, 80, reveal), lerp(100, 80, reveal)]}
      />

      <ambientLight intensity={ambientIntensity} color={ambientColor} />

      <Environment preset={envPreset} background={false} />
    </>
  )
}

export const AtlasScene = ({ content, progress, onSceneReady }: AtlasSceneProps) => {
  const sparklesOpacity = 0.08 + smoothstep(0.2, 0.9, progress) * 0.12
  // Sparkles are an intro flourish — fade them out once we're in architectural mode
  const architecturalReveal = smoothstep(0.15, 0.55, progress)
  const finalSparklesOpacity = sparklesOpacity * (1 - architecturalReveal)

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
          blur={1.5}
          far={220}
          resolution={1024}
        />

        <Float speed={0.6} rotationIntensity={0.08} floatIntensity={0.18}>
          <Sparkles
            count={140}
            scale={[240, 80, 240]}
            size={0.85}
            speed={0.1}
            opacity={finalSparklesOpacity}
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

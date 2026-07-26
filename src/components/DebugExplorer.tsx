import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, FlyControls, Grid, OrbitControls, Sky, Sparkles } from '@react-three/drei'
import { PerspectiveCamera, Vector3 } from 'three'
import { CampusModel } from '../scene/CampusModel'
import type { AtlasContent } from '../types/content'

type DebugExplorerProps = {
  content: AtlasContent
  onSceneReady: (ready: boolean) => void
}

type CameraSnapshot = {
  position: [number, number, number]
  lookAt: [number, number, number]
  fov: number
}

const lookDirection = new Vector3()
const lookTarget = new Vector3()

type DebugCameraProbeProps = {
  focusDistance: number
  controlMode: 'fly' | 'orbit'
  turnDirection: number
  onSnapshot: (snapshot: CameraSnapshot) => void
}

const DebugCameraProbe = ({ focusDistance, controlMode, turnDirection, onSnapshot }: DebugCameraProbeProps) => {
  const { camera } = useThree()

  useFrame((_, delta) => {
    if (camera instanceof PerspectiveCamera) {
      camera.fov = 40
      camera.updateProjectionMatrix()
    }

    if (controlMode === 'fly' && turnDirection !== 0) {
      camera.rotateY(turnDirection * delta * 1.5)
    }

    camera.getWorldDirection(lookDirection)
    lookTarget.copy(camera.position).addScaledVector(lookDirection, focusDistance)

    onSnapshot({
      position: [camera.position.x, camera.position.y, camera.position.z],
      lookAt: [lookTarget.x, lookTarget.y, lookTarget.z],
      fov: 40,
    })
  })

  return null
}

const DebugEnvironment = () => {
  return (
    <>
      <Sky
        distance={1000}
        sunPosition={[22, 14, -18]}
        inclination={0.5}
        azimuth={0.15}
        rayleigh={0.7}
        turbidity={8}
        mieCoefficient={0.01}
      />
      <ambientLight intensity={0.25} color="#90a4be" />
      <directionalLight
        castShadow
        intensity={1.3}
        color="#f5d7aa"
        position={[120, 130, 40]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <Environment preset="sunset" background={false} />
      <Sparkles count={80} scale={[320, 120, 320]} size={0.7} speed={0.08} opacity={0.08} />
    </>
  )
}

const formatVector = (vector: [number, number, number]) => {
  return `[${vector.map((value) => Number(value.toFixed(3))).join(', ')}]`
}

export const DebugExplorer = ({ content, onSceneReady }: DebugExplorerProps) => {
  const [focusDistance, setFocusDistance] = useState(100)
  const [controlMode, setControlMode] = useState<'fly' | 'orbit'>('fly')
  const [turnDirection, setTurnDirection] = useState(0)
  const turnState = useRef({ left: false, right: false })
  const [snapshot, setSnapshot] = useState<CameraSnapshot>({
    position: [0, 120, 220],
    lookAt: [0, 0, 0],
    fov: 40,
  })

  const keyframeSnippet = useMemo(() => {
    return `{ "t": 0, "position": ${formatVector(snapshot.position)}, "lookAt": ${formatVector(snapshot.lookAt)}, "fov": 40 }`
  }, [snapshot])

  useEffect(() => {
    const syncTurnDirection = () => {
      const nextDirection = turnState.current.left === turnState.current.right
        ? 0
        : turnState.current.left
          ? 1
          : -1

      setTurnDirection(nextDirection)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()

      if (key === 'm') {
        setControlMode((mode) => (mode === 'fly' ? 'orbit' : 'fly'))
      }

      if (key === 'q') {
        turnState.current.left = true
        syncTurnDirection()
      }

      if (key === 'e') {
        turnState.current.right = true
        syncTurnDirection()
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()

      if (key === 'q') {
        turnState.current.left = false
        syncTurnDirection()
      }

      if (key === 'e') {
        turnState.current.right = false
        syncTurnDirection()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  return (
    <main className="debug-shell">
      <div className="debug-stage">
        <Canvas
          dpr={[1, 2]}
          shadows
          camera={{ position: [0, 120, 220], fov: 40, near: 0.1, far: 3000 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <DebugEnvironment />
            <DebugCameraProbe
              focusDistance={focusDistance}
              controlMode={controlMode}
              turnDirection={turnDirection}
              onSnapshot={setSnapshot}
            />
            <CampusModel
              stats={content.statistics}
              buildings={content.buildings}
              onModelReady={() => onSceneReady(true)}
            />
            <Grid
              position={[0, -0.01, 0]}
              args={[800, 800]}
              cellColor="#324055"
              sectionColor="#5a6f90"
              cellThickness={0.4}
              sectionThickness={0.8}
              fadeDistance={900}
              fadeStrength={1.5}
            />
            {controlMode === 'fly' ? (
              <FlyControls movementSpeed={80} rollSpeed={0} dragToLook autoForward={false} />
            ) : (
              <OrbitControls makeDefault enablePan enableZoom enableRotate />
            )}
          </Suspense>
        </Canvas>
      </div>

      <aside className="debug-hud">
        <p className="debug-kicker">SSC Atlas Debug Explorer</p>
        <h1>Camera Inspector</h1>
        <p className="debug-copy">
          Fly: click and drag to look, move with WASD/R/F, turn with Q/E. Press M to switch mode. FOV is locked to 40.
        </p>

        <div className="debug-controls">
          <label htmlFor="focus-distance">Derived lookAt distance</label>
          <input
            id="focus-distance"
            type="range"
            min="20"
            max="400"
            step="1"
            value={focusDistance}
            onChange={(event) => setFocusDistance(Number(event.target.value))}
          />
          <span>{focusDistance}</span>
        </div>

        <div className="debug-readout">
          <p>Mode: {controlMode}</p>
          <p>Position: {formatVector(snapshot.position)}</p>
          <p>lookAt: {formatVector(snapshot.lookAt)}</p>
          <p>FOV: 40</p>
        </div>

        <textarea readOnly value={keyframeSnippet} className="debug-snippet" />

        <button
          type="button"
          className="debug-button"
          onClick={() => navigator.clipboard.writeText(keyframeSnippet)}
        >
          Copy Keyframe JSON
        </button>
      </aside>
    </main>
  )
}
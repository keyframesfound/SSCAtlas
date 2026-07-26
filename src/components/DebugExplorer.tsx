import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Grid, OrbitControls, Sky, Sparkles } from '@react-three/drei'
import { Euler, PerspectiveCamera, Vector3 } from 'three'
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
const movementVector = new Vector3()
const strafeVector = new Vector3()
const verticalVector = new Vector3(0, 1, 0)
const euler = new Euler(0, 0, 0, 'YXZ')
const initialDebugPosition: [number, number, number] = [0, 120, 220]
const initialDebugLookAt: [number, number, number] = [0, 120, 0]

type DebugCameraProbeProps = {
  focusDistance: number
  controlMode: 'fly' | 'orbit'
  turnDirection: number
  rollDirection: number
  onSnapshot: (snapshot: CameraSnapshot) => void
}

const DebugCameraProbe = ({
  focusDistance,
  controlMode,
  turnDirection,
  rollDirection,
  onSnapshot,
}: DebugCameraProbeProps) => {
  const { camera, gl } = useThree()
  const yawRef = useRef(0)
  const pitchRef = useRef(0)
  const dragState = useRef({ active: false, lastX: 0, lastY: 0 })
  const keyState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  })

  useEffect(() => {
    camera.position.set(...initialDebugPosition)
    camera.lookAt(...initialDebugLookAt)
    const direction = new Vector3(...initialDebugLookAt).sub(camera.position).normalize()
    yawRef.current = Math.atan2(direction.x, direction.z)
    pitchRef.current = Math.asin(direction.y)
  }, [camera])

  useEffect(() => {
    if (controlMode !== 'fly') {
      dragState.current.active = false
      return
    }

    const element = gl.domElement
    const dragSensitivity = 0.0035

    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) {
        return
      }

      dragState.current.active = true
      dragState.current.lastX = event.clientX
      dragState.current.lastY = event.clientY
    }

    const onMouseMove = (event: MouseEvent) => {
      if (!dragState.current.active) {
        return
      }

      const deltaX = event.clientX - dragState.current.lastX
      const deltaY = event.clientY - dragState.current.lastY

      dragState.current.lastX = event.clientX
      dragState.current.lastY = event.clientY

      yawRef.current -= deltaX * dragSensitivity
      pitchRef.current -= deltaY * dragSensitivity
      pitchRef.current = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, pitchRef.current))
    }

    const endDrag = () => {
      dragState.current.active = false
    }

    element.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', endDrag)

    return () => {
      element.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', endDrag)
    }
  }, [controlMode, gl.domElement])

  useEffect(() => {
    const setKeyState = (key: string, pressed: boolean) => {
      if (key === 'w') {
        keyState.current.forward = pressed
      }

      if (key === 's') {
        keyState.current.backward = pressed
      }

      if (key === 'a') {
        keyState.current.left = pressed
      }

      if (key === 'd') {
        keyState.current.right = pressed
      }

      if (key === 'r') {
        keyState.current.up = pressed
      }

      if (key === 'f') {
        keyState.current.down = pressed
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      setKeyState(event.key.toLowerCase(), true)
    }

    const onKeyUp = (event: KeyboardEvent) => {
      setKeyState(event.key.toLowerCase(), false)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useFrame((_, delta) => {
    if (camera instanceof PerspectiveCamera) {
      camera.fov = 40
      camera.updateProjectionMatrix()
    }

    if (controlMode === 'fly' && turnDirection !== 0) {
      yawRef.current += turnDirection * delta * 1.5
    }

    if (controlMode === 'fly') {
      euler.set(pitchRef.current, yawRef.current, rollDirection * 0.55)
      camera.quaternion.setFromEuler(euler)

      movementVector.set(0, 0, 0)

      if (keyState.current.forward) {
        movementVector.z += 1
      }

      if (keyState.current.backward) {
        movementVector.z -= 1
      }

      if (keyState.current.right) {
        movementVector.x -= 1
      }

      if (keyState.current.left) {
        movementVector.x += 1
      }

      if (keyState.current.up) {
        movementVector.y += 1
      }

      if (keyState.current.down) {
        movementVector.y -= 1
      }

      if (movementVector.lengthSq() > 0) {
        const moveSpeed = 80 * delta
        movementVector.normalize()

        camera.getWorldDirection(lookDirection)
        lookDirection.y = 0
        if (lookDirection.lengthSq() > 0) {
          lookDirection.normalize()
        }

        strafeVector.crossVectors(lookDirection, verticalVector).normalize().negate()

        camera.position.addScaledVector(lookDirection, movementVector.z * moveSpeed)
        camera.position.addScaledVector(strafeVector, movementVector.x * moveSpeed)
        camera.position.addScaledVector(verticalVector, movementVector.y * moveSpeed)
      }
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
  const [rollDirection, setRollDirection] = useState(0)
  const turnState = useRef({ left: false, right: false })
  const rollState = useRef({ left: false, right: false })
  const [snapshot, setSnapshot] = useState<CameraSnapshot>({
    position: initialDebugPosition,
    lookAt: initialDebugLookAt,
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

    const syncRollDirection = () => {
      const nextDirection = rollState.current.left === rollState.current.right
        ? 0
        : rollState.current.left
          ? 1
          : -1

      setRollDirection(nextDirection)
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

      if (key === 'z') {
        rollState.current.left = true
        syncRollDirection()
      }

      if (key === 'c') {
        rollState.current.right = true
        syncRollDirection()
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

      if (key === 'z') {
        rollState.current.left = false
        syncRollDirection()
      }

      if (key === 'c') {
        rollState.current.right = false
        syncRollDirection()
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
          camera={{ position: initialDebugPosition, fov: 40, near: 0.1, far: 3000 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <DebugEnvironment />
            <DebugCameraProbe
              focusDistance={focusDistance}
              controlMode={controlMode}
              turnDirection={turnDirection}
              rollDirection={rollDirection}
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
              <></>
            ) : (
              <OrbitControls makeDefault enablePan enableZoom enableRotate target={initialDebugLookAt} />
            )}
          </Suspense>
        </Canvas>
      </div>

      <aside className="debug-hud">
        <p className="debug-kicker">SSC Atlas Debug Explorer</p>
        <h1>Camera Inspector</h1>
        <p className="debug-copy">
          Fly: drag to look, move with WASD/R/F, turn with Q/E, bank with Z/C. Press M to switch mode. FOV is locked to 40.
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
import { Html, Line, PerspectiveCamera, Stars, useGLTF, useProgress } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import type { BuildingPoint, CinematicTimeline } from "../types";
import { sampleKeyframes, smoothStep } from "../utils/interpolate";

interface CampusSceneProps {
  timeline: CinematicTimeline;
  buildings: BuildingPoint[];
  progress: number;
  modelPath?: string;
}

const MATERIAL_COLORS: Record<BuildingPoint["material"], string> = {
  stone: "#a69a89",
  brick: "#8f604b",
  concrete: "#84888f",
  glass: "#8fb4c8",
  wood: "#806347",
};

class ModelErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode; onError?: (error: unknown) => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Model load failed. Falling back to procedural geometry.", error);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function ModelLoadingOverlay({ visible, message }: { visible: boolean; message: string }) {
  const { progress, active } = useProgress();

  if (!visible) {
    return null;
  }

  const text = active ? `Loading model ${Math.round(progress)}%` : message;

  return (
    <Html fullscreen>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            minWidth: 190,
            padding: "0.65rem 0.9rem",
            borderRadius: 10,
            background: "rgba(12, 14, 18, 0.66)",
            border: "1px solid rgba(255, 217, 166, 0.35)",
            color: "#ffe5bf",
            fontSize: "0.92rem",
            fontWeight: 600,
            letterSpacing: "0.04em",
            textAlign: "center",
          }}
        >
          {text}
        </div>
      </div>
    </Html>
  );
}

function ModelErrorOverlay({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <Html fullscreen>
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 22,
          transform: "translateX(-50%)",
          maxWidth: "min(90vw, 680px)",
          padding: "0.6rem 0.85rem",
          borderRadius: 10,
          background: "rgba(56, 20, 20, 0.86)",
          border: "1px solid rgba(255, 170, 170, 0.48)",
          color: "#ffd6d6",
          fontSize: "0.82rem",
          lineHeight: 1.35,
          letterSpacing: "0.015em",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        {message}
      </div>
    </Html>
  );
}

type ModelCheckStatus = "idle" | "ready" | "invalid";

function isCrossOriginModelPath(modelPath: string): boolean {
  try {
    const resolved = new URL(modelPath, window.location.href);
    return resolved.origin !== window.location.origin;
  } catch {
    return false;
  }
}

async function validateModelHeader(modelPath: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(modelPath, {
      headers: {
        Range: "bytes=0-255",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { ok: false, reason: `HTTP ${response.status} while fetching model.` };
    }

    const data = await response.arrayBuffer();
    const bytes = new Uint8Array(data);

    if (bytes.length < 4) {
      return { ok: false, reason: "Model file is unexpectedly small." };
    }

    const headerText = new TextDecoder().decode(bytes.subarray(0, Math.min(160, bytes.length))).trim();

    if (headerText.startsWith("version https://git-lfs.github.com/spec/v1")) {
      return {
        ok: false,
        reason: "Deployed file looks like a Git LFS pointer, not a real .glb binary.",
      };
    }

    const isBinaryGlb =
      bytes[0] === 0x67 && // g
      bytes[1] === 0x6c && // l
      bytes[2] === 0x54 && // T
      bytes[3] === 0x46; // F

    if (!isBinaryGlb) {
      return {
        ok: false,
        reason: "File header is not glTF binary. Verify the uploaded file is a valid .glb.",
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason:
        error instanceof Error
          ? `Unable to fetch model file: ${error.message}. Check that the URL is public and allows CORS from this site.`
          : "Unable to fetch model file.",
    };
  }
}

function DirectedCamera({ timeline, progress }: Pick<CampusSceneProps, "timeline" | "progress">) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame(() => {
    if (!cameraRef.current) {
      return;
    }

    const sample = sampleKeyframes(timeline.keyframes, progress);

    cameraRef.current.position.set(
      sample.position[0],
      sample.position[1],
      sample.position[2],
    );
    cameraRef.current.fov = sample.fov;
    cameraRef.current.lookAt(sample.target[0], sample.target[1], sample.target[2]);
    cameraRef.current.updateProjectionMatrix();
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 320, 520]}
      fov={40}
      near={0.1}
      far={1800}
    />
  );
}

function SwayingTrees() {
  const treeGroup = useRef<THREE.Group>(null);
  const trees = useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => ({
        key: index,
        x: Math.sin(index * 2.4) * 170,
        z: Math.cos(index * 1.7) * 170,
        height: 5 + (index % 4),
        scale: 0.9 + (index % 3) * 0.1,
      })),
    [],
  );

  useFrame(({ clock }) => {
    if (!treeGroup.current) {
      return;
    }

    treeGroup.current.children.forEach((tree, index) => {
      tree.rotation.z = Math.sin(clock.elapsedTime * 0.6 + index * 0.7) * 0.03;
      tree.rotation.x = Math.cos(clock.elapsedTime * 0.45 + index) * 0.02;
    });
  });

  return (
    <group ref={treeGroup}>
      {trees.map((tree) => (
        <group key={tree.key} position={[tree.x, 0, tree.z]}>
          <mesh castShadow position={[0, tree.height * 0.4, 0]}>
            <cylinderGeometry args={[0.5, 0.7, tree.height, 6]} />
            <meshStandardMaterial color="#5f4a3a" roughness={0.95} />
          </mesh>
          <mesh castShadow position={[0, tree.height + 2.5, 0]} scale={tree.scale}>
            <sphereGeometry args={[2.7, 10, 10]} />
            <meshStandardMaterial color="#3f5a3f" roughness={0.9} metalness={0.02} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function BoundaryLine({ progress }: { progress: number }) {
  const opacityIn = smoothStep(0.08, 0.11, progress);
  const opacityOut = 1 - smoothStep(0.16, 0.2, progress);
  const opacity = Math.max(0, Math.min(1, opacityIn * opacityOut));

  const points = useMemo(
    () => [
      [-120, 0.4, -90],
      [-165, 0.4, -20],
      [-150, 0.4, 90],
      [-50, 0.4, 130],
      [90, 0.4, 140],
      [165, 0.4, 45],
      [135, 0.4, -80],
      [20, 0.4, -125],
      [-120, 0.4, -90],
    ] satisfies [number, number, number][],
    [],
  );

  return (
    <group>
      <Line points={points} color="#ffd9a0" lineWidth={2.5} transparent opacity={opacity} />
      <Line points={points} color="#ffb454" lineWidth={5.5} transparent opacity={opacity * 0.2} />
    </group>
  );
}

function CampusGeometry({
  buildings,
  opacity,
}: Pick<CampusSceneProps, "buildings"> & { opacity: number }) {
  return (
    <group>
      <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -0.1, 0]}>
        <planeGeometry args={[560, 560, 32, 32]} />
        <meshStandardMaterial
          color="#6f7f64"
          roughness={0.95}
          metalness={0.02}
          transparent
          opacity={opacity}
        />
      </mesh>

      <mesh rotation-x={-Math.PI / 2} position={[0, -0.35, 0]}>
        <circleGeometry args={[900, 48]} />
        <meshStandardMaterial
          color="#7896aa"
          roughness={0.9}
          metalness={0.15}
          transparent
          opacity={opacity}
        />
      </mesh>

      {buildings.map((building) => (
        <mesh
          key={building.id}
          castShadow
          receiveShadow
          position={[building.position[0], building.position[1], building.position[2]]}
        >
          <boxGeometry args={building.size} />
          <meshStandardMaterial
            color={MATERIAL_COLORS[building.material]}
            roughness={building.material === "glass" ? 0.2 : 0.8}
            metalness={building.material === "glass" ? 0.4 : 0.05}
            transparent
            opacity={(building.material === "glass" ? 0.85 : 1) * opacity}
          />
        </mesh>
      ))}

      <SwayingTrees />
    </group>
  );
}

function CampusModel({ modelPath, opacity }: { modelPath: string; opacity: number }) {
  const gltf = useGLTF(modelPath);

  const { normalizedScene, scaleFactor } = useMemo(() => {
    const clonedScene = gltf.scene.clone(true);

    clonedScene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      child.castShadow = true;
      child.receiveShadow = true;

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        const withOpacity = material as THREE.Material & {
          opacity?: number;
          transparent?: boolean;
          userData: Record<string, unknown>;
        };
        if (typeof withOpacity.userData.baseOpacity !== "number") {
          withOpacity.userData.baseOpacity =
            typeof withOpacity.opacity === "number" ? withOpacity.opacity : 1;
        }
      });
    });

    const bounds = new THREE.Box3().setFromObject(clonedScene);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    bounds.getCenter(center);
    bounds.getSize(size);

    const targetFootprint = 320;
    const maxFootprint = Math.max(size.x, size.z, 1);
    const computedScale = targetFootprint / maxFootprint;

    clonedScene.position.set(-center.x, -bounds.min.y, -center.z);

    return {
      normalizedScene: clonedScene,
      scaleFactor: computedScale,
    };
  }, [gltf.scene]);

  useEffect(() => {
    normalizedScene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        const withOpacity = material as THREE.Material & {
          opacity?: number;
          transparent?: boolean;
          userData: Record<string, unknown>;
        };
        const baseOpacity =
          typeof withOpacity.userData.baseOpacity === "number"
            ? withOpacity.userData.baseOpacity
            : 1;
        withOpacity.opacity = baseOpacity * opacity;
        withOpacity.transparent = withOpacity.opacity < 1;
      });
    });
  }, [normalizedScene, opacity]);

  return (
    <group scale={[scaleFactor, scaleFactor, scaleFactor]}>
      <primitive object={normalizedScene} />
    </group>
  );
}

function SceneContent({ timeline, buildings, progress, modelPath }: CampusSceneProps) {
  const hazeColor = new THREE.Color("#f2d8af");
  const campusOpacity = smoothStep(0.07, 0.18, progress);
  const hasModelPath = typeof modelPath === "string" && modelPath.length > 0;
  const [modelFailed, setModelFailed] = useState(false);
  const [modelCheckStatus, setModelCheckStatus] = useState<ModelCheckStatus>("idle");
  const [modelErrorMessage, setModelErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setModelFailed(false);
    setModelErrorMessage(null);

    if (!hasModelPath || !modelPath) {
      setModelCheckStatus("idle");
      return;
    }

    // Never block model loading on validation. Start loading immediately.
    setModelCheckStatus("ready");

    let isCancelled = false;

    if (isCrossOriginModelPath(modelPath)) {
      return;
    }

    void validateModelHeader(modelPath).then((result) => {
      if (isCancelled) {
        return;
      }

      if (result.ok) {
        setModelCheckStatus("ready");
        return;
      }

      setModelCheckStatus("invalid");
      setModelErrorMessage(result.reason);
    });

    return () => {
      isCancelled = true;
    };
  }, [modelPath]);

  const shouldLoadModel = hasModelPath && modelCheckStatus !== "invalid" && !modelFailed;
  const showLoadingOverlay = hasModelPath && !modelFailed && modelCheckStatus !== "invalid";
  const loadingMessage = "Preparing model...";

  return (
    <>
      <fog attach="fog" args={[hazeColor, 120, 920]} />
      <color attach="background" args={["#e7c89e"]} />

      <ambientLight intensity={0.5} color="#ffe6c4" />
      <directionalLight
        castShadow
        intensity={2.1}
        color="#ffd7a3"
        position={[180, 260, 130]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <Stars radius={800} depth={80} count={900} factor={1.8} saturation={0} fade speed={0.1} />

      <group
        position={[0, (1 - campusOpacity) * 6, 0]}
        scale={[
          0.98 + campusOpacity * 0.02,
          0.95 + campusOpacity * 0.05,
          0.98 + campusOpacity * 0.02,
        ]}
      >
        {shouldLoadModel ? (
          <ModelErrorBoundary
            key={modelPath}
            fallback={null}
            onError={(error) => {
              setModelFailed(true);
              setModelErrorMessage(
                error instanceof Error
                  ? `Model parse failed: ${error.message}`
                  : "Model parse failed. Falling back to procedural geometry.",
              );
            }}
          >
            <Suspense fallback={null}>
              <CampusModel modelPath={modelPath} opacity={campusOpacity} />
            </Suspense>
          </ModelErrorBoundary>
        ) : (
          <CampusGeometry buildings={buildings} opacity={campusOpacity} />
        )}
      </group>

      <ModelLoadingOverlay visible={showLoadingOverlay} message={loadingMessage} />
      <ModelErrorOverlay message={modelErrorMessage} />
      <BoundaryLine progress={progress} />
      <DirectedCamera timeline={timeline} progress={progress} />
    </>
  );
}

export function CampusScene({ timeline, buildings, progress, modelPath }: CampusSceneProps) {
  return (
    <Canvas
      shadows
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      dpr={[1, 1.75]}
    >
      <SceneContent
        timeline={timeline}
        buildings={buildings}
        progress={progress}
        modelPath={modelPath}
      />
    </Canvas>
  );
}

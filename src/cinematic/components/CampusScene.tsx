import { Line, PerspectiveCamera, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { BuildingPoint, CinematicTimeline } from "../types";
import { sampleKeyframes, smoothStep } from "../utils/interpolate";

interface CampusSceneProps {
  timeline: CinematicTimeline;
  buildings: BuildingPoint[];
  progress: number;
}

const MATERIAL_COLORS: Record<BuildingPoint["material"], string> = {
  stone: "#a69a89",
  brick: "#8f604b",
  concrete: "#84888f",
  glass: "#8fb4c8",
  wood: "#806347",
};

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

function CampusGeometry({ buildings }: Pick<CampusSceneProps, "buildings">) {
  return (
    <group>
      <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -0.1, 0]}>
        <planeGeometry args={[560, 560, 32, 32]} />
        <meshStandardMaterial color="#6f7f64" roughness={0.95} metalness={0.02} />
      </mesh>

      <mesh rotation-x={-Math.PI / 2} position={[0, -0.35, 0]}>
        <circleGeometry args={[900, 48]} />
        <meshStandardMaterial color="#7896aa" roughness={0.9} metalness={0.15} />
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
            transparent={building.material === "glass"}
            opacity={building.material === "glass" ? 0.85 : 1}
          />
        </mesh>
      ))}

      <SwayingTrees />
    </group>
  );
}

function SceneContent({ timeline, buildings, progress }: CampusSceneProps) {
  const hazeColor = new THREE.Color("#f2d8af");

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

      <CampusGeometry buildings={buildings} />
      <BoundaryLine progress={progress} />
      <DirectedCamera timeline={timeline} progress={progress} />
    </>
  );
}

export function CampusScene({ timeline, buildings, progress }: CampusSceneProps) {
  return (
    <Canvas
      shadows
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      dpr={[1, 1.75]}
    >
      <SceneContent timeline={timeline} buildings={buildings} progress={progress} />
    </Canvas>
  );
}

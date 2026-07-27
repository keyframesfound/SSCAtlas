import { useEffect, useMemo, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { Group } from 'three'
import type { BuildingDefinition, StatisticsContent } from '../types/content'

type CampusModelProps = {
  stats: StatisticsContent
  buildings: BuildingDefinition[]
  onModelReady: () => void
}

type ModelAssetProps = {
  modelUrl: string
  onReady: () => void
}

const ModelAsset = ({ modelUrl, onReady }: ModelAssetProps) => {
  const gltf = useGLTF(modelUrl)

  useEffect(() => {
    onReady()
  }, [onReady])

  return <primitive object={gltf.scene} />
}

const getFallbackAnchor = (index: number): [number, number, number] => {
  const angle = (index / 17) * Math.PI * 2
  const radius = 28 + (index % 5) * 9
  return [Math.cos(angle) * radius, 3 + (index % 3), Math.sin(angle) * radius]
}

const getBuildingAnchor = (building: BuildingDefinition, index: number): [number, number, number] => {
  return building.position ?? getFallbackAnchor(index)
}

const PlaceholderCampus = ({ buildings }: { buildings: BuildingDefinition[] }) => {
  return (
    <group name="SSC_Campus">
      <mesh rotation-x={-Math.PI / 2}>
        <circleGeometry args={[80, 64]} />
        <meshBasicMaterial color="#101418" />
      </mesh>

      {buildings.map((building, index) => {
        const [x, y, z] = getBuildingAnchor(building, index)

        return (
          <group key={building.id} name={building.id} position={[x, y, z]}>
            <mesh>
              <boxGeometry args={[6, 5.5, 6]} />
              <meshBasicMaterial color="#182032" />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

export const CampusModel = ({ stats, buildings, onModelReady }: CampusModelProps) => {
  const [modelState, setModelState] = useState<'checking' | 'available' | 'missing'>('checking')

  useEffect(() => {
    let active = true

    fetch(stats.model.url, { method: 'HEAD' })
      .then((response) => {
        if (active) {
          setModelState(response.ok ? 'available' : 'missing')
        }
      })
      .catch(() => {
        if (active) {
          setModelState('missing')
        }
      })

    return () => {
      active = false
    }
  }, [stats.model.url])

  useEffect(() => {
    if (modelState === 'missing') {
      onModelReady()
    }
  }, [modelState, onModelReady])

  const namedMarkers = useMemo(() => {
    const root = new Group()
    root.name = stats.model.objectRoot

    buildings.forEach((building, index) => {
      const anchor = getBuildingAnchor(building, index)
      const marker = new Group()
      marker.name = building.id
      marker.position.set(...anchor)
      root.add(marker)
    })

    return root
  }, [buildings, stats.model.objectRoot])

  return (
    <group>
      {modelState === 'available' ? (
        <ModelAsset modelUrl={stats.model.url} onReady={onModelReady} />
      ) : modelState === 'missing' ? (
        <PlaceholderCampus buildings={buildings} />
      ) : null}

      <primitive object={namedMarkers} visible={false} />

      {/* Force named anchors even with incomplete placeholder geometry. */}
      {buildings.map((building, index) => {
        const [x, y, z] = getBuildingAnchor(building, index)
        return <group key={`anchor-${building.id}`} name={building.id} position={[x, y, z]} visible={false} />
      })}
    </group>
  )
}

useGLTF.preload('/assets/models/ssc-campus.glb')

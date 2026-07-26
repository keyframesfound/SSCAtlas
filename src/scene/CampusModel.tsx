import { useEffect, useMemo, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { Group } from 'three'
import type { BuildingDefinition, StatisticsContent } from '../types/content'

type CampusModelProps = {
  stats: StatisticsContent
  buildings: BuildingDefinition[]
}

type ModelAssetProps = {
  modelUrl: string
}

const ModelAsset = ({ modelUrl }: ModelAssetProps) => {
  const gltf = useGLTF(modelUrl)
  return <primitive object={gltf.scene} />
}

const PlaceholderCampus = ({ buildings }: { buildings: BuildingDefinition[] }) => {
  return (
    <group name="SSC_Campus">
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[80, 64]} />
        <meshStandardMaterial color="#101418" roughness={0.95} metalness={0.05} />
      </mesh>

      {buildings.map((building) => {
        const [x, y, z] = building.position

        return (
          <group key={building.id} name={building.id} position={[x, y, z]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[6, 5.5, 6]} />
              <meshStandardMaterial color="#182032" roughness={0.72} metalness={0.18} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

export const CampusModel = ({ stats, buildings }: CampusModelProps) => {
  const [hasModel, setHasModel] = useState(false)

  useEffect(() => {
    let active = true

    fetch(stats.model.url, { method: 'HEAD' })
      .then((response) => {
        if (active) {
          setHasModel(response.ok)
        }
      })
      .catch(() => {
        if (active) {
          setHasModel(false)
        }
      })

    return () => {
      active = false
    }
  }, [stats.model.url])

  const namedMarkers = useMemo(() => {
    const root = new Group()
    root.name = stats.model.objectRoot

    buildings.forEach((building) => {
      const marker = new Group()
      marker.name = building.id
      marker.position.set(...building.position)
      root.add(marker)
    })

    return root
  }, [buildings, stats.model.objectRoot])

  return (
    <group>
      {hasModel ? <ModelAsset modelUrl={stats.model.url} /> : <PlaceholderCampus buildings={buildings} />}

      <primitive object={namedMarkers} visible={false} />

      {/* Force named anchors even with incomplete placeholder geometry. */}
      {buildings.map((building) => {
        const [x, y, z] = building.position
        return <group key={`anchor-${building.id}`} name={building.id} position={[x, y, z]} visible={false} />
      })}
    </group>
  )
}

useGLTF.preload('/assets/models/ssc-campus.glb')

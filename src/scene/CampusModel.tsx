import { useEffect, useMemo, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { Group, Mesh, MeshBasicMaterial } from 'three'
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

const VEGETATION_MODEL_URL = '/assets/models/vegetation.glb'

const ModelAsset = ({ modelUrl, onReady }: ModelAssetProps) => {
  const gltf = useGLTF(modelUrl)

  useEffect(() => {
    onReady()
  }, [onReady])

  useEffect(() => {
    gltf.scene.traverse((object) => {
      if (!(object instanceof Mesh)) return

      const sourceMaterial = object.material as any
      const materials = Array.isArray(sourceMaterial) ? sourceMaterial : [sourceMaterial]
      const nextMaterials = materials.map((material: any) => {
        const nextMaterial = new MeshBasicMaterial({
          color: '#f5f7fb',
          transparent: false,
          opacity: 1,
        })

        if (material?.color) {
          nextMaterial.color.copy(material.color)
        }

        if (material?.map) {
          nextMaterial.map = material.map
        }

        if (material?.alphaMap) {
          nextMaterial.alphaMap = material.alphaMap
        }

        nextMaterial.side = material?.side ?? nextMaterial.side
        return nextMaterial
      })

      object.material = Array.isArray(sourceMaterial) ? nextMaterials : nextMaterials[0]
    })
  }, [gltf.scene])

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

const OptionalVegetation = ({ modelUrl }: { modelUrl: string }) => {
  const gltf = useGLTF(modelUrl)
  return <primitive object={gltf.scene} />
}

const PlaceholderCampus = ({ buildings }: { buildings: BuildingDefinition[] }) => {
  return (
    <group name="SSC_Campus">
      <mesh rotation-x={-Math.PI / 2}>
        <circleGeometry args={[80, 64]} />
        <meshBasicMaterial color="#f4f6f9" />
      </mesh>

      {buildings.map((building, index) => {
        const [x, y, z] = getBuildingAnchor(building, index)

        return (
          <group key={building.id} name={building.id} position={[x, y, z]}>
            <mesh>
              <boxGeometry args={[6, 5.5, 6]} />
              <meshBasicMaterial color="#dfe5ef" />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

export const CampusModel = ({ stats, buildings, onModelReady }: CampusModelProps) => {
  const [modelState, setModelState] = useState<'checking' | 'available' | 'missing'>('checking')
  const [vegetationState, setVegetationState] = useState<'checking' | 'available' | 'missing'>('checking')

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
    let active = true

    fetch(VEGETATION_MODEL_URL, { method: 'HEAD' })
      .then((response) => {
        if (active) {
          setVegetationState(response.ok ? 'available' : 'missing')
        }
      })
      .catch(() => {
        if (active) {
          setVegetationState('missing')
        }
      })

    return () => {
      active = false
    }
  }, [])

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

      {vegetationState === 'available' ? <OptionalVegetation modelUrl={VEGETATION_MODEL_URL} /> : null}

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

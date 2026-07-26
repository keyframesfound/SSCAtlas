import type {
  AtlasContent,
  BuildingDefinition,
  CameraPathMap,
  HeritageProfile,
  StatisticsContent,
  TimelineContent,
} from '../types/content'

const readJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(path)

  if (!response.ok) {
    throw new Error(`Failed to load content file: ${path}`)
  }

  return (await response.json()) as T
}

export const loadAtlasContent = async (): Promise<AtlasContent> => {
  const [buildings, cameraPaths, timeline, statistics, heritageProfiles] = await Promise.all([
    readJson<BuildingDefinition[]>('/assets/content/buildings.json'),
    readJson<CameraPathMap>('/assets/content/cameraPaths.json'),
    readJson<TimelineContent>('/assets/content/timeline.json'),
    readJson<StatisticsContent>('/assets/content/statistics.json'),
    readJson<HeritageProfile[]>('/assets/content/heritageProfiles.json'),
  ])

  return {
    buildings,
    cameraPaths,
    timeline,
    statistics,
    heritageProfiles,
  }
}

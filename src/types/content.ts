export type Vec3Tuple = [number, number, number]

export type BuildingDefinition = {
  id: string
  name: string
  chapter: string
  description: string
  position?: Vec3Tuple
}

export type CameraKeyframe = {
  t: number
  position: Vec3Tuple
  lookAt: Vec3Tuple
  fov: number
}

export type CameraPathMap = Record<string, CameraKeyframe[]>

export type ChapterKind = 'opening' | 'reveal' | 'chapter' | 'finale'

export type TimelineChapter = {
  id: string
  kind: ChapterKind
  start: number
  end: number
  headline: string
  title: string
  description: string
  cameraPathId: string
  focusBuildingIds?: string[]
}

export type TimelineContent = {
  openingPrompt: string
  chapters: TimelineChapter[]
}

export type StatisticsContent = {
  campusAcreage: string
  tagline: string
  subline: string
  finalTitle: string
  finalSubtitle: string
  boundaryPoints: Vec3Tuple[]
  model: {
    url: string
    objectRoot: string
    replaceInstructions: string
  }
}

export type HeritageProfile = {
  id: string
  name: string
  year: string
  grade: string
  narrative: string
}

export type AtlasContent = {
  buildings: BuildingDefinition[]
  cameraPaths: CameraPathMap
  timeline: TimelineContent
  statistics: StatisticsContent
  heritageProfiles: HeritageProfile[]
}

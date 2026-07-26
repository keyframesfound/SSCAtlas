export type Vec3 = [number, number, number];

export interface SceneChapter {
  id: string;
  label: string;
  title: string;
  intro: string;
  description: string;
  detailBullets: string[];
  image: string;
  model: string;
  cadence: "slow" | "medium" | "fast" | "static";
  progressStart: number;
  progressEnd: number;
}

export interface BuildingPoint {
  id: string;
  chapterId: string;
  name: string;
  position: Vec3;
  size: Vec3;
  material: "stone" | "brick" | "concrete" | "glass" | "wood";
}

export interface CameraKeyframe {
  progress: number;
  position: Vec3;
  target: Vec3;
  fov: number;
}

export interface CinematicTimeline {
  scrollLengthVh: number;
  keyframes: CameraKeyframe[];
}

export interface CampusStatistics {
  acres: number;
  statement: string;
  heritageLine: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaLabel: string;
  ctaHref: string;
  crest: string;
}

export interface CinematicContent {
  scenes: SceneChapter[];
  buildings: BuildingPoint[];
  timeline: CinematicTimeline;
  statistics: CampusStatistics;
}

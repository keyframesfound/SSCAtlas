import gsap from "gsap";
import Lenis from "lenis";
import { useEffect, useState } from "react";
import type { CinematicContent } from "../types";
import { CampusScene } from "./CampusScene";
import { ChapterOverlay } from "./ChapterOverlay";
import { LoadingScreen } from "./LoadingScreen";

const CAMPUS_MODEL_PATH = "/assets/models/campus.glb";
const CAMPUS_MODEL_PROXY_PATH = "/api/campus-model";

function resolveModelPath(path: string): string {
  if (path !== CAMPUS_MODEL_PATH) {
    return path;
  }

  if (import.meta.env.PROD) {
    return CAMPUS_MODEL_PROXY_PATH;
  }

  const externalCampusModelUrl = import.meta.env.VITE_CAMPUS_MODEL_URL;
  if (typeof externalCampusModelUrl === "string" && externalCampusModelUrl.length > 0) {
    return externalCampusModelUrl;
  }

  return path;
}

async function loadCinematicContent(): Promise<CinematicContent> {
  const [scenes, buildings, timeline, statistics] = await Promise.all([
    fetch("/assets/content/scenes.json").then((response) => response.json()),
    fetch("/assets/content/buildings.json").then((response) => response.json()),
    fetch("/assets/content/timeline.json").then((response) => response.json()),
    fetch("/assets/content/statistics.json").then((response) => response.json()),
  ]);

  return {
    scenes,
    buildings,
    timeline,
    statistics,
  };
}

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export function CinematicExperience() {
  const [content, setContent] = useState<CinematicContent | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;

    loadCinematicContent()
      .then((result) => {
        if (isMounted) {
          setContent(result);
        }
      })
      .catch((error) => {
        console.error("Unable to load cinematic content", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.11,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.15,
      smoothWheel: true,
      syncTouch: true,
    });

    const animatedProgress = { value: 0 };

    const updateProgress = () => {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );

      const targetProgress = clamp(window.scrollY / maxScroll);

      gsap.to(animatedProgress, {
        value: targetProgress,
        duration: 0.72,
        ease: "power2.out",
        overwrite: true,
        onUpdate: () => {
          setProgress(animatedProgress.value);
        },
      });
    };

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    return () => {
      lenis.destroy();
      window.removeEventListener("scroll", updateProgress);
    };
  }, []);

  const activeScene = !content?.scenes.length
    ? null
    : (content.scenes.find(
        (scene) => progress >= scene.progressStart && progress <= scene.progressEnd,
      ) ?? content.scenes[content.scenes.length - 1]);

  if (!content || !activeScene) {
    return <LoadingScreen />;
  }

  const activeSceneIndex = Math.max(
    0,
    content.scenes.findIndex((scene) => scene.id === activeScene.id),
  );
  const activeModelPath = resolveModelPath(activeScene.model);

  return (
    <div className="cinematic-root">
      <div className="canvas-layer">
        <CampusScene
          timeline={content.timeline}
          buildings={content.buildings}
          progress={progress}
          modelPath={activeModelPath}
        />
      </div>

      <div
        className="scroll-track"
        style={{ height: `${content.timeline.scrollLengthVh}vh` }}
      />

      <ChapterOverlay
        scene={activeScene}
        sceneIndex={activeSceneIndex}
        sceneCount={content.scenes.length}
        statistics={content.statistics}
        progress={progress}
      />
    </div>
  );
}

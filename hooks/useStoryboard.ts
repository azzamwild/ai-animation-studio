"use client";

import { useEffect, useState } from "react";
import type { StoryboardScene } from "@/types/storyboard";

export function useStoryboard(projectId: number, storyId: number) {
  const storageKey = `ai-animation-storyboard-${projectId}-${storyId}`;

  const [scenes, setScenes] = useState<StoryboardScene[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        setScenes(JSON.parse(saved));
      } catch {
        setScenes([]);
      }
    }

    setLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(storageKey, JSON.stringify(scenes));
  }, [scenes, loaded, storageKey]);

  function saveStoryboard(newScenes: StoryboardScene[]) {
    setScenes(newScenes);
  }

  function updateScene(
    sceneId: number,
    data: Partial<StoryboardScene>
  ) {
    setScenes((prev) =>
      prev.map((scene) =>
        scene.id === sceneId
          ? {
              ...scene,
              ...data,
            }
          : scene
      )
    );
  }

  function clearStoryboard() {
    setScenes([]);
  }

  return {
    scenes,
    loaded,
    saveStoryboard,
    updateScene,
    clearStoryboard,
  };
}
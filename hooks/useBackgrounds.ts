"use client";

import { useEffect, useState } from "react";
import type { AnimationBackground } from "@/types/background";

export function useBackgrounds(projectId: number) {
  const storageKey = `ai-animation-backgrounds-${projectId}`;

  const [backgrounds, setBackgrounds] = useState<AnimationBackground[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        setBackgrounds(JSON.parse(saved));
      } catch {
        setBackgrounds([]);
      }
    }

    setLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(storageKey, JSON.stringify(backgrounds));
  }, [backgrounds, loaded, storageKey]);

  function createBackground(data: {
    name: string;
    locationType: string;
    description: string;
    prompt: string;
    imageUrl?: string;
  }) {
    const newBackground: AnimationBackground = {
      id: Date.now(),
      projectId,
      name: data.name,
      locationType: data.locationType,
      description: data.description,
      prompt: data.prompt,
      imageUrl: data.imageUrl,
      createdAt: new Date().toISOString(),
    };

    setBackgrounds((prev) => [newBackground, ...prev]);
  }

  function deleteBackground(id: number) {
    setBackgrounds((prev) =>
      prev.filter((background) => background.id !== id)
    );
  }

  return {
    backgrounds,
    loaded,
    createBackground,
    deleteBackground,
  };
}
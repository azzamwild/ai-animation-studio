"use client";

import { useEffect, useState } from "react";
import type { AnimationProp } from "@/types/prop";

export function useProps(projectId: number) {
  const storageKey = `ai-animation-props-${projectId}`;

  const [props, setProps] = useState<AnimationProp[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        setProps(JSON.parse(saved));
      } catch {
        setProps([]);
      }
    }

    setLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(storageKey, JSON.stringify(props));
  }, [props, loaded, storageKey]);

  function createProp(data: {
    name: string;
    category: string;
    description: string;
    prompt: string;
    imageUrl?: string;
  }) {
    const newProp: AnimationProp = {
      id: Date.now(),
      projectId,
      name: data.name,
      category: data.category,
      description: data.description,
      prompt: data.prompt,
      imageUrl: data.imageUrl,
      createdAt: new Date().toISOString(),
    };

    setProps((prev) => [newProp, ...prev]);
  }

  function deleteProp(id: number) {
    setProps((prev) => prev.filter((prop) => prop.id !== id));
  }

  return {
    props,
    loaded,
    createProp,
    deleteProp,
  };
}